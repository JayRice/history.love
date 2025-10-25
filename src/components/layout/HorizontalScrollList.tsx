import React from "react";
import { FlatList, View, ViewStyle, StyleProp } from "react-native";

type HorizontalScrollListProps<T> = {
  data: T[];
  keyExtractor?: (item: T, index: number) => string;
  renderItem: ({ item, index }: { item: T; index: number }) => React.ReactElement;
  contentContainerStyle?: StyleProp<ViewStyle>;
  horizontalSpacing?: number; // gap between items
  showsScrollIndicator?: boolean;
  snapToInterval?: number; // optional for snapping behavior
  className?: string;
};

/**
 * Generic horizontal scrollable list component.
 * Works with any data type and renderItem.
 */
export function HorizontalScrollList<T>({
                                          data,
                                          keyExtractor,
                                          renderItem,
                                          contentContainerStyle,
                                          horizontalSpacing = 12,
                                          showsScrollIndicator = false,
                                          snapToInterval,
                                          className=""
                                        }: HorizontalScrollListProps<T>) {
  return (
    <View className={className}>
      <FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={showsScrollIndicator}
        keyExtractor={keyExtractor ?? ((_, i) => i.toString())}
        renderItem={({ item, index }) => (
          <View style={{ marginRight: index === data.length - 1 ? 0 : horizontalSpacing }}>
            {renderItem({ item, index })}
          </View>
        )}
        contentContainerStyle={[
          { paddingHorizontal: 0 },
          contentContainerStyle,
        ]}
        decelerationRate="fast"
        snapToInterval={snapToInterval}
        snapToAlignment="center"
      />
    </View>

  );
}
