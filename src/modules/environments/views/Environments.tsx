import { useState, useEffect } from "react";
import { TextInput, Button, Stack, Group, Card, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { MainLayout } from "@/components/layout/MainLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { IEnvironmentsPresenter } from "../core/presentation/iEnvironmentsPresenter";
import { environmentsPresenterProvider } from "../infrastructure/presentation/presenterProvider";
import { IEnvironmentsViews } from "../core/views/iEnvironmentsViews";
import { useAuth } from "@/context/AuthContext";

const MERCADO_PAGO_PRICE_KEY = "MERCADO_PAGO_PRICE";

export default function Environments() {
  const { hasPermission } = useAuth();
  const [mercadoPagoPrice, setMercadoPagoPrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const presenterProvider = environmentsPresenterProvider();
  const [presenter, setPresenter] = useState<IEnvironmentsPresenter>(
    {} as IEnvironmentsPresenter
  );
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const viewHandlers: IEnvironmentsViews = {
    getEnvironmentSuccess: (environment) => {
      setMercadoPagoPrice(environment.value);
      setIsLoading(false);
    },
    getEnvironmentError: (error: string) => {
      setIsLoading(false);
      notifications.show({
        title: "Error al obtener el precio",
        message: error,
        color: "red",
      });
    },
    updateEnvironmentSuccess: (environment) => {
      setMercadoPagoPrice(environment.value);
      setIsSaving(false);
      notifications.show({
        title: "Precio actualizado",
        message: "El precio de MercadoPago ha sido actualizado correctamente.",
        color: "green",
      });
    },
    updateEnvironmentError: (error: string) => {
      setIsSaving(false);
      notifications.show({
        title: "Error al actualizar el precio",
        message: error,
        color: "red",
      });
    },
  };

  useEffect(() => {
    const presenter = presenterProvider.getPresenter(viewHandlers);
    setPresenter(presenter);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      setIsLoading(true);
      presenter.getEnvironment(MERCADO_PAGO_PRICE_KEY);
    }
  }, [isLoaded]);

  const handleSave = () => {
    if (!mercadoPagoPrice.trim()) {
      notifications.show({
        title: "Error",
        message: "El precio no puede estar vacío",
        color: "red",
      });
      return;
    }

    setIsSaving(true);
    presenter.updateEnvironment(MERCADO_PAGO_PRICE_KEY, mercadoPagoPrice);
  };

  return (
    <MainLayout>
      <Stack gap="md">
        <PageHeader
          title="Configuración de valor suscripción"
          description="Gestiona el valor de la suscripción"
        />

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text size="lg" fw={500}>
              Precio de MercadoPago
            </Text>
            <TextInput
              label="Precio"
              placeholder="Ingrese el precio de MercadoPago"
              value={mercadoPagoPrice}
              onChange={(e) => setMercadoPagoPrice(e.target.value)}
              disabled={isLoading || isSaving}
              type="number"
            />
            <Group justify="flex-end">
              <Button
                onClick={handleSave}
                loading={isSaving}
                disabled={isLoading}
              >
                Guardar
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </MainLayout>
  );
}
