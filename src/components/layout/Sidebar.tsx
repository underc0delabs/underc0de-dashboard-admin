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
  IconSettings,
  IconX,
  IconUserCircle,
} from "@tabler/icons-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import classes from "./Sidebar.module.css";
import { RolesEnum } from "@/constants/rolesEnum";
import { routes } from "@/constants/routes";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

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
  {
    icon: IconSettings,
    label: "Valor suscripción",
    path: routes.environments,
    roles: ["admin"],
  },
  {
    icon: IconUserCircle,
    label: "Mi perfil",
    path: routes.profile,
    roles: ["admin", "editor"],
  },
];

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  const filteredNavItems = navItems.filter((item) =>
    item.roles.some((role) =>
      role.toLowerCase() === "admin"
        ? RolesEnum.ADMIN_ROLE
        : RolesEnum.USER_EDITOR
    )
  );

  const mainNavItems = filteredNavItems.filter(
    (item) => item.path !== routes.profile
  );
  const profileNavItem = filteredNavItems.find(
    (item) => item.path === routes.profile
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
    onClose?.();
  };

  return (
    <nav className={`${classes.sidebar} ${open ? classes.open : ""}`.trim()}>
      <div className={classes.header}>
        <div>
          <Text size="xl" fw={700} c="white">
            Underc0de
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            Panel de administración
          </Text>
        </div>
        {onClose && (
          <UnstyledButton
            onClick={onClose}
            className={classes.closeButton}
            aria-label="Cerrar menú"
          >
            <IconX size={22} stroke={1.5} />
          </UnstyledButton>
        )}
      </div>

      <Divider color="dark.5" />

      <Stack gap={4} p="md" style={{ flex: 1, minHeight: 0 }}>
        {mainNavItems.map((item) => {
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

        <Box style={{ flex: 1, minHeight: 0 }} />

        {profileNavItem && (
          <>
            <Divider color="dark.5" my="xs" />
            <NavLink
              key={profileNavItem.path}
              label={profileNavItem.label}
              leftSection={
                <profileNavItem.icon size={20} stroke={1.5} />
              }
              rightSection={<IconChevronRight size={14} stroke={1.5} />}
              active={isActive(profileNavItem.path)}
              onClick={() => handleNavigate(profileNavItem.path)}
              className={`${classes.navLink} ${classes.navLinkProfile}`}
              styles={{
                root: {
                  borderRadius: "var(--mantine-radius-md)",
                  color: isActive(profileNavItem.path)
                    ? "white"
                    : "var(--mantine-color-dark-1)",
                  backgroundColor: isActive(profileNavItem.path)
                    ? "var(--mantine-color-dark-5)"
                    : "transparent",
                },
                label: {
                  fontWeight: isActive(profileNavItem.path) ? 600 : 400,
                },
              }}
            />
          </>
        )}
      </Stack>

      <Divider color="dark.5" />

      <Group p="md" gap="xs" wrap="nowrap" className={classes.userSection}>
        <UnstyledButton
          onClick={() => handleNavigate(routes.profile)}
          className={`${classes.userButton} ${isActive(routes.profile) ? classes.userButtonActive : ""}`.trim()}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Group wrap="nowrap" gap="sm" style={{ minWidth: 0 }}>
            <Avatar radius="xl" size="md" color="dark.4" style={{ flexShrink: 0 }}>
              {user?.name.charAt(0).toUpperCase()}
            </Avatar>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <Text size="sm" fw={500} c="white" truncate>
                {user?.name}
              </Text>
              <Text size="xs" c="dimmed">
                {user?.role.toLowerCase() === "admin"
                  ? "Administrador"
                  : "Editor"}
              </Text>
            </div>
          </Group>
        </UnstyledButton>
        <UnstyledButton
          onClick={handleLogout}
          className={classes.logoutIconButton}
          aria-label="Cerrar sesión"
        >
          <IconLogout size={18} color="var(--mantine-color-dark-2)" />
        </UnstyledButton>
      </Group>
    </nav>
  );
}
