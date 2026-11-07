import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';

export interface FICInputProps extends TextInputProps {
  label: string;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  required?: boolean;
}

export const FICInput: React.FC<FICInputProps> = ({
  label,
  error,
  helperText,
  containerStyle,
  required,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {required && <Text style={styles.requiredAsterisk}> *</Text>}
      </View>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          inputProps.multiline ? styles.multilineInput : null,
        ]}
        placeholderTextColor={colors.textMuted}
        {...inputProps}
      />
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs + 2,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  requiredAsterisk: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    ...typography.bodyRegular,
    color: colors.textPrimary,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerLight,
  },
  errorText: {
    ...typography.micro,
    color: colors.danger,
    marginTop: 4,
  },
  helperText: {
    ...typography.micro,
    color: colors.textSecondary,
    marginTop: 4,
  },
});

