import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StandardHeader } from '../../components/common/StandardHeader';
import { notify } from '../../components/common/NotificationContext';
import { useAuth } from '../../state/AuthContext';
import {
  membershipNotificationService,
  ScheduleStatusData,
} from '../../services/membershipNotificationService';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface MembershipPaymentsScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const MembershipPaymentsScreen: React.FC<MembershipPaymentsScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { user } = useAuth();

  const [membershipPlan, setMembershipPlan] = useState('FIC Enterprise Membership');
  const [membershipStatus, setMembershipStatus] = useState<'ACTIVE' | 'EXPIRED'>('ACTIVE');
  const [expiryDate, setExpiryDate] = useState('05 Nov 2027');
  const [memberId] = useState('FIC-ENT-2026-9021');
  const [annualFee] = useState('₹5,999 / year');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'CARD'>('UPI');
  const [isRenewing, setIsRenewing] = useState(false);
  const [isTriggeringTest, setIsTriggeringTest] = useState(false);
  const [scheduleData, setScheduleData] = useState<ScheduleStatusData | null>(null);

  // Calculate days remaining dynamically
  const calculateDaysRemaining = (expStr: string): number => {
    try {
      const exp = new Date(expStr);
      if (isNaN(exp.getTime())) return 360;
      const today = new Date();
      const diffTime = exp.getTime() - today.getTime();
      return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    } catch {
      return 360;
    }
  };

  const daysRemaining = calculateDaysRemaining(expiryDate);

  // Load schedule status and ensure reminders are active
  useEffect(() => {
    let isMounted = true;
    const initializeReminders = async () => {
      const status = await membershipNotificationService.getScheduleStatus();
      if (isMounted && status.schedule) {
        setScheduleData(status.schedule);
      } else {
        // Schedule if not already active
        const result = await membershipNotificationService.scheduleReminders(expiryDate, membershipPlan);
        if (isMounted && result.data) {
          setScheduleData(result.data);
        }
      }
    };
    initializeReminders();
    return () => {
      isMounted = false;
    };
  }, [expiryDate, membershipPlan]);

  // Handle immediate test reminder notification
  const handleTriggerTestReminder = async () => {
    setIsTriggeringTest(true);
    try {
      const testDays = daysRemaining > 0 ? `${daysRemaining} days` : '2 days';
      const notifId = await membershipNotificationService.triggerTestReminder(testDays);
      if (notifId) {
        notify.success(
          `Notification sent! Check your Android notification drawer and in-app Notifications tab.`,
          'Push Notification Sent'
        );
      } else {
        notify.info('Push notification triggered.');
      }
      // Refresh status
      const updated = await membershipNotificationService.getScheduleStatus();
      if (updated.schedule) setScheduleData(updated.schedule);
    } catch (e) {
      notify.error('Failed to trigger test notification');
    } finally {
      setIsTriggeringTest(false);
    }
  };

  // Handle Renewal with +1 year extension and rescheduling
  const handleRenewMembership = () => {
    Alert.alert(
      'Confirm Membership Renewal',
      `Renew ${membershipPlan} for 1 year at ${annualFee}? All previous pending reminders will be cancelled and a fresh 10-notification reminder cycle will be scheduled for the new expiry date.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Pay',
          style: 'default',
          onPress: async () => {
            setIsRenewing(true);
            try {
              const res = await membershipNotificationService.processRenewal(expiryDate, membershipPlan);
              if (res.success) {
                setExpiryDate(res.newExpiryDate);
                setMembershipStatus('ACTIVE');
                const updated = await membershipNotificationService.getScheduleStatus();
                if (updated.schedule) setScheduleData(updated.schedule);

                notify.success(
                  `Your membership is renewed until ${res.newExpiryDate}! All reminder schedules updated.`,
                  'Renewal Successful'
                );
              } else {
                notify.error('Renewal could not be processed. Please try again.');
              }
            } catch (err) {
              notify.error('Error processing membership renewal');
            } finally {
              setIsRenewing(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Membership & Payments"
        subtitle="Plan Status & Renewal"
        showBack={true}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Profile"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ============================================================== */}
        {/* 1. MEMBERSHIP SUMMARY CARD                                      */}
        {/* ============================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.crownIconCircle}>
              <Text style={{ fontSize: 18 }}>👑</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.planTitle}>{membershipPlan}</Text>
              <Text style={styles.memberIdText}>Member ID: {memberId}</Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>● {membershipStatus}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Plan Expiry</Text>
            <Text style={styles.detailValueBold}>{expiryDate}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Validity Countdown</Text>
            <View style={styles.daysBadge}>
              <Text style={styles.daysBadgeText}>
                {daysRemaining > 0 ? `⏳ ${daysRemaining} days remaining` : '⚠️ Plan Expired'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Annual Renewal Fee</Text>
            <Text style={[styles.detailValueBold, { color: '#0C4E3D' }]}>{annualFee}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>FIC Governance Desk</Text>
            <Text style={styles.detailValue}>FIC Intermediary Chamber</Text>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 2. AUTOMATIC EXPIRY NOTIFICATION SCHEDULE TRACKER              */}
        {/* ============================================================== */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.crownIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Text style={{ fontSize: 18 }}>🔔</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Automatic Renewal Reminder Schedule</Text>
              <Text style={styles.sectionSubtitle}>
                10 push notifications scheduled before expiry (Asia/Kolkata timezone)
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.scheduleIntroText}>
            Reminders are scheduled automatically to alert you before your membership expires. 
            Android will deliver system push notifications even if the app is closed or running in the background.
          </Text>

          {/* Schedule Table / Timeline */}
          <View style={styles.scheduleTable}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.thText, { flex: 1.8 }]}>Interval</Text>
              <Text style={[styles.thText, { flex: 1.2 }]}>Slot Time</Text>
              <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Alerts</Text>
            </View>

            {[
              { interval: '3 months before', time: '09:00 AM', count: '1 notif', key: '3m' },
              { interval: '1 month before', time: '09:00 AM', count: '1 notif', key: '1m' },
              { interval: '15 days before', time: '09:00 AM', count: '1 notif', key: '15d' },
              { interval: '7 days before', time: '09:00 AM', count: '1 notif', key: '7d' },
              { interval: '3 days before', time: '09:00 AM', count: '1 notif', key: '3d' },
              { interval: '2 days before', time: '09:00 AM & 06:00 PM', count: '2 notifs', key: '2d' },
              { interval: '1 day before', time: '09:00 AM, 01:00 PM & 07:00 PM', count: '3 notifs', key: '1d' },
            ].map((item, idx) => (
              <View key={item.key} style={[styles.tableRow, idx % 2 === 1 && styles.tableRowAlt]}>
                <View style={{ flex: 1.8 }}>
                  <Text style={styles.tdIntervalText}>{item.interval}</Text>
                </View>
                <View style={{ flex: 1.2 }}>
                  <Text style={styles.tdTimeText}>{item.time}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <View style={styles.slotPill}>
                    <Text style={styles.slotPillText}>{item.count}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Test Push Trigger Button */}
          <TouchableOpacity
            style={styles.testNotifBtn}
            activeOpacity={0.8}
            onPress={handleTriggerTestReminder}
            disabled={isTriggeringTest}
          >
            {isTriggeringTest ? (
              <ActivityIndicator size="small" color="#2563EB" />
            ) : (
              <>
                <Text style={{ fontSize: 14, marginRight: 6 }}>🚀</Text>
                <Text style={styles.testNotifBtnText}>Test Instant Push Notification</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* 3. MEMBERSHIP RENEWAL & PAYMENT METHOD                         */}
        {/* ============================================================== */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Renew Membership Plan</Text>
          <Text style={styles.sectionSubtitle}>
            Select your preferred payment mode to renew for an additional 12 months.
          </Text>

          <View style={styles.divider} />

          {/* Payment Method Selector */}
          <Text style={styles.inputLabel}>Payment Method *</Text>
          {[
            { id: 'UPI', label: 'UPI / QR Code', sub: 'Google Pay, PhonePe, Paytm, BHIM', icon: '📱' },
            { id: 'CARD', label: 'Credit / Debit Card', sub: 'Visa, MasterCard, RuPay', icon: '💳' },
            { id: 'NET_BANKING', label: 'Net Banking', sub: 'All major Indian banks supported', icon: '🏦' },
          ].map((m) => {
            const isSelected = selectedPaymentMethod === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.paymentMethodItem, isSelected && styles.paymentMethodItemActive]}
                activeOpacity={0.8}
                onPress={() => setSelectedPaymentMethod(m.id as any)}
              >
                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={{ fontSize: 18, marginHorizontal: 8 }}>{m.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.paymentMethodLabel, isSelected && styles.paymentMethodLabelActive]}>
                    {m.label}
                  </Text>
                  <Text style={styles.paymentMethodSub}>{m.sub}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Renew CTA Button */}
          <TouchableOpacity
            style={[styles.renewButton, isRenewing && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleRenewMembership}
            disabled={isRenewing}
          >
            {isRenewing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Text style={styles.renewButtonText}>Renew Membership • {annualFee}</Text>
                <Text style={{ color: '#FFFFFF', fontSize: 16, marginLeft: 6 }}>›</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.securityNote}>
            🔒 256-bit encrypted SSL payment powered by FIC Intermediary Chamber. 
            Official GST invoice & updated certificate provided upon completion.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  crownIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  memberIdText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  activeBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
    fontFamily: fontSansSerif,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  detailLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  detailValue: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  detailValueBold: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  daysBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  daysBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  scheduleIntroText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
    fontFamily: fontSansSerif,
  },
  scheduleTable: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 14,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  tableRowAlt: {
    backgroundColor: '#F8FAFC',
  },
  tdIntervalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: fontSansSerif,
  },
  tdTimeText: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  slotPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  slotPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  testNotifBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  testNotifBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0284C7',
    fontFamily: fontSansSerif,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    fontFamily: fontSansSerif,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  paymentMethodItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#2563EB',
  },
  paymentMethodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  paymentMethodLabelActive: {
    color: '#1D4ED8',
  },
  paymentMethodSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
    fontFamily: fontSansSerif,
  },
  renewButton: {
    backgroundColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  renewButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  securityNote: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 15,
    fontFamily: fontSansSerif,
  },
});

