import { PrimaryButton } from '@/src/components/buttons/PrimaryButton';
import { ScrollView, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  dict: Record<any, string>,
  selected: string | string[],
  commands?: Record<string,  (...args: any[]) => any>,
  parentClassName?: string,
  buttonClassName?: string,
  scrollable?: boolean,
  footerHeight?: number,
  multipleChoice?: boolean,
}
export default function ToggleButtons({dict, selected, commands, parentClassName, buttonClassName, scrollable=false, footerHeight=25, multipleChoice=false}: Props) {

  const keys = Object.keys(dict);
  const colors = useThemeColors()
  const [selectedButtons, setSelectedButtons] = useState<string[]>(Array.isArray(selected) ? selected:[selected])
  const insets = useSafeAreaInsets();

  const Buttons = () => {
    return <View className={"space-y-6 " + parentClassName}>{keys.map(key => {
        let onPress = (...args: any[]) => {};

        if (commands){
          onPress = commands["default"] ?? null;

          if ( key in commands){
            onPress = commands[key];
          }

        }

        const isSelected = selectedButtons.includes(key);
        return (

          <Button key={key} mode={"elevated"}  onPress={() =>  {
            onPress(key)
            if (multipleChoice){
              if (isSelected){
                return setSelectedButtons((prev) => prev.filter((s) => s != key))
              }
              return setSelectedButtons([...selectedButtons, key]);

            }
            setSelectedButtons([key])
          }} className={` bg-${colors.primary} p-2 ${buttonClassName}`}>
            <View className={"relative w-full flex text-left p-2 justify-center"}>
              <View  className="absolute left-1 w-4 h-4 rounded-full border-2 "
                     style={{
                       backgroundColor: isSelected ? colors.primary : 'transparent',
                       borderColor: colors.primary,
                     }}></View>
              <Text className={"ml-8"}>{dict[key]}</Text>
            </View>

          </Button>
        )
      }
    )}
    </View>
  }
  return (

    <>
      { scrollable ?
          <ScrollView className={"flex-1 "}
                      contentContainerStyle={{ paddingBottom: footerHeight + insets.bottom  }}>
            <Buttons />
          </ScrollView>

          :

          <View >
            <Buttons />
          </View>
      }

  </>
  )
}