import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetAppUsersGateway } from "../../core/gateways/iGetAppUsersGateway";
import { IAppUser } from "../../core/entities/iAppUser";
import { formatDate } from "date-fns";

export const HttpGetAppUserGateway = (
  httpClient: IHttpClient
): IGetAppUsersGateway => {
  const toAppUsers = (response: any): IAppUser[] => {
    return response.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      subscription: user.subscription || 'none',
      subscriptionPlan: user.subscriptionPlan,
      subscriptionEndDate: user.subscriptionEndDate,
      status: user.status || 'active',
      createdAt: formatDate(user.createdAt, "dd/MM/yyyy HH:mm"),
      updatedAt: user.updatedAt ? formatDate(user.updatedAt, "dd/MM/yyyy HH:mm") : undefined,
    }));
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

