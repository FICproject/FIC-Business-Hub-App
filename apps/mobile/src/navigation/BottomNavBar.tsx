import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';

export type TabKey =
  | 'Home'
  | 'Services'
  | 'Requests'
  | 'Connections'
  | 'Profile'
  | 'Marketplace'
  | 'Notifications'
  | 'Sessions'
  | 'Students'
  | 'Courses';

interface BottomNavProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  unreadCount?: number;
  isMentor?: boolean;
}

// Clean Custom Vector Icons matching Image 2
const NavHomeIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 21, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 10,
        borderRightWidth: 10,
        borderBottomWidth: 8,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        marginBottom: -1,
      }}
    />
    <View
      style={{
        width: 14,
        height: 11,
        backgroundColor: color,
        borderBottomLeftRadius: 2.5,
        borderBottomRightRadius: 2.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <View
        style={{
          width: 4.5,
          height: 6,
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 1.5,
          borderTopRightRadius: 1.5,
        }}
      />
    </View>
  </View>
);

const NavServicesIcon = ({ color }: { color: string }) => (
  <View style={{ width: 20, height: 20, justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 8, height: 8, borderRadius: 2.5, borderWidth: 1.8, borderColor: color }} />
      <View style={{ width: 8, height: 8, borderRadius: 2.5, borderWidth: 1.8, borderColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 8, height: 8, borderRadius: 2.5, borderWidth: 1.8, borderColor: color }} />
      <View style={{ width: 8, height: 8, borderRadius: 2.5, borderWidth: 1.8, borderColor: color }} />
    </View>
  </View>
);

const NavRequestsIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 17,
      height: 21,
      borderRadius: 3.5,
      borderWidth: 1.8,
      borderColor: color,
      paddingHorizontal: 2.5,
      paddingVertical: 3.5,
      justifyContent: 'space-between',
    }}
  >
    <View style={{ width: 6, height: 1.8, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 9, height: 1.8, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 6, height: 1.8, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

const NavConnectionsIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
    <View style={{ alignItems: 'center', zIndex: 2, marginRight: -4 }}>
      <View style={{ width: 7.5, height: 7.5, borderRadius: 4, borderWidth: 1.6, borderColor: color, backgroundColor: '#FFFFFF' }} />
      <View
        style={{
          width: 13,
          height: 6.5,
          borderTopLeftRadius: 6.5,
          borderTopRightRadius: 6.5,
          borderWidth: 1.6,
          borderColor: color,
          borderBottomWidth: 0,
          marginTop: 1,
          backgroundColor: '#FFFFFF',
        }}
      />
    </View>
    <View style={{ alignItems: 'center', zIndex: 1 }}>
      <View style={{ width: 6.5, height: 6.5, borderRadius: 3.5, borderWidth: 1.5, borderColor: color, backgroundColor: '#FFFFFF' }} />
      <View
        style={{
          width: 11,
          height: 5.5,
          borderTopLeftRadius: 5.5,
          borderTopRightRadius: 5.5,
          borderWidth: 1.5,
          borderColor: color,
          borderBottomWidth: 0,
          marginTop: 1,
          backgroundColor: '#FFFFFF',
        }}
      />
    </View>
  </View>
);

const NavProfileIcon = ({ color }: { color: string }) => (
  <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 7.5, height: 7.5, borderRadius: 4, borderWidth: 1.8, borderColor: color }} />
    <View
      style={{
        width: 14,
        height: 7.5,
        borderTopLeftRadius: 7,
        borderTopRightRadius: 7,
        borderWidth: 1.8,
        borderColor: color,
        borderBottomWidth: 0,
        marginTop: 1.5,
      }}
    />
  </View>
);

// Calendar Icon for Mentor Sessions Tab
const NavSessionsIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1.8,
      borderColor: color,
      paddingTop: 3,
      alignItems: 'center',
    }}
  >
    <View style={{ width: 16, height: 1.5, backgroundColor: color, marginBottom: 2 }} />
    <View style={{ flexDirection: 'row', gap: 2.5 }}>
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', gap: 2.5, marginTop: 2 }}>
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
    </View>
  </View>
);

// Students Icon for Mentor Students Tab
const NavStudentsIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}>
      <View style={{ width: 6.5, height: 6.5, borderRadius: 3.5, borderWidth: 1.6, borderColor: color }} />
      <View style={{ width: 6.5, height: 6.5, borderRadius: 3.5, borderWidth: 1.6, borderColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', gap: 2, marginTop: 1.5 }}>
      <View
        style={{
          width: 9,
          height: 5,
          borderTopLeftRadius: 4.5,
          borderTopRightRadius: 4.5,
          borderWidth: 1.6,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
      <View
        style={{
          width: 9,
          height: 5,
          borderTopLeftRadius: 4.5,
          borderTopRightRadius: 4.5,
          borderWidth: 1.6,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
    </View>
  </View>
);

// Graduation Cap Icon for Mentor Courses Tab
const NavCoursesIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    {/* Diamond cap top */}
    <View
      style={{
        width: 13,
        height: 13,
        borderWidth: 1.6,
        borderColor: color,
        transform: [{ rotate: '45deg' }, { scaleY: 0.55 }],
        backgroundColor: color,
      }}
    />
    {/* Cap under-arch */}
    <View
      style={{
        width: 10,
        height: 4.5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderWidth: 1.6,
        borderColor: color,
        borderTopWidth: 0,
        marginTop: -3,
      }}
    />
    {/* Tassel line */}
    <View
      style={{
        position: 'absolute',
        right: 2.5,
        top: 8,
        width: 1.5,
        height: 6,
        backgroundColor: color,
      }}
    />
  </View>
);

export const BottomNavBar: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  isMentor = false,
}) => {
  const standardTabs: { key: TabKey; label: string; renderIcon: (c: string) => React.ReactNode }[] = [
    { key: 'Home', label: 'Home', renderIcon: (c) => <NavHomeIcon color={c} /> },
    { key: 'Services', label: 'Services', renderIcon: (c) => <NavServicesIcon color={c} /> },
    { key: 'Requests', label: 'Requests', renderIcon: (c) => <NavRequestsIcon color={c} /> },
    { key: 'Connections', label: 'Connections', renderIcon: (c) => <NavConnectionsIcon color={c} /> },
    { key: 'Profile', label: 'Profile', renderIcon: (c) => <NavProfileIcon color={c} /> },
  ];

  const mentorTabs: { key: TabKey; label: string; renderIcon: (c: string) => React.ReactNode }[] = [
    { key: 'Home', label: 'Home', renderIcon: (c) => <NavHomeIcon color={c} /> },
    { key: 'Services', label: 'Services', renderIcon: (c) => <NavServicesIcon color={c} /> },
    { key: 'Students', label: 'Students', renderIcon: (c) => <NavStudentsIcon color={c} /> },
    { key: 'Courses', label: 'Courses', renderIcon: (c) => <NavCoursesIcon color={c} /> },
    { key: 'Profile', label: 'Profile', renderIcon: (c) => <NavProfileIcon color={c} /> },
  ];

  const tabs = isMentor ? mentorTabs : standardTabs;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.navBar}>
        {tabs.map((tab) => {
          const isActive =
            currentTab === tab.key ||
            (tab.key === 'Services' && currentTab === 'Marketplace');

          const iconColor = isActive ? '#2563EB' : '#64748B';

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => onSelectTab(tab.key)}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                {tab.renderIcon(iconColor)}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  navBar: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    marginBottom: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : 'System',
    fontStyle: 'normal',
    textAlign: 'center',
  },
  tabLabelInactive: {
    color: '#64748B',
    fontWeight: '500',
  },
  tabLabelActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
});
