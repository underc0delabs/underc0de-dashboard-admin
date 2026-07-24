export interface IEvent {
  id: string;
  title?: string | null;
  eventType?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  place?: string | null;
  modality?: string | null;
  description?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  visibleInApp?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IEventFormInput {
  title: string;
  eventType: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  place: string;
  modality: string;
  description: string;
  notes: string;
  visibleInApp: boolean;
  image?: File | null;
  removeImage?: boolean;
}

export const emptyEventFormInput = (): IEventFormInput => ({
  title: "",
  eventType: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  place: "",
  modality: "",
  description: "",
  notes: "",
  visibleInApp: true,
  image: null,
  removeImage: false,
});

export const eventToFormInput = (event: IEvent): IEventFormInput => ({
  title: event.title ?? "",
  eventType: event.eventType ?? "",
  startDate: event.startDate ?? "",
  endDate: event.endDate ?? "",
  startTime: event.startTime ?? "",
  endTime: event.endTime ?? "",
  place: event.place ?? "",
  modality: event.modality ?? "",
  description: event.description ?? "",
  notes: event.notes ?? "",
  visibleInApp: event.visibleInApp ?? true,
  image: null,
  removeImage: false,
});
