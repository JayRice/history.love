import { BackButton } from '@/src/components/buttons/BackButton';
import { Screen } from '@/src/components/layout/Screen';
import { View } from 'react-native';
import { TabHeader } from '@/src/components/layout/TabHeader';
import Trophy from '@/assets/images/home-images/trophy.svg';
import { Card, Text } from 'react-native-paper';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { endGame } from '@/src/server/game/endGame';
import { archiveGame } from '@/src/server/game/archiveGame';
import { gameData } from '@/src/data/games/gameData';
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
