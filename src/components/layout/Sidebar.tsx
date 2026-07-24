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
  IconUserPlus,
  IconBuildingStore,
  IconCategory,
  IconTicket,
  IconGrid3x3,
  IconCalendarEvent,
  IconCalendar,
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

type NavItem = {
  icon: typeof IconDashboard;
  label: string;
  path: string;
  roles: string[];
};

const underc0deNavItems: NavItem[] = [
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
    icon: IconUserPlus,
    label: "Alta miembro (app/foro/MP)",
    path: routes.userMemberProvision,
    roles: ["admin"],
  },
  {
    icon: IconBuildingStore,
    label: "Comercios",
    path: routes.commerces,
    roles: ["admin", "editor"],
  },
  {
    icon: IconCategory,
    label: "Categorías",
    path: routes.categories,
    roles: ["admin", "editor"],
  },
  {
    icon: IconTicket,
    label: "Sorteos",
    path: routes.raffles,
    roles: ["admin", "editor"],
  },
  {
    icon: IconCalendarEvent,
    label: "Eventos",
    path: routes.events,
    roles: ["admin", "editor"],
  },
  {
    icon: IconCalendar,
    label: "Calendario",
    path: routes.birthdayCalendar,
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
];

const bingoNavItems: NavItem[] = [
  {
    icon: IconGrid3x3,
    label: "Eventos de bingo",
    path: routes.bingo,
    roles: ["admin", "editor"],
  },
];

const profileNavItem: NavItem = {
  icon: IconUserCircle,
  label: "Mi perfil",
  path: routes.profile,
  roles: ["admin", "editor"],
};

const filterNavItems = (items: NavItem[]) =>
  items.filter((item) =>
    item.roles.some((role) =>
      role.toLowerCase() === "admin"
        ? RolesEnum.ADMIN_ROLE
        : RolesEnum.USER_EDITOR
    )
  );

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
    onClose?.();
  };

  const underc0deItems = filterNavItems(underc0deNavItems);
  const bingoItems = filterNavItems(bingoNavItems);
  const showProfile = filterNavItems([profileNavItem]).length > 0;

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

  const renderNavLink = (item: NavItem, extraClassName?: string) => {
    const active = isActive(item.path);
    return (
      <NavLink
        key={item.path}
        label={item.label}
        leftSection={<item.icon size={20} stroke={1.5} />}
        rightSection={<IconChevronRight size={14} stroke={1.5} />}
        active={active}
        onClick={() => handleNavigate(item.path)}
        className={`${classes.navLink} ${extraClassName ?? ""}`.trim()}
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

      <Stack gap={4} p="md" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {underc0deItems.length > 0 ? (
          <Box className={classes.navSection}>
            <Text className={classes.navSectionLabel}>Underc0de</Text>
            <Stack gap={4} mt="xs">
              {underc0deItems.map((item) => renderNavLink(item))}
            </Stack>
          </Box>
        ) : null}

        {bingoItems.length > 0 ? (
          <Box className={`${classes.navSection} ${classes.navSectionBingo}`}>
            <Text className={classes.navSectionLabel}>Bingo</Text>
            <Stack gap={4} mt="xs">
              {bingoItems.map((item) => renderNavLink(item, classes.navLinkBingo))}
            </Stack>
          </Box>
        ) : null}

        <Box style={{ flex: 1, minHeight: 0 }} />

        {showProfile && (
          <>
            <Divider color="dark.5" my="xs" />
            {renderNavLink(profileNavItem, classes.navLinkProfile)}
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
