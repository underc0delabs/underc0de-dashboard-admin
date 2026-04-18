import { format } from "date-fns";
import {
  IAppUser,
  SubscriptionStatus,
} from "../core/entities/iAppUser";

type PlanRow = {
  status?: string;
  mpPreapprovalId?: string;
  createdAt?: string | Date;
  nextPaymentDate?: string | Date | null;
};

const statusUpper = (s: string | undefined) => String(s ?? "").toUpperCase();

const sortPlansLatestFirst = (plans: PlanRow[]): PlanRow[] =>
  [...plans].sort((a, b) => {
    const ta = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta;
});

const deriveSubscriptionFromPlans = (
  plans: PlanRow[] | undefined
): {
  subscription: SubscriptionStatus;
  subscriptionPlan?: string;
  subscriptionEndDate?: string;
} => {
  if (!plans?.length) {
    return { subscription: "none" };
  }
  const ordered = sortPlansLatestFirst(plans);

  const active = ordered.find((p) => statusUpper(p.status) === "ACTIVE");
  if (active) {
    const next = active.nextPaymentDate;
    return {
      subscription: "active",
      subscriptionPlan: active.mpPreapprovalId || undefined,
      subscriptionEndDate: next
        ? format(new Date(next), "dd/MM/yyyy HH:mm")
        : undefined,
    };
  }

  const pending = ordered.find((p) => statusUpper(p.status) === "PENDING");
  if (pending) {
    return {
      subscription: "pending",
      subscriptionPlan: pending.mpPreapprovalId || undefined,
    };
  }

  const failed = ordered.find((p) => statusUpper(p.status) === "PAYMENT_FAILED");
  if (failed) {
    return {
      subscription: "payment_failed",
      subscriptionPlan: failed.mpPreapprovalId || undefined,
    };
  }

  const expired = ordered.find((p) => statusUpper(p.status) === "EXPIRED");
  if (expired) {
    return {
      subscription: "expired",
      subscriptionPlan: expired.mpPreapprovalId || undefined,
    };
  }

  const cancelled = ordered.find((p) => statusUpper(p.status) === "CANCELLED");
  if (cancelled) {
    return {
      subscription: "cancelled",
      subscriptionPlan: cancelled.mpPreapprovalId || undefined,
    };
  }

  return { subscription: "none" };
};

const parseLegacySubscriptionField = (
  sub: { status?: string } | string | null | undefined
): SubscriptionStatus | null => {
  if (!sub) return null;
  const subscriptionStatus =
    typeof sub === "object" && sub?.status
      ? String(sub.status).toLowerCase()
      : String(sub).toLowerCase();
  if (subscriptionStatus === "active") return "active";
  if (subscriptionStatus === "expired") return "expired";
  if (subscriptionStatus === "cancelled") return "cancelled";
  if (subscriptionStatus === "trial") return "trial";
  if (subscriptionStatus === "pending") return "pending";
  if (
    subscriptionStatus === "payment_failed" ||
    subscriptionStatus === "payment failed"
  )
    return "payment_failed";
  return null;
};

/** Mapea un usuario tal como lo devuelve GET /users o GET /users/:id hacia IAppUser. */
export const mapApiUserToAppUser = (user: Record<string, unknown>): IAppUser => {
  const plans = user.subscriptionPlans as PlanRow[] | undefined;

  let subscription: SubscriptionStatus;
  let subscriptionPlan: string | undefined;
  let subscriptionEndDate: string | undefined;

  if (plans?.length) {
    const d = deriveSubscriptionFromPlans(plans);
    subscription = d.subscription;
    subscriptionPlan = d.subscriptionPlan;
    subscriptionEndDate = d.subscriptionEndDate;
  } else {
    const sub = user.subscription as { status?: string; nextPaymentDate?: string } | string | null | undefined;
    const parsed = parseLegacySubscriptionField(sub);
    subscription = parsed ?? "none";
    if (
      typeof sub === "object" &&
      sub &&
      "nextPaymentDate" in sub &&
      sub.nextPaymentDate
    ) {
      subscriptionEndDate = format(
        new Date(sub.nextPaymentDate as string),
        "dd/MM/yyyy HH:mm"
      );
    }
  }

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
