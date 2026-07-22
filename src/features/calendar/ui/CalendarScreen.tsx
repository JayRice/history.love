import React, { useCallback, useMemo, useState } from "react";
import { Dimensions, View , useColorScheme } from "react-native";
import { Calendar } from "react-native-big-calendar";

import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import type { OccurrenceEvent, CalendarMode } from "@/src/shared/types/Calendar";
import { expandEventsForRange } from "../domain/rrule.expand";
import { activityColor, activityIcon } from "./icons.map";
import { Screen } from '@/src/shared/ui/layout/Screen';
import { Plus } from 'lucide-react-native';
import { FAB, Text } from 'react-native-paper';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { detectUsesAMPM } from '@/src/shared/lib/utils/detectUsesAMPM';
import { useModal } from '@/src/shared/ui/ModalContext';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { TabHeader } from '@/src/shared/ui/layout/TabHeader';
import CalendarImage from '@/assets/images/home-images/calendar.svg';


const SCREEN_H = Dimensions.get("window").height;



function startEndForMode(mode: CalendarMode, anchor: Date) {
  if (mode === "day") return { from: anchor, to: addDays(anchor, 1) };
  if (mode === "week") return { from: startOfWeek(anchor, { weekStartsOn: 1 }), to: endOfWeek(anchor, { weekStartsOn: 1 }) };
  return { from: startOfMonth(anchor), to: endOfMonth(anchor) };
}

interface Props {

}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();

  const {openModal} = useModal();

  const colors = useThemeColors();
  const lightTheme = {
    palette: {
      primary: "#6E56CF",
      background: "#ffffff",
      cellBorder: "#e9e9ef",
      textPrimary: "#111827",
      textSecondary: "#6b7280",
      eventBackground: "#e8e8ff",
    },
  };

  const darkTheme = {
    palette: {
      primary: "#A78BFA",
      background: "#0b0b10",
      cellBorder: "#1f2430",
      textPrimary: "#e5e7eb",
      textSecondary: "#9ca3af",
      eventBackground: "#1d1b2e",
    },
  };
  const theme = colorScheme === "dark" ? darkTheme : lightTheme;

  const [mode, setMode] = useState<CalendarMode>("week");
  const [anchor, setAnchor] = useState<Date>(new Date());

  const calendarEvents = useRelationshipStore(s => s.calendarEvents)

  const [visibleRange, setVisibleRange] = useState(() => startEndForMode("week", new Date()));



  // Expand events only for the currently visible range
  const expanded: OccurrenceEvent[] = useMemo(() => {
    if (!calendarEvents) return []
    return expandEventsForRange(calendarEvents, visibleRange.from, visibleRange.to);
  }, [calendarEvents, visibleRange]);

  const eventsForBigCalendar = useMemo(() => {
    return expanded.map((e) => ({
      id: e.instanceKey,
      title: e.title,
      start: e.start,
      end: e.end,
      // pass the rest along so we can use them in renderEvent / eventCellStyle
      activityType: e.activityType,
      _raw: e,
    }));
  }, [expanded]);

  // range changes when user navigates
  const handleDateChange = useCallback(
    (range: { start: Date; end: Date } | [Date, Date]) => {
      const start = Array.isArray(range) ? range[0] : range.start;
      const end   = Array.isArray(range) ? range[1] : range.end;
      setVisibleRange({ from: start, to: end });
      setAnchor(start);
    },
    []
  );

  const renderEvent = useCallback((evt: any) => {
    const color = activityColor(evt.activityType);
    return (
      // no flex:1 here; let the calendar size/position this cell
      <View style={{ padding: 2 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            backgroundColor: color,
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 2,
          }}
        >
          {activityIcon(evt.activityType, 12)}
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.palette.textPrimary }}>
            {evt.title}
          </Text>
        </View>
      </View>
    );
  }, [theme.palette.textPrimary]);

  const eventCellStyle = useCallback((evt: any) => {
    const bg = activityColor(evt.activityType);
    return {
      backgroundColor: bg + "66",
      borderLeftWidth: 3,
      borderLeftColor: activityColor(evt.activityType),
      borderRadius: 8,
      // make sure events are painted above grid (Android needs elevation)
      zIndex: 10,
      elevation: 3,
    } as const;
  }, []);


  const handleAddEvent = async () => {
    await openModal("add_calendar_event");
  }


  const useAMPM = detectUsesAMPM();

  return (
    <Screen scrollable padding={false} safeArea={false} style={{  backgroundColor: theme.palette.background }}>
      {/* Calendar layer */}
      <View style={{ flex: 1 }}>
        <TabHeader style={{backgroundColor:colors.secondaryAccent}} title={"Calendar"}  description={"Plan things with your partner so you're always on the same page"} Icon={<CalendarImage width={100} height={100} ></CalendarImage>} />

        <Calendar
          ampm={useAMPM}
          height={SCREEN_H}            // fine to keep a fixed height, parent is flex:1 now
          mode={mode}
          events={eventsForBigCalendar}
          onChangeDate={handleDateChange}
          renderEvent={renderEvent}
          eventCellStyle={eventCellStyle}
          swipeEnabled
          weekStartsOn={1}
          hourRowHeight={48}
          overlapOffset={8}
          showAllDayEventCell
          headerContainerStyle={{ borderBottomWidth: 1, borderBottomColor: theme.palette.cellBorder }}
          bodyContainerStyle={{ backgroundColor: theme.palette.background }}
          calendarCellTextStyle={{ color: theme.palette.textSecondary }}
          dayHeaderHighlightColor={theme.palette.primary}
          scrollOffsetMinutes={480}     // 8am
        />
      </View>

      {/* Floating controls (overlay) */}
      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <FAB
          icon={() => <Plus size={24} color="white" />}
          className={"rounded-full"}
          onPress={handleAddEvent}
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            backgroundColor: colors.primary,
          }}
        />
      </View>
    </Screen>
  );

}