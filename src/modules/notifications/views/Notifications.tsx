import { useState, useMemo, useEffect } from "react";
import {
  Modal,
  TextInput,
  Select,
  Stack,
  Button,
  Group,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column, StatusBadge } from "@/components/common/DataTable";
import { FilterBar, FilterOption } from "@/components/common/FilterBar";
import { ConfirmModal } from "@/components/common/ConfirmModal";
import { notificationPresenterProvider } from "../infrastructure/presentation/presenterProvider";
import { INotificationPresenter } from "../core/presentation/iNotificationPresenter";
import { INotificationViews } from "../core/views/iNotificationViews";
import { INotification } from "../core/entities/iNotification";
import { useAuth } from "@/context/AuthContext";
import { useDependency } from "@/hooks/useDependency";
import { IGetAppUsersAction } from "@/modules/appUsers/core/actions/getAppUsersAction";
import { IAppUser } from "@/modules/appUsers/core/entities/iAppUser";

const filters: FilterOption[] = [
  {
    key: "search",
    label: "Buscar",
    type: "text",
    placeholder: "Buscar por título...",
  },
  {
    key: "audience",
    label: "Audiencia",
    type: "select",
    options: [
      { value: "todos", label: "Todos" },
      { value: "usersPro", label: "Usuarios Pro" },
      { value: "normalUsers", label: "Usuarios Normales" },
    ],
  },
];

const audienceLabels: Record<string, string> = {
  todos: "Todos",
  usersPro: "Usuarios Pro",
  normalUsers: "Usuarios Normales",
};

const columns: Column<INotification>[] = [
  { key: "title", label: "Título" },
  {
    key: "message",
    label: "Mensaje",
    render: (notification) =>
      notification.message.length > 50
        ? `${notification.message.substring(0, 50)}...`
        : notification.message,
  },
  {
    key: "audience",
    label: "Audiencia",
    render: (notification) => {
      if (notification.userId) {
        return "Usuario específico";
      }
      return audienceLabels[notification.audience];
    },
  },
  { key: "createdAt", label: "Creado" },
  { key: "createdBy", label: "Creado por" },
];

export default function Notifications() {
  const { hasPermission, user } = useAuth();
  const [notificationsList, setNotificationsList] = useState<INotification[]>(
    []
  );
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] =
    useDisclosure(false);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const [selectedNotification, setSelectedNotification] =
    useState<INotification | null>(null);
  const [users, setUsers] = useState<IAppUser[]>([]);
  const presenterProvider = notificationPresenterProvider();
  const [presenter, setPresenter] = useState<INotificationPresenter>(
    {} as INotificationPresenter
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const getAppUsersAction = useDependency<IGetAppUsersAction>("getAppUsersAction");

  const viewHandlers: INotificationViews = useMemo(
    () => ({
      getNotificationsSuccess: (notifications) => {
        setNotificationsList(notifications);
      },
      getNotificationsError: (error) => {
        notifications.show({
          title: "Error",
          message: error.message,
          color: "red",
        });
      },
      createNotificationSuccess: (notification) => {
        setNotificationsList((prev) => [notification, ...prev]);
        notifications.show({
          title: "Notificación creada",
          message: "La nueva notificación ha sido creada correctamente.",
          color: "green",
        });
        closeModal();
      },
      createNotificationError: (error) => {
        notifications.show({
          title: "Error",
          message: error.message,
          color: "red",
        });
      },
      updateNotificationSuccess: (notification) => {
        setNotificationsList((prev) =>
          prev.map((n) => (n.id === notification.id ? notification : n))
        );
        notifications.show({
          title: "Notificación actualizada",
          message: "La notificación ha sido actualizada correctamente.",
          color: "green",
        });
        closeModal();
      },
      updateNotificationError: (error) => {
        notifications.show({
          title: "Error",
          message: error.message,
          color: "red",
        });
      },
      deleteNotificationSuccess: () => {
        setNotificationsList((prev) =>
          prev.filter((n) => n.id !== selectedNotification?.id)
        );
        notifications.show({
          title: "Notificación eliminada",
          message: "La notificación ha sido eliminada correctamente.",
          color: "green",
        });
        closeDeleteModal();
      },
      deleteNotificationError: (error) => {
        notifications.show({
          title: "Error",
          message: error.message,
          color: "red",
        });
      },
    }),
    [closeModal, closeDeleteModal, selectedNotification?.id]
  );

  useEffect(() => {
    setPresenter(presenterProvider.getPresenter(viewHandlers));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      presenter.getNotifications();
    }
  }, [isLoaded]);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersList = await getAppUsersAction.execute();
        setUsers(usersList);
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      }
    };
    loadUsers();
  }, [getAppUsersAction]);

  const form = useForm<Partial<INotification>>({
    initialValues: {
      title: "",
      message: "",
      audience: "todos",
      userId: undefined,
    },
    validate: {
      title: (value) => (!value ? "El título es requerido" : null),
      message: (value) => (!value ? "El mensaje es requerido" : null),
    },
  });

  const filteredNotifications = useMemo(() => {
    return notificationsList.filter((notification) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (!notification.title.toLowerCase().includes(search)) return false;
      }
      if (filterValues.audience && notification.audience !== filterValues.audience)
        return false;
      return true;
    });
  }, [notificationsList, filterValues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilterValues({});
  };

  const handleCreate = () => {
    setSelectedNotification(null);
    form.reset();
    openModal();
  };

  const handleEdit = (notification: INotification) => {
    setSelectedNotification(notification);
    form.setValues({
      title: notification.title,
      message: notification.message,
      audience: notification.audience,
      userId: notification.userId,
    });
    openModal();  
  };

  const handleDelete = (notification: INotification) => {
    setSelectedNotification(notification);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<INotification>) => {
    if (selectedNotification && selectedNotification.id) {
      presenter.updateNotification(selectedNotification.id, {
        ...values,
        updatedBy: user?.id,
        updatedAt: new Date().toISOString().split('T')[0],
      });
    } else {
      const newNotification: Partial<INotification> = {
        title: values.title!,
        message: values.message!,
        audience: values.audience!,
        userId: values.userId,
        createdBy: user?.id,
        createdAt: new Date().toISOString().split('T')[0],
      };
      presenter.createNotification(newNotification);
    }
  };

  const confirmDelete = () => {
    if (selectedNotification && selectedNotification.id) {
      presenter.deleteNotification(selectedNotification.id);
    }
  };

  return (
    <>
      <PageHeader
        title="Notificaciones Push"
        description="Gestiona las notificaciones push de la plataforma"
        action={{ label: "Nueva Notificación", onClick: handleCreate }}
      />

      <FilterBar
        filters={filters}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
      />

      <DataTable
        data={filteredNotifications}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canEdit={true}
        canDelete={true}
        emptyMessage="No se encontraron notificaciones"
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={
          selectedNotification ? "Editar Notificación" : "Nueva Notificación"
        }
        centered
        size="lg"
        styles={{
          title: { fontWeight: 600, color: "white" },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Título"
              placeholder="Título de la notificación"
              {...form.getInputProps("title")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <Textarea
              label="Mensaje"
              placeholder="Contenido de la notificación"
              minRows={3}
              {...form.getInputProps("message")}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            <Select
              label="Audiencia"
              data={[
                { value: "todos", label: "Todos" },
                { value: "usersPro", label: "Solo Usuarios Pro" },
                { value: "normalUsers", label: "Solo Usuarios Normales" },
                ...(form.values.userId
                  ? [{ value: "usuarioEspecifico", label: "Usuario específico" }]
                  : []),
              ]}
              value={form.values.userId ? "usuarioEspecifico" : form.values.audience}
              onChange={(value) => {
                if (value === "usuarioEspecifico") return;
                const audienceValue = (value as "todos" | "usersPro" | "normalUsers") || "todos";
                form.setFieldValue("audience", audienceValue);
                form.setFieldValue("userId", undefined);
              }}
              styles={{
                label: { color: "var(--mantine-color-dark-1)" },
                input: { color: "var(--mantine-color-dark-1)" },
              }}
            />
            {!selectedNotification && (
              <Select
                label="Usuario específico (opcional)"
                placeholder="Selecciona un usuario para enviar solo a él"
                data={users
                  .filter((user) => user.id)
                  .map((user) => ({
                    value: String(user.id!),
                    label: `${user.name} (${user.email})`,
                  }))}
                searchable
                clearable
                value={form.values.userId ? String(form.values.userId) : null}
                onChange={(value) => {
                  form.setFieldValue("userId", value || undefined);
                }}
                styles={{
                  label: { color: "var(--mantine-color-dark-1)" },
                  input: { color: "var(--mantine-color-dark-1)" },
                }}
              />
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
                {selectedNotification
                  ? "Guardar cambios"
                  : "Crear notificación"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <ConfirmModal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Eliminar Notificación"
        message={`¿Estás seguro de que deseas eliminar la notificación "${selectedNotification?.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </>
  );
}
