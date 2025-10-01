import React, { ReactNode } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/hooks/useThemeColors';

interface ScreenProps {
  children: ReactNode;
  scrollable?: boolean;
  padding?: boolean;
  safeArea?: boolean;
  backgroundColor?: string;
  className?: string;
  style?: any;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  padding = true,
  safeArea = true,
  backgroundColor,
  className = '',
  style,
}) => {
  const colors = useThemeColors();
  
  const addedStyle = {
    ...style,
    backgroundColor: backgroundColor || colors.background,
  };

  const content = (
    <View style={[styles.container, addedStyle]} className={className}>
      {children}
    </View>
  );

  const wrappedContent = scrollable ? (
    <ScrollView 
      style={[styles.container, style]} 
      contentContainerStyle={padding ? styles.padding : undefined}
      showsVerticalScrollIndicator={false}
      className={className}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, style, padding && styles.padding]} className={className}>
      {children}
    </View>
  );

  return safeArea ? (
    <SafeAreaView style={[styles.container, style]}>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});