import { IAppUser } from "../../core/entities/iAppUser";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { ICreateAppUserGateway } from "../../core/gateways/iCreateAppUserGateway";
import { mapApiUserToAppUser } from "../mapApiUserToAppUser";

export const HttpCreateAppUserGateway = (
  httpClient: IHttpClient
): ICreateAppUserGateway => {
  return {
    createAppUser: async (user: Partial<IAppUser>) => {
      const postBody: Record<string, unknown> = {
        username: user.username,
        name: user.name,
        lastname: user.lastname ?? "",
        phone: user.phone ?? "",
        email: user.email,
        userType: 0,
        status: user.status ?? true,
      };
      if (user.password?.trim()) {
        postBody.password = user.password.trim();
      }
      const mp = user.mercadopago_email?.trim();
      if (mp) postBody.mercadopago_email = mp;

      const response = await httpClient.post("/users", postBody);
      if (!response.status) {
        return Promise.reject(new Error(response.error.message));
      }

      const created = response.data as { id?: number | string };
      const id =
        created?.id != null ? String(created.id) : undefined;
      if (!id) {
        return Promise.reject(new Error("La API no devolvió el id del usuario"));
      }

      const forumId = user.forumUserId?.trim();
      if (forumId) {
        const fr = await httpClient.patch(
          `/admin/members/by-app-user/${id}/forum`,
          {
            forumUserId: forumId,
            forumEmail: user.forumEmail?.trim() || null,
          }
        );
        if (!fr.status) {
          return Promise.reject(new Error(fr.error.message));
        }
      }

      const mpEmail = user.mercadopago_email?.trim();
      const mpCust = user.mercadopagoCustomerId?.trim();
      const mpExt = user.mercadopagoExternalReference?.trim();
      if (mpEmail || mpCust || mpExt) {
        const mpRes = await httpClient.patch(
          `/admin/members/by-app-user/${id}/mercadopago`,
          {
            mercadopagoEmail: mpEmail || null,
            mercadopagoCustomerId: mpCust || null,
            mercadopagoExternalReference: mpExt || null,
          }
        );
        if (!mpRes.status) {
          return Promise.reject(new Error(mpRes.error.message));
        }
      }

      const one = await httpClient.get(`/users/${id}`);
      if (!one.status) {
        return Promise.reject(new Error(one.error.message));
      }
      return Promise.resolve(
        mapApiUserToAppUser(one.data as Record<string, unknown>)
      );
    },
  };
};
