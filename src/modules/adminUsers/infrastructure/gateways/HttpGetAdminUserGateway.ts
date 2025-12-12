import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetAdminUsersGateway } from "../../core/gateways/iGetAdminUsersGateway";
import { AdminUserRole, IAdminUser } from "../../core/entities/iAdminUser";
import { formatDate } from "date-fns";

export const HttpGetAdminUserGateway = (
  httpClient: IHttpClient
): IGetAdminUsersGateway => {
  const toAdminUsers = (response: any): IAdminUser[] => {
    return response.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.rol == "Admin" ? AdminUserRole.ADMIN : AdminUserRole.EDITOR,
      status: user.status,
      createdAt: formatDate(user.createdAt, "dd/MM/yyyy HH:mm"),
      updatedAt: formatDate(user.updatedAt, "dd/MM/yyyy HH:mm"),
    }));
  };
  return {
    getAdminUsers: async () => {
      try {
        const response = await httpClient.get("/admin-users");
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toAdminUsers(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};
