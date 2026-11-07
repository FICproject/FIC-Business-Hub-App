import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { NotificationItem } from '../../types';
import { StandardHeader } from '../../components/common/StandardHeader';
import { useStudentMentor } from '../../state/StudentMentorContext';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface NotificationsScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { notifications: dynamicNotifs } = useStudentMentor();
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const combinedNotifications: NotificationItem[] = [
    ...dynamicNotifs.map((dn) => ({
      id: dn.id,
      title: dn.title,
      body: dn.body,
      timestamp: dn.timestamp,
      read: dn.read,
      type: (dn.type === 'CONSULTATION' ? 'MEETING' : dn.type === 'COURSE' ? 'ADVISORY' : dn.type === 'CHAMBER' ? 'REQUEST' : 'KYC') as any,
    })),
    ...notifications,
  ];

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = combinedNotifications.filter((n) => !n.read).length;

  const getTypeBadge = (type: NotificationItem['type']) => {
    switch (type) {
      case 'KYC':
        return (
          <View style={[styles.badgePill, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE' }]}>
            <Text style={{ fontSize: 11, marginRight: 4 }}>🛡️</Text>
            <Text style={[styles.badgeText, { color: '#2563EB' }]}>KYC Compliance</Text>
          </View>
        );
      case 'MEETING':
        return (
          <View style={[styles.badgePill, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE' }]}>
            <Text style={{ fontSize: 11, marginRight: 4 }}>📅</Text>
            <Text style={[styles.badgeText, { color: '#7C3AED' }]}>Meeting</Text>
          </View>
        );
      case 'REQUEST':
        return (
          <View style={[styles.badgePill, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
            <Text style={{ fontSize: 11, marginRight: 4 }}>📄</Text>
            <Text style={[styles.badgeText, { color: '#059669' }]}>Trade Request</Text>
          </View>
        );
      case 'ADVISORY':
        return (
          <View style={[styles.badgePill, { backgroundColor: '#FFF7ED', borderColor: '#FFEDD5' }]}>
            <Text style={{ fontSize: 11, marginRight: 4 }}>💡</Text>
            <Text style={[styles.badgeText, { color: '#EA580C' }]}>Advisory Desk</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.safeArea}>
      <StandardHeader
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}`
            : 'All caught up'
        }
        showBack={true}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Notifications"
        rightAction={
          unreadCount > 0 ? (
            <TouchableOpacity
              style={styles.markReadBtn}
              activeOpacity={0.75}
              onPress={markAllAsRead}
            >
              <Text style={styles.markReadText}>Mark all read</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Notifications List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {combinedNotifications.map((item) => {
          const isUnread = !item.read;
          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.notifCard, isUnread && styles.notifCardUnread]}
              activeOpacity={0.85}
              onPress={() => {
                // Mark single item read on tap
                setNotifications((prev) =>
                  prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
                );
                // Optional navigation
                if (item.type === 'MEETING' && onNavigateToModule) {
                  onNavigateToModule('Meetings');
                } else if (item.type === 'REQUEST' && onNavigateToModule) {
                  onNavigateToModule('My Requests');
                }
              }}
            >
              <View style={styles.cardHeaderRow}>
                {getTypeBadge(item.type)}
                <View style={styles.timeRow}>
                  {isUnread && <View style={styles.unreadBlueDot} />}
                  <Text style={styles.timeText}>{item.timestamp}</Text>
                </View>
              </View>

              <Text style={[styles.titleText, isUnread && styles.titleTextUnread]}>
                {item.title}
              </Text>
              <Text style={styles.bodyText}>{item.body}</Text>
            </TouchableOpacity>
          );
        })}

        {combinedNotifications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You have no new notifications or activity alerts right now.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitles: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    fontWeight: '500',
    marginTop: 1,
  },
  markReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
  },
  markReadText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  notifCardUnread: {
    borderLeftWidth: 3.5,
    borderLeftColor: '#2563EB',
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  unreadBlueDot: {
    width: 6.5,
    height: 6.5,
    borderRadius: 3.25,
    backgroundColor: '#2563EB',
  },
  timeText: {
    fontSize: 11.5,
    color: '#94A3B8',
    fontFamily: fontSansSerif,
    fontWeight: '500',
  },
  titleText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: fontSansSerif,
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  titleTextUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  bodyText: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
});
