import { CalendarEvent } from "@/src/types/Calendar";
import fetchServer from '@/src/server/fetchServer';

export async function addCalenderEvent(calendarEvent: Omit<CalendarEvent, "id">){

  return await fetchServer("/calendar/add_event", { calendarEvent } , "POST")


}