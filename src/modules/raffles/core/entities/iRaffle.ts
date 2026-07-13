export type RaffleStatus =
  | "draft"
  | "published"
  | "closed"
  | "drawn"
  | "completed"
  | "expired";

export interface IRaffle {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  participationDeadline: string;
  claimDeadline: string;
  proOnly: boolean;
  status: RaffleStatus;
  participationOpen?: boolean;
  participantCount: number;
  winnerDisplayName: string | null;
  visibleInApp?: boolean;
}

export interface IRaffleParticipant {
  id: string;
  userId: number;
  displayName: string;
  username: string;
  enteredAt: string;
}

export interface IRaffleEvent {
  id: string;
  type: string;
  payload: Record<string, unknown> | null;
  actorType: string;
  actorId: string | null;
  createdAt: string;
}

export interface IRaffleFormInput {
  title: string;
  description: string;
  participationDeadline: string;
  claimDeadline: string;
  proOnly: boolean;
  image?: File | null;
  removeImage?: boolean;
}
