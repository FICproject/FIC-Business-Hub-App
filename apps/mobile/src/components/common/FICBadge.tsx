import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export interface FICBadgeProps {
  label: string;
  variant?: 'terracotta' | 'amber' | 'teal' | 'violet' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
}

export const FICBadge: React.FC<FICBadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
}) => {
  const getBadgeColors = (): { bg: string; text: string; border: string } => {
    switch (variant) {
      case 'terracotta':
        return { bg: colors.terracottaLight, text: colors.terracottaDark, border: colors.terracotta };
      case 'amber':
        return { bg: colors.goldenAmberLight, text: colors.goldenAmber, border: colors.goldenAmber };
      case 'teal':
        return { bg: colors.forestTealLight, text: colors.forestTeal, border: colors.forestTeal };
      case 'violet':
        return { bg: colors.royalVioletLight, text: colors.royalViolet, border: colors.royalViolet };
      case 'success':
        return { bg: colors.successLight, text: colors.success, border: colors.success };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning, border: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger, border: colors.danger };
      case 'neutral':
      default:
        return { bg: colors.surfaceSand, text: colors.textSecondary, border: colors.borderSubtle };
    }
  };

  const bColors = getBadgeColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bColors.bg,
          borderColor: bColors.border,
          paddingVertical: isSm ? 2 : spacing.xs,
          paddingHorizontal: isSm ? spacing.xs + 2 : spacing.sm + 2,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: bColors.text,
            fontSize: isSm ? 10 : 12,
            lineHeight: isSm ? 14 : 16,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

