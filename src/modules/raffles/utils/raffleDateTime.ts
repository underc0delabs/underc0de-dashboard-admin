export const isoToArgentinaDatetimeLocal = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.slice(0, 16);
  }

  const formatted = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);

  return formatted.replace(" ", "T");
};

export const isParticipationDeadlinePassed = (
  participationDeadline: string,
  nowMs = Date.now(),
): boolean => {
  const date = new Date(participationDeadline);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  return date.getTime() <= nowMs;
};
