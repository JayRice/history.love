import { Screen } from '@/src/shared/ui/layout/Screen';

import React, { useEffect } from 'react';
import { BackButton } from '@/src/shared/ui/buttons/BackButton';
import { getPartnerName } from '@/src/shared/lib/utils/getPartnerName';
import { Game, WouldYouRatherGame } from '@/src/shared/types/Game';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { WouldYouRather } from '@/src/features/games/ui/game-modes/WouldYouRather';
import { LoadingSpinner } from '@/src/shared/ui/feedback/LoadingSpinner';
import { View } from 'react-native';
import { useCurrentModal } from '@/src/shared/lib/hooks/useCurrentModal';

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