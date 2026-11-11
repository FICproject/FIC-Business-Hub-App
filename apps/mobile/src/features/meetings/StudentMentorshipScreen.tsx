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
  Linking,
} from 'react-native';
import { StandardHeader } from '../../components/common/StandardHeader';
import { useAuth } from '../../state/AuthContext';
import { useStudentMentor, ConsultationBooking, VerifiedMentor } from '../../state/StudentMentorContext';
import { notify } from '../../components/common/NotificationContext';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface StudentMentorshipScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
  initialAction?: string;
}

export const MENTORSHIP_PURPOSES = [
  'Career Guidance & Placement Roadmap',
  'Subject & Tech Stack Clarification',
  'Capstone / Academic Project Review',
  'Skill Development & Certifications',
  'Student Startup & Incubation',
  'Higher Studies & Research',
  'Other Guidance',
];

export const ACADEMIC_LEVELS = [
  'Undergraduate (1st - 4th Year)',
  'Postgraduate (Master\'s / MBA)',
  'Diploma / Polytechnic',
  'Higher Secondary (+2)',
  'PhD / Research Scholar',
];

export const PREFERRED_STUDENT_SLOTS = [
  '11:00 AM IST (Morning)',
  '03:00 PM IST (Afternoon)',
  '05:30 PM IST (Evening)',
  '06:30 PM IST (Evening)',
  '08:00 PM IST (Night)',
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
  if (!parsed) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parsed < today;
};

const getTomorrowDate = (): string => {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return formatDDMMYYYY(t);
};

// ==========================================
// Custom Clean Vector Icons
// ==========================================
const PurpleCalendarIcon = () => (
  <View style={iconStyles.boxPurple}>
    <View style={iconStyles.calendarTopBar} />
    <View style={iconStyles.calendarBody}>
      <View style={iconStyles.calendarGridDot} />
      <View style={iconStyles.calendarGridDot} />
      <View style={iconStyles.calendarGridDot} />
      <View style={iconStyles.calendarGridDot} />
    </View>
  </View>
);

const OrangeClockIcon = () => (
  <View style={iconStyles.boxOrange}>
    <View style={iconStyles.clockCircle}>
      <View style={iconStyles.clockHourHand} />
      <View style={iconStyles.clockMinuteHand} />
    </View>
  </View>
);

const YellowAlertIcon = () => (
  <View style={iconStyles.boxYellow}>
    <View style={iconStyles.alertTriangle}>
      <Text style={iconStyles.alertMark}>!</Text>
    </View>
  </View>
);

const PurpleCheckIcon = () => (
  <View style={iconStyles.boxPurple}>
    <View style={iconStyles.checkCircle}>
      <Text style={iconStyles.checkMark}>✓</Text>
    </View>
  </View>
);

const VideoCameraIcon = () => (
  <View style={iconStyles.videoCam}>
    <View style={iconStyles.videoBody} />
    <View style={iconStyles.videoLens} />
  </View>
);

export const StudentMentorshipScreen: React.FC<StudentMentorshipScreenProps> = ({
  onBack,
  onNavigateToModule,
  initialAction,
}) => {
  const { user } = useAuth();
  const {
    mentors,
    consultations,
    bookConsultation,
    studentAcceptReschedule,
    studentDeclineReschedule,
  } = useStudentMentor();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UPCOMING' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationBooking | null>(null);

  // Book a Mentor Modal state
  const [bookModalVisible, setBookModalVisible] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<VerifiedMentor | null>(mentors[0] || null);
  const [purpose, setPurpose] = useState(MENTORSHIP_PURPOSES[0]);
  const [academicLevel, setAcademicLevel] = useState(ACADEMIC_LEVELS[0]);
  const [topic, setTopic] = useState('');
  const [preferredDate, setPreferredDate] = useState(getTomorrowDate());
  const [preferredSlot, setPreferredSlot] = useState(PREFERRED_STUDENT_SLOTS[2]); // 05:30 PM IST
  const [meetingMode, setMeetingMode] = useState<'Virtual Video Meet' | 'In-Person Hub Meet'>('Virtual Video Meet');
  const [doubts, setDoubts] = useState('');

  // Dropdown Pickers
  const [mentorPickerVisible, setMentorPickerVisible] = useState(false);
  const [purposePickerVisible, setPurposePickerVisible] = useState(false);
  const [levelPickerVisible, setLevelPickerVisible] = useState(false);
  const [slotPickerVisible, setSlotPickerVisible] = useState(false);

  // Form Errors
  const [formErrors, setFormErrors] = useState<{
    mentor?: string;
    topic?: string;
    date?: string;
    doubts?: string;
  }>({});

  // Auto-open modal if initialAction is 'BOOK_MENTOR'
  useEffect(() => {
    if (initialAction === 'BOOK_MENTOR') {
      handleOpenBookModal();
    }
  }, [initialAction]);

  // Sync selectedMentor when mentors array becomes available
  useEffect(() => {
    if (!selectedMentor && mentors.length > 0) {
      setSelectedMentor(mentors[0]);
    }
  }, [mentors, selectedMentor]);

  const handleOpenBookModal = () => {
    setFormErrors({});
    if (!selectedMentor && mentors.length > 0) {
      setSelectedMentor(mentors[0]);
    }
    setPreferredDate(getTomorrowDate());
    setBookModalVisible(true);
  };

  const handleQuickDateSelect = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setPreferredDate(formatDDMMYYYY(d));
    if (formErrors.date) {
      setFormErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const validateBookingForm = (): boolean => {
    const errors: typeof formErrors = {};

    if (!selectedMentor) {
      errors.mentor = 'Please select an accredited mentor.';
    }
    if (!topic.trim()) {
      errors.topic = 'Discussion topic or title is required.';
    }
    if (!preferredDate.trim()) {
      errors.date = 'Preferred date is required (DD-MM-YYYY).';
    } else if (isPastDate(preferredDate)) {
      errors.date = 'Preferred date cannot be in the past.';
    }
    if (!doubts.trim()) {
      errors.doubts = 'Please describe your specific questions or doubts.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleConfirmBooking = () => {
    if (!validateBookingForm()) {
      notify.warning('Please complete all mandatory fields with valid details.', 'Required Fields Missing');
      return;
    }

    if (!selectedMentor) return;

    bookConsultation({
      mentorId: selectedMentor.id,
      mentorName: selectedMentor.name,
      topic: topic.trim(),
      domain: selectedMentor.domain,
      preferredDate,
      preferredTime: preferredSlot,
      duration: '45 mins',
      agenda: `${doubts.trim()} [Level: ${academicLevel} | Purpose: ${purpose} | Mode: ${meetingMode}]`,
    });

    notify.success(
      `Mentorship request sent to ${selectedMentor.name}! Awaiting mentor confirmation.`,
      'Session Requested'
    );

    // Reset and close
    setTopic('');
    setDoubts('');
    setBookModalVisible(false);
  };

  const handleJoinMeeting = (meetingUrl?: string) => {
    const targetUrl = meetingUrl || 'https://meet.google.com/fic-mentor-session';
    Linking.openURL(targetUrl).catch(() => {
      notify.warning('Could not open video meeting link in your browser.', 'Link Error');
    });
  };

  // KPI Counts
  const totalBookings = consultations.length;
  const confirmedCount = consultations.filter((c) => c.status === 'ACCEPTED').length;
  const pendingCount = consultations.filter(
    (c) => c.status === 'PENDING' || c.status === 'RESCHEDULE_PROPOSED'
  ).length;
  const completedCount = consultations.filter((c) => c.status === 'COMPLETED').length;

  // Filtered consultations
  const filteredConsultations = consultations.filter((c) => {
    if (activeFilter === 'UPCOMING') return c.status === 'ACCEPTED';
    if (activeFilter === 'PENDING') return c.status === 'PENDING' || c.status === 'RESCHEDULE_PROPOSED';
    if (activeFilter === 'COMPLETED') return c.status === 'COMPLETED';
    return true; // 'ALL'
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Student Mentorship"
        subtitle="Sessions & Consultations"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Meetings"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ========================================================
            1. HEADER BANNER SECTION
           ======================================================== */}
        <View style={styles.headerCard}>
          <View style={styles.headerBadgeRow}>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>STUDENT ACCELERATOR</Text>
            </View>
            <Text style={styles.headerIdText}>FIC Mentorship Chamber</Text>
          </View>
          <Text style={styles.headerTitle}>Student Mentorship Sessions & Consultations</Text>
          <Text style={styles.headerSubtitle}>
            Schedule 1-on-1 strategy sessions with accredited industry and academic mentors, track confirmed slots, and review session notes.
          </Text>

          <TouchableOpacity
            style={styles.bookActionBtn}
            activeOpacity={0.88}
            onPress={handleOpenBookModal}
          >
            <Text style={styles.bookActionBtnText}>+ Book a Mentor</Text>
          </TouchableOpacity>
        </View>

        {/* ========================================================
            2. 4 KPI CARDS (2x2 GRID)
           ======================================================== */}
        <View style={styles.kpiGrid}>
          {/* Card 1: Mentor Bookings */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <PurpleCalendarIcon />
              <View style={[styles.kpiBadge, { backgroundColor: '#F3EEFA' }]}>
                <Text style={[styles.kpiBadgeText, { color: '#8064A9' }]}>Sessions</Text>
              </View>
            </View>
            <Text style={styles.kpiCount}>{totalBookings}</Text>
            <Text style={styles.kpiTitle}>Mentor Bookings</Text>
            <Text style={styles.kpiSubtitle}>Total Requested</Text>
          </View>

          {/* Card 2: Confirmed Upcoming */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <OrangeClockIcon />
              <View style={[styles.kpiBadge, { backgroundColor: '#FFF7ED' }]}>
                <Text style={[styles.kpiBadgeText, { color: '#F97316' }]}>Confirmed</Text>
              </View>
            </View>
            <Text style={styles.kpiCount}>{confirmedCount}</Text>
            <Text style={styles.kpiTitle}>Confirmed Upcoming</Text>
            <Text style={styles.kpiSubtitle}>Ready to join</Text>
          </View>

          {/* Card 3: Pending Coordination */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <YellowAlertIcon />
              <View style={[styles.kpiBadge, { backgroundColor: '#FEFCE8' }]}>
                <Text style={[styles.kpiBadgeText, { color: '#CA8A04' }]}>Pending</Text>
              </View>
            </View>
            <Text style={styles.kpiCount}>{pendingCount}</Text>
            <Text style={styles.kpiTitle}>Pending Coordination</Text>
            <Text style={styles.kpiSubtitle}>Awaiting response</Text>
          </View>

          {/* Card 4: Completed Sessions */}
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <PurpleCheckIcon />
              <View style={[styles.kpiBadge, { backgroundColor: '#F3EEFA' }]}>
                <Text style={[styles.kpiBadgeText, { color: '#8064A9' }]}>Finished</Text>
              </View>
            </View>
            <Text style={styles.kpiCount}>{completedCount}</Text>
            <Text style={styles.kpiTitle}>Completed Sessions</Text>
            <Text style={styles.kpiSubtitle}>Advisory logged</Text>
          </View>
        </View>

        {/* ========================================================
            3. FILTER BUTTONS ROW
           ======================================================== */}
        <View style={styles.filterTabsRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {[
              { key: 'ALL', label: `All (${totalBookings})` },
              { key: 'UPCOMING', label: `Upcoming / Confirmed (${confirmedCount})` },
              { key: 'PENDING', label: `Pending (${pendingCount})` },
              { key: 'COMPLETED', label: `Completed (${completedCount})` },
            ].map((tab) => {
              const isActive = activeFilter === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.filterTab, isActive && styles.filterTabActive]}
                  activeOpacity={0.7}
                  onPress={() => setActiveFilter(tab.key as any)}
                >
                  <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ========================================================
            4. SESSION CARDS LIST OR EMPTY STATE
           ======================================================== */}
        {filteredConsultations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🎓</Text>
            <Text style={styles.emptyTitle}>No Mentorship Sessions Found</Text>
            <Text style={styles.emptySubtitle}>
              You haven't scheduled any 1-on-1 mentorship sessions yet. Connect with accredited industry and academic mentors to guide your tech stack, project review, or career goals.
            </Text>
            <TouchableOpacity
              style={styles.emptyBookBtn}
              activeOpacity={0.88}
              onPress={handleOpenBookModal}
            >
              <Text style={styles.emptyBookBtnText}>+ Book Your First Mentor Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredConsultations.map((c) => {
            const isPending = c.status === 'PENDING';
            const isConfirmed = c.status === 'ACCEPTED';
            const isRescheduled = c.status === 'RESCHEDULE_PROPOSED';
            const isCompleted = c.status === 'COMPLETED';
            const isRejected = c.status === 'REJECTED';

            return (
              <View key={c.id} style={styles.sessionCard}>
                {/* Top Row: Purpose Badge, Booking ID, and Status Pill */}
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={styles.idPurposeRow}>
                      <View style={styles.purposeBadge}>
                        <Text style={styles.purposeBadgeText}>{c.domain || 'ACADEMIC GUIDANCE'}</Text>
                      </View>
                      <Text style={styles.bookingIdText}>#{c.id}</Text>
                    </View>
                    <Text style={styles.sessionTopicTitle}>{c.topic}</Text>
                  </View>

                  {/* Status Pill */}
                  <View
                    style={[
                      styles.statusPill,
                      isConfirmed && styles.statusPillConfirmed,
                      isPending && styles.statusPillPending,
                      isRescheduled && styles.statusPillRescheduled,
                      isCompleted && styles.statusPillCompleted,
                      isRejected && styles.statusPillRejected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isConfirmed && styles.statusTextConfirmed,
                        isPending && styles.statusTextPending,
                        isRescheduled && styles.statusTextRescheduled,
                        isCompleted && styles.statusTextCompleted,
                        isRejected && styles.statusTextRejected,
                      ]}
                    >
                      {isConfirmed
                        ? 'Confirmed & Scheduled'
                        : isPending
                        ? 'Pending Confirmation'
                        : isRescheduled
                        ? 'Reschedule Proposal'
                        : isCompleted
                        ? 'Completed'
                        : 'Declined'}
                    </Text>
                  </View>
                </View>

                {/* Details Grid (4 Items) */}
                <View style={styles.detailsGrid}>
                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Mentor:</Text>
                    <Text style={styles.detailGridValBold}>{c.mentorName}</Text>
                  </View>

                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Requested Slot:</Text>
                    <Text style={styles.detailGridVal}>
                      {c.requestedDate} • {c.requestedTime}
                    </Text>
                  </View>

                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Confirmed Slot:</Text>
                    <Text style={[styles.detailGridVal, isConfirmed && { color: '#16A34A', fontWeight: '700' }]}>
                      {c.confirmedDate ? `${c.confirmedDate} • ${c.confirmedTime}` : 'Not confirmed'}
                    </Text>
                  </View>

                  <View style={styles.detailGridItem}>
                    <Text style={styles.detailGridLabel}>Meeting Mode:</Text>
                    <Text style={styles.detailGridVal}>{c.meetingMode || 'Virtual Video Meet'}</Text>
                  </View>
                </View>

                {/* Doubts / Discussion Scope Box */}
                {c.agenda && (
                  <View style={styles.doubtsBox}>
                    <Text style={styles.doubtsLabel}>Discussion Scope & Questions:</Text>
                    <Text style={styles.doubtsText}>{c.agenda}</Text>
                  </View>
                )}

                {/* Reschedule Proposal Box */}
                {isRescheduled && (
                  <View style={styles.rescheduleBox}>
                    <Text style={styles.rescheduleHeader}>
                      🕒 Mentor Proposed New Slot: {c.proposedDate} at {c.proposedTime}
                    </Text>
                    {c.rescheduleNotes && (
                      <Text style={styles.rescheduleNotes}>"{c.rescheduleNotes}"</Text>
                    )}
                    <View style={styles.rescheduleActionsRow}>
                      <TouchableOpacity
                        style={styles.acceptSlotBtn}
                        activeOpacity={0.88}
                        onPress={() => {
                          studentAcceptReschedule(c.id);
                          notify.success('Rescheduled session confirmed! Slot updated.', 'Slot Accepted');
                        }}
                      >
                        <Text style={styles.acceptSlotBtnText}>Accept New Slot</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.declineSlotBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          studentDeclineReschedule(c.id);
                          notify.info('Reschedule proposal declined.', 'Declined');
                        }}
                      >
                        <Text style={styles.declineSlotBtnText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Mentor Notes (if any) */}
                {c.mentorNotes && (
                  <View style={styles.mentorNotesBox}>
                    <Text style={styles.mentorNotesLabel}>Mentor Note:</Text>
                    <Text style={styles.mentorNotesText}>{c.mentorNotes}</Text>
                  </View>
                )}

                {/* Action Buttons Row */}
                <View style={styles.cardActionsRow}>
                  {isConfirmed && (
                    <TouchableOpacity
                      style={styles.joinVirtualBtn}
                      activeOpacity={0.88}
                      onPress={() => handleJoinMeeting(c.meetingUrl)}
                    >
                      <VideoCameraIcon />
                      <Text style={styles.joinVirtualBtnText}>Join Virtual Session</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.viewDetailsBtn}
                    activeOpacity={0.7}
                    onPress={() => setSelectedConsultation(c)}
                  >
                    <Text style={styles.viewDetailsBtnText}>
                      {isCompleted ? 'View Summary & Study Materials' : 'View Details'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ========================================================
          5. BOOK A MENTOR MODAL
         ======================================================== */}
      <Modal
        visible={bookModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBookModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalHeaderTag}>1-ON-1 GUIDANCE</Text>
                <Text style={styles.modalSheetTitle}>Book a Mentor</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setBookModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25 }}>
              {/* Field 1: Accredited Mentor */}
              <Text style={styles.inputLabel}>
                Select Accredited Mentor <Text style={styles.asterisk}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdownSelector, formErrors.mentor && styles.inputErrorBorder]}
                activeOpacity={0.8}
                onPress={() => setMentorPickerVisible(true)}
              >
                <Text style={styles.dropdownSelectorText}>
                  {selectedMentor ? `${selectedMentor.name} (${selectedMentor.domain})` : '-- Choose Mentor --'}
                </Text>
                <Text style={styles.dropdownChevron}>▼</Text>
              </TouchableOpacity>
              {formErrors.mentor && <Text style={styles.inlineErrorText}>{formErrors.mentor}</Text>}

              {/* Field 2: Consultation Purpose */}
              <Text style={styles.inputLabel}>Consultation Purpose *</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                activeOpacity={0.8}
                onPress={() => setPurposePickerVisible(true)}
              >
                <Text style={styles.dropdownSelectorText}>{purpose}</Text>
                <Text style={styles.dropdownChevron}>▼</Text>
              </TouchableOpacity>

              {/* Field 3: Academic Level */}
              <Text style={styles.inputLabel}>Current Academic Level *</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                activeOpacity={0.8}
                onPress={() => setLevelPickerVisible(true)}
              >
                <Text style={styles.dropdownSelectorText}>{academicLevel}</Text>
                <Text style={styles.dropdownChevron}>▼</Text>
              </TouchableOpacity>

              {/* Field 4: Discussion Topic */}
              <Text style={styles.inputLabel}>
                Discussion Topic / Title <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, formErrors.topic && styles.inputErrorBorder]}
                placeholder="e.g. Full-Stack Career Roadmap & GitHub Portfolio Review"
                placeholderTextColor="#94A3B8"
                value={topic}
                onChangeText={(t) => {
                  setTopic(t);
                  if (formErrors.topic) setFormErrors((prev) => ({ ...prev, topic: undefined }));
                }}
              />
              {formErrors.topic && <Text style={styles.inlineErrorText}>{formErrors.topic}</Text>}

              {/* Field 5: Preferred Date */}
              <Text style={styles.inputLabel}>
                Preferred Date (DD-MM-YYYY) <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, formErrors.date && styles.inputErrorBorder]}
                placeholder="DD-MM-YYYY"
                placeholderTextColor="#94A3B8"
                value={preferredDate}
                onChangeText={(d) => {
                  setPreferredDate(d);
                  if (formErrors.date) setFormErrors((prev) => ({ ...prev, date: undefined }));
                }}
              />
              {formErrors.date && <Text style={styles.inlineErrorText}>{formErrors.date}</Text>}

              {/* Quick Date Chips */}
              <View style={styles.quickDateRow}>
                <TouchableOpacity
                  style={styles.quickDateChip}
                  activeOpacity={0.7}
                  onPress={() => handleQuickDateSelect(1)}
                >
                  <Text style={styles.quickDateChipText}>Tomorrow</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateChip}
                  activeOpacity={0.7}
                  onPress={() => handleQuickDateSelect(3)}
                >
                  <Text style={styles.quickDateChipText}>In 3 Days</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickDateChip}
                  activeOpacity={0.7}
                  onPress={() => handleQuickDateSelect(7)}
                >
                  <Text style={styles.quickDateChipText}>Next Week</Text>
                </TouchableOpacity>
              </View>

              {/* Field 6: Preferred Time Slot */}
              <Text style={styles.inputLabel}>Preferred Time Slot *</Text>
              <TouchableOpacity
                style={styles.dropdownSelector}
                activeOpacity={0.8}
                onPress={() => setSlotPickerVisible(true)}
              >
                <Text style={styles.dropdownSelectorText}>{preferredSlot}</Text>
                <Text style={styles.dropdownChevron}>▼</Text>
              </TouchableOpacity>

              {/* Field 7: Meeting Mode */}
              <Text style={styles.inputLabel}>Meeting Mode *</Text>
              <View style={styles.modeToggleRow}>
                {(['Virtual Video Meet', 'In-Person Hub Meet'] as const).map((mode) => {
                  const isSel = meetingMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.modeToggleBtn, isSel && styles.modeToggleBtnActive]}
                      activeOpacity={0.8}
                      onPress={() => setMeetingMode(mode)}
                    >
                      <Text style={[styles.modeToggleText, isSel && styles.modeToggleTextActive]}>
                        {mode === 'Virtual Video Meet' ? '🎥 ' + mode : '🏢 ' + mode}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Field 8: Doubts / Specific questions */}
              <Text style={styles.inputLabel}>
                What specific doubts or questions do you want to cover? <Text style={styles.asterisk}>*</Text>
              </Text>
              <TextInput
                style={[styles.textArea, formErrors.doubts && styles.inputErrorBorder]}
                placeholder="Explain your current preparation, code architecture questions, or career goals..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={doubts}
                onChangeText={(d) => {
                  setDoubts(d);
                  if (formErrors.doubts) setFormErrors((prev) => ({ ...prev, doubts: undefined }));
                }}
              />
              {formErrors.doubts && <Text style={styles.inlineErrorText}>{formErrors.doubts}</Text>}

              {/* Submit Buttons */}
              <View style={styles.formActionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  activeOpacity={0.7}
                  onPress={() => setBookModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitBtn}
                  activeOpacity={0.88}
                  onPress={handleConfirmBooking}
                >
                  <Text style={styles.submitBtnText}>Submit Mentorship Request</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          6. MENTOR PICKER MODAL
         ======================================================== */}
      <Modal
        visible={mentorPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMentorPickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Accredited Mentor</Text>
              <TouchableOpacity onPress={() => setMentorPickerVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {mentors.map((m) => {
                const isSelected = selectedMentor?.id === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setSelectedMentor(m);
                      setMentorPickerVisible(false);
                      if (formErrors.mentor) {
                        setFormErrors((prev) => ({ ...prev, mentor: undefined }));
                      }
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                        {m.name}
                      </Text>
                      <Text style={styles.pickerItemSub}>
                        {m.title} • {m.experienceYears}y exp • ⭐ {m.rating}
                      </Text>
                    </View>
                    {isSelected && <Text style={{ color: '#8064A9', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          7. PURPOSE PICKER MODAL
         ======================================================== */}
      <Modal
        visible={purposePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPurposePickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Consultation Purpose</Text>
              <TouchableOpacity onPress={() => setPurposePickerVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MENTORSHIP_PURPOSES.map((p) => {
                const isSelected = purpose === p;
                return (
                  <TouchableOpacity
                    key={p}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPurpose(p);
                      setPurposePickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {p}
                    </Text>
                    {isSelected && <Text style={{ color: '#8064A9', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          8. ACADEMIC LEVEL PICKER MODAL
         ======================================================== */}
      <Modal
        visible={levelPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLevelPickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Current Academic Level</Text>
              <TouchableOpacity onPress={() => setLevelPickerVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ACADEMIC_LEVELS.map((lvl) => {
                const isSelected = academicLevel === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setAcademicLevel(lvl);
                      setLevelPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {lvl}
                    </Text>
                    {isSelected && <Text style={{ color: '#8064A9', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          9. TIME SLOT PICKER MODAL
         ======================================================== */}
      <Modal
        visible={slotPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSlotPickerVisible(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Preferred Time Slot</Text>
              <TouchableOpacity onPress={() => setSlotPickerVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {PREFERRED_STUDENT_SLOTS.map((s) => {
                const isSelected = preferredSlot === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setPreferredSlot(s);
                      setSlotPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {s}
                    </Text>
                    {isSelected && <Text style={{ color: '#8064A9', fontWeight: '800' }}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================
          10. VIEW DETAILS / SUMMARY MODAL
         ======================================================== */}
      <Modal
        visible={!!selectedConsultation}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedConsultation(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsCard}>
            <View style={styles.detailsHeader}>
              <View>
                <Text style={styles.detailsSubtitle}>1-ON-1 MENTORSHIP SESSION</Text>
                <Text style={styles.detailsTitle}>
                  {selectedConsultation?.status === 'COMPLETED'
                    ? 'Session Notes & Study Materials'
                    : 'Session Overview'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedConsultation(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailsBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.detailSubject}>{selectedConsultation?.topic}</Text>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Booking ID:</Text>
                <Text style={[styles.detailFieldVal, { fontFamily: 'monospace' }]}>
                  #{selectedConsultation?.id}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Accredited Mentor:</Text>
                <Text style={[styles.detailFieldVal, { color: '#8064A9', fontWeight: '700' }]}>
                  {selectedConsultation?.mentorName}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Domain & Sector:</Text>
                <Text style={styles.detailFieldVal}>{selectedConsultation?.domain}</Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Requested Slot:</Text>
                <Text style={styles.detailFieldVal}>
                  {selectedConsultation?.requestedDate} • {selectedConsultation?.requestedTime}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Confirmed Slot:</Text>
                <Text style={[styles.detailFieldVal, { color: '#16A34A', fontWeight: '700' }]}>
                  {selectedConsultation?.confirmedDate
                    ? `${selectedConsultation.confirmedDate} • ${selectedConsultation.confirmedTime}`
                    : 'Awaiting confirmation'}
                </Text>
              </View>

              <View style={styles.detailFieldRow}>
                <Text style={styles.detailFieldLabel}>Meeting Mode:</Text>
                <Text style={styles.detailFieldVal}>
                  {selectedConsultation?.meetingMode || 'Virtual Video Meet'}
                </Text>
              </View>

              <View style={[styles.detailFieldRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }]}>
                <Text style={[styles.detailFieldLabel, { width: '100%', marginBottom: 4 }]}>
                  Discussion Agenda & Doubts:
                </Text>
                <Text style={[styles.detailFieldVal, { width: '100%', textAlign: 'left', lineHeight: 18, color: '#334155' }]}>
                  {selectedConsultation?.agenda || 'No specific notes recorded.'}
                </Text>
              </View>

              {selectedConsultation?.mentorNotes && (
                <View style={[styles.detailFieldRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }]}>
                  <Text style={[styles.detailFieldLabel, { width: '100%', marginBottom: 4, color: '#059669' }]}>
                    Mentor Notes:
                  </Text>
                  <Text style={[styles.detailFieldVal, { width: '100%', textAlign: 'left', lineHeight: 18, color: '#065F46' }]}>
                    {selectedConsultation?.mentorNotes}
                  </Text>
                </View>
              )}

              {selectedConsultation?.completionSummary && (
                <View style={[styles.detailFieldRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }]}>
                  <Text style={[styles.detailFieldLabel, { width: '100%', marginBottom: 4, color: '#8064A9' }]}>
                    Advisory Summary:
                  </Text>
                  <Text style={[styles.detailFieldVal, { width: '100%', textAlign: 'left', lineHeight: 18, color: '#1E293B' }]}>
                    {selectedConsultation.completionSummary}
                  </Text>
                </View>
              )}

              {selectedConsultation?.recommendedMaterials && (
                <View style={[styles.detailFieldRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }]}>
                  <Text style={[styles.detailFieldLabel, { width: '100%', marginBottom: 4, color: '#2563EB' }]}>
                    Recommended Study Materials & Links:
                  </Text>
                  <Text style={[styles.detailFieldVal, { width: '100%', textAlign: 'left', lineHeight: 18, color: '#1E293B' }]}>
                    {selectedConsultation.recommendedMaterials}
                  </Text>
                </View>
              )}

              {selectedConsultation?.followUpGuidance && (
                <View style={[styles.detailFieldRow, { flexDirection: 'column', alignItems: 'flex-start', marginTop: 8 }]}>
                  <Text style={[styles.detailFieldLabel, { width: '100%', marginBottom: 4, color: '#D97706' }]}>
                    Follow-Up Action Plan:
                  </Text>
                  <Text style={[styles.detailFieldVal, { width: '100%', textAlign: 'left', lineHeight: 18, color: '#92400E' }]}>
                    {selectedConsultation.followUpGuidance}
                  </Text>
                </View>
              )}
            </ScrollView>

            {selectedConsultation?.status === 'ACCEPTED' && (
              <TouchableOpacity
                style={styles.modalJoinBtn}
                activeOpacity={0.88}
                onPress={() => {
                  const url = selectedConsultation.meetingUrl;
                  setSelectedConsultation(null);
                  handleJoinMeeting(url);
                }}
              >
                <Text style={styles.modalJoinBtnText}>Join Virtual Session Now →</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ==========================================
// Vector Icon Styles
// ==========================================
const iconStyles = StyleSheet.create({
  boxPurple: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3EEFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOrange: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxYellow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FEFCE8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarTopBar: {
    width: 18,
    height: 4,
    backgroundColor: '#8064A9',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  calendarBody: {
    width: 18,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#8064A9',
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 1.5,
  },
  calendarGridDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#8064A9',
  },
  clockCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clockHourHand: {
    position: 'absolute',
    top: 5,
    width: 2,
    height: 5,
    backgroundColor: '#F97316',
    borderRadius: 1,
  },
  clockMinuteHand: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 5,
    height: 2,
    backgroundColor: '#F97316',
    borderRadius: 1,
  },
  alertTriangle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CA8A04',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertMark: {
    fontSize: 12,
    fontWeight: '900',
    color: '#CA8A04',
    lineHeight: 14,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#8064A9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  videoCam: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  videoBody: {
    width: 12,
    height: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  videoLens: {
    width: 0,
    height: 0,
    borderTopWidth: 4,
    borderTopColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: 'transparent',
    borderRightWidth: 5,
    borderRightColor: '#FFFFFF',
    marginLeft: 1,
  },
});

// ==========================================
// Screen Styles
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerBadge: {
    backgroundColor: '#F3EEFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8064A9',
    letterSpacing: 0.5,
    fontFamily: fontSansSerif,
  },
  headerIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 6,
    fontFamily: fontSansSerif,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 14,
    fontFamily: fontSansSerif,
  },
  bookActionBtn: {
    backgroundColor: '#8064A9',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8064A9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  bookActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  // 4 KPI Cards Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  kpiBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  kpiBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  kpiCount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  kpiSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  // Filter Tabs
  filterTabsRow: {
    marginBottom: 14,
  },
  filterScroll: {
    paddingRight: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#8064A9',
    borderColor: '#8064A9',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Empty State
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    fontFamily: fontSansSerif,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    fontFamily: fontSansSerif,
  },
  emptyBookBtn: {
    backgroundColor: '#8064A9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBookBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  // Session Card
  sessionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  idPurposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  purposeBadge: {
    backgroundColor: '#F3EEFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  purposeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8064A9',
    textTransform: 'uppercase',
    fontFamily: fontSansSerif,
  },
  bookingIdText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: 'monospace',
  },
  sessionTopicTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusPillConfirmed: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  statusPillPending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusPillRescheduled: {
    backgroundColor: '#EDE9FE',
    borderColor: '#DDD6FE',
  },
  statusPillCompleted: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  statusPillRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  statusTextConfirmed: {
    color: '#16A34A',
  },
  statusTextPending: {
    color: '#D97706',
  },
  statusTextRescheduled: {
    color: '#7C3AED',
  },
  statusTextCompleted: {
    color: '#475569',
  },
  statusTextRejected: {
    color: '#DC2626',
  },
  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  detailGridItem: {
    width: '48%',
    flexGrow: 1,
  },
  detailGridLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 1,
    fontFamily: fontSansSerif,
  },
  detailGridVal: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  detailGridValBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8064A9',
    fontFamily: fontSansSerif,
  },
  // Doubts Box
  doubtsBox: {
    backgroundColor: '#FAF7F2',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EDE2D7',
    marginBottom: 10,
  },
  doubtsLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#8064A9',
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  doubtsText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
    fontFamily: fontSansSerif,
  },
  // Reschedule Box
  rescheduleBox: {
    backgroundColor: '#F3EEFA',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 10,
  },
  rescheduleHeader: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  rescheduleNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#4C1D95',
    marginBottom: 8,
    fontFamily: fontSansSerif,
  },
  rescheduleActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptSlotBtn: {
    backgroundColor: '#8064A9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptSlotBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  declineSlotBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  declineSlotBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  // Mentor Notes Box
  mentorNotesBox: {
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 10,
  },
  mentorNotesLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  mentorNotesText: {
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
    fontFamily: fontSansSerif,
  },
  // Actions Row
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  joinVirtualBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  joinVirtualBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  viewDetailsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginLeft: 'auto',
  },
  viewDetailsBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 30,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalHeaderTag: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8064A9',
    letterSpacing: 0.5,
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  modalSheetTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
    marginTop: 10,
    fontFamily: fontSansSerif,
  },
  asterisk: {
    color: '#DC2626',
  },
  dropdownSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownSelectorText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '500',
    fontFamily: fontSansSerif,
  },
  dropdownChevron: {
    fontSize: 10,
    color: '#64748B',
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  textArea: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 80,
    fontFamily: fontSansSerif,
  },
  inputErrorBorder: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inlineErrorText: {
    fontSize: 10.5,
    color: '#DC2626',
    marginTop: 3,
    fontWeight: '600',
    fontFamily: fontSansSerif,
  },
  quickDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickDateChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickDateChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeToggleBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
  },
  modeToggleBtnActive: {
    backgroundColor: '#F3EEFA',
    borderColor: '#8064A9',
  },
  modeToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  modeToggleTextActive: {
    color: '#8064A9',
    fontWeight: '700',
  },
  formActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  submitBtn: {
    backgroundColor: '#8064A9',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  // Picker Modals
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pickerContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    maxHeight: '75%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 14,
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
    backgroundColor: '#F3EEFA',
  },
  pickerItemText: {
    fontSize: 12.5,
    color: '#1E293B',
    fontFamily: fontSansSerif,
  },
  pickerItemTextActive: {
    color: '#8064A9',
    fontWeight: '700',
  },
  pickerItemSub: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  // Details Modal
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    maxHeight: '85%',
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
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8064A9',
    letterSpacing: 0.5,
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  detailsTitle: {
    fontSize: 15,
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
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: fontSansSerif,
  },
  detailFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailFieldLabel: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    width: '40%',
  },
  detailFieldVal: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    width: '60%',
    textAlign: 'right',
  },
  modalJoinBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  modalJoinBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
});

