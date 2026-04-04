import { format } from "date-fns";
import {
  IAppUser,
  SubscriptionStatus,
} from "../core/entities/iAppUser";

/** Mapea un usuario tal como lo devuelve GET /users o GET /users/:id hacia IAppUser. */
export const mapApiUserToAppUser = (user: Record<string, unknown>): IAppUser => {
  let subscription: SubscriptionStatus = "none";
  const sub = user.subscription as { status?: string } | string | null | undefined;
  if (sub) {
    const subscriptionStatus =
      typeof sub === "object" && sub?.status
        ? String(sub.status).toLowerCase()
        : String(sub).toLowerCase();
    if (subscriptionStatus === "active") subscription = "active";
    else if (subscriptionStatus === "expired") subscription = "expired";
    else if (subscriptionStatus === "cancelled") subscription = "cancelled";
    else if (subscriptionStatus === "trial") subscription = "trial";
  }

  const plans = user.subscriptionPlans as
    | { status?: string; mpPreapprovalId?: string }[]
    | undefined;
  const activePlan = plans?.find((plan) => plan.status === "ACTIVE");
  const subscriptionPlan = activePlan?.mpPreapprovalId || undefined;
  const nextPayment =
    typeof sub === "object" && sub && "nextPaymentDate" in sub
      ? (sub as { nextPaymentDate?: string }).nextPaymentDate
      : undefined;
  const subscriptionEndDate = nextPayment
    ? format(new Date(nextPayment), "dd/MM/yyyy HH:mm")
    : undefined;

  const name = String(user.name ?? "");
  const lastname = user.lastname != null ? String(user.lastname) : undefined;
  const fullNameRaw = user.fullName != null ? String(user.fullName) : undefined;

  return {
    id: user.id != null ? String(user.id) : undefined,
    email: String(user.email ?? ""),
    mercadopago_email:
      user.mercadopago_email != null
        ? String(user.mercadopago_email)
        : undefined,
    name,
    fullName:
      fullNameRaw ||
      [name, lastname].filter(Boolean).join(" ").trim() ||
      name,
    lastname,
    username: user.username != null ? String(user.username) : undefined,
    phone: user.phone != null ? String(user.phone) : undefined,
    forumUserId:
      user.forumUserId != null && String(user.forumUserId).length > 0
        ? String(user.forumUserId)
        : undefined,
    forumEmail:
      user.forumEmail != null && String(user.forumEmail).length > 0
        ? String(user.forumEmail)
        : undefined,
    mercadopagoCustomerId:
      user.mercadopagoCustomerId != null
        ? String(user.mercadopagoCustomerId)
        : undefined,
    mercadopagoExternalReference:
      user.mercadopagoExternalReference != null
        ? String(user.mercadopagoExternalReference)
        : undefined,
    subscription,
    subscriptionPlan,
    subscriptionEndDate,
    status: Boolean(user.status ?? true),
    createdAt: user.createdAt
      ? format(new Date(user.createdAt as string | Date), "dd/MM/yyyy HH:mm")
      : "",
    updatedAt: user.updatedAt
      ? format(new Date(user.updatedAt as string | Date), "dd/MM/yyyy HH:mm")
      : undefined,
  };
};
