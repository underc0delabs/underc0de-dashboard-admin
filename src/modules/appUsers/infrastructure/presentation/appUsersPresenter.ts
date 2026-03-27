import { IGetAppUsersAction } from "../../core/actions/getAppUsersAction";
import { IAppUser } from "../../core/entities/iAppUser";
import { IAppUsersPresenter } from "../../core/presentation/iAppUsersPresenter";
import { IAppUsersViews } from "../../core/views/iAppUsersViews";
import { IEditAppUserAction } from "../../core/actions/editAppUserAction";
import { ICreateAppUserAction } from "../../core/actions/createAppUserAction";
import { IDeleteAppUserAction } from "../../core/actions/deleteAppUserAction";
import { ISyncMercadoPagoAction } from "../../core/actions/syncMercadoPagoAction";
import { IReconcileUserMercadoPagoAction } from "../../core/actions/reconcileUserMercadoPagoAction";

export const AppUsersPresenter = (
  getAppUsersAction: IGetAppUsersAction,
  viewHandlers: IAppUsersViews,
  editAppUserAction: IEditAppUserAction,
  createAppUserAction: ICreateAppUserAction,
  deleteAppUserAction: IDeleteAppUserAction,
  syncMercadoPagoAction: ISyncMercadoPagoAction,
  reconcileUserMercadoPagoAction: IReconcileUserMercadoPagoAction
): IAppUsersPresenter => {
  return {
    getAppUsers: async () => {
      getAppUsersAction
        .execute()
        .then(viewHandlers.getUsersSuccess)
        .catch(viewHandlers.getUsersError);
    },
    updateAppUser: async (id: string, user: Partial<IAppUser>) => {
      editAppUserAction
        .execute(id, user)
        .then(viewHandlers.updateUserSuccess)
        .catch(viewHandlers.updateUserError);
    },
    createAppUser: async (user: Partial<IAppUser>) => {
      createAppUserAction
        .execute(user)
        .then(viewHandlers.createUserSuccess)
        .catch(viewHandlers.createUserError);
    },
    deleteAppUser: async (id: string) => {
      deleteAppUserAction
        .execute(id)
        .then(viewHandlers.deleteUserSuccess)
        .catch(viewHandlers.deleteUserError);
    },
    syncMercadoPago: () => {
      syncMercadoPagoAction
        .execute()
        .then(() => {
          viewHandlers.syncMercadoPagoSuccess();
        })
        .catch((err: unknown) => {
          const msg =
            (err as Error)?.message ??
            (err as { error?: { message?: string } })?.error?.message ??
            String(err ?? "Error al sincronizar");
          viewHandlers.syncMercadoPagoError(msg);
        });
    },
    getMercadoPagoSyncStatus: () => syncMercadoPagoAction.getSyncStatus(),
    reconcileMercadoPagoUser: (userId: string) => {
      reconcileUserMercadoPagoAction
        .execute(userId)
        .then((result) => {
          const parts: string[] = [];
          parts.push(`MP: ${result.mp_status}`);
          parts.push(`Local: ${result.local_subscription_status}`);
          if ((result.payments_saved ?? 0) > 0) {
            parts.push(`${result.payments_saved} pagos nuevos`);
          }
          viewHandlers.reconcileMercadoPagoUserSuccess(parts.join(" · "));
        })
        .catch((err: unknown) => {
          const msg =
            err &&
            typeof err === "object" &&
            "error" in err &&
            (err as { error?: { message?: string } }).error?.message
              ? (err as { error: { message: string } }).error.message
              : (err as Error)?.message ?? String(err ?? "Error al reconciliar");
          viewHandlers.reconcileMercadoPagoUserError(msg);
        });
    },
  };
};

