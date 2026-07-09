import { getDefaultZIndex, Button, Group, Modal, Paper, Stack, Text } from "@mantine/core";
import type { IRaffle } from "../core/entities/iRaffle";
import {
  ConfirmAction,
  confirmLabels,
  formatDateTime,
} from "../utils/raffleWorkflow";

/** Must render above Mantine Drawer stack (drawer uses modal z-index + stack offset). */
const CONFIRM_MODAL_Z_INDEX = getDefaultZIndex("max");

type RaffleConfirmModalProps = {
  action: ConfirmAction | null;
  selected: IRaffle | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function RaffleConfirmModal({
  action,
  selected,
  loading,
  onClose,
  onConfirm,
}: RaffleConfirmModalProps) {
  const config = action ? confirmLabels[action] : null;

  return (
    <Modal
      opened={action != null}
      onClose={onClose}
      title={config?.title ?? ""}
      centered
      zIndex={CONFIRM_MODAL_Z_INDEX}
      overlayProps={{ zIndex: CONFIRM_MODAL_Z_INDEX }}
      withinPortal>
      {config && selected ? (
        <Stack gap="md">
          <Text size="sm">{config.message}</Text>
          {action === "draw" || action === "close" ? (
            <Paper withBorder p="sm" radius="md" bg="dark.7">
              <Text size="sm">
                <Text span fw={600}>
                  Participantes actuales:{" "}
                </Text>
                {selected.participantCount ?? 0}
              </Text>
              <Text size="sm">
                <Text span fw={600}>
                  Cierre participación:{" "}
                </Text>
                {formatDateTime(selected.participationDeadline)}
              </Text>
            </Paper>
          ) : null}
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              Cancelar
            </Button>
            <Button color={config.color} loading={loading} onClick={onConfirm}>
              {config.confirm}
            </Button>
          </Group>
        </Stack>
      ) : null}
    </Modal>
  );
}
