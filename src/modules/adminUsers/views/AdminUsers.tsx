import { useState, useMemo } from 'react';
import { Modal, TextInput, Select, Stack, Button, Group, Badge } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { FilterBar, FilterOption } from '@/components/common/FilterBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { AdminUser, UserRole } from '@/types';
import { mockAdminUsers } from '@/data/mockData';

const filters: FilterOption[] = [
  { key: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar por nombre o email...' },
  {
    key: 'role',
    label: 'Rol',
    type: 'select',
    options: [
      { value: 'admin', label: 'Administrador' },
      { value: 'editor', label: 'Editor' },
    ],
  },
];

const columns: Column<AdminUser>[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  {
    key: 'role',
    label: 'Rol',
    render: (user) => (
      <Badge
        color={user.role === 'admin' ? 'white' : 'gray'}
        variant={user.role === 'admin' ? 'filled' : 'light'}
        styles={{
          root: user.role === 'admin' ? { backgroundColor: 'white', color: 'black' } : {},
        }}
      >
        {user.role === 'admin' ? 'Administrador' : 'Editor'}
      </Badge>
    ),
  },
  { key: 'createdAt', label: 'Fecha de creación' },
  { key: 'lastLogin', label: 'Último acceso', render: (user) => user.lastLogin || '-' },
];

export default function AdminUsers() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>(mockAdminUsers);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const form = useForm<Partial<AdminUser> & { password?: string }>({
    initialValues: {
      name: '',
      email: '',
      role: 'editor',
      password: '',
    },
    validate: {
      name: (value) => (!value ? 'El nombre es requerido' : null),
      email: (value) => {
        if (!value) return 'El email es requerido';
        if (!/^\S+@\S+$/.test(value)) return 'Email inválido';
        return null;
      },
      password: (value, values) => {
        if (!selectedUser && !value) return 'La contraseña es requerida';
        if (value && value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        return null;
      },
    },
  });

  const filteredUsers = useMemo(() => {
    return adminUsers.filter((user) => {
      if (filterValues.search) {
        const search = filterValues.search.toLowerCase();
        if (!user.name.toLowerCase().includes(search) && !user.email.toLowerCase().includes(search)) {
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

  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    form.setValues({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
    openModal();
  };

  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<AdminUser> & { password?: string }) => {
    if (selectedUser) {
      setAdminUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id
            ? { ...u, name: values.name!, email: values.email!, role: values.role as UserRole }
            : u
        )
      );
      notifications.show({
        title: 'Usuario admin actualizado',
        message: 'Los datos del usuario han sido actualizados correctamente.',
        color: 'green',
      });
    } else {
      const newUser: AdminUser = {
        id: String(Date.now()),
        name: values.name!,
        email: values.email!,
        role: values.role as UserRole,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setAdminUsers((prev) => [newUser, ...prev]);
      notifications.show({
        title: 'Usuario admin creado',
        message: 'El nuevo usuario admin ha sido creado correctamente.',
        color: 'green',
      });
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (selectedUser) {
      setAdminUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      notifications.show({
        title: 'Usuario admin eliminado',
        message: 'El usuario admin ha sido eliminado correctamente.',
        color: 'red',
      });
    }
    closeDeleteModal();
  };

  return (
    <MainLayout>
      <PageHeader
        title="Usuarios Admin"
        description="Gestiona los usuarios con acceso al panel de administración"
        action={{ label: 'Nuevo Admin', onClick: handleCreate }}
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
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedUser ? 'Editar Usuario Admin' : 'Nuevo Usuario Admin'}
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
              label={selectedUser ? 'Nueva contraseña (dejar vacío para mantener)' : 'Contraseña'}
              placeholder="••••••••"
              type="password"
              {...form.getInputProps('password')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Select
              label="Rol"
              data={[
                { value: 'admin', label: 'Administrador - Acceso completo' },
                { value: 'editor', label: 'Editor - Acceso limitado' },
              ]}
              {...form.getInputProps('role')}
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
        title="Eliminar Usuario Admin"
        message={`¿Estás seguro de que deseas eliminar a ${selectedUser?.name}? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
      />
    </MainLayout>
  );
}
