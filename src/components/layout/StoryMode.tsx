// components/StoryMode.tsx
import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback } from "react-native";
import { Text, useTheme, IconButton, Chip } from "react-native-paper";
import { Image } from "expo-image";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Lock, X } from "lucide-react-native";
import type Memory from "@/src/types/Memory";
import type { MemoryMood } from "@/src/types/Memory";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MOOD_EMOJI: Record<MemoryMood, string> = {
  happy: "😊",
  sad: "😢",
  excited: "🤩",
  relaxed: "😌",
  angry: "😠",
  anxious: "😬",
  "in love": "🥰",
  nostalgic: "🕰️",
  tired: "🥱",
  peaceful: "🕊️",
};

export default function StoryMode({
                                    memories,
                                    initialIndex = 0,
                                    onClose,
                                  }: {
  memories: Memory[];
  initialIndex?: number;
  onClose?: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [memoryIndex, setMemoryIndex] = useState(initialIndex);
  const [photoIndex, setPhotoIndex] = useState(0);
  const translateX = useSharedValue(0);

  const current = memories[memoryIndex];
  const photos = current?.photos ?? [];

  const clampMemory = (idx: number) =>
    Math.max(0, Math.min(idx, memories.length - 1));

  /** Gesture for swiping horizontally between photos */
  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      const threshold = SCREEN_WIDTH * 0.2;
      if (e.translationX < -threshold) {
        runOnJS(nextPhoto)();
      } else if (e.translationX > threshold) {
        runOnJS(prevPhoto)();
      }
      translateX.value = withTiming(0);
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const nextPhoto = () => {
    if (photoIndex + 1 < photos.length) {
      setPhotoIndex((p) => p + 1);
    } else if (memoryIndex + 1 < memories.length) {
      setMemoryIndex((m) => m + 1);
      setPhotoIndex(0);
    } else {
      onClose?.();
    }
  };

  const prevPhoto = () => {
    if (photoIndex > 0) setPhotoIndex((p) => p - 1);
    else if (memoryIndex > 0) {
      setMemoryIndex((m) => clampMemory(m - 1));
      setPhotoIndex(memories[memoryIndex - 1]?.photos?.length - 1 || 0);
    }
  };

  useEffect(() => {
    setPhotoIndex(0);
  }, [memoryIndex]);

  if (!current) return null;
  const cover = photos[photoIndex];
  const aspectRatio =
    cover?.width && cover?.height ? cover.width / cover.height : 9 / 16;

  return (
    <View style={[styles.root, { paddingTop: insets.top, backgroundColor: "black" }]}>
      {/* Top Bar */}
      <View style={styles.topRow}>
        <IconButton icon={(p) => <X {...p} />} onPress={onClose} />
        <Text style={{ color: "white" }}>
          {memoryIndex + 1}/{memories.length}
        </Text>
      </View>

      <GestureDetector gesture={pan}>
        <Animated.View style={[{ flex: 1 }, animStyle]}>
          <TouchableWithoutFeedback onPress={nextPhoto}>
            <View>
              <Image
                source={{ uri: cover?.uri ?? "" }}
                style={{ width: "100%", aspectRatio }}
                contentFit="cover"
                cachePolicy="disk"
              />
            </View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </GestureDetector>

      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 16 },
        ]}
      >
        <Text variant="titleMedium">
          {current.mood ? `${MOOD_EMOJI[current.mood]} ` : ""}
          {current.title}
        </Text>

        <View style={styles.meta}>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            {new Date(current.date).toLocaleDateString()}
          </Text>
          {current.categories?.slice(0, 3).map((c) => (
            <Chip key={c} compact mode="outlined" showSelectedCheck={false}>
              {c}
            </Chip>
          ))}
        </View>

        {current.note && (
          <Text numberOfLines={3} style={{ marginTop: 6 }}>
            {current.note}
          </Text>
        )}

        {current.private_note && (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
            <Lock size={14} />
            <Text style={{ marginLeft: 6 }}>Private note</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 6,
  },
  meta: { flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" },
});
