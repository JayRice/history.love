import PickedPhoto from "./PickedPhoto"


export type MemoryCategory =
  | "vacation"
  | "quality-time"
  | "family"
  | "holiday"
  | "celebration"
  | "milestone"
  | "date-night"
  | "daily-life"
  | "gift"
  | "challenge"
  | "other";

export default interface Memory {
  id: string;
  title: string;
  date: Date;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
  }  | null;
  category?: MemoryCategory | null;
  note?: string | null;
  private_note?: string | null;
  photos?: PickedPhoto[] | null,
}