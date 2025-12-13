import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IDeleteCommerceGateway } from "../../core/gateways/iDeleteCommerceGateway";

export const HttpDeleteCommerceGateway = (
  httpClient: IHttpClient
): IDeleteCommerceGateway => {
  return {
    deleteCommerce: async (id: string) => {
      try {
        const response = await httpClient.delete(`/commerces/${id}`);
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
