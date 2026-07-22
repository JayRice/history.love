import { Screen } from '@/src/components/layout/Screen';
import { TabHeader } from '@/src/components/layout/TabHeader';
import React from 'react';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import Questions from '@/assets/images/home-images/questions.svg';

export default function  QuestionsScreen(){
  const colors = useThemeColors();
  return (
    <Screen padding={false} safeArea={false} scrollable style={{flex: 1}}>


        <TabHeader style={{backgroundColor:colors.secondaryAccent}} title={"Questions"}  description={"Ask your partner thought-provoking questions to grow your relationship"} Icon={<Questions width={100} height={100} ></Questions>} />



    </Screen>
  )
}
