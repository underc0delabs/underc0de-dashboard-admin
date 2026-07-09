import {
  Table,
  Paper,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  Badge,
  Pagination,
  Center,
} from "@mantine/core";
import {
  IconCopy,
  IconEdit,
  IconTrash,
  IconEye,
  IconReceipt2,
} from "@tabler/icons-react";
import { ReactNode } from "react";
import classes from "./DataTable.module.css";
import { useAuth } from "@/context/AuthContext";
import { AdminUserRole } from "@/modules/adminUsers/core/entities/iAdminUser";
export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDuplicate?: (item: T) => void;
  onView?: (item: T) => void;
  canEditItem?: (item: T) => boolean;
  canDeleteItem?: (item: T) => boolean;
  editDisabledReason?: (item: T) => string | undefined;
  deleteDisabledReason?: (item: T) => string | undefined;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  canEdit?: boolean;
  canDelete?: boolean;
  isFromUserAdmin?: boolean;
  onMercadoPagoReconcile?: (item: T) => void;
  mercadoPagoReconcileLoadingId?: string | null;
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onDuplicate,
  onView,
  canEditItem,
  canDeleteItem,
  editDisabledReason,
  deleteDisabledReason,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = "No hay datos disponibles",
  canEdit = true,
  canDelete = true,
  isFromUserAdmin = false,
  onMercadoPagoReconcile,
  mercadoPagoReconcileLoadingId = null,
}: DataTableProps<T>) {
  const user = useAuth();
  const userId = user.user?.id;
  const isUserAdmin =
    user.user?.role.toLowerCase() === AdminUserRole.ADMIN.toLowerCase();

  if (data.length === 0) {
    return (
      <Paper p="xl" radius="md" className={classes.paper}>
        <Center>
          <Text c="dimmed">{emptyMessage}</Text>
        </Center>
      </Paper>
    );
  }

  return (
    <Paper radius="md" className={classes.paper}>
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="sm" className={classes.table}>
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Table.Th key={String(col.key)} className={classes.th}>
                  {col.label}
                </Table.Th>
              ))}
              <Table.Th className={classes.th}>Acciones</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {data.map((item) => {
              const rowCanEdit = canEditItem ? canEditItem(item) : canEdit;
              const rowCanDelete = canDeleteItem
                ? canDeleteItem(item)
                : canDelete;
              const editReason = editDisabledReason?.(item);
              const deleteReason = deleteDisabledReason?.(item);
              const isSelfDeleteBlocked =
                isFromUserAdmin && item.id === userId;

              return (
              <Table.Tr key={item.id} className={classes.tr}>
                {columns.map((col) => (
                  <Table.Td
                    key={`${item.id}-${String(col.key)}`}
                    className={classes.td}
                  >
                    {col.render
                      ? col.render(item)
                      : String(item[col.key as keyof T] ?? "-")}
                  </Table.Td>
                ))}
                <Table.Td className={classes.td}>
                  <Group gap="xs">
                    {onView && (
                      <Tooltip label="Ver detalles">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => onView(item)}
                        >
                          <IconEye size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {onEdit && (
                      <Tooltip
                        label={
                          !rowCanEdit && editReason
                            ? editReason
                            : "Editar"
                        }>
                        <span>
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            disabled={!rowCanEdit}
                            onClick={() => onEdit(item)}
                          >
                            <IconEdit size={18} />
                          </ActionIcon>
                        </span>
                      </Tooltip>
                    )}
                    {onDuplicate && (
                      <Tooltip label="Duplicar">
                        <ActionIcon
                          variant="subtle"
                          color="cyan"
                          onClick={() => onDuplicate(item)}
                        >
                          <IconCopy size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {onDelete && (
                      <Tooltip
                        label={
                          isSelfDeleteBlocked
                            ? "No puedes eliminar tu propio usuario"
                            : !rowCanDelete && deleteReason
                              ? deleteReason
                              : "Eliminar"
                        }
                      >
                        <span>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            disabled={isSelfDeleteBlocked || !rowCanDelete}
                            onClick={() => onDelete(item)}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </span>
                      </Tooltip>
                    )}
                    {onMercadoPagoReconcile && item.id && (
                      <Tooltip label="Reconciliar MercadoPago (solo este usuario)">
                        <ActionIcon
                          variant="subtle"
                          color="cyan"
                          loading={mercadoPagoReconcileLoadingId === item.id}
                          onClick={() => onMercadoPagoReconcile(item)}
                        >
                          <IconReceipt2 size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      {totalPages > 1 && onPageChange && (
        <Group justify="center" p="md">
          <Pagination
            value={page}
            onChange={onPageChange}
            total={totalPages}
            color="dark"
            styles={{
              root: {
                gap: "var(--mantine-spacing-xs)",
              },
              control: {
                backgroundColor: "var(--mantine-color-dark-7)",
                borderColor: "var(--mantine-color-dark-5)",
                color: "var(--mantine-color-dark-0)",
                "&:hover": {
                  backgroundColor: "var(--mantine-color-dark-6)",
                  borderColor: "var(--mantine-color-dark-4)",
                },
                "&[data-active]": {
                  backgroundColor: "white",
                  borderColor: "white",
                  color: "black",
                  "&:hover": {
                    backgroundColor: "var(--mantine-color-dark-1)",
                    color: "white",
                  },
                },
                "&[data-disabled]": {
                  backgroundColor: "var(--mantine-color-dark-8)",
                  borderColor: "var(--mantine-color-dark-6)",
                  color: "var(--mantine-color-dark-4)",
                  opacity: 0.5,
                },
              },
              dots: {
                color: "var(--mantine-color-dark-2)",
              },
            }}
          />
        </Group>
      )}
    </Paper>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "green",
    Activo: "green",
    Inactivo: "gray",
    inactive: "gray",
    pending: "yellow",
    payment_failed: "red",
    suspended: "red",
    trial: "blue",
    expired: "orange",
    cancelled: "red",
    none: "gray",
    draft: "gray",
    scheduled: "blue",
    sent: "green",
    failed: "red",
  };

  const labelMap: Record<string, string> = {
    active: "Activa",
    Activo: "Activo",
    Inactivo: "Inactivo",
    inactive: "Inactivo",
    pending: "Pendiente (checkout)",
    payment_failed: "Pago rechazado",
    suspended: "Suspendido",
    trial: "Prueba",
    expired: "Expirado",
    cancelled: "Cancelado",
    none: "Sin suscripción",
    draft: "Borrador",
    scheduled: "Programado",
    sent: "Enviado",
    failed: "Fallido",
  };

  return (
    <Badge color={colorMap[status] || "gray"} variant="light" size="sm">
      {labelMap[status] || status}
    </Badge>
  );
}
