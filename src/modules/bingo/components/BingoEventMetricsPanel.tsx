import {
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCheck,
  IconConfetti,
  IconScan,
  IconTrendingUp,
  IconUsers,
} from "@tabler/icons-react";
import type { IBingoEventMetrics } from "../core/entities/iBingo";

type BingoEventMetricsPanelProps = {
  metrics: IBingoEventMetrics;
  standCount: number;
  showStandBreakdown?: boolean;
};

const formatPercent = (value: number) => `${value.toFixed(value % 1 === 0 ? 0 : 1)}%`;

const MetricCard = ({
  icon: Icon,
  label,
  value,
  hint,
  color = "blue",
}: {
  icon: typeof IconUsers;
  label: string;
  value: string;
  hint?: string;
  color?: string;
}) => (
  <Paper withBorder p="md" radius="md" style={{ background: "rgba(255,255,255,0.02)" }}>
    <Group gap="sm" align="flex-start" wrap="nowrap">
      <ThemeIcon size={36} radius="md" variant="light" color={color}>
        <Icon size={18} />
      </ThemeIcon>
      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {label}
        </Text>
        <Text fw={700} size="xl" c="white">
          {value}
        </Text>
        {hint ? (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        ) : null}
      </Stack>
    </Group>
  </Paper>
);

export function BingoEventMetricsPanel({
  metrics,
  standCount,
  showStandBreakdown = false,
}: BingoEventMetricsPanelProps) {
  return (
    <Stack gap="md">
      <Text fw={600} size="sm">
        Métricas del evento
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        <MetricCard
          icon={IconUsers}
          label="Participantes"
          value={String(metrics.participantCount)}
          hint={`${metrics.inProgressCount} en progreso · ${metrics.completedCount} completaron`}
          color="blue"
        />
        <MetricCard
          icon={IconCheck}
          label="Tasa de finalización"
          value={formatPercent(metrics.completionRate)}
          hint={`${metrics.completedCount} de ${metrics.participantCount || 0} participantes`}
          color="green"
        />
        <MetricCard
          icon={IconScan}
          label="Check-ins"
          value={String(metrics.totalCheckins)}
          hint={`Promedio ${metrics.averageCheckinsPerParticipant.toFixed(1)} por participante`}
          color="cyan"
        />
        <MetricCard
          icon={IconTrendingUp}
          label="Progreso promedio"
          value={formatPercent(metrics.averageProgressPercent)}
          hint={`Sobre ${standCount} stand${standCount === 1 ? "" : "s"}`}
          color="orange"
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <Paper withBorder p="md" radius="md" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Stack gap="xs">
            <Text size="sm" fw={600}>
              Alcance del sorteo
            </Text>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Elegibles para sorteo
              </Text>
              <Text fw={600}>{metrics.raffleEligibleCount}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Sorteos realizados
              </Text>
              <Text fw={600}>{metrics.drawCount}</Text>
            </Group>
            {metrics.lastDraw ? (
              <Group gap="xs" wrap="nowrap">
                <ThemeIcon size={28} radius="md" variant="light" color="green">
                  <IconConfetti size={16} />
                </ThemeIcon>
                <Stack gap={0}>
                  <Text size="sm" fw={500}>
                    Último ganador: {metrics.lastDraw.winnerName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {new Date(metrics.lastDraw.drawnAt).toLocaleString("es-AR")} · pool de{" "}
                    {metrics.lastDraw.participantCount}
                    {metrics.lastDraw.superseded ? " · reemplazado" : ""}
                  </Text>
                </Stack>
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                Todavía no se realizó ningún sorteo.
              </Text>
            )}
          </Stack>
        </Paper>

        <Paper withBorder p="md" radius="md" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Participación general
            </Text>
            <Stack gap={6}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Completaron el bingo
                </Text>
                <Text size="xs" fw={600}>
                  {formatPercent(metrics.completionRate)}
                </Text>
              </Group>
              <Progress value={metrics.completionRate} color="green" size="sm" radius="xl" />
            </Stack>
            <Stack gap={6}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  Progreso promedio del tablero
                </Text>
                <Text size="xs" fw={600}>
                  {formatPercent(metrics.averageProgressPercent)}
                </Text>
              </Group>
              <Progress value={metrics.averageProgressPercent} color="orange" size="sm" radius="xl" />
            </Stack>
          </Stack>
        </Paper>
      </SimpleGrid>

      {showStandBreakdown && metrics.standVisits && metrics.standVisits.length > 0 ? (
        <Paper withBorder p="md" radius="md" style={{ background: "rgba(255,255,255,0.02)" }}>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Visitas por stand
            </Text>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Stand</Table.Th>
                  <Table.Th>Visitas</Table.Th>
                  <Table.Th>% del alcance</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {metrics.standVisits.map(stand => (
                  <Table.Tr key={stand.standId}>
                    <Table.Td>{stand.label}</Table.Td>
                    <Table.Td>{stand.visitCount}</Table.Td>
                    <Table.Td>{formatPercent(stand.visitRate)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
