import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, Button, Group, Paper, Stack, Table, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { isoToArgentinaDatetimeLocal } from "@/utils/datetimeLocal";
import { bingoPresenterProvider } from "../infrastructure/presentation/presenterProvider";
import type { IBingoPresenter } from "../core/presentation/iBingoPresenter";
import type {
  IBingoDrawResult,
  IBingoEvent,
  IBingoEventDetail,
  IBingoEventFormInput,
  IBingoParticipantEntry,
} from "../core/entities/iBingo";
import { BingoEventFormModal } from "../components/BingoEventFormModal";
import { BingoStandsManager } from "../components/BingoStandsManager";
import { BingoParticipantsDrawer } from "../components/BingoParticipantsDrawer";
import { BingoDrawPanel } from "../components/BingoDrawPanel";
import { BingoEventMetricsPanel } from "../components/BingoEventMetricsPanel";
import { resolveEventMetrics } from "../core/entities/iBingo";

const statusColor: Record<string, string> = {
  draft: "gray",
  active: "blue",
  closed: "orange",
};

const statusLabel: Record<string, string> = {
  draft: "Borrador",
  active: "Activo",
  closed: "Inactivo",
};

const toInputValue = (value: string | null | undefined) => isoToArgentinaDatetimeLocal(value);

const buildEventFormInput = (
  values: IBingoEventFormInput,
  editingEvent: IBingoEvent | null,
): IBingoEventFormInput => {
  const input: IBingoEventFormInput = {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
  };

  if (values.startDate) {
    input.startDate = values.startDate;
  } else if (!editingEvent) {
    input.startDate = null;
  }

  if (values.endDate) {
    input.endDate = values.endDate;
  } else if (!editingEvent) {
    input.endDate = null;
  }

  return input;
};

export default function Bingo() {
  const [events, setEvents] = useState<IBingoEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IBingoEventDetail | null>(null);
  const [participants, setParticipants] = useState<IBingoParticipantEntry[]>([]);
  const [lastDraw, setLastDraw] = useState<IBingoDrawResult | null>(null);
  const [editingEvent, setEditingEvent] = useState<IBingoEvent | null>(null);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [participantsOpened, { open: openParticipants, close: closeParticipants }] =
    useDisclosure(false);
  const presenterRef = useRef<IBingoPresenter | null>(null);

  const viewHandlers = useMemo(
    () => ({
      listEventsSuccess: (items: IBingoEvent[]) => setEvents(items),
      listEventsError: (error: Error) =>
        notifications.show({ title: "Error", message: error.message, color: "red" }),
      eventDetailSuccess: (item: IBingoEventDetail) => {
        setSelectedEvent(item);
        setEvents(prev =>
          prev.map(event => (event.id === item.id ? { ...event, ...item } : event)),
        );
      },
      eventDetailError: (error: Error) =>
        notifications.show({ title: "Error", message: error.message, color: "red" }),
      saveEventSuccess: (item: IBingoEvent, message?: string) => {
        setEvents(prev => {
          const idx = prev.findIndex(e => e.id === item.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = item;
            return next;
          }
          return [item, ...prev];
        });
        setSelectedEvent(prev => {
          if (prev?.id === item.id) {
            presenterRef.current?.loadEventDetail(item.id);
            return { ...prev, ...item };
          }
          return prev;
        });
        closeModal();
        notifications.show({ title: "OK", message: message ?? "Guardado", color: "green" });
      },
      saveEventError: (error: Error) =>
        notifications.show({ title: "Error", message: error.message, color: "red" }),
      removeEventSuccess: (id: string, message?: string) => {
        setEvents(prev => prev.filter(e => e.id !== id));
        setSelectedEvent(prev => (prev?.id === id ? null : prev));
        notifications.show({ title: "OK", message: message ?? "Eliminado", color: "green" });
      },
      standSaved: item => {
        setSelectedEvent(prev => {
          if (!prev) return prev;
          const idx = prev.stands.findIndex(s => s.id === item.id);
          const stands = idx >= 0
            ? prev.stands.map(s => (s.id === item.id ? item : s))
            : [...prev.stands, item];
          presenterRef.current?.loadEventDetail(prev.id);
          return { ...prev, stands, standCount: stands.length };
        });
      },
      standError: (error: Error) =>
        notifications.show({ title: "Error", message: error.message, color: "red" }),
      standRemoved: (id: string) => {
        setSelectedEvent(prev => {
          if (!prev) return prev;
          const stands = prev.stands.filter(s => s.id !== id);
          presenterRef.current?.loadEventDetail(prev.id);
          return { ...prev, stands, standCount: stands.length };
        });
      },
      participantsSuccess: (items: IBingoParticipantEntry[]) => setParticipants(items),
      participantsError: (error: Error) =>
        notifications.show({ title: "Error", message: error.message, color: "red" }),
      drawSuccess: (result: IBingoDrawResult) => {
        setLastDraw(result);
        setSelectedEvent(prev => {
          if (prev?.id) {
            presenterRef.current?.loadEventDetail(prev.id);
          }
          return prev;
        });
        notifications.show({ title: "Ganador sorteado", message: result.winnerName, color: "green" });
      },
      drawError: (error: Error) =>
        notifications.show({ title: "Error", message: error.message, color: "red" }),
    }),
    [closeModal],
  );

  const presenter = bingoPresenterProvider(viewHandlers);
  presenterRef.current = presenter;

  useEffect(() => {
    presenterRef.current?.loadEvents();
  }, []);

  const form = useForm<IBingoEventFormInput>({
    initialValues: { name: "", description: "", startDate: "", endDate: "" },
    validate: {
      name: value => (!value?.trim() ? "El nombre es requerido" : null),
    },
  });

  const handleCreate = () => {
    setEditingEvent(null);
    form.reset();
    openModal();
  };

  const handleEdit = (event: IBingoEvent) => {
    setEditingEvent(event);
    form.setValues({
      name: event.name,
      description: event.description ?? "",
      startDate: toInputValue(event.startDate),
      endDate: toInputValue(event.endDate),
    });
    openModal();
  };

  const handleSubmit = () => {
    const validation = form.validate();
    if (validation.hasErrors) return;
    const input = buildEventFormInput(form.values, editingEvent);
    if (editingEvent) {
      presenter.updateEvent(editingEvent.id, input);
    } else {
      presenter.createEvent(input);
    }
  };

  const handleManage = (event: IBingoEvent) => {
    setLastDraw(null);
    presenter.loadEventDetail(event.id);
  };

  const handleViewParticipants = () => {
    if (!selectedEvent) return;
    presenter.loadParticipants(selectedEvent.id);
    openParticipants();
  };

  const selectedMetrics = selectedEvent ? resolveEventMetrics(selectedEvent) : null;
  const eligibleCount = selectedMetrics?.raffleEligibleCount ?? 0;

  const formatPercent = (value: number) =>
    `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;

  return (
    <Stack gap="lg">
      <PageHeader
        title="Bingo"
        description="Gestioná eventos, stands y sorteos"
        action={{ label: "Nuevo evento", onClick: handleCreate }}
      />

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Nombre</Table.Th>
            <Table.Th>Estado</Table.Th>
            <Table.Th>Stands</Table.Th>
            <Table.Th>Participantes</Table.Th>
            <Table.Th>Completaron</Table.Th>
            <Table.Th>Check-ins</Table.Th>
            <Table.Th>Progreso</Table.Th>
            <Table.Th>Acciones</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map(event => {
            const metrics = resolveEventMetrics(event);
            return (
            <Table.Tr key={event.id}>
              <Table.Td>{event.name}</Table.Td>
              <Table.Td>
                <Badge color={statusColor[event.status] ?? "gray"} variant="light">
                  {statusLabel[event.status] ?? event.status}
                </Badge>
              </Table.Td>
              <Table.Td>{event.standCount}</Table.Td>
              <Table.Td>{metrics.participantCount}</Table.Td>
              <Table.Td>
                {metrics.completedCount}
                {metrics.participantCount > 0 ? ` (${formatPercent(metrics.completionRate)})` : ""}
              </Table.Td>
              <Table.Td>{metrics.totalCheckins}</Table.Td>
              <Table.Td>{formatPercent(metrics.averageProgressPercent)}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Button size="xs" variant="light" color="blue" onClick={() => handleManage(event)}>
                    Gestionar
                  </Button>
                  <Button size="xs" variant="light" color="gray" onClick={() => handleEdit(event)}>
                    Editar
                  </Button>
                  {event.status === "draft" ? (
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      onClick={() => presenter.activateEvent(event.id)}
                    >
                      Activar
                    </Button>
                  ) : null}
                  {event.status === "closed" ? (
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      onClick={() => presenter.reactivateEvent(event.id)}
                    >
                      Reactivar
                    </Button>
                  ) : null}
                  {event.status === "active" ? (
                    <Button
                      size="xs"
                      variant="light"
                      color="orange"
                      onClick={() => presenter.closeEvent(event.id)}
                    >
                      Desactivar
                    </Button>
                  ) : null}
                  {event.status === "draft" ? (
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => presenter.deleteEvent(event.id)}
                    >
                      Eliminar
                    </Button>
                  ) : null}
                </Group>
              </Table.Td>
            </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>

      {selectedEvent ? (
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Group justify="space-between" wrap="wrap">
              <Group gap="sm">
                <Text fw={600} size="lg">
                  {selectedEvent.name}
                </Text>
                <Badge color={statusColor[selectedEvent.status] ?? "gray"} variant="light">
                  {statusLabel[selectedEvent.status] ?? selectedEvent.status}
                </Badge>
              </Group>
              <Group gap="xs">
                <Button size="xs" variant="light" color="blue" onClick={handleViewParticipants}>
                  Ver participantes
                </Button>
                {selectedEvent.status === "draft" ? (
                  <Button
                    size="xs"
                    variant="light"
                    color="green"
                    onClick={() => presenter.activateEvent(selectedEvent.id)}
                  >
                    Activar evento
                  </Button>
                ) : null}
                {selectedEvent.status === "closed" ? (
                  <Button
                    size="xs"
                    variant="light"
                    color="green"
                    onClick={() => presenter.reactivateEvent(selectedEvent.id)}
                  >
                    Reactivar evento
                  </Button>
                ) : null}
                {selectedEvent.status === "active" ? (
                  <Button
                    size="xs"
                    variant="light"
                    color="orange"
                    onClick={() => presenter.closeEvent(selectedEvent.id)}
                  >
                    Desactivar evento
                  </Button>
                ) : null}
                <Button size="xs" variant="default" onClick={() => setSelectedEvent(null)}>
                  Cerrar panel
                </Button>
              </Group>
            </Group>

            {selectedMetrics ? (
              <BingoEventMetricsPanel
                metrics={selectedMetrics}
                standCount={selectedEvent.standCount}
                showStandBreakdown
              />
            ) : null}

            <BingoStandsManager
              stands={selectedEvent.stands}
              onAdd={(label, merchantId) =>
                presenter.createStand(selectedEvent.id, { label, merchantId })
              }
              onDelete={standId => presenter.deleteStand(selectedEvent.id, standId)}
            />

            <BingoDrawPanel
              eligibleCount={eligibleCount}
              lastResult={lastDraw}
              onDraw={() => presenter.draw(selectedEvent.id)}
            />
          </Stack>
        </Paper>
      ) : null}

      <BingoParticipantsDrawer
        opened={participantsOpened}
        onClose={closeParticipants}
        standCount={selectedEvent?.stands.length ?? 0}
        participants={participants}
      />

      <BingoEventFormModal
        opened={modalOpened}
        onClose={closeModal}
        form={form}
        selected={editingEvent}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
