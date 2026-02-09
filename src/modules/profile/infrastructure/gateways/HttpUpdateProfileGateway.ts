import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IUpdateProfileGateway } from "../../core/gateways/iUpdateProfileGateway";
import { IProfile, IProfileUpdatePayload, ProfileRole } from "../../core/entities/iProfile";
import { format } from "date-fns";

const toProfile = (raw: Record<string, unknown>): IProfile => ({
  id: String(raw.id ?? ""),
  email: String(raw.email ?? ""),
  name: String(raw.name ?? ""),
  role:
    (raw.rol ?? raw.role) === "Admin" ? ProfileRole.ADMIN : ProfileRole.EDITOR,
  createdAt: raw.createdAt
    ? format(new Date(String(raw.createdAt)), "dd/MM/yyyy HH:mm")
    : "",
  updatedAt:
    raw.updatedAt
      ? format(new Date(String(raw.updatedAt)), "dd/MM/yyyy HH:mm")
      : undefined,
});

export const HttpUpdateProfileGateway = (
  httpClient: IHttpClient
): IUpdateProfileGateway => ({
  update: async (id: string, payload: IProfileUpdatePayload) => {
    const body: Record<string, unknown> = {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.email !== undefined && { email: payload.email }),
      ...(payload.currentPassword !== undefined && {
        currentPassword: payload.currentPassword,
      }),
      ...(payload.newPassword !== undefined && { password: payload.newPassword }),
    };
    const response = await httpClient.patch(`/admin-users/${id}`, body);
    if (!response.status) {
      return Promise.reject(
        new Error(response.error?.message ?? "Error al actualizar perfil")
      );
    }
    return Promise.resolve(toProfile(response.data ?? {}));
  },
});
