import { Screen } from '@/src/components/layout/Screen';

import React, { useEffect, useState } from 'react';
import { BackButton } from '@/src/components/buttons/BackButton';
import { getPartnerName } from '@/src/utils/getPartnerName';
import { Game, WouldYouRatherGame } from '@/src/types/Game';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { Text } from 'react-native-paper';
import { WouldYouRather } from '@/src/pages/Tabs/games/game-modes/WouldYouRather';
import { LoadingSpinner } from '@/src/components/feedback/LoadingSpinner';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useCurrentModal } from '@/src/hooks/useCurrentModal';

export default function  ActiveGameScreen(){
  const partnerName = getPartnerName();

  const {close} = useCurrentModal();

  const currentGame = useRelationshipStore(s => s.currentGame);


  useEffect(() => {

    if(!currentGame){

      close();

    }

  }, [currentGame]);



  if (!currentGame) return (
    <Screen padding={true} >
      <BackButton absolute={false} addedClasses={"left-[-10%] mb-4"}></BackButton>

      <LoadingSpinner></LoadingSpinner>

    </Screen>
  );




  return (
    <View style={{ flex: 1 }} >

        <BackButton addedClasses={"left-2 top-6"} labelStyle={{color: "white"}}></BackButton>


      {/* Discriminant-guarded: type check above narrows the payload. */}
      {currentGame.type == "would-you-rather" && <WouldYouRather game={currentGame as Game<WouldYouRatherGame>}/>}

    </View>
  )
}