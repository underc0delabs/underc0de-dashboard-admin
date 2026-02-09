import { useState, useMemo, useEffect } from "react";
import { Modal, TextInput, Select, Stack, Button, Group } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconRefresh, IconFileDownload } from "@tabler/icons-react";
import * as XLSX from "xlsx";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column, StatusBadge } from "@/components/common/DataTable";
import { FilterBar, FilterOption } from "@/components/common/FilterBar";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { IAppUsersPresenter } from "../core/presentation/iAppUsersPresenter";
import { appUsersPresenterProvider } from "../infrastructure/presentation/presenterProvider";
import { IAppUser, SubscriptionStatus } from "../core/entities/iAppUser";
import { IAppUsersViews } from "../core/views/iAppUsersViews";
import { useAuth } from "@/context/AuthContext";

const filters: FilterOption[] = [
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Buscar por nombre o email...",
  },
  {
    key: "status",
    label: "Estado",
    type: "select",
    options: [
      { value: "Activo", label: "Activo" },
      { value: "Inactivo", label: "Inactivo" },
    ],
  },
  {
    key: "subscription",
    label: "Suscripción",
    type: "select",
    options: [
      { value: "active", label: "Activa" },
      { value: "none", label: "Sin suscripción" },
    ],
  },
];

const columns: Column<IAppUser>[] = [
  { key: "name", label: "Nombre" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Teléfono", render: (user) => user.phone || "-" },
  {
    key: "subscription",
    label: "Suscripción",
    render: (user) => <StatusBadge status={user.subscription} />,
  },
  {
    key: "status",
    label: "Estado",
    render: (user) => (
      <StatusBadge status={user.status ? "Activo" : "Inactivo"} />
    ),
  },
];

export default function Users() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<IAppUser[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<IAppUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const presenterProvider = appUsersPresenterProvider();
  const [presenter, setPresenter] = useState<IAppUsersPresenter>(
    {} as IAppUsersPresenter
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const viewHandlers: IAppUsersViews = {
    getUsersSuccess: (users: IAppUser[]) => {
      setUsers(users);
    },
    getUsersError: (error: string) => {
      notifications.show({
        title: "Error al obtener los usuarios",
        message: error,
        color: "red",
      });
    },
    updateUserSuccess: (user: IAppUser) => {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      notifications.show({
        title: "Usuario actualizado",
        message: "Los datos del usuario han sido actualizados correctamente.",
        color: "green",
      });
      closeModal();
    },
    updateUserError: (error: string) => {
      notifications.show({
        title: "Error al actualizar el usuario",
        message: error,
        color: "red",
      });
    },
    createUserSuccess: (user: IAppUser) => {
      setUsers((prev) => [user, ...prev]);
      notifications.show({
        title: "Usuario creado",
        message: "El nuevo usuario ha sido creado correctamente.",
        color: "green",
      });
      closeModal();
    },
    createUserError: (error: string) => {
      notifications.show({
        title: "Error al crear el usuario",
        message: error,
        color: "red",
      });
    },
    deleteUserSuccess: function (success: boolean): void {
      if (success && deletingUserId) {
        setUsers((prev) => {
          const updated = prev.filter((u) => u.id !== deletingUserId);
          // Si la página actual queda vacía y no es la primera página, volver a la anterior
          const remainingOnCurrentPage = updated.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          ).length;
          if (remainingOnCurrentPage === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          return updated;
        });
        // Refrescar datos del backend para asegurar sincronización
        if (isLoaded) {
          presenter.getAppUsers();
        }
        setDeletingUserId(null);
      }
      notifications.show({
        title: "Usuario eliminado",
        message: "El usuario ha sido eliminado correctamente.",
        color: "green",
      });
      closeDeleteModal();
      setSelectedUser(null);
    },
    deleteUserError: function (error: string): void {
      notifications.show({
        title: "Error al eliminar el usuario",
        message: error,
        color: "red",
      });
    },
  };

  useEffect(() => {
    const presenter = presenterProvider.getPresenter(viewHandlers);
    setPresenter(presenter);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      presenter.getAppUsers();
    }
  }, [isLoaded]);

  const form = useForm<Partial<IAppUser>>({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      status: true,
      subscription: "none" as SubscriptionStatus,
      subscriptionPlan: "",
    },
    validate: {
      name: (value) => (!value ? "El nombre es requerido" : null),
      email: (value) => {
        if (!value) return "El email es requerido";
        if (!/^\S+@\S+$/.test(value)) return "Email inválido";
        return null;
      },
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (
          !user.name.toLowerCase().includes(search) &&
          !user.email.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filterValues.status) {
        const statusLabel = user.status ? "Activo" : "Inactivo";
        if (statusLabel !== filterValues.status) return false;
      }
      if (
        filterValues.subscription &&
        user.subscription !== filterValues.subscription
      )
        return false;
      return true;
    });
  }, [users, filterValues]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [filteredUsers, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string | null) => {
    if (value) {
      setItemsPerPage(Number(value));
      setCurrentPage(1);
    }
  };

  const handleRefresh = () => {
    if (isLoaded) {
      presenter.getAppUsers();
      notifications.show({
        title: "Actualizando",
        message: "Refrescando datos de usuarios...",
        color: "blue",
      });
    }
  };

  const handleExportToExcel = () => {
    const proUsers = users.filter((user) => user.subscription === "active");

    if (proUsers.length === 0) {
      notifications.show({
        title: "Sin datos",
        message: "No hay usuarios pro para exportar",
        color: "yellow",
      });
      return;
    }

    const excelData = proUsers.map((user) => ({
      Nombre: user.name,
      Email: user.email,
      Teléfono: user.phone || "-",
      Suscripción: user.subscription,
      Plan: user.subscriptionPlan || "-",
      Estado: user.status ? "Activo" : "Inactivo",
      "Fecha de creación": user.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios Pro");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usuarios-pro-${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    notifications.show({
      title: "Exportación exitosa",
      message: `Se exportaron ${proUsers.length} usuarios pro a Excel`,
      color: "green",
    });
  };

  const handleCreate = () => {
    setSelectedUser(null);
    form.reset();
    openModal();
  };

  const handleEdit = (user: IAppUser) => {
    setSelectedUser(user);
    form.setValues({
      name: user.name,
      email: user.email,
      phone: user.phone,
      status: user.status,
      subscription: user.subscription,
      subscriptionPlan: user.subscriptionPlan,
    });
    openModal();
  };

  const handleDelete = (user: IAppUser) => {
    setSelectedUser(user);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<IAppUser>) => {
    if (selectedUser && selectedUser.id) {
      presenter.updateAppUser(selectedUser.id, values);
    } else {
      const newUser: Partial<IAppUser> = {
        name: values.name!,
        email: values.email!,
        phone: values.phone,
        status: values.status ?? true,
        subscription: values.subscription || "none",
        subscriptionPlan: values.subscriptionPlan,
        createdAt: new Date().toISOString().split("T")[0],
      };
      presenter.createAppUser(newUser);
    }
  };

  const confirmDelete = () => {
    if (selectedUser && selectedUser.id) {
      setDeletingUserId(selectedUser.id);
      presenter.deleteAppUser(selectedUser.id);
    }
  };

  const canEdit = hasPermission("admin");
  const canDelete = hasPermission("admin");

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios de la plataforma"
        action={
          canEdit
            ? { label: "Nuevo Usuario", onClick: handleCreate }
            : undefined
        }
      />

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <Group justify="space-between" mb="md">
        <Group gap="md">
          <Button
            leftSection={<IconFileDownload size={18} />}
            onClick={handleExportToExcel}
            variant="light"
            color="green"
            styles={{
              root: {
                backgroundColor: "var(--mantine-color-dark-7)",
                color: "var(--mantine-color-green-6)",
                borderColor: "var(--mantine-color-dark-5)",
              },
            }}
          >
            Exportar Pro a Excel
          </Button>
        </Group>
        <Select
          label="Elementos por página"
          value={itemsPerPage.toString()}
          onChange={handleItemsPerPageChange}
          data={[
            { value: "10", label: "10" },
            { value: "25", label: "25" },
            { value: "50", label: "50" },
            { value: "100", label: "100" },
          ]}
          styles={{
            label: { color: "var(--mantine-color-dark-1)" },
            input: {
              color: "var(--mantine-color-dark-1)",
              backgroundColor: "var(--mantine-color-dark-7)",
              borderColor: "var(--mantine-color-dark-5)",
            },
          }}
          w={200}
        />
      </Group>

      <DataTable
        data={paginatedUsers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        page={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        emptyMessage="No se encontraron usuarios"
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedUser ? "Editar Usuario" : "Nuevo Usuario"}
        centered
        styles={{
          title: { fontWeight: 600, color: "white" },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Nombre completo"
              {...form.getInputProps("name")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <TextInput
              label="Email"
              placeholder="email@ejemplo.com"
              {...form.getInputProps("email")}
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
            <Select
              label="Estado"
              data={[
                { value: "true", label: "Activo" },
                { value: "false", label: "Inactivo" },
              ]}
              value={form.values.status?.toString() || ""}
              onChange={(value) =>
                form.setFieldValue("status", value === "true")
              }
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <Select
              label="Suscripción"
              data={[
                { value: "active", label: "Activa" },
                { value: "trial", label: "Prueba" },
                { value: "expired", label: "Expirada" },
                { value: "cancelled", label: "Cancelada" },
                { value: "none", label: "Sin suscripción" },
              ]}
              {...form.getInputProps("subscription")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <TextInput
              label="Plan"
              placeholder="Basic, Premium, Enterprise..."
              {...form.getInputProps("subscriptionPlan")}
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
                {selectedUser ? "Guardar cambios" : "Crear usuario"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar a ${selectedUser?.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </>
  );
}
