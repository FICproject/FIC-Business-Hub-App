import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { FunctionsMenuModal } from './FunctionsMenuModal';
import { BackButton } from './BackButton';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;

interface StandardHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
  activeFunction?: string;
  rightAction?: React.ReactNode;
}

// 9-dot launcher icon
const FunctionsLauncherIcon = () => (
  <View style={{ width: 17, height: 17, justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
      <View style={{ width: 4.2, height: 4.2, borderRadius: 1.2, backgroundColor: '#2563EB' }} />
    </View>
  </View>
);

export const StandardHeader: React.FC<StandardHeaderProps> = ({
  title,
  subtitle,
  showBack = true,
  onBack,
  onNavigateToModule,
  activeFunction,
  rightAction,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.headerContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />
      <View style={styles.headerLeft}>
        {showBack && onBack && (
          <BackButton
            onPress={onBack}
            style={{ marginRight: 10 }}
            accessibilityLabel={`Back from ${title}`}
          />
        )}
        <View style={styles.titleCol}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.headerRight}>
        {rightAction}

        {onNavigateToModule && (
          <TouchableOpacity
            style={styles.menuLauncherButton}
            activeOpacity={0.7}
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="Open Functions Menu"
          >
            <FunctionsLauncherIcon />
          </TouchableOpacity>
        )}
      </View>

      {onNavigateToModule && (
        <FunctionsMenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          onSelectFunction={(mod) => {
            setMenuVisible(false);
            onNavigateToModule(mod);
          }}
          activeFunction={activeFunction || title}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: STATUSBAR_HEIGHT + 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginTop: -2,
  },
  titleCol: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 1.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuLauncherButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
});

