import {
  SimpleGrid,
  Stack,
  Paper,
  Title,
  Text,
  Group,
  RingProgress,
  Center,
} from "@mantine/core";
import {
  IconUsers,
  IconBuildingStore,
  IconBell,
} from "@tabler/icons-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
import { mockUsers, mockCommerces, mockNotifications } from "@/data/mockData";
import classes from "./Dashboard.module.css";
import { IMetrics } from "../core/entities/IMetrics";
import { useEffect, useState } from "react";
import { IDashboardPresenter } from "../core/presentation/IDashboardPresenter";
import { dashboardPresenterProvider } from "../infrastructure/presentation/presenterProvider";
import { IDashboardView } from "../core/views/IDashboardView";

const Dashboard = () => {
  const presenterProvider = dashboardPresenterProvider();
  const [isLoaded, setIsLoaded] = useState(false);
  const [presenter, setPresenter] = useState<IDashboardPresenter>({} as IDashboardPresenter);
  const [metrics, setMetrics] = useState<IMetrics>({
    users: 0,
    merchants: 0,
    notifications: 0,
    subscriptions: 0,
  });
  const viewHandlers: IDashboardView = {
    getMetrics: (metrics: IMetrics) => {
      setMetrics(metrics);
    },
    getMetricsError: (error: Error) => {
      console.error(error);
    },
  };

  useEffect(() => {
    setPresenter(presenterProvider.getPresenter(viewHandlers));
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      presenter.getMetrics();
    }
  }, [isLoaded]);

  const subscriptionStats = {
    active: mockUsers.filter((u) => u.subscription === "active").length,
    trial: mockUsers.filter((u) => u.subscription === "trial").length,
    expired: mockUsers.filter((u) => u.subscription === "expired").length,
    none: mockUsers.filter(
      (u) => u.subscription === "none" || u.subscription === "cancelled"
    ).length,
  };

  return (
    <MainLayout>
      <PageHeader title="Dashboard" description="Vista general del sistema" />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} mb="xl">
        <StatsCard
          title="Usuarios Totales"
          value={metrics.users}
          icon={<IconUsers size={24} />}
        />
        <StatsCard
          title="Comercios"
          value={metrics.merchants}
          icon={<IconBuildingStore size={24} />}
        />
        <StatsCard
          title="Notificaciones"
          value={metrics.notifications}
          icon={<IconBell size={24} />}
        />
      </SimpleGrid>

      {/* <SimpleGrid cols={{ base: 1, lg: 2 }} mb="xl">
        <Paper p="lg" radius="md" className={classes.card}>
          <Title order={4} c="white" mb="lg">
            Estado de Suscripciones
          </Title>
          <Group justify="center" gap="xl">
            <RingProgress
              size={180}
              thickness={20}
              roundCaps
              sections={[
                {
                  value: (subscriptionStats.active / mockUsers.length) * 100,
                  color: "green",
                },
                {
                  value: (subscriptionStats.trial / mockUsers.length) * 100,
                  color: "blue",
                },
                {
                  value: (subscriptionStats.expired / mockUsers.length) * 100,
                  color: "orange",
                },
                {
                  value: (subscriptionStats.none / mockUsers.length) * 100,
                  color: "gray",
                },
              ]}
              label={
                <Center>
                  <Stack gap={0} align="center">
                    <Text fw={700} size="xl" c="white">
                      {mockUsers.length}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Total
                    </Text>
                  </Stack>
                </Center>
              }
            />
            <Stack gap="xs">
              <Group gap="xs">
                <div
                  className={classes.dot}
                  style={{ backgroundColor: "var(--mantine-color-green-6)" }}
                />
                <Text size="sm" c="dimmed">
                  Activas: {subscriptionStats.active}
                </Text>
              </Group>
              <Group gap="xs">
                <div
                  className={classes.dot}
                  style={{ backgroundColor: "var(--mantine-color-blue-6)" }}
                />
                <Text size="sm" c="dimmed">
                  Prueba: {subscriptionStats.trial}
                </Text>
              </Group>
              <Group gap="xs">
                <div
                  className={classes.dot}
                  style={{ backgroundColor: "var(--mantine-color-orange-6)" }}
                />
                <Text size="sm" c="dimmed">
                  Expiradas: {subscriptionStats.expired}
                </Text>
              </Group>
              <Group gap="xs">
                <div
                  className={classes.dot}
                  style={{ backgroundColor: "var(--mantine-color-gray-6)" }}
                />
                <Text size="sm" c="dimmed">
                  Sin suscripción: {subscriptionStats.none}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Paper>
      </SimpleGrid> */}
    </MainLayout>
  );
}

export default Dashboard;