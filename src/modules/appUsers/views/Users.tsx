import { useState, useMemo, useEffect } from 'react';
import { Modal, TextInput, Select, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column, StatusBadge } from '@/components/common/DataTable';
import { FilterBar, FilterOption } from '@/components/common/FilterBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { IAppUsersPresenter } from '../core/presentation/iAppUsersPresenter';
import { appUsersPresenterProvider } from '../infrastructure/presentation/presenterProvider';
import { IAppUser, SubscriptionStatus } from '../core/entities/iAppUser';
import { IAppUsersViews } from '../core/views/iAppUsersViews';
import { useAuth } from '@/context/AuthContext';

const filters: FilterOption[] = [
  { key: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar por nombre o email...' },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'Activo', label: 'Activo' },
      { value: 'Inactivo', label: 'Inactivo' },
    ],
  },
  {
    key: 'subscription',
    label: 'Suscripción',
    type: 'select',
    options: [
      { value: 'active', label: 'Activa' },
      { value: 'expired', label: 'Expirada' },
      { value: 'cancelled', label: 'Cancelada' },
      { value: 'none', label: 'Sin suscripción' },
    ],
  },
];

const columns: Column<IAppUser>[] = [
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
    render: (user) => <StatusBadge status={user.status ? 'Activo' : 'Inactivo'} />,
  },
];

export default function Users() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<IAppUser[]>([]);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<IAppUser | null>(null);
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
        title: 'Error al obtener los usuarios',
        message: error,
        color: 'red',
      });
    },
    updateUserSuccess: (user: IAppUser) => {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
      notifications.show({
        title: 'Usuario actualizado',
        message: 'Los datos del usuario han sido actualizados correctamente.',
        color: 'green',
      });
      closeModal();
    },
    updateUserError: (error: string) => {
      notifications.show({
        title: 'Error al actualizar el usuario',
        message: error,
        color: 'red',
      });
    },
    createUserSuccess: (user: IAppUser) => {
      setUsers((prev) => [user, ...prev]);
      notifications.show({
        title: 'Usuario creado',
        message: 'El nuevo usuario ha sido creado correctamente.',
        color: 'green',
      });
      closeModal();
    },
    createUserError: (error: string) => {
      notifications.show({
        title: 'Error al crear el usuario',
        message: error,
        color: 'red',
      });
    },
    deleteUserSuccess: function (success: boolean): void {
      if (success) {
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser?.id));
      }
      notifications.show({
        title: 'Usuario eliminado',
        message: 'El usuario ha sido eliminado correctamente.',
        color: 'green',
      });
      closeDeleteModal();
    },
    deleteUserError: function (error: string): void {
      notifications.show({
        title: 'Error al eliminar el usuario',
        message: error,
        color: 'red',
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
      name: '',
      email: '',
      phone: '',
      status: true,
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
      if (filterValues.status) {
        const statusLabel = user.status ? 'Activo' : 'Inactivo';
        if (statusLabel !== filterValues.status) return false;
      }
      if (filterValues.subscription && user.subscription !== filterValues.subscription) return false;
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
        subscription: values.subscription || 'none',
        subscriptionPlan: values.subscriptionPlan,
        createdAt: new Date().toISOString().split('T')[0],
      };
      presenter.createAppUser(newUser);
    }
  };

  const confirmDelete = () => {
    if (selectedUser && selectedUser.id) {
      presenter.deleteAppUser(selectedUser.id);
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

      <Group justify="space-between" mb="md">
        <Select
          label="Elementos por página"
          value={itemsPerPage.toString()}
          onChange={handleItemsPerPageChange}
          data={[
            { value: '10', label: '10' },
            { value: '25', label: '25' },
            { value: '50', label: '50' },
            { value: '100', label: '100' },
          ]}
          styles={{
            label: { color: 'var(--mantine-color-dark-1)' },
            input: { 
              color: 'var(--mantine-color-dark-1)',
              backgroundColor: 'var(--mantine-color-dark-7)',
              borderColor: 'var(--mantine-color-dark-5)',
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
              styles={{
                label: { color: 'var(--mantine-color-dark-1)' },
                input: { color: 'var(--mantine-color-dark-1)' },
              }}
            />
            <TextInput
              label="Email"
              placeholder="email@ejemplo.com"
              {...form.getInputProps('email')}
              styles={{
                label: { color: 'var(--mantine-color-dark-1)' },
                input: { color: 'var(--mantine-color-dark-1)' },
              }}
            />
            <TextInput
              label="Teléfono"
              placeholder="+54 11 1234-5678"
              {...form.getInputProps('phone')}
              styles={{
                label: { color: 'var(--mantine-color-dark-1)' },
                input: { color: 'var(--mantine-color-dark-1)' },
              }}
            />
            <Select
              label="Estado"
              data={[
                { value: 'true', label: 'Activo' },
                { value: 'false', label: 'Inactivo' },
              ]}
              value={form.values.status?.toString() || ''}
              onChange={(value) => form.setFieldValue('status', value === 'true')}
              styles={{
                label: { color: 'var(--mantine-color-dark-1)' },
                input: { color: 'var(--mantine-color-dark-1)' },
              }}
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
              styles={{
                label: { color: 'var(--mantine-color-dark-1)' },
                input: { color: 'var(--mantine-color-dark-1)' },
              }}
            />
            <TextInput
              label="Plan"
              placeholder="Basic, Premium, Enterprise..."
              {...form.getInputProps('subscriptionPlan')}
              styles={{
                label: { color: 'var(--mantine-color-dark-1)' },
                input: { color: 'var(--mantine-color-dark-1)' },
              }}
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
