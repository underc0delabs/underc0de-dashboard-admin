import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetAppUsersGateway } from "../../core/gateways/iGetAppUsersGateway";
import { IAppUser } from "../../core/entities/iAppUser";
import { mapApiUserToAppUser } from "../mapApiUserToAppUser";

export const HttpGetAppUserGateway = (
  httpClient: IHttpClient
): IGetAppUsersGateway => {
  const toAppUsers = (response: unknown): IAppUser[] => {
    if (!Array.isArray(response)) return [];
    return response.map((user) =>
      mapApiUserToAppUser(user as Record<string, unknown>)
    );
  };
  return {
    getAppUsers: async () => {
      try {
        const response = await httpClient.get("/users");
        if (!response.status) {
          return Promise.reject(new Error(response.error.message));
        }
        return Promise.resolve(toAppUsers(response.data));
      } catch (error) {
        return Promise.reject(error);
      }
    },
  };
};

