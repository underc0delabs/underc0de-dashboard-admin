import { useState, useMemo } from 'react';
import { Modal, TextInput, Select, Stack, Button, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column, StatusBadge } from '@/components/common/DataTable';
import { FilterBar, FilterOption } from '@/components/common/FilterBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { User, SubscriptionStatus } from '@/types';
import { mockUsers } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const filters: FilterOption[] = [
  { key: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar por nombre o email...' },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
      { value: 'suspended', label: 'Suspendido' },
    ],
  },
  {
    key: 'subscription',
    label: 'Suscripción',
    type: 'select',
    options: [
      { value: 'active', label: 'Activa' },
      { value: 'trial', label: 'Prueba' },
      { value: 'expired', label: 'Expirada' },
      { value: 'cancelled', label: 'Cancelada' },
      { value: 'none', label: 'Sin suscripción' },
    ],
  },
];

const columns: Column<User>[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Teléfono', render: (user) => user.phone || '-' },
  {
    key: 'subscription',
    label: 'Suscripción',
    render: (user) => <StatusBadge status={user.subscription} />,
  },
  { key: 'subscriptionPlan', label: 'Plan', render: (user) => user.subscriptionPlan || '-' },
  {
    key: 'status',
    label: 'Estado',
    render: (user) => <StatusBadge status={user.status} />,
  },
];

export default function Users() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const form = useForm<Partial<User>>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      status: 'active',
      subscription: 'none' as SubscriptionStatus,
      subscriptionPlan: '',
    },
    validate: {
      name: (value) => (!value ? 'El nombre es requerido' : null),
      email: (value) => {
        if (!value) return 'El email es requerido';
        if (!/^\S+@\S+$/.test(value)) return 'Email inválido';
        return null;
      },
    },
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (!user.name.toLowerCase().includes(search) && !user.email.toLowerCase().includes(search)) {
          return false;
        }
      }
      if (filterValues.status && user.status !== filterValues.status) return false;
      if (filterValues.subscription && user.subscription !== filterValues.subscription) return false;
      return true;
    });
  }, [users, filterValues]);

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

  const handleEdit = (user: User) => {
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

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<User>) => {
    if (selectedUser) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...values } : u))
      );
      notifications.show({
        title: 'Usuario actualizado',
        message: 'Los datos del usuario han sido actualizados correctamente.',
        color: 'green',
      });
    } else {
      const newUser: User = {
        id: String(Date.now()),
        name: values.name!,
        email: values.email!,
        phone: values.phone,
        status: values.status as 'active' | 'inactive' | 'suspended',
        subscription: values.subscription as SubscriptionStatus,
        subscriptionPlan: values.subscriptionPlan,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [newUser, ...prev]);
      notifications.show({
        title: 'Usuario creado',
        message: 'El nuevo usuario ha sido creado correctamente.',
        color: 'green',
      });
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      notifications.show({
        title: 'Usuario eliminado',
        message: 'El usuario ha sido eliminado correctamente.',
        color: 'red',
      });
    }
    closeDeleteModal();
  };

  const canEdit = hasPermission('admin');
  const canDelete = hasPermission('admin');

  return (
    <MainLayout>
      <PageHeader
        title="Usuarios"
        description="Gestiona los usuarios de la plataforma"
        action={canEdit ? { label: 'Nuevo Usuario', onClick: handleCreate } : undefined}
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
        canEdit={canEdit}
        canDelete={canDelete}
        emptyMessage="No se encontraron usuarios"
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        centered
        styles={{
          title: { fontWeight: 600, color: 'white' },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Nombre completo"
              {...form.getInputProps('name')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <TextInput
              label="Email"
              placeholder="email@ejemplo.com"
              {...form.getInputProps('email')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <TextInput
              label="Teléfono"
              placeholder="+54 11 1234-5678"
              {...form.getInputProps('phone')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Select
              label="Estado"
              data={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
                { value: 'suspended', label: 'Suspendido' },
              ]}
              {...form.getInputProps('status')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Select
              label="Suscripción"
              data={[
                { value: 'active', label: 'Activa' },
                { value: 'trial', label: 'Prueba' },
                { value: 'expired', label: 'Expirada' },
                { value: 'cancelled', label: 'Cancelada' },
                { value: 'none', label: 'Sin suscripción' },
              ]}
              {...form.getInputProps('subscription')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <TextInput
              label="Plan"
              placeholder="Basic, Premium, Enterprise..."
              {...form.getInputProps('subscriptionPlan')}
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
                {selectedUser ? 'Guardar cambios' : 'Crear usuario'}
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
    </MainLayout>
  );
}
