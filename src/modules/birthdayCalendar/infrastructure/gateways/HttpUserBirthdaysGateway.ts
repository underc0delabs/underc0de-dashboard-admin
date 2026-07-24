import { HttpResponse, IHttpClient } from "@/modules/httpClient/interfaces";
import { parseHttpClientError } from "@/utils/parseHttpClientError";
import { IUserBirthday } from "../../core/entities/iUserBirthday";

const rejectHttpError = (error: unknown): never => {
  throw new Error(parseHttpClientError(error, "No se pudo completar la operación"));
};

const unwrap = (response: HttpResponse): IUserBirthday[] => {
  if (!response.status) {
    throw new Error(parseHttpClientError(response, "Request failed"));
  }
  return (response.data as IUserBirthday[]) ?? [];
};

export const HttpUserBirthdaysGateway = (httpClient: IHttpClient) => ({
  list: async (): Promise<IUserBirthday[]> => {
    try {
      return unwrap(await httpClient.get("/admin/users/birthdays"));
    } catch (error) {
      rejectHttpError(error);
    }
  },
});

export type IUserBirthdaysGateway = ReturnType<typeof HttpUserBirthdaysGateway>;
