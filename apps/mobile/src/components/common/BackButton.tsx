import React from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';

export interface BackButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  color?: string;
  accessibilityLabel?: string;
  testID?: string;
}

export const BackChevronIcon: React.FC<{ color?: string }> = ({ color = '#0F172A' }) => (
  <View style={styles.iconContainer}>
    <View style={[styles.chevron, { borderColor: color }]} />
  </View>
);

/**
 * Global Reusable BackButton Component
 * Matches the Profile screen reference design:
 * - 38x38 circular container
 * - #F8FAFC light gray background
 * - 1px #E2E8F0 subtle border
 * - Modern crisp left-chevron vector arrow
 */
export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  color = '#0F172A',
  accessibilityLabel = 'Go back',
  testID = 'back-button',
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      activeOpacity={0.7}
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <BackChevronIcon color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  iconContainer: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    width: 9,
    height: 9,
    borderLeftWidth: 2.2,
    borderBottomWidth: 2.2,
    transform: [{ rotate: '45deg' }],
    marginLeft: 2.5,
  },
});

export default BackButton;

