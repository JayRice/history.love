import { FlashList } from '@shopify/flash-list';
import { MemoryTile } from '@/src/components/elements/MemoryTile';
import type Memory from "../../types/Memory";

export function GalleryScreen({ items }: { items: any[] }) {
  return (
    <FlashList
      data={items}
      masonry
      numColumns={2}                // 2–3 looks best
      keyExtractor={(m) => m.id}
      renderItem={({ item }) => (
        <MemoryTile memory={item} /> // width handled by layout
      )}
      optimizeItemArrangement       // balances column heights
      contentContainerStyle={{ padding: 12 }}
      showsVerticalScrollIndicator={false}
    />
  );
}