import { useEffect, useState } from "react";
import {
  ActionIcon,
  Button,
  Card,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconDownload, IconTrash } from "@tabler/icons-react";
import { QRCodeSVG } from "qrcode.react";
import { useDependency } from "@/hooks/useDependency";
import type { IGetCommerceAction } from "@/modules/commerces/core/actions/getCommerceAction";
import type { IBingoStand } from "../core/entities/iBingo";

type BingoStandsManagerProps = {
  stands: IBingoStand[];
  onAdd: (label: string, merchantId: string | null) => void;
  onDelete: (standId: string) => void;
};

const downloadStandQr = (stand: IBingoStand) => {
  const svg = document.getElementById(`bingo-stand-qr-${stand.id}`);
  if (!svg) return;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svg);
  const blob = new Blob([source], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `stand-${stand.label.replace(/\s+/g, "-").toLowerCase()}-${stand.code}.svg`;
  link.click();
  URL.revokeObjectURL(url);
};

export function BingoStandsManager({ stands, onAdd, onDelete }: BingoStandsManagerProps) {
  const getCommerceAction = useDependency<IGetCommerceAction>("getCommerceAction");
  const [commerceOptions, setCommerceOptions] = useState<{ value: string; label: string }[]>([]);
  const [label, setLabel] = useState("");
  const [merchantId, setMerchantId] = useState<string | null>(null);

  useEffect(() => {
    getCommerceAction
      .execute()
      .then(commerces => setCommerceOptions(commerces.map(c => ({ value: c.id!, label: c.name }))))
      .catch(() => setCommerceOptions([]));
  }, [getCommerceAction]);

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd(label.trim(), merchantId);
    setLabel("");
    setMerchantId(null);
  };

  return (
    <Stack gap="md">
      <Group align="flex-end">
        <TextInput
          label="Nombre del stand"
          placeholder="Ej: Stand de Acme Corp"
          value={label}
          onChange={e => setLabel(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Select
          label="Comercio (opcional)"
          placeholder="Vincular a un comercio"
          data={commerceOptions}
          value={merchantId}
          onChange={setMerchantId}
          clearable
          searchable
          style={{ flex: 1 }}
        />
        <Button
          onClick={handleAdd}
          variant="light"
          color="blue"
          disabled={!label.trim()}
        >
          Agregar stand
        </Button>
      </Group>

      {stands.length === 0 ? (
        <Text c="dimmed" size="sm">
          Todavía no hay stands cargados para este evento.
        </Text>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
          {stands.map(stand => (
            <Card key={stand.id} withBorder padding="md" radius="md">
              <Stack gap="xs" align="center">
                <Text fw={600}>{stand.label}</Text>
                {stand.merchantName ? (
                  <Text size="xs" c="dimmed">
                    {stand.merchantName}
                  </Text>
                ) : null}
                <QRCodeSVG id={`bingo-stand-qr-${stand.id}`} value={stand.code} size={140} />
                <Text size="xs" c="dimmed" ff="monospace">
                  {stand.code}
                </Text>
                <Group gap="xs">
                  <ActionIcon variant="light" onClick={() => downloadStandQr(stand)} title="Descargar QR">
                    <IconDownload size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => onDelete(stand.id)}
                    title="Eliminar stand"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}
