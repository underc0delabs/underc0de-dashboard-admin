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

const Dashboard = () => {
  const activeUsers = mockUsers.filter((u) => u.status === "active").length;
  const activeCommerces = mockCommerces.filter(
    (c) => c.status === "active"
  ).length;
  const sentNotifications = mockNotifications.filter(
    (n) => n.status === "sent"
  ).length;

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
          value={mockUsers.length}
          icon={<IconUsers size={24} />}
          description={`${activeUsers} activos`}
        />
        <StatsCard
          title="Comercios"
          value={mockCommerces.length}
          icon={<IconBuildingStore size={24} />}
          description={`${activeCommerces} activos`}
        />
        <StatsCard
          title="Notificaciones Enviadas"
          value={sentNotifications}
          icon={<IconBell size={24} />}
          description="Este mes"
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
      </SimpleGrid>
    </MainLayout>
  );
}

export default Dashboard;