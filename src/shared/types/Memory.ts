import { GeoLocation } from '@/src/shared/types/GeoLocation';
import Photo from '@/src/shared/types/Photo';
export const MemoryMoodList = [
  "happy",
  "sad",
  "excited",
  "relaxed",
  "angry",
  "anxious",
  "in love",
  "nostalgic",
  "tired",
  "peaceful",
] ;

export type MemoryMood = (typeof MemoryMoodList)[number];

export const MemoryCategoryList = [
  "vacation",
  "quality-time",
  "family",
  "holiday",
  "celebration",
  "milestone",
  "date-night",
  "daily-life",
  "gift",
  "challenge",
  "other",
] as const;

export type MemoryCategory = (typeof MemoryCategoryList)[number];

export type noteType = {
  createdBy: string;
  note: string;
}
export default interface Memory {
  id: string;
  title: string;
  date: string;
  location: GeoLocation  | null;
  categories?: MemoryCategory[] | null;
  mood: MemoryMood | null,
  notes: noteType[] | null;
  privateNotes?: noteType[] | null;

  // Legacy field aliases still read by TimelineEventCard, MemoryTile, and
  // MemoryFilterBar. Server data may carry either naming; these render as
  // undefined when absent. Reconcile during the Phase 4 memory migration.
  note?: string;
  private_note?: string;
  tags?: string[];
  photos: Photo[] | null,

  createdBy?: string;
  createdOn?: Date;
  updatedAt?: Date;
}