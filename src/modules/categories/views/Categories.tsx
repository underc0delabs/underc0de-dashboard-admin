import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  TextInput,
  Select,
  Stack,
  Button,
  Group,
  NumberInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column, StatusBadge } from "@/components/common/DataTable";
import { FilterBar, FilterOption } from "@/components/common/FilterBar";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { categoryPresenterProvider } from "../infrastructure/presentation/presenterProvider";
import { ICategoryPresenter } from "../core/presentation/iCategoryPresenter";
import { ICategoryViews } from "../core/views/iCategoryViews";
import { ICategory } from "../core/entities/iCategory";
import { parseHttpClientError } from "@/utils/parseHttpClientError";

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
      { value: "true", label: "Activa" },
      { value: "false", label: "Inactiva" },
    ],
  },
];

const columns: Column<ICategory>[] = [
  { key: "name", label: "Nombre" },
  {
    key: "sortOrder",
    label: "Orden",
    render: (category) => category.sortOrder ?? 0,
  },
  {
    key: "status",
    label: "Estado",
    render: (category) => (
      <StatusBadge status={category.status ? "Activa" : "Inactiva"} />
    ),
  },
];

export default function Categories() {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] =
    useDisclosure(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
    null,
  );
  const presenterProvider = categoryPresenterProvider();
  const [presenter, setPresenter] = useState<ICategoryPresenter>(
    {} as ICategoryPresenter,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const deletingCategoryIdRef = useRef<string | null>(null);

  const viewHandlers: ICategoryViews = {
    getCategoriesSuccess: (rows) => setCategories(rows),
    getCategoriesError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
    createCategorySuccess: (category) => {
      setCategories((prev) =>
        [...prev, category].sort(
          (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        ),
      );
      notifications.show({
        title: "Categoría creada",
        message: "La categoría se creó correctamente.",
        color: "green",
      });
      closeModal();
    },
    createCategoryError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
    updateCategorySuccess: (category) => {
      setCategories((prev) =>
        prev
          .map((row) => (row.id === category.id ? category : row))
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
      );
      notifications.show({
        title: "Categoría actualizada",
        message: "La categoría se actualizó correctamente.",
        color: "green",
      });
      closeModal();
    },
    updateCategoryError: (error) => {
      notifications.show({
        title: "Error",
        message: error.message,
        color: "red",
      });
    },
    deleteCategorySuccess: () => {
      const id = deletingCategoryIdRef.current;
      setCategories((prev) => prev.filter((row) => row.id !== id));
      deletingCategoryIdRef.current = null;
      setSelectedCategory(null);
      notifications.show({
        title: "Categoría eliminada",
        message: "La categoría se eliminó correctamente.",
        color: "green",
      });
      closeDeleteModal();
    },
    deleteCategoryError: (error) => {
      notifications.show({
        title: "No se pudo eliminar",
        message: parseHttpClientError(
          error,
          "No se pudo eliminar la categoría.",
        ),
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
      presenter.getCategories();
    }
  }, [isLoaded]);

  const form = useForm<Partial<ICategory>>({
    initialValues: {
      name: "",
      status: true,
      sortOrder: 0,
    },
    validate: {
      name: (value) => (!value?.trim() ? "El nombre es requerido" : null),
    },
  });

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (!category.name.toLowerCase().includes(search)) return false;
      }
      if (
        filterValues.status &&
        category.status.toString() !== filterValues.status
      ) {
        return false;
      }
      return true;
    });
  }, [categories, filterValues]);

  const handleCreate = () => {
    setSelectedCategory(null);
    form.reset();
    openModal();
  };

  const handleEdit = (category: ICategory) => {
    setSelectedCategory(category);
    form.setValues({
      name: category.name,
      status: category.status,
      sortOrder: category.sortOrder ?? 0,
    });
    openModal();
  };

  const handleDelete = (category: ICategory) => {
    setSelectedCategory(category);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<ICategory>) => {
    if (selectedCategory?.id) {
      presenter.updateCategory(selectedCategory.id, values);
      return;
    }
    presenter.createCategory(values);
  };

  const confirmDelete = () => {
    if (selectedCategory?.id) {
      deletingCategoryIdRef.current = selectedCategory.id;
      presenter.deleteCategory(selectedCategory.id);
    }
  };

  return (
    <>
      <PageHeader
        title="Categorías de comercios"
        description="Organizá los comercios por categoría para filtrarlos en la app"
        action={{ label: "Nueva categoría", onClick: handleCreate }}
      />

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={(key, value) =>
          setFilterValues((prev) => ({ ...prev, [key]: value }))
        }
        onClear={() => setFilterValues({})}
      />

      <DataTable
        data={filteredCategories}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No se encontraron categorías"
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedCategory ? "Editar categoría" : "Nueva categoría"}
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Ej: Gastronomía"
              {...form.getInputProps("name")}
            />
            <NumberInput
              label="Orden"
              allowDecimal={false}
              {...form.getInputProps("sortOrder")}
            />
            <Select
              label="Estado"
              data={[
                { value: "true", label: "Activa" },
                { value: "false", label: "Inactiva" },
              ]}
              value={form.values.status?.toString() || "true"}
              onChange={(value) =>
                form.setFieldValue("status", value === "true")
              }
            />
            <Group justify="flex-end">
              <Button variant="default" onClick={closeModal}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar categoría"
        message="¿Seguro que querés eliminar esta categoría? No podés eliminarla si tiene comercios asociados."
      />
    </>
  );
}
