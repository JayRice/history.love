import React, { useMemo, useState, useCallback } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Text } from "react-native-paper";

import { Screen } from "@/src/shared/ui/layout/Screen";
import { BackButton } from "@/src/shared/ui/buttons/BackButton";
import { PrimaryButton } from "@/src/shared/ui/buttons/PrimaryButton";
import { TextField } from "@/src/shared/ui/inputs/TextField";
import { LocationPicker } from "@/src/shared/ui/inputs/LocationPicker";
import { ToggleField } from "@/src/shared/ui/inputs/ToggleField";
import { useThemeColors } from "@/src/shared/lib/hooks/useThemeColors";
import { useAuth } from "@/src/features/auth/hooks/AuthContext";
import { useCurrentModal } from "@/src/shared/lib/hooks/useCurrentModal";

import { DateTimeRangeField } from "@/src/shared/ui/inputs/DateTimeRangeField";
import { TimeRangeField } from "@/src/shared/ui/inputs/TimeRangeField";
import { ActivityTypePicker } from "@/src/shared/ui/inputs/ActivityTypePicker";
import { RepeatPicker, toRRULE } from "@/src/shared/ui/inputs/RepeatPicker";

import type { GeoLocation } from "@/src/shared/types/GeoLocation";
import type { ActivityType, CalendarEvent } from "@/src/shared/types/Calendar";

import { addCalenderEvent } from "../data/legacy/addCalenderEvent";
import { useUserStore } from "@/src/store/userStore";
import { getPartnerName } from "@/src/shared/lib/utils/getPartnerName";
import { detectUsesAMPM } from '@/src/shared/lib/utils/detectUsesAMPM';

type ModalData = {
  initialStart?: string; // ISO
  initialEnd?: string;   // ISO
  defaultActivityType?: ActivityType;
  relationshipId?: string;
  attendees?: string[];
};

export default function AddCalendarEventScreen() {
  const { data, close } = useCurrentModal<ModalData, undefined>();

  const colors = useThemeColors();
  const { authUser } = useAuth();

  // ----- state -----
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [location, setLocation] = useState<GeoLocation | null>(null);

  const defaultStart = useMemo(
    () => (data?.initialStart ? new Date(data.initialStart) : new Date()),
    [data?.initialStart]
  );
  const defaultEnd = useMemo(() => {
    if (data?.initialEnd) return new Date(data.initialEnd);
    const plusHour = new Date(defaultStart);
    plusHour.setHours(plusHour.getHours() + 1);
    return plusHour;
  }, [data?.initialEnd, defaultStart]);

  const [range, setRange] = useState<{ start: Date; end: Date }>({
    start: defaultStart,
    end: defaultEnd,
  });

  const [isAllDay, setIsAllDay] = useState<boolean>(false);
  const [isOneDay, setIsOneDay] = useState<boolean>(false);

  const [activityType, setActivityType] = useState<ActivityType | undefined>(
    data?.defaultActivityType
  );

  const [repeat, setRepeat] = useState<{
    freq: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    byWeekDays: string[];
    interval: number;
    count?: number;
    until?: Date | null;
  }>({ freq: "NONE", byWeekDays: [], interval: 1, count: undefined, until: null });

  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/Chicago",
    []
  );

  const [loading, setLoading] = useState(false);

  const clampEndToSameDayIfNeeded = useCallback(
    (r: { start: Date; end: Date }) => {
      if (!isOneDay) return r;
      const endLocked = new Date(
        r.start.getFullYear(),
        r.start.getMonth(),
        r.start.getDate(),
        r.end.getHours(),
        r.end.getMinutes(),
        0,
        0
      );
      return { start: r.start, end: endLocked < r.start ? r.start : endLocked };
    },
    [isOneDay]
  );

  const isDisabled = useCallback(() => {
    if (!title?.trim()) return true;
    if (!range?.start || !range?.end) return true;
    if (range.end <= range.start) return true;
    return false;
  }, [title, range]);

  const handleSave = useCallback(async () => {
    if (!authUser) return;
    if (isDisabled()) return;

    const recurrence =
      repeat.freq === "NONE" ? undefined : toRRULE(repeat, range.start, timezone);

    const calenderEvent: Omit<CalendarEvent, "id"> = {
      title: title.trim(),
      description: description?.trim() || undefined,
      location: location?.label || undefined,
      start: isAllDay
        ? new Date(
          Date.UTC(
            range.start.getFullYear(),
            range.start.getMonth(),
            range.start.getDate(),
            0, 0, 0, 0
          )
        ).toISOString()
        : range.start.toISOString(),
      end: isAllDay
        ? new Date(
          Date.UTC(
            range.end.getFullYear(),
            range.end.getMonth(),
            range.end.getDate(),
            23, 59, 59, 999
          )
        ).toISOString()
        : range.end.toISOString(),
      timezone,
      isAllDay,
      activityType,
      recurrence,
      exdates: undefined,
      overrides: undefined,
      createdBy: authUser.uid,
      attendees: data?.attendees ?? [],
      updatedAt: Date.now(),
    };

    try {
      setLoading(true);
      const res = await addCalenderEvent(calenderEvent);
      setLoading(false);
      if (res.success) {
        close();
        router.replace("/(tabs)/calendar");
      }
    } catch (e) {
      setLoading(false);
      console.error("Failed to add event:", e);
    }
  }, [
    authUser,
    isDisabled,
    title,
    description,
    location,
    range,
    isAllDay,
    activityType,
    repeat,
    timezone,
    data?.attendees,
    close,
  ])

  const user = useUserStore((s) => s.user);
  const partnerFirstName = getPartnerName(user?.partner?.name ?? null);

  // Keep range consistent when toggles change
  const onChangeRange = (r: { start: Date; end: Date }) => {
    setRange(clampEndToSameDayIfNeeded(r));
  };

  const isAMPM = detectUsesAMPM()
  return (
    <Screen modal={true}  scrollable style={{ backgroundColor: colors.background }}>
      <View className="h-20 sticky">
        <BackButton onPress={() => close()} />
      </View>

      <Text variant="headlineMedium" className="font-bold mb-2">
        Add calendar event
      </Text>

      <View className="flex" style={{ gap: 12 }}>
        <TextField
          label="Title"
          placeholder={`e.g., Dinner with ${partnerFirstName}`}
          value={title}
          onChangeText={setTitle}
          autoCorrect
        />

        <TextField
          multiline
          textArea
          optional
          label="Description"
          placeholder="e.g., Remember to bring flowers."
          value={description}
          onChangeText={setDescription}
          autoCorrect
        />

        <ActivityTypePicker
          value={activityType}
          onChange={setActivityType}
          label="Event type"
        />

        <ToggleField
          label="One-day"
          value={isOneDay}
          onValueChange={(v) => {
            setIsOneDay(v);
            // Immediately clamp end to same-day if toggled on
            if (v) setRange((prev) => clampEndToSameDayIfNeeded(prev));
          }}
          description="Keep start and end on the same day"
        />

        <ToggleField
          label="All-day"
          value={isAllDay}
          onValueChange={setIsAllDay}
          description="Mark as an all-day event"
        />

        {/* Date range (with optional same-day lock) */}
        <DateTimeRangeField
          label="When"
          value={range}
          onChange={onChangeRange}
          isAllDay={isAllDay}
          lockToSameDay={isOneDay}
        />

        <TimeRangeField
          use24h={!isAMPM}
          label="Time (From → To)"
          value={range}
          onChange={onChangeRange}
          lockToSameDay={isOneDay}
          disabled={isAllDay}
        />

        <RepeatPicker value={repeat} onChange={setRepeat} />

        <LocationPicker value={location} onChange={setLocation} />

        <PrimaryButton
          loading={loading}
          disabled={isDisabled()}
          className="relative top-4 mb-20"
          variant="filled"
          onPress={handleSave}
        >
          Create Event
        </PrimaryButton>
      </View>
    </Screen>
  );
}
