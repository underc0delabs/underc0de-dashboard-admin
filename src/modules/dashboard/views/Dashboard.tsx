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
  IconCreditCard,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/StatsCard";
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
    subscriptionsActive: 0,
    subscriptionsCancelled: 0,
  });
  const viewHandlers: IDashboardView = {
    getMetrics: (m: IMetrics) => {
      setMetrics(m);
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

  const active = metrics.subscriptionsActive ?? 0;
  const cancelled = metrics.subscriptionsCancelled ?? 0;
  const totalSubs = metrics.subscriptions ?? active + cancelled;
  const totalForChart = Math.max(totalSubs, 1);

  return (
    <>
      <PageHeader title="Dashboard" description="Vista general del sistema" />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mb="xl">
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
        <StatsCard
          title="Suscripciones Pro"
          value={metrics.subscriptions ?? 0}
          icon={<IconCreditCard size={24} />}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} mb="xl">
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
                  value: (active / totalForChart) * 100,
                  color: "green",
                },
                {
                  value: (cancelled / totalForChart) * 100,
                  color: "gray",
                },
              ]}
              label={
                <Center>
                  <Stack gap={0} align="center">
                    <Text fw={700} size="xl" c="white">
                      {totalSubs}
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
                  Activas: {active}
                </Text>
              </Group>
              <Group gap="xs">
                <div
                  className={classes.dot}
                  style={{ backgroundColor: "var(--mantine-color-gray-6)" }}
                />
                <Text size="sm" c="dimmed">
                  Canceladas: {cancelled}
                </Text>
              </Group>
            </Stack>
          </Group>
        </Paper>
      </SimpleGrid>
    </>
  );
}

export default Dashboard;