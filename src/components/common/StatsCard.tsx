import { Paper, Text, Group, ThemeIcon } from '@mantine/core';
import { ReactNode } from 'react';
import classes from './StatsCard.module.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
}

export function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <Paper p="lg" radius="md" className={classes.card}>
      <Group justify="space-between" align="flex-start">
        <div>
          <Text c="dimmed" size="xs" tt="uppercase" fw={600}>
            {title}
          </Text>
          <Text size="xl" fw={700} c="white" mt={4}>
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={4}>
              {description}
            </Text>
          )}
        </div>
        <ThemeIcon
          size={48}
          radius="md"
          variant="light"
          color="dark"
          className={classes.icon}
        >
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}
