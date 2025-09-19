import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ClipboardCopy } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

export default function TapToCopy({ text }: { text: string }) {

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Toast.show({
      type: "success",
      text1: "Copied!",
      text2: `"${text}" has been copied to your clipboard.`,
    });
  };


  return (
    <Pressable
      onPress={() => copyToClipboard(text)}
      className={"flex flex-row gap-1 p-2 border border-black rounded-md items-center inline-block"}
      style={{
        alignItems: "center",
      }}

    >
      <ClipboardCopy width={16} height={16}></ClipboardCopy>

      <Text style={{  }}>Tap to copy</Text>
    </Pressable>
  );
}