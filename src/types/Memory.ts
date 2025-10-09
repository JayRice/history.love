import { GeoLocation } from '@/src/types/GeoLocation';
import Photo from '@/src/types/Photo';
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

export default interface Memory {
  id: string;
  title: string;
  date: Date;
  location: GeoLocation  | null;
  categories?: MemoryCategory[] | null;
  mood: MemoryMood | null,
  note: string | null;
  private_note?: string | null;
  photos: Photo[] | null,
}