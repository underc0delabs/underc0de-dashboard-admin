import { Button, Divider, Group, Modal, Stack, TextInput, Textarea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";
import type { IBingoEvent, IBingoEventFormInput } from "../core/entities/iBingo";

type BingoEventFormModalProps = {
  opened: boolean;
  onClose: () => void;
  form: UseFormReturnType<IBingoEventFormInput>;
  selected: IBingoEvent | null;
  onSubmit: () => void;
};

export function BingoEventFormModal({
  opened,
  onClose,
  form,
  selected,
  onSubmit,
}: BingoEventFormModalProps) {
  const isEdit = selected != null;

  return (
    <Modal opened={opened} onClose={onClose} title={isEdit ? "Editar evento" : "Nuevo evento de bingo"} size="lg">
      <Stack gap="md">
        <Divider label="Datos del evento" labelPosition="left" />
        <TextInput
          label="Nombre"
          placeholder="Ej: Expo Tecnología 2026"
          required
          {...form.getInputProps("name")}
        />
        <Textarea
          label="Descripción"
          placeholder="Contá de qué se trata el evento"
          minRows={3}
          {...form.getInputProps("description")}
        />
        <TextInput
          label="Fecha de inicio"
          type="datetime-local"
          {...form.getInputProps("startDate")}
        />
        <TextInput
          label="Fecha de fin"
          type="datetime-local"
          {...form.getInputProps("endDate")}
        />

        <Group justify="flex-end" mt="sm">
          <Button variant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            styles={{
              root: { backgroundColor: "white", color: "black" },
            }}
          >
            {isEdit ? "Guardar cambios" : "Crear evento"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
