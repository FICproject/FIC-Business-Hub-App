import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, Pressable } from 'react-native';
import { colors, radii, spacing, shadows } from '../../theme';

export interface FICCardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outline' | 'sand' | 'glass';
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing;
}

export const FICCard: React.FC<FICCardProps> = ({
  children,
  variant = 'elevated',
  onPress,
  style,
  padding = 'lg',
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
        };
      case 'sand':
        return {
          backgroundColor: colors.surfaceSand,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
        };
      case 'glass':
        return {
          backgroundColor: colors.surfaceGlass,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          ...shadows.soft,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.borderSubtle,
          ...shadows.soft,
        };
    }
  };

  const containerStyles: StyleProp<ViewStyle> = [
    styles.card,
    getVariantStyle(),
    { padding: spacing[padding] },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyles,
          pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    marginVertical: spacing.xs,
  },
});

