import { Badge, Drawer, ScrollArea, Table, Text } from "@mantine/core";
import type { IBingoParticipantEntry } from "../core/entities/iBingo";

type BingoParticipantsDrawerProps = {
  opened: boolean;
  onClose: () => void;
  standCount: number;
  participants: IBingoParticipantEntry[];
};

export function BingoParticipantsDrawer({
  opened,
  onClose,
  standCount,
  participants,
}: BingoParticipantsDrawerProps) {
  return (
    <Drawer opened={opened} onClose={onClose} title="Participantes" position="right" size="lg">
      {participants.length === 0 ? (
        <Text c="dimmed" size="sm">
          Todavía no hay participantes unidos a este evento.
        </Text>
      ) : (
        <ScrollArea h="calc(100vh - 120px)">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nombre</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Progreso</Table.Th>
                <Table.Th>Estado</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {participants.map(p => (
                <Table.Tr key={p.boardEntryId}>
                  <Table.Td>{p.name ?? "-"}</Table.Td>
                  <Table.Td>{p.email ?? "-"}</Table.Td>
                  <Table.Td>
                    {p.checkedCount}/{standCount}
                  </Table.Td>
                  <Table.Td>
                    {p.completedAt ? (
                      <Badge color="green">Completado</Badge>
                    ) : (
                      <Badge color="gray">En progreso</Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </Drawer>
  );
}
