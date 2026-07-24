import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Switch,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconCircle,
  IconCircleCheck,
  IconCircleDotted,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import type { IRaffle } from "../core/entities/iRaffle";
import {
  ConfirmAction,
  canDeleteRaffle,
  canDuplicateRaffle,
  canEditRaffle,
  canForceCloseRaffle,
  getDeleteBlockedReason,
  getForceCloseHint,
  getPrimaryAction,
  getWorkflowSteps,
  type WorkflowStepState,
} from "../utils/raffleWorkflow";

function StepIcon({ state }: { state: WorkflowStepState }) {
  if (state === "done") {
    return (
      <ThemeIcon color="green" size={24} radius="xl" variant="light">
        <IconCircleCheck size={16} />
      </ThemeIcon>
    );
  }
  if (state === "current") {
    return (
      <ThemeIcon color="blue" size={24} radius="xl" variant="filled">
        <IconCircle size={14} />
      </ThemeIcon>
    );
  }
  if (state === "warning") {
    return (
      <ThemeIcon color="orange" size={24} radius="xl" variant="light">
        <IconAlertTriangle size={16} />
      </ThemeIcon>
    );
  }
  return (
    <ThemeIcon color="gray" size={24} radius="xl" variant="light">
      <IconCircleDotted size={16} />
    </ThemeIcon>
  );
}

type RaffleWorkflowPanelProps = {
  item: IRaffle;
  isAdmin: boolean;
  onEdit: (item: IRaffle) => void;
  actionLoading: boolean;
  onConfirmAction: (action: ConfirmAction) => void;
  onToggleVisibleInApp: (item: IRaffle, visibleInApp: boolean) => void;
};

export function RaffleWorkflowPanel({
  item,
  isAdmin,
  onEdit,
  actionLoading,
  onConfirmAction,
  onToggleVisibleInApp,
}: RaffleWorkflowPanelProps) {
  const steps = getWorkflowSteps(item);
  const primaryAction = getPrimaryAction(item, isAdmin);
  const canEdit = canEditRaffle(item);
  const canDuplicate = canDuplicateRaffle(item);
  const canDelete = canDeleteRaffle(item);
  const canForceClose = canForceCloseRaffle(item);
  const forceCloseHint = getForceCloseHint(item);
  const deleteBlockedReason = getDeleteBlockedReason(item);
  const isVisibleInApp = item.visibleInApp !== false;

  return (
    <Stack gap="md">
      <Paper
        withBorder
        p="md"
        radius="md"
        bg={isVisibleInApp ? "teal.9" : "dark.6"}
        style={{
          borderColor: isVisibleInApp
            ? "var(--mantine-color-teal-6)"
            : "var(--mantine-color-gray-6)",
        }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap" mb="sm">
          <Group gap="sm" wrap="nowrap">
            <ThemeIcon
              size={36}
              radius="md"
              variant="light"
              color={isVisibleInApp ? "teal" : "gray"}>
              {isVisibleInApp ? (
                <IconEye size={20} />
              ) : (
                <IconEyeOff size={20} />
              )}
            </ThemeIcon>
            <Stack gap={2}>
              <Text size="sm" fw={600}>
                Visibilidad en la app móvil
              </Text>
              <Badge
                size="md"
                variant="filled"
                color={isVisibleInApp ? "teal" : "gray"}>
                {isVisibleInApp ? "VISIBLE para usuarios" : "OCULTO en la app"}
              </Badge>
            </Stack>
          </Group>
          <Switch
            size="lg"
            color="teal"
            onLabel="ON"
            offLabel="OFF"
            checked={isVisibleInApp}
            disabled={actionLoading}
            aria-label={
              isVisibleInApp
                ? "Ocultar sorteo en la app"
                : "Mostrar sorteo en la app"
            }
            onChange={event =>
              onToggleVisibleInApp(item, event.currentTarget.checked)
            }
          />
        </Group>
        <Text size="xs" c="dimmed">
          {isVisibleInApp
            ? "Los usuarios lo ven en la app y pueden participar."
            : "No aparece en la app. Seguís viéndolo acá en el panel admin."}
        </Text>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Text size="sm" fw={600} mb="xs">
          Acciones del sorteo
        </Text>
        <Text size="xs" c="dimmed" mb="md">
          Editá los datos, duplicá como borrador o eliminá del panel (borrado
          lógico).
        </Text>
        <Group gap="xs">
          <Button
            size="sm"
            variant="light"
            leftSection={<IconPencil size={16} />}
            disabled={!canEdit || actionLoading}
            onClick={() => onEdit(item)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="light"
            color="cyan"
            leftSection={<IconCopy size={16} />}
            disabled={!canDuplicate || actionLoading}
            onClick={() => onConfirmAction("duplicate")}>
            Duplicar
          </Button>
          <Tooltip
            label={deleteBlockedReason ?? "Eliminar del panel"}
            disabled={canDelete}>
            <span>
              <Button
                size="sm"
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                disabled={!canDelete || actionLoading}
                onClick={() => onConfirmAction("delete")}>
                Eliminar
              </Button>
            </span>
          </Tooltip>
        </Group>
        {!canEdit ? (
          <Text size="xs" c="dimmed" mt="sm">
            La edición solo está disponible en borrador o publicado.
          </Text>
        ) : null}
        {deleteBlockedReason ? (
          <Text size="xs" c="dimmed" mt="sm">
            {deleteBlockedReason}
          </Text>
        ) : null}
      </Paper>

      <Stack gap="sm">
        {steps.map(step => (
          <Paper
            key={step.key}
            withBorder
            p="sm"
            radius="md"
            bg={
              step.state === "current"
                ? "dark.6"
                : step.state === "warning"
                  ? "orange.9"
                  : undefined
            }>
            <Group align="flex-start" wrap="nowrap" gap="sm">
              <StepIcon state={step.state} />
              <Stack gap={2} style={{ flex: 1 }}>
                <Group gap="xs">
                  <Text size="sm" fw={600}>
                    {step.label}
                  </Text>
                  {step.state === "current" ? (
                    <Badge size="xs" color="blue" variant="light">
                      Paso actual
                    </Badge>
                  ) : null}
                  {step.state === "warning" ? (
                    <Badge size="xs" color="orange" variant="light">
                      Atención
                    </Badge>
                  ) : null}
                </Group>
                <Text size="xs" c="dimmed">
                  {step.description}
                </Text>
              </Stack>
            </Group>
          </Paper>
        ))}
      </Stack>

      {item.status === "completed" ? (
        <Alert color="green" title="Sorteo finalizado">
          Este sorteo ya fue completado. Podés consultar participantes e
          historial en las otras pestañas.
        </Alert>
      ) : null}

      {primaryAction ? (
        <Paper withBorder p="md" radius="md" bg="dark.7">
          <Text size="sm" fw={600} mb={4}>
            Acción recomendada
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            {primaryAction.hint}
          </Text>
          <Group gap="xs">
            {canEdit ? (
              <Button
                size="sm"
                variant="light"
                disabled={actionLoading}
                onClick={() => onEdit(item)}>
                Editar datos
              </Button>
            ) : null}
            <Button
              size="sm"
              color={primaryAction.color}
              loading={actionLoading}
              onClick={() => onConfirmAction(primaryAction.action)}>
              {primaryAction.label}
            </Button>
          </Group>
        </Paper>
      ) : null}

      {isAdmin && canForceClose && primaryAction?.action !== "close" ? (
        <Paper withBorder p="md" radius="md">
          <Text size="sm" fw={600} mb={4}>
            Cierre manual
          </Text>
          <Text size="sm" c="dimmed" mb="md">
            {forceCloseHint}
          </Text>
          <Button
            size="sm"
            color="yellow"
            variant="outline"
            loading={actionLoading}
            onClick={() => onConfirmAction("close")}>
            Cerrar participación
          </Button>
        </Paper>
      ) : null}

      {isAdmin && item.status === "drawn" ? (
        <Alert color="orange" variant="light" title="¿El ganador no reclamó?">
          <Text size="sm" mb="sm">
            Si vence el plazo de reclamo, el sorteo pasará a &quot;Reclamo
            vencido&quot; y podrás re-sortear. También podés re-sortear manualmente
            ahora si hace falta.
          </Text>
          <Button
            size="xs"
            color="orange"
            variant="outline"
            loading={actionLoading}
            onClick={() => onConfirmAction("redraw")}>
            Re-sortear ahora
          </Button>
        </Alert>
      ) : null}

      {isAdmin && item.status === "expired" ? (
        <Alert color="orange" variant="light" title="Reclamo vencido">
          <Text size="sm" mb="sm">
            Si el ganador igual recibió el premio, usá &quot;Marcar premio
            entregado&quot; para finalizar el sorteo. Si no, podés elegir un nuevo
            ganador.
          </Text>
          <Button
            size="xs"
            color="orange"
            variant="outline"
            loading={actionLoading}
            onClick={() => onConfirmAction("redraw")}>
            Re-sortear ganador
          </Button>
        </Alert>
      ) : null}
    </Stack>
  );
}
