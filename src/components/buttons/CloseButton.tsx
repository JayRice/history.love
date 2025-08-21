import { IconButton } from "react-native-paper";

type CloseButtonProps = { onPress: () => void; size?: number };

export function CloseButton({ onPress, size = 24 }: CloseButtonProps) {
  return (
    <IconButton
      icon="close"           // MaterialCommunityIcons name
      size={size}
      onPress={onPress}
      accessibilityLabel="Close"
      // optional: mode="contained-tonal" for a pill background
    />
  );
}