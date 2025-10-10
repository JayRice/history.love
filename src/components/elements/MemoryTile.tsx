// components/MemoryTile.tsx
import React, { useMemo } from 'react';
import { View } from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";
import { Image } from "expo-image";
import { Lock } from "lucide-react-native";
import Memory, { MemoryMood } from '@/src/types/Memory';


import { MOOD_EMOJI } from '@/constants';
import { useMemoryImageStore } from '../../store/memoryImageStore';

type Props = {
  memory: Memory;
};

export function MemoryTile({ memory }: Props) {
  const theme = useTheme();
  const cover = memory.photos?.[0];

  const memoryImages = useMemoryImageStore(s => s.memoryImages);

  const coverURL = useMemo(() => {
    if (!cover?.name) {return}
    return memoryImages[cover.name]
  }, [memoryImages, cover]);

  console.log("coverURL", coverURL);

  // Compute aspect ratio for correct masonry sizing.
  // Fallback to 4:3 if unknown.
  const aspectRatio =
    cover?.width && cover?.height ? cover.width / cover.height : 4 / 3;

  return (
    <View
      style={{
    width: "100%",
      borderRadius: 16,
      overflow: "hidden",
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outlineVariant ?? theme.colors.outline,
  }} >
  {/* ---------- IMAGE ---------- */}
  <Image
    // 👇 PLACE YOUR SRC HERE (prefer thumbUri first, then full):
    source={{ uri: coverURL }}
  style={{ width: "100%", aspectRatio }}
  contentFit="cover"
  cachePolicy="disk"
  transition={200}

  // If you want a fixed min-height while loading:
  // onLoadStart={() => setLoading(true)}
  // onLoadEnd={() => setLoading(false)}
  />

  {/* ---------- BODY ---------- */}
  <View style={{ padding: 10, gap: 8 }}>
  {/* Title + Mood */}
  <Text variant="titleMedium" numberOfLines={1}>
    {memory.mood ? `${MOOD_EMOJI[memory.mood]} ` : ""}
  {memory.title}
  </Text>

  {/* Categories */}
  {!!memory.categories?.length && (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
    {memory.categories.slice(0, 3).map((c) => (
      <Chip key={c} compact mode="outlined">
      {c}
      </Chip>
    ))}
    {memory.categories.length > 3 && (
      <Chip compact mode="outlined">
      +{memory.categories.length - 3}
      </Chip>
    )}
    </View>
  )}

  {/* Public note */}
  {memory.note ? (
    <Text numberOfLines={2} style={{ opacity: 0.9 }}>
    {memory.note}
    </Text>
  ) : null}

  {/* Private note indicator (don’t reveal content) */}
  {memory.private_note ? (
    <View
      style={{ flexDirection: "row", alignItems: "center", gap: 6, opacity: 0.8 }}
  >
    <Lock size={14} />
  <Text numberOfLines={1}>
    Private note • {Math.min(memory.private_note.length, 120)} chars
  </Text>
  </View>
  ) : null}

  {/* Date */}
  <Text style={{ opacity: 0.7, marginTop: 2 }} variant="bodySmall">
    {new Date(memory.date).toLocaleDateString()}
    </Text>
    </View>
    </View>
);
}
