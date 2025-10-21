import { IconButton } from "react-native-paper";
import { View } from 'react-native';
import { router } from 'expo-router';

type CloseButtonProps = { onPress: () => void; size?: number, position?: "left"|"right", addedClasses?: string };

export function CloseButton({ onPress = () => router.back(), size = 24, position="left", addedClasses="" }: CloseButtonProps) {
  return (
    <View className={`absolute w-full flex flex-row ${position === "right" && "justify-end"} z-50 ${addedClasses}`}>
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