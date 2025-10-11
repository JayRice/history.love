// components/StoryModeScreen.tsx
import React, { useCallback, useMemo, useRef, useState, useEffect, memo } from 'react';
import { View, StyleSheet, Dimensions, FlatList, TextInput as RNTextInput, Modal } from 'react-native';
import { Image } from "expo-image";


import type Memory from "@/src/types/Memory";
import Photo from "@/src/types/Photo";
import type { MemoryMood } from "@/src/types/Memory";
import { useMemoryImageStore } from '@/src/store/memoryImageStore';
import { BackButton } from '@/src/components/buttons/BackButton';
import { CloseButton } from '@/src/components/buttons/CloseButton';
import ProfileImage from '@/src/components/elements/ProfileImage';
import { useImagesStore } from '@/src/store/imagesStore';
import { CloudText } from '@/src/components/elements/CloudText';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");



type Props = {
  visible: boolean;
  memories: Memory[];      // Provide your filtered & ordered memories
  initialIndex?: number;   // Start at this memory
  onClose: () => void;    // Close handler
};

export default function StoryModeModal({ memories, initialIndex = 0, onClose }: Props) {
  const verticalRef = useRef<FlatList<Memory>>(null);
  const [memoryIndex, setMemoryIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, memories.length - 1))
  );

  // Prefetch first images for neighbors so vertical swipe feels instant
  useEffect(() => {
    const prev = memories[memoryIndex - 1]?.photos?.[0]?.uri;
    const next = memories[memoryIndex + 1]?.photos?.[0]?.uri;
    if (prev) Image.prefetch(prev);
    if (next) Image.prefetch(next);
  }, [memoryIndex, memories]);

  const onViewableMemoriesChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const idx = viewableItems[0]?.index ?? 0;
      setMemoryIndex(idx);
    }
  }).current;

  const memoryViewability = useRef({ viewAreaCoveragePercentThreshold: 80 }).current;



  const renderMemory = ({ item }: { item: Memory }) => (
    <MemoryPhotoPager photos={item.photos ?? []} />
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <View className={"absolute z-50 m-2"}>
        <CloseButton onPress={onClose}  />

      </View>
      <FlatList
        ref={verticalRef}
        data={memories}
        keyExtractor={(m) => m.id}
        renderItem={renderMemory}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        horizontal={false}
        snapToAlignment="start"
        decelerationRate="fast"
        windowSize={5}                 // pre-render prev/next
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
        onViewableItemsChanged={onViewableMemoriesChanged}
        viewabilityConfig={memoryViewability}
        getItemLayout={(_, index) => ({
          length: SCREEN_H,
          offset: SCREEN_H * index,
          index,
        })}
      />
    </View>
  );
}

/** One full-screen row that pages photos horizontally for a single memory */
const MemoryPhotoPager = memo(function MemoryPhotoPager({ photos }: { photos: Photo[] }) {
  const horizontalRef = useRef<FlatList<Photo>>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const memoryImages = useMemoryImageStore(s => s.memoryImages);

  // Prefetch neighbor photos for smoother horizontal swipes
  useEffect(() => {
    const prev = photos[photoIndex - 1]?.uri;
    const next = photos[photoIndex + 1]?.uri;
    if (prev) Image.prefetch(prev);
    if (next) Image.prefetch(next);
  }, [photoIndex, photos]);

  const onViewablePhotosChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const idx = viewableItems[0]?.index ?? 0;
      setPhotoIndex(idx);
    }
  }).current;

  const photoViewability = useRef({ viewAreaCoveragePercentThreshold: 80 }).current;

  const renderPhoto = ({ item }: { item: Photo }) => (
    ((item.name) ? <View style={{ width: SCREEN_W, height: SCREEN_H, backgroundColor: "black" }}>
      <View className={"w-full h-full bg-black flex justify-center"}>
        <Image
          source={{ uri: memoryImages[item.name] ?? "" }}
          style={{ width: "100%", height: "85%" }}
          contentFit="cover"
          cachePolicy="disk"
          transition={0}
        />
      </View>

    </View>: null)
  );

  // Minimal top dots for progress
  const Dots = () => (
    <View className={"p-1 w-auto mx-10 bg-black/50 rounded-lg mt-6"} style={styles.dotsRow}>
      {photos.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { opacity: i === photoIndex ? 1 : 0.3 },
          ]}
        />
      ))}
    </View>
  );

  const userProfileImage = useImagesStore(s => s.profileImage);
  const partnerProfileImage = useImagesStore(s => s.partnerProfileImage);

  return (
    <View style={{ width: SCREEN_W, height: SCREEN_H }}>
      <FlatList
        ref={horizontalRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        data={photos.length ? photos : [/* empty state still renders a blank page */]}
        renderItem={renderPhoto}
        keyExtractor={(_, i) => String(i)}
        snapToAlignment="start"
        decelerationRate="fast"
        windowSize={5}               // pre-render neighbor photos
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
        onViewableItemsChanged={onViewablePhotosChanged}
        viewabilityConfig={photoViewability}
        getItemLayout={(_, index) => ({
          length: SCREEN_W,
          offset: SCREEN_W * index,
          index,
        })}
      />
      <Dots />

      <View className={"absolute p-4 bottom-0 w-full flex flex-row justify-between items-between"}>
        <View>
          {userProfileImage && <ProfileImage size={80} source={userProfileImage}></ProfileImage>}
          <CloudText text={"Hello"}></CloudText>
        </View>
        <View>
          {partnerProfileImage && <ProfileImage size={80}  source={partnerProfileImage}></ProfileImage>}

        </View>

      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  dotsRow: {
    position: "absolute",
    top: 10,
    left: 0,
    right: 0,
    height: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    pointerEvents: "none",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
});

