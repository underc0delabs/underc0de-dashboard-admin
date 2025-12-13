import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  TextInput,
  PasswordInput,
  Select,
  Stack,
  Button,
  Group,
  Badge,
  Switch,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { FilterBar, FilterOption } from "@/components/common/FilterBar";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { IAdminUsersPresenter } from "../core/presentation/iAdminUsersPresenter";
import { adminUsersPresenterProvider } from "../infrastructure/presentation/presenterProvider";
import { AdminUserRole, IAdminUser } from "../core/entities/iAdminUser";
import { IAdminUsersViews } from "../core/views/iAdminUsersViews";
import { useAuth } from "@/context/AuthContext";

const filters: FilterOption[] = [
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Buscar por nombre o email...",
  },
  {
    key: "role",
    label: "Rol",
    type: "select",
    options: [
      { value: "admin", label: "Administrador" },
      { value: "editor", label: "Editor" },
    ],
  },
];


export default function AdminUsers() {
  const [adminUsers, setAdminUsers] = useState<IAdminUser[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<IAdminUser | null>(null);
  const presenterProvider = adminUsersPresenterProvider();
  const [presenter, setPresenter] = useState<IAdminUsersPresenter>(
    {} as IAdminUsersPresenter
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const userAuth = useAuth();

  const handleStatusChange = (user: IAdminUser, checked: boolean) => {
    if (user.id && isLoaded) {
      presenter.updateAdminUser(user.id, {status: checked} as IAdminUser);
    } 
  };

  const columns: Column<IAdminUser>[] = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    {
      key: "role",
      label: "Rol",
      render: (user) => (
        <Badge
          color={user.role === "admin" ? "white" : "gray"}
          variant={user.role === "admin" ? "filled" : "light"}
          styles={{
            root:
              user.role === "admin"
                ? { backgroundColor: "white", color: "black" }
                : {},
          }}
        >
          {user.role === "admin" ? "Administrador" : "Editor"}
        </Badge>
      ),
    },
    { key: "createdAt", label: "Fecha de creación" },
    { key: "updatedAt", label: "Fecha de actualización" },
    {
      key: "status",
      label: "Estado",
      render: (user) => (
        <Switch
          checked={user.status}
          disabled={user.id === userAuth?.user?.id}
          onChange={(event) => handleStatusChange(user, event.currentTarget.checked)}
          styles={{
            track: {
              backgroundColor: user.status
                ? "var(--mantine-color-dark-5)" 
                : "var(--mantine-color-green-6)",
            },
          }}
        />
      ),
    },
  ];

  const viewHandlers: IAdminUsersViews = {
    getUsersSuccess: (users: IAdminUser[]) => {
      setAdminUsers(users);
    },
    getUsersError: (error: string) => {
      notifications.show({
        title: "Error al obtener los usuarios",
        message: error,
        color: "red",
      });
    },
    updateUserSuccess: (user: IAdminUser) => {
      setAdminUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      notifications.show({
        title: "Usuario actualizado",
        message: "Los datos del usuario han sido actualizados correctamente.",
        color: "green",
      });
    },
    updateUserError: (error: string) => {
      notifications.show({
        title: "Error al actualizar el usuario",
        message: error,
        color: "red",
      });
    },
    createUserSuccess: (user: IAdminUser) => {
      setAdminUsers((prev) => [user, ...prev]);
      notifications.show({
        title: "Usuario creado",
        message: "El nuevo usuario ha sido creado correctamente.",
        color: "green",
      });
    },
    createUserError: (error: string) => {
      notifications.show({
        title: "Error al crear el usuario",
        message: error,
        color: "red",
      });
    },
    deleteUserSuccess: function (success: boolean): void {
      if (success) {
        setAdminUsers((prev) => prev.filter((u) => u.id !== selectedUser?.id));
      }
      notifications.show({
        title: "Usuario eliminado",
        message: "El usuario ha sido eliminado correctamente.",
        color: "green",
      });
    },
    deleteUserError: function (error: string): void {
      notifications.show({
        title: "Error al eliminar el usuario",
        message: error,
        color: "red",
      });
    }
  };

  useEffect(() => {
    const presenter = presenterProvider.getPresenter(viewHandlers);
    setPresenter(presenter);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      presenter.getAdminUsers();
    }
  }, [isLoaded]);

  const form = useForm<Partial<IAdminUser> & { password?: string }>({
    initialValues: {
      name: "",
      email: "",
      role: AdminUserRole.EDITOR,
      status: true,
      password: "",
    },
    validate: {
      name: (value) => (!value ? "El nombre es requerido" : null),
      email: (value) => {
        if (!value) return "El email es requerido";
        if (!/^\S+@\S+$/.test(value)) return "Email inválido";
        return null;
      },
      password: (value, values) => {
        if (!selectedUser && !value) return "La contraseña es requerida";
        if (value && value.length < 6)
          return "La contraseña debe tener al menos 6 caracteres";
        return null;
      },
    },
  });

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((user) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (
          !user.name.toLowerCase().includes(search) &&
          !user.email.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filterValues.role && user.role !== filterValues.role) return false;
      return true;
    });
  }, [adminUsers, filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
  };

  const handleCreate = () => {
    setSelectedUser(null);
    form.reset();
    openModal();
  };

  const handleEdit = (user: IAdminUser) => {
    setSelectedUser(user as IAdminUser);
    form.setValues({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
    });
    openModal();
  };

  const handleDelete = (user: IAdminUser) => {
    setSelectedUser(user);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<IAdminUser> & { password?: string }) => {
    if (selectedUser) {
      presenter.updateAdminUser(selectedUser.id, values as IAdminUser);
    } else {
      const newUser: IAdminUser = {
        name: values.name!,
        email: values.email!,
        role: values.role as AdminUserRole,
        status: values.status || true,
        createdAt: new Date().toISOString().split("T")[0],
        password: values.password,
      };
      presenter.createAdminUser(newUser);
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (selectedUser) {
      presenter.deleteAdminUser(selectedUser.id);
    }
    closeDeleteModal();
  };

  return (
    <MainLayout>
      <PageHeader
        title="Usuarios Admin"
        description="Gestiona los usuarios con acceso al panel de administración"
        action={{ label: "Nuevo Admin", onClick: handleCreate }}
      />

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <DataTable
        data={filteredUsers}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyMessage="No se encontraron usuarios admin"
        isFromUserAdmin={true}
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedUser ? "Editar Usuario Admin" : "Nuevo Usuario Admin"}
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
            <PasswordInput
              label={
                selectedUser
                  ? "Nueva contraseña (dejar vacío para mantener)"
                  : "Contraseña"
              }
              placeholder="••••••••"
              {...form.getInputProps("password")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <Select
              label="Rol"
              data={[
                { value: "admin", label: "Administrador - Acceso completo" },
                { value: "editor", label: "Editor - Acceso limitado" },
              ]}
              {...form.getInputProps("role")}
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
                  root: {
                    backgroundColor: "white",
                    color: "black",
                    "&:hover": {
                      backgroundColor: "var(--mantine-color-dark-1)",
                    },
                  },
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
        title="Eliminar Usuario Admin"
        message={`¿Estás seguro de que deseas eliminar a ${selectedUser?.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </MainLayout>
  );
}
