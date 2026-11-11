import React, { useState, useEffect, useMemo } from 'react';
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
  BackHandler,
} from 'react-native';
import { StandardHeader } from '../../components/common/StandardHeader';
import { useAuth } from '../../state/AuthContext';
import { useStudentMentor, ConsultationBooking, ChamberServiceRequest } from '../../state/StudentMentorContext';
import { launchAssignedMeeting } from '../../utils/meetingLauncher';
import { storageService } from '../../services/storageService';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export type FunctionCategory =
  | 'ALL'
  | 'MARKETPLACE'
  | 'BUSINESS_IDEAS'
  | 'SCALING'
  | 'INVESTMENT'
  | 'MEETINGS'
  | 'SERVICES';

export interface UnifiedRequest {
  id: string;
  trackingNumber: string;
  functionType: FunctionCategory;
  functionLabel: 'Marketplace' | 'Business Ideas' | 'Scaling' | 'Investment' | 'Meetings' | 'Services';
  title: string;
  category: string;
  type: string;
  status: string;
  submittedDate: string;
  details: {
    fundingType?: string;
    requestedAmount?: string;
    businessStage?: string;
    equityOffered?: string;
    timeline?: string;
    purpose?: string;
    businessLocation?: string;

    businessName?: string;
    scalingType?: string;
    requiredSupport?: string;
    turnover?: string;
    growthArea?: string;

    requirementTitle?: string;
    serviceCategory?: string;
    targetQuantity?: string;

    conceptTitle?: string;
    stage?: string;
    feasibilityScore?: string | number;

    topic?: string;
    consultationCategory?: string;
    meetingMode?: string;
    preferredDate?: string;
    preferredSlot?: string;
    moderatorName?: string;
    agenda?: string;
    meetingLinkOrLocation?: string;

    serviceName?: string;
    serviceType?: string;
    deliveryMode?: string;
    coverageArea?: string;
    deliverables?: string;
    scope?: string;
    fee?: string;

    notes?: string;
    assignedDesk?: string;
    estimatedResponse?: string;
  };
  rawItem?: any;
}

const FILTER_TABS: { key: FunctionCategory; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'MARKETPLACE', label: 'Marketplace' },
  { key: 'BUSINESS_IDEAS', label: 'Business Ideas' },
  { key: 'SCALING', label: 'Scaling' },
  { key: 'INVESTMENT', label: 'Investment' },
  { key: 'MEETINGS', label: 'Meetings' },
  { key: 'SERVICES', label: 'Services' },
];

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

  // 7-Function Active Filter
  const [activeFilter, setActiveFilter] = useState<FunctionCategory>('ALL');

  // Selected Request for Universal Details Modal
  const [selectedUnifiedReq, setSelectedUnifiedReq] = useState<UnifiedRequest | null>(null);

  // Storage data for Meetings and Services
  const [facilitatedMeetings, setFacilitatedMeetings] = useState<any[]>([]);
  const [myServicesList, setMyServicesList] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const meetingsRaw = await storageService.getItem('FIC_FACILITATED_MEETINGS');
        if (meetingsRaw && isMounted) {
          const parsed = JSON.parse(meetingsRaw);
          if (Array.isArray(parsed)) setFacilitatedMeetings(parsed);
        }
      } catch (e) {
        console.warn('Error loading facilitated meetings:', e);
      }

      try {
        const servicesRaw = await storageService.getItem('FIC_MY_SERVICES_DRAFTS');
        if (servicesRaw && isMounted) {
          const parsed = JSON.parse(servicesRaw);
          if (Array.isArray(parsed)) setMyServicesList(parsed);
        }
      } catch (e) {
        console.warn('Error loading my services:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Mentor & Student consultation lists
  const assignedMentorRequests = isMentor ? getMentorIncomingRequests(user?.id, user?.fullName) : [];
  const activeStudentBookings = isStudent ? getStudentBookings(user?.id) : [];

  // Mentor Action Modals State (for interactive session scheduling)
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

  // Hardware Back Handler (Android back button closes modal or navigates back)
  useEffect(() => {
    const onBackPress = () => {
      if (selectedUnifiedReq) {
        setSelectedUnifiedReq(null);
        return true;
      }
      if (acceptModalBooking) {
        setAcceptModalBooking(null);
        return true;
      }
      if (rescheduleModalBooking) {
        setRescheduleModalBooking(null);
        return true;
      }
      if (rejectModalBooking) {
        setRejectModalBooking(null);
        return true;
      }
      if (completeModalBooking) {
        setCompleteModalBooking(null);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [selectedUnifiedReq, acceptModalBooking, rescheduleModalBooking, rejectModalBooking, completeModalBooking, onBack]);

  // Unified Requests Mapper across all 6 Platform Functions
  const unifiedRequests = useMemo<UnifiedRequest[]>(() => {
    const list: UnifiedRequest[] = [];

    // 1. Process chamberRequests
    chamberRequests.forEach((req) => {
      const lowerTitle = (req.serviceTitle || '').toLowerCase();
      const details = req.details || {};

      let funcCat: FunctionCategory = 'MARKETPLACE';
      let funcLabel: UnifiedRequest['functionLabel'] = 'Marketplace';
      let reqType = 'Marketplace Requirement';

      if (
        details.module === 'Scaling' ||
        details.type === 'SCALING' ||
        lowerTitle.includes('enterprise diagnostic') ||
        lowerTitle.includes('scaling')
      ) {
        funcCat = 'SCALING';
        funcLabel = 'Scaling';
        reqType = 'Business Scaling';
      } else if (
        lowerTitle.includes('funding requirement') ||
        lowerTitle.includes('investor profile') ||
        lowerTitle.includes('funding') ||
        lowerTitle.includes('investor') ||
        details.fundingType ||
        details.investorType ||
        details.requiredAmount
      ) {
        funcCat = 'INVESTMENT';
        funcLabel = 'Investment';
        reqType = details.fundingType
          ? `${details.fundingType} Funding`
          : details.investorType
          ? `${details.investorType} Interest`
          : 'Investment Request';
      } else if (
        lowerTitle.includes('incubation concept') ||
        lowerTitle.includes('business idea') ||
        details.stage?.includes('Incubation') ||
        details.feasibilityScore !== undefined
      ) {
        funcCat = 'BUSINESS_IDEAS';
        funcLabel = 'Business Ideas';
        reqType = 'Incubation Concept';
      } else if (
        lowerTitle.includes('bilateral meeting') ||
        lowerTitle.includes('consultation') ||
        lowerTitle.includes('facilitated meeting')
      ) {
        funcCat = 'MEETINGS';
        funcLabel = 'Meetings';
        reqType = 'Chamber Meeting';
      } else if (
        lowerTitle.includes('service listing') ||
        lowerTitle.includes('provider capability') ||
        details.type === 'SERVICE_LISTING'
      ) {
        funcCat = 'SERVICES';
        funcLabel = 'Services';
        reqType = 'Service Listing';
      } else {
        funcCat = 'MARKETPLACE';
        funcLabel = 'Marketplace';
        reqType = 'Marketplace Requirement';
      }

      list.push({
        id: req.id,
        trackingNumber: req.trackingNumber || `REQ-${req.id.slice(-6).toUpperCase()}`,
        functionType: funcCat,
        functionLabel: funcLabel,
        title: req.serviceTitle || 'Service Request',
        category: req.sector || 'Chamber Services',
        type: reqType,
        status: (req.status || 'UNDER_REVIEW').replace(/_/g, ' '),
        submittedDate: req.createdAt || 'Recent',
        details: {
          fundingType: details.fundingType,
          requestedAmount: details.requiredAmount
            ? `₹${details.requiredAmount}`
            : details.investmentRange
            ? `₹${details.investmentRange}`
            : undefined,
          businessStage: details.stage || details.businessStage,
          equityOffered: details.equityOffered ? `${details.equityOffered}%` : undefined,
          timeline: details.timeline || details.expectedFundingTimeline,
          purpose: details.fundingPurpose || req.notes,
          businessLocation: details.businessLocation || details.preferredLocation,

          businessName: req.serviceTitle?.replace('Enterprise Diagnostic: ', '') || details.enterpriseName,
          scalingType: details.growthArea || 'Enterprise Diagnostic',
          requiredSupport: req.notes || details.targetObjectives || 'Chamber Diagnostic Support',
          turnover: details.turnover,
          growthArea: details.growthArea,

          requirementTitle: req.serviceTitle,
          serviceCategory: req.sector,
          targetQuantity: details.targetQuantity,

          conceptTitle: req.serviceTitle?.replace('Incubation Concept: ', ''),
          stage: details.stage,
          feasibilityScore: details.feasibilityScore,

          topic: req.serviceTitle,
          consultationCategory: req.sector,
          notes: req.notes,
          assignedDesk: req.facilitatorAssigned,
          estimatedResponse: req.estimatedCompletion,
        },
        rawItem: req,
      });
    });

    // 2. Process Facilitated Meetings
    facilitatedMeetings.forEach((m) => {
      if (list.some((existing) => existing.id === m.id)) return;
      list.push({
        id: m.id,
        trackingNumber: m.id?.toUpperCase().startsWith('MTG-')
          ? m.id
          : `MTG-${(m.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`,
        functionType: 'MEETINGS',
        functionLabel: 'Meetings',
        title: m.subject || 'Facilitated Chamber Meeting',
        category: m.category || 'Chamber Consultation',
        type: m.meetingMode || 'Virtual Meet',
        status: m.status || 'SCHEDULED',
        submittedDate: m.dateTime || `${m.day || ''} ${m.month || ''}`,
        details: {
          topic: m.subject,
          consultationCategory: m.category,
          meetingMode: m.meetingMode,
          preferredDate: m.dateTime,
          moderatorName: m.ficModeratorName,
          meetingLinkOrLocation: m.meetingLinkOrLocation,
          agenda: m.agenda,
          notes: m.agenda,
        },
        rawItem: m,
      });
    });

    // 3. Process Mentor/Student Consultations if available
    if (isMentor && assignedMentorRequests.length > 0) {
      assignedMentorRequests.forEach((mReq) => {
        if (list.some((existing) => existing.id === mReq.id)) return;
        list.push({
          id: mReq.id,
          trackingNumber: `CNS-${mReq.id.slice(-6).toUpperCase()}`,
          functionType: 'MEETINGS',
          functionLabel: 'Meetings',
          title: `Consultation: ${mReq.topic}`,
          category: 'Skill Development & Mentorship',
          type: mReq.meetingMode || '1-on-1 Consultation',
          status: mReq.status?.replace(/_/g, ' ') || 'PENDING',
          submittedDate: `${mReq.requestedDate} • ${mReq.requestedTime}`,
          details: {
            topic: mReq.topic,
            consultationCategory: 'Skill Development',
            meetingMode: mReq.meetingMode,
            preferredDate: mReq.confirmedDate
              ? `${mReq.confirmedDate} • ${mReq.confirmedTime}`
              : `${mReq.requestedDate} • ${mReq.requestedTime}`,
            moderatorName: `Student: ${mReq.studentName}`,
            agenda: mReq.agenda,
            meetingLinkOrLocation: mReq.meetingUrl,
            notes: mReq.mentorNotes || mReq.rescheduleNotes || mReq.agenda,
          },
          rawItem: mReq,
        });
      });
    }

    if (isStudent && activeStudentBookings.length > 0) {
      activeStudentBookings.forEach((b) => {
        if (list.some((existing) => existing.id === b.id)) return;
        list.push({
          id: b.id,
          trackingNumber: `BKG-${b.id.slice(-6).toUpperCase()}`,
          functionType: 'MEETINGS',
          functionLabel: 'Meetings',
          title: `Mentor Booking: ${b.topic}`,
          category: 'Skill Development & Mentorship',
          type: b.meetingMode || '1-on-1 Consultation',
          status: b.status === 'ACCEPTED' ? 'CONFIRMED' : b.status?.replace(/_/g, ' ') || 'PENDING',
          submittedDate: `${b.requestedDate} • ${b.requestedTime}`,
          details: {
            topic: b.topic,
            consultationCategory: 'Skill Development',
            meetingMode: b.meetingMode,
            preferredDate: b.confirmedDate
              ? `${b.confirmedDate} • ${b.confirmedTime}`
              : `${b.requestedDate} • ${b.requestedTime}`,
            moderatorName: `Mentor: ${b.mentorName}`,
            meetingLinkOrLocation: b.meetingUrl,
            notes: b.mentorNotes || b.rescheduleNotes || b.agenda,
          },
          rawItem: b,
        });
      });
    }

    // 4. Process My Services
    myServicesList.forEach((s) => {
      if (list.some((existing) => existing.id === s.id)) return;
      list.push({
        id: s.id,
        trackingNumber: `SVC-${(s.id || '').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`,
        functionType: 'SERVICES',
        functionLabel: 'Services',
        title: s.title || 'Capability Service',
        category: s.sector || 'Business Service',
        type: s.type || 'B2B Capability',
        status: (s.status || 'UNDER_REVIEW').replace(/_/g, ' '),
        submittedDate: s.tat ? `TAT: ${s.tat}` : 'Active',
        details: {
          serviceName: s.title,
          serviceType: s.type,
          fee: s.fee,
          deliverables: s.deliverables,
          coverageArea: s.sector,
          scope: s.subcategory,
          notes: s.deliverables,
        },
        rawItem: s,
      });
    });

    return list;
  }, [
    chamberRequests,
    facilitatedMeetings,
    assignedMentorRequests,
    activeStudentBookings,
    myServicesList,
    isMentor,
    isStudent,
  ]);

  // Compute live counter badge for each filter
  const counts = useMemo(() => {
    return {
      ALL: unifiedRequests.length,
      MARKETPLACE: unifiedRequests.filter((r) => r.functionType === 'MARKETPLACE').length,
      BUSINESS_IDEAS: unifiedRequests.filter((r) => r.functionType === 'BUSINESS_IDEAS').length,
      SCALING: unifiedRequests.filter((r) => r.functionType === 'SCALING').length,
      INVESTMENT: unifiedRequests.filter((r) => r.functionType === 'INVESTMENT').length,
      MEETINGS: unifiedRequests.filter((r) => r.functionType === 'MEETINGS').length,
      SERVICES: unifiedRequests.filter((r) => r.functionType === 'SERVICES').length,
    };
  }, [unifiedRequests]);

  // Filter requests based on selected tab
  const currentRequests = useMemo(() => {
    if (activeFilter === 'ALL') return unifiedRequests;
    return unifiedRequests.filter((r) => r.functionType === activeFilter);
  }, [unifiedRequests, activeFilter]);

  // Empty state content helper
  const getEmptyStateContent = (filter: FunctionCategory) => {
    switch (filter) {
      case 'MARKETPLACE':
        return {
          icon: '🛒',
          title: 'No Marketplace Requests',
          desc: 'You haven\'t posted any product or service requirements in the Universal Marketplace yet.',
          actionText: 'Explore Marketplace →',
          module: 'Marketplace',
        };
      case 'BUSINESS_IDEAS':
        return {
          icon: '💡',
          title: 'No Business Idea Requests',
          desc: 'Submit your innovative concept to FIC Incubation for feasibility assessment and mentor support.',
          actionText: 'Submit Business Idea →',
          module: 'Business Ideas',
        };
      case 'SCALING':
        return {
          icon: '📈',
          title: 'No Scaling Requests',
          desc: 'Run a chamber enterprise diagnostic to evaluate operational bottlenecks and scaling roadmaps.',
          actionText: 'Request Scaling Diagnostic →',
          module: 'Scaling',
        };
      case 'INVESTMENT':
        return {
          icon: '💼',
          title: 'No Investment Requests',
          desc: 'Submit your business capital requirement or register your syndicate investor profile.',
          actionText: 'Explore Investment →',
          module: 'Investment',
        };
      case 'MEETINGS':
        return {
          icon: '📅',
          title: 'No Meeting Requests',
          desc: 'Schedule bilateral chamber consultations or advisory meetings with FIC sector desks.',
          actionText: 'Schedule Meeting →',
          module: 'Meetings',
        };
      case 'SERVICES':
        return {
          icon: '⚙️',
          title: 'No Service Requests',
          desc: 'List your verified B2B capabilities and offerings for member discovery.',
          actionText: 'Publish Capabilities →',
          module: 'My Services',
        };
      case 'ALL':
      default:
        return {
          icon: '📋',
          title: 'No requests yet',
          desc: 'You haven\'t submitted any service requirements or chamber requests yet.',
          actionText: 'Explore Services →',
          module: 'Services',
        };
    }
  };

  // Helper for function badge styling
  const getFunctionBadgeColors = (func: FunctionCategory) => {
    switch (func) {
      case 'MARKETPLACE':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE' };
      case 'BUSINESS_IDEAS':
        return { bg: '#FAF5FF', text: '#7C3AED', border: '#F3E8FF' };
      case 'SCALING':
        return { bg: '#F0FDF4', text: '#16A34A', border: '#DCFCE7' };
      case 'INVESTMENT':
        return { bg: '#FFFBEB', text: '#D97706', border: '#FEF3C7' };
      case 'MEETINGS':
        return { bg: '#ECFEFF', text: '#0891B2', border: '#CFFAFE' };
      case 'SERVICES':
        return { bg: '#FDF2F8', text: '#DB2777', border: '#FCE7F3' };
      default:
        return { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' };
    }
  };

  // Helper for status badge styling
  const getStatusBadgeStyle = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s.includes('CONFIRM') || s.includes('COMPLET') || s.includes('ACTIVE')) {
      return { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' };
    }
    if (s.includes('REJECT') || s.includes('CANCEL') || s.includes('DECLIN')) {
      return { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' };
    }
    if (s.includes('PENDING') || s.includes('RESCHEDULE') || s.includes('PROPOSAL')) {
      return { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' };
    }
    // Default: Sent / Under Review / Scheduled
    return { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' };
  };

  // Mentor Consultation Actions Handlers
  const handleOpenAcceptModal = (booking: ConsultationBooking) => {
    setAcceptModalBooking(booking);
    setAcceptDate(booking.requestedDate);
    setAcceptTime(booking.requestedTime);
    setAcceptMode('Google Meet');
    setAcceptMeetUrl('https://meet.google.com/fic-' + Math.random().toString(36).substring(2, 6));
    setAcceptNotes('Please review the preparatory notes and be ready with questions.');
  };

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

  const handleOpenRescheduleModal = (booking: ConsultationBooking) => {
    setRescheduleModalBooking(booking);
    setRescheduleDate('Next Mon (10 Mar)');
    setRescheduleTime('02:00 PM - 02:45 PM');
    setRescheduleNotes('I have a prior chamber manufacturing audit scheduled at that time. Would this slot work?');
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleModalBooking) return;
    proposeReschedule(rescheduleModalBooking.id, {
      proposedDate: rescheduleDate,
      proposedTime: rescheduleTime,
      notes: rescheduleNotes,
    });
    setRescheduleModalBooking(null);
  };

  const handleOpenRejectModal = (booking: ConsultationBooking) => {
    setRejectModalBooking(booking);
    setRejectionReason('Currently at maximum cohort mentorship capacity. Please reapply next month or explore our recorded masterclasses.');
  };

  const handleConfirmReject = () => {
    if (!rejectModalBooking) return;
    rejectConsultation(rejectModalBooking.id, rejectionReason);
    setRejectModalBooking(null);
  };

  const handleOpenCompleteModal = (booking: ConsultationBooking) => {
    setCompleteModalBooking(booking);
    setCompleteSummary(`Completed comprehensive 1-on-1 session on "${booking.topic}". Evaluated student project deliverables, answered questions, and reviewed practical application.`);
    setCompleteMaterials('CNC Multi-Axis G-Code Programming Guide, Toolpath Optimization Masterclass v2');
    setCompleteGuidance('Practice 3D CAD modeling tolerances in CAM software and submit weekly audit progress for review.');
  };

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

      {/* Horizontally Scrollable 7 Filter Tabs (Sticky below Header) */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.key;
            const count = counts[tab.key] || 0;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.filterTabPill, isActive && styles.filterTabPillActive]}
                activeOpacity={0.7}
                onPress={() => setActiveFilter(tab.key)}
              >
                <Text style={[styles.filterTabPillText, isActive && styles.filterTabPillTextActive]}>
                  {tab.label}
                </Text>
                <View style={[styles.filterCounterBadge, isActive && styles.filterCounterBadgeActive]}>
                  <Text style={[styles.filterCounterText, isActive && styles.filterCounterTextActive]}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Requests List or Empty State */}
        {currentRequests.length === 0 ? (
          (() => {
            const empty = getEmptyStateContent(activeFilter);
            return (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>{empty.icon}</Text>
                <Text style={styles.emptyTitle}>{empty.title}</Text>
                <Text style={styles.emptySub}>{empty.desc}</Text>
                {onNavigateToModule && (
                  <TouchableOpacity
                    style={styles.emptyActionBtn}
                    activeOpacity={0.85}
                    onPress={() => onNavigateToModule(empty.module)}
                  >
                    <Text style={styles.emptyActionBtnText}>{empty.actionText}</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })()
        ) : (
          currentRequests.map((req) => {
            const funcBadge = getFunctionBadgeColors(req.functionType);
            const statusStyle = getStatusBadgeStyle(req.status);

            return (
              <View key={req.id} style={styles.requestCard}>
                {/* Header Row: Tracking Number, Function Label Badge, and Status */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.headerLeftGroup}>
                    <View style={styles.trackingRefPill}>
                      <Text style={styles.trackingRefText}>{req.trackingNumber}</Text>
                    </View>
                    <View
                      style={[
                        styles.functionPill,
                        { backgroundColor: funcBadge.bg, borderColor: funcBadge.border },
                      ]}
                    >
                      <Text style={[styles.functionPillText, { color: funcBadge.text }]}>
                        {req.functionLabel}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.statusBadgePill,
                      { backgroundColor: statusStyle.bg, borderColor: statusStyle.dot + '33' },
                    ]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                      {req.status}
                    </Text>
                  </View>
                </View>

                {/* Request Title */}
                <Text style={styles.requestTitle}>{req.title}</Text>
                <Text style={styles.requestCategoryText}>Category: {req.category}</Text>

                {/* Function-Specific Details Box */}
                <View style={styles.detailsBox}>
                  {/* Common Details */}
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Request Type:</Text>
                    <Text style={styles.metaVal}>{req.type}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Submitted Date:</Text>
                    <Text style={styles.metaVal}>{req.submittedDate}</Text>
                  </View>

                  {/* 1. INVESTMENT SPECIFIC DETAILS */}
                  {req.functionType === 'INVESTMENT' && (
                    <>
                      {req.details.fundingType && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Funding Type:</Text>
                          <Text style={styles.metaVal}>{req.details.fundingType}</Text>
                        </View>
                      )}
                      {req.details.requestedAmount && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Requested Amount:</Text>
                          <Text style={[styles.metaVal, { color: '#059669', fontWeight: '800' }]}>
                            {req.details.requestedAmount}
                          </Text>
                        </View>
                      )}
                      {req.details.businessStage && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Business Stage:</Text>
                          <Text style={styles.metaVal}>{req.details.businessStage}</Text>
                        </View>
                      )}
                      {req.details.equityOffered && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Equity Offered:</Text>
                          <Text style={styles.metaVal}>{req.details.equityOffered}</Text>
                        </View>
                      )}
                      {req.details.timeline && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Expected Timeline:</Text>
                          <Text style={styles.metaVal}>{req.details.timeline}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* 2. SCALING SPECIFIC DETAILS */}
                  {req.functionType === 'SCALING' && (
                    <>
                      {req.details.businessName && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Business Name:</Text>
                          <Text style={styles.metaVal}>{req.details.businessName}</Text>
                        </View>
                      )}
                      {req.details.scalingType && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Scaling Focus:</Text>
                          <Text style={styles.metaVal}>{req.details.scalingType}</Text>
                        </View>
                      )}
                      {req.details.requiredSupport && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Required Support:</Text>
                          <Text style={[styles.metaVal, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
                            {req.details.requiredSupport}
                          </Text>
                        </View>
                      )}
                      {req.details.turnover && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Current Turnover:</Text>
                          <Text style={styles.metaVal}>{req.details.turnover}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* 3. MARKETPLACE SPECIFIC DETAILS */}
                  {req.functionType === 'MARKETPLACE' && (
                    <>
                      {req.details.targetQuantity && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Target Quantity:</Text>
                          <Text style={styles.metaVal}>{req.details.targetQuantity}</Text>
                        </View>
                      )}
                      {req.details.assignedDesk && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Assigned Desk:</Text>
                          <Text style={styles.metaVal}>{req.details.assignedDesk}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* 4. BUSINESS IDEAS SPECIFIC DETAILS */}
                  {req.functionType === 'BUSINESS_IDEAS' && (
                    <>
                      {req.details.stage && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Incubation Stage:</Text>
                          <Text style={styles.metaVal}>{req.details.stage}</Text>
                        </View>
                      )}
                      {req.details.feasibilityScore !== undefined && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Feasibility Score:</Text>
                          <Text style={[styles.metaVal, { color: '#7C3AED', fontWeight: '800' }]}>
                            {req.details.feasibilityScore}/100
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* 5. MEETINGS SPECIFIC DETAILS */}
                  {req.functionType === 'MEETINGS' && (
                    <>
                      {req.details.meetingMode && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Meeting Mode:</Text>
                          <Text style={styles.metaVal}>{req.details.meetingMode}</Text>
                        </View>
                      )}
                      {req.details.preferredDate && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Scheduled Window:</Text>
                          <Text style={[styles.metaVal, { color: '#0891B2', fontWeight: '700' }]}>
                            {req.details.preferredDate}
                          </Text>
                        </View>
                      )}
                      {req.details.moderatorName && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Facilitator / Desk:</Text>
                          <Text style={styles.metaVal}>{req.details.moderatorName}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* 6. SERVICES SPECIFIC DETAILS */}
                  {req.functionType === 'SERVICES' && (
                    <>
                      {req.details.serviceType && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Capability Model:</Text>
                          <Text style={styles.metaVal}>{req.details.serviceType}</Text>
                        </View>
                      )}
                      {req.details.fee && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Commercial Fee:</Text>
                          <Text style={[styles.metaVal, { color: '#DB2777', fontWeight: '800' }]}>
                            {req.details.fee}
                          </Text>
                        </View>
                      )}
                      {req.details.deliverables && (
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Deliverables:</Text>
                          <Text style={[styles.metaVal, { flex: 1, textAlign: 'right' }]} numberOfLines={1}>
                            {req.details.deliverables}
                          </Text>
                        </View>
                      )}
                    </>
                  )}
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  style={styles.viewTimelineBtn}
                  activeOpacity={0.85}
                  onPress={() => setSelectedUnifiedReq(req)}
                >
                  <Text style={styles.viewTimelineBtnText}>View Details →</Text>
                </TouchableOpacity>

                {/* Interactive Action Button for Virtual Meetings */}
                {req.functionType === 'MEETINGS' && req.details.meetingLinkOrLocation && req.status.includes('CONFIRM') && (
                  <TouchableOpacity
                    style={styles.enterMeetingBtn}
                    activeOpacity={0.85}
                    onPress={() => {
                      launchAssignedMeeting({
                        id: req.id,
                        title: req.title,
                        platform: req.details.meetingLinkOrLocation?.includes('zoom')
                          ? 'Zoom'
                          : req.details.meetingLinkOrLocation?.includes('teams')
                          ? 'Microsoft Teams'
                          : 'Google Meet',
                        meetingUrl: req.details.meetingLinkOrLocation,
                      });
                    }}
                  >
                    <Text style={styles.enterMeetingBtnText}>Enter Chamber Meeting →</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* UNIVERSAL FUNCTION-SPECIFIC REQUEST DETAILS MODAL              */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={!!selectedUnifiedReq}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedUnifiedReq(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.modalTitle}>{selectedUnifiedReq?.trackingNumber}</Text>
                  {selectedUnifiedReq && (
                    <View
                      style={[
                        styles.functionPill,
                        {
                          backgroundColor: getFunctionBadgeColors(selectedUnifiedReq.functionType).bg,
                          borderColor: getFunctionBadgeColors(selectedUnifiedReq.functionType).border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.functionPillText,
                          { color: getFunctionBadgeColors(selectedUnifiedReq.functionType).text },
                        ]}
                      >
                        {selectedUnifiedReq.functionLabel}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalSubtitle} numberOfLines={2}>
                  {selectedUnifiedReq?.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setSelectedUnifiedReq(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedUnifiedReq && (
                <View style={styles.detailSectionBox}>
                  {/* Status Row */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Request Status</Text>
                    <View
                      style={[
                        styles.statusBadgePill,
                        {
                          backgroundColor: getStatusBadgeStyle(selectedUnifiedReq.status).bg,
                          borderColor: getStatusBadgeStyle(selectedUnifiedReq.status).dot + '33',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusBadgeStyle(selectedUnifiedReq.status).dot },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: getStatusBadgeStyle(selectedUnifiedReq.status).text },
                        ]}
                      >
                        {selectedUnifiedReq.status}
                      </Text>
                    </View>
                  </View>

                  {/* Submission Date */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submission Date</Text>
                    <Text style={styles.detailVal}>{selectedUnifiedReq.submittedDate}</Text>
                  </View>

                  {/* Sector / Category */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sector / Category</Text>
                    <Text style={styles.detailVal}>{selectedUnifiedReq.category}</Text>
                  </View>

                  {/* Request Type */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Request Type</Text>
                    <Text style={styles.detailVal}>{selectedUnifiedReq.type}</Text>
                  </View>

                  {/* Investment Fields */}
                  {selectedUnifiedReq.functionType === 'INVESTMENT' && (
                    <>
                      {selectedUnifiedReq.details.fundingType && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Funding / Investor Type</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.fundingType}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.requestedAmount && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Requested Amount</Text>
                          <Text style={[styles.detailVal, { color: '#059669', fontWeight: '800' }]}>
                            {selectedUnifiedReq.details.requestedAmount}
                          </Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.businessStage && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Business Stage</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.businessStage}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.equityOffered && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Equity Offered</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.equityOffered}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.timeline && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Funding Timeline</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.timeline}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.businessLocation && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Target Location</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.businessLocation}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Scaling Fields */}
                  {selectedUnifiedReq.functionType === 'SCALING' && (
                    <>
                      {selectedUnifiedReq.details.businessName && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Business Name</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.businessName}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.scalingType && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Scaling Focus</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.scalingType}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.turnover && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Current Turnover</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.turnover}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.growthArea && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Strategic Growth Area</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.growthArea}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Marketplace Fields */}
                  {selectedUnifiedReq.functionType === 'MARKETPLACE' && (
                    <>
                      {selectedUnifiedReq.details.targetQuantity && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Target Quantity</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.targetQuantity}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Business Ideas Fields */}
                  {selectedUnifiedReq.functionType === 'BUSINESS_IDEAS' && (
                    <>
                      {selectedUnifiedReq.details.conceptTitle && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Concept Title</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.conceptTitle}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.stage && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Incubation Stage</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.stage}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.feasibilityScore !== undefined && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Feasibility Score</Text>
                          <Text style={[styles.detailVal, { color: '#7C3AED', fontWeight: '800' }]}>
                            {selectedUnifiedReq.details.feasibilityScore}/100
                          </Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Meetings Fields */}
                  {selectedUnifiedReq.functionType === 'MEETINGS' && (
                    <>
                      {selectedUnifiedReq.details.meetingMode && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Meeting Mode</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.meetingMode}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.preferredDate && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Scheduled Window</Text>
                          <Text style={[styles.detailVal, { color: '#0891B2' }]}>
                            {selectedUnifiedReq.details.preferredDate}
                          </Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.moderatorName && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Facilitator</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.moderatorName}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Services Fields */}
                  {selectedUnifiedReq.functionType === 'SERVICES' && (
                    <>
                      {selectedUnifiedReq.details.serviceType && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Service Model</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.serviceType}</Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.fee && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Commercial Fee</Text>
                          <Text style={[styles.detailVal, { color: '#DB2777' }]}>
                            {selectedUnifiedReq.details.fee}
                          </Text>
                        </View>
                      )}
                      {selectedUnifiedReq.details.deliverables && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>Deliverables</Text>
                          <Text style={styles.detailVal}>{selectedUnifiedReq.details.deliverables}</Text>
                        </View>
                      )}
                    </>
                  )}

                  {/* Desk & Assigned Facilitator */}
                  {selectedUnifiedReq.details.assignedDesk && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Assigned Chamber Desk</Text>
                      <Text style={styles.detailVal}>{selectedUnifiedReq.details.assignedDesk}</Text>
                    </View>
                  )}

                  {/* Estimated Response SLA */}
                  {selectedUnifiedReq.details.estimatedResponse && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Estimated Response</Text>
                      <Text style={styles.detailVal}>{selectedUnifiedReq.details.estimatedResponse}</Text>
                    </View>
                  )}

                  {/* Detailed Description / Notes */}
                  {selectedUnifiedReq.details.notes && (
                    <View style={{ marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                      <Text style={[styles.detailLabel, { marginBottom: 4, fontWeight: '700' }]}>
                        Submitted Requirements & Notes:
                      </Text>
                      <Text style={styles.detailNotesText}>{selectedUnifiedReq.details.notes}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* MENTOR ACTION MODALS (Accept, Reschedule, Reject, Complete)    */}
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
                      style={[styles.modeChip, acceptMode === mode && styles.modeChipActive]}
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
                      <Text style={[styles.modeChipText, acceptMode === mode && styles.modeChipTextActive]}>
                        {mode === 'Google Meet'
                          ? '📹 Meet'
                          : mode === 'Zoom'
                          ? '🟦 Zoom'
                          : mode === 'Microsoft Teams'
                          ? '👥 Teams'
                          : '🏛️ Offline'}
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

      {/* Reschedule Modal */}
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
                <Text style={styles.modalTitle}>Propose Reschedule</Text>
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
                <Text style={styles.modalFormLabel}>Proposed Alternate Date *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={rescheduleDate}
                  onChangeText={setRescheduleDate}
                  placeholder="e.g. Next Mon (10 Mar)"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Proposed Alternate Time Window *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={rescheduleTime}
                  onChangeText={setRescheduleTime}
                  placeholder="e.g. 02:00 PM - 02:45 PM"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Reason for Rescheduling</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={rescheduleNotes}
                  onChangeText={setRescheduleNotes}
                  multiline
                  numberOfLines={3}
                  placeholder="Explain why the original requested slot is unavailable..."
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#F59E0B', marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmReschedule}
                >
                  <Text style={styles.modalSubmitBtnText}>Send Alternate Slot Proposal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Reject Modal */}
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
                <Text style={styles.modalTitle}>Decline Consultation</Text>
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
                <Text style={styles.modalFormLabel}>Reason for Declining *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={4}
                  placeholder="Explain why this request cannot be accommodated..."
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#DC2626', marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmReject}
                >
                  <Text style={styles.modalSubmitBtnText}>Decline Consultation</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Complete Modal */}
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
                <Text style={styles.modalTitle}>Complete Session & Log Certificate</Text>
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
                <Text style={styles.modalFormLabel}>Session Summary *</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={completeSummary}
                  onChangeText={setCompleteSummary}
                  multiline
                  numberOfLines={3}
                  placeholder="Key concepts discussed and student progress..."
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Recommended Study Materials</Text>
                <TextInput
                  style={styles.modalInput}
                  value={completeMaterials}
                  onChangeText={setCompleteMaterials}
                  placeholder="e.g. Masterclass links, guides, documentation"
                  placeholderTextColor="#94A3B8"
                />

                <Text style={[styles.modalFormLabel, { marginTop: 12 }]}>Follow-up Action Steps</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  value={completeGuidance}
                  onChangeText={setCompleteGuidance}
                  multiline
                  numberOfLines={2}
                  placeholder="Suggested projects, milestones, or next steps..."
                  placeholderTextColor="#94A3B8"
                />

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, { backgroundColor: '#10B981', marginTop: 18 }]}
                  activeOpacity={0.85}
                  onPress={handleConfirmComplete}
                >
                  <Text style={styles.modalSubmitBtnText}>✓ Conclude Session & Issue Audit</Text>
                </TouchableOpacity>
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
    paddingBottom: 40,
  },
  // 7 Filter Tabs Row Styling (Sticky below Header)
  filterTabsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterTabsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  filterTabPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  filterTabPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  filterTabPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterCounterBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6.5,
    paddingVertical: 1.5,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCounterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  filterCounterTextActive: {
    color: '#FFFFFF',
  },
  // Request Card Styling
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
    marginBottom: 10,
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
  functionPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  functionPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  statusBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  requestTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  requestCategoryText: {
    fontSize: 11.5,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: fontSansSerif,
    marginBottom: 12,
  },
  detailsBox: {
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
    alignItems: 'center',
    marginBottom: 4,
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
    paddingVertical: 10,
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
  enterMeetingBtn: {
    marginTop: 8,
    backgroundColor: '#0891B2',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  enterMeetingBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  // Universal Modal Styling
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
    gap: 10,
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
  detailNotesText: {
    fontSize: 12,
    color: '#334155',
    fontFamily: fontSansSerif,
    lineHeight: 18,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  // Empty State Styling
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15.5,
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
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  // Mentor Modals Styling
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
});
