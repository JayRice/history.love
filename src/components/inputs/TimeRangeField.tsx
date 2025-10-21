import React from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { TimeOfDayPicker } from "./TimeOfDayPicker";

type Props = {
  label?: string;
  value: { start: Date; end: Date };
  onChange: (value: { start: Date; end: Date }) => void;
  lockToSameDay?: boolean;
  use24h?: boolean;
  minuteStep?: number;
  disabled?: boolean;
};

function clampSameDayEnd(start: Date, end: Date) {
  const locked = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
    end.getHours(),
    end.getMinutes(),
    0,
    0
  );
  return locked < start ? start : locked;
}

export const TimeRangeField: React.FC<Props> = ({
                                                  label = "Time",
                                                  value,
                                                  onChange,
                                                  lockToSameDay = false,
                                                  use24h = false,
                                                  minuteStep = 5,
                                                  disabled = false,
                                                }) => {
  const colors = useThemeColors();

  const onStart = (d: Date) => {
    const end = lockToSameDay ? clampSameDayEnd(d, value.end) : value.end;
    // ensure end >= start
    const adjustedEnd = end < d ? new Date(d) : end;
    onChange({ start: d, end: adjustedEnd });
  };

  const onEnd = (d: Date) => {
    const end = lockToSameDay ? clampSameDayEnd(value.start, d) : d;
    const adjustedEnd = end < value.start ? value.start : end;
    onChange({ start: value.start, end: adjustedEnd });
  };

  return (
    <View className="flex" style={{ gap: 8, opacity: disabled ? 0.5 : 1 }}>
      <Text variant="bodyLarge">{label}</Text>

      <View className="flex" style={{ gap: 12 }}>
        <TimeOfDayPicker
          label="From"
          date={value.start}
          onChange={onStart}
          minuteStep={minuteStep}
          use24h={use24h}
          disabled={disabled}

        />
        <TimeOfDayPicker
          label="To"
          date={value.end}
          onChange={onEnd}
          minuteStep={minuteStep}
          use24h={use24h}
          disabled={disabled}
        />
      </View>

      {/* Tiny hint */}
      {/*<Text variant="bodySmall" style={{ color: colors.textSecondary }}>*/}
      {/*  Times adjust only the HH:MM; your selected dates are preserved.*/}
      {/*</Text>*/}
    </View>
  );
};
