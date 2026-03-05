export interface IMercadoPagoSyncGateway {
  sync(): Promise<void>;
}
