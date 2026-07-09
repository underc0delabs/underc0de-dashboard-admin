import { IHttpClient } from "@/modules/httpClient/interfaces";
import { ICreateCommerceGateway } from "../../core/gateways/iCreateCommerceGateway";
import { ICommerce } from "../../core/entities/iCommerce";
import { format } from "date-fns";
import {
  appendCommerceLogoFields,
  mapCommerceLogo,
} from "./commerceGatewayUtils";

export const HttpCreateCommerceGateway = (
  httpClient: IHttpClient
): ICreateCommerceGateway => {
  const toCommerce = (response: any): ICommerce => {
    const commerce = {
      id: response.id,
      name: response.name,
      category: response.category,
      categoryName: response.categoryName ?? null,
      address: response.address,
      phone: response.phone,
      email: response.email,
      status: response.status,
      logo: response.logo,
      usersProDisccount: response.usersProDisccount ?? null,
      usersDisccount: response.usersDisccount ?? null,
      url: response.url,
      detail: response.detail,
      createdAt: format(response.createdAt, "dd/MM/yyyy HH:mm"),
      updatedAt: format(response.updatedAt, "dd/MM/yyyy HH:mm"),
    };
    return mapCommerceLogo(commerce);
  };
  return {
    createCommerce: async (
      commerce: Partial<ICommerce> & { logo?: string | File | null },
    ) => {
      try {
        const formData = new FormData();
        if (commerce.name) formData.append("name", commerce.name);
        if (commerce.category) formData.append("category", commerce.category);
        if (commerce.address) formData.append("address", commerce.address);
        if (commerce.phone) formData.append("phone", commerce.phone || "");
        if (commerce.email) formData.append("email", commerce.email || "");
        if (commerce.status !== undefined) {
          formData.append("status", String(commerce.status));
        }
        if (
          commerce.usersProDisccount !== undefined &&
          commerce.usersProDisccount !== null
        ) {
          formData.append(
            "usersProDisccount",
            String(commerce.usersProDisccount),
          );
        }
        if (
          commerce.usersDisccount !== undefined &&
          commerce.usersDisccount !== null
        ) {
          formData.append("usersDisccount", String(commerce.usersDisccount));
        }
        if (commerce.url) formData.append("url", commerce.url);
        if (commerce.detail) formData.append("detail", commerce.detail);
        appendCommerceLogoFields(formData, commerce);

        const response = await httpClient.post(`/commerces`, formData);
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toCommerce(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
