export const buildWhatsAppGreetingUrl = (
  phone: string | null | undefined,
  displayName: string,
): string | null => {
  if (!phone?.trim()) {
    return null;
  }

  let digits = phone.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  if (digits.startsWith("0")) {
    digits = digits.replace(/^0+/, "");
  }

  if (digits.length === 10 && !digits.startsWith("54")) {
    digits = `549${digits}`;
  } else if (digits.length === 11 && digits.startsWith("15")) {
    digits = `549${digits.slice(2)}`;
  } else if (
    digits.length >= 12 &&
    digits.startsWith("54") &&
    !digits.startsWith("549") &&
    digits.charAt(2) !== "9"
  ) {
    digits = `549${digits.slice(2)}`;
  }

  const message = encodeURIComponent(
    `¡Feliz cumpleaños, ${displayName}! 🎉 Te deseo un excelente día.`,
  );

  return `https://wa.me/${digits}?text=${message}`;
};

export const openWhatsAppGreeting = (
  phone: string | null | undefined,
  displayName: string,
): boolean => {
  const url = buildWhatsAppGreetingUrl(phone, displayName);
  if (!url) {
    return false;
  }
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
};
