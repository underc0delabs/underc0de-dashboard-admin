import { IMercadoPagoSyncGateway } from "../gateways/iMercadoPagoSyncGateway";

export interface ISyncMercadoPagoAction {
  execute(): Promise<void>;
}

export const SyncMercadoPagoAction = (
  gateway: IMercadoPagoSyncGateway
): ISyncMercadoPagoAction => {
  return {
    execute: async () => {
      return gateway.sync();
    },
  };
};
