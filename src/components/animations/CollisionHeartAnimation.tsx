// CollisionHeartAnimation.tsx
import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet, ViewStyle, Pressable } from "react-native";
import ProfileImage from '@/src/components/elements/ProfileImage';
import { useThemeColors } from '@/src/hooks/useThemeColors';

// expects you already have this
// <ProfileImage source={...} /> renders a round image given a source prop
// If yours needs size, pass it through via `imageSize` below.

type Props = {
  userSource: any;              // e.g. userProfileImage
  partnerSource: any;           // e.g. partnerProfileImage
  imageSize?: number;           // diameter of each profile image
  gap?: number;                 // initial horizontal gap between the two images
  onCycleEnd?: () => void;      // optional callback when the whole sequence finishes
  style?: ViewStyle;            // optional outer style
  loop?: boolean;               // set true to loop the sequence
};

export default function CollisionHeartAnimation({
                                                  userSource,
                                                  partnerSource,
                                                  imageSize = 96,
                                                  gap = 140,
                                                  onCycleEnd,
                                                  style,
                                                  loop = false,
                                                }: Props) {
  // positions
  const leftX = useRef(new Animated.Value(-gap / 2)).current;
  const rightX = useRef(new Animated.Value(gap / 2)).current;

  // scales for a subtle punch on impact
  const leftScale = useRef(new Animated.Value(1)).current;
  const rightScale = useRef(new Animated.Value(1)).current;

  // opacities for crossfade
  const pairOpacity = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;

  // a tiny “screen shake” on impact
  const impactNudge = useRef(new Animated.Value(0)).current;

  const run = () => {
    // reset for replay
    leftX.setValue(-gap / 2);
    rightX.setValue(gap / 2);
    leftScale.setValue(1);
    rightScale.setValue(1);
    pairOpacity.setValue(1);
    heartOpacity.setValue(0);
    impactNudge.setValue(0);

    // timeline
    Animated.sequence([
      // 1) move together
      Animated.parallel([
        Animated.timing(leftX, {
          toValue: -8, // slight offset so they overlap a bit
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rightX, {
          toValue: 8,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      // 2) impact punch (scale + tiny shake)
      Animated.parallel([
        Animated.sequence([
          Animated.timing(leftScale, {
            toValue: 1.08,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(leftScale, {
            toValue: 1,
            duration: 140,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(rightScale, {
            toValue: 1.08,
            duration: 120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rightScale, {
            toValue: 1,
            duration: 140,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(impactNudge, {
            toValue: 1,
            duration: 80,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(impactNudge, {
            toValue: -1,
            duration: 80,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(impactNudge, {
            toValue: 0,
            duration: 80,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      ]),
      // 3) fade out pair
      Animated.timing(pairOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 4) fade in heart + nested images
      Animated.timing(heartOpacity, {
        toValue: 1,
        duration: 380,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      // 5) brief hold
      Animated.delay(800),
      // 6) if looping, crossfade back to start
      ...(loop
        ? [
          Animated.parallel([
            Animated.timing(heartOpacity, {
              toValue: 0,
              duration: 220,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(pairOpacity, {
              toValue: 1,
              duration: 220,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        ]
        : []),
    ]).start(({ finished }) => {
      if (finished && onCycleEnd) onCycleEnd();
      if (finished && loop) run();
    });
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nudgeTranslate = impactNudge.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-2, 0, 2],
  });

  const heartSize = Math.max(imageSize * 2 + 36, 220);

  const colors = useThemeColors()
  return (
    <Pressable onPress={() => run()} accessibilityRole="button" accessibilityLabel="Replay animation">
      <View style={[styles.container, style]} className="w-full items-center justify-center">
        {/* phase 1: collide & fade out */}
        <Animated.View
          style={[
            styles.row,
            { opacity: pairOpacity, transform: [{ translateX: nudgeTranslate }] },
          ]}
          className="absolute flex flex-row justify-center items-center w-full"
        >
          <Animated.View style={{ transform: [{ translateX: leftX }, { scale: leftScale }] }}>
            <ProfileImage source={userSource} size={imageSize} />
          </Animated.View>

          <Animated.View style={{ width: 16 }} />

          <Animated.View style={{ transform: [{ translateX: rightX }, { scale: rightScale }] }}>
            <ProfileImage source={partnerSource} size={imageSize} />
          </Animated.View>
        </Animated.View>

        {/* phase 2: heart reveal */}
        <Animated.View
          style={{ opacity: heartOpacity }}
          className="absolute items-center justify-center"
        >
          <View
            className={"absolute flex flex-row justify-between items-center "}
            style={{
              gap: 8
            }}
          >
            <ProfileImage source={userSource} size={imageSize * 0.8} />
            <ProfileImage source={partnerSource} size={imageSize * 0.8} />
          </View>
        </Animated.View>
      </View>
    </Pressable>
  );
}


const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "visible",
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
