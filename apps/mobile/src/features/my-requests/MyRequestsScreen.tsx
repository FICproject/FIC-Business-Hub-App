import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Platform,
  TextInput,
  Linking,
} from 'react-native';
import { StandardHeader } from '../../components/common/StandardHeader';
import { ServiceRequest } from '../../types';
import { useAuth } from '../../state/AuthContext';
import { useStudentMentor, ConsultationBooking, ChamberServiceRequest } from '../../state/StudentMentorContext';
import { notify } from '../../components/common/NotificationContext';
import { launchAssignedMeeting } from '../../utils/meetingLauncher';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface MentorshipSessionRequest {
  id: string;
  mentorId?: string;
  mentorName?: string;
  studentName: string;
  topic: string;
  requestedDate: string;
  requestedTime: string;
  duration: string;
  status: 'PENDING' | 'SCHEDULED' | 'RESCHEDULED' | 'COMPLETED' | 'REJECTED';
  notes: string;
}

export interface StudentBooking {
  id: string;
  mentorName: string;
  topic: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: string;
  status: 'SCHEDULED' | 'PENDING' | 'COMPLETED';
  notes: string;
}

interface MyRequestsScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const MyRequestsScreen: React.FC<MyRequestsScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const {
    chamberRequests,
    getMentorIncomingRequests,
    getStudentBookings,
    acceptConsultation,
    proposeReschedule,
    rejectConsultation,
    completeConsultation,
    studentAcceptReschedule,
    studentDeclineReschedule,
  } = useStudentMentor();

  // Dynamic Category & Role Validation
  const subLower = user?.subcategory?.toLowerCase() || '';
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
      (user?.category === 'Education & Knowledge' && subLower === 'student'));

  const [activeCategoryTab, setActiveCategoryTab] = useState<'SERVICES' | 'MENTORSHIP'>('SERVICES');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  const [selectedReq, setSelectedReq] = useState<ChamberServiceRequest | null>(null);

  // Mentor & Student consultation lists derived dynamically from shared context with privacy isolation
  const assignedMentorRequests = isMentor ? getMentorIncomingRequests(user?.id, user?.fullName) : [];
  const activeStudentBookings = isStudent ? getStudentBookings(user?.id) : [];

  // Mentor Action Modals State
  const [acceptModalBooking, setAcceptModalBooking] = useState<ConsultationBooking | null>(null);
  const [acceptDate, setAcceptDate] = useState('');
  const [acceptTime, setAcceptTime] = useState('');
  const [acceptMode, setAcceptMode] = useState<'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Offline (Chamber)'>('Google Meet');
  const [acceptMeetUrl, setAcceptMeetUrl] = useState('');
  const [acceptNotes, setAcceptNotes] = useState('');

  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<ConsultationBooking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');

  const [rejectModalBooking, setRejectModalBooking] = useState<ConsultationBooking | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [completeModalBooking, setCompleteModalBooking] = useState<ConsultationBooking | null>(null);
  const [completeSummary, setCompleteSummary] = useState('');
  const [completeMaterials, setCompleteMaterials] = useState('');
  const [completeGuidance, setCompleteGuidance] = useState('');

  const filteredRequests = chamberRequests.filter((req) => {
    if (activeFilter === 'ACTIVE') return req.status !== 'COMPLETED';
    if (activeFilter === 'COMPLETED') return req.status === 'COMPLETED';
    return true;
  });

  // Open Accept Modal
  const handleOpenAcceptModal = (booking: ConsultationBooking) => {
    setAcceptModalBooking(booking);
    setAcceptDate(booking.requestedDate);
    setAcceptTime(booking.requestedTime);
    setAcceptMode('Google Meet');
    setAcceptMeetUrl('https://meet.google.com/fic-' + Math.random().toString(36).substring(2, 6));
    setAcceptNotes('Please review the preparatory notes and be ready with questions.');
  };

  // Submit Accept
  const handleConfirmAccept = () => {
    if (!acceptModalBooking) return;
    acceptConsultation(acceptModalBooking.id, {
      confirmedDate: acceptDate,
      confirmedTime: acceptTime,
      meetingMode: acceptMode,
      meetingUrl: acceptMeetUrl,
      mentorNotes: acceptNotes,
    });
    setAcceptModalBooking(null);
  };

  // Open Reschedule Modal
  const handleOpenRescheduleModal = (booking: ConsultationBooking) => {
    setRescheduleModalBooking(booking);
    setRescheduleDate('Next Mon (10 Mar)');
    setRescheduleTime('02:00 PM - 02:45 PM');
    setRescheduleNotes('I have a prior chamber manufacturing audit scheduled at that time. Would this slot work?');
  };

  // Submit Reschedule
  const handleConfirmReschedule = () => {
    if (!rescheduleModalBooking) return;
    proposeReschedule(rescheduleModalBooking.id, {
      proposedDate: rescheduleDate,
      proposedTime: rescheduleTime,
      notes: rescheduleNotes,
    });
    setRescheduleModalBooking(null);
  };

  // Open Reject Modal
  const handleOpenRejectModal = (booking: ConsultationBooking) => {
    setRejectModalBooking(booking);
    setRejectionReason('Currently at maximum cohort mentorship capacity. Please reapply next month or explore our recorded masterclasses.');
  };

  // Submit Reject
  const handleConfirmReject = () => {
    if (!rejectModalBooking) return;
    rejectConsultation(rejectModalBooking.id, rejectionReason);
    setRejectModalBooking(null);
  };

  // Open Complete Modal
  const handleOpenCompleteModal = (booking: ConsultationBooking) => {
    setCompleteModalBooking(booking);
    setCompleteSummary(`Completed comprehensive 1-on-1 session on "${booking.topic}". Evaluated student project deliverables, answered questions, and reviewed practical application.`);
    setCompleteMaterials('CNC Multi-Axis G-Code Programming Guide, Toolpath Optimization Masterclass v2');
    setCompleteGuidance('Practice 3D CAD modeling tolerances in CAM software and submit weekly audit progress for review.');
  };

  // Submit Complete
  const handleConfirmComplete = () => {
    if (!completeModalBooking) return;
    completeConsultation(completeModalBooking.id, {
      summary: completeSummary,
      recommendedMaterials: completeMaterials,
      followUpGuidance: completeGuidance,
    });
    setCompleteModalBooking(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="My Requests"
        subtitle={
          isMentor
            ? 'Chamber Services & Mentorship Desk'
            : isStudent
            ? 'Chamber Services & Mentor Bookings'
            : 'Chamber Intermediary Request Tracker'
        }
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="My Requests"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mentor Category Toggle (Chamber Services vs Mentorship Requests) */}
        {isMentor && (
          <View style={styles.categoryToggleRow}>
            <TouchableOpacity
              style={[styles.categoryToggleBtn, activeCategoryTab === 'SERVICES' && styles.categoryToggleBtnActive]}
              activeOpacity={0.7}
              onPress={() => setActiveCategoryTab('SERVICES')}
            >
              <Text style={[styles.categoryToggleText, activeCategoryTab === 'SERVICES' && styles.categoryToggleTextActive]}>
                Chamber Services ({chamberRequests.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryToggleBtn, activeCategoryTab === 'MENTORSHIP' && styles.categoryToggleBtnActive]}
              activeOpacity={0.7}
              onPress={() => setActiveCategoryTab('MENTORSHIP')}
            >
              <Text style={[styles.categoryToggleText, activeCategoryTab === 'MENTORSHIP' && styles.categoryToggleTextActive]}>
                Mentorship Requests ({assignedMentorRequests.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Student Category Toggle (Chamber Services vs My Mentor Bookings) */}
        {isStudent && (
          <View style={styles.categoryToggleRow}>
            <TouchableOpacity
              style={[styles.categoryToggleBtn, activeCategoryTab === 'SERVICES' && styles.categoryToggleBtnActive]}
              activeOpacity={0.7}
              onPress={() => setActiveCategoryTab('SERVICES')}
            >
              <Text style={[styles.categoryToggleText, activeCategoryTab === 'SERVICES' && styles.categoryToggleTextActive]}>
                Chamber Services ({chamberRequests.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.categoryToggleBtn, activeCategoryTab === 'MENTORSHIP' && styles.categoryToggleBtnActive]}
              activeOpacity={0.7}
              onPress={() => setActiveCategoryTab('MENTORSHIP')}
            >
              <Text style={[styles.categoryToggleText, activeCategoryTab === 'MENTORSHIP' && styles.categoryToggleTextActive]}>
                My Mentor Bookings ({activeStudentBookings.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* CHAMBER SERVICES TAB (For All Categories) */}
        {(!isMentor && !isStudent) || activeCategoryTab === 'SERVICES' ? (
          <>
            {/* Filter Tabs */}
            <View style={styles.filterTabsRow}>
              {(['ALL', 'ACTIVE', 'COMPLETED'] as const).map((tab) => {
                const isActive = activeFilter === tab;
                const label =
                  tab === 'ALL'
                    ? `All Requests (${chamberRequests.length})`
                    : tab === 'ACTIVE'
                    ? `Active (${chamberRequests.filter((r) => r.status !== 'COMPLETED').length})`
                    : `Completed (${chamberRequests.filter((r) => r.status === 'COMPLETED').length})`;
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

            {/* Request Cards or Empty State */}
            {filteredRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyTitle}>No requests yet</Text>
                <Text style={styles.emptySub}>
                  You haven't submitted any service requirements or chamber requests yet.
                </Text>
              </View>
            ) : (
              filteredRequests.map((req) => (
                <View key={req.id} style={styles.requestCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.trackingRefPill}>
                      <Text style={styles.trackingRefText}>{req.trackingNumber}</Text>
                    </View>
                    {/* Single Simplified Sent Status Label */}
                    <View style={styles.sentBadge}>
                      <View style={styles.sentDot} />
                      <Text style={styles.sentBadgeText}>Sent</Text>
                    </View>
                  </View>

                  <Text style={styles.requestTitle}>{req.serviceTitle}</Text>
                  <Text style={styles.requestSector}>Sector: {req.sector}</Text>

                  {/* Officer & Dates Box */}
                  <View style={styles.officerBox}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Assigned Desk:</Text>
                      <Text style={styles.metaVal}>{req.facilitatorAssigned}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Submitted Date:</Text>
                      <Text style={styles.metaVal}>{req.createdAt}</Text>
                    </View>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Estimated Response:</Text>
                      <Text style={styles.metaVal}>{req.estimatedCompletion}</Text>
                    </View>
                  </View>

                  {/* Action */}
                  <TouchableOpacity
                    style={styles.viewTimelineBtn}
                    activeOpacity={0.85}
                    onPress={() => setSelectedReq(req)}
                  >
                    <Text style={styles.viewTimelineBtnText}>
                      View Request Details →
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        ) : isMentor ? (
          /* MENTOR-ONLY: INCOMING MENTORSHIP REQUESTS SECTION */
          <View>
            {assignedMentorRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyTitle}>No Incoming Consultations</Text>
                <Text style={styles.emptySub}>
                  You have no pending student consultation bookings right now. Requests assigned directly to you will appear here.
                </Text>
              </View>
            ) : (
              assignedMentorRequests.map((mReq) => (
                <View key={mReq.id} style={styles.requestCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.trackingRefPill}>
                      <Text style={styles.trackingRefText}>1-on-1 Consultation</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            mReq.status === 'ACCEPTED'
                              ? '#DCFCE7'
                              : mReq.status === 'REJECTED'
                              ? '#FEE2E2'
                              : mReq.status === 'RESCHEDULE_PROPOSED'
                              ? '#FEF3C7'
                              : mReq.status === 'COMPLETED'
                              ? '#F1F5F9'
                              : '#EFF6FF',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              mReq.status === 'ACCEPTED'
                                ? '#15803D'
                                : mReq.status === 'REJECTED'
                                ? '#DC2626'
                                : mReq.status === 'RESCHEDULE_PROPOSED'
                                ? '#B45309'
                                : mReq.status === 'COMPLETED'
                                ? '#475569'
                                : '#2563EB',
                          },
                        ]}
                      >
                        {mReq.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.requestTitle}>{mReq.topic}</Text>
                  <Text style={styles.requestSector}>Student: {mReq.studentName}</Text>

                  <View style={styles.officerBox}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Requested Slot:</Text>
                      <Text style={styles.metaVal}>{mReq.requestedDate} • {mReq.requestedTime}</Text>
                    </View>
                    {mReq.confirmedDate && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Confirmed Slot:</Text>
                        <Text style={[styles.metaVal, { color: '#15803D', fontWeight: '800' }]}>
                          {mReq.confirmedDate} • {mReq.confirmedTime}
                        </Text>
                      </View>
                    )}
                    {mReq.proposedDate && mReq.status === 'RESCHEDULE_PROPOSED' && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Proposed Slot:</Text>
                        <Text style={[styles.metaVal, { color: '#B45309', fontWeight: '800' }]}>
                          {mReq.proposedDate} • {mReq.proposedTime}
                        </Text>
                      </View>
                    )}
                    {mReq.meetingMode && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Meeting Mode:</Text>
                        <Text style={styles.metaVal}>{mReq.meetingMode}</Text>
                      </View>
                    )}
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Duration:</Text>
                      <Text style={styles.metaVal}>{mReq.duration}</Text>
                    </View>
                    <View style={[styles.metaRow, { marginTop: 4 }]}>
                      <Text style={styles.metaLabel}>Agenda:</Text>
                      <Text style={[styles.metaVal, { flex: 1, textAlign: 'right' }]}>{mReq.agenda}</Text>
                    </View>
                  </View>

                  {/* Mentor Action Buttons */}
                  <View style={styles.mentorActionsRow}>
                    {mReq.status === 'PENDING' && (
                      <>
                        <TouchableOpacity
                          style={[styles.mentorBtn, styles.mentorBtnPrimary]}
                          onPress={() => handleOpenAcceptModal(mReq)}
                        >
                          <Text style={styles.mentorBtnPrimaryText}>Accept & Schedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.mentorBtn, styles.mentorBtnSecondary]}
                          onPress={() => handleOpenRescheduleModal(mReq)}
                        >
                          <Text style={styles.mentorBtnSecondaryText}>Reschedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.mentorBtn, styles.mentorBtnOutline]}
                          onPress={() => handleOpenRejectModal(mReq)}
                        >
                          <Text style={styles.mentorBtnOutlineText}>Reject</Text>
                        </TouchableOpacity>
                      </>
                    )}

                    {mReq.status === 'RESCHEDULE_PROPOSED' && (
                      <View style={styles.pendingReviewPill}>
                        <Text style={styles.pendingReviewText}>⏳ Waiting for student response on proposed slot</Text>
                      </View>
                    )}

                    {mReq.status === 'ACCEPTED' && (
                      <TouchableOpacity
                        style={[styles.mentorBtn, styles.mentorBtnSuccess, { flex: 1 }]}
                        onPress={() => handleOpenCompleteModal(mReq)}
                      >
                        <Text style={styles.mentorBtnSuccessText}>Complete Session & Log Audit</Text>
                      </TouchableOpacity>
                    )}

                    {mReq.status === 'COMPLETED' && (
                      <View style={styles.auditCompletePill}>
                        <Text style={styles.auditCompleteText}>✓ Session Concluded & Audit Certificate Logged</Text>
                      </View>
                    )}

                    {mReq.status === 'REJECTED' && (
                      <View style={[styles.auditCompletePill, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.auditCompleteText, { color: '#DC2626' }]}>✕ Request Declined</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          /* STUDENT-ONLY: MY MENTOR BOOKINGS SECTION */
          <View>
            {activeStudentBookings.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📚</Text>
                <Text style={styles.emptyTitle}>No Mentor Bookings Yet</Text>
                <Text style={styles.emptySub}>
                  Explore verified mentors in the Skill Development directory to book 1-on-1 technical and career consultations.
                </Text>
                <TouchableOpacity
                  style={styles.exploreMentorsBtn}
                  onPress={() => onNavigateToModule?.('Skill Development')}
                >
                  <Text style={styles.exploreMentorsBtnText}>Explore Mentors →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              activeStudentBookings.map((b) => (
                <View key={b.id} style={styles.requestCard}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.trackingRefPill}>
                      <Text style={styles.trackingRefText}>1-on-1 Consultation</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            b.status === 'ACCEPTED'
                              ? '#DCFCE7'
                              : b.status === 'COMPLETED'
                              ? '#F1F5F9'
                              : b.status === 'RESCHEDULE_PROPOSED'
                              ? '#FEF3C7'
                              : b.status === 'REJECTED'
                              ? '#FEE2E2'
                              : '#EFF6FF',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color:
                              b.status === 'ACCEPTED'
                                ? '#15803D'
                                : b.status === 'COMPLETED'
                                ? '#475569'
                                : b.status === 'RESCHEDULE_PROPOSED'
                                ? '#B45309'
                                : b.status === 'REJECTED'
                                ? '#DC2626'
                                : '#2563EB',
                          },
                        ]}
                      >
                        {b.status === 'RESCHEDULE_PROPOSED'
                          ? 'RESCHEDULE PROPOSED'
                          : b.status === 'ACCEPTED'
                          ? 'CONFIRMED'
                          : b.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.requestTitle}>{b.topic}</Text>
                  <Text style={styles.requestSector}>Mentor: {b.mentorName}</Text>

                  <View style={styles.officerBox}>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Requested Slot:</Text>
                      <Text style={styles.metaVal}>{b.requestedDate} • {b.requestedTime}</Text>
                    </View>
                    {b.confirmedDate && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Confirmed Slot:</Text>
                        <Text style={[styles.metaVal, { color: '#15803D', fontWeight: '800' }]}>
                          {b.confirmedDate} • {b.confirmedTime}
                        </Text>
                      </View>
                    )}
                    {b.meetingMode && (
                      <View style={styles.metaRow}>
                        <Text style={styles.metaLabel}>Meeting Mode:</Text>
                        <Text style={styles.metaVal}>{b.meetingMode}</Text>
                      </View>
                    )}
                    {b.proposedDate && b.status === 'RESCHEDULE_PROPOSED' && (
                      <View style={[styles.metaRow, { backgroundColor: '#FFFBEB', padding: 6, borderRadius: 6 }]}>
                        <Text style={[styles.metaLabel, { color: '#B45309', fontWeight: '700' }]}>Proposed Alternate Slot:</Text>
                        <Text style={[styles.metaVal, { color: '#B45309', fontWeight: '800' }]}>
                          {b.proposedDate} • {b.proposedTime}
                        </Text>
                      </View>
                    )}
                    {b.rescheduleNotes && b.status === 'RESCHEDULE_PROPOSED' && (
                      <View style={[styles.metaRow, { marginTop: 4 }]}>
                        <Text style={styles.metaLabel}>Mentor's Note:</Text>
                        <Text style={[styles.metaVal, { flex: 1, textAlign: 'right' }]}>{b.rescheduleNotes}</Text>
                      </View>
                    )}
                    {b.mentorNotes && (
                      <View style={[styles.metaRow, { marginTop: 4 }]}>
                        <Text style={styles.metaLabel}>Prep Note:</Text>
                        <Text style={[styles.metaVal, { flex: 1, textAlign: 'right' }]}>{b.mentorNotes}</Text>
                      </View>
                    )}
                    {b.rejectionReason && (
                      <View style={[styles.metaRow, { marginTop: 4 }]}>
                        <Text style={[styles.metaLabel, { color: '#DC2626' }]}>Reason:</Text>
                        <Text style={[styles.metaVal, { flex: 1, textAlign: 'right', color: '#DC2626' }]}>
                          {b.rejectionReason}
                        </Text>
                      </View>
                    )}
                    {b.completionSummary && (
                      <View style={[styles.metaRow, { marginTop: 4 }]}>
                        <Text style={styles.metaLabel}>Audit Summary:</Text>
                        <Text style={[styles.metaVal, { flex: 1, textAlign: 'right' }]}>{b.completionSummary}</Text>
                      </View>
                    )}
                    {b.recommendedMaterials && (
                      <View style={[styles.metaRow, { marginTop: 4 }]}>
                        <Text style={styles.metaLabel}>Materials:</Text>
                        <Text style={[styles.metaVal, { flex: 1, textAlign: 'right' }]}>{b.recommendedMaterials}</Text>
                      </View>
                    )}
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Duration:</Text>
                      <Text style={styles.metaVal}>{b.duration}</Text>
                    </View>
                  </View>

                  {/* Student Actions / Status Pills */}
                  <View style={styles.studentStatusRow}>
                    {b.status === 'ACCEPTED' ? (
                      <TouchableOpacity
                        style={styles.joinSessionBtn}
                        activeOpacity={0.85}
                        onPress={() => {
                          const platform = b.meetingMode?.includes('Zoom')
                            ? 'Zoom'
                            : b.meetingMode?.includes('Teams')
                            ? 'Microsoft Teams'
                            : 'Google Meet';
                          launchAssignedMeeting({
                            id: b.id,
                            title: b.topic,
                            platform,
                            meetingUrl: b.meetingUrl,
                          });
                        }}
                      >
                        <Text style={styles.joinSessionBtnText}>Enter Meeting →</Text>
                      </TouchableOpacity>
                    ) : b.status === 'RESCHEDULE_PROPOSED' ? (
                      <View style={{ gap: 8 }}>
                        <View style={styles.rescheduleAlertBox}>
                          <Text style={styles.rescheduleAlertTitle}>⚠️ Alternate Slot Proposed</Text>
                          <Text style={styles.rescheduleAlertDesc}>
                            The mentor proposed {b.proposedDate} at {b.proposedTime}. Do you accept this time?
                          </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          <TouchableOpacity
                            style={[styles.mentorBtn, styles.mentorBtnPrimary, { flex: 1 }]}
                            onPress={() => studentAcceptReschedule(b.id)}
                          >
                            <Text style={styles.mentorBtnPrimaryText}>✓ Accept Proposed Slot</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.mentorBtn, styles.mentorBtnOutline, { flex: 0.8 }]}
                            onPress={() => studentDeclineReschedule(b.id)}
                          >
                            <Text style={styles.mentorBtnOutlineText}>✕ Decline</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : b.status === 'COMPLETED' ? (
                      <View style={styles.auditCompletePill}>
                        <Text style={styles.auditCompleteText}>✓ Session Completed & Chamber Certificate Issued</Text>
                      </View>
                    ) : b.status === 'REJECTED' ? (
                      <View style={[styles.auditCompletePill, { backgroundColor: '#FEE2E2' }]}>
                        <Text style={[styles.auditCompleteText, { color: '#DC2626' }]}>✕ Request Declined by Mentor</Text>
                      </View>
                    ) : (
                      <View style={styles.awaitingBadge}>
                        <Text style={styles.awaitingBadgeText}>⏳ Awaiting Mentor Confirmation</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* 1. MENTOR: ACCEPT & SCHEDULE MODAL                             */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={!!acceptModalBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setAcceptModalBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Accept & Schedule Consultation</Text>
                <Text style={styles.modalSubtitle}>Student: {acceptModalBooking?.studentName}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setAcceptModalBooking(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormBox}>
                <Text style={styles.modalFormLabel}>Topic / Discussion Area</Text>
                <Text style={styles.modalFormStaticVal}>{acceptModalBooking?.topic}</Text>

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Confirmed Date *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={acceptDate}
                  onChangeText={setAcceptDate}
                  placeholder="e.g. Tomorrow (05 Mar)"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Confirmed Time Window *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={acceptTime}
                  onChangeText={setAcceptTime}
                  placeholder="e.g. 04:00 PM - 04:45 PM"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Consultation Platform</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                  {(['Google Meet', 'Zoom', 'Microsoft Teams', 'Offline (Chamber)'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[
                        styles.modeChip,
                        acceptMode === mode && styles.modeChipActive,
                      ]}
                      onPress={() => {
                        setAcceptMode(mode);
                        if (mode === 'Google Meet') {
                          setAcceptMeetUrl('https://meet.google.com/fic-' + Math.random().toString(36).substring(2, 6));
                        } else if (mode === 'Zoom') {
                          setAcceptMeetUrl('https://zoom.us/j/88392104521?pwd=FIC');
                        } else if (mode === 'Microsoft Teams') {
                          setAcceptMeetUrl('https://teams.microsoft.com/l/meetup-join/19%3ameeting_fic');
                        } else {
                          setAcceptMeetUrl('');
                        }
                      }}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          acceptMode === mode && styles.modeChipTextActive,
                        ]}
                      >
                        {mode === 'Google Meet' ? '📹 Meet' : mode === 'Zoom' ? '🟦 Zoom' : mode === 'Microsoft Teams' ? '👥 Teams' : '🏛️ Offline'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {acceptMode !== 'Offline (Chamber)' && (
                  <>
                    <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Assigned Meeting Link *</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={acceptMeetUrl}
                      onChangeText={setAcceptMeetUrl}
                      placeholder={
                        acceptMode === 'Zoom'
                          ? 'https://zoom.us/j/...'
                          : acceptMode === 'Microsoft Teams'
                          ? 'https://teams.microsoft.com/...'
                          : 'https://meet.google.com/...'
                      }
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Mentor Preparatory Instructions</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={acceptNotes}
                  onChangeText={setAcceptNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="Instructions for the student prior to joining..."
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#2563EB', marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmAccept}
                >
                  <Text style={styles.modalSubmitBtnText}>✓ Confirm & Schedule Consultation</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 2. MENTOR: PROPOSE RESCHEDULE MODAL                            */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={!!rescheduleModalBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleModalBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Propose Alternate Slot</Text>
                <Text style={styles.modalSubtitle}>Student: {rescheduleModalBooking?.studentName}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setRescheduleModalBooking(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormBox}>
                <Text style={styles.modalFormLabel}>Current Requested Slot</Text>
                <Text style={styles.modalFormStaticVal}>
                  {rescheduleModalBooking?.requestedDate} • {rescheduleModalBooking?.requestedTime}
                </Text>

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Proposed New Date *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={rescheduleDate}
                  onChangeText={setRescheduleDate}
                  placeholder="e.g. Next Mon (10 Mar)"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Proposed New Time *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={rescheduleTime}
                  onChangeText={setRescheduleTime}
                  placeholder="e.g. 02:00 PM - 02:45 PM"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Reason / Scheduling Note *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={rescheduleNotes}
                  onChangeText={setRescheduleNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="Explain why the requested slot is unavailable..."
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#D97706', marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmReschedule}
                >
                  <Text style={styles.modalSubmitBtnText}>Send Reschedule Proposal →</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 3. MENTOR: REJECT CONSULTATION MODAL                           */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={!!rejectModalBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setRejectModalBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: '#DC2626' }]}>Decline Consultation</Text>
                <Text style={styles.modalSubtitle}>Student: {rejectModalBooking?.studentName}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setRejectModalBooking(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormBox}>
                <Text style={styles.modalFormLabel}>Topic</Text>
                <Text style={styles.modalFormStaticVal}>{rejectModalBooking?.topic}</Text>

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Constructive Reason / Feedback for Student *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                  placeholder="Provide guidance or suggest alternative learning resources..."
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#DC2626', marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmReject}
                >
                  <Text style={styles.modalSubmitBtnText}>✕ Confirm Decline</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* 4. MENTOR: COMPLETE SESSION & AUDIT MODAL                      */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={!!completeModalBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setCompleteModalBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: '#15803D' }]}>Complete Session & Log Audit</Text>
                <Text style={styles.modalSubtitle}>Student: {completeModalBooking?.studentName}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setCompleteModalBooking(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalFormBox}>
                <Text style={styles.modalFormLabel}>Session Topic</Text>
                <Text style={styles.modalFormStaticVal}>{completeModalBooking?.topic}</Text>

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Session Summary & Outcomes *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={completeSummary}
                  onChangeText={setCompleteSummary}
                  multiline
                  numberOfLines={3}
                  placeholder="Key concepts discussed, questions resolved..."
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Recommended Materials / Masterclasses</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={completeMaterials}
                  onChangeText={setCompleteMaterials}
                  multiline
                  numberOfLines={2}
                  placeholder="Articles, chamber courses, reading list..."
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Follow-Up Guidance & Action Steps</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={completeGuidance}
                  onChangeText={setCompleteGuidance}
                  multiline
                  numberOfLines={2}
                  placeholder="Next milestone, practice exercises..."
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#10B981', marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmComplete}
                >
                  <Text style={styles.modalSubmitBtnText}>✓ Issue Chamber Audit Certificate</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Member-Facing Request Details Modal (No internal stages or officer notes exposed) */}
      <Modal
        visible={!!selectedReq}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedReq(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedReq?.trackingNumber}</Text>
                <Text style={styles.modalSubtitle}>{selectedReq?.serviceTitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setSelectedReq(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.detailSectionBox}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Request Status</Text>
                  <View style={styles.sentBadge}>
                    <View style={styles.sentDot} />
                    <Text style={styles.sentBadgeText}>Sent</Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Sector / Domain</Text>
                  <Text style={styles.detailVal}>{selectedReq?.sector}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Assigned Desk</Text>
                  <Text style={styles.detailVal}>{selectedReq?.facilitatorAssigned}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submission Date</Text>
                  <Text style={styles.detailVal}>{selectedReq?.createdAt}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Estimated Response</Text>
                  <Text style={styles.detailVal}>{selectedReq?.estimatedCompletion}</Text>
                </View>
              </View>
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
  trackerBanner: {
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
  requestCard: {
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingRefPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  trackingRefText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  // Compact Simplified Sent Status Badge
  sentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 5,
  },
  sentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  sentBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  requestTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  requestSector: {
    fontSize: 11.5,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: fontSansSerif,
    marginBottom: 12,
  },
  officerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 10,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  viewTimelineBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  viewTimelineBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
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
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalSubtitle: {
    fontSize: 12,
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
  modalCloseText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  detailSectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 12,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: fontSansSerif,
    fontWeight: '500',
  },
  detailVal: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontWeight: '700',
    textAlign: 'right',
    maxWidth: '65%',
  },
  escrowNoticeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  escrowNoticeTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  escrowNoticeText: {
    fontSize: 11.5,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 17,
  },
  categoryToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  categoryToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  categoryToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  categoryToggleTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  mentorActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  mentorBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mentorBtnPrimary: {
    backgroundColor: '#2563EB',
    flex: 1.2,
  },
  mentorBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  mentorBtnSecondary: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flex: 1,
  },
  mentorBtnSecondaryText: {
    color: '#2563EB',
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  mentorBtnOutline: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 10,
  },
  mentorBtnOutlineText: {
    color: '#DC2626',
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  mentorBtnSuccess: {
    backgroundColor: '#10B981',
  },
  mentorBtnSuccessText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  auditCompletePill: {
    flex: 1,
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  auditCompleteText: {
    color: '#15803D',
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  studentStatusRow: {
    marginTop: 10,
  },
  joinSessionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinSessionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  awaitingBadge: {
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
    alignItems: 'center',
  },
  awaitingBadgeText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  modalFormBox: {
    paddingVertical: 10,
  },
  modalFormLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  modalFormStaticVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    backgroundColor: '#F1F5F9',
    padding: 10,
    borderRadius: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    fontFamily: fontSansSerif,
  },
  modalTextArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  modeChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  modeChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  modeChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: fontSansSerif,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  exploreMentorsBtn: {
    marginTop: 14,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  exploreMentorsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  pendingReviewPill: {
    flex: 1,
    backgroundColor: '#FEF3C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  pendingReviewText: {
    color: '#B45309',
    fontSize: 11.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  rescheduleAlertBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  rescheduleAlertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: fontSansSerif,
  },
  rescheduleAlertDesc: {
    fontSize: 11.5,
    color: '#92400E',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
});
