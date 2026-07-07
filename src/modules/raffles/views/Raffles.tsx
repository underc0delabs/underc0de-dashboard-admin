import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Stack,
  Button,
  Group,
  Switch,
  FileInput,
  Image,
  Drawer,
  Text,
  Badge,
  ScrollArea,
  Table,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column, StatusBadge } from "@/components/common/DataTable";
import { rafflePresenterProvider } from "../infrastructure/presentation/presenterProvider";
import type { IRafflePresenter } from "../core/presentation/iRafflePresenter";
import type {
  IRaffle,
  IRaffleEvent,
  IRaffleFormInput,
  IRaffleParticipant,
} from "../core/entities/iRaffle";
import { useAuth } from "@/context/AuthContext";

const statusLabel: Record<string, string> = {
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
  drawn: "Sorteado",
  completed: "Entregado",
  expired: "Reclamo vencido",
};

const columns: Column<IRaffle>[] = [
  { key: "title", label: "Título" },
  {
    key: "status",
    label: "Estado",
    render: item => (
      <StatusBadge status={statusLabel[item.status] ?? item.status} />
    ),
  },
  {
    key: "participantCount",
    label: "Participantes",
    render: item => item.participantCount ?? 0,
  },
  {
    key: "proOnly",
    label: "PRO",
    render: item => (item.proOnly ? "Sí" : "No"),
  },
  {
    key: "participationDeadline",
    label: "Cierre participación",
    render: item => new Date(item.participationDeadline).toLocaleString(),
  },
];

function RaffleActions({
  item,
  onEdit,
  onDetail,
  presenter,
  isAdmin,
}: {
  item: IRaffle;
  onEdit: (item: IRaffle) => void;
  onDetail: (item: IRaffle) => void;
  presenter: IRafflePresenter;
  isAdmin: boolean;
}) {
  return (
    <Group gap="xs" wrap="wrap">
      <Button size="xs" variant="light" onClick={() => onDetail(item)}>
        Ver
      </Button>
      <Button size="xs" variant="light" onClick={() => onEdit(item)}>
        Editar
      </Button>
      {isAdmin && item.status === "draft" ? (
        <Button size="xs" onClick={() => presenter.publishRaffle(item.id)}>
          Publicar
        </Button>
      ) : null}
      {isAdmin && item.status === "closed" ? (
        <Button size="xs" color="violet" onClick={() => presenter.drawRaffle(item.id)}>
          Sortear
        </Button>
      ) : null}
      {isAdmin && (item.status === "expired" || item.status === "drawn") ? (
        <Button size="xs" color="orange" onClick={() => presenter.redrawRaffle(item.id)}>
          Re-sortear
        </Button>
      ) : null}
      {isAdmin && item.status === "drawn" ? (
        <Button size="xs" color="green" onClick={() => presenter.claimRaffle(item.id)}>
          Entregado
        </Button>
      ) : null}
    </Group>
  );
}

export default function Raffles() {
  const { hasPermission } = useAuth();
  const isAdmin = hasPermission("admin");
  const [raffles, setRaffles] = useState<IRaffle[]>([]);
  const [selected, setSelected] = useState<IRaffle | null>(null);
  const [participants, setParticipants] = useState<IRaffleParticipant[]>([]);
  const [events, setEvents] = useState<IRaffleEvent[]>([]);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [detailOpened, { open: openDetail, close: closeDetail }] =
    useDisclosure(false);

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
        closeModal();
        notifications.show({ title: "OK", message: "Sorteo guardado", color: "green" });
      },
      saveRaffleError: (error: Error) => {
        notifications.show({ title: "Error", message: error.message, color: "red" });
      },
      actionSuccess: (item: IRaffle, message?: string) => {
        setRaffles(prev => prev.map(r => (r.id === item.id ? item : r)));
        setSelected(item);
        notifications.show({
          title: "OK",
          message: message ?? "Acción completada",
          color: "green",
        });
      },
      actionError: (error: Error) => {
        notifications.show({ title: "Error", message: error.message, color: "red" });
      },
      detailSuccess: (
        p: IRaffleParticipant[],
        e: IRaffleEvent[],
      ) => {
        setParticipants(p);
        setEvents(e);
      },
      detailError: (error: Error) => {
        notifications.show({ title: "Error", message: error.message, color: "red" });
      },
    }),
    [closeModal],
  );

  const presenter = rafflePresenterProvider(viewHandlers);

  const form = useForm<IRaffleFormInput>({
    initialValues: {
      title: "",
      description: "",
      participationDeadline: "",
      claimDeadline: "",
      proOnly: false,
      image: null,
      removeImage: false,
    },
  });

  const load = useCallback(() => {
    presenter.loadRaffles();
  }, [presenter]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setSelected(null);
    form.reset();
    openModal();
  };

  const openEdit = (item: IRaffle) => {
    setSelected(item);
    form.setValues({
      title: item.title,
      description: item.description,
      participationDeadline: item.participationDeadline.slice(0, 16),
      claimDeadline: item.claimDeadline.slice(0, 16),
      proOnly: item.proOnly,
      image: null,
      removeImage: false,
    });
    openModal();
  };

  const openItemDetail = (item: IRaffle) => {
    setSelected(item);
    presenter.loadDetail(item.id);
    openDetail();
  };

  const submitForm = () => {
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
        description="Gestioná sorteos, participantes y ganadores"
        action={{ label: "Nuevo sorteo", onClick: openCreate }}
      />

      <DataTable
        data={raffles}
        columns={[
          ...columns,
          {
            key: "actions",
            label: "Acciones",
            render: item => (
              <RaffleActions
                item={item}
                onEdit={openEdit}
                onDetail={openItemDetail}
                presenter={presenter}
                isAdmin={isAdmin}
              />
            ),
          },
        ]}
        canEdit={false}
        canDelete={false}
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selected ? "Editar sorteo" : "Nuevo sorteo"}
        size="lg">
        <Stack>
          <TextInput label="Título" required {...form.getInputProps("title")} />
          <Textarea
            label="Descripción"
            required
            minRows={4}
            {...form.getInputProps("description")}
          />
          <TextInput
            label="Cierre de participación"
            type="datetime-local"
            required
            {...form.getInputProps("participationDeadline")}
          />
          <TextInput
            label="Plazo para reclamar premio"
            type="datetime-local"
            required
            {...form.getInputProps("claimDeadline")}
          />
          <Switch
            label="Solo miembros PRO"
            {...form.getInputProps("proOnly", { type: "checkbox" })}
          />
          {selected?.imageUrl ? (
            <Image src={selected.imageUrl} h={120} fit="contain" radius="md" />
          ) : null}
          <FileInput
            label="Imagen"
            accept="image/*"
            {...form.getInputProps("image")}
          />
          <Group justify="flex-end">
            <Button variant="default" onClick={closeModal}>
              Cancelar
            </Button>
            <Button onClick={submitForm}>Guardar</Button>
          </Group>
        </Stack>
      </Modal>

      <Drawer
        opened={detailOpened}
        onClose={closeDetail}
        title={selected?.title ?? "Detalle"}
        size="lg"
        position="right">
        {selected ? (
          <Stack gap="md">
            <Group gap="xs">
              <Badge>{statusLabel[selected.status]}</Badge>
              {selected.proOnly ? <Badge color="orange">PRO</Badge> : null}
              {selected.winnerDisplayName ? (
                <Text size="sm">Ganador: {selected.winnerDisplayName}</Text>
              ) : null}
            </Group>
            <Text size="sm">{selected.description}</Text>

            <Text fw={600}>Participantes ({participants.length})</Text>
            <ScrollArea h={160}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Usuario</Table.Th>
                    <Table.Th>Fecha</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {participants.map(p => (
                    <Table.Tr key={p.id}>
                      <Table.Td>
                        {p.displayName} (@{p.username})
                      </Table.Td>
                      <Table.Td>
                        {new Date(p.enteredAt).toLocaleString()}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>

            <Text fw={600}>Historial</Text>
            <Stack gap="xs">
              {events.map(e => (
                <Group key={e.id} justify="space-between" wrap="nowrap">
                  <Text size="sm">{e.type}</Text>
                  <Text size="xs" c="dimmed">
                    {new Date(e.createdAt).toLocaleString()}
                  </Text>
                </Group>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Drawer>
    </>
  );
}
