import { View } from 'react-native';
import { Text } from 'react-native-paper';
import ToggleButtons from '@/src/shared/ui/inputs/ToggleButtons';
import { RelationshipGoal } from '@/src/shared/types/User';
import React from 'react';
import FormProps from '@/src/shared/types/props/FormProps';


const GoalForm = ({formUser, updateFormUser}: FormProps) => {



  return (
    <View className={"w-full h-[100%] space-y-10 pb-10"}>
      <Text variant={"displaySmall"} className={"font-bold mb-4"}> What are your goals on History.love </Text>


      <ToggleButtons
        scrollable
        multipleChoice={true}
        selected={formUser?.partner?.goals ?? []}
        parentClassName=""
        dict={{
          "better-communication": "Improve communication",
          "quality-time": "Spend more quality time",
          "conflict-resolution": "Resolve conflicts better",
          "deeper-intimacy": "Deepen emotional/physical intimacy",
          "trust-building": "Build/repair trust",
          "shared-habits": "Build healthy shared habits",
          "milestone-planning": "Plan milestones (move in, engagement, etc.)",
          "gratitude-practice": "Practice daily appreciation",
          "fun-and-play": "Have more fun together",
          "dating-new": "Explore dating/new connections",
        }}
        commands={{
          "default": (goal) => {
            let newGoals : RelationshipGoal[] = formUser?.partner?.goals ?? [];
            if (formUser?.partner?.goals?.includes(goal)){
              newGoals.filter((g) => goal !== g)
            }else{
              newGoals.push(goal)
            }
            updateFormUser("partner.goals", newGoals );
          }
        }}
      />



    </View>
  )
}


export default  GoalForm