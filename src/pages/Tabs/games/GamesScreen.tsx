import { Screen } from '@/src/components/layout/Screen';
import { Card, Text } from 'react-native-paper';
import { Image, View } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { BackButton } from '@/src/components/buttons/BackButton';
import { gameImages } from '@/src/data/games/gameImages';
import { FlipCard } from '@/src/components/cards/FlipCard';
import { getPartnerName } from '@/src/utils/getPartnerName';
import { gameData } from '@/src/data/games/gameData';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { useModal } from '@/src/contexts/ModalContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/config/firebase';
import { useRelationshipStore } from '@/src/store/relationshipStore';
import { Game } from '@/src/types/Game';
import { endGame } from '@/src/server/game/endGame';
import { archiveGame } from '@/src/server/game/archiveGame';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import Trophy from '@/assets/images/home-images/trophy.svg';
import { TabHeader } from '@/src/components/layout/TabHeader';
function GameCard({game, idx, currentFlipped, setCurrentFlipped}: {game: any, idx: number, currentFlipped: string, setCurrentFlipped: (cf: string) => void}) {
  const image = game.image;



  const {openModal} = useModal();



  if (!image) {return null}




  // useEffect(() => {
  //
  //   // If there's an active game send the user to the active game screen
  //   if (relationship?.activeGame){
  //     openModal("active_game");
  //   }
  // }, [relationship?.activeGame]);

  return (
    <FlipCard onFlipChange={(isBack) => {
      if (isBack){
        setCurrentFlipped(`${idx}`)
      }
    }} id={`${idx}`} currentFlipped={currentFlipped}  addedClasses={"h-80 w-[47%] m-[1.5%]"}

              front={
      image &&
                <Card.Cover
                  source={gameImages[image]}
                  className={"w-full h-full"}
                  resizeMode="cover"

                >
                </Card.Cover>

    }

              back={
      <View className={"w-full h-full p-2 flex justify-between"}>
        <View className={"space-y-2"}>
          <Text variant={"bodyLarge"} className={"text-center font-bold"}>{game.title}</Text>
          <Text variant={"bodySmall"} className={"text-center"}>{game.description}</Text>


        </View>

        <PrimaryButton variant={"filled"} onPress={async () => {
          await openModal("start_game", {game})
        }} >Continue</PrimaryButton>
      </View>}

    />


  )
}
export default function  GamesScreen(){
  const partnerName = getPartnerName();


  const {openModal} = useModal();


  const relationship = useRelationshipStore(s => s.relationship);
  const currentGame = useRelationshipStore(s => s.currentGame);



  const [currentFlipped, setCurrentFlipped] = React.useState<string>("");

  const [loadingOnQuit, setLoadingOnQuit] = React.useState<boolean>(false);


  const currentGameData = useMemo(() => {
    if (!currentGame) return null;
    return gameData.filter((gd) => gd.type == currentGame.type)[0];
  }, [currentGame])

  const colors = useThemeColors()

  return (
    <Screen  padding={false} safeArea={false} scrollable style={{flex: 1}}>




        <TabHeader style={{backgroundColor:colors.secondaryAccent}} title={"Games"}  description={"Develop your relationship through fun games!"} Icon={<Trophy width={100} height={100} ></Trophy>} />





        { (relationship?.activeGame) && <Card className={" p-4 "} style={{width: "100%"}}>

          <View className={"flex"} style={{ gap: 8}}>
            <Text className={"text-center font-light mb-4"} variant={"headlineSmall"}>{currentGame?.status == "ended" ? "Game Ended":"Active Game"}</Text>

            <PrimaryButton variant={"outlined"} onPress={() => {
              openModal("active_game");
            }}>{currentGame?.status == "active" ? "Play":"See Results"}</PrimaryButton>
            <PrimaryButton loading={loadingOnQuit} variant={"filled"} onPress={async () => {
              setLoadingOnQuit(true)
              if (currentGame?.status == "active"){
                await endGame();
              } else if (currentGame?.status == "ended"){
                await archiveGame();
              }
              setLoadingOnQuit(false)
            }}>{currentGame?.status == "ended" ? "Dismiss":"Quit"}</PrimaryButton>
          </View>


        </Card>}

      <View className={"flex flex-row flex-wrap justify-between items-between "}>
        {gameData.map((g, idx) => {
          return <GameCard game={g} idx={idx} currentFlipped={currentFlipped} setCurrentFlipped={setCurrentFlipped}></GameCard>
        })}

      </View>





    </Screen>
  )
}