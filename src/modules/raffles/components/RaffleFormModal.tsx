import {
  Box,
  Button,
  Divider,
  FileInput,
  getDefaultZIndex,
  Group,
  Image,
  Modal,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import type { IRaffle, IRaffleFormInput } from "../core/entities/iRaffle";

type RaffleFormModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<IRaffleFormInput>;
  selected: IRaffle | null;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
};

export function RaffleFormModal({
  opened,
  onClose,
  form,
  selected,
  imagePreview,
  onImageChange,
  onSubmit,
}: RaffleFormModalProps) {
  const isEdit = selected != null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Editar sorteo" : "Nuevo sorteo"}
      size="lg"
      zIndex={getDefaultZIndex("max")}
      overlayProps={{ zIndex: getDefaultZIndex("max") }}>
      <Stack gap="md">
        {!isEdit ? (
          <Text size="sm" c="dimmed">
            El sorteo se guardará como borrador. Después podrás publicarlo desde
            el detalle para que aparezca en la app.
          </Text>
        ) : null}

        <Divider label="Contenido" labelPosition="left" />
        <TextInput
          label="Título"
          placeholder="Ej: Sorteo membresía PRO"
          required
          {...form.getInputProps("title")}
        />
        <Textarea
          label="Descripción"
          placeholder="Contá qué se sortea y condiciones básicas"
          required
          minRows={4}
          {...form.getInputProps("description")}
        />
        {imagePreview ? (
          <Box style={{ display: "inline-block" }}>
            <Image
              src={imagePreview}
              alt="Vista previa del sorteo"
              h={160}
              fit="contain"
              radius="md"
            />
          </Box>
        ) : null}
        <FileInput
          label="Imagen del premio"
          description="Opcional. Máximo 900 KB (JPG, PNG, GIF o WebP). Se muestra en la app."
          accept="image/*"
          value={form.values.image}
          onChange={onImageChange}
        />

        <Divider label="Plazos" labelPosition="left" />
        <Text size="xs" c="dimmed">
          Horario Argentina (UTC-3). La participación cierra automáticamente en
          esa fecha.
        </Text>
        <TextInput
          label="Cierre de participación"
          description="Último momento para que los usuarios se sumen"
          type="datetime-local"
          required
          {...form.getInputProps("participationDeadline")}
        />
        <TextInput
          label="Plazo para reclamar el premio"
          description="Tiempo que tiene el ganador para reclamar después del sorteo"
          type="datetime-local"
          required
          {...form.getInputProps("claimDeadline")}
        />

        <Divider label="Audiencia" labelPosition="left" />
        <Switch
          label="Solo miembros PRO"
          description="Si está activo, solo usuarios PRO pueden participar"
          {...form.getInputProps("proOnly", { type: "checkbox" })}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? "Guardar cambios" : "Guardar borrador"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
