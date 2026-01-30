import {
  NavLink,
  Stack,
  Text,
  Divider,
  Group,
  Avatar,
  UnstyledButton,
  Box,
} from "@mantine/core";
import {
  IconDashboard,
  IconUsers,
  IconBuildingStore,
  IconUserShield,
  IconBell,
  IconLogout,
  IconChevronRight,
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import classes from "./Sidebar.module.css";
import { RolesEnum } from "@/constants/rolesEnum";
import { routes } from "@/constants/routes";

const navItems = [
  {
    icon: IconDashboard,
    label: "Dashboard",
    path: routes.dashboard,
    roles: ["admin", "editor"],
  },
  {
    icon: IconUsers,
    label: "Usuarios",
    path: routes.users,
    roles: ["admin", "editor"],
  },
  {
    icon: IconBuildingStore,
    label: "Comercios",
    path: routes.commerces,
    roles: ["admin", "editor"],
  },
  {
    icon: IconUserShield,
    label: "Usuarios Admin",
    path: routes.adminUsers,
    roles: ["admin"],
  },
  {
    icon: IconBell,
    label: "Notificaciones",
    path: routes.notifications,
    roles: ["admin"],
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPermission } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredNavItems = navItems.filter((item) =>
    item.roles.some((role) =>
      role.toLowerCase() === "admin"
        ? RolesEnum.ADMIN_ROLE
        : RolesEnum.USER_EDITOR
    )
  );

  const getFullPath = (path: string) => {
    return path === "" ? "/" : `/${path}`;
  };

  const isActive = (itemPath: string) => {
    const fullPath = getFullPath(itemPath);
    return location.pathname === fullPath;
  };

  const handleNavigate = (path: string) => {
    const fullPath = getFullPath(path);
    navigate(fullPath);
  };

  return (
    <nav className={classes.sidebar}>
      <div className={classes.header}>
        <Text size="xl" fw={700} c="white">
          Underc0de
        </Text>
        <Text size="xs" c="dimmed" mt={4}>
          Panel de administración
        </Text>
      </div>

      <Divider color="dark.5" />

      <Stack gap={4} p="md" style={{ flex: 1 }}>
        {filteredNavItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              label={item.label}
              leftSection={<item.icon size={20} stroke={1.5} />}
              rightSection={<IconChevronRight size={14} stroke={1.5} />}
              active={active}
              onClick={() => handleNavigate(item.path)}
              className={classes.navLink}
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-md)",
                  color: active ? "white" : "var(--mantine-color-dark-1)",
                  backgroundColor: active
                    ? "var(--mantine-color-dark-5)"
                    : "transparent",
                },
                label: {
                  fontWeight: active ? 600 : 400,
                },
              }}
            />
          );
        })}
      </Stack>

      <Divider color="dark.5" />

      <Box p="md">
        <UnstyledButton onClick={handleLogout} className={classes.userButton}>
          <Group>
            <Avatar radius="xl" size="md" color="dark.4">
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1 }}>
              <Text size="sm" fw={500} c="white">
                {user?.name}
              </Text>
              <Text size="xs" c="dimmed">
                {user?.role.toLowerCase() === "admin"
                  ? "Administrador"
                  : "Editor"}
              </Text>
            </div>
            <IconLogout size={18} color="var(--mantine-color-dark-2)" />
          </Group>
        </UnstyledButton>
      </Box>
    </nav>
  );
}
