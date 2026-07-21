import { Alert, Button, Group, Text } from "@mantine/core";
import { IconConfetti } from "@tabler/icons-react";
import type { IBingoDrawResult } from "../core/entities/iBingo";

type BingoDrawPanelProps = {
  eligibleCount: number;
  lastResult: IBingoDrawResult | null;
  onDraw: () => void;
};

export function BingoDrawPanel({
  eligibleCount,
  lastResult,
  onDraw,
}: BingoDrawPanelProps) {
  return (
    <Group justify="space-between" align="center" wrap="wrap">
      <Text size="sm" c="dimmed">
        {eligibleCount} participante{eligibleCount === 1 ? "" : "s"} completó el tablero y entró al sorteo.
      </Text>
      <Button
        leftSection={<IconConfetti size={18} />}
        onClick={onDraw}
        disabled={eligibleCount === 0}
        variant="filled"
        styles={{
          root: {
            backgroundColor: eligibleCount > 0 ? "white" : undefined,
            color: eligibleCount > 0 ? "black" : undefined,
          },
        }}
      >
        Sortear ganador
      </Button>
      {lastResult ? (
        <Alert color="green" title="Ganador sorteado" style={{ width: "100%" }}>
          {lastResult.winnerName} (de {lastResult.participantCount} participantes elegibles)
        </Alert>
      ) : null}
    </Group>
  );
}
