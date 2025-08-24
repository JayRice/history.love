import { router } from "expo-router";
import { IconButton } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";

export function BackButton({onPress}: {onPress?: () => void}) {
  return (
    <IconButton
      icon={() => <ArrowLeft className="text-black" size={24} />}
      onPress={onPress ? onPress : () => router.back()}
      className="absolute top-6 left-4 bg-gray-800/10 rounded-full"
    />
  );
}