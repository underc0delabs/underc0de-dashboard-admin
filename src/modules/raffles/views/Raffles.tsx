import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  Group,
  Paper,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle } from "@tabler/icons-react";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { FilterBar, FilterOption } from "@/components/common/FilterBar";
import { resolveFileUrl } from "@/utils/resolveFileUrl";
import { rafflePresenterProvider } from "../infrastructure/presentation/presenterProvider";
import type { IRafflePresenter } from "../core/presentation/iRafflePresenter";
import type {
  IRaffle,
  IRaffleEvent,
  IRaffleFormInput,
  IRaffleParticipant,
} from "../core/entities/iRaffle";
import { useAuth } from "@/context/AuthContext";
import { isoToArgentinaDatetimeLocal } from "../utils/raffleDateTime";

const MAX_RAFFLE_IMAGE_SIZE_BYTES = 900 * 1024;
import {
  ConfirmAction,
  canDeleteRaffle,
  canEditRaffle,
  countByFilter,
  formatDateTime,
  getDeleteBlockedReason,
  getNextActionSummary,
  listFilterOptions,
  matchesListFilter,
  needsAdminAction,
  statusColor,
  statusLabel,
  type RaffleListFilter,
} from "../utils/raffleWorkflow";
import { RaffleConfirmModal } from "../components/RaffleConfirmModal";
import { RaffleDetailDrawer } from "../components/RaffleDetailDrawer";
import { RaffleFormModal } from "../components/RaffleFormModal";
import { RaffleProcessGuide } from "../components/RaffleProcessGuide";

const filterBarOptions: FilterOption[] = [
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Buscar por título...",
  },
];

function RaffleStatusBadge({ item }: { item: IRaffle }) {
  return (
    <Badge color={statusColor[item.status] ?? "gray"} variant="light" size="sm">
      {statusLabel[item.status] ?? item.status}
    </Badge>
  );
}

export default function Raffles() {
  const { hasPermission } = useAuth();
  const canManageRaffleWorkflow =
    hasPermission("admin") || hasPermission("editor");
  const [raffles, setRaffles] = useState<IRaffle[]>([]);
  const [selected, setSelected] = useState<IRaffle | null>(null);
  const [participants, setParticipants] = useState<IRaffleParticipant[]>([]);
  const [events, setEvents] = useState<IRaffleEvent[]>([]);
  const [listFilter, setListFilter] = useState<RaffleListFilter>("all");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const presenterRef = useRef<IRafflePresenter | null>(null);

  const viewHandlers = useMemo(
    () => ({
      listRafflesSuccess: (items: IRaffle[]) => setRaffles(items),
      listRafflesError: (error: Error) => {
        notifications.show({ title: "Error", message: error.message, color: "red" });
      },
      saveRaffleSuccess: (item: IRaffle) => {
        setRaffles(prev => {
          const idx = prev.findIndex(r => r.id === item.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = item;
            return next;
          }
          return [item, ...prev];
        });
        setSelected(prev => (prev?.id === item.id ? item : prev));
        closeModal();
        notifications.show({
          title: "Sorteo guardado",
          message: item.status === "draft"
            ? "Abrí el detalle para publicarlo en la app."
            : "Los cambios se aplicaron correctamente.",
          color: "green",
        });
      },
      saveRaffleError: (error: Error) => {
        notifications.show({ title: "Error", message: error.message, color: "red" });
      },
      actionSuccess: (item: IRaffle, message?: string) => {
        setActionLoading(false);
        setRaffles(prev => {
          const idx = prev.findIndex(r => r.id === item.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = item;
            return next;
          }
          return [item, ...prev];
        });
        setSelected(prev => {
          if (prev?.id === item.id) {
            return item;
          }
          return prev;
        });
        notifications.show({
          title: "OK",
          message: message ?? "Acción completada",
          color: "green",
        });
      },
      actionError: (error: Error) => {
        setActionLoading(false);
        notifications.show({ title: "Error", message: error.message, color: "red" });
      },
      removeRaffleSuccess: (id: string, message?: string) => {
        setActionLoading(false);
        setRaffles(prev => prev.filter(r => r.id !== id));
        setSelected(null);
        closeDetail();
        notifications.show({
          title: "OK",
          message: message ?? "Sorteo eliminado",
          color: "green",
        });
      },
      detailSuccess: (
        item: IRaffle,
        p: IRaffleParticipant[],
        e: IRaffleEvent[],
      ) => {
        setDetailLoading(false);
        setSelected(item);
        setRaffles(prev => prev.map(r => (r.id === item.id ? item : r)));
        setParticipants(p);
        setEvents(e);
      },
      detailError: (error: Error) => {
        setDetailLoading(false);
        notifications.show({ title: "Error", message: error.message, color: "red" });
      },
    }),
    [closeModal, closeDetail],
  );

  const presenter = rafflePresenterProvider(viewHandlers);
  presenterRef.current = presenter;

  const form = useForm<IRaffleFormInput>({
    initialValues: {
      title: "",
      description: "",
      participationDeadline: "",
      claimDeadline: "",
      proOnly: false,
      allowedCountry: "",
      allowedProvince: "",
      image: null,
      removeImage: false,
    },
    validate: {
      title: value => (!value?.trim() ? "El título es requerido" : null),
      description: value =>
        !value?.trim() ? "La descripción es requerida" : null,
      participationDeadline: value => {
        if (!value) {
          return "Ingresá fecha y hora de cierre de participación";
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return "Fecha u hora de participación inválida";
        }
        return null;
      },
      claimDeadline: (value, values) => {
        if (!value) {
          return "Ingresá fecha y hora límite para reclamar el premio";
        }
        const claimDate = new Date(value);
        if (Number.isNaN(claimDate.getTime())) {
          return "Fecha u hora de reclamo inválida";
        }
        if (values.participationDeadline) {
          const participationDate = new Date(values.participationDeadline);
          if (
            !Number.isNaN(participationDate.getTime()) &&
            claimDate < participationDate
          ) {
            return "El reclamo debe ser posterior al cierre de participación";
          }
        }
        return null;
      },
    },
  });

  const load = useCallback(() => {
    presenter.loadRaffles();
  }, [presenter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      presenterRef.current?.loadRaffles();
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const filteredRaffles = useMemo(() => {
    const search = filterValues.search?.trim().toLowerCase() ?? "";
    return raffles.filter(item => {
      if (!matchesListFilter(item, listFilter)) {
        return false;
      }
      if (!search) {
        return true;
      }
      return item.title.toLowerCase().includes(search);
    });
  }, [raffles, listFilter, filterValues.search]);

  const actionRequiredCount = useMemo(
    () => countByFilter(raffles, "needs_action"),
    [raffles],
  );

  const columns: Column<IRaffle>[] = useMemo(
    () => [
      { key: "title", label: "Título" },
      {
        key: "status",
        label: "Estado",
        render: item => <RaffleStatusBadge item={item} />,
      },
      {
        key: "nextAction",
        label: "Próximo paso",
        render: item => (
          <Group gap={6} wrap="nowrap">
            {needsAdminAction(item) ? (
              <IconAlertCircle size={14} color="var(--mantine-color-yellow-5)" />
            ) : null}
            <Text size="sm">{getNextActionSummary(item)}</Text>
          </Group>
        ),
      },
      {
        key: "participantCount",
        label: "Participantes",
        render: item => item.participantCount ?? 0,
      },
      {
        key: "visibleInApp",
        label: "App",
        render: item =>
          item.visibleInApp === false ? (
            <Badge color="gray" variant="outline" size="sm">
              Oculto
            </Badge>
          ) : (
            <Badge color="teal" variant="light" size="sm">
              Visible
            </Badge>
          ),
      },
      {
        key: "proOnly",
        label: "Alcance",
        render: item =>
          item.proOnly ? (
            <Badge color="orange" variant="light" size="sm">
              Solo PRO
            </Badge>
          ) : (
            <Text size="sm">Todos</Text>
          ),
      },
      {
        key: "participationDeadline",
        label: "Cierre participación",
        render: item => formatDateTime(item.participationDeadline),
      },
    ],
    [],
  );

  const openCreate = () => {
    setSelected(null);
    setImagePreview(null);
    form.reset();
    openModal();
  };

  const openEdit = (item: IRaffle) => {
    if (item.status !== "draft" && item.status !== "published") {
      notifications.show({
        title: "No editable",
        message: "Solo podés editar sorteos en borrador o publicados.",
        color: "yellow",
      });
      return;
    }
    setSelected(item);
    setImagePreview(resolveFileUrl(item.imageUrl));
    form.setValues({
      title: item.title,
      description: item.description,
      participationDeadline: isoToArgentinaDatetimeLocal(item.participationDeadline),
      claimDeadline: isoToArgentinaDatetimeLocal(item.claimDeadline),
      proOnly: item.proOnly,
      allowedCountry: item.allowedCountry ?? "",
      allowedProvince: item.allowedProvince ?? "",
      image: null,
      removeImage: false,
    });
    closeDetail();
    openModal();
  };

  const handleImageChange = (file: File | null) => {
    if (file && file.size > MAX_RAFFLE_IMAGE_SIZE_BYTES) {
      notifications.show({
        title: "Imagen muy pesada",
        message:
          "La imagen no puede superar 900 KB. Comprimila o elegí otra más liviana.",
        color: "red",
      });
      form.setFieldValue("image", null);
      setImagePreview(selected ? resolveFileUrl(selected.imageUrl) : null);
      return;
    }

    form.setFieldValue("image", file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      return;
    }
    setImagePreview(selected ? resolveFileUrl(selected.imageUrl) : null);
  };

  const openItemDetail = (item: IRaffle) => {
    setSelected(item);
    setDetailLoading(true);
    setParticipants([]);
    setEvents([]);
    openDetail();
    presenter.loadDetail(item.id);
  };

  const requestDuplicate = (item: IRaffle) => {
    setSelected(item);
    setConfirmAction("duplicate");
  };

  const requestDelete = (item: IRaffle) => {
    setSelected(item);
    setConfirmAction("delete");
  };

  const handleToggleVisibleInApp = (item: IRaffle, visibleInApp: boolean) => {
    setActionLoading(true);
    presenter.setRaffleVisibility(item.id, visibleInApp);
  };

  const runConfirmedAction = () => {
    if (!selected || !confirmAction) {
      return;
    }
    setActionLoading(true);
    setConfirmAction(null);

    switch (confirmAction) {
      case "publish":
        presenter.publishRaffle(selected.id);
        break;
      case "close":
        presenter.closeRaffle(selected.id);
        break;
      case "draw":
        presenter.drawRaffle(selected.id);
        break;
      case "redraw":
        presenter.redrawRaffle(selected.id);
        break;
      case "claim":
        presenter.claimRaffle(selected.id);
        break;
      case "duplicate":
        presenter.duplicateRaffle(selected.id);
        break;
      case "delete":
        presenter.deleteRaffle(selected.id);
        break;
      default:
        setActionLoading(false);
    }
  };

  const submitForm = () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      const firstError = Object.values(validation.errors).find(
        message => typeof message === "string" && message.trim().length > 0,
      );
      notifications.show({
        title: "Revisá el formulario",
        message: firstError ?? "Completá los campos requeridos",
        color: "red",
      });
      return;
    }

    const values = form.values;
    if (selected) {
      presenter.updateRaffle(selected.id, values);
      return;
    }
    presenter.createRaffle(values);
  };

  return (
    <>
      <PageHeader
        title="Sorteos"
        description="Creá sorteos, publicalos en la app y registrá la entrega del premio. Al cerrar la participación, el ganador se sortea automáticamente."
        action={{ label: "Nuevo sorteo", onClick: openCreate }}
      />

      <RaffleProcessGuide />

      {actionRequiredCount > 0 ? (
        <Paper withBorder p="sm" radius="md" mb="md" bg="yellow.9">
          <Group gap="xs">
            <IconAlertCircle size={18} />
            <Text size="sm">
              {actionRequiredCount} {actionRequiredCount === 1 ? " sorteo " : " sorteos "} requieren tu acción. Filtrá por
              &quot;Requieren acción&quot; para verlos.
            </Text>
          </Group>
        </Paper>
      ) : null}

      <SegmentedControl
        mb="md"
        value={listFilter}
        onChange={value => setListFilter(value as RaffleListFilter)}
        data={listFilterOptions.map(option => ({
          value: option.value,
          label: `${option.label} (${countByFilter(raffles, option.value)})`,
        }))}
      />

      <FilterBar
        filters={filterBarOptions}
        values={filterValues}
        onChange={(key, value) =>
          setFilterValues(prev => ({ ...prev, [key]: value }))
        }
        onClear={() => setFilterValues({})}
      />

      <DataTable
        data={filteredRaffles}
        columns={columns}
        onView={openItemDetail}
        onEdit={openEdit}
        onDuplicate={requestDuplicate}
        onDelete={requestDelete}
        canEditItem={canEditRaffle}
        canDeleteItem={canDeleteRaffle}
        editDisabledReason={item =>
          canEditRaffle(item)
            ? undefined
            : "Solo podés editar sorteos en borrador o publicados."
        }
        deleteDisabledReason={item => getDeleteBlockedReason(item) ?? undefined}
        emptyMessage={
          listFilter === "all" && !filterValues.search
            ? "No hay sorteos creados. Empezá con «Nuevo sorteo»."
            : "No hay sorteos que coincidan con el filtro."
        }
      />

      <RaffleFormModal
        opened={modalOpened}
        onClose={closeModal}
        form={form}
        selected={selected}
        imagePreview={imagePreview}
        onImageChange={handleImageChange}
        onSubmit={submitForm}
      />

      <RaffleDetailDrawer
        opened={detailOpened}
        onClose={closeDetail}
        selected={selected}
        participants={participants}
        events={events}
        detailLoading={detailLoading}
        isAdmin={canManageRaffleWorkflow}
        actionLoading={actionLoading}
        onEdit={openEdit}
        onConfirmAction={setConfirmAction}
        onToggleVisibleInApp={handleToggleVisibleInApp}
      />

      <RaffleConfirmModal
        action={confirmAction}
        selected={selected}
        loading={actionLoading}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
      />
    </>
  );
}
