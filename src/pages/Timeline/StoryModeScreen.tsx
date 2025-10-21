// components/StoryModeScreen.tsx
import React, { useCallback, useMemo, useRef, useState, useEffect, memo } from 'react';
import { View, StyleSheet, Dimensions, FlatList, TextInput as RNTextInput, Modal } from 'react-native';
import { Image } from "expo-image";


import type Memory from "@/src/types/Memory";
import Photo from "@/src/types/Photo";
import { useMemoryImageStore } from '@/src/store/memoryImageStore';
import { CloseButton } from '@/src/components/buttons/CloseButton';
import ProfileImage from '@/src/components/elements/ProfileImage';
import { useImagesStore } from '@/src/store/imagesStore';
import { CloudText } from '@/src/components/elements/CloudText';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';

import { useModal } from '@/src/contexts/ModalContext';
import { useCurrentModal } from '@/src/hooks/useCurrentModal';
import { router } from 'expo-router';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");



type ModalData = {
  memories: Memory[];      // Provide your filtered & ordered memories
  initialIndex?: number;   // Start at this memory
  onClose: () => void;    // Close handler
};

export default function StoryModeScreen() {
  const { data, close} = useCurrentModal<ModalData, undefined>();

  const [memories, setMemories] = React.useState<Memory[]>(data?.memories || []);
  const [initialIndex, setInitialIndex] = React.useState<number>(data?.initialIndex as number);




  const memoryImages = useMemoryImageStore(s => s.memoryImages)



  const verticalRef = useRef<FlatList<Memory>>(null);

  const [memoryIndex, setMemoryIndex] = useState<number>(
   initialIndex
  );


  // Prefetch first images for neighbors so vertical swipe feels instant
  useEffect(() => {
    const prev = memories[memoryIndex - 1]?.photos?.[0]?.uri;
    const next = memories[memoryIndex + 1]?.photos?.[0]?.uri;
    if (prev) Image.prefetch(prev);
    if (next) Image.prefetch(next);
  }, [memoryIndex, memories, memoryImages]);

  const onViewableMemoriesChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems?.length > 0) {
      const idx = viewableItems[0]?.index;
      if (!idx) return;
      setMemoryIndex(idx)
    }
  }).current;

  const memoryViewability = useRef({ viewAreaCoveragePercentThreshold: 80 }).current;



  const renderMemory = ({ item }: { item: Memory }) => (
    <MemoryPhotoPager memory={item} />
  );

  return (
    <View style={StyleSheet.absoluteFill}>
      <View className={"absolute z-50 m-2"}>
        <CloseButton onPress={() => {close()}}  />

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
        removeClippedSubviews={false}
        onViewableItemsChanged={onViewableMemoriesChanged}
        viewabilityConfig={memoryViewability}
        getItemLayout={(_, index) => ({
          length: SCREEN_H,
          offset: SCREEN_H * index,
          index,
        })}
        initialScrollIndex={initialIndex}
      />
    </View>
  );
}

/** One full-screen row that pages photos horizontally for a single memory */
const MemoryPhotoPager = memo(function MemoryPhotoPager({ memory }: { memory: Memory }) {
  const horizontalRef = useRef<FlatList<Photo>>(null);
  const [photoIndex, setPhotoIndex] = useState(0);

  const memoryImages = useMemoryImageStore(s => s.memoryImages);

  const photos = useMemo(() => {
    return memory.photos ?? [];
  }, [memory])

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

  const onPressCloud = (memory: Memory, id: string) => {

  }
  const {openModal} = useModal();
  const onPressEditMemory = async () => {
    const response = await openModal("edit_memory", { memory });
  }



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
      <PrimaryButton variant={"text"} className={"z-50 mx-4 absolute top-4 right-0"}   onPress={() => onPressEditMemory()}>
        Edit memory
      </PrimaryButton>

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

          <CloudText
            text="meet at 7? bring notes — i’ve got a long thing to say so this will expand..."
            style={{ left: 0, top: 0 }}   // tail start
            closable
            flip={false}                     // set true to mirror to the left
            expandOnPress
            expandWidth={340}
            expandHeight={420}
            scale={.6}
            onPress={(id) => onPressCloud( memory, id)}

          ></CloudText>
        </View>


        <View>
          {partnerProfileImage && <ProfileImage size={80}  source={partnerProfileImage}></ProfileImage>}

          <CloudText
            text="meet at 7? bring notes — i’ve got a long thing to say so this will expand..."
            style={{ left: 0, top: 0 }}   // tail start
            closable
            flip={true}                     // set true to mirror to the left
            expandOnPress
            expandWidth={340}
            expandHeight={420}
            scale={.6}
            onPress={(id) => onPressCloud(memory, id)}
          ></CloudText>
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

