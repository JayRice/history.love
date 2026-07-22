import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/shared/lib/hooks/useThemeColors';
import { SwipeDownContainer } from '@/src/shared/ui/layout/SwipeDownContainer';
import { BackButton } from '@/src/shared/ui/buttons/BackButton';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  backButton?: boolean;
  safeArea?: boolean;
  modal?: boolean;
  backgroundColor?: string;
  className?: string;
  style?: any;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  padding = true,
  safeArea = true,
  modal = false,
  backButton = false,
  backgroundColor,
  className = '',
  style,
}) => {
  const colors = useThemeColors();
  
  const addedStyle = {
    ...style,
    backgroundColor: backgroundColor || colors.background,
  };

  let wrappedContent = (
    <View className="w-full h-full">
      {backButton &&<BackButton absolute={false} addedClasses={"left-[-10%] mb-4"}></BackButton>}
      {children}
    </View>
  )


   wrappedContent = scrollable ? (
    <ScrollView
      style={[styles.container, style, addedStyle, padding && styles.padding]}
      showsVerticalScrollIndicator={false}
      className={className}
    >
      {wrappedContent}
    </ScrollView>
  ) : (
    <View style={[styles.container, style, addedStyle, padding && styles.padding]} className={className}>
      {wrappedContent}
    </View>
  );

  return (modal && safeArea) ? (
    <SwipeDownContainer>
      <SafeAreaView edges={[]} style={[styles.container, style]}>
        {wrappedContent}
      </SafeAreaView>
    </SwipeDownContainer>
  ): modal ? (
    <SwipeDownContainer >
      {wrappedContent}
    </SwipeDownContainer>
  ): safeArea ? (
    <SafeAreaView edges={[]} style={[styles.container, style]}>
      {wrappedContent}
    </SafeAreaView>
  ) : (
    wrappedContent
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  }

});