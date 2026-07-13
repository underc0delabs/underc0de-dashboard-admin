import type { IRaffleActions } from "../../core/actions/raffleActions";
import type {
  IRafflePresenter,
  IRaffleViews,
} from "../../core/presentation/iRafflePresenter";
import type { IRaffleFormInput } from "../../core/entities/iRaffle";

export const RafflePresenter = (
  actions: IRaffleActions,
  views: IRaffleViews,
): IRafflePresenter => ({
  loadRaffles() {
    actions
      .listRaffles()
      .then(views.listRafflesSuccess)
      .catch(err =>
        views.listRafflesError(
          err instanceof Error ? err : new Error(String(err)),
        ),
      );
  },

  createRaffle(input: IRaffleFormInput) {
    actions
      .createRaffle(input)
      .then(views.saveRaffleSuccess)
      .catch(err =>
        views.saveRaffleError(
          err instanceof Error ? err : new Error(String(err)),
        ),
      );
  },

  updateRaffle(id: string, input: IRaffleFormInput) {
    actions
      .updateRaffle(id, input)
      .then(views.saveRaffleSuccess)
      .catch(err =>
        views.saveRaffleError(
          err instanceof Error ? err : new Error(String(err)),
        ),
      );
  },

  publishRaffle(id: string) {
    actions
      .publishRaffle(id)
      .then(item => views.actionSuccess(item, "Sorteo publicado"))
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  closeRaffle(id: string) {
    actions
      .closeRaffle(id)
      .then(item => views.actionSuccess(item, "Participación cerrada"))
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  drawRaffle(id: string) {
    actions
      .drawRaffle(id)
      .then(item => views.actionSuccess(item, "Ganador sorteado"))
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  redrawRaffle(id: string) {
    actions
      .redrawRaffle(id)
      .then(item => views.actionSuccess(item, "Re-sorteo realizado"))
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  claimRaffle(id: string) {
    actions
      .claimRaffle(id)
      .then(item => views.actionSuccess(item, "Premio entregado"))
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  duplicateRaffle(id: string) {
    actions
      .duplicateRaffle(id)
      .then(item =>
        views.actionSuccess(item, "Sorteo duplicado como borrador"),
      )
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  setRaffleVisibility(id: string, visibleInApp: boolean) {
    actions
      .setRaffleVisibility(id, visibleInApp)
      .then(item =>
        views.actionSuccess(
          item,
          visibleInApp
            ? "Sorteo visible en la app móvil"
            : "Sorteo oculto en la app móvil",
        ),
      )
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  deleteRaffle(id: string) {
    actions
      .deleteRaffle(id)
      .then(result =>
        views.removeRaffleSuccess(result.id, "Sorteo eliminado del panel"),
      )
      .catch(err =>
        views.actionError(err instanceof Error ? err : new Error(String(err))),
      );
  },

  loadDetail(id: string) {
    Promise.all([
      actions.getRaffle(id),
      actions.listParticipants(id),
      actions.listEvents(id),
    ])
      .then(([item, participants, events]) =>
        views.detailSuccess(item, participants, events),
      )
      .catch(err =>
        views.detailError(err instanceof Error ? err : new Error(String(err))),
      );
  },
});
