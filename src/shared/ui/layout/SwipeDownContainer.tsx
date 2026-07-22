import { Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { router } from "expo-router";
import { scheduleOnRN } from 'react-native-worklets';

const H = Dimensions.get("window").height;

export function SwipeDownContainer({ children }: { children: React.ReactNode }) {
  const y = useSharedValue(0);

  console.log("swipe down container")
  const pan = Gesture.Pan()
    .onUpdate(e => { if (e.translationY > 0) y.value = e.translationY; })
    .onEnd(() => {
      console.log("swipe down");
      if (y.value > H * 0.22) scheduleOnRN(router.back);
      else y.value = withSpring(0, { damping: 18, stiffness: 180 });
    });

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={style} className="flex-1">
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
