import { HttpResponse } from "@/modules/httpClient/interfaces";

export const parseHttpClientError = (error: unknown, fallback = "Error"): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (error && typeof error === "object") {
    const http = error as HttpResponse;
    if (typeof http.error?.message === "string" && http.error.message.trim()) {
      return http.error.message;
    }
    const dataMsg = (http.data as { msg?: string } | undefined)?.msg;
    if (typeof dataMsg === "string" && dataMsg.trim()) {
      return dataMsg;
    }
  }
  return fallback;
};
