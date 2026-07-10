import { Accordion, List, Paper, Text, ThemeIcon } from "@mantine/core";
import {
  IconCheck,
  IconGift,
  IconRocket,
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";

const steps = [
  {
    icon: IconTicket,
    title: "Creá el sorteo",
    detail:
      "Completá título, descripción, imagen, plazos y si es solo PRO. Se guarda como borrador hasta que lo publiques.",
  },
  {
    icon: IconRocket,
    title: "Publicá en la app",
    detail:
      "Al publicar, el sorteo aparece en la app móvil. Los usuarios pueden participar hasta la fecha de cierre (horario Argentina).",
  },
  {
    icon: IconUsers,
    title: "Cerrá la participación",
    detail:
      "Cuando termine el plazo — o antes si querés — cerrá la inscripción. Si hay participantes, el ganador se sortea al instante.",
  },
  {
    icon: IconCheck,
    title: "Entregá el premio",
    detail:
      "Si el ganador reclama el premio, marcá la entrega. Si no reclama a tiempo, podés re-sortear.",
  },
];

export function RaffleProcessGuide() {
  return (
    <Paper withBorder p="md" radius="md" mb="md">
      <Accordion variant="contained" chevronPosition="right">
        <Accordion.Item value="guide">
          <Accordion.Control>
            <Text fw={600} size="sm">
              ¿Cómo funciona un sorteo?
            </Text>
            <Text size="xs" c="dimmed">
              Borrador → Publicado → Cerrado → Sorteado → Entregado
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <List spacing="sm" size="sm" center icon={null}>
              {steps.map(step => (
                <List.Item
                  key={step.title}
                  icon={
                    <ThemeIcon color="blue" size={28} radius="xl" variant="light">
                      <step.icon size={16} />
                    </ThemeIcon>
                  }>
                  <Text fw={600} size="sm">
                    {step.title}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {step.detail}
                  </Text>
                </List.Item>
              ))}
            </List>
            <Text size="xs" c="dimmed" mt="sm">
              <IconGift size={14} style={{ verticalAlign: "middle" }} /> Las
              fechas se interpretan en horario Argentina (UTC-3).
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
}
