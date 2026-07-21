export type BingoEventStatus = "draft" | "active" | "closed";

export interface IBingoEventMetrics {
  participantCount: number;
  inProgressCount: number;
  completedCount: number;
  raffleEligibleCount: number;
  completionRate: number;
  totalCheckins: number;
  averageCheckinsPerParticipant: number;
  averageProgressPercent: number;
  drawCount: number;
  lastDraw: {
    id: string;
    winnerName: string;
    participantCount: number;
    drawnAt: string;
    superseded: boolean;
  } | null;
  standVisits?: IBingoStandVisitMetric[];
}

export interface IBingoStandVisitMetric {
  standId: string;
  label: string;
  visitCount: number;
  visitRate: number;
}

export interface IBingoEvent {
  id: string;
  name: string;
  description: string | null;
  status: BingoEventStatus;
  startDate: string | null;
  endDate: string | null;
  standCount: number;
  participantCount: number;
  metrics: IBingoEventMetrics;
  createdAt: string;
}

export interface IBingoEventDetail extends IBingoEvent {
  stands: IBingoStand[];
}

export interface IBingoStand {
  id: string;
  bingoEventId: string;
  code: string;
  label: string;
  merchantId: string | null;
  merchantName: string | null;
  merchantLogo: string | null;
}

export interface IBingoParticipantEntry {
  boardEntryId: string;
  participantId: string;
  name: string | null;
  email: string | null;
  joinedAt: string;
  completedAt: string | null;
  checkedCount: number;
}

export interface IBingoDrawResult {
  drawId: string;
  winnerParticipantId: string;
  winnerName: string;
  participantCount: number;
}

export interface IBingoEventFormInput {
  name: string;
  description?: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface IBingoStandFormInput {
  label: string;
  merchantId?: string | null;
  code?: string;
}

export const emptyBingoEventMetrics = (standCount = 0): IBingoEventMetrics => ({
  participantCount: 0,
  inProgressCount: 0,
  completedCount: 0,
  raffleEligibleCount: 0,
  completionRate: 0,
  totalCheckins: 0,
  averageCheckinsPerParticipant: 0,
  averageProgressPercent: 0,
  drawCount: 0,
  lastDraw: null,
  standVisits: standCount > 0 ? [] : undefined,
});

export const resolveEventMetrics = (
  event: Pick<IBingoEvent, "metrics" | "participantCount" | "standCount">,
): IBingoEventMetrics =>
  event.metrics ?? {
    ...emptyBingoEventMetrics(event.standCount),
    participantCount: event.participantCount,
    inProgressCount: event.participantCount,
  };
