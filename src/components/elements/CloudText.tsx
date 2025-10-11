// CloudText.tsx
import React, { memo, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate, Extrapolate
} from 'react-native-reanimated';

type CloudTextProps = {
  text: string;
  onPress?: () => void;
  /** Optional: tweak sizes/colors/position */
  style?: ViewStyle;
  maxWidth?: number;     // max width of the bubble
  bubblePaddingH?: number;
  bubblePaddingV?: number;
  bubbleColor?: string;
  textColor?: string;
  tailDotCount?: number; // number of dots in the tail line
  tailLength?: number;   // total length (px) of tail from anchor to bubble
  tailSpread?: number;   // lateral spread arc (px)
  durationMs?: number;   // pulse duration for one wave
};

export const CloudText = memo(function CloudText({
                                                   text,
                                                   onPress,
                                                   style,
                                                   maxWidth = 260,
                                                   bubblePaddingH = 14,
                                                   bubblePaddingV = 10,
                                                   bubbleColor = '#fff',
                                                   textColor = '#000',
                                                   tailDotCount = 8,
                                                   tailLength = 90,
                                                   tailSpread = 28,
                                                   durationMs = 1400,
                                                 }: CloudTextProps) {
  /**
   * Absolute component with (0,0) as the tail start (anchor).
   * Bubble is positioned up/right from the anchor; tail dots curve from anchor to bubble.
   */
  const t = useSharedValue(0);

  useEffect(() => {
    // drive a looping time value [0..1]
    t.value = withRepeat(withTiming(1, { duration: durationMs }), -1, false);
  }, [durationMs]);

  // Bubble position relative to anchor:
  // place the bubble “end” of the tail at (tailLength, -tailSpread)
  const bubbleOffsetX = tailLength;
  const bubbleOffsetY = -tailSpread;

  // Tail dots positions along a simple curve y = -tailSpread * (s)^0.9, x = tailLength * s
  const dots = new Array(tailDotCount).fill(0).map((_, i) => {
    const s = (i + 1) / (tailDotCount + 1); // 0..1 (avoid 0 exactly so first dot appears)
    const x = tailLength * s;
    const y = -Math.pow(s, 0.9) * tailSpread;
    const size = 6 + 4 * s; // dots get a little larger as they approach the bubble
    const delayPhase = s;   // used to stagger the wave
    return { x, y, size, delayPhase, key: `d${i}` };
  });

  const Bubble = () => {
    // Make the bubble itself gently breathe
    const bubbleAnim = useAnimatedStyle(() => {
      const scale = interpolate(
        t.value,
        [0, 0.5, 1],
        [1, 1.03, 1],
        Extrapolate.CLAMP
      );
      return { transform: [{ scale }] };
    });

    return (
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: bubbleOffsetX,
            top: bubbleOffsetY,
          },
          styles.bubbleShadow,
          bubbleAnim,
        ]}
      >
        <Pressable
          onPress={onPress}
          style={[
            styles.bubble,
            {
              backgroundColor: bubbleColor,
              maxWidth,
              paddingHorizontal: bubblePaddingH,
              paddingVertical: bubblePaddingV,
            },
          ]}
        >
          <Text
            style={[styles.text, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {text}
          </Text>

          {/* little bottom “cloudy” fringe to sell the look */}
          <View style={styles.fringeRow}>
            {[...Array(5)].map((_, i) => (
              <View
                key={`f${i}`}
                style={[
                  styles.fringeDot,
                  { backgroundColor: bubbleColor, marginHorizontal: 3, width: 6 + i % 2, height: 6 + i % 2 },
                ]}
              />
            ))}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className={"border-1 border-black"} style={[styles.container, style]}>
      {/* Tail dots from anchor (0,0) to bubble offset */}
      {dots.map(({ x, y, size, delayPhase, key }) => {
        const sDot = useAnimatedStyle(() => {
          // Make a wave that travels forward: we phase-shift by the dot's delay
          const phase = (t.value + 1 - delayPhase) % 1; // 0..1
          const scale = interpolate(phase, [0, 0.5, 1], [0.85, 1.15, 0.85]);
          const opacity = interpolate(phase, [0, 0.3, 0.6, 1], [0.35, 0.9, 0.9, 0.35]);
          return {
            opacity,
            transform: [{ scale }],
          };
        });
        return (
          <Animated.View
            key={key}
            style={[
              styles.dot,
              sDot,
              {
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
              },
            ]}
          />
        );
      })}

      <Bubble />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute', // anchor: (0,0) is the start of the tail
    // caller decides where to place this inside a relatively positioned parent
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  bubble: {
    borderRadius: 18,
  },
  bubbleShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  fringeRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    marginTop: 6,
    marginLeft: 2,
  },
  fringeDot: {
    borderRadius: 999,
  },
});
