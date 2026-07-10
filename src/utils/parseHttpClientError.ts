import { HttpResponse } from "@/modules/httpClient/interfaces";

const PAYLOAD_TOO_LARGE_MESSAGE =
  "La imagen o el archivo es demasiado grande. Usá una imagen de menos de 1 MB.";

const extractMessageFromData = (data: unknown): string | null => {
  if (typeof data === "string") {
    if (
      data.includes("413") ||
      data.toLowerCase().includes("request entity too large")
    ) {
      return PAYLOAD_TOO_LARGE_MESSAGE;
    }
    const trimmed = data.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed) as { msg?: string };
        if (typeof parsed.msg === "string" && parsed.msg.trim()) {
          return parsed.msg;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  if (data && typeof data === "object") {
    const apiMsg = (data as { msg?: string }).msg;
    if (typeof apiMsg === "string" && apiMsg.trim()) {
      return apiMsg;
    }
  }

  return null;
};

export const parseHttpClientError = (
  error: unknown,
  fallback = "Error",
): string => {
  if (error && typeof error === "object") {
    const http = error as HttpResponse;
    if (http.code === 413) {
      return PAYLOAD_TOO_LARGE_MESSAGE;
    }
    const dataMessage = extractMessageFromData(http.data);
    if (dataMessage) {
      return dataMessage;
    }
    if (typeof http.error?.message === "string" && http.error.message.trim()) {
      const message = http.error.message.trim();
      if (
        message.includes("413") ||
        message.toLowerCase().includes("request entity too large")
      ) {
        return PAYLOAD_TOO_LARGE_MESSAGE;
      }
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    const message = error.message.trim();
    if (
      message.includes("413") ||
      message.toLowerCase().includes("request entity too large")
    ) {
      return PAYLOAD_TOO_LARGE_MESSAGE;
    }
    return message;
  }

  return fallback;
};
