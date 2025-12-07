/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Stack,
  Center,
  Box,
  Alert,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import classes from './Login.module.css';
import { ILoginPresenter } from '../core/presentation/ILoginPresenter';
import { loginPresenterProvider } from '../infrastructure/presentation/presenterProvider';
import { ILoginScreen } from '../core/screens/ILoginScreen';


interface LoginForm {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const presenterProvider = loginPresenterProvider();
  const [presenter, setPresenter] = useState<ILoginPresenter>(
    {} as ILoginPresenter
  );
  const [isPresenterLoaded, setIsPresenterLoaded] = useState<boolean>(false);

  const viewHandlers: ILoginScreen = {
    onLoginSuccess: (response) => {
      if (response?.token && response?.user) {
        login(response.token, response.user);
        navigate('/');
      } else {
        setError('Error: respuesta de login inválida');
      }
    },
    onLoginError: (response) => {
      setError(`Credenciales inválidas: ${response?.error?.message}`);
    },
  };

  useEffect(() => {
    setPresenter(presenterProvider.getPresenter(viewHandlers));
    setIsPresenterLoaded(true);
  }, []);

  const form = useForm<LoginForm>({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => {
        if (!value) return 'El email es requerido';
        if (!/^\S+@\S+$/.test(value)) return 'Email inválido';
        return null;
      },
      password: (value) => (!value ? 'La contraseña es requerida' : null),
    },
  });

  const handleSubmit = async (values: LoginForm) => {
    setError(null);
    if (isPresenterLoaded) {
      presenter.login(values.email, values.password);
    }
  };  

  return (
    <Box className={classes.wrapper}>
      <Center h="100vh">
        <Paper className={classes.card} radius="lg" p="xl">
          <Stack gap="lg">
            <div>
              <Title order={2} ta="center" c="white">
                Underc0de Admin Panel
              </Title>
              <Text c="dimmed" size="sm" ta="center" mt={4}>
                Ingresa tus credenciales para acceder
              </Text>
            </div>

            {error && (
              <Alert
                icon={<IconAlertCircle size={18} />}
                color="red"
                variant="light"
                styles={{
                  root: {
                    backgroundColor: 'var(--mantine-color-red-9)',
                    color: 'var(--mantine-color-white)',
                  },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="tu@email.com"
                  {...form.getInputProps('email')}
                  styles={{
                    label: { color: 'var(--mantine-color-white)' },
                    input: { color: 'var(--mantine-color-white)' },
                  }}
                />

                <PasswordInput
                  label="Contraseña"
                  placeholder="••••••••"
                  {...form.getInputProps('password')}
                  styles={{
                    label: { color: 'var(--mantine-color-white)' },
                    input: { color: 'var(--mantine-color-white)' },
                  }}
                />

                <Button
                  type="submit"
                  fullWidth
                  mt="md"
                  loading={loading}
                  styles={{
                    root: {
                      backgroundColor: 'white',
                      color: 'black',
                    },
                  }}
                >
                  Iniciar sesión
                </Button>
              </Stack>
            </form>
          </Stack>
        </Paper>
      </Center>
    </Box>
  );
}

export default Login;