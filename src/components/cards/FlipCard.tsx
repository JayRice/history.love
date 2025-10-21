// GameFlipCard.tsx
import React, { useCallback, useEffect } from 'react';
import { View, Pressable, Image, Text, ScrollView } from 'react-native';
import { Card } from "react-native-paper";
import Animated, {
  Extrapolate,
  interpolate,
  useSharedValue,
  useAnimatedStyle,
  withTiming, Extrapolation
} from 'react-native-reanimated';

type Props = {
  id?: string;
  currentFlipped?: string,
  className?: string;                 // e.g. "h-80 w-[45%] m-[1.5%]"
  onFlipChange?: (isBack: boolean) => void;
  front: React.ReactNode;             // content for the front
  back: React.ReactNode;              // content for the back
  duration?: number;                  // ms (default 350)
};

export function FlipCard({
                               id,
                               currentFlipped,
                               className = " w-[47%] m-[1.0%]",
                               onFlipChange,
                               front,
                               back,
                               duration = 350,
                             }: Props) {
  const progress = useSharedValue(0); // 0 = front, 1 = back

  const toggle = useCallback(() => {
    const next = progress.value === 1 ? 0 : 1;
    progress.value = withTiming(next, { duration });
    onFlipChange?.(next === 1);
  }, [duration, onFlipChange, progress]);

  // FRONT face rotates 0 -> 180 and fades out halfway
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: `${interpolate(
          progress.value,
          [0, 1],
          [0, 180],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
    opacity: interpolate(progress.value, [0, 0.5], [1, 0], Extrapolation.CLAMP),
  }));

  // BACK face rotates -180 -> 0 and fades in after halfway
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      {
        rotateY: `${interpolate(
          progress.value,
          [0, 1],
          [-180, 0],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
    opacity: interpolate(progress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
  }));

  useEffect(() => {
    if (currentFlipped != id && progress.value == 1){
      toggle();
    }
  }, [currentFlipped, progress]);
  return (

    <Pressable className={`${className}`} onPress={toggle}>
        <Card  className={`overflow-hidden rounded-2xl  `}>
          {/* Stack the two faces */}
          <View className="w-full h-full relative">
            <Animated.View
              style={frontStyle}
              className="absolute inset-0 backface-hidden w-full h-full"
            >
              {front}
            </Animated.View>

            <Animated.View
              style={backStyle}
              className="absolute inset-0 backface-hidden w-full h-full"
            >
              {back}
            </Animated.View>
          </View>
        </Card>

    </Pressable>
  );
}
