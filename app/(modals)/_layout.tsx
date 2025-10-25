import { Stack } from "expo-router";

export default function ModalGroupLayout() {
  return (
    <Stack

    >


      <Stack.Screen
        name="(modals)/story_mode"
        options={{
          presentation: "fullScreenModal",
          headerShown: false,
          gestureEnabled: true,
          animation: "slide_from_bottom",
        }}
      />


    </Stack>
  );
}
