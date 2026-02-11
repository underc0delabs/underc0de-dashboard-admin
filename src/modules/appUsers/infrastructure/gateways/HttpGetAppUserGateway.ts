import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetAppUsersGateway } from "../../core/gateways/iGetAppUsersGateway";
import { IAppUser } from "../../core/entities/iAppUser";
import { format } from "date-fns";

export const HttpGetAppUserGateway = (
  httpClient: IHttpClient
): IGetAppUsersGateway => {
  const toAppUsers = (response: any): IAppUser[] => {
    return response.map((user: any) => {
      let subscription: 'active' | 'trial' | 'expired' | 'cancelled' | 'none' = 'none';
      if (user.subscription) {
        const subscriptionStatus = user.subscription.status?.toLowerCase();
        if (subscriptionStatus === 'active') {
          subscription = 'active';
        } else if (subscriptionStatus === 'expired') {
          subscription = 'expired';
        } else if (subscriptionStatus === 'cancelled') {
          subscription = 'cancelled';
        } else if (subscriptionStatus === 'trial') {
          subscription = 'trial';
        }
      }

      const activePlan = user.subscriptionPlans?.find(
        (plan: any) => plan.status === 'ACTIVE'
      );
      const subscriptionPlan = activePlan?.mpPreapprovalId || undefined;
      const subscriptionEndDate = user.subscription?.nextPaymentDate
        ? format(new Date(user.subscription.nextPaymentDate), "dd/MM/yyyy HH:mm")
        : undefined;

      return {
        id: String(user.id),
        email: user.email,
        name: user.name,
        phone: user.phone,
        subscription,
        subscriptionPlan,
        subscriptionEndDate,
        status: user.status ?? true,
        createdAt: format(new Date(user.createdAt), "dd/MM/yyyy HH:mm"),
        updatedAt: user.updatedAt ? format(new Date(user.updatedAt), "dd/MM/yyyy HH:mm") : undefined,
      };
    });
  };
  return {
    getAppUsers: async () => {
      try {
        const response = await httpClient.get("/users");
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toAppUsers(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

