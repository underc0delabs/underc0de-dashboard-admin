import { Paper, Group, TextInput, Select, Button } from '@mantine/core';
import { IconSearch, IconFilter, IconX } from '@tabler/icons-react';
import classes from './FilterBar.module.css';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function FilterBar({ filters, values, onChange, onClear }: FilterBarProps) {
  const hasActiveFilters = Object.values(values).some(v => v !== '');

  return (
    <Paper p="md" radius="md" mb="md" className={classes.paper}>
      <Group gap="md" wrap="wrap">
        {filters.map((filter) => {
          if (filter.type === 'text') {
            return (
              <TextInput
                key={filter.key}
                placeholder={filter.placeholder || filter.label}
                leftSection={<IconSearch size={16} />}
                value={values[filter.key] || ''}
                onChange={(e) => onChange(filter.key, e.target.value)}
                className={classes.input}
              />
            );
          }

          if (filter.type === 'select') {
            return (
              <Select
                key={filter.key}
                placeholder={filter.placeholder || filter.label}
                leftSection={<IconFilter size={16} />}
                data={filter.options || []}
                value={values[filter.key] || null}
                onChange={(value) => onChange(filter.key, value || '')}
                clearable
                className={classes.input}
              />
            );
          }

          return null;
        })}

        {hasActiveFilters && (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<IconX size={16} />}
            onClick={onClear}
          >
            Limpiar filtros
          </Button>
        )}
      </Group>
    </Paper>
  );
}
