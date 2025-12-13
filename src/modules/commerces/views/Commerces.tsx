import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  TextInput,
  Select,
  Stack,
  Button,
  Group,
  FileInput,
  Image,
  ActionIcon,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconPhoto, IconTrash } from "@tabler/icons-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column, StatusBadge } from "@/components/common/DataTable";
import { FilterBar, FilterOption } from "@/components/common/FilterBar";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { commercePresenterProvider } from "../infrastructure/presentation/presenterProvider";
import { ICommercePresenter } from "../core/presentation/iCommercePresenter";
import { ICommerceViews } from "../core/views/iCommerceViews";
import { ICommerce } from "../core/entities/iCommerce";

const filters: FilterOption[] = [
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Buscar por nombre...",
  },
  {
    key: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "true", label: "Activo" },
      { value: "false", label: "Inactivo" },
    ],
  },
];

const columns: Column<ICommerce>[] = [
  { key: "name", label: "Nombre" },
  { key: "address", label: "Dirección" },
  {
    key: "phone",
    label: "Teléfono",
    render: (commerce) => commerce.phone || "-",
  },
  { key: "email", label: "Email", render: (commerce) => commerce.email || "-" },
  {
    key: "status",
    label: "Estado",
    render: (commerce) => <StatusBadge status={commerce.status ? "Activo" : "Inactivo"} />,
  },
];

export default function Commerces() {
  const [commerces, setCommerces] = useState<ICommerce[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [selectedCommerce, setSelectedCommerce] = useState<ICommerce>(
    {} as ICommerce
  );
  const presenterProvider = commercePresenterProvider();
  const [presenter, setPresenter] = useState<ICommercePresenter>(
    {} as ICommercePresenter
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const viewHandlers: ICommerceViews = {
    getCommercesSuccess: (commerces) => {
      setCommerces(commerces);
    },
    getCommercesError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
    createCommerceSuccess: (commerce) => {
      setCommerces((prev) => [commerce, ...prev]);
      closeModal();
    },
    createCommerceError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
    updateCommerceSuccess: (commerce) => {
      setCommerces((prev) =>
        prev.map((c) => (c.id === commerce.id ? commerce : c))
      );
      notifications.show({
        title: "Comercio actualizado",
        message: "Los datos del comercio han sido actualizados correctamente.",
        color: "green",
      });
      closeModal();
    },
    updateCommerceError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
    deleteCommerceSuccess: () => {
      setCommerces((prev) => prev.filter((c) => c.id !== selectedCommerce?.id));
      notifications.show({
        title: "Comercio eliminado",
        message: "El comercio ha sido eliminado correctamente.",
        color: "green",
      });
      closeDeleteModal();
    },
    deleteCommerceError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
  };

  useEffect(() => {
    setPresenter(presenterProvider.getPresenter(viewHandlers));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      presenter.getCommerces();
    }
  }, [isLoaded]);

  const form = useForm<Partial<ICommerce> & { logo?: File | null }>({
    initialValues: {
      name: "",
      category: "",
      address: "",
      phone: "",
      email: "",
      status: true,  
      logo: null,
    },
    validate: {
      name: (value) => (!value ? "El nombre es requerido" : null),
      address: (value) => (!value ? "La dirección es requerida" : null),
      email: (value) => {
        if (value && !/^\S+@\S+$/.test(value)) return "Email inválido";
        return null;
      },
    },
  });

  const filteredCommerces = useMemo(() => {
    return commerces.filter((commerce) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (!commerce.name.toLowerCase().includes(search)) return false;
      }
      if (filterValues.status && commerce.status.toString() !== filterValues.status) return false;
      return true;
    });
  }, [commerces, filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
  };

  const handleCreate = () => {
    setSelectedCommerce({} as ICommerce);
    setPhotoPreview(null);
    form.reset();
    openModal();
  };

  const handleEdit = (commerce: ICommerce) => {
    setSelectedCommerce(commerce);
    setPhotoPreview(commerce.logo);
    form.setValues({
      name: commerce.name,
      category: commerce.category,
      address: commerce.address,
      phone: commerce.phone,
      email: commerce.email,
      status: commerce.status,
      logo: commerce.logo ? new File([], commerce.logo) as unknown as (string & File) : null,
    });
    openModal();
  };

  const handlePhotoChange = (file: File | null) => {
    form.setFieldValue("logo", file as unknown as (string & File));
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

  const handleRemovePhoto = () => {
    form.setFieldValue("logo", null);
    setPhotoPreview(null);
  };

  const handleDelete = (commerce: ICommerce) => {
    setSelectedCommerce(commerce);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<ICommerce>) => {
    if (selectedCommerce !== null && selectedCommerce.id !== undefined) {
      presenter.updateCommerce(selectedCommerce.id!, values);
    } else {
      const newCommerce: ICommerce = {
        name: values.name!,
        category: values.category!,
        address: values.address!,
        phone: values.phone,
        email: values.email,
        status: values.status,
        logo: values.logo,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      presenter.createCommerce(newCommerce);
    }
  };

  const confirmDelete = () => {
    if (selectedCommerce) {
      presenter.deleteCommerce(selectedCommerce.id!);
    }
  };

  return (
    <MainLayout>
      <PageHeader
        title="Comercios"
        description="Gestiona los comercios de la plataforma"
        action={{ label: "Nuevo Comercio", onClick: handleCreate }}
      />

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <DataTable
        data={filteredCommerces}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No se encontraron comercios"
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedCommerce ? "Editar Comercio" : "Nuevo Comercio"}
        centered
        styles={{
          title: { fontWeight: 600, color: "white" },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Nombre del comercio"
              {...form.getInputProps("name")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <TextInput
              label="Dirección"
              placeholder="Dirección completa"
              {...form.getInputProps("address")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <TextInput
              label="Teléfono"
              placeholder="+54 11 1234-5678"
              {...form.getInputProps("phone")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <TextInput
              label="Email"
              placeholder="email@comercio.com"
              {...form.getInputProps("email")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <FileInput
              label="Foto"
              placeholder="Selecciona una imagen"
              accept="image/*"
              leftSection={<IconPhoto size={18} />}
              onChange={handlePhotoChange}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
                root: {
                  backgroundColor: "var(--mantine-color-dark-7)",
                  borderColor: "var(--mantine-color-dark-4)",
                  color: "var(--mantine-color-dark-1)",
                },
              }}
            />
            {photoPreview && (
              <Box pos="relative" style={{ display: "inline-block" }}>
                <Image
                  src={photoPreview}
                  alt="Vista previa"
                  height={200}
                  fit="cover"
                  radius="md"
                />
                <ActionIcon
                  variant="filled"
                  color="red"
                  size="lg"
                  radius="xl"
                  pos="absolute"
                  top={8}
                  right={8}
                  onClick={handleRemovePhoto}
                  style={{ zIndex: 10 }}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Box>
            )}
            <Select
              label="Estado"
              data={[
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
              ]}
              value={form.values.status?.toString() || ""}
              onChange={(value) => form.setFieldValue("status", value === "true")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                styles={{
                  root: { backgroundColor: "white", color: "black" },
                }}
              >
                {selectedCommerce ? "Guardar cambios" : "Crear comercio"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar Comercio"
        message={`¿Estás seguro de que deseas eliminar ${selectedCommerce?.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </MainLayout>
  );
}
