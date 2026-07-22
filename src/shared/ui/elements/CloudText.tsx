// CloudText.tsx
import React, { memo, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path, G } from 'react-native-svg';

type CloudTextProps = {
  id?: string
  text: string;
  onPress?: (id: string) => void;
  /** position the anchor: (0,0) is the **start of the tail** */
  style?: ViewStyle;

  /** visuals */
  bubbleColor?: string;       // fill
  outlineColor?: string;      // stroke
  textColor?: string;

  /** layout for collapsed state */
  width?: number;             // cloud width (collapsed)
  height?: number;            // cloud height (collapsed)
  tailLength?: number;        // px along x from anchor to cloud
  tailRise?: number;          // how high (negative is up)

  /** interactivity */
  closable?: boolean;         // show "X" button
  onClose?: () => void;
  flip?: boolean;             // mirror horizontally (tail goes the other way)
  expandOnPress?: boolean;
  expandWidth?: number;
  expandHeight?: number;

  scale?: number;
};

export const CloudText = memo(function CloudText({
                                                   id ,
                                                   text,
                                                   onPress,
                                                   style,
                                                   bubbleColor = '#ffffff',
                                                   outlineColor = '#000000',
                                                   textColor = '#000000',

                                                   width = 220,
                                                   height = 130,
                                                   tailLength = 72,
                                                   tailRise = -28,

                                                   closable = false,
                                                   onClose,
                                                   flip = false,
                                                   expandOnPress = true,
                                                   expandWidth = 320,
                                                   expandHeight = 420,

                                                  scale = 1
                                                 }: CloudTextProps) {
  // animation driver (0..1 repeating)
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withRepeat(withTiming(1, { duration: 1600 }), -1, false);
  }, []);

  // expansion state
  const [expanded, setExpanded] = useState(false);

  // animate size & position
  const w = useSharedValue(width);
  const h = useSharedValue(height);
  const bx = useSharedValue(tailLength * (flip ? -1 : 1));
  const by = useSharedValue(tailRise);

  useEffect(() => {
    // keep base positions synced with props (in case parent re-renders with different values)
    if (!expanded) {
      w.value = width;
      h.value = height;
      bx.value = tailLength * (flip ? -1 : 1);
      by.value = tailRise;
    }
  }, [width, height, tailLength, tailRise, flip, expanded]);

  const breathe = useAnimatedStyle(() => {
    const scale = interpolate(t.value, [0, 0.5, 1], [1, 1.025, 1], Extrapolate.CLAMP);
    return { transform: [{ scale }] };
  });

  const bubbleStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: bx.value,
    top: by.value,
    width: w.value,
    height: h.value,
  }));

  // 3 tail dots from anchor (0,0) to bubble
  const dots = useMemo(() => {
    // fractions along the path
    const S = [0.25, 0.55, 0.85];
    return S.map((s, i) => {
      const x = (tailLength * (flip ? -1 : 1)) * s;
      const y = Math.pow(s, 0.9) * Math.abs(tailRise); // curve upward
      const size = [7, 11, 15][i];
      return { x, y: Math.sign(tailRise) * y, size, phase: s };
    });
  }, [tailLength, tailRise, flip]);

  const tailPulse = (phase: number) =>
    useAnimatedStyle(() => {
      const p = (t.value + 1 - phase) % 1;
      const scale = interpolate(p, [0, 0.5, 1], [0.85, 1.15, 0.85]);
      const opacity = interpolate(p, [0, 0.25, 0.6, 1], [0.35, 0.95, 0.95, 0.35]);
      return { opacity, transform: [{ scale }] };
    });

  // tap to expand/collapse
  const handlePress = () => {
    console.log("pressed")
    if(!id) {return}
    onPress?.(id);
  };

  // cloud path: normalized viewBox 200x140, scaled by width/height
  // (hand-tuned cartoon cloud—puffy + outline)
  const CloudSVG = () => (
    <Svg width="100%" height="100%" viewBox="0 0 200 140">
      <G transform={`translate(${0}, ${0}) ${flip ? 'scale(-1,1) translate(-200,0)' : ''}`}>
        <Path
          d="M62 36c8-18 40-22 56-7 18-16 46-5 50 16 18 2 28 18 24 34 6 18-10 36-28 36H58c-22 0-36-16-34-34-19-10-18-38 6-44 6-12 20-14 32-1 0 0 0 0 0 0z"
          fill={bubbleColor}
          stroke={outlineColor}
          strokeWidth={3}
        />
      </G>
    </Svg>
  );



  return (
    <View style={
      [style,
      styles.anchor,

      // scale from the anchor (component origin)
      { transform: [{ scale }], overflow: 'visible' },
    ]} pointerEvents="box-none">
      {/* click-away overlay when expanded */}
      {expanded && (
        <Pressable
          onPress={() => handlePress()}
          style={StyleSheet.absoluteFill}
        />
      )}

      {/* Tail: 3 dots */}
      {dots.map(({ x, y, size, phase }, idx) => {
        const s = tailPulse(phase);
        return (
          <Animated.View
            key={idx}
            style={[
              styles.dot,
              s,
              {
                left: (x - size / 2) + (flip ? 80 : 40),
                top: (y - size / 2) + (100),
                width: size,
                height: size,
                backgroundColor: bubbleColor,
                borderColor: outlineColor,
              },
            ]}
          />
        );
      })}

      {/* Bubble */}
      <Animated.View style={[bubbleStyle, breathe, styles.bubbleWrap]} pointerEvents="box-none">
        <Pressable onPress={handlePress} style={[StyleSheet.absoluteFill, {zIndex: 50}]} />

        {/* SVG cloud */}
        <CloudSVG />



        {/* inner content layer */}
        <View style={styles.content} pointerEvents="none">
          {expanded ? (
            <ScrollView
              style={StyleSheet.absoluteFill}
              contentContainerStyle={{ padding: 14, paddingTop: 16 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.textExpanded, { color: textColor }]}>{text}</Text>
            </ScrollView>
          ) : (
            <View style={styles.inlineTextBox}>
              <Text
                style={[styles.textInline, { color: textColor }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {text}
              </Text>
            </View>
          )}
        </View>


      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute', // (0,0) here = start of the tail
    overflow: 'visible',
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  bubbleWrap: {
    overflow: 'visible',
  },
  content: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
  },
  inlineTextBox: {
    position: 'absolute',
    left: 60, top: 50,
    width: "50%"
  },
  textInline: {
    fontSize: 12,
    fontWeight: '600',
  },
  textExpanded: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
  },
  closeBtn: {
    position: 'absolute',
    top: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  closeTxt: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '800',
  },
});
