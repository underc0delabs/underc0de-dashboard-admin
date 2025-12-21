import { IEditAppUserGateway } from "../../core/gateways/iEditAppUserGateway";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IAppUser } from "../../core/entities/iAppUser";
import { format } from "date-fns";

export const HttpEditAppUserGateway = (
  httpClient: IHttpClient
): IEditAppUserGateway => {
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
    updateAppUser: async (id: string, user: Partial<IAppUser>) => {
      try {
        const response = await httpClient.put(`/users/${id}`, user);
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

