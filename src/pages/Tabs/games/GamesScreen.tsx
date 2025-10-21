import { Screen } from '@/src/components/layout/Screen';
import { Card, Text } from 'react-native-paper';
import { Image, View } from 'react-native';
import React from 'react';
import { BackButton } from '@/src/components/buttons/BackButton';
import { gameImages } from '@/src/data/games/gameImages';
import { FlipCard } from '@/src/components/cards/FlipCard';
import { getPartnerName } from '@/src/utils/getPartnerName';
import { gameData } from '@/src/data/games/gameData';
import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { CategoryPicker } from '@/src/components/inputs/CategoryPicker';
function GameCard({game, idx, currentFlipped, setCurrentFlipped}: {game: any, idx: number, currentFlipped: string, setCurrentFlipped: (cf: string) => void}) {
  const image = game.image;


  const [categoriesPicked, setCategoriesPicked] = React.useState<string[]>([game.modes[0]]);

  if (!image) {return null}
  return (
    <FlipCard onFlipChange={(isBack) => {
      if (isBack){
        setCurrentFlipped(`${idx}`)
      }
    }} id={`${idx}`} currentFlipped={currentFlipped}  className={"h-120 w-[100%] m-[1.5%]"}

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

          {/*{ game.modes.length > 0 && <CategoryPicker chipStyle={{width: "40%"}} showTitleAndBorder={false} categories={game.modes} value={categoriesPicked} onChange={setCategoriesPicked} ></CategoryPicker>}*/}

        </View>

        <PrimaryButton variant={"filled"} >Continue</PrimaryButton>
      </View>}

    />


  )
}
export default function  GamesScreen(){
  const partnerName = getPartnerName();



  const [currentFlipped, setCurrentFlipped] = React.useState<string>("");
  return (
    <Screen scrollable >
      <BackButton absolute={false} addedClasses={"left-[-10%] mb-4"}></BackButton>
      <View className={"space-y-2 mb-4"}>
        <Text variant="headlineMedium" className="text-gray-900 font-bold">
          Games
        </Text>
        <Text variant="bodyLarge" className="text-gray-600">
          Develop your relationship through fun games!
        </Text>

      </View>

      <View className={"flex flex-row flex-wrap justify-between items-between "}>
        {gameData.map((g, idx) => {
          return <GameCard game={g} idx={idx} currentFlipped={currentFlipped} setCurrentFlipped={setCurrentFlipped}></GameCard>
        })}

      </View>





    </Screen>
  )
}