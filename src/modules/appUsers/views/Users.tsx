import { useState, useMemo, useEffect, useRef } from "react";
import {
  Modal,
  TextInput,
  Select,
  Stack,
  Button,
  Group,
  Tooltip,
  Text,
  Divider,
  Collapse,
  PasswordInput,
  Code,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconRefresh, IconFileDownload, IconUserPlus } from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/constants/routes";
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
    placeholder:
      "Buscar por id, id foro, nombre, usuario, email, teléfono o email Mercado Pago...",
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
      { value: "pending", label: "Pendiente (checkout MP)" },
      { value: "payment_failed", label: "Pago rechazado / fallido" },
      { value: "trial", label: "Prueba" },
      { value: "expired", label: "Expirada" },
      { value: "cancelled", label: "Cancelada" },
      { value: "none", label: "Sin suscripción" },
    ],
  },
];

const columns: Column<IAppUser>[] = [
  {
    key: "id",
    label: "ID app",
    render: (user) =>
      user.id ? (
        <Code fz="xs">{user.id}</Code>
      ) : (
        "—"
      ),
  },
  {
    key: "forumUserId",
    label: "ID foro",
    render: (user) =>
      user.forumUserId ? (
        <Code fz="xs">{user.forumUserId}</Code>
      ) : (
        "—"
      ),
  },
  { key: "fullName", label: "Nombre completo", render: (user) => user.fullName || user.name || "-" },
  { key: "username", label: "Nombre de usuario", render: (user) => user.username || "-" },
  { key: "email", label: "Email" },
  {
    key: "mercadopago_email",
    label: "Email MercadoPago",
    render: (user) => user.mercadopago_email?.trim() || "-",
  },
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
  const navigate = useNavigate();
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
  const [advancedMpOpen, { toggle: toggleAdvancedMp }] = useDisclosure(false);
  const [advancedSubOpen, { toggle: toggleAdvancedSub }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<IAppUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState<boolean>(false);
  const [reconcileUserId, setReconcileUserId] = useState<string | null>(null);
  const presenterProvider = appUsersPresenterProvider();
  const [presenter, setPresenter] = useState<IAppUsersPresenter>(
    {} as IAppUsersPresenter
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const presenterRef = useRef<IAppUsersPresenter>(null as unknown as IAppUsersPresenter);
  const syncPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  presenterRef.current = presenter;

  useEffect(() => {
    return () => {
      if (syncPollIntervalRef.current) {
        clearInterval(syncPollIntervalRef.current);
      }
    };
  }, []);

  const viewHandlersRef = useRef<IAppUsersViews>({
    getUsersSuccess: () => {},
    getUsersError: () => {},
    updateUserSuccess: () => {},
    updateUserError: () => {},
    createUserSuccess: () => {},
    createUserError: () => {},
    deleteUserSuccess: () => {},
    deleteUserError: () => {},
    syncMercadoPagoSuccess: () => {},
    syncMercadoPagoError: () => {},
    reconcileMercadoPagoUserSuccess: () => {},
    reconcileMercadoPagoUserError: () => {},
  });

  viewHandlersRef.current = {
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
      presenterRef.current?.getAppUsers?.();
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
      presenterRef.current?.getAppUsers?.();
    },
    createUserError: (error: string) => {
      notifications.show({
        title: "Error al crear el usuario",
        message: error,
        color: "red",
      });
    },
    deleteUserSuccess: (success: boolean) => {
      if (success && deletingUserId) {
        setUsers((prev) => {
          const updated = prev.filter((u) => u.id !== deletingUserId);
          const remainingOnCurrentPage = updated.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          ).length;
          if (remainingOnCurrentPage === 0 && currentPage > 1) {
            setCurrentPage(currentPage - 1);
          }
          return updated;
        });
        presenterRef.current?.getAppUsers?.();
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
    deleteUserError: (error: string) => {
      notifications.show({
        title: "Error al eliminar el usuario",
        message: error,
        color: "red",
      });
    },
    syncMercadoPagoSuccess: () => {
      notifications.show({
        id: "mp-sync",
        title: "Sincronización en curso",
        message: "Esperando resultado de MercadoPago...",
        color: "blue",
        loading: true,
        autoClose: false,
      });

      const pollInterval = 2000;
      const maxAttempts = 60;
      let attempts = 0;

      const poll = async () => {
        try {
          const status = await presenterRef.current?.getMercadoPagoSyncStatus?.();
          if (!status) return;

          if (status.status === "completed") {
            const { subscriptionsCreated, subscriptionsUpdated, paymentsSaved } =
              status;
            const parts: string[] = [];
            if ((subscriptionsCreated ?? 0) > 0)
              parts.push(`${subscriptionsCreated} creadas`);
            if ((subscriptionsUpdated ?? 0) > 0)
              parts.push(`${subscriptionsUpdated} actualizadas`);
            if ((paymentsSaved ?? 0) > 0)
              parts.push(`${paymentsSaved} pagos guardados`);
            const summary =
              parts.length > 0 ? parts.join(", ") : "Sin cambios";

            notifications.update({
              id: "mp-sync",
              title: "Sincronización completada",
              message: summary,
              color: "green",
              loading: false,
              autoClose: 5000,
            });
            setSyncLoading(false);
            presenterRef.current?.getAppUsers?.();
            return true;
          }

          if (status.status === "failed") {
            notifications.update({
              id: "mp-sync",
              title: "Error en sincronización",
              message: status.error ?? "Error desconocido",
              color: "red",
              loading: false,
              autoClose: 5000,
            });
            setSyncLoading(false);
            return true;
          }
        } catch {
          // Ignorar errores de poll, reintentar
        }
        attempts++;
        if (attempts >= maxAttempts) {
          notifications.update({
            id: "mp-sync",
            title: "Sincronización",
            message: "Tiempo de espera agotado. Refrescando datos...",
            color: "yellow",
            loading: false,
            autoClose: 5000,
          });
          setSyncLoading(false);
          presenterRef.current?.getAppUsers?.();
          return true;
        }
        return false;
      };

      const intervalId = setInterval(async () => {
        const done = await poll();
        if (done) {
          clearInterval(intervalId);
          syncPollIntervalRef.current = null;
        }
      }, pollInterval);
      syncPollIntervalRef.current = intervalId;

      // Primera verificación inmediata (por si ya terminó)
      poll().then((done) => {
        if (done && syncPollIntervalRef.current === intervalId) {
          clearInterval(intervalId);
          syncPollIntervalRef.current = null;
        }
      });
    },
    syncMercadoPagoError: (error: string) => {
      setSyncLoading(false);
      notifications.show({
        title: "Error al sincronizar MercadoPago",
        message: error,
        color: "red",
      });
    },
    reconcileMercadoPagoUserSuccess: (summary: string) => {
      setReconcileUserId(null);
      notifications.show({
        title: "Usuario reconciliado con MercadoPago",
        message: summary,
        color: "green",
      });
      presenterRef.current?.getAppUsers?.();
    },
    reconcileMercadoPagoUserError: (error: string) => {
      setReconcileUserId(null);
      notifications.show({
        title: "Error al reconciliar usuario",
        message: error,
        color: "red",
      });
    },
  };

  const viewHandlers = useMemo(
    () => ({
      getUsersSuccess: (data: IAppUser[]) =>
        viewHandlersRef.current.getUsersSuccess(data),
      getUsersError: (e: string) => viewHandlersRef.current.getUsersError(e),
      updateUserSuccess: (data: IAppUser) =>
        viewHandlersRef.current.updateUserSuccess(data),
      updateUserError: (e: string) =>
        viewHandlersRef.current.updateUserError(e),
      createUserSuccess: (data: IAppUser) =>
        viewHandlersRef.current.createUserSuccess(data),
      createUserError: (e: string) =>
        viewHandlersRef.current.createUserError(e),
      deleteUserSuccess: (s: boolean) =>
        viewHandlersRef.current.deleteUserSuccess(s),
      deleteUserError: (e: string) =>
        viewHandlersRef.current.deleteUserError(e),
      syncMercadoPagoSuccess: () =>
        viewHandlersRef.current.syncMercadoPagoSuccess(),
      syncMercadoPagoError: (e: string) =>
        viewHandlersRef.current.syncMercadoPagoError(e),
      reconcileMercadoPagoUserSuccess: (s: string) =>
        viewHandlersRef.current.reconcileMercadoPagoUserSuccess(s),
      reconcileMercadoPagoUserError: (e: string) =>
        viewHandlersRef.current.reconcileMercadoPagoUserError(e),
    }),
    []
  );

  useEffect(() => {
    const p = presenterProvider.getPresenter(viewHandlers);
    presenterRef.current = p;
    setPresenter(p);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      presenter.getAppUsers();
    }
  }, [isLoaded]);

  const form = useForm<Partial<IAppUser>>({
    initialValues: {
      username: "",
      lastname: "",
      name: "",
      email: "",
      phone: "",
      forumUserId: "",
      forumEmail: "",
      mercadopago_email: "",
      mercadopagoCustomerId: "",
      mercadopagoExternalReference: "",
      password: "",
      status: true,
      subscription: "none" as SubscriptionStatus,
      subscriptionPlan: "",
    },
    validate: {
      username: (value) =>
        !value || !String(value).trim()
          ? "El nombre de usuario es obligatorio"
          : null,
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
        const searchDigits = search.replace(/\D/g, "");
        const fullName = (user.fullName || user.name || "").toLowerCase();
        const username = (user.username || "").toLowerCase();
        const email = (user.email || "").toLowerCase();
        const mercadopagoEmail = (user.mercadopago_email || "").toLowerCase();
        const phone = (user.phone || "").toLowerCase();
        const phoneDigits = phone.replace(/\D/g, "");
        const idStr = (user.id || "").toLowerCase();
        const forumId = (user.forumUserId || "").toLowerCase();
        const phoneMatches =
          phone.includes(search) ||
          (searchDigits.length > 0 &&
            phoneDigits.includes(searchDigits));
        if (
          !fullName.includes(search) &&
          !username.includes(search) &&
          !email.includes(search) &&
          !mercadopagoEmail.includes(search) &&
          !phoneMatches &&
          !idStr.includes(search) &&
          !forumId.includes(search)
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

  const handleSyncMercadoPago = () => {
    if (isLoaded && !syncLoading) {
      setSyncLoading(true);
      presenter.syncMercadoPago();
    }
  };

  const handleReconcileMercadoPagoUser = (user: IAppUser) => {
    if (!user.id || !isLoaded || reconcileUserId) return;
    setReconcileUserId(user.id);
    presenter.reconcileMercadoPagoUser(user.id);
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
      "ID app": user.id || "-",
      "ID foro": user.forumUserId || "-",
      "Nombre completo": user.fullName || user.name,
      "Nombre de usuario": user.username || "-",
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
      username: user.username ?? "",
      lastname: user.lastname ?? "",
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      forumUserId: user.forumUserId ?? "",
      forumEmail: user.forumEmail ?? "",
      mercadopago_email: user.mercadopago_email ?? "",
      mercadopagoCustomerId: user.mercadopagoCustomerId ?? "",
      mercadopagoExternalReference: user.mercadopagoExternalReference ?? "",
      password: "",
      status: user.status,
      subscription: user.subscription,
      subscriptionPlan: user.subscriptionPlan ?? "",
    });
    openModal();
  };

  const handleDelete = (user: IAppUser) => {
    setSelectedUser(user);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<IAppUser>) => {
    const mercadopago_email = values.mercadopago_email?.trim() || undefined;
    const forumUserId = values.forumUserId?.trim() || undefined;
    const forumEmail = values.forumEmail?.trim() || undefined;
    const mercadopagoCustomerId =
      values.mercadopagoCustomerId?.trim() || undefined;
    const mercadopagoExternalReference =
      values.mercadopagoExternalReference?.trim() || undefined;

    if (selectedUser && selectedUser.id) {
      const { password: _p, createdAt: _c, ...rest } = values;
      presenter.updateAppUser(selectedUser.id, {
        ...rest,
        mercadopago_email,
        forumUserId,
        forumEmail,
        mercadopagoCustomerId,
        mercadopagoExternalReference,
      });
    } else {
      const newUser: Partial<IAppUser> = {
        username: values.username!.trim(),
        lastname: values.lastname?.trim(),
        name: values.name!,
        email: values.email!,
        phone: values.phone,
        forumUserId,
        forumEmail,
        mercadopago_email,
        mercadopagoCustomerId,
        mercadopagoExternalReference,
        password: values.password?.trim() || undefined,
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
  /** Misma audiencia que puede usar JWT de panel (admin y editor son isAdmin en API). */
  const canReconcileMercadoPagoUser =
    hasPermission("admin") || hasPermission("editor");

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
          {hasPermission("admin") && (
            <Button
              leftSection={<IconUserPlus size={18} />}
              onClick={() => navigate(`/${routes.userMemberProvision}`)}
              variant="light"
              color="grape"
              styles={{
                root: {
                  backgroundColor: "var(--mantine-color-dark-7)",
                  color: "var(--mantine-color-grape-4)",
                  borderColor: "var(--mantine-color-dark-5)",
                },
              }}
            >
              Alta miembro (foro + MP)
            </Button>
          )}
          <Tooltip label="Sincroniza todos los usuarios; el proceso corre en segundo plano en el servidor.">
            <Button
              leftSection={<IconRefresh size={18} />}
              onClick={handleSyncMercadoPago}
              loading={syncLoading}
              variant="light"
              color="blue"
              styles={{
                root: {
                  backgroundColor: "var(--mantine-color-dark-7)",
                  color: "var(--mantine-color-blue-6)",
                  borderColor: "var(--mantine-color-dark-5)",
                },
              }}
            >
              Sincronizar todo (MercadoPago)
            </Button>
          </Tooltip>
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
        onMercadoPagoReconcile={
          canReconcileMercadoPagoUser
            ? handleReconcileMercadoPagoUser
            : undefined
        }
        mercadoPagoReconcileLoadingId={reconcileUserId}
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedUser ? "Editar usuario de la app" : "Nuevo usuario de la app"}
        centered
        size="lg"
        styles={{
          title: { fontWeight: 600, color: "white" },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Completá la cuenta en la app. Podés usar el mismo u otro email que en el foro y en
              Mercado Pago.
            </Text>
            <Divider label="Cuenta en la app" labelPosition="left" />
            <Group grow>
              <TextInput
                label="Usuario"
                placeholder="Ej. juan_perez"
                required
                {...form.getInputProps("username")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
              <TextInput
                label="Teléfono"
                placeholder="+54..."
                {...form.getInputProps("phone")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
            </Group>
            <Group grow>
              <TextInput
                label="Nombre"
                required
                {...form.getInputProps("name")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
              <TextInput
                label="Apellido"
                {...form.getInputProps("lastname")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
            </Group>
            <TextInput
              label="Email (app)"
              placeholder="email@ejemplo.com"
              required
              {...form.getInputProps("email")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            {!selectedUser && (
              <PasswordInput
                label="Contraseña (opcional)"
                description="Si la dejás vacía, el usuario recibe una clave aleatoria y debe usar recuperación."
                {...form.getInputProps("password")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
            )}
            <Divider label="Foro" labelPosition="left" />
            <Text size="xs" c="dimmed">
              ID del miembro en el foro (ej. id_member). Opcional: email registrado en el foro.
            </Text>
            <Group grow>
              <TextInput
                label="ID usuario en el foro"
                placeholder="Solo si ya existe en el foro"
                {...form.getInputProps("forumUserId")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
              <TextInput
                label="Email en el foro (opcional)"
                {...form.getInputProps("forumEmail")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
            </Group>
            <Divider label="Mercado Pago" labelPosition="left" />
            <TextInput
              label="Email de cobro Mercado Pago"
              placeholder="Puede diferir del email de la app"
              {...form.getInputProps("mercadopago_email")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <Button variant="subtle" size="xs" onClick={toggleAdvancedMp}>
              {advancedMpOpen ? "Ocultar" : "Mostrar"} datos técnicos MP (opcional)
            </Button>
            <Collapse in={advancedMpOpen}>
              <Stack gap="sm">
                <Text size="xs" c="dimmed">
                  Solo si los tenés del panel de Mercado Pago o soporte.
                </Text>
                <Group grow>
                  <TextInput
                    label="Customer ID"
                    {...form.getInputProps("mercadopagoCustomerId")}
                    styles={{
                      label: { color: "var(--mantine-color-dark-1)" },
                      input: { color: "var(--mantine-color-dark-1)" },
                    }}
                  />
                  <TextInput
                    label="External reference"
                    {...form.getInputProps("mercadopagoExternalReference")}
                    styles={{
                      label: { color: "var(--mantine-color-dark-1)" },
                      input: { color: "var(--mantine-color-dark-1)" },
                    }}
                  />
                </Group>
              </Stack>
            </Collapse>
            <Divider label="Estado y suscripción" labelPosition="left" />
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
                { value: "pending", label: "Pendiente (checkout MP)" },
                { value: "payment_failed", label: "Pago rechazado / fallido" },
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
            <Button variant="subtle" size="xs" onClick={toggleAdvancedSub}>
              {advancedSubOpen ? "Ocultar" : "Mostrar"} referencia interna de plan
            </Button>
            <Collapse in={advancedSubOpen}>
              <TextInput
                label="Referencia / plan (técnico)"
                description="Solo uso avanzado; en general no hace falta tocar esto."
                {...form.getInputProps("subscriptionPlan")}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
            </Collapse>
            {selectedUser?.id && (
              <Text size="xs" c="dimmed">
                ID app: <Code>{selectedUser.id}</Code>
                {selectedUser.forumUserId ? (
                  <>
                    {" · "}
                    ID foro: <Code>{selectedUser.forumUserId}</Code>
                  </>
                ) : null}
              </Text>
            )}
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
