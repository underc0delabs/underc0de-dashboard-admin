import type { IRaffle } from "../core/entities/iRaffle";
import { isParticipationDeadlinePassed } from "./raffleDateTime";

export const statusLabel: Record<IRaffle["status"], string> = {
  draft: "Borrador",
  published: "Publicado",
  closed: "Cerrado",
  drawn: "Sorteado",
  completed: "Entregado",
  expired: "Reclamo vencido",
};

export const statusColor: Record<IRaffle["status"], string> = {
  draft: "gray",
  published: "blue",
  closed: "yellow",
  drawn: "violet",
  completed: "green",
  expired: "orange",
};

export const eventTypeLabel: Record<string, string> = {
  created: "Sorteo creado",
  published: "Publicado en la app",
  entered: "Usuario participó",
  participation_closed: "Participación cerrada",
  drawn: "Ganador sorteado",
  redrawn: "Re-sorteo realizado",
  prize_claimed: "Premio entregado",
  claim_expired: "Plazo de reclamo vencido",
  deleted: "Sorteo eliminado",
  duplicated: "Sorteo duplicado",
};

export type ConfirmAction =
  | "close"
  | "draw"
  | "redraw"
  | "claim"
  | "publish"
  | "duplicate"
  | "delete";

export type WorkflowStepState = "done" | "current" | "upcoming" | "warning";

export type WorkflowStep = {
  key: string;
  label: string;
  description: string;
  state: WorkflowStepState;
};

export type RaffleListFilter =
  | "all"
  | "draft"
  | "live"
  | "needs_action"
  | "in_progress"
  | "finished";

export const listFilterOptions: { value: RaffleListFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Borradores" },
  { value: "live", label: "Activos en app" },
  { value: "needs_action", label: "Requieren acción" },
  { value: "in_progress", label: "En curso (cerrado/sorteado)" },
  { value: "finished", label: "Finalizados" },
];

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });

export const isParticipationDeadlinePassedForItem = (item: IRaffle): boolean =>
  item.participationOpen === false ||
  (item.participationOpen !== true &&
    isParticipationDeadlinePassed(item.participationDeadline));

export const canEditRaffle = (item: IRaffle): boolean =>
  item.status === "draft" || item.status === "published";

export const canDuplicateRaffle = (_item: IRaffle): boolean => true;

export const canDeleteRaffle = (item: IRaffle): boolean =>
  item.status === "draft" || item.status === "completed";

export const getDeleteBlockedReason = (item: IRaffle): string | null => {
  if (canDeleteRaffle(item)) {
    return null;
  }
  return "Solo podés eliminar sorteos en borrador o finalizados. Los activos deben completar el flujo antes.";
};

export const getRafflePhaseLabel = (item: IRaffle): string => {
  if (item.status === "published") {
    return isParticipationDeadlinePassedForItem(item)
      ? "Publicado · plazo vencido"
      : "Publicado · participación abierta";
  }
  return statusLabel[item.status] ?? item.status;
};

export const getNextActionSummary = (item: IRaffle): string => {
  switch (item.status) {
    case "draft":
      return "Publicar en la app";
    case "published":
      return isParticipationDeadlinePassedForItem(item)
        ? "Cerrar participación"
        : "Esperando participantes";
    case "closed":
      return "Sortear ganador";
    case "drawn":
      return "Confirmar entrega o re-sortear";
    case "expired":
      return "Re-sortear ganador";
    case "completed":
      return "Finalizado";
    default:
      return "—";
  }
};

export const needsAdminAction = (item: IRaffle): boolean => {
  switch (item.status) {
    case "draft":
    case "closed":
    case "expired":
      return true;
    case "published":
      return isParticipationDeadlinePassedForItem(item);
    case "drawn":
      return true;
    default:
      return false;
  }
};

export const matchesListFilter = (
  item: IRaffle,
  filter: RaffleListFilter,
): boolean => {
  switch (filter) {
    case "all":
      return true;
    case "draft":
      return item.status === "draft";
    case "live":
      return (
        item.status === "published" &&
        !isParticipationDeadlinePassedForItem(item)
      );
    case "needs_action":
      return needsAdminAction(item);
    case "in_progress":
      return ["closed", "drawn", "expired"].includes(item.status);
    case "finished":
      return item.status === "completed";
    default:
      return true;
  }
};

export const getWorkflowSteps = (item: IRaffle): WorkflowStep[] => {
  const deadlinePassed = isParticipationDeadlinePassedForItem(item);
  const status = item.status;

  const stepState = (
    stepIndex: number,
    currentIndex: number,
    warning = false,
  ): WorkflowStepState => {
    if (stepIndex < currentIndex) {
      return "done";
    }
    if (stepIndex === currentIndex) {
      return warning ? "warning" : "current";
    }
    return "upcoming";
  };

  if (status === "expired") {
    return [
      {
        key: "draft",
        label: "Borrador",
        description: "Sorteo configurado",
        state: "done",
      },
      {
        key: "published",
        label: "Publicado",
        description: "Visible en la app",
        state: "done",
      },
      {
        key: "closed",
        label: "Participación cerrada",
        description: "Listo para sortear",
        state: "done",
      },
      {
        key: "drawn",
        label: "Ganador sorteado",
        description: item.winnerDisplayName ?? "Ganador asignado",
        state: "done",
      },
      {
        key: "expired",
        label: "Reclamo vencido",
        description: "El ganador no reclamó a tiempo",
        state: "warning",
      },
      {
        key: "redraw",
        label: "Re-sortear",
        description: "Elegí un nuevo ganador",
        state: "current",
      },
    ];
  }

  const currentIndex = (() => {
    switch (status) {
      case "draft":
        return 0;
      case "published":
        return deadlinePassed ? 1 : 1;
      case "closed":
        return 2;
      case "drawn":
        return 3;
      case "completed":
        return 4;
      default:
        return 0;
    }
  })();

  const publishedWarning =
    status === "published" && deadlinePassed;

  return [
    {
      key: "draft",
      label: "1. Borrador",
      description: "Completá título, plazos e imagen",
      state: stepState(0, currentIndex),
    },
    {
      key: "published",
      label: "2. Publicado",
      description: publishedWarning
        ? "Plazo de participación vencido — cerrá para continuar"
        : "Los usuarios participan desde la app",
      state: stepState(1, currentIndex, publishedWarning),
    },
    {
      key: "closed",
      label: "3. Participación cerrada",
      description: "Nadie más puede unirse",
      state: stepState(2, currentIndex),
    },
    {
      key: "drawn",
      label: "4. Ganador sorteado",
      description: item.winnerDisplayName
        ? `Ganador: ${item.winnerDisplayName}`
        : "Sorteo aleatorio entre participantes",
      state: stepState(3, currentIndex),
    },
    {
      key: "completed",
      label: "5. Premio entregado",
      description: "Sorteo finalizado",
      state: stepState(4, currentIndex),
    },
  ];
};

export const getPrimaryAction = (
  item: IRaffle,
  isAdmin: boolean,
): {
  label: string;
  color: string;
  action: ConfirmAction;
  hint: string;
} | null => {
  if (!isAdmin) {
    return null;
  }

  const deadlinePassed = isParticipationDeadlinePassedForItem(item);

  switch (item.status) {
    case "draft":
      return {
        label: "Publicar en la app",
        color: "blue",
        action: "publish",
        hint: "El sorteo será visible para todos los usuarios elegibles.",
      };
    case "published":
      return {
        label: deadlinePassed
          ? "Cerrar participación (plazo vencido)"
          : "Cerrar participación ahora",
        color: "yellow",
        action: "close",
        hint: deadlinePassed
          ? "El plazo ya venció. Cerrá para habilitar el sorteo."
          : "Podés cerrar antes del plazo si ya no querés más inscriptos.",
      };
    case "closed":
      return {
        label: "Sortear ganador",
        color: "violet",
        action: "draw",
        hint: `Se sorteará entre ${item.participantCount ?? 0} participante(s).`,
      };
    case "drawn":
      return {
        label: "Marcar premio entregado",
        color: "green",
        action: "claim",
        hint: "Confirmá que el ganador recibió el premio.",
      };
    case "expired":
      return {
        label: "Re-sortear ganador",
        color: "orange",
        action: "redraw",
        hint: "Se excluirá al ganador anterior y se elegirá uno nuevo.",
      };
    default:
      return null;
  }
};

export const confirmLabels: Record<
  ConfirmAction,
  { title: string; message: string; confirm: string; color: string }
> = {
  publish: {
    title: "Publicar sorteo",
    message:
      "El sorteo será visible en la app móvil. Los usuarios podrán participar hasta la fecha de cierre configurada.",
    confirm: "Publicar",
    color: "blue",
  },
  close: {
    title: "Cerrar participación",
    message:
      "Nadie podrá sumarse más. Este paso es necesario antes de sortear.",
    confirm: "Cerrar participación",
    color: "yellow",
  },
  draw: {
    title: "Sortear ganador",
    message:
      "Se elegirá un ganador al azar entre los participantes inscriptos. Esta acción no se puede deshacer, pero podrás re-sortear si el premio no se reclama.",
    confirm: "Sortear ahora",
    color: "violet",
  },
  redraw: {
    title: "Re-sortear ganador",
    message:
      "Se elegirá un nuevo ganador entre los participantes elegibles. El ganador anterior quedará excluido.",
    confirm: "Re-sortear",
    color: "orange",
  },
  claim: {
    title: "Marcar premio entregado",
    message: "El sorteo quedará marcado como finalizado.",
    confirm: "Confirmar entrega",
    color: "green",
  },
  duplicate: {
    title: "Duplicar sorteo",
    message:
      "Se creará un nuevo borrador con los mismos datos (título, descripción, plazos e imagen). No se copian participantes ni sorteos.",
    confirm: "Duplicar",
    color: "cyan",
  },
  delete: {
    title: "Eliminar sorteo",
    message:
      "El sorteo se ocultará del panel y de la app. Es una eliminación lógica: los datos quedan en el sistema pero ya no serán visibles.",
    confirm: "Eliminar",
    color: "red",
  },
};

export const countByFilter = (
  raffles: IRaffle[],
  filter: RaffleListFilter,
): number => raffles.filter(item => matchesListFilter(item, filter)).length;
