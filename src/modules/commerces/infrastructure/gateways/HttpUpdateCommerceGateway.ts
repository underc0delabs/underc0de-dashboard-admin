import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IUpdateCommerceGateway } from "../../core/gateways/iUpdateCommerceGateway";
import { ICommerce } from "../../core/entities/iCommerce";
import { format } from "date-fns";

export const HttpUpdateCommerceGateway = (
  httpClient: IHttpClient
): IUpdateCommerceGateway => {
  const toCommerce = (response: any): ICommerce => {
    return {
      id: response.id,
      name: response.name,
      category: response.category,
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
  };
  return {
    updateCommerce: async (id: string, commerce: Partial<ICommerce> & { logo?: string | File }) => {
      try {
        const formData = new FormData();
        
        if (commerce.name) formData.append('name', commerce.name);
        if (commerce.category) formData.append('category', commerce.category);
        if (commerce.address) formData.append('address', commerce.address);
        if (commerce.phone) formData.append('phone', commerce.phone || '');
        if (commerce.email) formData.append('email', commerce.email || '');
        if (commerce.status !== undefined) formData.append('status', String(commerce.status));
        if (commerce.usersProDisccount !== undefined && commerce.usersProDisccount !== null) {
          formData.append('usersProDisccount', String(commerce.usersProDisccount));
        }
        if (commerce.usersDisccount !== undefined && commerce.usersDisccount !== null) {
          formData.append('usersDisccount', String(commerce.usersDisccount));
        }
        if (commerce.url) formData.append('url', commerce.url);
        if (commerce.detail) formData.append('detail', commerce.detail);
        
        // Solo enviar el logo si es un File válido (nueva imagen seleccionada)
        // Si el logo es null o string, no se envía (se mantiene el logo existente)
        if (commerce.logo) {
          const logoValue = commerce.logo as any;
          // Verificar que sea realmente un File y no un string o File vacío
          if (logoValue && typeof logoValue === 'object' && logoValue.constructor === File && logoValue.size > 0) {
            formData.append('logo', logoValue);
          }
        }
        const response = await httpClient.patch(`/commerces/${id}`, formData);
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
