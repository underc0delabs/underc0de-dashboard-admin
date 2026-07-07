import { HttpResponse, IHttpClient } from "@/modules/httpClient/interfaces";
import { parseHttpClientError } from "@/utils/parseHttpClientError";
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
  if (input.image) {
    formData.append("image", input.image);
  }
  if (input.removeImage) {
    formData.append("removeImage", "true");
  }
};

export const HttpRaffleGateway = (httpClient: IHttpClient) => ({
  list: (): Promise<IRaffle[]> =>
    request(() => httpClient.get("/admin/raffles")),

  getById: (id: string): Promise<IRaffle> =>
    request(() => httpClient.get(`/admin/raffles/${id}`)),

  create: (input: IRaffleFormInput): Promise<IRaffle> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    return request(() => httpClient.post("/admin/raffles", formData));
  },

  update: (id: string, input: IRaffleFormInput): Promise<IRaffle> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    return request(() => httpClient.patch(`/admin/raffles/${id}`, formData));
  },

  publish: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/publish`, {})),

  draw: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/draw`, {})),

  redraw: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/redraw`, {})),

  claim: (id: string): Promise<IRaffle> =>
    request(() => httpClient.post(`/admin/raffles/${id}/claim`, {})),

  listParticipants: (id: string): Promise<IRaffleParticipant[]> =>
    request(() => httpClient.get(`/admin/raffles/${id}/participants`)),

  listEvents: (id: string): Promise<IRaffleEvent[]> =>
    request(() => httpClient.get(`/admin/raffles/${id}/events`)),
});

export type IRaffleGateway = ReturnType<typeof HttpRaffleGateway>;
