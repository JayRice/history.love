import React, { useMemo } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import { TextField } from "@/src/components/inputs/TextField";
import { ToggleField } from "@/src/components/inputs/ToggleField";
import { useThemeColors } from "@/src/hooks/useThemeColors";

// Days checkboxes without bringing in new libs:
const DAYS: { code: string; label: string }[] = [
  { code: "SU", label: "Sun" },
  { code: "MO", label: "Mon" },
  { code: "TU", label: "Tue" },
  { code: "WE", label: "Wed" },
  { code: "TH", label: "Thu" },
  { code: "FR", label: "Fri" },
  { code: "SA", label: "Sat" },
];

type RepeatState = {
  freq: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  byWeekDays: string[];
  interval: number;
  count?: number;
  until?: Date | null;
};

type Props = {
  value: RepeatState;
  onChange: (val: RepeatState) => void;
};

export const RepeatPicker: React.FC<Props> = ({ value, onChange }) => {
  const colors = useThemeColors();

  const showByDays = value.freq === "WEEKLY";

  const toggleDay = (code: string) => {
    const has = value.byWeekDays.includes(code);
    const byWeekDays = has
      ? value.byWeekDays.filter((c) => c !== code)
      : [...value.byWeekDays, code];
    onChange({ ...value, byWeekDays });
  };

  return (
    <View className="flex" style={{ gap: 10 }}>
      <Text variant="bodyLarge">Repeat</Text>

      {/* Frequency quick choices */}
      <View className="flex-row" style={{ gap: 8, flexWrap: "wrap" }}>
        {(["NONE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"] as const).map((f) => {
          const selected = value.freq === f;
          return (
            <View
              key={f}
              className="px-3 py-2 rounded-2xl"
              style={{
                backgroundColor: selected ? colors.primary : colors.surface,
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.border,
              }}
            >
              <Text
                onPress={() => onChange({ ...value, freq: f })}
                style={{
                  color: selected ? colors.onPrimary : colors.text,
                }}
              >
                {f[0] + f.slice(1).toLowerCase()}
              </Text>
            </View>
          );
        })}
      </View>

      {value.freq !== "NONE" && (
        <View style={{ gap: 10 }}>
          <TextField
            label="Repeat every"
            placeholder="Interval (e.g., 1)"
            keyboardType="number-pad"
            value={String(value.interval ?? 1)}
            onChangeText={(t) =>
              onChange({ ...value, interval: Math.max(1, parseInt(t || "1")) })
            }
          />

          {showByDays && (
            <View>
              <Text variant="bodyMedium" style={{ color: colors.textSecondary }}>
                Repeat on
              </Text>
              <View className="flex-row" style={{ gap: 8, flexWrap: "wrap" }}>
                {DAYS.map((d) => {
                  const selected = value.byWeekDays.includes(d.code);
                  return (
                    <View
                      key={d.code}
                      className="px-3 py-2 rounded-2xl"
                      style={{
                        backgroundColor: selected ? colors.primary : colors.surface,
                        borderWidth: 1,
                        borderColor: selected ? colors.primary : colors.border,
                      }}
                    >
                      <Text
                        onPress={() => toggleDay(d.code)}
                        style={{ color: selected ? colors.onPrimary : colors.text }}
                      >
                        {d.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Optional end conditions */}
          <View style={{ gap: 6 }}>
            <ToggleField
              label="Limit occurrences"
              description="Stop after a certain number of repeats"
              value={typeof value.count === "number"}
              onValueChange={(v) =>
                onChange({ ...value, count: v ? 10 : undefined }) // default 10
              }
            />
            {typeof value.count === "number" && (
              <TextField
                label="Occurrences"
                keyboardType="number-pad"
                value={String(value.count)}
                onChangeText={(t) =>
                  onChange({
                    ...value,
                    count: Math.max(1, parseInt(t || "1")),
                  })
                }
              />
            )}
          </View>
        </View>
      )}
    </View>
  );
};

// Convert our small state shape into a simple RRULE string
export function toRRULE(
  r: RepeatState,
  dtStartLocal: Date,
  tz: string
): string {
  if (r.freq === "NONE") return "";
  const parts: string[] = [`FREQ=${r.freq}`];
  if (r.interval && r.interval !== 1) parts.push(`INTERVAL=${r.interval}`);
  if (r.freq === "WEEKLY" && r.byWeekDays?.length) {
    parts.push(`BYDAY=${r.byWeekDays.join(",")}`);
  }
  if (typeof r.count === "number") parts.push(`COUNT=${r.count}`);
  // You could add BYHOUR/BYMINUTE here if you want instances to match local time:
  parts.push(`TZID=${tz}`);
  // (We intentionally avoid UNTIL to keep UX simple; feel free to add.)
  return parts.join(";");
}
