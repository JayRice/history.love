import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import DatePicker from "@/src/shared/ui/inputs/DatePicker";
import { useThemeColors } from "@/src/shared/lib/hooks/useThemeColors";

type Props = {
  label?: string;
  value: { start: Date; end: Date };
  onChange: (value: { start: Date; end: Date }) => void;
  isAllDay?: boolean;
  lockToSameDay?: boolean; // NEW: if true, keep end on the same calendar day as start
};

function sameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const DateTimeRangeField: React.FC<Props> = ({
                                                      label = "Date & time",
                                                      value,
                                                      onChange,
                                                      isAllDay = false,
                                                      lockToSameDay = false,
                                                    }) => {
  const colors = useThemeColors();

  const onStartChange = (d: Date | null) => {
    if (!d) return;

    let nextEnd = value.end;
    // keep end >= start
    if (nextEnd < d) nextEnd = new Date(d);

    if (lockToSameDay) {
      // clamp end to same Y-M-D as start
      const locked = new Date(
        d.getFullYear(),
        d.getMonth(),
        d.getDate(),
        nextEnd.getHours(),
        nextEnd.getMinutes(),
        0,
        0
      );
      nextEnd = locked < d ? d : locked;
    }

    onChange({ start: d, end: nextEnd });
  };

  const onEndChange = (d: Date | null) => {
    if (!d) return;

    let nextEnd = d;
    if (lockToSameDay) {
      // move end onto start's Y-M-D
      nextEnd = new Date(
        value.start.getFullYear(),
        value.start.getMonth(),
        value.start.getDate(),
        d.getHours(),
        d.getMinutes(),
        0,
        0
      );
    }

    if (nextEnd < value.start) nextEnd = value.start;
    onChange({ start: value.start, end: nextEnd });
  };

  return (
    <View className="flex" style={{ gap: 8 }}>
      <Text variant="bodyLarge">{label}</Text>
      <View className="flex" style={{ gap: 10 }}>
        <View>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
            Start {isAllDay ? "(date only)" : "(date & time)"}
          </Text>
          <DatePicker date={value.start} onChangeDate={onStartChange} />
        </View>
        <View>
          <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
            End {isAllDay ? "(date only)" : "(date & time)"}
          </Text>
          <DatePicker date={value.end} onChangeDate={onEndChange} />
        </View>
      </View>
    </View>
  );
};
