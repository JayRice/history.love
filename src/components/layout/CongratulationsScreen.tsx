// src/screens/CongratulationsScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

import useSfx from "@/src/hooks/useSfx";


// Adjust these imports to your paths:
import {Screen} from '@/src/components/layout/Screen';
import { colors } from '@/src/theme/colors';
// or wherever you export colors

type CongratulationsScreenProps = {
  onContinue?: () => void;
  children?: React.ReactNode;
  /** Auto-play the confetti when the screen mounts */
  autoPlay?: boolean;
  /** Loop the confetti (default false so it bursts once) */
  loop?: boolean;
  /** Optional: control animation speed (1 = normal) */
  speed?: number;

  delay?: number;
};

export default function CongratulationsScreen({
                                                onContinue,
                                                children,
                                                autoPlay = true,
                                                loop = false,
                                                speed = 1,
                                                delay = 0,
                                              }: CongratulationsScreenProps) {



  const { playSuccess } = useSfx();


  const anim = useRef<LottieView>(null);

  const [show, setShow] = useState(false);





  useEffect(() => {
    playSuccess();

    const timer = setTimeout(() => setShow(true), delay);

    return () => {
      clearTimeout(timer)
    };
  }, []);

  return (
    <Screen className="relative flex-1" backgroundColor={colors.surface} padding>
      {/* Content */}
      <View className="flex-1 items-center justify-center">
        {children}
      </View>

      {/* Confetti overlay */}
      {show && <LottieView
        ref={anim}

        source={require('@/assets/animations/confetti.json')}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          // ensures touches pass through to your content
          pointerEvents: 'none',
        }}
      />}


    </Screen>
  );
}
