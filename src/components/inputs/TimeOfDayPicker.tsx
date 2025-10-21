import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { Text, SegmentedButtons } from "react-native-paper";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { TextField } from "@/src/components/inputs/TextField";

type Meridiem = "AM" | "PM";

type Props = {
  label?: string;
  /** The date whose time we’re editing. Only HH:mm are read/changed; Y-M-D preserved. */
  date: Date;
  onChange: (dateWithNewTime: Date) => void;
  minuteStep?: number;   // default 5
  use24h?: boolean;      // default false (12h with AM/PM)
  disabled?: boolean;
};

/** Clamp integer between min/max, falling back to defaultVal when NaN */
function clampInt(n: number, min: number, max: number, defaultVal: number) {
  if (Number.isNaN(n)) return defaultVal;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

function to12h(h24: number): { hour12: number; meridiem: Meridiem } {
  const meridiem: Meridiem = h24 >= 12 ? "PM" : "AM";
  let hour12 = h24 % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour12, meridiem };
}

function to24h(hour12: number, meridiem: Meridiem) {
  const h = hour12 % 12 + (meridiem === "PM" ? 12 : 0);
  return h === 24 ? 0 : h;
}

export const TimeOfDayPicker: React.FC<Props> = ({
                                                   label = "Time",
                                                   date,
                                                   onChange,
                                                   minuteStep = 5,
                                                   use24h = false,
                                                   disabled = false,
                                                 }) => {
  const colors = useThemeColors();

  // derive initial state from date
  const init = useMemo(() => {
    const m = date.getMinutes();
    const rounded = Math.round(m / minuteStep) * minuteStep;
    const minutes = (rounded + 60) % 60;
    const hour24 = (date.getHours() + (rounded >= 60 ? 1 : 0)) % 24;
    const { hour12, meridiem } = to12h(hour24);
    return { hour24, hour12, minutes, meridiem };
  }, [date, minuteStep]);

  const [hour12, setHour12] = useState<number>(init.hour12);
  const [hour24, setHour24] = useState<number>(init.hour24);
  const [minutes, setMinutes] = useState<number>(init.minutes);
  const [meridiem, setMeridiem] = useState<Meridiem>(init.meridiem);

  // keep internal in sync if parent date changes
  useEffect(() => {
    setHour24(init.hour24);
    setMinutes(init.minutes);
    setHour12(init.hour12);
    setMeridiem(init.meridiem);
  }, [init.hour24, init.minutes, init.hour12, init.meridiem]);

  // push changes up whenever time parts update
  useEffect(() => {
    const h = use24h ? hour24 : to24h(hour12, meridiem);
    const next = new Date(date);
    next.setHours(h, minutes, 0, 0);
    if (!disabled) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour12, hour24, minutes, meridiem, use24h, disabled]);

  const onHourChange = (text: string) => {
    const n = clampInt(parseInt(text, 10), use24h ? 0 : 1, use24h ? 23 : 12, use24h ? hour24 : hour12);
    if (use24h) setHour24(n);
    else setHour12(n);
  };

  const onMinuteChange = (text: string) => {
    const n = clampInt(parseInt(text, 10), 0, 59, minutes);
    // snap to step
    const snapped = Math.round(n / minuteStep) * minuteStep;
    setMinutes(Math.min(59, snapped));
  };

  return (
    <View className="flex" style={{ gap: 6, opacity: disabled ? 0.5 : 1 }}>
      <Text variant="bodyLarge">{label}</Text>

      <View className="flex-row items-end" style={{ gap: 10 }}>
        {/* Hour */}
        <View style={{ width: 90 }}>
          <TextField
            label={use24h ? "Hour (0–23)" : "Hour (1–12)"}
            value={String(use24h ? hour24 : hour12)}
            onChangeText={onHourChange}
            keyboardType="number-pad"
            disabled={disabled}
            editable={false}
          />
        </View>

        {/* Colon */}
        <Text variant="headlineSmall" style={{ marginBottom: 6, color: colors.text }}>
          :
        </Text>

        {/* Minute */}
        <View style={{ width: 90 }}>
          <TextField
            label="Minute"
            value={String(minutes).padStart(2, "0")}
            onChangeText={onMinuteChange}
            keyboardType="number-pad"
            disabled={disabled}
            editable={false}

          />
        </View>

        {/* AM/PM */}
        {!use24h && (
          <View style={{ flex: 1 }}>
            <SegmentedButtons

              value={meridiem}
              onValueChange={(v) => setMeridiem((v as Meridiem) ?? "AM")}
              buttons={[
                { value: "AM", label: "AM" },
                { value: "PM", label: "PM" },
              ]}
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
              }}
            />
          </View>
        )}
      </View>

      {/* Quick minute stepping (optional tiny helpers) */}
      <View className="flex-row" style={{ gap: 8, marginTop: 10 }}>
        {[ -10 ,-minuteStep, +minuteStep, +15, +30, +60 ].map((delta) => (
          <View
            key={delta}
            className="px-3 py-1 rounded-2xl"
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              onPress={() => {
                if (disabled) return;
                const base = new Date(date);
                base.setHours(use24h ? hour24 : to24h(hour12, meridiem), minutes, 0, 0);
                base.setMinutes(base.getMinutes() + delta);
                const { hour12: h12, meridiem: md } = to12h(base.getHours());
                setHour24(base.getHours());
                setHour12(h12);
                setMeridiem(md);
                setMinutes(base.getMinutes());
              }}
              style={{ color: colors.textSecondary }}
            >
              {delta > 0 ? `+${delta}m` : `${delta}m`}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};
