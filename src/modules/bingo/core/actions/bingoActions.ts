import type { IBingoGateway } from "../../infrastructure/gateways/HttpBingoGateway";
import type { IBingoEventFormInput, IBingoStandFormInput } from "../entities/iBingo";

export const BingoActions = (gateway: IBingoGateway) => ({
  listEvents: () => gateway.listEvents(),
  getEvent: (id: string) => gateway.getEvent(id),
  createEvent: (input: IBingoEventFormInput) => gateway.createEvent(input),
  updateEvent: (id: string, input: IBingoEventFormInput) => gateway.updateEvent(id, input),
  activateEvent: (id: string) => gateway.activateEvent(id),
  reactivateEvent: (id: string) => gateway.reactivateEvent(id),
  closeEvent: (id: string) => gateway.closeEvent(id),
  deleteEvent: (id: string) => gateway.deleteEvent(id),
  createStand: (eventId: string, input: IBingoStandFormInput) =>
    gateway.createStand(eventId, input),
  updateStand: (eventId: string, standId: string, input: IBingoStandFormInput) =>
    gateway.updateStand(eventId, standId, input),
  deleteStand: (eventId: string, standId: string) => gateway.deleteStand(eventId, standId),
  listParticipants: (eventId: string) => gateway.listParticipants(eventId),
  draw: (eventId: string) => gateway.draw(eventId),
});

export type IBingoActions = ReturnType<typeof BingoActions>;
