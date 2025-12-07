import { Group, Title, Text, Button, Stack } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <Group justify="space-between" align="flex-start" mb="xl">
      <Stack gap={4}>
        <Title order={2} c="white">
          {title}
        </Title>
        {description && (
          <Text c="dimmed" size="sm">
            {description}
          </Text>
        )}
      </Stack>
      {action && (
        <Button
          leftSection={action.icon || <IconPlus size={18} />}
          onClick={action.onClick}
          color="white"
          variant="filled"
          styles={{
            root: {
              backgroundColor: 'white',
              color: 'black',
            },
          }}
        >
          {action.label}
        </Button>
      )}
    </Group>
  );
}
