import { HttpResponse, IHttpClient } from "@/modules/httpClient/interfaces";
import { parseHttpClientError } from "@/utils/parseHttpClientError";
import { resolveFileUrl } from "@/utils/resolveFileUrl";
import type {
  IRaffle,
  IRaffleEvent,
  IRaffleFormInput,
  IRaffleParticipant,
} from "../../core/entities/iRaffle";

const rejectHttpError = (error: unknown): never => {
  throw new Error(parseHttpClientError(error, "No se pudo completar la operación"));
};

const unwrap = (response: HttpResponse) => {
  if (!response.status) {
    throw new Error(parseHttpClientError(response, "Request failed"));
  }
  return response.data as IRaffle | IRaffle[] | IRaffleParticipant[] | IRaffleEvent[];
};

const isUploadableFile = (value: unknown): value is File =>
  typeof File !== "undefined" &&
  value instanceof File &&
  value.size > 0;

const mapRaffle = (item: IRaffle): IRaffle => ({
  ...item,
  imageUrl: resolveFileUrl(item.imageUrl),
});

const mapRaffleList = (items: IRaffle[]): IRaffle[] => items.map(mapRaffle);

const request = async <T>(
  call: () => Promise<HttpResponse>,
): Promise<T> => {
  try {
    return unwrap(await call()) as T;
  } catch (error) {
    rejectHttpError(error);
  }
};

const appendFormFields = (formData: FormData, input: IRaffleFormInput) => {
  formData.append("title", input.title);
  formData.append("description", input.description);
  formData.append("participationDeadline", input.participationDeadline);
  formData.append("claimDeadline", input.claimDeadline);
  formData.append("proOnly", String(input.proOnly));
  if (isUploadableFile(input.image)) {
    formData.append("image", input.image, input.image.name);
  }
  if (input.removeImage) {
    formData.append("removeImage", "true");
  }
};

export const HttpRaffleGateway = (httpClient: IHttpClient) => ({
  list: (): Promise<IRaffle[]> =>
    request(() => httpClient.get("/admin/raffles")).then(mapRaffleList),

  getById: (id: string): Promise<IRaffle> =>
    request(() => httpClient.get(`/admin/raffles/${id}`)).then(mapRaffle),

  create: (input: IRaffleFormInput): Promise<IRaffle> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    return request(() => httpClient.post("/admin/raffles", formData)).then(mapRaffle);
  },

  update: (id: string, input: IRaffleFormInput): Promise<IRaffle> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    return request(() =>
      httpClient.patch(`/admin/raffles/${id}`, formData),
    ).then(mapRaffle);
  },

  publish: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/publish`, {})).then(
      mapRaffle,
    ),

  close: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/close`, {})).then(
      mapRaffle,
    ),

  draw: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/draw`, {})).then(
      mapRaffle,
    ),

  redraw: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/redraw`, {})).then(
      mapRaffle,
    ),

  claim: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/claim`, {})).then(
      mapRaffle,
    ),

  duplicate: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/duplicate`, {})).then(
      mapRaffle,
    ),

  setVisibility: (id: string, visibleInApp: boolean): Promise<IRaffle> =>
    request(() =>
      httpClient.patch(`/admin/raffles/${id}/visibility`, { visibleInApp }),
    ).then(mapRaffle),

  delete: (id: string): Promise<{ id: string }> =>
    request(() => httpClient.delete(`/admin/raffles/${id}`)),

  listParticipants: (id: string): Promise<IRaffleParticipant[]> =>
    request(() => httpClient.get(`/admin/raffles/${id}/participants`)),

  listEvents: (id: string): Promise<IRaffleEvent[]> =>
    request(() => httpClient.get(`/admin/raffles/${id}/events`)),
});

export type IRaffleGateway = ReturnType<typeof HttpRaffleGateway>;
