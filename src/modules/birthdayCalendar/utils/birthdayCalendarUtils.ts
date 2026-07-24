import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isValid,
  parse,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { es } from "date-fns/locale";
import { IUserBirthday } from "../core/entities/iUserBirthday";

export const toDateKey = (date: Date): string => format(date, "yyyy-MM-dd");

export const parseBirthdayDate = (value?: string | null): Date | null => {
  if (!value?.trim()) {
    return null;
  }

  const trimmed = value.trim();
  const iso = parseISO(trimmed.slice(0, 10));
  if (isValid(iso)) {
    return iso;
  }

  const dayFirst = parse(trimmed, "dd/MM/yyyy", new Date());
  if (isValid(dayFirst)) {
    return dayFirst;
  }

  const fallback = new Date(trimmed);
  return isValid(fallback) ? fallback : null;
};

export const birthdayOccursOnDay = (
  user: IUserBirthday,
  day: Date,
): boolean => {
  const parsed = parseBirthdayDate(user.birthday);
  if (!parsed) {
    return false;
  }
  return (
    parsed.getDate() === day.getDate() &&
    parsed.getMonth() === day.getMonth()
  );
};

export const getMonthGridDays = (month: Date): Date[] => {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
};

export const formatMonthTitle = (month: Date): string =>
  format(month, "MMMM yyyy", { locale: es });

export const shiftMonth = (month: Date, delta: number): Date =>
  addMonths(startOfMonth(month), delta);

export const isDayInCurrentMonth = (day: Date, month: Date): boolean =>
  isSameMonth(day, month);

export const getBirthdaysForDay = (
  day: Date,
  users: IUserBirthday[],
): IUserBirthday[] =>
  users.filter((user) => birthdayOccursOnDay(user, day));

export const formatSelectedDayTitle = (day: Date): string =>
  format(day, "dd/MM/yyyy");

export { isSameDay };
