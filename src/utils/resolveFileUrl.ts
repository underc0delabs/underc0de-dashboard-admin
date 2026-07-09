const getAssetBaseUrl = (): string => {
  const apiBase = String(
    (import.meta as { env?: { VITE_API_BASE_URL?: string } }).env
      ?.VITE_API_BASE_URL ?? "",
  ).replace(/\/$/, "");
  if (!apiBase) {
    return "";
  }
  return apiBase.replace(/\/api\/v1\/?$/, "");
};

export const normalizeUploadPath = (
  filePath: string | null | undefined,
): string | null => {
  if (!filePath) {
    return null;
  }

  const raw = String(filePath).trim();
  if (!raw) {
    return null;
  }

  if (raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }

  const uploadsIndex = raw.indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return raw.slice(uploadsIndex);
  }

  if (raw.startsWith("uploads/")) {
    return `/${raw}`;
  }

  return raw.startsWith("/") ? raw : `/${raw}`;
};

export const resolveFileUrl = (
  filePath: string | null | undefined,
): string | null => {
  if (!filePath) {
    return null;
  }

  const uploadPath = normalizeUploadPath(filePath);
  if (!uploadPath) {
    return null;
  }

  if (uploadPath.startsWith("data:") || uploadPath.startsWith("blob:")) {
    return uploadPath;
  }

  const baseUrl = getAssetBaseUrl();
  if (!baseUrl) {
    return uploadPath;
  }

  return `${baseUrl}${uploadPath}`;
};
