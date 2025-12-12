import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IDeleteAdminUserGateway } from "../../core/gateways/iDeleteAdminUserGateway";

export const HttpDeleteAdminUserGateway = (
  httpClient: IHttpClient
): IDeleteAdminUserGateway => {
  return {
    deleteAdminUser: async (id: string) => {
      try {
        const response = await httpClient.delete(`/admin-users/${id}`);
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(true);
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};