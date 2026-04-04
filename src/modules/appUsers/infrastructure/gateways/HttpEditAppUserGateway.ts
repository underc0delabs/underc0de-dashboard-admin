import { IEditAppUserGateway } from "../../core/gateways/iEditAppUserGateway";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IAppUser } from "../../core/entities/iAppUser";
import { mapApiUserToAppUser } from "../mapApiUserToAppUser";

const buildUserPatchPayload = (
  user: Partial<IAppUser>
): Record<string, unknown> => {
  const keys = [
    "name",
    "lastname",
    "username",
    "email",
    "phone",
    "status",
    "subscription",
    "subscriptionPlan",
    "mercadopago_email",
  ] as const;
  const out: Record<string, unknown> = {};
  for (const k of keys) {
    const v = user[k];
    if (v !== undefined) out[k] = v;
  }
  return out;
};

export const HttpEditAppUserGateway = (
  httpClient: IHttpClient
): IEditAppUserGateway => {
  return {
    updateAppUser: async (id: string, user: Partial<IAppUser>) => {
      const patchRes = await httpClient.patch(
        `/admin/users/${id}`,
        buildUserPatchPayload(user)
      );
      if (!patchRes.status) {
        return Promise.reject(new Error(patchRes.error.message));
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
        const mp = await httpClient.patch(
          `/admin/members/by-app-user/${id}/mercadopago`,
          {
            mercadopagoEmail: mpEmail || null,
            mercadopagoCustomerId: mpCust || null,
            mercadopagoExternalReference: mpExt || null,
          }
        );
        if (!mp.status) {
          return Promise.reject(new Error(mp.error.message));
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
