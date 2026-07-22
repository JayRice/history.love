import { useCurrentModal } from '@/src/shared/lib/hooks/useCurrentModal';
import { GameData, GameMode } from '@/src/shared/types/GameData';
import { Screen } from '@/src/shared/ui/layout/Screen';
import { Text } from 'react-native-paper';
import { CategoryPicker } from '@/src/shared/ui/inputs/CategoryPicker';
import React, { useEffect } from 'react';
import { PrimaryButton } from '@/src/shared/ui/buttons/PrimaryButton';
import { View } from 'react-native';
import { BackButton } from '@/src/shared/ui/buttons/BackButton';
import { startGame } from '@/src/server/game/startGame';
import { GamePreferences } from '@/src/shared/types/GamePreferences';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import Toast from 'react-native-toast-message';
import { useModal } from '@/src/shared/ui/ModalContext';

interface ModalData {
  game: GameData;
}
export  function StartGameScreen() {

  const { data, close} = useCurrentModal<ModalData, undefined>();
  const {openModal}= useModal();

  const game = data?.game as GameData;


  const [gameModes, setGameModes] = React.useState<GameMode[]>([]);

  const [loading, setLoading] = React.useState<boolean>(true);

  const relationship = useRelationshipStore(s => s.relationship);

  const currentGame = useRelationshipStore(s => s.currentGame);


  useEffect(() => {
    if(!game) return;

    setGameModes([game.modes[0]])
  }, [game]);
  if(!game) return null;


  const isDisabled = () => {
    return gameModes.length == 0;
  }

  return (
    <Screen className={"flex justify-between"} style={{ flex: 1,gap: 16 }}>
      <BackButton absolute={false} addedClasses={"left-[-10%]"}></BackButton>
      <View className={"flex"} style={{gap: 20}}>
        <Text className={"text-center font-bold"} variant={"headlineMedium"}>{game.title}</Text>
        <Text className={"text-center"}  variant={"bodyLarge"}>{game.description}</Text>


        <Text className={"mx-4"}  variant={"bodyLarge"}>{game.directions}</Text>


        <View className={"flex "} style={{ gap: 8 }}>
          <Text className={"text-center font-light"}  variant={"bodySmall"}>Choose one or more game modes:</Text>
          { game.modes.length > 0 && <CategoryPicker chipStyle={{width: "40%"}} showTitleAndBorder={false} categories={game.modes} value={gameModes} onChange={setGameModes} ></CategoryPicker>}

        </View>


      </View>
      <PrimaryButton disabled={isDisabled()} onPress={async () => {

        if (!relationship) {return}

        if (relationship?.activeGame && currentGame?.status != "ended"){
          return Toast.show({
            type: "info",
            text1: "Heads up",
            text2: `You're already in an ongoing game`,
          });

        }


        const preferences : GamePreferences = {
          gameModes
        }
        setLoading(true);
        const response = await startGame(game, preferences);
        setLoading(false);

        if (response.success){
          close();
          openModal("active_game");
        }


        // send to active game


      }}>Start Game</PrimaryButton>

    </Screen>
  )
}