import { IHttpClient } from "@/modules/httpClient/interfaces";
import {
  IMercadoPagoSyncGateway,
  MercadoPagoReconcileUserResult,
  MercadoPagoSyncStatus,
} from "../../core/gateways/iMercadoPagoSyncGateway";

export const HttpMercadoPagoSyncGateway = (
  httpClient: IHttpClient
): IMercadoPagoSyncGateway => {
  return {
    sync: async () => {
      const response = await httpClient.post("/cron/mercadopago-sync", {});
      if (!response.status) {
        const msg =
          (response as any).error?.message ??
          (typeof (response as any).error === "string"
            ? (response as any).error
            : "Error al sincronizar MercadoPago");
        return Promise.reject(new Error(msg));
      }
    },
    getSyncStatus: async (): Promise<MercadoPagoSyncStatus> => {
      const response = await httpClient.get("/cron/mercadopago-sync/status");
      const result = response.data;
      if (result) {
        return {
          status: result.status ?? "idle",
          startedAt: result.startedAt,
          finishedAt: result.finishedAt,
          subscriptionsCreated: result.subscriptionsCreated ?? 0,
          subscriptionsUpdated: result.subscriptionsUpdated ?? 0,
          paymentsSaved: result.paymentsSaved ?? 0,
          error: result.error,
        };
      }
      return { status: "idle" };
    },
    reconcileUser: async (
      userId: string
    ): Promise<MercadoPagoReconcileUserResult> => {
      const response = await httpClient.post(
        `/admin/users/${userId}/mercadopago-reconcile`,
        {}
      );
      if (!response.status) {
        const msg =
          (response as { error?: { message?: string } }).error?.message ??
          "Error al reconciliar usuario con MercadoPago";
        return Promise.reject(new Error(msg));
      }
      return response.data as MercadoPagoReconcileUserResult;
    },
  };
};
