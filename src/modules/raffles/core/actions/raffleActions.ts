import type { IRaffleGateway } from "../infrastructure/gateways/HttpRaffleGateway";
import type { IRaffleFormInput } from "./entities/iRaffle";

export const RaffleActions = (gateway: IRaffleGateway) => ({
  listRaffles: () => gateway.list(),
  getRaffle: (id: string) => gateway.getById(id),
  createRaffle: (input: IRaffleFormInput) => gateway.create(input),
  updateRaffle: (id: string, input: IRaffleFormInput) =>
    gateway.update(id, input),
  publishRaffle: (id: string) => gateway.publish(id),
  closeRaffle: (id: string) => gateway.close(id),
  drawRaffle: (id: string) => gateway.draw(id),
  redrawRaffle: (id: string) => gateway.redraw(id),
  claimRaffle: (id: string) => gateway.claim(id),
  duplicateRaffle: (id: string) => gateway.duplicate(id),
  setRaffleVisibility: (id: string, visibleInApp: boolean) =>
    gateway.setVisibility(id, visibleInApp),
  deleteRaffle: (id: string) => gateway.delete(id),
  listParticipants: (id: string) => gateway.listParticipants(id),
  listEvents: (id: string) => gateway.listEvents(id),
});

export type IRaffleActions = ReturnType<typeof RaffleActions>;
