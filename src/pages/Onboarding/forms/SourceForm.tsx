import { useThemeColors } from '@/src/hooks/useThemeColors';
import { UserSource } from '@/src/types/User';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ToggleButtons from '@/src/components/inputs/ToggleButtons';
import React from 'react';
import FormProps from '@/src/types/props/FormProps';

const SourceForm = ({formUser, updateFormUser}: FormProps) => {

  const colors = useThemeColors()

  const sourceDict: Record<UserSource, string> = {
    "facebook/instagram": "Facebook / Instagram",
    "blog/article": "Blogs & Articles",
    "youtube": "YouTube",
    "chatgpt-or-similar": "ChatGPT or similar",
    "therapist/counselor": "Therapist / Counselor",
    "app/play-store": "Apps (Play/App Store)",
    "partner": "Partner",
    "streaming": "Streaming (TV, etc.)",
    "tiktok": "TikTok",
    "podcast": "Podcast",
    "friend/family": "Friend / Family",
  };

  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}>Where did you hear about History.love </Text>


      <ToggleButtons
        scrollable
        selected={(formUser?.analytics?.source) ?? []}
        parentClassName=""
        dict={sourceDict}
        commands={{
          default: (source) => {

            updateFormUser("analytics.source", source);
          },
        }}
      />


    </View>
  )
}

export default SourceForm