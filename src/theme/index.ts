import { createTheme, MantineColorsTuple } from '@mantine/core';

const dark: MantineColorsTuple = [
  '#C1C2C5',
  '#A6A7AB',
  '#909296',
  '#5C5F66',
  '#373A40',
  '#2C2E33',
  '#25262B',
  '#1A1B1E',
  '#141517',
  '#101113',
];

export const theme = createTheme({
  primaryColor: 'dark',
  colors: {
    dark,
  },
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        variant: 'filled',
      },
      styles: {
        root: {
          fontWeight: 500,
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-4)',
        },
      },
    },
    PasswordInput: {
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-4)',
        },
      },
    },
    Select: {
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-4)',
        },
      },
    },
    Textarea: {
      styles: {
        input: {
          backgroundColor: 'var(--mantine-color-dark-7)',
          borderColor: 'var(--mantine-color-dark-4)',
        },
      },
    },
    Paper: {
      defaultProps: {
        bg: 'dark.8',
      },
    },
    Modal: {
      styles: {
        content: {
          backgroundColor: 'var(--mantine-color-dark-8)',
        },
        header: {
          backgroundColor: 'var(--mantine-color-dark-8)',
        },
      },
    },
    Table: {
      styles: {
        table: {
          backgroundColor: 'var(--mantine-color-dark-8)',
        },
        thead: {
          backgroundColor: 'var(--mantine-color-dark-7)',
        },
        tr: {
          borderColor: 'var(--mantine-color-dark-5)',
        },
      },
    },
  },
});
