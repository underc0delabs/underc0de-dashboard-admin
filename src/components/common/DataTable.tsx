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
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
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
  onView?: (item: T) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  emptyMessage?: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function DataTable<T extends { id?: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  page = 1,
  totalPages = 1,
  onPageChange,
  emptyMessage = "No hay datos disponibles",
  canEdit = true,
  canDelete = true,
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
            {data.map((item) => (
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
                    {onEdit && canEdit && (
                      <Tooltip label="Editar">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() => onEdit(item)}
                        >
                          <IconEdit size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {onDelete && canDelete && (
                      <Tooltip
                        label={
                          item.id === userId
                            ? "No puedes eliminar tu propio usuario"
                            : "Eliminar"
                        }
                      >
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          disabled={item.id === userId}
                          onClick={() => onDelete(item)}
                        >
                          <IconTrash size={18} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
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
              control: {
                borderColor: "var(--mantine-color-dark-4)",
                color: "var(--mantine-color-dark-0)",
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
    inactive: "gray",
    pending: "yellow",
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
    active: "Activo",
    inactive: "Inactivo",
    pending: "Pendiente",
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
