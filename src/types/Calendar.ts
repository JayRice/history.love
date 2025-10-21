export let ActivityTypeList = [ "date-night"
  , "workout"
  , "movie"
  , "anniversary"
  , "study"
  , "dinner"
  , "appointment"
  , "other"]
export type ActivityType = (typeof ActivityTypeList)[number];


export interface CalendarEvent {
  id: string; // Firestore doc id
  title: string;
  description?: string;
  location?: string;
  start: string; // ISO string (UTC or TZ-aware ISO)
  end: string; // ISO string
  timezone?: string; // e.g. "America/Chicago" (optional)
  isAllDay?: boolean;
  activityType?: ActivityType;


// Recurrence
  recurrence?: string; // RRULE string (e.g., "FREQ=WEEKLY;BYDAY=MO,WE;BYHOUR=17;BYMINUTE=30")
  exdates?: string[]; // ISO dates to exclude (instance start datetimes)


// Optional per-instance overrides: key = ISO start of the instance
// value = partial fields that override title/time/etc for that instance only
  overrides?: Record<string, Partial<Omit<CalendarEvent,
    "id" | "recurrence" | "exdates" | "overrides">>>;


  createdBy: string; // uid
  attendees: string[]; // partner uids
  updatedAt: number; // epoch ms
}


export type CalendarMode = "day" | "week" | "month";


// A concrete event occurrence to render on the grid (expanded from recurrence)
export interface OccurrenceEvent {
// keep original id for grouping series; instanceKey is unique per occurrence
  id: string;
  instanceKey: string; // `${id}__${startISO}`
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  isAllDay?: boolean;
  activityType?: ActivityType;
}