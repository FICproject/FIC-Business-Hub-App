import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { StandardHeader } from '../../components/common/StandardHeader';
import { FacilitatedMeeting } from '../../types';
import { notify } from '../../components/common/NotificationContext';
import { launchAssignedMeeting, MeetingPlatform } from '../../utils/meetingLauncher';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

interface ExtendedMeeting extends FacilitatedMeeting {
  month: string;
  day: string;
  timeRange: string;
  counterparty?: string;
  agenda?: string;
  platform?: MeetingPlatform;
  meetingUrl?: string;
}

interface MeetingsScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const MeetingsScreen: React.FC<MeetingsScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const [meetings, setMeetings] = useState<ExtendedMeeting[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UPCOMING' | 'CONCLUDED'>('ALL');
  const [selectedMeeting, setSelectedMeeting] = useState<ExtendedMeeting | null>(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Form states
  const [topic, setTopic] = useState('');
  const [counterparty, setCounterparty] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [agenda, setAgenda] = useState('');
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>('Google Meet');
  const [meetingUrlInput, setMeetingUrlInput] = useState('');

  const filteredMeetings = meetings.filter((m) => {
    if (activeFilter === 'UPCOMING') return m.status !== 'CONCLUDED';
    if (activeFilter === 'CONCLUDED') return m.status === 'CONCLUDED';
    return true;
  });

  const handleJoinChamber = (meeting: ExtendedMeeting) => {
    launchAssignedMeeting({
      id: meeting.id,
      subject: meeting.subject,
      platform: meeting.platform,
      meetingUrl: meeting.meetingUrl,
      meetingLinkOrLocation: meeting.meetingLinkOrLocation,
    });
  };

  const handleScheduleSubmit = () => {
    if (!topic.trim()) {
      notify.warning('Please enter a meeting topic.', 'Required Field');
      return;
    }

    const assignedUrl =
      meetingUrlInput.trim() ||
      (meetingPlatform === 'Zoom'
        ? 'https://zoom.us/j/88392104521?pwd=FIC'
        : meetingPlatform === 'Microsoft Teams'
        ? 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_fic'
        : 'https://meet.google.com/fic-chamb-new');

    const newMeeting: ExtendedMeeting = {
      id: `meet-${Date.now()}`,
      subject: topic,
      dateTime: preferredDate || 'Upcoming Chamber',
      month: 'Nov',
      day: '15',
      timeRange: '10:00 AM - 11:00 AM',
      ficModeratorName: 'FIC Coordinating Desk (Assigning)',
      platform: meetingPlatform,
      meetingUrl: assignedUrl,
      meetingLinkOrLocation: `${meetingPlatform} (FIC Virtual Chamber #3)`,
      status: 'SCHEDULED',
      counterparty: counterparty || 'FIC Matched Provider',
      agenda: agenda || 'Chamber bilateral discussion.',
    };

    setMeetings([newMeeting, ...meetings]);
    setScheduleModalVisible(false);
    setTopic('');
    setCounterparty('');
    setPreferredDate('');
    setAgenda('');
    setMeetingUrlInput('');

    notify.success(
      `Your meeting request on ${meetingPlatform} has been scheduled.`,
      'Meeting Scheduled'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Meetings"
        subtitle="Facilitated Bilateral Chambers"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Meetings"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Schedule Action Button */}
        <TouchableOpacity
          style={styles.scheduleActionBtn}
          activeOpacity={0.88}
          onPress={() => setScheduleModalVisible(true)}
        >
          <Text style={styles.scheduleActionBtnText}>+ Schedule Facilitated Chamber Meeting</Text>
        </TouchableOpacity>

        {/* Filter Tabs */}
        <View style={styles.filterTabsRow}>
          {(['ALL', 'UPCOMING', 'CONCLUDED'] as const).map((tab) => {
            const isActive = activeFilter === tab;
            const label =
              tab === 'ALL'
                ? `All (${meetings.length})`
                : tab === 'UPCOMING'
                ? `Upcoming (${meetings.filter((m) => m.status !== 'CONCLUDED').length})`
                : `Concluded (${meetings.filter((m) => m.status === 'CONCLUDED').length})`;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(tab)}
              >
                <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Meeting Cards or Empty State */}
        {filteredMeetings.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 16, marginHorizontal: 16, borderWidth: 1, borderColor: '#F1F5F9', marginTop: 8 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📅</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}>
              No upcoming meetings
            </Text>
            <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 }}>
              You have no facilitated chamber sessions scheduled. Tap the button above to request an official session with an assigned FIC Coordinating Officer.
            </Text>
          </View>
        ) : (
          filteredMeetings.map((meeting) => (
            <View key={meeting.id} style={styles.meetingCard}>
              <View style={styles.cardTopRow}>
                {/* Date Box */}
                <View style={styles.dateBadge}>
                  <Text style={styles.dateMonth}>{meeting.month}</Text>
                  <Text style={styles.dateDay}>{meeting.day}</Text>
                </View>

                {/* Main Info */}
                <View style={styles.meetingInfoCol}>
                  <Text style={styles.meetingTitle}>{meeting.subject}</Text>
                  <View style={styles.timeLocationRow}>
                    <Text style={styles.timeText}>🕒 {meeting.timeRange}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.locationText}>🎥 Virtual Chamber</Text>
                  </View>
                </View>

                {/* Status Pill */}
                <View
                  style={[
                    styles.statusPill,
                    meeting.status === 'CONFIRMED'
                      ? styles.statusConfirmed
                      : meeting.status === 'CONCLUDED'
                      ? styles.statusCompleted
                      : styles.statusScheduled,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      meeting.status === 'CONFIRMED'
                        ? styles.statusTextConfirmed
                        : meeting.status === 'CONCLUDED'
                        ? styles.statusTextCompleted
                        : styles.statusTextScheduled,
                    ]}
                  >
                    {meeting.status}
                  </Text>
                </View>
              </View>

              {/* Moderator Info Box */}
              <View style={styles.moderatorBox}>
                <Text style={styles.moderatorLabel}>Assigned Chamber Moderator:</Text>
                <Text style={styles.moderatorName}>{meeting.ficModeratorName}</Text>
                <Text style={styles.chamberRoom}>📍 {meeting.meetingLinkOrLocation}</Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActionsRow}>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  activeOpacity={0.7}
                  onPress={() => setSelectedMeeting(meeting)}
                >
                  <Text style={styles.detailsBtnText}>View Details</Text>
                </TouchableOpacity>

                {meeting.status !== 'CONCLUDED' && (
                  <TouchableOpacity
                    style={styles.joinBtn}
                    activeOpacity={0.88}
                    onPress={() => handleJoinChamber(meeting)}
                  >
                    <Text style={styles.joinBtnText}>Enter Meeting →</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Meeting Details Modal */}
      <Modal
        visible={!!selectedMeeting}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMeeting(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Chamber Meeting Details</Text>
              <TouchableOpacity onPress={() => setSelectedMeeting(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsBody}>
              <Text style={styles.detailSubject}>{selectedMeeting?.subject}</Text>
              <Text style={styles.detailDateTime}>
                📅 {selectedMeeting?.month} {selectedMeeting?.day} • {selectedMeeting?.timeRange}
              </Text>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Assigned App:</Text>
                <Text style={[styles.detailFieldVal, { color: '#2563EB', fontWeight: '700' }]}>
                  {selectedMeeting?.platform || 'Google Meet'}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Chamber Room:</Text>
                <Text style={styles.detailFieldVal}>{selectedMeeting?.meetingLinkOrLocation}</Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Facilitator:</Text>
                <Text style={styles.detailFieldVal}>{selectedMeeting?.ficModeratorName}</Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Counterparty:</Text>
                <Text style={styles.detailFieldVal}>{selectedMeeting?.counterparty}</Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Agenda:</Text>
                <Text style={styles.detailFieldVal}>{selectedMeeting?.agenda}</Text>
              </View>
            </View>

            {selectedMeeting?.status !== 'CONCLUDED' && (
              <TouchableOpacity
                style={styles.modalEnterBtn}
                activeOpacity={0.88}
                onPress={() => {
                  const m = selectedMeeting!;
                  setSelectedMeeting(null);
                  handleJoinChamber(m);
                }}
              >
                <Text style={styles.modalEnterBtnText}>Enter Meeting →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        visible={scheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalSheetTitle}>Schedule Bilateral Chamber</Text>
                <Text style={styles.modalSheetSubtitle}>FIC Moderated Commercial Session</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>
                Session Topic / Purpose <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Subcontracting Specification Review"
                placeholderTextColor="#94A3B8"
                value={topic}
                onChangeText={setTopic}
              />

              <Text style={styles.inputLabel}>Target Counterparty / Category</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Precision CNC Machining Provider"
                placeholderTextColor="#94A3B8"
                value={counterparty}
                onChangeText={setCounterparty}
              />

              <Text style={styles.inputLabel}>Preferred Date & Time Window</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Next Tuesday morning, 11:00 AM IST"
                placeholderTextColor="#94A3B8"
                value={preferredDate}
                onChangeText={setPreferredDate}
              />

              <Text style={styles.inputLabel}>Agenda / Discussion Points</Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField]}
                placeholder="Specify technical questions, commercial scope, or review items..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={agenda}
                onChangeText={setAgenda}
              />

              <Text style={styles.inputLabel}>Assigned Meeting Platform</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {(['Google Meet', 'Zoom', 'Microsoft Teams'] as const).map((plat) => (
                  <TouchableOpacity
                    key={plat}
                    style={[
                      styles.filterTab,
                      { flex: 1, paddingVertical: 8, alignItems: 'center' },
                      meetingPlatform === plat && styles.filterTabActive,
                    ]}
                    onPress={() => setMeetingPlatform(plat)}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        meetingPlatform === plat && styles.filterTabTextActive,
                        { fontSize: 11 },
                      ]}
                    >
                      {plat === 'Google Meet' ? '📹 Meet' : plat === 'Zoom' ? '🟦 Zoom' : '👥 Teams'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Meeting Link (Optional / Auto-Generated)</Text>
              <TextInput
                style={styles.inputField}
                placeholder={
                  meetingPlatform === 'Zoom'
                    ? 'https://zoom.us/j/...'
                    : meetingPlatform === 'Microsoft Teams'
                    ? 'https://teams.microsoft.com/...'
                    : 'https://meet.google.com/...'
                }
                placeholderTextColor="#94A3B8"
                value={meetingUrlInput}
                onChangeText={setMeetingUrlInput}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                activeOpacity={0.88}
                onPress={handleScheduleSubmit}
              >
                <Text style={styles.modalSubmitBtnText}>Book Chamber Session →</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 32,
  },
  protocolBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 14,
    marginBottom: 14,
  },
  bannerIconBox: {
    marginRight: 10,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 16,
  },
  scheduleActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  scheduleActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    paddingVertical: 6.5,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  filterTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  meetingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    marginBottom: 14,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  dateDay: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginTop: -2,
  },
  meetingInfoCol: {
    flex: 1,
    paddingRight: 6,
  },
  meetingTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    lineHeight: 18,
    marginBottom: 3,
  },
  timeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  metaDivider: {
    fontSize: 10,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  locationText: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: fontSansSerif,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  statusConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusTextConfirmed: {
    color: '#15803D',
  },
  statusScheduled: {
    backgroundColor: '#EFF6FF',
  },
  statusTextScheduled: {
    color: '#2563EB',
  },
  statusCompleted: {
    backgroundColor: '#F1F5F9',
  },
  statusTextCompleted: {
    color: '#64748B',
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  moderatorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 10,
    marginBottom: 12,
  },
  moderatorLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  moderatorName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  chamberRoom: {
    fontSize: 11,
    color: '#2563EB',
    fontFamily: fontSansSerif,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  detailsBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  joinBtn: {
    flex: 1.5,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  detailsCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  detailsBody: {
    marginBottom: 16,
  },
  detailSubject: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 4,
  },
  detailDateTime: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: fontSansSerif,
    marginBottom: 12,
  },
  detailFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailFieldLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    width: '35%',
  },
  detailFieldVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    width: '65%',
    textAlign: 'right',
  },
  modalEnterBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEnterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '88%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalSheetSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 14,
  },
  textAreaField: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalNoticeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 12,
    marginBottom: 16,
  },
  modalNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  modalNoticeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
});
