import { router } from "expo-router";
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';

export function BackButton({  absolute=true, ...props }: { onPress?: () => void; addedClasses?: string, labelStyle?: any, absolute?:boolean }) {
  const { onPress, addedClasses, labelStyle } = props;
  return (
    <PrimaryButton
      variant={"text"}
      labelStyle={labelStyle}
      onPress={onPress ? onPress : () => router.back()}
      className={`${absolute ? "absolute top-2 ":"relative w-32 "} left-[-5%] rounded-full px-4 z-50  ${addedClasses}`}
    >Back</PrimaryButton>
  );
}