import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Badge, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { FilterBar, FilterOption } from "@/components/common/FilterBar";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { useDependency } from "@/hooks/useDependency";
import { parseHttpClientError } from "@/utils/parseHttpClientError";
import { EventFormModal } from "../components/EventFormModal";
import {
  emptyEventFormInput,
  eventToFormInput,
  IEvent,
  IEventFormInput,
} from "../core/entities/iEvent";
import type { IEventGateway } from "../infrastructure/gateways/HttpEventGateway";

const filters: FilterOption[] = [
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Buscar por título o lugar...",
  },
  {
    key: "visibility",
    label: "Visibilidad",
    type: "select",
    options: [
      { value: "true", label: "Visible en app" },
      { value: "false", label: "Oculto en app" },
    ],
  },
];

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  const [year, month, day] = value.slice(0, 10).split("-");
  if (!year || !month || !day) {
    return value;
  }
  return `${day}/${month}/${year}`;
};

const formatTimeRange = (event: IEvent) => {
  if (event.startTime && event.endTime) {
    return `${event.startTime} – ${event.endTime}`;
  }
  return event.startTime || event.endTime || "—";
};

const columns: Column<IEvent>[] = [
  { key: "title", label: "Título", render: (event) => event.title || "—" },
  { key: "eventType", label: "Tipo", render: (event) => event.eventType || "—" },
  {
    key: "startDate",
    label: "Fechas",
    render: (event) => {
      if (!event.startDate && !event.endDate) {
        return "—";
      }
      if (event.startDate && event.endDate && event.startDate !== event.endDate) {
        return `${formatDate(event.startDate)} – ${formatDate(event.endDate)}`;
      }
      return formatDate(event.startDate ?? event.endDate);
    },
  },
  {
    key: "startTime",
    label: "Horario",
    render: (event) => formatTimeRange(event),
  },
  { key: "place", label: "Lugar", render: (event) => event.place || "—" },
  {
    key: "visibleInApp",
    label: "App",
    render: (event) => (
      <Badge color={event.visibleInApp ? "green" : "gray"} variant="light">
        {event.visibleInApp ? "Visible" : "Oculto"}
      </Badge>
    ),
  },
];

export default function Events() {
  const gateway = useDependency<IEventGateway>("eventGateway");
  const [events, setEvents] = useState<IEvent[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const deletingEventIdRef = useRef<string | null>(null);

  const form = useForm<IEventFormInput>({
    initialValues: emptyEventFormInput(),
  });

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await gateway.list();
      setEvents(rows);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: parseHttpClientError(error, "No se pudieron cargar los eventos"),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  }, [gateway]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const filteredEvents = useMemo(() => {
    const search = filterValues.search?.trim().toLowerCase() ?? "";
    const visibility = filterValues.visibility?.trim() ?? "";

    return events.filter((event) => {
      const matchesSearch =
        !search ||
        [event.title, event.place, event.eventType, event.description]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(search));

      const matchesVisibility =
        !visibility || String(event.visibleInApp) === visibility;

      return matchesSearch && matchesVisibility;
    });
  }, [events, filterValues]);

  const resetForm = () => {
    form.setValues(emptyEventFormInput());
    setImagePreview(null);
    setSelectedEvent(null);
  };

  const handleCreate = () => {
    resetForm();
    openModal();
  };

  const handleEdit = (event: IEvent) => {
    setSelectedEvent(event);
    form.setValues(eventToFormInput(event));
    setImagePreview(event.imageUrl ?? null);
    openModal();
  };

  const handleDelete = (event: IEvent) => {
    deletingEventIdRef.current = event.id;
    setSelectedEvent(event);
    openDeleteModal();
  };

  const handleImageChange = (file: File | null) => {
    form.setFieldValue("image", file);
    form.setFieldValue("removeImage", false);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      return;
    }
    if (selectedEvent?.imageUrl) {
      setImagePreview(selectedEvent.imageUrl);
      return;
    }
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    try {
      const input = form.values;
      const saved = selectedEvent
        ? await gateway.update(selectedEvent.id, input)
        : await gateway.create(input);

      setEvents((prev) => {
        const idx = prev.findIndex((row) => row.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      notifications.show({
        title: selectedEvent ? "Evento actualizado" : "Evento creado",
        message: "Los cambios se guardaron correctamente.",
        color: "green",
      });
      closeModal();
      resetForm();
    } catch (error) {
      notifications.show({
        title: "Error",
        message: parseHttpClientError(error, "No se pudo guardar el evento"),
        color: "red",
      });
    }
  };

  const confirmDelete = async () => {
    const eventId = deletingEventIdRef.current;
    if (!eventId) {
      return;
    }

    try {
      await gateway.remove(eventId);
      setEvents((prev) => prev.filter((row) => row.id !== eventId));
      notifications.show({
        title: "Evento eliminado",
        message: "El evento se eliminó correctamente.",
        color: "green",
      });
      closeDeleteModal();
      deletingEventIdRef.current = null;
      setSelectedEvent(null);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: parseHttpClientError(error, "No se pudo eliminar el evento"),
        color: "red",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Eventos"
        description="Administrá los eventos que verán los usuarios en el calendario de la app."
        action={{ label: "Nuevo evento", onClick: handleCreate }}
      />

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={(key, value) =>
          setFilterValues(prev => ({ ...prev, [key]: value }))
        }
        onClear={() => setFilterValues({})}
      />

      {loading ? (
        <Text c="dimmed" mt="md">
          Cargando eventos...
        </Text>
      ) : (
        <DataTable
          data={filteredEvents}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          emptyMessage="No hay eventos cargados."
        />
      )}

      <EventFormModal
        opened={modalOpened}
        onClose={() => {
          closeModal();
          resetForm();
        }}
        form={form}
        selected={selectedEvent}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={() => {
          closeDeleteModal();
          deletingEventIdRef.current = null;
        }}
        onConfirm={confirmDelete}
        title="Eliminar evento"
        message={`¿Querés eliminar ${selectedEvent?.title || "este evento"}?`}
        confirmLabel="Eliminar"
      />
    </>
  );
}
