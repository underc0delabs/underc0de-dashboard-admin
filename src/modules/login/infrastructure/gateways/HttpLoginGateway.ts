import { IHttpClient } from "@/modules/HttpClient/interfaces";
import { ILoginGateway } from "../../core/gateways/ILoginGateway";

export const HttpLoginGateway = (httpClient: IHttpClient): ILoginGateway => {
  const toLoginResponse = (response: any) => {
    return {
      token: response.token,
      user: response.user,
    };
  };

  return {
    login: async (email: string, password: string) => {
      try {
        const response = await httpClient.post("/admin-users/login", { email, password });
        if (!response.data.user.status) {
          return Promise.reject(new Error("Usuario no activo"));
        }
        return Promise.resolve(toLoginResponse(response.data));
      } catch (error) {
        return Promise.reject(error?.data?.message || error);
      }
    },
  };
};
