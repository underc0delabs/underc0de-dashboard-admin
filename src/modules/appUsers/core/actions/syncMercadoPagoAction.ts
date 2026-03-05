import {
  IMercadoPagoSyncGateway,
  MercadoPagoSyncStatus,
} from "../gateways/iMercadoPagoSyncGateway";

export interface ISyncMercadoPagoAction {
  execute(): Promise<void>;
  getSyncStatus(): Promise<MercadoPagoSyncStatus>;
}

export const SyncMercadoPagoAction = (
  gateway: IMercadoPagoSyncGateway
): ISyncMercadoPagoAction => {
  return {
    execute: async () => gateway.sync(),
    getSyncStatus: () => gateway.getSyncStatus(),
  };
};
