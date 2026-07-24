import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconBrandWhatsapp,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { format, startOfMonth } from "date-fns";
import { PageHeader } from "@/components/common/PageHeader";
import { useDependency } from "@/hooks/useDependency";
import { parseHttpClientError } from "@/utils/parseHttpClientError";
import { IUserBirthday } from "../core/entities/iUserBirthday";
import type { IUserBirthdaysGateway } from "../infrastructure/gateways/HttpUserBirthdaysGateway";
import {
  birthdayOccursOnDay,
  formatMonthTitle,
  formatSelectedDayTitle,
  getBirthdaysForDay,
  getMonthGridDays,
  isDayInCurrentMonth,
  isSameDay,
  shiftMonth,
  toDateKey,
} from "../utils/birthdayCalendarUtils";
import { openWhatsAppGreeting } from "../utils/whatsappGreeting";
import classes from "./BirthdayCalendar.module.css";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function BirthdayCalendar() {
  const gateway = useDependency<IUserBirthdaysGateway>("userBirthdaysGateway");

  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [users, setUsers] = useState<IUserBirthday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBirthdays = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await gateway.list();
      setUsers(rows);
    } catch (err) {
      setError(
        parseHttpClientError(err, "No se pudieron cargar los cumpleaños"),
      );
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    loadBirthdays();
  }, [loadBirthdays]);

  const monthDays = useMemo(
    () => getMonthGridDays(currentMonth),
    [currentMonth],
  );

  const selectedDayUsers = useMemo(
    () => getBirthdaysForDay(selectedDate, users),
    [selectedDate, users],
  );

  const handleGreet = (user: IUserBirthday) => {
    const opened = openWhatsAppGreeting(user.phone, user.displayName);
    if (!opened) {
      notifications.show({
        title: "Teléfono no disponible",
        message: `${user.displayName} no tiene un teléfono cargado para WhatsApp.`,
        color: "yellow",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Calendario de cumpleaños"
        description="Visualizá los cumpleaños de los usuarios de la app y saludalos por WhatsApp."
      />

      <Paper p="lg" radius="md" withBorder className={classes.calendarPaper}>
        <Group justify="space-between" mb="md">
          <ActionIcon
            variant="default"
            size="lg"
            aria-label="Mes anterior"
            onClick={() => setCurrentMonth((prev) => shiftMonth(prev, -1))}>
            <IconChevronLeft size={18} />
          </ActionIcon>
          <Text fw={700} tt="capitalize" c="white">
            {formatMonthTitle(currentMonth)}
          </Text>
          <ActionIcon
            variant="default"
            size="lg"
            aria-label="Mes siguiente"
            onClick={() => setCurrentMonth((prev) => shiftMonth(prev, 1))}>
            <IconChevronRight size={18} />
          </ActionIcon>
        </Group>

        <div className={classes.weekdayRow}>
          {WEEKDAYS.map((label) => (
            <Text key={label} className={classes.weekdayLabel}>
              {label}
            </Text>
          ))}
        </div>

        <div className={classes.grid}>
          {monthDays.map((day) => {
            const inMonth = isDayInCurrentMonth(day, currentMonth);
            const selected = isSameDay(day, selectedDate);
            const dayUsers = getBirthdaysForDay(day, users);
            const hasBirthdays = dayUsers.length > 0;

            return (
              <button
                key={toDateKey(day)}
                type="button"
                className={[
                  classes.dayCell,
                  !inMonth ? classes.dayCellMuted : "",
                  selected ? classes.dayCellSelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setSelectedDate(day)}>
                <span className={classes.dayNumber}>{format(day, "d")}</span>
                {hasBirthdays ? (
                  <span className={classes.markerRow}>
                    {dayUsers.slice(0, 3).map((user) => (
                      <span
                        key={user.id}
                        className={classes.markerDot}
                        title={user.displayName}
                      />
                    ))}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </Paper>

      <Paper p="lg" radius="md" withBorder mt="md">
        <Group justify="space-between" mb="md">
          <Stack gap={2}>
            <Text fw={700} c="white">
              Cumpleaños del {formatSelectedDayTitle(selectedDate)}
            </Text>
            <Text size="sm" c="dimmed">
              {selectedDayUsers.length} usuario
              {selectedDayUsers.length === 1 ? "" : "s"}
            </Text>
          </Stack>
          <Badge color="pink" variant="light">
            {users.length} con fecha cargada
          </Badge>
        </Group>

        {loading ? (
          <Text c="dimmed">Cargando cumpleaños...</Text>
        ) : null}

        {error ? (
          <Text c="red" size="sm">
            {error}
          </Text>
        ) : null}

        {!loading && !error && selectedDayUsers.length === 0 ? (
          <Text c="dimmed">No hay cumpleaños para este día.</Text>
        ) : null}

        <Stack gap="sm">
          {selectedDayUsers.map((user) => (
            <Paper key={user.id} p="md" radius="md" withBorder>
              <Group justify="space-between" align="flex-start" wrap="nowrap">
                <Stack gap={4} style={{ minWidth: 0 }}>
                  <Text fw={600} c="white">
                    {user.displayName}
                  </Text>
                  <Text size="sm" c="dimmed">
                    @{user.username}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {user.phone || "Sin teléfono cargado"}
                  </Text>
                </Stack>

                <Tooltip
                  label={
                    user.phone
                      ? "Abrir WhatsApp Web para saludar"
                      : "Este usuario no tiene teléfono"
                  }>
                  <Button
                    leftSection={<IconBrandWhatsapp size={16} />}
                    color="green"
                    variant="light"
                    disabled={!user.phone}
                    onClick={() => handleGreet(user)}>
                    Saludar usuario
                  </Button>
                </Tooltip>
              </Group>
            </Paper>
          ))}
        </Stack>
      </Paper>
    </>
  );
}
