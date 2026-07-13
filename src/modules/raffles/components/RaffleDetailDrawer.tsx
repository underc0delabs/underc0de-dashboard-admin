import {
  Badge,
  Drawer,
  Group,
  Image,
  Loader,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  ThemeIcon,
  Timeline,
} from "@mantine/core";
import { IconClock, IconTicket, IconUsers } from "@tabler/icons-react";
import { resolveFileUrl } from "@/utils/resolveFileUrl";
import type {
  IRaffle,
  IRaffleEvent,
  IRaffleParticipant,
} from "../core/entities/iRaffle";
import {
  ConfirmAction,
  eventTypeLabel,
  formatDateTime,
  getRafflePhaseLabel,
  isParticipationDeadlinePassedForItem,
  statusColor,
} from "../utils/raffleWorkflow";
import { RaffleWorkflowPanel } from "./RaffleWorkflowPanel";

type RaffleDetailDrawerProps = {
  opened: boolean;
  onClose: () => void;
  selected: IRaffle | null;
  participants: IRaffleParticipant[];
  events: IRaffleEvent[];
  detailLoading: boolean;
  isAdmin: boolean;
  actionLoading: boolean;
  onEdit: (item: IRaffle) => void;
  onConfirmAction: (action: ConfirmAction) => void;
  onToggleVisibleInApp: (item: IRaffle, visibleInApp: boolean) => void;
};

function RaffleStatusBadge({ item }: { item: IRaffle }) {
  return (
    <Badge color={statusColor[item.status] ?? "gray"} variant="light" size="sm">
      {getRafflePhaseLabel(item)}
    </Badge>
  );
}

export function RaffleDetailDrawer({
  opened,
  onClose,
  selected,
  participants,
  events,
  detailLoading,
  isAdmin,
  actionLoading,
  onEdit,
  onConfirmAction,
  onToggleVisibleInApp,
}: RaffleDetailDrawerProps) {
  if (!selected) {
    return null;
  }

  const participationOpen =
    selected.participationOpen === true ||
    (selected.status === "published" &&
      selected.participationOpen !== false &&
      !isParticipationDeadlinePassedForItem(selected));

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={selected.title}
      size="xl"
      position="right">
      <Stack gap="md">
        <Group gap="xs">
          <RaffleStatusBadge item={selected} />
          {selected.proOnly ? (
            <Badge color="orange" variant="light">
              Solo PRO
            </Badge>
          ) : (
            <Badge color="gray" variant="light">
              Todos los usuarios
            </Badge>
          )}
          {selected.status === "published" ? (
            <Badge
              color={participationOpen ? "green" : "yellow"}
              variant="light">
              {participationOpen ? "Participación abierta" : "Participación cerrada"}
            </Badge>
          ) : null}
          {selected.visibleInApp === false ? (
            <Badge color="gray" variant="filled">
              Oculto en app
            </Badge>
          ) : null}
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
          <Paper withBorder p="sm" radius="md">
            <Group gap="xs">
              <ThemeIcon variant="light" color="cyan" size="md">
                <IconUsers size={16} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Participantes
                </Text>
                <Text fw={700}>{selected.participantCount ?? 0}</Text>
              </Stack>
            </Group>
          </Paper>
          <Paper withBorder p="sm" radius="md">
            <Group gap="xs">
              <ThemeIcon variant="light" color="blue" size="md">
                <IconClock size={16} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Cierre participación
                </Text>
                <Text size="sm" fw={600}>
                  {formatDateTime(selected.participationDeadline)}
                </Text>
              </Stack>
            </Group>
          </Paper>
          <Paper withBorder p="sm" radius="md">
            <Group gap="xs">
              <ThemeIcon variant="light" color="violet" size="md">
                <IconTicket size={16} />
              </ThemeIcon>
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Plazo reclamo
                </Text>
                <Text size="sm" fw={600}>
                  {formatDateTime(selected.claimDeadline)}
                </Text>
              </Stack>
            </Group>
          </Paper>
        </SimpleGrid>

        {detailLoading ? (
          <Group justify="center" py="md">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              Actualizando...
            </Text>
          </Group>
        ) : null}

        <Tabs defaultValue="overview">
          <Tabs.List>
            <Tabs.Tab value="overview">Resumen</Tabs.Tab>
            <Tabs.Tab value="manage">Gestionar</Tabs.Tab>
            <Tabs.Tab value="participants">
              Participantes ({participants.length})
            </Tabs.Tab>
            <Tabs.Tab value="history">Historial ({events.length})</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="md">
              {selected.imageUrl ? (
                <Image
                  src={resolveFileUrl(selected.imageUrl) ?? undefined}
                  alt={selected.title}
                  h={200}
                  fit="contain"
                  radius="md"
                />
              ) : null}
              <Paper withBorder p="md" radius="md">
                <Text fw={600} size="sm" mb="xs">
                  Descripción
                </Text>
                <Text size="sm">{selected.description}</Text>
              </Paper>
              {selected.winnerDisplayName ? (
                <Paper withBorder p="md" radius="md" bg="dark.6">
                  <Text size="sm" c="dimmed">
                    Ganador actual
                  </Text>
                  <Text fw={700} size="lg">
                    {selected.winnerDisplayName}
                  </Text>
                </Paper>
              ) : null}
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="manage" pt="md">
            <RaffleWorkflowPanel
              item={selected}
              isAdmin={isAdmin}
              onEdit={onEdit}
              actionLoading={actionLoading}
              onConfirmAction={onConfirmAction}
              onToggleVisibleInApp={onToggleVisibleInApp}
            />
          </Tabs.Panel>

          <Tabs.Panel value="participants" pt="md">
            <ScrollArea h={360}>
              {participants.length === 0 ? (
                <Paper withBorder p="lg" radius="md">
                  <Text size="sm" c="dimmed" ta="center">
                    Todavía no hay participantes inscriptos.
                    {selected.status === "published"
                      ? " Compartí el sorteo en la app para que los usuarios se sumen."
                      : ""}
                  </Text>
                </Paper>
              ) : (
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Usuario</Table.Th>
                      <Table.Th>Ingreso</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {participants.map(p => (
                      <Table.Tr key={p.id}>
                        <Table.Td>
                          {p.displayName}
                          <Text size="xs" c="dimmed">
                            @{p.username}
                          </Text>
                        </Table.Td>
                        <Table.Td>{formatDateTime(p.enteredAt)}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </ScrollArea>
          </Tabs.Panel>

          <Tabs.Panel value="history" pt="md">
            {events.length === 0 ? (
              <Text size="sm" c="dimmed">
                Sin eventos registrados.
              </Text>
            ) : (
              <Timeline active={events.length - 1} bulletSize={22} lineWidth={2}>
                {events.map(event => (
                  <Timeline.Item
                    key={event.id}
                    title={eventTypeLabel[event.type] ?? event.type}>
                    <Text size="xs" c="dimmed">
                      {formatDateTime(event.createdAt)}
                    </Text>
                    {event.payload &&
                    typeof event.payload === "object" &&
                    "winnerDisplayName" in event.payload &&
                    event.payload.winnerDisplayName ? (
                      <Text size="xs">
                        Ganador: {String(event.payload.winnerDisplayName)}
                      </Text>
                    ) : null}
                    {event.payload &&
                    typeof event.payload === "object" &&
                    "participantCount" in event.payload ? (
                      <Text size="xs" c="dimmed">
                        Participantes: {String(event.payload.participantCount)}
                      </Text>
                    ) : null}
                  </Timeline.Item>
                ))}
              </Timeline>
            )}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Drawer>
  );
}
