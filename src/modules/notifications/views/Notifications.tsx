import { useState, useMemo } from 'react';
import { Modal, TextInput, Select, Stack, Button, Group, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column, StatusBadge } from '@/components/common/DataTable';
import { FilterBar, FilterOption } from '@/components/common/FilterBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { PushNotification } from '@/types';
import { mockNotifications } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const filters: FilterOption[] = [
  { key: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar por título...' },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'draft', label: 'Borrador' },
      { value: 'scheduled', label: 'Programado' },
      { value: 'sent', label: 'Enviado' },
      { value: 'failed', label: 'Fallido' },
    ],
  },
  {
    key: 'targetAudience',
    label: 'Audiencia',
    type: 'select',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'users', label: 'Usuarios' },
      { value: 'commerces', label: 'Comercios' },
    ],
  },
];

const audienceLabels: Record<string, string> = {
  all: 'Todos',
  users: 'Usuarios',
  commerces: 'Comercios',
  specific: 'Específico',
};

const columns: Column<PushNotification>[] = [
  { key: 'title', label: 'Título' },
  {
    key: 'message',
    label: 'Mensaje',
    render: (notification) =>
      notification.message.length > 50
        ? `${notification.message.substring(0, 50)}...`
        : notification.message,
  },
  {
    key: 'targetAudience',
    label: 'Audiencia',
    render: (notification) => audienceLabels[notification.targetAudience],
  },
  {
    key: 'status',
    label: 'Estado',
    render: (notification) => <StatusBadge status={notification.status} />,
  },
  { key: 'createdAt', label: 'Creado' },
  { key: 'createdBy', label: 'Creado por' },
];

export default function Notifications() {
  const { hasPermission, user } = useAuth();
  const [notificationsList, setNotificationsList] = useState<PushNotification[]>(mockNotifications);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedNotification, setSelectedNotification] = useState<PushNotification | null>(null);

  const form = useForm<Partial<PushNotification>>({
    initialValues: {
      title: '',
      message: '',
      targetAudience: 'all',
      status: 'draft',
    },
    validate: {
      title: (value) => (!value ? 'El título es requerido' : null),
      message: (value) => (!value ? 'El mensaje es requerido' : null),
    },
  });

  const filteredNotifications = useMemo(() => {
    return notificationsList.filter((notification) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (!notification.title.toLowerCase().includes(search)) return false;
      }
      if (filterValues.status && notification.status !== filterValues.status) return false;
      if (filterValues.targetAudience && notification.targetAudience !== filterValues.targetAudience) return false;
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

  const handleEdit = (notification: PushNotification) => {
    setSelectedNotification(notification);
    form.setValues({
      title: notification.title,
      message: notification.message,
      targetAudience: notification.targetAudience,
      status: notification.status,
    });
    openModal();
  };

  const handleDelete = (notification: PushNotification) => {
    setSelectedNotification(notification);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<PushNotification>) => {
    if (selectedNotification) {
      setNotificationsList((prev) =>
        prev.map((n) => (n.id === selectedNotification.id ? { ...n, ...values } : n))
      );
      notifications.show({
        title: 'Notificación actualizada',
        message: 'La notificación ha sido actualizada correctamente.',
        color: 'green',
      });
    } else {
      const newNotification: PushNotification = {
        id: String(Date.now()),
        title: values.title!,
        message: values.message!,
        targetAudience: values.targetAudience as 'all' | 'users' | 'commerces' | 'specific',
        status: values.status as 'draft' | 'scheduled' | 'sent' | 'failed',
        createdAt: new Date().toISOString().split('T')[0],
        createdBy: user?.name || 'Unknown',
      };
      setNotificationsList((prev) => [newNotification, ...prev]);
      notifications.show({
        title: 'Notificación creada',
        message: 'La nueva notificación ha sido creada correctamente.',
        color: 'green',
      });
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (selectedNotification) {
      setNotificationsList((prev) => prev.filter((n) => n.id !== selectedNotification.id));
      notifications.show({
        title: 'Notificación eliminada',
        message: 'La notificación ha sido eliminada correctamente.',
        color: 'red',
      });
    }
    closeDeleteModal();
  };

  const canEdit = hasPermission('editor');
  const canDelete = hasPermission('admin');

  return (
    <MainLayout>
      <PageHeader
        title="Notificaciones Push"
        description="Gestiona las notificaciones push de la plataforma"
        action={{ label: 'Nueva Notificación', onClick: handleCreate }}
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
        canEdit={canEdit}
        canDelete={canDelete}
        emptyMessage="No se encontraron notificaciones"
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedNotification ? 'Editar Notificación' : 'Nueva Notificación'}
        centered
        size="lg"
        styles={{
          title: { fontWeight: 600, color: 'white' },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Título"
              placeholder="Título de la notificación"
              {...form.getInputProps('title')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Textarea
              label="Mensaje"
              placeholder="Contenido de la notificación"
              minRows={3}
              {...form.getInputProps('message')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Select
              label="Audiencia"
              data={[
                { value: 'all', label: 'Todos' },
                { value: 'users', label: 'Solo Usuarios' },
                { value: 'commerces', label: 'Solo Comercios' },
              ]}
              {...form.getInputProps('targetAudience')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Select
              label="Estado"
              data={[
                { value: 'draft', label: 'Borrador' },
                { value: 'scheduled', label: 'Programado' },
                { value: 'sent', label: 'Enviar ahora' },
              ]}
              {...form.getInputProps('status')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="subtle" color="gray" onClick={closeModal}>
                Cancelar
              </Button>
              <Button
                type="submit"
                styles={{
                  root: { backgroundColor: 'white', color: 'black' },
                }}
              >
                {selectedNotification ? 'Guardar cambios' : 'Crear notificación'}
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
    </MainLayout>
  );
}
