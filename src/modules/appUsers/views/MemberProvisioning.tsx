import { useState } from "react";
import {
  Stepper,
  Button,
  Stack,
  TextInput,
  Group,
  Text,
  Code,
  Paper,
  Collapse,
  Divider,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { useDependency } from "@/hooks/useDependency";
import { IHttpClient } from "@/modules/httpClient/interfaces";
import { routes } from "@/constants/routes";

const provisionSchema = z.object({
  username: z.string().min(1, "Usuario obligatorio"),
  name: z.string().min(1, "Nombre obligatorio"),
  lastname: z.string().optional(),
  email: z.string().email("Email app inválido"),
  phone: z.string().optional(),
  password: z.string().optional(),
});

const optionalEmail = z
  .union([z.string().email(), z.literal("")])
  .optional();

const forumSchema = z.object({
  forumUserId: z.string().min(1, "ID usuario foro obligatorio"),
  forumEmail: optionalEmail,
});

const mpSchema = z.object({
  mercadopagoEmail: optionalEmail,
  mercadopagoCustomerId: z.string().optional(),
  mercadopagoExternalReference: z.string().optional(),
});

const parseHttpError = (err: unknown): string => {
  if (err && typeof err === "object") {
    const e = err as { error?: { message?: string }; data?: { msg?: string } };
    if (typeof e.error?.message === "string" && e.error.message.length > 0) {
      return e.error.message;
    }
    if (e.data?.msg) return String(e.data.msg);
  }
  return err instanceof Error ? err.message : "Error desconocido";
};

export default function MemberProvisioning() {
  const httpClient = useDependency<IHttpClient>("httpClient");
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [appUserId, setAppUserId] = useState<string | null>(null);
  const [bundle, setBundle] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [advancedMpOpen, { toggle: toggleAdvancedMp }] = useDisclosure(false);
  const [advancedLinkOpen, { toggle: toggleAdvancedLink }] = useDisclosure(false);

  const formApp = useForm({
    initialValues: {
      username: "",
      name: "",
      lastname: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const formForum = useForm({
    initialValues: {
      forumUserId: "",
      forumEmail: "",
    },
  });

  const formMp = useForm({
    initialValues: {
      mercadopagoEmail: "",
      mercadopagoCustomerId: "",
      mercadopagoExternalReference: "",
    },
  });

  const formLink = useForm({
    initialValues: {
      mpPreapprovalId: "",
    },
  });

  const refreshBundle = async (uid: string) => {
    const res = await httpClient.get(`/admin/members/by-app-user/${uid}`);
    if (!res.status) {
      throw new Error(parseHttpError(res));
    }
    setBundle(res.data as Record<string, unknown>);
  };

  const submitProvision = async () => {
    const parsed = provisionSchema.safeParse(formApp.values);
    if (!parsed.success) {
      notifications.show({
        title: "Datos incompletos",
        message: parsed.error.errors.map((e) => e.message).join(", "),
        color: "red",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await httpClient.post("/admin/members/provision", {
        username: parsed.data.username,
        name: parsed.data.name,
        lastname: parsed.data.lastname || "",
        email: parsed.data.email,
        phone: parsed.data.phone || "",
        password: parsed.data.password || undefined,
        userType: 0,
        status: true,
      });
      if (!res.status) {
        throw new Error(parseHttpError(res));
      }
      const data = res.data as { user?: { id?: number } };
      const id = data?.user?.id != null ? String(data.user.id) : null;
      if (!id) {
        throw new Error("Respuesta sin id de usuario");
      }
      setAppUserId(id);
      await refreshBundle(id);
      notifications.show({
        title: "Paso 1 listo",
        message: "Usuario app y miembro interno creados.",
        color: "green",
      });
      setActive(1);
    } catch (e) {
      notifications.show({
        title: "Error al crear",
        message: parseHttpError(e),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitForum = async () => {
    if (!appUserId) return;
    const parsed = forumSchema.safeParse(formForum.values);
    if (!parsed.success) {
      notifications.show({
        title: "Foro",
        message: parsed.error.errors.map((e) => e.message).join(", "),
        color: "red",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await httpClient.patch(
        `/admin/members/by-app-user/${appUserId}/forum`,
        {
          forumUserId: parsed.data.forumUserId,
          forumEmail: parsed.data.forumEmail?.trim() || null,
        }
      );
      if (!res.status) {
        throw new Error(parseHttpError(res));
      }
      await refreshBundle(appUserId);
      notifications.show({ title: "Foro vinculado", message: "", color: "green" });
      setActive(2);
    } catch (e) {
      notifications.show({
        title: "Error foro",
        message: parseHttpError(e),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const submitMp = async () => {
    if (!appUserId) return;
    const parsed = mpSchema.safeParse(formMp.values);
    if (!parsed.success) {
      notifications.show({
        title: "Mercado Pago",
        message: parsed.error.errors.map((e) => e.message).join(", "),
        color: "red",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await httpClient.patch(
        `/admin/members/by-app-user/${appUserId}/mercadopago`,
        {
          mercadopagoEmail: parsed.data.mercadopagoEmail?.trim() || null,
          mercadopagoCustomerId: parsed.data.mercadopagoCustomerId?.trim() || null,
          mercadopagoExternalReference:
            parsed.data.mercadopagoExternalReference?.trim() || null,
        }
      );
      if (!res.status) {
        throw new Error(parseHttpError(res));
      }
      await refreshBundle(appUserId);
      notifications.show({
        title: "Mercado Pago guardado",
        message: "Puede diferir del email de la app.",
        color: "green",
      });
      setActive(3);
    } catch (e) {
      notifications.show({
        title: "Error Mercado Pago",
        message: parseHttpError(e),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const goToSummary = async () => {
    if (!appUserId) return;
    try {
      await refreshBundle(appUserId);
    } catch {
      /* el resumen puede mostrar datos ya cargados */
    }
    setActive(4);
  };

  const submitLink = async () => {
    if (!appUserId) return;
    const mpPreapprovalId = formLink.values.mpPreapprovalId?.trim();
    if (!mpPreapprovalId) {
      notifications.show({
        title: "Falta el ID",
        message:
          "Pegá el ID de preaprobación que te pasó soporte o que copiaste del panel de Mercado Pago.",
        color: "yellow",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await httpClient.post(
        `/admin/members/by-app-user/${appUserId}/link-subscription`,
        { mpPreapprovalId }
      );
      if (!res.status) {
        throw new Error(parseHttpError(res));
      }
      await refreshBundle(appUserId);
      notifications.show({
        title: "Suscripción vinculada",
        message: "",
        color: "green",
      });
      setActive(4);
    } catch (e) {
      notifications.show({
        title: "Error al vincular suscripción",
        message: parseHttpError(e),
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const skipForum = () => {
    if (!appUserId) return;
    setActive(2);
  };
  const skipMp = () => {
    if (!appUserId) return;
    setActive(3);
  };
  const skipLink = () => {
    void goToSummary();
  };

  const internalMember = bundle?.internalMember as Record<string, unknown> | undefined;
  const user = bundle?.user as Record<string, unknown> | undefined;

  return (
    <Stack gap="md">
      <PageHeader
        title="Alta y vínculos (app / foro / Mercado Pago)"
        description="Registrá identidades y emails en cada sistema (pueden ser distintos). La suscripción Pro normalmente queda activa cuando el usuario paga desde la app; después usá Sincronizar Mercado Pago en la lista de usuarios."
      />
      <Alert color="gray" variant="light">
        <Text size="sm">
          Flujo recomendado: <strong>1)</strong> datos de la cuenta en la app, <strong>2)</strong> ID del
          foro si ya existe, <strong>3)</strong> email con el que paga en Mercado Pago. Para altas rápidas
          sin pasos extra usá <strong>Nuevo usuario</strong> en la tabla Usuarios (mismo formulario unificado).
        </Text>
      </Alert>
      <Group>
        <Button variant="default" onClick={() => navigate(`/${routes.users}`)}>
          Volver a usuarios
        </Button>
      </Group>

      <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
        <Stepper.Step label="Usuario app" description="Alta manual">
          <Stack mt="md" maw={480}>
            <TextInput label="Usuario" required {...formApp.getInputProps("username")} />
            <TextInput label="Nombre" required {...formApp.getInputProps("name")} />
            <TextInput label="Apellido" {...formApp.getInputProps("lastname")} />
            <TextInput label="Email (app)" required {...formApp.getInputProps("email")} />
            <TextInput label="Teléfono" {...formApp.getInputProps("phone")} />
            <TextInput
              label="Contraseña (opcional)"
              type="password"
              {...formApp.getInputProps("password")}
            />
            <Button loading={loading} onClick={submitProvision}>
              Crear usuario y miembro interno
            </Button>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Foro" description="ID manual">
          <Stack mt="md" maw={480}>
            <Text size="sm" c="dimmed">
              Ingrese el identificador del usuario en el foro (p. ej. id_member). La
              búsqueda automática no está disponible sin API de listado.
            </Text>
            <TextInput
              label="ID usuario foro"
              required
              {...formForum.getInputProps("forumUserId")}
            />
            <TextInput
              label="Email en el foro (opcional)"
              {...formForum.getInputProps("forumEmail")}
            />
            <Group>
              <Button loading={loading} onClick={submitForum}>
                Vincular foro
              </Button>
              <Button variant="light" onClick={skipForum}>
                Omitir
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Mercado Pago" description="Email de cobro">
          <Stack mt="md" maw={520}>
            <Text size="sm" c="dimmed">
              Lo habitual es guardar el email con el que el usuario paga en Mercado Pago (puede ser
              distinto al de la app).
            </Text>
            <TextInput
              label="Email Mercado Pago"
              placeholder="ej. mismo u otro correo que en la app"
              {...formMp.getInputProps("mercadopagoEmail")}
            />
            <Button variant="subtle" size="xs" onClick={toggleAdvancedMp}>
              {advancedMpOpen ? "Ocultar" : "Mostrar"} IDs técnicos (opcional)
            </Button>
            <Collapse in={advancedMpOpen}>
              <Stack gap="sm">
                <Text size="xs" c="dimmed">
                  Solo si tenés estos datos del panel de Mercado Pago o soporte.
                </Text>
                <TextInput
                  label="Customer ID"
                  {...formMp.getInputProps("mercadopagoCustomerId")}
                />
                <TextInput
                  label="External reference"
                  {...formMp.getInputProps("mercadopagoExternalReference")}
                />
              </Stack>
            </Collapse>
            <Group>
              <Button loading={loading} onClick={submitMp}>
                Guardar datos MP
              </Button>
              <Button variant="light" onClick={skipMp}>
                Omitir
              </Button>
            </Group>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Suscripción Pro" description="Flujo normal">
          <Stack mt="md" maw={560}>
            <Text size="sm">
              No hace falta cargar códigos técnicos acá. En el flujo normal el usuario se suscribe
              desde la <strong>app</strong>; el sistema actualiza el estado con webhooks y con{" "}
              <strong>Sincronizar Mercado Pago</strong> en la pantalla Usuarios. Podés{" "}
              <strong>conciliar</strong> un usuario desde esa misma tabla si hace falta.
            </Text>
            <Group>
              <Button onClick={() => void goToSummary()}>Ir al resumen</Button>
              <Button variant="light" onClick={() => navigate(`/${routes.users}`)}>
                Ir a Usuarios (sincronizar / conciliar)
              </Button>
            </Group>
            <Divider label="Solo soporte" labelPosition="center" my="sm" />
            <Button variant="subtle" size="xs" onClick={toggleAdvancedLink}>
              {advancedLinkOpen ? "Ocultar" : "Vincular"} suscripción ya existente con ID de Mercado
              Pago
            </Button>
            <Collapse in={advancedLinkOpen}>
              <Stack gap="sm">
                <Text size="xs" c="dimmed">
                  Usar únicamente si ya tenés el ID de preaprobación / suscripción que entrega
                  Mercado Pago (panel o equipo técnico). No es algo que el admin use en el día a día.
                </Text>
                <TextInput
                  label="ID de preaprobación (Mercado Pago)"
                  placeholder="Pegar solo si te lo dieron"
                  {...formLink.getInputProps("mpPreapprovalId")}
                />
                <Button loading={loading} variant="light" onClick={() => void submitLink()}>
                  Vincular con este ID
                </Button>
              </Stack>
            </Collapse>
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Resumen" description="Estado">
          <Stack mt="md">
            {user && (
              <Paper p="md" withBorder>
                <Text fw={600} mb="xs">
                  Usuario app
                </Text>
                <Text size="sm">
                  id: <Code>{String(user.id)}</Code> email:{" "}
                  <Code>{String(user.email)}</Code>
                </Text>
              </Paper>
            )}
            {internalMember && (
              <Paper p="md" withBorder>
                <Text fw={600} mb="xs">
                  Miembro interno
                </Text>
                <Text size="sm">
                  forumStatus: <Code>{String(internalMember.forumStatus)}</Code>
                  {" · "}
                  mercadopagoStatus:{" "}
                  <Code>{String(internalMember.mercadopagoStatus)}</Code>
                  {" · "}
                  subscriptionStatus:{" "}
                  <Code>{String(internalMember.subscriptionStatus)}</Code>
                </Text>
                <Text size="sm" mt="xs">
                  forumUserId:{" "}
                  <Code>{internalMember.forumUserId ? String(internalMember.forumUserId) : "—"}</Code>
                  {" · "}
                  mercadopagoEmail:{" "}
                  <Code>
                    {internalMember.mercadopagoEmail
                      ? String(internalMember.mercadopagoEmail)
                      : "—"}
                  </Code>
                </Text>
              </Paper>
            )}
            {Array.isArray((bundle as { subscriptionPlans?: unknown[] } | null)?.subscriptionPlans) &&
              (bundle as { subscriptionPlans: { id?: number; status?: string; mpPreapprovalId?: string; createdAt?: string }[] }).subscriptionPlans.length > 0 && (
                <Paper p="md" withBorder>
                  <Text fw={600} mb="xs">
                    Historial de suscripciones (Mercado Pago)
                  </Text>
                  <Text size="xs" c="dimmed" mb="sm">
                    Más reciente primero. Una cancelada no se reutiliza: una nueva alta crea otra fila con otro preapproval.
                  </Text>
                  {(bundle as { subscriptionPlans: { id?: number; status?: string; mpPreapprovalId?: string; createdAt?: string }[] }).subscriptionPlans.map((s) => (
                    <Text size="sm" key={String(s.id ?? s.mpPreapprovalId)}>
                      <Code>#{s.id}</Code> · estado <Code>{String(s.status ?? "—")}</Code> · preapproval{" "}
                      <Code>{String(s.mpPreapprovalId ?? "—")}</Code>
                      {s.createdAt ? (
                        <>
                          {" "}
                          · {String(s.createdAt)}
                        </>
                      ) : null}
                    </Text>
                  ))}
                </Paper>
              )}
            <Button onClick={() => navigate(`/${routes.users}`)}>
              Finalizar
            </Button>
          </Stack>
        </Stepper.Step>
      </Stepper>
    </Stack>
  );
}
