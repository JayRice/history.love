// AnimatedHeart.tsx
import React, { useEffect, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  Easing,
  cancelAnimation,
  interpolate,
} from "react-native-reanimated";
import type { MoodConfig, MoodId } from "@/src/shared/types/Moods";
import { getMoodById } from "@/src/shared/types/Moods";

type Props = {
  moodId: MoodId;
  size?: number;              // heart size in px
  showGlow?: boolean;
  showLabel?: boolean;
  /** Override bpm at runtime (optional). */
  overrideBpm?: number;
};

function bpmToMs(bpm: number) {
  // length of one beat (peak-to-peak) in ms
  return (60_000 / Math.max(30, bpm));
}

export const AnimatedHeart: React.FC<Props> = ({
                                                 moodId,
                                                 size = 72,
                                                 showGlow = true,
                                                 showLabel = true,
                                                 overrideBpm,
                                               }) => {
  const mood: MoodConfig = useMemo(() => getMoodById(moodId), [moodId]);
  const color = mood.color;

  // animated values
  const scaleSV = useSharedValue(1);
  const glowSV = useSharedValue(0);        // 0..1
  const colorProg = useSharedValue(1);     // for smooth color transitions if you later interpolate

  // When mood changes, gently cross-fade the “phase”
  useEffect(() => {
    colorProg.value = 0;
    colorProg.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
  }, [moodId]);

  useEffect(() => {
    const bpm = overrideBpm ?? mood.beat.bpm;
    const base = bpmToMs(bpm);
    const intensity = Math.min(Math.max(mood.beat.intensity, 0.08), 0.35); // clamp
    const upScale = 1 + intensity;  // peak scale
    const downScale = 1;            // rest scale

    cancelAnimation(scaleSV);
    cancelAnimation(glowSV);

    // Patterns
    if (mood.beat.pattern === "single") {
      // Single smooth beat loop
      const up = withTiming(upScale, { duration: base * 0.45, easing: Easing.out(Easing.cubic) });
      const down = withTiming(downScale, { duration: base * 0.55, easing: Easing.in(Easing.cubic) });
      scaleSV.value = withRepeat(withSequence(up, down), -1, false);

      // Glow follows scale (same rhythm)
      const gUp = withTiming(1, { duration: base * 0.45, easing: Easing.out(Easing.cubic) });
      const gDown = withTiming(0, { duration: base * 0.55, easing: Easing.in(Easing.cubic) });
      glowSV.value = withRepeat(withSequence(gUp, gDown), -1, false);

    } else if (mood.beat.pattern === "double") {
      // Boom-boom ... pause (two quick peaks then rest)
      const short = base * 0.22;
      const shortDown = base * 0.18;
      const rest = base * 0.42 + base * 0.18; // fill to full duration

      scaleSV.value = withRepeat(
        withSequence(
          withTiming(upScale, { duration: short, easing: Easing.out(Easing.cubic) }),
          withTiming(downScale, { duration: shortDown, easing: Easing.in(Easing.cubic) }),
          withTiming(upScale * 0.97, { duration: short, easing: Easing.out(Easing.cubic) }),
          withTiming(downScale, { duration: shortDown, easing: Easing.in(Easing.cubic) }),
          withTiming(downScale, { duration: rest }) // quiet rest
        ),
        -1,
        false
      );

      glowSV.value = withRepeat(
        withSequence(
          withTiming(1, { duration: short, easing: Easing.out(Easing.cubic) }),
          withTiming(0.15, { duration: shortDown, easing: Easing.in(Easing.cubic) }),
          withTiming(0.9, { duration: short, easing: Easing.out(Easing.cubic) }),
          withTiming(0.08, { duration: shortDown, easing: Easing.in(Easing.cubic) }),
          withTiming(0, { duration: rest })
        ),
        -1,
        false
      );

    } else {
      // "irregular": vary duration each cycle by variance
      const variance = Math.min(Math.max(mood.beat.variance ?? 0.2, 0), 0.45);
      const mkCycle = () => {
        const r = (Math.random() * 2 - 1) * variance; // [-variance, +variance]
        const dur = base * (1 + r);
        const up = withTiming(upScale, { duration: dur * 0.4, easing: Easing.out(Easing.cubic) });
        const down = withTiming(downScale, { duration: dur * 0.6, easing: Easing.in(Easing.cubic) });
        return withSequence(up, down);
      };
      // Repeat a sequence of random beats; wrap a few to avoid excessive re-entry
      scaleSV.value = withRepeat(
        withSequence(mkCycle(), mkCycle(), mkCycle(), mkCycle()),
        -1,
        false
      );
      glowSV.value = withRepeat(
        withSequence(
          withTiming(1, { duration: base * 0.35, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: base * 0.65, easing: Easing.in(Easing.cubic) }),
          withTiming(1, { duration: base * 0.33, easing: Easing.out(Easing.cubic) }),
          withTiming(0, { duration: base * 0.67, easing: Easing.in(Easing.cubic) })
        ),
        -1,
        false
      );
    }

    return () => {
      cancelAnimation(scaleSV);
      cancelAnimation(glowSV);
    };
  }, [moodId, overrideBpm]);

  // HEART STYLE
  const heartStyle = useAnimatedStyle(() => {
    const scale = scaleSV.value;
    return {
      transform: [{ scale }],
      // If you later interpolate across colors, you can drive opacity or colorProg here
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    const o = interpolate(glowSV.value, [0, 1], [0, 0.55]);
    const s = interpolate(glowSV.value, [0, 1], [1, 1.25]); // bigger glow at peak
    return {
      opacity: o,
      transform: [{ scale: s }],
    };
  });

  const sizePx = size;
  const heart = (
    <Animated.View
      style={[
        styles.heartBase,
        heartStyle,
        {
          width: sizePx,
          height: sizePx,
          backgroundColor: color,
        },
      ]}
    />
  );

  return (
    <View style={[styles.wrap, { width: sizePx * 2, alignItems: "center" }]}>
      {showGlow && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glow,
            glowStyle,
            {
              width: sizePx * 1.9,
              height: sizePx * 1.9,
              backgroundColor: color,
            },
          ]}
        />
      )}
      {heart}
      {showLabel && (
        <View style={{ marginTop: 10, alignItems: "center" }}>
          <Text style={styles.label}>
            {mood.emoji ? `${mood.label} ${mood.emoji}` : mood.label}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    justifyContent: "center",
  },
  // Simple geometric heart (rounded square rotated 45° + two circles look better,
  // but a pill with borderRadius is clean and performant.)
  heartBase: {
    borderRadius: 999,
  },
  glow: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0,
    // Simple aura: use shadow for iOS & transparent background for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    // Android fallback with slightly transparent bg already handled
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    opacity: 0.9,
  },
});

export default AnimatedHeart;
