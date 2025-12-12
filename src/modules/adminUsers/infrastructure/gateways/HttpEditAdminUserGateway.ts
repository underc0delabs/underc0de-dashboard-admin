import { IEditAdminUserGateway } from "../../core/gateways/iEditAdminUserGateway";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { AdminUserRole, IAdminUser } from "../../core/entities/iAdminUser";
import { format } from "date-fns";

export const HttpEditAdminUserGateway = (
  httpClient: IHttpClient
): IEditAdminUserGateway => {
  const toAdminUser = (response: any): IAdminUser => {
    return {
      id: response.id,
      email: response.email,
      name: response.name,
      role:
        response.role == "Admin" ? AdminUserRole.ADMIN : AdminUserRole.EDITOR,
      createdAt: format(response.createdAt, "dd/MM/yyyy HH:mm"),
      updatedAt: format(response.updatedAt, "dd/MM/yyyy HH:mm"),
    };
  };
  return {
    updateAdminUser: async (id: string, user: Partial<IAdminUser>) => {
      try {
        const response = await httpClient.put(`/admin-users/${id}`, {
            ...user,
            rol: user.role
        });
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toAdminUser(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
