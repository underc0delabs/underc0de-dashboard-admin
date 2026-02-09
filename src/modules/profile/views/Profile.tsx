import { useEffect, useState, useRef } from "react";
import {
  Stack,
  Card,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Text,
  Avatar,
  Divider,
  Loader,
  Box,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAuth } from "@/context/AuthContext";
import { PageHeader } from "@/components/common/PageHeader";
import { IProfilePresenter } from "../core/presentation/iProfilePresenter";
import { IProfileViews } from "../core/views/iProfileViews";
import { IProfile } from "../core/entities/iProfile";
import { profilePresenterProvider } from "../infrastructure/presentation/presenterProvider";

function profileToFormValues(profile: IProfile | null) {
  return {
    name: profile?.name ?? "",
    email: profile?.email ?? "",
  };
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<IProfile | null>(null);
  const [formValues, setFormValues] = useState(profileToFormValues(null));
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [presenter, setPresenter] = useState<IProfilePresenter | null>(
    null
  );

  const updateUserRef = useRef(updateUser);
  updateUserRef.current = updateUser;
  const lastUpdateWasPasswordRef = useRef(false);

  const viewHandlersRef = useRef<IProfileViews>({
    getProfileSuccess: (data: IProfile) => {},
    getProfileError: () => {},
    updateProfileSuccess: () => {},
    updateProfileError: () => {},
  });

  viewHandlersRef.current = {
    getProfileSuccess: (data: IProfile) => {
      setProfile(data);
      setFormValues(profileToFormValues(data));
      setIsLoading(false);
    },
    getProfileError: (error: string) => {
      setIsLoading(false);
      notifications.show({
        title: "Error al cargar perfil",
        message: error,
        color: "red",
      });
    },
    updateProfileSuccess: (data: IProfile) => {
      setIsSaving(false);
      setIsChangingPassword(false);
      updateUserRef.current({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as "admin" | "editor",
        createdAt: data.createdAt,
      });
      setProfile(data);
      setFormValues(profileToFormValues(data));
      if (lastUpdateWasPasswordRef.current) {
        lastUpdateWasPasswordRef.current = false;
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        notifications.show({
          title: "Contraseña actualizada",
          message: "Tu contraseña se ha cambiado correctamente.",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Perfil actualizado",
          message: "Tus datos se han guardado correctamente.",
          color: "green",
        });
      }
    },
    updateProfileError: (error: string) => {
      setIsSaving(false);
      setIsChangingPassword(false);
      notifications.show({
        title: "Error al actualizar",
        message: error,
        color: "red",
      });
    },
  };

  const provider = profilePresenterProvider();

  useEffect(() => {
    setPresenter(provider.getPresenter(viewHandlersRef.current));
  }, []);

  useEffect(() => {
    if (!presenter || !user?.id) return;
    setIsLoading(true);
    presenter.getProfile(user.id);
  }, [presenter, user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !presenter) return;
    lastUpdateWasPasswordRef.current = false;
    setIsSaving(true);
    presenter.updateProfile(user.id, {
      name: formValues.name.trim() || undefined,
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !presenter) return;
    if (!passwordForm.currentPassword.trim()) {
      notifications.show({
        title: "Error",
        message: "Ingresa tu contraseña actual.",
        color: "red",
      });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({
        title: "Error",
        message: "La nueva contraseña y la confirmación no coinciden.",
        color: "red",
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      notifications.show({
        title: "Error",
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
        color: "red",
      });
      return;
    }
    lastUpdateWasPasswordRef.current = true;
    setIsChangingPassword(true);
    presenter.updateProfile(user.id, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
  };

  const isFormDirty = formValues.name !== (profile?.name ?? "");

  if (!user) {
    return null;
  }

  return (
    <Stack gap="md">
      <PageHeader
        title="Mi perfil"
        description="Datos del usuario administrador"
      />

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        {isLoading ? (
          <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
            <Loader type="dots" />
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack gap="lg">
              <Group align="center" gap="md">
                <Avatar
                  radius="xl"
                  size="lg"
                  color="dark.4"
                  style={{ flexShrink: 0 }}
                >
                  {(formValues.name || user.name).charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Text size="sm" c="dimmed">
                    Rol
                  </Text>
                  <Text fw={500}>
                    {profile?.role === "admin" ? "Administrador" : "Editor"}
                  </Text>
                </div>
                {profile?.createdAt && (
                  <div>
                    <Text size="sm" c="dimmed">
                      Miembro desde
                    </Text>
                    <Text size="sm">{profile.createdAt}</Text>
                  </div>
                )}
              </Group>

              <Divider />

              <TextInput
                label="Nombre"
                placeholder="Tu nombre"
                value={formValues.name}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isSaving}
                required
              />

              <TextInput
                label="Email"
                type="email"
                value={formValues.email}
                readOnly
                disabled={isSaving}
                styles={{
                  input: {
                    cursor: "not-allowed",
                  },
                }}
              />

              <Group justify="flex-end" mt="md">
                <Button
                  type="submit"
                  loading={isSaving}
                  disabled={!presenter || !isFormDirty || isSaving}
                >
                  Guardar cambios
                </Button>
              </Group>
            </Stack>
          </form>
        )}
      </Card>

      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text size="lg" fw={600} mb="md">
          Cambiar contraseña
        </Text>
        <form onSubmit={handleChangePassword}>
          <Stack gap="md">
            <PasswordInput
              label="Contraseña actual"
              placeholder="Tu contraseña actual"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
              disabled={isLoading || isChangingPassword}
            />
            <PasswordInput
              label="Nueva contraseña"
              placeholder="Mínimo 6 caracteres"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
              disabled={isLoading || isChangingPassword}
              minLength={6}
            />
            <PasswordInput
              label="Confirmar nueva contraseña"
              placeholder="Repite la nueva contraseña"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              disabled={isLoading || isChangingPassword}
            />
            <Group justify="flex-end">
              <Button
                type="submit"
                loading={isChangingPassword}
                disabled={
                  !presenter ||
                  !passwordForm.currentPassword.trim() ||
                  !passwordForm.newPassword ||
                  isChangingPassword ||
                  passwordForm.newPassword !== passwordForm.confirmPassword ||
                  passwordForm.newPassword.length < 6
                }
              >
                Cambiar contraseña
              </Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Stack>
  );
}
