export type NotificationType =
  | "paired"
  | "message"
  | "server_announcement"
  | "milestone"
  | "reminder";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  relationshipId?: string;
  actorUserId?: string;
  action?: { label: string; route: string; params?: Record<string, any> };
  createdAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  archivedAt?: Date;
  priority?: "normal" | "high";
  dedupeKey?: string;
  ttlDays?: number;
}