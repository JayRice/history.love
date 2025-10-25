import { IconButton } from "react-native-paper";
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';

type CloseButtonProps = { onPress?: () => void; size?: number, position?: "left"|"right", addedClasses?: string };

export function CloseButton({ onPress =  () => router.back(), size = 24, position="left", addedClasses="" }: CloseButtonProps) {
  return (
    <Pressable onPress={onPress} className={`absolute w-full flex flex-row ${position === "right" && "justify-end"} z-50 ${addedClasses}`}>
      <IconButton
        className={"bg-black/30 "}
        icon="close"           // MaterialCommunityIcons name
        size={size}
        accessibilityLabel="Close"
        // optional: mode="contained-tonal" for a pill background
      />
    </Pressable>

  );
}