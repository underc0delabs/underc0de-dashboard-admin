import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IGetProfileGateway } from "../../core/gateways/iGetProfileGateway";
import { IProfile, ProfileRole } from "../../core/entities/iProfile";
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
    raw.updatedAt &&
    format(new Date(String(raw.updatedAt)), "dd/MM/yyyy HH:mm"),
});

export const HttpGetProfileGateway = (
  httpClient: IHttpClient
): IGetProfileGateway => ({
  getById: async (id: string) => {
    const response = await httpClient.get(`/admin-users/${id}`);
    if (!response.status) {
      return Promise.reject(new Error(response.error?.message ?? "Error al obtener perfil"));
    }
    return Promise.resolve(toProfile(response.data ?? {}));
  },
});
