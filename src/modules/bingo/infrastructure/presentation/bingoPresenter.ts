import type { IBingoActions } from "../../core/actions/bingoActions";
import type { IBingoPresenter, IBingoViews } from "../../core/presentation/iBingoPresenter";
import type { IBingoEventFormInput, IBingoStandFormInput } from "../../core/entities/iBingo";

const asError = (err: unknown): Error => (err instanceof Error ? err : new Error(String(err)));

export const BingoPresenter = (
  actions: IBingoActions,
  views: IBingoViews,
): IBingoPresenter => ({
  loadEvents() {
    actions.listEvents().then(views.listEventsSuccess).catch(err => views.listEventsError(asError(err)));
  },

  loadEventDetail(id: string) {
    actions.getEvent(id).then(views.eventDetailSuccess).catch(err => views.eventDetailError(asError(err)));
  },

  createEvent(input: IBingoEventFormInput) {
    actions
      .createEvent(input)
      .then(item => views.saveEventSuccess(item, "Evento creado"))
      .catch(err => views.saveEventError(asError(err)));
  },

  updateEvent(id: string, input: IBingoEventFormInput) {
    actions
      .updateEvent(id, input)
      .then(item => views.saveEventSuccess(item, "Evento actualizado"))
      .catch(err => views.saveEventError(asError(err)));
  },

  activateEvent(id: string) {
    actions
      .activateEvent(id)
      .then(item => views.saveEventSuccess(item, "Evento activado"))
      .catch(err => views.saveEventError(asError(err)));
  },

  reactivateEvent(id: string) {
    actions
      .reactivateEvent(id)
      .then(item => views.saveEventSuccess(item, "Evento reactivado"))
      .catch(err => views.saveEventError(asError(err)));
  },

  closeEvent(id: string) {
    actions
      .closeEvent(id)
      .then(item => views.saveEventSuccess(item, "Evento desactivado"))
      .catch(err => views.saveEventError(asError(err)));
  },

  deleteEvent(id: string) {
    actions
      .deleteEvent(id)
      .then(result => views.removeEventSuccess(result.id, "Evento eliminado"))
      .catch(err => views.saveEventError(asError(err)));
  },

  createStand(eventId: string, input: IBingoStandFormInput) {
    actions
      .createStand(eventId, input)
      .then(views.standSaved)
      .catch(err => views.standError(asError(err)));
  },

  updateStand(eventId: string, standId: string, input: IBingoStandFormInput) {
    actions
      .updateStand(eventId, standId, input)
      .then(views.standSaved)
      .catch(err => views.standError(asError(err)));
  },

  deleteStand(eventId: string, standId: string) {
    actions
      .deleteStand(eventId, standId)
      .then(() => views.standRemoved(standId))
      .catch(err => views.standError(asError(err)));
  },

  loadParticipants(eventId: string) {
    actions
      .listParticipants(eventId)
      .then(views.participantsSuccess)
      .catch(err => views.participantsError(asError(err)));
  },

  draw(eventId: string) {
    actions.draw(eventId).then(views.drawSuccess).catch(err => views.drawError(asError(err)));
  },
});
