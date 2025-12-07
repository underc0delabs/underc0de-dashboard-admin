import { useState, useMemo } from 'react';
import { Modal, TextInput, Select, Stack, Button, Group } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column, StatusBadge } from '@/components/common/DataTable';
import { FilterBar, FilterOption } from '@/components/common/FilterBar';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { Commerce } from '@/types';
import { mockCommerces } from '@/data/mockData';
import { useAuth } from '@/context/AuthContext';

const filters: FilterOption[] = [
  { key: 'search', label: 'Buscar', type: 'text', placeholder: 'Buscar por nombre...' },
  {
    key: 'status',
    label: 'Estado',
    type: 'select',
    options: [
      { value: 'active', label: 'Activo' },
      { value: 'inactive', label: 'Inactivo' },
      { value: 'pending', label: 'Pendiente' },
    ],
  },
  {
    key: 'category',
    label: 'Categoría',
    type: 'select',
    options: [
      { value: 'Gastronomía', label: 'Gastronomía' },
      { value: 'Tecnología', label: 'Tecnología' },
      { value: 'Deportes', label: 'Deportes' },
      { value: 'Educación', label: 'Educación' },
      { value: 'Salud', label: 'Salud' },
      { value: 'Entretenimiento', label: 'Entretenimiento' },
    ],
  },
];

const columns: Column<Commerce>[] = [
  { key: 'name', label: 'Nombre' },
  { key: 'category', label: 'Categoría' },
  { key: 'address', label: 'Dirección' },
  { key: 'phone', label: 'Teléfono', render: (commerce) => commerce.phone || '-' },
  { key: 'email', label: 'Email', render: (commerce) => commerce.email || '-' },
  {
    key: 'status',
    label: 'Estado',
    render: (commerce) => <StatusBadge status={commerce.status} />,
  },
];

export default function Commerces() {
  const { hasPermission } = useAuth();
  const [commerces, setCommerces] = useState<Commerce[]>(mockCommerces);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [modalOpened, { open: openModal, close: closeModal }] = useDisclosure(false);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [selectedCommerce, setSelectedCommerce] = useState<Commerce | null>(null);

  const form = useForm<Partial<Commerce>>({
    initialValues: {
      name: '',
      category: '',
      address: '',
      phone: '',
      email: '',
      status: 'pending',
    },
    validate: {
      name: (value) => (!value ? 'El nombre es requerido' : null),
      category: (value) => (!value ? 'La categoría es requerida' : null),
      address: (value) => (!value ? 'La dirección es requerida' : null),
      email: (value) => {
        if (value && !/^\S+@\S+$/.test(value)) return 'Email inválido';
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
      if (filterValues.status && commerce.status !== filterValues.status) return false;
      if (filterValues.category && commerce.category !== filterValues.category) return false;
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
    setSelectedCommerce(null);
    form.reset();
    openModal();
  };

  const handleEdit = (commerce: Commerce) => {
    setSelectedCommerce(commerce);
    form.setValues({
      name: commerce.name,
      category: commerce.category,
      address: commerce.address,
      phone: commerce.phone,
      email: commerce.email,
      status: commerce.status,
    });
    openModal();
  };

  const handleDelete = (commerce: Commerce) => {
    setSelectedCommerce(commerce);
    openDeleteModal();
  };

  const handleSubmit = (values: Partial<Commerce>) => {
    if (selectedCommerce) {
      setCommerces((prev) =>
        prev.map((c) => (c.id === selectedCommerce.id ? { ...c, ...values } : c))
      );
      notifications.show({
        title: 'Comercio actualizado',
        message: 'Los datos del comercio han sido actualizados correctamente.',
        color: 'green',
      });
    } else {
      const newCommerce: Commerce = {
        id: String(Date.now()),
        name: values.name!,
        category: values.category!,
        address: values.address!,
        phone: values.phone,
        email: values.email,
        status: values.status as 'active' | 'inactive' | 'pending',
        ownerId: '1',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCommerces((prev) => [newCommerce, ...prev]);
      notifications.show({
        title: 'Comercio creado',
        message: 'El nuevo comercio ha sido creado correctamente.',
        color: 'green',
      });
    }
    closeModal();
  };

  const confirmDelete = () => {
    if (selectedCommerce) {
      setCommerces((prev) => prev.filter((c) => c.id !== selectedCommerce.id));
      notifications.show({
        title: 'Comercio eliminado',
        message: 'El comercio ha sido eliminado correctamente.',
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
        title="Comercios"
        description="Gestiona los comercios de la plataforma"
        action={canEdit ? { label: 'Nuevo Comercio', onClick: handleCreate } : undefined}
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
        canEdit={canEdit}
        canDelete={canDelete}
        emptyMessage="No se encontraron comercios"
      />

      <Modal
        opened={modalOpened}
        onClose={closeModal}
        title={selectedCommerce ? 'Editar Comercio' : 'Nuevo Comercio'}
        centered
        styles={{
          title: { fontWeight: 600, color: 'white' },
        }}
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Nombre"
              placeholder="Nombre del comercio"
              {...form.getInputProps('name')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Select
              label="Categoría"
              placeholder="Selecciona una categoría"
              data={[
                { value: 'Gastronomía', label: 'Gastronomía' },
                { value: 'Tecnología', label: 'Tecnología' },
                { value: 'Deportes', label: 'Deportes' },
                { value: 'Educación', label: 'Educación' },
                { value: 'Salud', label: 'Salud' },
                { value: 'Entretenimiento', label: 'Entretenimiento' },
              ]}
              {...form.getInputProps('category')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <TextInput
              label="Dirección"
              placeholder="Dirección completa"
              {...form.getInputProps('address')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <TextInput
              label="Teléfono"
              placeholder="+54 11 1234-5678"
              {...form.getInputProps('phone')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <TextInput
              label="Email"
              placeholder="email@comercio.com"
              {...form.getInputProps('email')}
              styles={{ label: { color: 'var(--mantine-color-dark-1)' } }}
            />
            <Select
              label="Estado"
              data={[
                { value: 'active', label: 'Activo' },
                { value: 'inactive', label: 'Inactivo' },
                { value: 'pending', label: 'Pendiente' },
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
                {selectedCommerce ? 'Guardar cambios' : 'Crear comercio'}
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
