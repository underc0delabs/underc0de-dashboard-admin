export interface MercadoPagoSyncStatus {
  status: "idle" | "running" | "completed" | "failed";
  startedAt?: string;
  finishedAt?: string;
  subscriptionsCreated?: number;
  subscriptionsUpdated?: number;
  paymentsSaved?: number;
  error?: string;
}

export interface MercadoPagoReconcileUserResult {
  mp_status: string;
  local_subscription_status: string;
  user_is_pro: boolean;
  payments_saved: number;
}

export interface IMercadoPagoSyncGateway {
  sync(): Promise<void>;
  getSyncStatus(): Promise<MercadoPagoSyncStatus>;
  reconcileUser(userId: string): Promise<MercadoPagoReconcileUserResult>;
}
