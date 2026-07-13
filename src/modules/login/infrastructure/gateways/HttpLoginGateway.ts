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
        if (!response.status) {
          const message =
            response.error?.message?.trim() || "No se pudo iniciar sesión";
          return Promise.reject(new Error(message));
        }
        const payload = response.data;
        if (!payload?.token || !payload?.user) {
          return Promise.reject(new Error("Respuesta de login inválida"));
        }
        if (payload.user.status === false) {
          return Promise.reject(new Error("Usuario no activo"));
        }
        return Promise.resolve(toLoginResponse(payload));
      } catch (error) {
        if (error instanceof Error && error.message.trim()) {
          return Promise.reject(error);
        }
        const http = error as { error?: { message?: string }; data?: { msg?: string } };
        const message =
          http.error?.message?.trim() ||
          http.data?.msg?.trim() ||
          "No se pudo iniciar sesión";
        return Promise.reject(new Error(message));
      }
    },
  };
};
