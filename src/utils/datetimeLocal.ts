export const isoToArgentinaDatetimeLocal = (value: string | Date | null | undefined): string => {
  if (value == null || value === "") {
    return "";
  }

  const iso = value instanceof Date ? value.toISOString() : String(value);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso.length >= 16 ? iso.slice(0, 16) : "";
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

export const argentinaDatetimeLocalToIso = (localValue: string): string | null => {
  const trimmed = localValue.trim();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) {
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }

  const [, year, month, day, hour, minute] = match;
  const utcGuess = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  for (let offsetHours = -3; offsetHours <= 3; offsetHours += 1) {
    const candidate = new Date(utcGuess + offsetHours * 60 * 60 * 1000);
    const parts = formatter.formatToParts(candidate);
    const read = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find(part => part.type === type)?.value ?? "";

    const candidateLocal = `${read("year")}-${read("month")}-${read("day")}T${read("hour")}:${read("minute")}`;
    if (candidateLocal === trimmed) {
      return candidate.toISOString();
    }
  }

  return new Date(trimmed).toISOString();
};
