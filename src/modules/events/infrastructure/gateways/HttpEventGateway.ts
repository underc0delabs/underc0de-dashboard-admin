import { HttpResponse, IHttpClient } from "@/modules/httpClient/interfaces";
import { parseHttpClientError } from "@/utils/parseHttpClientError";
import { resolveFileUrl } from "@/utils/resolveFileUrl";
import type { IEvent, IEventFormInput } from "../../core/entities/iEvent";

const rejectHttpError = (error: unknown): never => {
  throw new Error(parseHttpClientError(error, "No se pudo completar la operación"));
};

const unwrap = (response: HttpResponse) => {
  if (!response.status) {
    throw new Error(parseHttpClientError(response, "Request failed"));
  }
  return response.data as IEvent | IEvent[];
};

const isUploadableFile = (value: unknown): value is File =>
  typeof File !== "undefined" &&
  value instanceof File &&
  value.size > 0;

const mapEvent = (item: IEvent): IEvent => ({
  ...item,
  imageUrl: resolveFileUrl(item.imageUrl),
});

const mapEventList = (items: IEvent[]): IEvent[] => items.map(mapEvent);

const request = async <T>(call: () => Promise<HttpResponse>): Promise<T> => {
  try {
    return unwrap(await call()) as T;
  } catch (error) {
    rejectHttpError(error);
  }
};

const appendFormFields = (formData: FormData, input: IEventFormInput) => {
  formData.append("title", input.title.trim());
  formData.append("eventType", input.eventType.trim());
  formData.append("startDate", input.startDate.trim());
  formData.append("endDate", input.endDate.trim());
  formData.append("startTime", input.startTime.trim());
  formData.append("endTime", input.endTime.trim());
  formData.append("place", input.place.trim());
  formData.append("modality", input.modality.trim());
  formData.append("description", input.description.trim());
  formData.append("notes", input.notes.trim());
  formData.append("visibleInApp", String(input.visibleInApp));
  if (isUploadableFile(input.image)) {
    formData.append("image", input.image, input.image.name);
  }
  if (input.removeImage) {
    formData.append("removeImage", "true");
  }
};

export const HttpEventGateway = (httpClient: IHttpClient) => ({
  list: (): Promise<IEvent[]> =>
    request(() => httpClient.get("/admin/events")).then(mapEventList),

  getById: (id: string): Promise<IEvent> =>
    request(() => httpClient.get(`/admin/events/${id}`)).then(mapEvent),

  create: (input: IEventFormInput): Promise<IEvent> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    return request(() => httpClient.post("/admin/events", formData)).then(mapEvent);
  },

  update: (id: string, input: IEventFormInput): Promise<IEvent> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    return request(() =>
      httpClient.patch(`/admin/events/${id}`, formData),
    ).then(mapEvent);
  },

  remove: (id: string): Promise<void> =>
    request(() => httpClient.delete(`/admin/events/${id}`)).then(() => undefined),
});

export type IEventGateway = ReturnType<typeof HttpEventGateway>;
