import { IAppUser } from "../../core/entities/iAppUser";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { ICreateAppUserGateway } from "../../core/gateways/iCreateAppUserGateway";
import { format } from "date-fns";

export const HttpCreateAppUserGateway = (
  httpClient: IHttpClient
): ICreateAppUserGateway => {
  const toAppUser = (response: any): IAppUser => {
    return {
      id: response.id,
      email: response.email,
      name: response.name,
      phone: response.phone,
      subscription: response.subscription || 'none',
      subscriptionPlan: response.subscriptionPlan,
      subscriptionEndDate: response.subscriptionEndDate,
      status: response.status || 'active',
      createdAt: format(response.createdAt, "dd/MM/yyyy HH:mm"),
      updatedAt: response.updatedAt ? format(response.updatedAt, "dd/MM/yyyy HH:mm") : undefined,
    };
  };

  return {
    createAppUser: async (user: Partial<IAppUser>) => {
      try {
        const response = await httpClient.post("/users", user);
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toAppUser(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

