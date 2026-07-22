import * as React from "react";
import { View, ViewStyle } from 'react-native';
import { Chip, Text } from "react-native-paper";
// If you have your own hook:
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';

type Category = string;


export type CategoryPickerProps = {
  categories?: any[];           // Explicit list overrides type
  value: any[];                 // Controlled selection (array even for single mode)
  onChange: (next: any[]) => void;
  multiple?: boolean;                // false = single-select
  maxSelections?: number;            // Optional cap (only used for multiple)
  minSelections?: number;
  label?: string;
  style?: ViewStyle;
  chipStyle?: any;             // Optional per-chip container style
  disabled?: boolean;
  showTitleAndBorder?: boolean;
};

export function CategoryPicker({

                                 categories,
                                 value,
                                 onChange,
                                 multiple = true,
                                 maxSelections,
                                 minSelections=0,
                                 label = "Categories",
                                 style,
                                 chipStyle,
                                 disabled,
                                 showTitleAndBorder=true
                               }: CategoryPickerProps) {
  // useThemeColors is an imported function and always defined; the previous
  // `useThemeColors ? useThemeColors() : ...` conditional was dead code that
  // also violated rules-of-hooks.
  const colors = useThemeColors();


  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const canAddMore =
    multiple ? (typeof maxSelections === "number" ? value.length < maxSelections : true) : value.length === 0;

  const canRemoveMore = value.length !== minSelections;


  const toggle = (c: Category) => {
    if (disabled) return;

    if (multiple) {
      // remove if selected
      if (canRemoveMore && selectedSet.has(c)) {
        onChange(value.filter(v => v !== c));
      } else {
        if (!canAddMore) return;

        if (!selectedSet.has(c)) {
          onChange([...value, c]);
        }
      }
    } else {
      // single
      if (canRemoveMore && selectedSet.has(c)) {
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
    <View className={` ${showTitleAndBorder && "p-2 rounded-lg border-[2px]"}`} style={{ borderColor: colors.outlineVariant, gap: 8}}>
      {(label && showTitleAndBorder) ? (
        <Text variant="labelLarge" style={{ color: colors.onSurface }}>
          {label}
        </Text>
      ) : null}

      <View

        className={"flex justify-center"}
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 4,
        }}


      >
        {categories?.map((c) => {
          const selected = selectedSet.has(c);
          // Outline when not selected; filled with primary when picked
          const backgroundColor = selected ? colors.primary : colors.surface;
          const borderColor = selected ? colors.primary : colors.outline;
          const textColor = selected ? colors.onPrimary : colors.onSurface;

          return (
            <Chip
              key={c}
              className={"p-0"}
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
              disabled={disabled}
              compact
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                className={"text-center"}
                style={{
                  color: textColor,
                  fontSize: 12, // base size
                  textAlign: "center",
                }}
              >
                {c}
              </Text>
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

