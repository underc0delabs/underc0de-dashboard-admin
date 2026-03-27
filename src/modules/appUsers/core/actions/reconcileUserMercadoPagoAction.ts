import {
  IMercadoPagoSyncGateway,
  MercadoPagoReconcileUserResult,
} from "../gateways/iMercadoPagoSyncGateway";

export interface IReconcileUserMercadoPagoAction {
  execute(userId: string): Promise<MercadoPagoReconcileUserResult>;
}

export const ReconcileUserMercadoPagoAction = (
  gateway: IMercadoPagoSyncGateway
): IReconcileUserMercadoPagoAction => ({
  execute: (userId: string) => gateway.reconcileUser(userId),
});
