import { IHttpClient } from "@/modules/httpClient/interfaces";
import type {
  IRaffle,
  IRaffleEvent,
  IRaffleFormInput,
  IRaffleParticipant,
} from "../../core/entities/iRaffle";

const unwrap = (response: {
  status: boolean;
  data: unknown;
  error?: { message?: string };
}) => {
  if (!response.status) {
    throw new Error(response.error?.message ?? "Request failed");
  }
  return response.data as IRaffle | IRaffle[] | IRaffleParticipant[] | IRaffleEvent[];
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
  list: async (): Promise<IRaffle[]> => {
    const response = await httpClient.get("/admin/raffles");
    return unwrap(response) as IRaffle[];
  },

  getById: async (id: string): Promise<IRaffle> => {
    const response = await httpClient.get(`/admin/raffles/${id}`);
    return unwrap(response) as IRaffle;
  },

  create: async (input: IRaffleFormInput): Promise<IRaffle> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    const response = await httpClient.post("/admin/raffles", formData);
    return unwrap(response) as IRaffle;
  },

  update: async (id: string, input: IRaffleFormInput): Promise<IRaffle> => {
    const formData = new FormData();
    appendFormFields(formData, input);
    const response = await httpClient.patch(`/admin/raffles/${id}`, formData);
    return unwrap(response) as IRaffle;
  },

  publish: async (id: string): Promise<IRaffle> => {
    const response = await httpClient.post(`/admin/raffles/${id}/publish`, {});
    return unwrap(response) as IRaffle;
  },

  draw: async (id: string): Promise<IRaffle> => {
    const response = await httpClient.post(`/admin/raffles/${id}/draw`, {});
    return unwrap(response) as IRaffle;
  },

  redraw: async (id: string): Promise<IRaffle> => {
    const response = await httpClient.post(`/admin/raffles/${id}/redraw`, {});
    return unwrap(response) as IRaffle;
  },

  claim: async (id: string): Promise<IRaffle> => {
    const response = await httpClient.post(`/admin/raffles/${id}/claim`, {});
    return unwrap(response) as IRaffle;
  },

  listParticipants: async (id: string): Promise<IRaffleParticipant[]> => {
    const response = await httpClient.get(`/admin/raffles/${id}/participants`);
    return unwrap(response) as IRaffleParticipant[];
  },

  listEvents: async (id: string): Promise<IRaffleEvent[]> => {
    const response = await httpClient.get(`/admin/raffles/${id}/events`);
    return unwrap(response) as IRaffleEvent[];
  },
});

export type IRaffleGateway = ReturnType<typeof HttpRaffleGateway>;
