import { FlashList } from '@shopify/flash-list';
import { MemoryTile } from '@/src/shared/ui/elements/MemoryTile';
import { Pressable } from 'react-native';

export function GalleryScreen({ items, onPressItem }: { items: any[], onPressItem?: (index: number) => void }) {

  return (
    <FlashList
      data={items}
      masonry
      numColumns={2}                // 2–3 looks best
      keyExtractor={(m) => m.id}
      renderItem={({ item, index }) => (
        <Pressable onPress={() => {
          if (!onPressItem) {return}
          onPressItem(index)
        }}>
          <MemoryTile memory={item} />{/* width handled by layout */}
        </Pressable>
      )}
      optimizeItemArrangement       // balances column heights
      contentContainerStyle={{ padding: 12 }}
      showsVerticalScrollIndicator={false}
    />
  );
}