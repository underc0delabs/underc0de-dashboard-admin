import { AdminUserRole, IAdminUser } from "../../core/entities/iAdminUser";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { ICreateAdminUserGateway } from "../../core/gateways/iCreateAdminUserGateway";
import { format } from "date-fns";


export const HttpCreateAdminUserGateway = (
  httpClient: IHttpClient
): ICreateAdminUserGateway => {
  const toAdminUser = (response: any): IAdminUser => {
    return {
      id: response.id,
      email: response.email,
      name: response.name,
      role: response.role == "Admin" ? AdminUserRole.ADMIN : AdminUserRole.EDITOR,
      createdAt: format(response.createdAt, "dd/MM/yyyy HH:mm"),
      updatedAt: format(response.updatedAt, "dd/MM/yyyy HH:mm"),
    };
  };

  return {
    createAdminUser: async (user: Partial<IAdminUser>) => {
      try {
        const response = await httpClient.post("/admin-users", {
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