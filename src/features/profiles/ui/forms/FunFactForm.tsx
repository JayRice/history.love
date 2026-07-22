import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { CircleCheck, CircleMinus } from 'lucide-react-native';
import React from 'react';
import FormProps from '@/src/shared/types/props/FormProps';


const FunFactForm = ({formUser, updateFormUser}: FormProps) => {

  const colors = useThemeColors()



  const badSentences = ["Stuck in the day to day routine",
    "Feeling detached", "Avoiding deeper conversations", "Not sure what steps to take to improve your relationship"]

  const goodSentences = ["Getting to know each other on a deeper level", "Feeling connected every day",
    "Talking openly about sex, finances, conflict", "Reaching your relationship goals together"]

  const cardClasses = "absolute flex-1 w-[50%] h-[50vh] p-0"
  const sentencesClases = "h-16 flex flex-row gap-2 items-center "
  return (
    <View className={"w-full h-[100%]  pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> History.love helps couples stay in love </Text>


      <View className={"mt-10"}>
        <Card className={`${cardClasses} mt-10 bg-gray-500  rounded-md opacity-70 p-10 `}>

          <Text variant={"bodyLarge"} className={"font-bold"}>Without {"\n"}History.love</Text>

          { badSentences.map((sentence) =>

            <View key={sentence} className={sentencesClases}>
              <CircleMinus className={"text-gray-600"}></CircleMinus>
              <Text>{sentence}</Text>
            </View>)}
        </Card>

        <Card style={{ backgroundColor: colors.primary }} className={`${cardClasses} z-50 left-[50%] rounded-md  p-10`}>

          <Text variant={"bodyLarge"} className={"font-bold text-white "}>With {"\n"}History.love</Text>

          { goodSentences.map((sentence) =>
            <View key={sentence} className={sentencesClases}>
              <CircleCheck className={"text-white"}></CircleCheck>
              <Text className={"text-white "}>{sentence}</Text>
            </View>)}
        </Card>
      </View>




    </View>
  )
}

export default FunFactForm