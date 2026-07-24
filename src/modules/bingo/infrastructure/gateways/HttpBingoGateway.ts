import { HttpResponse, IHttpClient } from "@/modules/httpClient/interfaces";
import { parseHttpClientError } from "@/utils/parseHttpClientError";
import type {
  IBingoDrawResult,
  IBingoEvent,
  IBingoEventDetail,
  IBingoEventFormInput,
  IBingoParticipantEntry,
  IBingoStand,
  IBingoStandFormInput,
} from "../../core/entities/iBingo";

const rejectHttpError = (error: unknown): never => {
  throw new Error(parseHttpClientError(error, "No se pudo completar la operación"));
};

const unwrap = (response: HttpResponse) => {
  if (!response.status) {
    throw new Error(parseHttpClientError(response, "Request failed"));
  }
  return response.data;
};

const request = async <T>(call: () => Promise<HttpResponse>): Promise<T> => {
  try {
    return unwrap(await call()) as T;
  } catch (error) {
    rejectHttpError(error);
  }
};

export const HttpBingoGateway = (httpClient: IHttpClient) => ({
  listEvents: (): Promise<IBingoEvent[]> => request(() => httpClient.get("/admin/bingo-events")),

  getEvent: (id: string): Promise<IBingoEventDetail> =>
    request(() => httpClient.get(`/admin/bingo-events/${id}`)),

  createEvent: (input: IBingoEventFormInput): Promise<IBingoEvent> =>
    request(() => httpClient.post("/admin/bingo-events", input)),

  updateEvent: (id: string, input: IBingoEventFormInput): Promise<IBingoEvent> =>
    request(() => httpClient.patch(`/admin/bingo-events/${id}`, input)),

  activateEvent: (id: string): Promise<IBingoEvent> =>
    request(() => httpClient.post(`/admin/bingo-events/${id}/activate`, {})),

  /** Producción expone /activate; /reactivate puede no estar desplegado aún. */
  reactivateEvent: (id: string): Promise<IBingoEvent> =>
    request(() => httpClient.post(`/admin/bingo-events/${id}/activate`, {})),

  closeEvent: (id: string): Promise<IBingoEvent> =>
    request(() => httpClient.post(`/admin/bingo-events/${id}/close`, {})),

  deleteEvent: (id: string): Promise<{ id: string }> =>
    request(() => httpClient.delete(`/admin/bingo-events/${id}`)),

  createStand: (eventId: string, input: IBingoStandFormInput): Promise<IBingoStand> =>
    request(() => httpClient.post(`/admin/bingo-events/${eventId}/stands`, input)),

  updateStand: (
    eventId: string,
    standId: string,
    input: IBingoStandFormInput,
  ): Promise<IBingoStand> =>
    request(() => httpClient.patch(`/admin/bingo-events/${eventId}/stands/${standId}`, input)),

  deleteStand: (eventId: string, standId: string): Promise<{ id: string }> =>
    request(() => httpClient.delete(`/admin/bingo-events/${eventId}/stands/${standId}`)),

  listParticipants: (eventId: string): Promise<IBingoParticipantEntry[]> =>
    request(() => httpClient.get(`/admin/bingo-events/${eventId}/participants`)),

  draw: (eventId: string): Promise<IBingoDrawResult> =>
    request(() => httpClient.post(`/admin/bingo-events/${eventId}/draw`, {})),
});

export type IBingoGateway = ReturnType<typeof HttpBingoGateway>;
