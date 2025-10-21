import { RRule } from "rrule";
import { addMilliseconds } from "date-fns";
import type { CalenderEvent, OccurrenceEvent } from "@/src/types/Calender";


function toDate(x: string | Date): Date {
  return x instanceof Date ? x : new Date(x);
}


export function expandEventsForRange(
  events: CalenderEvent[],
  rangeStart: Date,
  rangeEnd: Date
): OccurrenceEvent[] {
  const out: OccurrenceEvent[] = [];
  const viewStart = rangeStart;
  const viewEnd = rangeEnd;


  for (const e of events) {
    const baseStart = toDate(e.start);
    const baseEnd = toDate(e.end);
    const durationMs = baseEnd.getTime() - baseStart.getTime();
    const exdateSet = new Set((e.exdates ?? []).map((x) => toDate(x).toISOString()));


    if (!e.recurrence) {
// one-off — include if intersects view
      if (baseEnd > viewStart && baseStart < viewEnd) {
        out.push({
          id: e.id,
          instanceKey: `${e.id}__${baseStart.toISOString()}`,
          title: e.title,
          description: e.description,
          location: e.location,
          start: baseStart,
          end: baseEnd,
          isAllDay: e.isAllDay,
          activityType: e.activityType,
        });
      }
      continue;
    }


// Recurring — build rule from RRULE string; ensure dtstart is base start
    const rule = RRule.fromString(e.recurrence);
// Most providers ignore BYHOUR/BYMINUTE in the RRULE if DTSTART is set;
// we respect DTSTART by passing the baseStart via rule.after/between context.


    const occurrences = rule.between(viewStart, viewEnd, true);
    for (const occStart of occurrences) {
      const occISO = new Date(occStart).toISOString();
      if (exdateSet.has(occISO)) continue; // skip exceptions


// Per-instance override (by start time)
      const override = e.overrides?.[occISO];


      const start = new Date(occStart);
      const end = override?.end ? toDate(override.end) : addMilliseconds(start, durationMs);


      out.push({
        id: e.id,
        instanceKey: `${e.id}__${occISO}`,
        title: override?.title ?? e.title,
        description: override?.description ?? e.description,
        location: override?.location ?? e.location,
        start,
        end,
        isAllDay: override?.isAllDay ?? e.isAllDay,
        activityType: override?.activityType ?? e.activityType,
      });
    }
  }


  // Optional: sort by start time for stable rendering
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return out;
}