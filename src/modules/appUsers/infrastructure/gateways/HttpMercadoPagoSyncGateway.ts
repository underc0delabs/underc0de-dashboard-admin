import { IHttpClient } from "@/modules/httpClient/interfaces";
import { IMercadoPagoSyncGateway } from "../../core/gateways/iMercadoPagoSyncGateway";

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
  };
};
