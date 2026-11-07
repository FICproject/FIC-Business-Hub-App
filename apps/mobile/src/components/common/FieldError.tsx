import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle, Platform } from 'react-native';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface FieldErrorProps {
  error?: string | null;
  style?: ViewStyle;
  textStyle?: TextStyle;
  showIcon?: boolean;
}

/**
 * Reusable inline validation error message component.
 * Displays error text directly below input fields with consistent typography,
 * subtle red styling, and automatic dismissal when null/empty.
 */
export const FieldError: React.FC<FieldErrorProps> = ({
  error,
  style,
  textStyle,
  showIcon = true,
}) => {
  if (!error) return null;

  return (
    <View style={[styles.container, style]} accessibilityRole="alert">
      {showIcon && <Text style={styles.icon}>⚠️</Text>}
      <Text style={[styles.errorText, textStyle]}>{error}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 6,
    marginBottom: 2,
  },
  icon: {
    fontSize: 11,
    marginRight: 4,
  },
  errorText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626',
    flexShrink: 1,
    lineHeight: 16,
    fontFamily: fontSansSerif,
  },
});

