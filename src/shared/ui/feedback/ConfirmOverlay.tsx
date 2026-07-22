// ConfirmOverlay.tsx
import React, { useEffect } from "react";
import { View, Pressable, BackHandler } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { Text } from "react-native-paper";
import { useThemeColors } from "@/src/shared/lib/hooks/useThemeColors";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  /** “danger” makes confirm button red and adds alert accent */
  variant?: "default" | "danger";
  /** When true, confirm button shows subtle disabled/processing state */
  loading?: boolean;
  /** Close when tapping the dimmed background */
  dismissOnBackdropPress?: boolean;

  icon?: React.ReactNode;

};

export function ConfirmOverlay({
                                 visible,
                                 title = "Are you sure?",
                                 message = "This action can’t be undone.",
                                 confirmLabel = "Confirm",
                                 cancelLabel = "Cancel",
                                 onConfirm,
                                 onCancel,
                                 variant = "default",
                                 loading = false,
                               }: Props) {
  const colors = useThemeColors();
  const progress = useSharedValue(0);

  // Animate in/out
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, {
      duration: visible ? 220 : 180,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
    });
  }, [visible]);

  // Android back button -> cancel
  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      onCancel();
      return true;
    });
    return () => sub.remove();
  }, [visible, onCancel]);



  const cardStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0.96, 1]);
    const opacity = progress.value;
    return { transform: [{ scale }], opacity };
  });

  // Colors
  const isDanger = variant === "danger";
  const confirmBg = isDanger ? "#E53935" : colors.primary;
  const confirmBgPressed = isDanger ? "#C62828" : colors.primaryContainer;
  const accent = isDanger ? "#FFCDD2" : colors.secondary;

  if (!visible && progress.value === 1) return null;

  return (
    <View  className="absolute inset-0 z-50">


      {/* Card */}
      <View className="absolute inset-0 items-center justify-center ">
        <Animated.View
          style={[
            cardStyle,
            {
              backgroundColor: colors.surface,
              borderColor: colors.outlineVariant ?? colors.outline,
              shadowColor: colors.shadow ?? "#000",
              gap: 8
            },
          ]}
          className="w-full max-w-md rounded-3xl border px-5 py-4 shadow-2xl"
        >
          {/* Accent header */}
          <View className="items-center mb-3">
            <View
              className="w-12 h-12 rounded-full items-center justify-center"
              style={{ backgroundColor: accent + "22" }}
            >
              <View
                className="w-7 h-7 rounded-full"
                style={{ backgroundColor: accent }}
              />
            </View>
          </View>

          {/* Title */}
          <Text
            variant="titleLarge"
            style={{ color: colors.onSurface }}
            className="text-center font-semibold"
          >
            {title}
          </Text>

          {/* Message */}
          {!!message && (
            <Text
              variant="bodyMedium"
              style={{ color: colors.onSurfaceVariant }}
              className="text-center mt-2"
            >
              {message}
            </Text>
          )}

          {/* Buttons */}
          <View className="flex flex-row  gap-3">
            <Pressable
              onPress={onCancel}
              disabled={loading}
              className="flex-1 rounded-2xl border"
              style={{
                borderColor: colors.outline,
                backgroundColor: colors.surfaceVariant,
              }}
            >
              <View className="py-3 items-center">
                <Text style={{ color: colors.onSurface }}> {cancelLabel} </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              className="flex-1 rounded-2xl w-full"
              style={{
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,}}
            >
              <View className="py-3 items-center">
                <Text style={{ color: "white", fontWeight: "700" }}>
                  {confirmLabel}
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Subtle glow ring */}
          <View
            pointerEvents="none"
            className="absolute -z-10 self-center"
            style={{
              top: -12,
              width: 180,
              height: 180,
              borderRadius: 999,
              backgroundColor: accent + "22",
              shadowColor: accent,
              shadowOpacity: 0.35,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 6 },
            }}
          />
        </Animated.View>
      </View>
    </View>
  );
}
