import type {
  IBingoDrawResult,
  IBingoEvent,
  IBingoEventDetail,
  IBingoEventFormInput,
  IBingoParticipantEntry,
  IBingoStand,
  IBingoStandFormInput,
} from "../entities/iBingo";

export interface IBingoViews {
  listEventsSuccess: (items: IBingoEvent[]) => void;
  listEventsError: (error: Error) => void;
  eventDetailSuccess: (item: IBingoEventDetail) => void;
  eventDetailError: (error: Error) => void;
  saveEventSuccess: (item: IBingoEvent, message?: string) => void;
  saveEventError: (error: Error) => void;
  removeEventSuccess: (id: string, message?: string) => void;
  standSaved: (stand: IBingoStand) => void;
  standError: (error: Error) => void;
  standRemoved: (id: string) => void;
  participantsSuccess: (items: IBingoParticipantEntry[]) => void;
  participantsError: (error: Error) => void;
  drawSuccess: (result: IBingoDrawResult) => void;
  drawError: (error: Error) => void;
}

export interface IBingoPresenter {
  loadEvents: () => void;
  loadEventDetail: (id: string) => void;
  createEvent: (input: IBingoEventFormInput) => void;
  updateEvent: (id: string, input: IBingoEventFormInput) => void;
  activateEvent: (id: string) => void;
  reactivateEvent: (id: string) => void;
  closeEvent: (id: string) => void;
  deleteEvent: (id: string) => void;
  createStand: (eventId: string, input: IBingoStandFormInput) => void;
  updateStand: (eventId: string, standId: string, input: IBingoStandFormInput) => void;
  deleteStand: (eventId: string, standId: string) => void;
  loadParticipants: (eventId: string) => void;
  draw: (eventId: string) => void;
}
