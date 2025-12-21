import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IDeleteAppUserGateway } from "../../core/gateways/iDeleteAppUserGateway";

export const HttpDeleteAppUserGateway = (
  httpClient: IHttpClient
): IDeleteAppUserGateway => {
  return {
    deleteAppUser: async (id: string) => {
      try {
        const response = await httpClient.delete(`/users/${id}`);
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

