export interface MercadoPagoSyncStatus {
  status: "idle" | "running" | "completed" | "failed";
  startedAt?: string;
  finishedAt?: string;
  subscriptionsCreated?: number;
  subscriptionsUpdated?: number;
  paymentsSaved?: number;
  error?: string;
}

export interface IMercadoPagoSyncGateway {
  sync(): Promise<void>;
  getSyncStatus(): Promise<MercadoPagoSyncStatus>;
}
