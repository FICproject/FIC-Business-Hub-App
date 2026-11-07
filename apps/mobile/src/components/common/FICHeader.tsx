import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing, typography, shadows } from '../../theme';
import { BackButton } from './BackButton';

export interface FICHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const FICHeader: React.FC<FICHeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  rightAction,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.contentRow}>
        {showBack && onBack && (
          <BackButton
            onPress={onBack}
            style={{ marginRight: spacing.md }}
            accessibilityLabel={`Back from ${title}`}
          />
        )}
        <View style={styles.titleArea}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.surfaceGlass,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    ...shadows.soft,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  titleArea: {
    flex: 1,
  },
  title: {
    ...typography.heading1,
  },
  subtitle: {
    ...typography.caption,
    marginTop: 2,
  },
  rightAction: {
    marginLeft: spacing.md,
  },
});

