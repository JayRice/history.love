import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { SwipeDownContainer } from '@/src/components/layout/SwipeDownContainer';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  padding?: boolean;
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
  backgroundColor,
  className = '',
  style,
}) => {
  const colors = useThemeColors();
  
  const addedStyle = {
    ...style,
    backgroundColor: backgroundColor || colors.background,
  };


  const wrappedContent = scrollable ? (
    <ScrollView
      style={[styles.container, style, addedStyle, padding && styles.padding]}
      showsVerticalScrollIndicator={false}
      className={className}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, style, addedStyle, padding && styles.padding]} className={className}>
      {children}
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