import { IconButton } from "react-native-paper";
import { View } from 'react-native';

type CloseButtonProps = { onPress: () => void; size?: number, position?: "left"|"right" };

export function CloseButton({ onPress, size = 24, position="left" }: CloseButtonProps) {
  return (
    <View className={`w-full  flex flex-row ${position === "right" && "justify-end"}`}>
      <IconButton
        className={"bg-gray-800/10"}
        icon="close"           // MaterialCommunityIcons name
        size={size}
        onPress={onPress}
        accessibilityLabel="Close"
        // optional: mode="contained-tonal" for a pill background
      />
    </View>

  );
}