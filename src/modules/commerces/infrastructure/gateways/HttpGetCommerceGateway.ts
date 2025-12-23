import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetCommerceGateway } from "../../core/gateways/iGetCommerceGateway";
import { ICommerce } from "../../core/entities/iCommerce";
import { format } from "date-fns";

export const HttpGetCommerceGateway = (
  httpClient: IHttpClient
): IGetCommerceGateway => {
  const toCommerces = (response: any): ICommerce[] => {
    return response.map((commerce: any) => ({
      id: commerce.id,
      name: commerce.name,
      category: commerce.category,
      address: commerce.address,
      phone: commerce.phone,
      email: commerce.email,
      status: commerce.status,
      logo: commerce.logo,
      usersProDisccount: commerce.usersProDisccount ?? null,
      usersDisccount: commerce.usersDisccount ?? null,
      url: commerce.url,
      detail: commerce.detail,
      createdAt: format(commerce.createdAt, "dd/MM/yyyy HH:mm"),
      updatedAt: format(commerce.updatedAt, "dd/MM/yyyy HH:mm"),
    }));
  };
  return {
    getCommerces: async () => {
      try {
        const response = await httpClient.get("/commerces");
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toCommerces(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
