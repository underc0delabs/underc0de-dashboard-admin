import {
  Box,
  Button,
  FileInput,
  Group,
  Image,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import type { IEvent, IEventFormInput } from "../core/entities/iEvent";

const EVENT_TYPE_OPTIONS = [
  { value: "", label: "Sin tipo" },
  { value: "meetup", label: "Encuentro" },
  { value: "workshop", label: "Taller" },
  { value: "talk", label: "Charla" },
  { value: "party", label: "Fiesta" },
  { value: "online", label: "Online" },
  { value: "other", label: "Otro" },
];

const MODALITY_OPTIONS = [
  { value: "", label: "Sin modalidad" },
  { value: "presencial", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
  { value: "hibrida", label: "Híbrida" },
];

type EventFormModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<IEventFormInput>;
  selected: IEvent | null;
  imagePreview: string | null;
  onImageChange: (file: File | null) => void;
  onSubmit: () => void;
};

export function EventFormModal({
  opened,
  onClose,
  form,
  selected,
  imagePreview,
  onImageChange,
  onSubmit,
}: EventFormModalProps) {
  const isEdit = selected != null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? "Editar evento" : "Nuevo evento"}
      size="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Todos los campos son opcionales. Completá solo lo que necesites.
        </Text>

        <TextInput
          label="Título"
          placeholder="Ej: Meetup Underc0de"
          {...form.getInputProps("title")}
        />
        <Select
          label="Tipo de evento"
          data={EVENT_TYPE_OPTIONS}
          clearable
          {...form.getInputProps("eventType")}
        />
        <Group grow>
          <TextInput
            label="Fecha de inicio"
            type="date"
            {...form.getInputProps("startDate")}
          />
          <TextInput
            label="Fecha de fin"
            type="date"
            {...form.getInputProps("endDate")}
          />
        </Group>
        <Group grow>
          <TextInput
            label="Hora de inicio"
            placeholder="HH:MM"
            {...form.getInputProps("startTime")}
          />
          <TextInput
            label="Hora de fin"
            placeholder="HH:MM"
            {...form.getInputProps("endTime")}
          />
        </Group>
        <TextInput
          label="Lugar"
          placeholder="Ej: CABA, Argentina"
          {...form.getInputProps("place")}
        />
        <Select
          label="Modalidad"
          data={MODALITY_OPTIONS}
          clearable
          {...form.getInputProps("modality")}
        />
        <Textarea
          label="Descripción"
          minRows={3}
          {...form.getInputProps("description")}
        />
        <Textarea
          label="Notas"
          minRows={2}
          {...form.getInputProps("notes")}
        />
        {imagePreview ? (
          <Box style={{ display: "inline-block" }}>
            <Image
              src={imagePreview}
              alt="Vista previa del evento"
              h={160}
              fit="contain"
              radius="md"
            />
          </Box>
        ) : null}
        <FileInput
          label="Foto"
          description="Opcional. JPG, PNG, GIF o WebP."
          accept="image/*"
          value={form.values.image}
          onChange={onImageChange}
        />
        <Switch
          label="Visible en la app"
          {...form.getInputProps("visibleInApp", { type: "checkbox" })}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? "Guardar cambios" : "Crear evento"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
