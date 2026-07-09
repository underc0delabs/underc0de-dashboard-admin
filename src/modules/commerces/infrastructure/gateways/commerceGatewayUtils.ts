import { resolveFileUrl } from "@/utils/resolveFileUrl";
import { ICommerce } from "../../core/entities/iCommerce";

export const isUploadableLogo = (value: unknown): value is File =>
  typeof File !== "undefined" &&
  value instanceof File &&
  value.size > 0;

export const mapCommerceLogo = <T extends { logo?: string | null }>(
  commerce: T,
): T => ({
  ...commerce,
  logo: resolveFileUrl(commerce.logo) ?? undefined,
});

export const appendCommerceLogoFields = (
  formData: FormData,
  commerce: Partial<ICommerce> & { logo?: File | null; removeLogo?: boolean },
) => {
  if (isUploadableLogo(commerce.logo)) {
    formData.append("logo", commerce.logo, commerce.logo.name);
  }
  if (commerce.removeLogo) {
    formData.append("removeLogo", "true");
  }
};
