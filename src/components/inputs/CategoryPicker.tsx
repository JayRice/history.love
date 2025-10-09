import * as React from "react";
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Chip, Text, useTheme } from "react-native-paper";
// If you have your own hook:
import { useThemeColors } from '@/src/hooks/useThemeColors';

type Category = string;


export type CategoryPickerProps = {
  categories?: any[];           // Explicit list overrides type
  value: any[];                 // Controlled selection (array even for single mode)
  onChange: (next: any[]) => void;
  multiple?: boolean;                // false = single-select
  maxSelections?: number;            // Optional cap (only used for multiple)
  label?: string;
  style?: ViewStyle;
  chipStyle?: ViewStyle;             // Optional per-chip container style
  disabled?: boolean;
};

export function CategoryPicker({
                                 categories,
                                 value,
                                 onChange,
                                 multiple = true,
                                 maxSelections,
                                 label = "Categories",
                                 style,
                                 chipStyle,
                                 disabled,
                               }: CategoryPickerProps) {
  const theme = useTheme();
  const colors = useThemeColors ? useThemeColors() : theme.colors;


  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const canAddMore =
    multiple ? (typeof maxSelections === "number" ? value.length < maxSelections : true) : value.length === 0;

  const toggle = (c: Category) => {
    if (disabled) return;

    if (multiple) {
      // remove if selected
      if (selectedSet.has(c)) {
        onChange(value.filter(v => v !== c));
      } else {
        if (!canAddMore) return;
        onChange([...value, c]);
      }
    } else {
      // single
      if (selectedSet.has(c)) {
        // tapping selected will clear (or you can comment this to keep one always)
        onChange([]);
      } else {
        onChange([c]);
      }
    }
  };

  const remove = (c: Category) => {
    if (disabled) return;
    onChange(value.filter(v => v !== c));
  };

  return (
    <View  className={" p-2 rounded-lg border-[2px]"} style={{ borderColor: colors.outlineVariant, gap: 8}}>
      {label ? (
        <Text variant="labelLarge" style={{ color: colors.onSurface }}>
          {label}
        </Text>
      ) : null}

      <View


        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
        }}


      >
        {categories?.map((c) => {
          const selected = selectedSet.has(c);
          // Outline when not selected; filled with primary when picked
          const backgroundColor = selected ? theme.colors.primary : theme.colors.surface;
          const borderColor = selected ? theme.colors.primary : theme.colors.outline;
          const textColor = selected ? theme.colors.onPrimary : theme.colors.onSurface;

          return (
            <Chip
              key={c}
              selected={selected}
              showSelectedCheck={false} // 👈 removes the checkmark
              onPress={() => toggle(c)}
              mode="outlined"
              style={[
                {
                  borderColor,
                  backgroundColor,
                  borderRadius: 12,
                },
                chipStyle,
              ]}
              textStyle={{ color: textColor }}
              disabled={disabled}
              compact
            >
              {c}
            </Chip>
          );
        })}
      </View>

      {/* Multi-pick hint like your photos counter */}
      {multiple && typeof maxSelections === "number" && (
        <Text style={{ marginTop: 8, color: colors.onSurfaceVariant }}>
          {value.length}/{maxSelections} selected
        </Text>
      )}
    </View>
  );
}

