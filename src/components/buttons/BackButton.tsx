import { router } from "expo-router";
import { IconButton } from "react-native-paper";
import { ArrowLeft } from "lucide-react-native";
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';

export function BackButton({onPress}: {onPress?: () => void}) {
  return (
    <PrimaryButton
      variant={"text"}
      onPress={onPress ? onPress : () => router.back()}
      className="absolute top-2 left-[-5%]  rounded-full px-4"
    >Back</PrimaryButton>
  );
}