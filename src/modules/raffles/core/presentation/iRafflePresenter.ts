import type { IRaffle, IRaffleEvent, IRaffleParticipant } from "../entities/iRaffle";

export interface IRaffleViews {
  listRafflesSuccess: (items: IRaffle[]) => void;
  listRafflesError: (error: Error) => void;
  saveRaffleSuccess: (item: IRaffle) => void;
  saveRaffleError: (error: Error) => void;
  actionSuccess: (item: IRaffle, message?: string) => void;
  actionError: (error: Error) => void;
  removeRaffleSuccess: (id: string, message?: string) => void;
  detailSuccess: (
    item: IRaffle,
    participants: IRaffleParticipant[],
    events: IRaffleEvent[],
  ) => void;
  detailError: (error: Error) => void;
}

export interface IRafflePresenter {
  loadRaffles: () => void;
  createRaffle: (input: import("../entities/iRaffle").IRaffleFormInput) => void;
  updateRaffle: (
    id: string,
    input: import("../entities/iRaffle").IRaffleFormInput,
  ) => void;
  publishRaffle: (id: string) => void;
  closeRaffle: (id: string) => void;
  drawRaffle: (id: string) => void;
  redrawRaffle: (id: string) => void;
  claimRaffle: (id: string) => void;
  duplicateRaffle: (id: string) => void;
  deleteRaffle: (id: string) => void;
  loadDetail: (id: string) => void;
}
