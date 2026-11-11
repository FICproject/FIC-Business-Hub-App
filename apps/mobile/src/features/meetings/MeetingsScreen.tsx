import React, { useState, useEffect } from 'react';
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
import { storageService } from '../../services/storageService';
import { useAuth } from '../../state/AuthContext';
import { StudentMentorshipScreen } from './StudentMentorshipScreen';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export type MeetingMode = 'Virtual Meet' | 'In-Person Hub' | 'Phone Call';

export interface ExtendedMeeting extends FacilitatedMeeting {
  month: string;
  day: string;
  timeRange: string;
  category?: string;
  agenda?: string;
  meetingMode?: MeetingMode;
  platform?: MeetingPlatform;
  meetingUrl?: string;
  counterparty?: string;
}

interface MeetingsScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
  initialAction?: string;
}

export const CONSULTATION_CATEGORIES = [
  'Technology & Software Architecture',
  'Manufacturing & Industrial Operations',
  'Business Strategy & Enterprise Scaling',
  'Legal, Compliance & Governance',
  'Financial Advisory & Investment Funding',
  'Marketing, Branding & Market Expansion',
  'Talent, Training & Skill Development',
  'Export, Import & International Trade',
  'FIC Chamber Bilateral Facilitation',
];

export const PREFERRED_TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:00 AM - 11:00 AM',
  '11:00 AM - 12:00 PM',
  '02:00 PM - 03:00 PM',
  '03:00 PM - 04:00 PM',
  '04:00 PM - 05:00 PM',
  '05:00 PM - 06:00 PM',
];

const INITIAL_MEETINGS: ExtendedMeeting[] = [
  {
    id: 'meet-1',
    subject: 'Factory Modernization & CNC Automation Scope',
    category: 'Manufacturing & Industrial Operations',
    dateTime: '18-11-2026 • 10:00 AM - 11:00 AM',
    month: 'Nov',
    day: '18',
    timeRange: '10:00 AM - 11:00 AM',
    meetingMode: 'Virtual Meet',
    ficModeratorName: 'Er. K. Senthil Kumar (FIC Technical Lead)',
    meetingLinkOrLocation: 'Virtual Chamber #2 (Link will be assigned)',
    status: 'CONFIRMED',
    agenda: 'Review robotic welding cell integration, cycle time reduction, and ISO compliance.',
  },
  {
    id: 'meet-2',
    subject: 'Cloud SaaS Architecture Alignment',
    category: 'Technology & Software Architecture',
    dateTime: '22-11-2026 • 02:00 PM - 03:00 PM',
    month: 'Nov',
    day: '22',
    timeRange: '02:00 PM - 03:00 PM',
    meetingMode: 'Virtual Meet',
    ficModeratorName: 'FIC Coordinating Desk (Assigning)',
    meetingLinkOrLocation: 'Virtual Chamber (Officer Assigning Link)',
    status: 'SCHEDULED',
    agenda: 'Scalable multi-tenant backend architecture and regional data residency compliance.',
  },
];

const formatDDMMYYYY = (d: Date): string => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const parseDDMMYYYY = (str: string): Date | null => {
  const parts = str.trim().split('-');
  if (parts.length === 3) {
    const d = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const y = parseInt(parts[2], 10);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
      return new Date(y, m, d);
    }
  }
  return null;
};

const isPastDate = (dateStr: string): boolean => {
  const parsed = parseDDMMYYYY(dateStr);
  if (!parsed) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
};

const getTomorrowDate = (): string => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return formatDDMMYYYY(t);
};

export const MeetingsScreen: React.FC<MeetingsScreenProps> = ({
  onBack,
  onNavigateToModule,
  initialAction,
}) => {
  const { user } = useAuth();
  const subLower = (user?.subcategory || (user as any)?.subCategory || '').toLowerCase();
  const userCategory = user?.category || '';
  const isMentor =
    user?.role === 'MENTOR' ||
    subLower === 'mentor' ||
    subLower === 'mentor / trainer' ||
    subLower === 'mentor/trainer' ||
    subLower === 'trainer' ||
    subLower === 'teacher' ||
    subLower === 'professor' ||
    subLower === 'teacher / professor' ||
    subLower === 'teacher/professor';
  const isStudent =
    !isMentor &&
    (user?.role === 'STUDENT' ||
      subLower === 'student' ||
      (userCategory === 'Education & Knowledge' && subLower === 'student'));

  if (isStudent) {
    return (
      <StudentMentorshipScreen
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        initialAction={initialAction}
      />
    );
  }

  const [meetings, setMeetings] = useState<ExtendedMeeting[]>(INITIAL_MEETINGS);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UPCOMING' | 'CONCLUDED'>('ALL');
  const [selectedMeeting, setSelectedMeeting] = useState<ExtendedMeeting | null>(null);
  const [scheduleModalVisible, setScheduleModalVisible] = useState(false);

  // Form States (matching Website Facilitated Consultation Request form)
  const [consultationCategory, setConsultationCategory] = useState(CONSULTATION_CATEGORIES[0]);
  const [topicOrSubject, setTopicOrSubject] = useState('');
  const [preferredDate, setPreferredDate] = useState(getTomorrowDate());
  const [preferredSlot, setPreferredSlot] = useState(PREFERRED_TIME_SLOTS[1]); // 10:00 AM - 11:00 AM
  const [meetingMode, setMeetingMode] = useState<MeetingMode>('Virtual Meet');
  const [discussionAgenda, setDiscussionAgenda] = useState('');

  // Dropdown Pickers
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [slotPickerVisible, setSlotPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // Validation Errors
  const [formErrors, setFormErrors] = useState<{
    category?: string;
    topic?: string;
    date?: string;
    slot?: string;
    mode?: string;
    agenda?: string;
  }>({});

  // Load persisted meetings from storage
  useEffect(() => {
    let isMounted = true;
    const loadMeetings = async () => {
      try {
        const raw = await storageService.getItem('FIC_FACILITATED_MEETINGS');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && isMounted) {
            setMeetings(parsed);
          }
        }
      } catch (e) {
        console.warn('Error loading meetings:', e);
      }
    };
    loadMeetings();
    return () => {
      isMounted = false;
    };
  }, []);

  const updateAndPersistMeetings = (newList: ExtendedMeeting[]) => {
    setMeetings(newList);
    storageService.setItem('FIC_FACILITATED_MEETINGS', JSON.stringify(newList)).catch((e) => {
      console.warn('Error saving meetings:', e);
    });
  };

  const resetForm = () => {
    setConsultationCategory(CONSULTATION_CATEGORIES[0]);
    setTopicOrSubject('');
    setPreferredDate(getTomorrowDate());
    setPreferredSlot(PREFERRED_TIME_SLOTS[1]);
    setMeetingMode('Virtual Meet');
    setDiscussionAgenda('');
    setFormErrors({});
  };

  const handleOpenScheduleModal = () => {
    resetForm();
    setScheduleModalVisible(true);
  };

  // Quick date selector helper
  const handleQuickDateSelect = (daysFromToday: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromToday);
    setPreferredDate(formatDDMMYYYY(d));
    setDatePickerVisible(false);
    if (formErrors.date) {
      setFormErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!consultationCategory.trim()) {
      errors.category = 'Consultation category is required.';
    }

    if (!topicOrSubject.trim()) {
      errors.topic = 'Topic or Subject is required.';
    }

    if (!preferredDate.trim()) {
      errors.date = 'Preferred date is required (DD-MM-YYYY).';
    } else if (isPastDate(preferredDate)) {
      errors.date = 'Preferred date cannot be in the past.';
    }

    if (!preferredSlot.trim()) {
      errors.slot = 'Preferred time slot is required.';
    }

    if (!meetingMode) {
      errors.mode = 'Meeting mode must be selected.';
    }

    if (!discussionAgenda.trim()) {
      errors.agenda = 'Discussion agenda & scope is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmConsultationRequest = () => {
    if (!validateForm()) {
      notify.warning('Please complete all mandatory fields with valid details.', 'Required Fields Missing');
      return;
    }

    const parsedDate = parseDDMMYYYY(preferredDate) || new Date();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthStr = months[parsedDate.getMonth()];
    const dayStr = String(parsedDate.getDate()).padStart(2, '0');

    const locationLabel =
      meetingMode === 'Virtual Meet'
        ? 'Virtual Chamber (Officer Assigning Link)'
        : meetingMode === 'In-Person Hub'
        ? 'FIC Commercial Hub (Officer Assigning Venue)'
        : 'Facilitated Phone Bridge (FIC Desk)';

    const newMeeting: ExtendedMeeting = {
      id: `consult-${Date.now()}`,
      subject: topicOrSubject.trim(),
      category: consultationCategory,
      dateTime: `${preferredDate} • ${preferredSlot}`,
      month: monthStr,
      day: dayStr,
      timeRange: preferredSlot,
      ficModeratorName: 'FIC Coordinating Desk (Assigning)',
      platform: meetingMode === 'Virtual Meet' ? 'Google Meet' : undefined,
      meetingLinkOrLocation: locationLabel,
      status: 'SCHEDULED',
      meetingMode,
      agenda: discussionAgenda.trim(),
      counterparty: 'FIC Coordinating Officer',
    };

    const updated = [newMeeting, ...meetings];
    updateAndPersistMeetings(updated);
    setScheduleModalVisible(false);
    resetForm();

    notify.success(
      'Your facilitated consultation request has been confirmed and submitted to the FIC Governance Desk.',
      'Consultation Request Confirmed'
    );
  };

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
          onPress={handleOpenScheduleModal}
        >
          <Text style={styles.scheduleActionBtnText}>+ Schedule Facilitated Consultation</Text>
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
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>📅</Text>
            <Text style={styles.emptyTitle}>No scheduled consultations</Text>
            <Text style={styles.emptySubtitle}>
              You have no facilitated consultation sessions scheduled. Tap the button above to request an official session with an assigned FIC Coordinating Officer.
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
                  {meeting.category && (
                    <Text style={styles.categoryPillText}>
                      🏷️ {meeting.category}
                    </Text>
                  )}
                  <Text style={styles.meetingTitle}>{meeting.subject}</Text>
                  <View style={styles.timeLocationRow}>
                    <Text style={styles.timeText}>🕒 {meeting.timeRange}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.locationText}>
                      {meeting.meetingMode === 'In-Person Hub'
                        ? '🏢 In-Person Hub'
                        : meeting.meetingMode === 'Phone Call'
                        ? '📞 Phone Call'
                        : '🎥 Virtual Meet'}
                    </Text>
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
                <Text style={styles.moderatorLabel}>Assigned Chamber Facilitator:</Text>
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

                {meeting.status === 'CONFIRMED' && meeting.meetingUrl && (
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
              <View>
                <Text style={styles.detailsSubtitle}>FACILITATED SESSION DETAILS</Text>
                <Text style={styles.detailsTitle}>Consultation Overview</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedMeeting(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.detailSubject}>{selectedMeeting?.subject}</Text>

              {selectedMeeting?.category && (
                <View style={styles.detailFieldRow}>
                  <Text style={styles.detailFieldLabel}>Category:</Text>
                  <Text style={styles.detailFieldVal}>{selectedMeeting?.category}</Text>
                </View>
              )}

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Date & Slot:</Text>
                <Text style={[styles.detailFieldVal, { color: '#2563EB', fontWeight: '700' }]}>
                  {selectedMeeting?.dateTime}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Meeting Mode:</Text>
                <Text style={styles.detailFieldVal}>
                  {selectedMeeting?.meetingMode || 'Virtual Meet'}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Venue / Room:</Text>
                <Text style={styles.detailFieldVal}>{selectedMeeting?.meetingLinkOrLocation}</Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Facilitator:</Text>
                <Text style={styles.detailFieldVal}>{selectedMeeting?.ficModeratorName}</Text>
              </View>

              <View style={[styles.detailFieldRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 6 }]}>
                <Text style={[styles.detailFieldLabel, { width: '100%', marginBottom: 4 }]}>
                  Discussion Agenda & Scope:
                </Text>
                <Text style={[styles.detailFieldVal, { width: '100%', textAlign: 'left', lineHeight: 18, color: '#334155' }]}>
                  {selectedMeeting?.agenda || 'No detailed agenda provided.'}
                </Text>
              </View>
            </ScrollView>

            {selectedMeeting?.status === 'CONFIRMED' && selectedMeeting.meetingUrl && (
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

      {/* ============================================================== */}
      {/* Schedule Facilitated Consultation Form (Matching Website)     */}
      {/* ============================================================== */}
      <Modal
        visible={scheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setScheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTag}>FACILITATED SESSION</Text>
                <Text style={styles.modalSheetTitle}>Schedule Facilitated Consultation</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setScheduleModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Field 1: Consultation Category* */}
              <Text style={styles.inputLabel}>
                Consultation Category <Text style={styles.asterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdownSelector, formErrors.category && styles.inputErrorBorder]}
                activeOpacity={0.8}
                onPress={() => setCategoryPickerVisible(true)}
              >
                <Text style={styles.dropdownSelectorText}>{consultationCategory}</Text>
                <Text style={styles.dropdownChevron}>▼</Text>
              </TouchableOpacity>
              {formErrors.category && (
                <Text style={styles.inlineErrorText}>{formErrors.category}</Text>
              )}

              {/* Field 2: Topic or Subject* */}
              <Text style={styles.inputLabel}>
                Topic or Subject <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[styles.inputField, formErrors.topic && styles.inputErrorBorder]}
                placeholder="e.g. Cloud SaaS Architecture Alignment or Factory Modernization Scope"
                placeholderTextColor="#94A3B8"
                value={topicOrSubject}
                onChangeText={(text) => {
                  setTopicOrSubject(text);
                  if (formErrors.topic) setFormErrors((prev) => ({ ...prev, topic: undefined }));
                }}
              />
              {formErrors.topic && (
                <Text style={styles.inlineErrorText}>{formErrors.topic}</Text>
              )}

              {/* Field 3 & 4: Preferred Date* and Preferred Slot* (Mobile-Friendly 2-Column Row) */}
              <View style={styles.dateTimeRow}>
                {/* Preferred Date */}
                <View style={styles.dateTimeCol}>
                  <Text style={styles.inputLabel}>
                    Preferred Date <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[styles.dateSelectorBtn, formErrors.date && styles.inputErrorBorder]}
                    activeOpacity={0.8}
                    onPress={() => setDatePickerVisible(true)}
                  >
                    <Text style={{ fontSize: 13, marginRight: 6 }}>📅</Text>
                    <Text style={styles.dateSelectorText}>{preferredDate}</Text>
                  </TouchableOpacity>
                  {formErrors.date && (
                    <Text style={styles.inlineErrorText}>{formErrors.date}</Text>
                  )}
                </View>

                {/* Preferred Slot */}
                <View style={styles.dateTimeCol}>
                  <Text style={styles.inputLabel}>
                    Preferred Slot <Text style={styles.asterisk}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={[styles.slotSelectorBtn, formErrors.slot && styles.inputErrorBorder]}
                    activeOpacity={0.8}
                    onPress={() => setSlotPickerVisible(true)}
                  >
                    <Text style={{ fontSize: 13, marginRight: 6 }}>🕒</Text>
                    <Text style={styles.slotSelectorText} numberOfLines={1}>
                      {preferredSlot}
                    </Text>
                  </TouchableOpacity>
                  {formErrors.slot && (
                    <Text style={styles.inlineErrorText}>{formErrors.slot}</Text>
                  )}
                </View>
              </View>

              {/* Field 5: Meeting Mode* (3 Selectable Options, Single Select) */}
              <Text style={styles.inputLabel}>
                Meeting Mode <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.meetingModeRow}>
                {[
                  { id: 'Virtual Meet' as MeetingMode, label: 'Virtual Meet', icon: '📹', desc: 'Secure Google Meet' },
                  { id: 'In-Person Hub' as MeetingMode, label: 'In-Person Hub', icon: '🏢', desc: 'FIC Chamber Facility' },
                  { id: 'Phone Call' as MeetingMode, label: 'Phone Call', icon: '📞', desc: 'Telephonic Bridge' },
                ].map((mode) => {
                  const isSelected = meetingMode === mode.id;
                  return (
                    <TouchableOpacity
                      key={mode.id}
                      style={[styles.modeCard, isSelected && styles.modeCardActive]}
                      activeOpacity={0.8}
                      onPress={() => {
                        setMeetingMode(mode.id);
                        if (formErrors.mode) setFormErrors((prev) => ({ ...prev, mode: undefined }));
                      }}
                    >
                      <View style={[styles.modeRadioCircle, isSelected && styles.modeRadioCircleActive]}>
                        {isSelected && <View style={styles.modeRadioInner} />}
                      </View>
                      <Text style={{ fontSize: 16, marginTop: 4, marginBottom: 2 }}>{mode.icon}</Text>
                      <Text style={[styles.modeCardTitle, isSelected && styles.modeCardTitleActive]}>
                        {mode.label}
                      </Text>
                      <Text style={styles.modeCardSub}>{mode.desc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {formErrors.mode && (
                <Text style={styles.inlineErrorText}>{formErrors.mode}</Text>
              )}

              {/* Field 6: Discussion Agenda & Scope* */}
              <Text style={[styles.inputLabel, { marginTop: 4 }]}>
                Discussion Agenda & Scope <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField, formErrors.agenda && styles.inputErrorBorder]}
                placeholder="Outline key discussion points, required outcomes, and specific questions..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={discussionAgenda}
                onChangeText={(text) => {
                  setDiscussionAgenda(text);
                  if (formErrors.agenda) setFormErrors((prev) => ({ ...prev, agenda: undefined }));
                }}
              />
              {formErrors.agenda && (
                <Text style={styles.inlineErrorText}>{formErrors.agenda}</Text>
              )}

              {/* FIC Governance Protocol Box */}
              <View style={styles.governanceNoticeBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, marginRight: 6 }}>🛡️</Text>
                  <Text style={styles.governanceTitle}>FIC Chamber Governance Protocol</Text>
                </View>
                <Text style={styles.governanceText}>
                  All facilitated consultations are reviewed and coordinated by an assigned FIC Coordinating Officer. Direct meeting links and calendar invites are dispatched following bilateral counterparty alignment.
                </Text>
              </View>

              {/* Confirm Consultation Request Button */}
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                activeOpacity={0.88}
                onPress={handleConfirmConsultationRequest}
              >
                <Text style={styles.modalSubmitBtnText}>Confirm Consultation Request</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* Category Dropdown Picker Modal                                  */}
      {/* ============================================================== */}
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setCategoryPickerVisible(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Consultation Category</Text>
              <TouchableOpacity onPress={() => setCategoryPickerVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CONSULTATION_CATEGORIES.map((cat) => {
                const isSelected = consultationCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setConsultationCategory(cat);
                      setCategoryPickerVisible(false);
                      if (formErrors.category) {
                        setFormErrors((prev) => ({ ...prev, category: undefined }));
                      }
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {cat}
                    </Text>
                    {isSelected && <Text style={{ color: '#2563EB', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============================================================== */}
      {/* Slot Dropdown Picker Modal                                      */}
      {/* ============================================================== */}
      <Modal
        visible={slotPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSlotPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setSlotPickerVisible(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Preferred Slot</Text>
              <TouchableOpacity onPress={() => setSlotPickerVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {PREFERRED_TIME_SLOTS.map((slot) => {
                const isSelected = preferredSlot === slot;
                return (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPreferredSlot(slot);
                      setSlotPickerVisible(false);
                      if (formErrors.slot) {
                        setFormErrors((prev) => ({ ...prev, slot: undefined }));
                      }
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      🕒 {slot}
                    </Text>
                    {isSelected && <Text style={{ color: '#2563EB', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ============================================================== */}
      {/* Date Picker Modal (Prevents selecting past dates)               */}
      {/* ============================================================== */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setDatePickerVisible(false)}
        >
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Preferred Date</Text>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12, fontFamily: fontSansSerif }}>
              Choose a date for your consultation (past dates are disabled):
            </Text>

            {/* Quick Date Pills */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {[
                { label: 'Tomorrow', days: 1 },
                { label: '+2 Days', days: 2 },
                { label: '+3 Days', days: 3 },
                { label: 'Next Week', days: 7 },
                { label: '+2 Weeks', days: 14 },
              ].map((q) => {
                const d = new Date();
                d.setDate(d.getDate() + q.days);
                const formatted = formatDDMMYYYY(d);
                const isCurrent = preferredDate === formatted;
                return (
                  <TouchableOpacity
                    key={q.label}
                    style={[
                      styles.quickDatePill,
                      isCurrent && styles.quickDatePillActive,
                    ]}
                    activeOpacity={0.75}
                    onPress={() => handleQuickDateSelect(q.days)}
                  >
                    <Text style={[styles.quickDatePillText, isCurrent && styles.quickDatePillTextActive]}>
                      {q.label} ({formatted.slice(0, 5)})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Date Input in DD-MM-YYYY format */}
            <Text style={styles.inputLabel}>Enter or Edit Date (DD-MM-YYYY)</Text>
            <TextInput
              style={styles.inputField}
              value={preferredDate}
              placeholder="DD-MM-YYYY"
              placeholderTextColor="#94A3B8"
              onChangeText={(val) => {
                setPreferredDate(val);
                if (formErrors.date) setFormErrors((prev) => ({ ...prev, date: undefined }));
              }}
            />

            <TouchableOpacity
              style={styles.pickerDoneBtn}
              activeOpacity={0.88}
              onPress={() => {
                if (isPastDate(preferredDate)) {
                  setFormErrors((prev) => ({ ...prev, date: 'Preferred date cannot be in the past.' }));
                  notify.warning('Please select a future date.', 'Past Date Not Allowed');
                } else {
                  setDatePickerVisible(false);
                }
              }}
            >
              <Text style={styles.pickerDoneBtnText}>Set Preferred Date</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
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
  scheduleActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scheduleActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: fontSansSerif,
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
  },
  meetingInfoCol: {
    flex: 1,
  },
  categoryPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 3,
    fontFamily: fontSansSerif,
  },
  meetingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 4,
  },
  timeLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeText: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  metaDivider: {
    fontSize: 11.5,
    color: '#CBD5E1',
    marginHorizontal: 6,
  },
  locationText: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: fontSansSerif,
  },
  statusConfirmed: {
    backgroundColor: '#ECFDF5',
  },
  statusTextConfirmed: {
    color: '#059669',
  },
  statusCompleted: {
    backgroundColor: '#EFF6FF',
  },
  statusTextCompleted: {
    color: '#2563EB',
  },
  statusScheduled: {
    backgroundColor: '#FEF3C7',
  },
  statusTextScheduled: {
    color: '#B45309',
  },
  moderatorBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
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
    fontSize: 11.5,
    color: '#475569',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
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
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  // Modal Overlays
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '90%',
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
  modalHeaderTag: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  modalSheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  // Form Field Styles
  inputLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  asterisk: {
    color: '#EF4444',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 12,
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  inlineErrorText: {
    fontSize: 11,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 2,
    fontFamily: fontSansSerif,
  },
  textAreaField: {
    height: 95,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
  },
  dropdownSelectorText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    flex: 1,
  },
  dropdownChevron: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 8,
  },
  // Date & Time Row
  dateTimeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  dateTimeCol: {
    flex: 1,
  },
  dateSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginBottom: 12,
  },
  dateSelectorText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  slotSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 11,
    marginBottom: 12,
  },
  slotSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    flex: 1,
  },
  // Meeting Mode
  meetingModeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  modeCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  modeRadioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  modeRadioCircleActive: {
    borderColor: '#2563EB',
  },
  modeRadioInner: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2563EB',
  },
  modeCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    fontFamily: fontSansSerif,
  },
  modeCardTitleActive: {
    color: '#1D4ED8',
  },
  modeCardSub: {
    fontSize: 9.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  // Governance Notice Box
  governanceNoticeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 12,
    marginBottom: 16,
  },
  governanceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
  },
  governanceText: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
  // Submit Button
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 6,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  // Details Modal
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    maxHeight: '80%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailsSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.8,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  detailsBody: {
    marginBottom: 14,
  },
  detailSubject: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 10,
  },
  detailFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailFieldLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: fontSansSerif,
    width: '35%',
  },
  detailFieldVal: {
    fontSize: 12,
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
  // Picker Sheets
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    maxHeight: '75%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
  },
  pickerItemText: {
    fontSize: 13,
    color: '#1E293B',
    fontFamily: fontSansSerif,
  },
  pickerItemTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  quickDatePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickDatePillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  quickDatePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  quickDatePillTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  pickerDoneBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 6,
  },
  pickerDoneBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
});
