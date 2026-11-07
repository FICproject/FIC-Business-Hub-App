import React, { useRef } from 'react';
import {
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Pressable,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';

export interface FICButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'amber' | 'teal' | 'violet';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const FICButton: React.FC<FICButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  style,
  textStyle,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: colors.surfaceSand, borderWidth: 1, borderColor: colors.borderSubtle },
          text: { color: colors.textPrimary },
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.terracotta },
          text: { color: colors.terracotta },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: colors.textPrimary },
        };
      case 'amber':
        return {
          container: { backgroundColor: colors.goldenAmber },
          text: { color: colors.textInverse },
        };
      case 'teal':
        return {
          container: { backgroundColor: colors.forestTeal },
          text: { color: colors.textInverse },
        };
      case 'violet':
        return {
          container: { backgroundColor: colors.royalViolet },
          text: { color: colors.textInverse },
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: colors.terracotta, ...shadows.soft },
          text: { color: colors.textInverse },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { paddingVertical: spacing.xs + 2, paddingHorizontal: spacing.md, minHeight: 36 },
          text: { ...typography.caption, fontWeight: '600' },
        };
      case 'lg':
        return {
          container: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl, minHeight: 54 },
          text: { ...typography.heading2, fontWeight: '600' },
        };
      case 'md':
      default:
        return {
          container: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, minHeight: 48 },
          text: { ...typography.bodyMedium, fontWeight: '600' },
        };
    }
  };

  const vStyles = getVariantStyles();
  const sStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.baseButton,
          vStyles.container,
          sStyles.container,
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={vStyles.text.color || colors.textInverse}
          />
        ) : (
          <>
            {icon && <Animated.View style={styles.iconContainer}>{icon}</Animated.View>}
            <Text style={[styles.baseText, vStyles.text, sStyles.text, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  baseButton: {
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  baseText: {
    textAlign: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.5,
  },
});

