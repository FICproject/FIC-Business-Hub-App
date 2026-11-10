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
  PermissionsAndroid,
  Linking,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import DocumentPicker, { types as docTypes } from 'react-native-document-picker';
import { StandardHeader } from '../../components/common/StandardHeader';
import { FieldError } from '../../components/common/FieldError';
import { useAuth } from '../../state/AuthContext';
import { useStudentMentor } from '../../state/StudentMentorContext';
import { notify } from '../../components/common/NotificationContext';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface AttachedVideoFile {
  uri: string;
  name: string;
  size: string;
  sizeBytes?: number;
  format: string;
  duration?: string;
  status: 'ATTACHED' | 'UPLOADED';
}

interface ProviderService {
  id: string;
  title: string;
  type: 'B2B Capability' | 'Masterclass' | 'Teaching Service';
  sector: string;
  deliverables: string;
  tat: string;
  fee?: string;
  inquiriesCount: number;
  status: 'ACTIVE' | 'UNDER_REVIEW' | 'PAUSED' | 'DRAFT';
  subcategory?: string;
  shortSummary?: string;
  fullDescription?: string;
  keyServices?: string;
  coreSkills?: string;
  marketplaceTags?: string;
  coverageArea?: string;
  deliveryMode?: string;
  portfolioUrl?: string;
  certificationRef?: string;
  governanceAgreed?: boolean;
}

const SECTOR_OPTIONS = [
  'Manufacturing',
  'Technology',
  'Business & Entrepreneurship',
  'Professional Services',
  'Agriculture',
  'Investment & Finance',
  'Education',
  'Healthcare',
  'Creative Media',
  'Employment & Community',
];

const COVERAGE_AREA_OPTIONS = [
  'All India (Pan-India)',
  'Regional / State-Level',
  'Local / District Only',
  'International / Export',
];

const DELIVERY_MODE_OPTIONS = [
  'Hybrid (On-Site & Remote)',
  'On-Site / Physical Facility',
  '100% Virtual / Remote',
  'Direct Shipment / Courier',
];

interface CourseItem {
  id: string;
  title: string;
  domain: string;
  language: string;
  duration: string;
  lessonsCount: number;
  enrolledStudents: number;
  rating: number;
  fileName?: string;
  fileSize?: string;
  status: 'PUBLISHED' | 'IN_REVIEW';
}

interface ConsultationRequest {
  id: string;
  studentName: string;
  college: string;
  topic: string;
  requestedSlot: string;
  timeWindow: string;
  status: 'PENDING' | 'SCHEDULED' | 'REJECTED' | 'COMPLETED';
}

const INITIAL_SERVICES: ProviderService[] = [];
const INITIAL_COURSES: CourseItem[] = [];
const INITIAL_CONSULTATIONS: ConsultationRequest[] = [];

interface MyServicesScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const MyServicesScreen: React.FC<MyServicesScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const { publishCourse } = useStudentMentor();
  const subLower = user?.subcategory?.toLowerCase() || '';
  const isMentor =
    user?.role === 'PROFESSOR' ||
    (user?.role as any) === 'MENTOR' ||
    subLower === 'mentor' ||
    subLower === 'mentor / trainer' ||
    subLower === 'mentor/trainer' ||
    subLower === 'trainer' ||
    subLower === 'teacher' ||
    subLower === 'professor' ||
    subLower === 'teacher / professor' ||
    subLower === 'teacher/professor';

  const [services, setServices] = useState<ProviderService[]>(INITIAL_SERVICES);
  const [courses, setCourses] = useState<CourseItem[]>(INITIAL_COURSES);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>(INITIAL_CONSULTATIONS);

  // Mentor Tabs: TEACHING, VIDEOS, CAPABILITIES, REQUESTS
  // Provider Tabs: ALL, B2B, MASTERCLASS
  const [mentorTab, setMentorTab] = useState<'TEACHING' | 'VIDEOS' | 'CAPABILITIES' | 'REQUESTS'>('TEACHING');
  const [providerTab, setProviderTab] = useState<'ALL' | 'B2B' | 'MASTERCLASS'>('ALL');

  // Modals
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [courseUploadModalVisible, setCourseUploadModalVisible] = useState(false);
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationRequest | null>(null);

  // --- Complete Add New Service / Capability Form State (Matching Website) ---
  const [serviceTitle, setServiceTitle] = useState('');
  const [primarySector, setPrimarySector] = useState('Manufacturing');
  const [serviceType, setServiceType] = useState<'Teaching Service' | 'B2B Capability'>('B2B Capability');
  const [subcategory, setSubcategory] = useState('');
  const [cardSummary, setCardSummary] = useState('');
  const [fullDescription, setFullDescription] = useState('');

  // Scope, Deliverables & Delivery
  const [keyServices, setKeyServices] = useState('');
  const [coreSkills, setCoreSkills] = useState('');
  const [marketplaceTags, setMarketplaceTags] = useState('');
  const [coverageArea, setCoverageArea] = useState('All India (Pan-India)');
  const [deliveryMode, setDeliveryMode] = useState('Hybrid (On-Site & Remote)');

  // Portfolio & Supporting Proof (Optional)
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [certificationRef, setCertificationRef] = useState('');

  // Governance Protocol Checkbox
  const [governanceAgreed, setGovernanceAgreed] = useState(false);

  // Dropdown Pickers
  const [sectorPickerVisible, setSectorPickerVisible] = useState(false);
  const [coveragePickerVisible, setCoveragePickerVisible] = useState(false);
  const [deliveryPickerVisible, setDeliveryPickerVisible] = useState(false);

  // Form Validation Errors
  const [formErrors, setFormErrors] = useState<{
    serviceTitle?: string;
    primarySector?: string;
    fullDescription?: string;
    governanceAgreed?: string;
  }>({});

  const resetPublishForm = () => {
    setServiceTitle('');
    setPrimarySector('Manufacturing');
    setSubcategory('');
    setCardSummary('');
    setFullDescription('');
    setKeyServices('');
    setCoreSkills('');
    setMarketplaceTags('');
    setCoverageArea('All India (Pan-India)');
    setDeliveryMode('Hybrid (On-Site & Remote)');
    setPortfolioUrl('');
    setCertificationRef('');
    setGovernanceAgreed(false);
    setFormErrors({});
  };

  const handleCancelPublish = () => {
    resetPublishForm();
    setServiceModalVisible(false);
  };

  const handleSaveDraft = () => {
    if (!serviceTitle.trim()) {
      setFormErrors({ serviceTitle: 'Service title is required to save a draft.' });
      notify.warning('Please enter a Service Title to save this draft.', 'Title Required');
      return;
    }

    const draftSrv: ProviderService = {
      id: `my-srv-${Date.now()}`,
      title: serviceTitle.trim(),
      type: serviceType,
      sector: primarySector,
      deliverables: keyServices.trim() || cardSummary.trim() || 'Custom Scope Draft',
      tat: deliveryMode,
      fee: 'Custom Quotation',
      inquiriesCount: 0,
      status: 'DRAFT',
      subcategory: subcategory.trim(),
      shortSummary: cardSummary.trim(),
      fullDescription: fullDescription.trim(),
      keyServices: keyServices.trim(),
      coreSkills: coreSkills.trim(),
      marketplaceTags: marketplaceTags.trim(),
      coverageArea,
      deliveryMode,
      portfolioUrl: portfolioUrl.trim(),
      certificationRef: certificationRef.trim(),
      governanceAgreed,
    };

    setServices((prev) => [draftSrv, ...prev]);
    resetPublishForm();
    setServiceModalVisible(false);
    notify.info('Your service listing has been saved as Draft.', 'Saved as Draft');
  };

  const handleSubmitForApproval = () => {
    const errors: {
      serviceTitle?: string;
      primarySector?: string;
      fullDescription?: string;
      governanceAgreed?: string;
    } = {};

    if (!serviceTitle.trim()) {
      errors.serviceTitle = 'Service Title is required *';
    }
    if (!primarySector.trim()) {
      errors.primarySector = 'Primary Sector is required *';
    }
    if (!fullDescription.trim()) {
      errors.fullDescription = 'Full Description & Scope of Capability is required *';
    }
    if (!governanceAgreed) {
      errors.governanceAgreed = 'You must accept the FIC Intermediary Governance Protocol to submit *';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      notify.warning(
        'Please complete all mandatory fields (*) and accept the governance declaration.',
        'Validation Error'
      );
      return;
    }

    const newSrv: ProviderService = {
      id: `my-srv-${Date.now()}`,
      title: serviceTitle.trim(),
      type: serviceType,
      sector: primarySector,
      deliverables: keyServices.trim() || cardSummary.trim() || fullDescription.trim().slice(0, 120),
      tat: deliveryMode,
      fee: 'FIC Escrow / Quote',
      inquiriesCount: 0,
      status: 'UNDER_REVIEW',
      subcategory: subcategory.trim(),
      shortSummary: cardSummary.trim(),
      fullDescription: fullDescription.trim(),
      keyServices: keyServices.trim(),
      coreSkills: coreSkills.trim(),
      marketplaceTags: marketplaceTags.trim(),
      coverageArea,
      deliveryMode,
      portfolioUrl: portfolioUrl.trim(),
      certificationRef: certificationRef.trim(),
      governanceAgreed: true,
    };

    setServices((prev) => [newSrv, ...prev]);
    resetPublishForm();
    setServiceModalVisible(false);
    notify.success(
      'Your service listing has been submitted for FIC Sub-Admin moderation. Once approved, it will be published to the Marketplace.',
      'Submitted for FIC Approval'
    );
  };

  // New Course Upload Form
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDomain, setCourseDomain] = useState('Manufacturing & Industrial');
  const [courseLanguage, setCourseLanguage] = useState<'Tamil' | 'English' | 'Hindi'>('Tamil');
  const [courseDuration, setCourseDuration] = useState('3.5 Hours');
  const [courseLessonsCount, setCourseLessonsCount] = useState('6');
  const [courseCurriculum, setCourseCurriculum] = useState('');
  const [attachedVideoFile, setAttachedVideoFile] = useState<AttachedVideoFile | null>(null);
  const [videoSourceModalVisible, setVideoSourceModalVisible] = useState(false);
  const [videoPreviewModalVisible, setVideoPreviewModalVisible] = useState(false);
  const [newDateSlot, setNewDateSlot] = useState('Next Mon (10 Mar)');
  const [newTimeSlot, setNewTimeSlot] = useState('02:00 PM IST');

  // Inline Validation Errors for Course Upload
  const [courseTitleError, setCourseTitleError] = useState<string | null>(null);
  const [courseCurriculumError, setCourseCurriculumError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Video Validation & Attachment Handler (MP4, WebM, MOV <= 250MB)
  const validateAndAttachVideo = (file: {
    uri: string;
    name: string;
    size?: number;
    duration?: number;
    type?: string;
    width?: number;
    height?: number;
  }) => {
    setVideoError(null);

    // Validate format (MP4, WebM, MOV)
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const validExtensions = ['mp4', 'webm', 'mov'];
    const isMimeVideo = file.type?.startsWith('video/') || false;

    if (!validExtensions.includes(ext) && !isMimeVideo) {
      setVideoError('Unsupported format. Only MP4, WebM, and MOV video files are permitted.');
      return;
    }

    // Validate size (Max 250MB = 250 * 1024 * 1024)
    const MAX_SIZE_BYTES = 250 * 1024 * 1024;
    if (file.size && file.size > MAX_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setVideoError(`File size (${sizeMB} MB) exceeds maximum permitted limit of 250 MB.`);
      return;
    }

    let formattedSize = 'Unknown Size';
    if (file.size) {
      formattedSize =
        file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;
    }

    let formattedDuration: string | undefined = undefined;
    if (file.duration) {
      const totalSecs = Math.round(file.duration);
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs} min`;
    }

    setAttachedVideoFile({
      uri: file.uri,
      name: file.name,
      size: formattedSize,
      sizeBytes: file.size,
      format: (ext || file.type?.replace('video/', '') || 'mp4').toUpperCase(),
      duration: formattedDuration,
      status: 'ATTACHED',
    });
    setVideoError(null);
  };

  // 1. Choose from Gallery
  const handleChooseFromGallery = async () => {
    setVideoSourceModalVisible(false);
    try {
      if (Platform.OS === 'android') {
        const permission =
          Platform.Version >= 33
            ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
            : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        if (permission) {
          const granted = await PermissionsAndroid.request(permission, {
            title: 'Storage Permission',
            message: 'FIC Business Hub needs access to your gallery to select masterclass lecture videos.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          });
          if (granted !== PermissionsAndroid.RESULTS.GRANTED && granted !== 'never_ask_again') {
            setVideoError('Storage permission is required to select videos from gallery.');
            return;
          }
        }
      }

      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
        includeBase64: false,
      });

      if (result.didCancel) {
        // User cancelled picker - keep previous selection unchanged
        return;
      }

      if (result.errorCode) {
        setVideoError(result.errorMessage || 'Unable to open video gallery.');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        return;
      }

      validateAndAttachVideo({
        uri: asset.uri,
        name: asset.fileName || `masterclass_lecture_${Date.now()}.mp4`,
        size: asset.fileSize,
        duration: asset.duration,
        type: asset.type,
        width: asset.width,
        height: asset.height,
      });
    } catch (err: any) {
      console.warn('Gallery video error:', err);
      setVideoError(err?.message || 'Failed to select video from gallery.');
    }
  };

  // 2. Browse Device Files
  const handleBrowseDeviceFiles = async () => {
    setVideoSourceModalVisible(false);
    try {
      const res = await DocumentPicker.pick({
        type: [docTypes.video, 'video/mp4', 'video/webm', 'video/quicktime', 'video/*'],
        copyTo: 'cachesDirectory',
        allowMultiSelection: false,
      });

      const file = Array.isArray(res) ? res[0] : res;
      if (!file || !file.uri) {
        return;
      }

      validateAndAttachVideo({
        uri: file.fileCopyUri || file.uri,
        name: file.name || `masterclass_lecture_${Date.now()}.mp4`,
        size: file.size ?? undefined,
        type: file.type ?? undefined,
      });
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled document picker - keep previous selection unchanged
        return;
      }
      console.warn('Browse video error:', err);
      setVideoError('Unable to open file manager. Please try again.');
    }
  };

  // 3. Record Video with Camera
  const handleRecordVideo = async () => {
    setVideoSourceModalVisible(false);
    try {
      if (Platform.OS === 'android') {
        const cameraGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'FIC Business Hub needs camera access to record masterclass lecture videos.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );
        const audioGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'FIC Business Hub needs microphone access to record audio for masterclass lecture videos.',
            buttonPositive: 'Allow',
            buttonNegative: 'Cancel',
          }
        );

        if (
          cameraGranted !== PermissionsAndroid.RESULTS.GRANTED ||
          audioGranted !== PermissionsAndroid.RESULTS.GRANTED
        ) {
          setVideoError('Camera and Microphone permissions are required to record video.');
          return;
        }
      }

      const result = await launchCamera({
        mediaType: 'video',
        videoQuality: 'high',
        durationLimit: 600,
        saveToPhotos: true,
      });

      if (result.didCancel) {
        // User cancelled camera recording - keep previous selection unchanged
        return;
      }

      if (result.errorCode) {
        setVideoError(result.errorMessage || 'Unable to open camera for video recording.');
        return;
      }

      const asset = result.assets?.[0];
      if (!asset || !asset.uri) {
        return;
      }

      validateAndAttachVideo({
        uri: asset.uri,
        name: asset.fileName || `recorded_masterclass_${Date.now()}.mp4`,
        size: asset.fileSize,
        duration: asset.duration,
        type: asset.type,
        width: asset.width,
        height: asset.height,
      });
    } catch (err: any) {
      console.warn('Camera video error:', err);
      setVideoError(err?.message || 'Failed to record video.');
    }
  };

  // Handlers for Course Upload with Inline Validation
  const handleUploadCourse = () => {
    let hasError = false;

    if (!courseTitle.trim()) {
      setCourseTitleError('Please enter a Course Title.');
      hasError = true;
    } else {
      setCourseTitleError(null);
    }

    if (!courseCurriculum.trim()) {
      setCourseCurriculumError('Please provide curriculum & syllabus description.');
      hasError = true;
    } else {
      setCourseCurriculumError(null);
    }

    if (!attachedVideoFile) {
      setVideoError('Masterclass lecture video is required. Please select or record a video.');
      hasError = true;
    } else {
      setVideoError(null);
    }

    if (hasError || !attachedVideoFile) {
      return;
    }

    const newCrs: CourseItem = {
      id: `crs-${Date.now()}`,
      title: courseTitle,
      domain: courseDomain,
      language: courseLanguage,
      duration: courseDuration,
      lessonsCount: parseInt(courseLessonsCount, 10) || 6,
      enrolledStudents: 0,
      rating: 5.0,
      fileName: attachedVideoFile.name,
      fileSize: attachedVideoFile.size,
      status: 'PUBLISHED',
    };

    // Save to shared StudentMentorContext so students can immediately see and access this course
    publishCourse({
      title: courseTitle,
      domain: courseDomain,
      language: courseLanguage as any,
      duration: courseDuration,
      modulesCount: parseInt(courseLessonsCount, 10) || 6,
      level: 'Intermediate',
      syllabus: [courseCurriculum],
      description: courseCurriculum,
      videoFileName: attachedVideoFile.name,
      videoUri: attachedVideoFile.uri,
      videoSize: attachedVideoFile.size,
    });

    setCourses([newCrs, ...courses]);
    setCourseUploadModalVisible(false);
    setCourseTitle('');
    setCourseCurriculum('');
    setAttachedVideoFile(null);
    setCourseTitleError(null);
    setCourseCurriculumError(null);
    setVideoError(null);

    notify.success(
      `"${newCrs.title}" has been published with video "${newCrs.fileName}" (${newCrs.fileSize}) and added to the Student Skill Development catalog.`,
      'Masterclass Published'
    );
  };

  // Consultation Actions
  const handleAcceptConsultation = (id: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'SCHEDULED' } : c))
    );
    notify.success(
      'The consultation request has been accepted. Chamber room credentials have been generated and emailed to the student.',
      'Session Scheduled'
    );
  };

  const handleRejectConsultation = (id: string) => {
    notify.confirm({
      title: 'Decline Consultation',
      message: 'Are you sure you want to decline this student consultation request?',
      confirmText: 'Decline',
      cancelText: 'Cancel',
      isDestructive: true,
      onConfirm: () => {
        setConsultations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'REJECTED' } : c))
        );
        notify.warning('Consultation request has been declined.', 'Request Declined');
      },
    });
  };

  const handleOpenReschedule = (req: ConsultationRequest) => {
    setSelectedConsultation(req);
    setRescheduleModalVisible(true);
  };

  const handleConfirmReschedule = () => {
    if (!selectedConsultation) return;
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === selectedConsultation.id
          ? { ...c, requestedSlot: newDateSlot, timeWindow: newTimeSlot, status: 'SCHEDULED' }
          : c
      )
    );
    setRescheduleModalVisible(false);
    notify.info(`Session rescheduled to ${newDateSlot} at ${newTimeSlot}.`, 'Rescheduled');
  };

  const handleCompleteConsultation = (id: string) => {
    setConsultations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'COMPLETED' } : c))
    );
    notify.success(
      'Session status updated to Completed. Mentorship credits and chamber audit logs have been recorded.',
      'Consultation Completed'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title={isMentor ? 'Mentor Studio' : 'My Services'}
        subtitle={isMentor ? 'Teaching Services, Courses & Consultations' : 'Provider & Studio Listings'}
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="My Services"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* KPI Stats Row */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{isMentor ? courses.length : services.length}</Text>
            <Text style={styles.statLabel}>{isMentor ? 'Courses' : 'Listings'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#2563EB' }]}>
              {isMentor ? consultations.length : '42'}
            </Text>
            <Text style={styles.statLabel}>{isMentor ? 'Consultations' : 'Inquiries'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              {isMentor ? '24' : '23'}
            </Text>
            <Text style={styles.statLabel}>{isMentor ? 'Mentees' : 'Executed'}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#F59E0B' }]}>4.9 ★</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Dynamic Mentor Navigation Tabs */}
        {isMentor ? (
          <>
            <View style={styles.mentorTabsRow}>
              {(
                [
                  { key: 'TEACHING', label: 'Teaching' },
                  { key: 'VIDEOS', label: 'Skill Videos' },
                  { key: 'REQUESTS', label: `Requests (${consultations.filter(c => c.status === 'PENDING').length})` },
                  { key: 'CAPABILITIES', label: 'Marketplace' },
                ] as const
              ).map((t) => {
                const isActive = mentorTab === t.key;
                return (
                  <TouchableOpacity
                    key={t.key}
                    style={[styles.mentorTabChip, isActive && styles.mentorTabChipActive]}
                    activeOpacity={0.7}
                    onPress={() => setMentorTab(t.key)}
                  >
                    <Text style={[styles.mentorTabChipText, isActive && styles.mentorTabChipTextActive]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* TAB 1: TEACHING SERVICES */}
            {mentorTab === 'TEACHING' && (
              <View>
                <TouchableOpacity
                  style={styles.publishBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    setServiceType('Teaching Service');
                    setServiceModalVisible(true);
                  }}
                >
                  <Text style={styles.publishBtnText}>+ Add Teaching Service / Clinic</Text>
                </TouchableOpacity>

                {services.filter((s) => s.type === 'Teaching Service').length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>👨‍🏫</Text>
                    <Text style={styles.emptyTitle}>No teaching services listed yet</Text>
                    <Text style={styles.emptySub}>
                      Add 1-on-1 consultations or practical clinic sessions to guide members.
                    </Text>
                  </View>
                ) : (
                  services
                    .filter((s) => s.type === 'Teaching Service')
                    .map((service) => (
                      <View key={service.id} style={styles.serviceCard}>
                        <View style={styles.cardHeaderRow}>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>👨‍🏫 {service.type}</Text>
                          </View>
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeText}>✓ {service.status}</Text>
                          </View>
                        </View>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.sectorText}>Domain: {service.sector}</Text>
                        <View style={styles.deliverablesBox}>
                          <Text style={styles.deliverablesLabel}>Structure & Deliverables:</Text>
                          <Text style={styles.deliverablesVal}>{service.deliverables}</Text>
                        </View>
                        <View style={styles.footerRow}>
                          <View style={styles.tatPill}>
                            <Text style={styles.tatText}>💰 {service.fee || '₹1,500'}</Text>
                          </View>
                          <View style={styles.inquiriesPill}>
                            <Text style={styles.inquiriesText}>⏱ {service.tat}</Text>
                          </View>
                        </View>
                      </View>
                    ))
                )}
              </View>
            )}

            {/* TAB 2: SKILL VIDEOS & MASTERCLASSES */}
            {mentorTab === 'VIDEOS' && (
              <View>
                <TouchableOpacity
                  style={styles.publishBtn}
                  activeOpacity={0.88}
                  onPress={() => setCourseUploadModalVisible(true)}
                >
                  <Text style={styles.publishBtnText}>+ Upload New Course / Masterclass</Text>
                </TouchableOpacity>

                {courses.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>🎬</Text>
                    <Text style={styles.emptyTitle}>No courses available</Text>
                    <Text style={styles.emptySub}>
                      Upload your first masterclass or video lecture to build your student catalog.
                    </Text>
                  </View>
                ) : (
                  courses.map((crs) => (
                    <View key={crs.id} style={styles.serviceCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.typeBadge}>
                          <Text style={styles.typeBadgeText}>🎬 {crs.domain}</Text>
                        </View>
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>✓ {crs.status}</Text>
                        </View>
                      </View>
                      <Text style={styles.serviceTitle}>{crs.title}</Text>
                      <Text style={styles.sectorText}>Language: {crs.language} • Duration: {crs.duration}</Text>
                      <View style={styles.footerRow}>
                        <View style={styles.tatPill}>
                          <Text style={styles.tatText}>👥 {crs.enrolledStudents} Enrolled</Text>
                        </View>
                        <View style={styles.inquiriesPill}>
                          <Text style={styles.inquiriesText}>⭐ {crs.rating} / 5.0</Text>
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* TAB 3: CONSULTATION REQUESTS */}
            {mentorTab === 'REQUESTS' && (
              <View>
                <Text style={styles.sectionHeading}>Student Consultation Requests:</Text>
                {consultations.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyTitle}>No consultation requests yet</Text>
                    <Text style={styles.emptySub}>
                      When students request 1-on-1 guidance or technical reviews, they will appear here.
                    </Text>
                  </View>
                ) : (
                  consultations.map((req) => (
                  <View key={req.id} style={styles.requestCard}>
                    <View style={styles.requestHeader}>
                      <View>
                        <Text style={styles.reqStudentName}>{req.studentName}</Text>
                        <Text style={styles.reqCollege}>{req.college}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          req.status === 'SCHEDULED' && styles.statusBadgeScheduled,
                          req.status === 'COMPLETED' && styles.statusBadgeCompleted,
                          req.status === 'REJECTED' && styles.statusBadgeRejected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            req.status === 'SCHEDULED' && styles.statusTextScheduled,
                            req.status === 'COMPLETED' && styles.statusTextCompleted,
                            req.status === 'REJECTED' && styles.statusTextRejected,
                          ]}
                        >
                          {req.status}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.reqTopicLabel}>Consultation Agenda:</Text>
                    <Text style={styles.reqTopicText}>{req.topic}</Text>
                    <Text style={styles.reqSlotText}>📅 Slot: {req.requestedSlot} at {req.timeWindow}</Text>

                    {/* Action buttons depending on state */}
                    {req.status === 'PENDING' && (
                      <View style={styles.reqActionRow}>
                        <TouchableOpacity
                          style={styles.btnAccept}
                          activeOpacity={0.8}
                          onPress={() => handleAcceptConsultation(req.id)}
                        >
                          <Text style={styles.btnAcceptText}>✓ Accept & Schedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnReschedule}
                          activeOpacity={0.8}
                          onPress={() => handleOpenReschedule(req)}
                        >
                          <Text style={styles.btnRescheduleText}>📅 Reschedule</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.btnReject}
                          activeOpacity={0.8}
                          onPress={() => handleRejectConsultation(req.id)}
                        >
                          <Text style={styles.btnRejectText}>✕ Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {req.status === 'SCHEDULED' && (
                      <View style={styles.reqActionRow}>
                        <TouchableOpacity
                          style={styles.btnComplete}
                          activeOpacity={0.8}
                          onPress={() => handleCompleteConsultation(req.id)}
                        >
                          <Text style={styles.btnCompleteText}>✓ Complete & Log Chamber Audit</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))
              )}
            </View>
          )}

            {/* TAB 4: MARKETPLACE CAPABILITIES */}
            {mentorTab === 'CAPABILITIES' && (
              <View>
                <TouchableOpacity
                  style={styles.publishBtn}
                  activeOpacity={0.88}
                  onPress={() => {
                    setServiceType('B2B Capability');
                    setServiceModalVisible(true);
                  }}
                >
                  <Text style={styles.publishBtnText}>+ Publish B2B Capability</Text>
                </TouchableOpacity>

                {services.filter((s) => s.type === 'B2B Capability').length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>⚙️</Text>
                    <Text style={styles.emptyTitle}>No B2B capabilities listed yet</Text>
                    <Text style={styles.emptySub}>
                      Publish your machining, tooling, or engineering capabilities to receive inquiries.
                    </Text>
                  </View>
                ) : (
                  services
                    .filter((s) => s.type === 'B2B Capability')
                    .map((service) => (
                      <View key={service.id} style={styles.serviceCard}>
                        <View style={styles.cardHeaderRow}>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{service.type}</Text>
                          </View>
                          <View
                            style={[
                              styles.activeBadge,
                              service.status === 'UNDER_REVIEW' && styles.statusBadgeUnderReview,
                              service.status === 'DRAFT' && styles.statusBadgeDraft,
                            ]}
                          >
                            <Text
                              style={[
                                styles.activeBadgeText,
                                service.status === 'UNDER_REVIEW' && styles.statusTextUnderReview,
                                service.status === 'DRAFT' && styles.statusTextDraft,
                              ]}
                            >
                              {service.status === 'UNDER_REVIEW'
                                ? '⏳ Under Review'
                                : service.status === 'DRAFT'
                                ? '📝 Draft'
                                : '✓ FIC Approved'}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.sectorText}>
                          Sector: {service.sector}
                          {service.subcategory ? ` • ${service.subcategory}` : ''}
                        </Text>
                        {!!service.shortSummary && (
                          <Text style={styles.serviceShortSummary}>{service.shortSummary}</Text>
                        )}
                        <View style={styles.deliverablesBox}>
                          <Text style={styles.deliverablesLabel}>Key Deliverables / Scope:</Text>
                          <Text style={styles.deliverablesVal}>{service.deliverables}</Text>
                        </View>
                        <View style={styles.footerRow}>
                          <View style={styles.tatPill}>
                            <Text style={styles.tatText}>⏱️ {service.tat}</Text>
                          </View>
                          <View style={styles.inquiriesPill}>
                            <Text style={styles.inquiriesText}>📨 {service.inquiriesCount} Inquiries</Text>
                          </View>
                        </View>
                      </View>
                    ))
                )}
              </View>
            )}
          </>
        ) : (
          /* Standard Provider Studio for Non-Mentors */
          <>
            <TouchableOpacity
              style={styles.publishBtn}
              activeOpacity={0.88}
              onPress={() => setServiceModalVisible(true)}
            >
              <Text style={styles.publishBtnText}>+ Publish New Capability / Masterclass</Text>
            </TouchableOpacity>

            <View style={styles.filterTabsRow}>
              {(['ALL', 'B2B', 'MASTERCLASS'] as const).map((tab) => {
                const isActive = providerTab === tab;
                const label =
                  tab === 'ALL'
                    ? `All (${services.length})`
                    : tab === 'B2B'
                    ? 'B2B Capabilities'
                    : 'Masterclasses';
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterTab, isActive && styles.filterTabActive]}
                    activeOpacity={0.7}
                    onPress={() => setProviderTab(tab)}
                  >
                    <Text style={[styles.filterTabText, isActive && styles.filterTabTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {services.filter((s) => {
              if (providerTab === 'B2B') return s.type === 'B2B Capability';
              if (providerTab === 'MASTERCLASS') return s.type === 'Masterclass' || s.type === 'Teaching Service';
              return true;
            }).length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📦</Text>
                <Text style={styles.emptyTitle}>No services listed yet</Text>
                <Text style={styles.emptySub}>
                  Publish your B2B capabilities or masterclasses to showcase them in the chamber directory.
                </Text>
              </View>
            ) : (
              services
                .filter((s) => {
                  if (providerTab === 'B2B') return s.type === 'B2B Capability';
                  if (providerTab === 'MASTERCLASS') return s.type === 'Masterclass' || s.type === 'Teaching Service';
                  return true;
                })
                .map((service) => (
                  <View key={service.id} style={styles.serviceCard}>
                    <View style={styles.cardHeaderRow}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{service.type}</Text>
                      </View>
                      <View
                        style={[
                          styles.activeBadge,
                          service.status === 'UNDER_REVIEW' && styles.statusBadgeUnderReview,
                          service.status === 'DRAFT' && styles.statusBadgeDraft,
                        ]}
                      >
                        <Text
                          style={[
                            styles.activeBadgeText,
                            service.status === 'UNDER_REVIEW' && styles.statusTextUnderReview,
                            service.status === 'DRAFT' && styles.statusTextDraft,
                          ]}
                        >
                          {service.status === 'UNDER_REVIEW'
                            ? '⏳ Under Review'
                            : service.status === 'DRAFT'
                            ? '📝 Draft'
                            : '✓ FIC Approved'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.serviceTitle}>{service.title}</Text>
                    <Text style={styles.sectorText}>
                      Sector: {service.sector}
                      {service.subcategory ? ` • ${service.subcategory}` : ''}
                    </Text>
                    {!!service.shortSummary && (
                      <Text style={styles.serviceShortSummary}>{service.shortSummary}</Text>
                    )}
                    <View style={styles.deliverablesBox}>
                      <Text style={styles.deliverablesLabel}>Key Deliverables / Scope:</Text>
                      <Text style={styles.deliverablesVal}>{service.deliverables}</Text>
                    </View>
                    <View style={styles.footerRow}>
                      <View style={styles.tatPill}>
                        <Text style={styles.tatText}>⏱️ {service.tat}</Text>
                      </View>
                      <View style={styles.inquiriesPill}>
                        <Text style={styles.inquiriesText}>📨 {service.inquiriesCount} Inquiries</Text>
                      </View>
                    </View>
                  </View>
                ))
            )}
          </>
        )}
      </ScrollView>

      {/* Upload Course Modal (For Mentors) */}
      <Modal
        visible={courseUploadModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCourseUploadModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Upload Masterclass / Course</Text>
                <Text style={styles.modalSubtitle}>Publish to Student Skill Development Catalog</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setCourseUploadModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Course Title *</Text>
              <TextInput
                style={[styles.textInput, courseTitleError ? styles.textInputError : null]}
                placeholder="e.g., Industrial Automation with PLC & SCADA"
                placeholderTextColor="#94A3B8"
                value={courseTitle}
                onChangeText={(text) => {
                  setCourseTitle(text);
                  if (courseTitleError) setCourseTitleError(null);
                }}
              />
              <FieldError error={courseTitleError} />

              <Text style={styles.inputLabel}>Domain / Sector *</Text>
              <View style={styles.sectorPillsRow}>
                {['Manufacturing & Industrial', 'Technology & Digital', 'Business', 'Clean Energy'].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.smallChip, courseDomain === d && styles.smallChipActive]}
                    onPress={() => setCourseDomain(d)}
                  >
                    <Text style={[styles.smallChipText, courseDomain === d && styles.smallChipTextActive]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Primary Language of Instruction *</Text>
              <View style={styles.sectorPillsRow}>
                {(['Tamil', 'English', 'Hindi'] as const).map((l) => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.smallChip, courseLanguage === l && styles.smallChipActive]}
                    onPress={() => setCourseLanguage(l)}
                  >
                    <Text style={[styles.smallChipText, courseLanguage === l && styles.smallChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Duration</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 4.5 Hours"
                    placeholderTextColor="#94A3B8"
                    value={courseDuration}
                    onChangeText={setCourseDuration}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Lesson Count</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g., 8"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    value={courseLessonsCount}
                    onChangeText={setCourseLessonsCount}
                  />
                </View>
              </View>

              {/* Video File Upload Picker */}
              <Text style={styles.inputLabel}>Upload Lecture Video (MP4 / WebM / MOV, Max 250MB) *</Text>
              {attachedVideoFile ? (
                <View style={styles.videoAttachedCard}>
                  <View style={styles.videoAttachedIconBox}>
                    <Text style={styles.videoAttachedEmoji}>🎬</Text>
                  </View>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                      <Text style={styles.videoAttachedStatusBadge}>✓ Attached</Text>
                      <Text style={styles.videoAttachedFormatBadge}>{attachedVideoFile.format}</Text>
                    </View>
                    <Text style={styles.videoFileName} numberOfLines={1}>
                      {attachedVideoFile.name}
                    </Text>
                    <Text style={styles.videoFileSize}>
                      {attachedVideoFile.size}
                      {attachedVideoFile.duration ? ` • ${attachedVideoFile.duration}` : ''}
                      {' • Ready for catalog'}
                    </Text>
                  </View>

                  <View style={styles.videoActionBtnsColumn}>
                    <TouchableOpacity
                      style={styles.btnVideoActionPreview}
                      activeOpacity={0.8}
                      onPress={() => setVideoPreviewModalVisible(true)}
                    >
                      <Text style={styles.btnVideoActionPreviewText}>Preview</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 5 }}>
                      <TouchableOpacity
                        style={styles.btnVideoActionReplace}
                        activeOpacity={0.8}
                        onPress={() => setVideoSourceModalVisible(true)}
                      >
                        <Text style={styles.btnVideoActionReplaceText}>Replace</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.btnVideoActionRemove}
                        activeOpacity={0.8}
                        onPress={() => {
                          setAttachedVideoFile(null);
                          setVideoError(null);
                        }}
                      >
                        <Text style={styles.btnVideoActionRemoveText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.videoUploadBox, videoError ? styles.videoUploadBoxError : null]}
                  activeOpacity={0.8}
                  onPress={() => setVideoSourceModalVisible(true)}
                >
                  <Text style={styles.videoUploadIcon}>📹</Text>
                  <Text style={styles.videoUploadTitle}>Select Masterclass Lecture Video</Text>
                  <Text style={styles.videoUploadSubtitle}>Supported formats: MP4, WebM, MOV • Max 250MB</Text>
                  <View style={styles.videoFormatBtnsRow}>
                    <View style={styles.btnVideoFormat}>
                      <Text style={styles.btnVideoFormatText}>Choose MP4</Text>
                    </View>
                    <View style={styles.btnVideoFormat}>
                      <Text style={styles.btnVideoFormatText}>Choose MOV</Text>
                    </View>
                    <View style={styles.btnVideoFormat}>
                      <Text style={styles.btnVideoFormatText}>Choose WebM</Text>
                    </View>
                  </View>
                  <Text style={styles.videoTapToBrowseText}>Tap to choose from Gallery, Files, or Camera</Text>
                </TouchableOpacity>
              )}
              <FieldError error={videoError} />

              <Text style={styles.inputLabel}>Curriculum & Syllabus Description *</Text>
              <TextInput
                style={[
                  styles.textInput,
                  { height: 75, textAlignVertical: 'top' },
                  courseCurriculumError ? styles.textInputError : null,
                ]}
                placeholder="Outline the core modules, learning outcomes, and practical lab assignments..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={courseCurriculum}
                onChangeText={(text) => {
                  setCourseCurriculum(text);
                  if (courseCurriculumError) setCourseCurriculumError(null);
                }}
              />
              <FieldError error={courseCurriculumError} />

              <TouchableOpacity
                style={styles.submitBtn}
                activeOpacity={0.88}
                onPress={handleUploadCourse}
              >
                <Text style={styles.submitBtnText}>Publish Masterclass to Catalog →</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Video Selection Source Bottom Sheet Overlay */}
          {videoSourceModalVisible && (
            <View style={[StyleSheet.absoluteFillObject, styles.sheetOverlay]}>
              {/* Backdrop dismiss touch target */}
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                activeOpacity={1}
                onPress={() => setVideoSourceModalVisible(false)}
              />

              <View style={styles.sheetContainer}>
                {/* Top Handle Pill */}
                <View style={styles.sheetHandle} />

                <Text style={styles.sheetTitle}>Select Masterclass Lecture Video</Text>
                <Text style={styles.sheetSubtitle}>
                  Supported formats: MP4, WebM, MOV • Max 250MB
                </Text>

                {/* Option 1: Choose from Gallery */}
                <TouchableOpacity
                  style={styles.sheetOptionItem}
                  activeOpacity={0.7}
                  onPress={handleChooseFromGallery}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: '#EFF6FF' }]}>
                    <Text style={styles.sheetOptionEmoji}>🖼️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetOptionTitle}>Choose from Gallery</Text>
                    <Text style={styles.sheetOptionDesc}>
                      Select an existing video from your phone's photo library
                    </Text>
                  </View>
                  <Text style={styles.sheetArrow}>›</Text>
                </TouchableOpacity>

                {/* Option 2: Browse Device Files */}
                <TouchableOpacity
                  style={styles.sheetOptionItem}
                  activeOpacity={0.7}
                  onPress={handleBrowseDeviceFiles}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={styles.sheetOptionEmoji}>📁</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetOptionTitle}>Browse Device Files</Text>
                    <Text style={styles.sheetOptionDesc}>
                      Open Android system file manager to choose MP4, WebM, or MOV
                    </Text>
                  </View>
                  <Text style={styles.sheetArrow}>›</Text>
                </TouchableOpacity>

                {/* Option 3: Record Video */}
                <TouchableOpacity
                  style={styles.sheetOptionItem}
                  activeOpacity={0.7}
                  onPress={handleRecordVideo}
                >
                  <View style={[styles.sheetOptionIconBox, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={styles.sheetOptionEmoji}>📹</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetOptionTitle}>Record Video</Text>
                    <Text style={styles.sheetOptionDesc}>
                      Open device camera in video recording mode to record a new masterclass
                    </Text>
                  </View>
                  <Text style={styles.sheetArrow}>›</Text>
                </TouchableOpacity>

                {/* Option 4: Cancel Button */}
                <TouchableOpacity
                  style={styles.sheetCancelBtn}
                  activeOpacity={0.8}
                  onPress={() => setVideoSourceModalVisible(false)}
                >
                  <Text style={styles.sheetCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Video Preview Overlay */}
          {videoPreviewModalVisible && (
            <View style={[StyleSheet.absoluteFillObject, styles.previewOverlay]}>
              <TouchableOpacity
                style={StyleSheet.absoluteFillObject}
                activeOpacity={1}
                onPress={() => setVideoPreviewModalVisible(false)}
              />
              <View style={styles.previewCard}>
                <View style={styles.previewHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.previewTitle}>Masterclass Video Preview</Text>
                    <Text style={styles.previewSubtitle} numberOfLines={1}>
                      {attachedVideoFile?.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setVideoPreviewModalVisible(false)}
                  >
                    <Text style={styles.modalCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Video Player Frame View */}
                <View style={styles.previewPlayerBox}>
                  <Text style={{ fontSize: 44 }}>▶️</Text>
                  <Text style={styles.previewPlayerText}>Video Attached & Ready</Text>
                  <View style={styles.previewMetaRow}>
                    <View style={styles.previewMetaPill}>
                      <Text style={styles.previewMetaPillText}>{attachedVideoFile?.format || 'MP4'}</Text>
                    </View>
                    <View style={styles.previewMetaPill}>
                      <Text style={styles.previewMetaPillText}>{attachedVideoFile?.size}</Text>
                    </View>
                    {attachedVideoFile?.duration ? (
                      <View style={styles.previewMetaPill}>
                        <Text style={styles.previewMetaPillText}>⏱️ {attachedVideoFile.duration}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                {/* External Player launcher if user wants to play full video natively */}
                <TouchableOpacity
                  style={styles.previewNativePlayBtn}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (attachedVideoFile?.uri) {
                      Linking.openURL(attachedVideoFile.uri).catch(() => {
                        notify.error('Unable to launch system media player for this video.', 'Media Player');
                      });
                    }
                  }}
                >
                  <Text style={styles.previewNativePlayText}>Play in Device Video Player ↗</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.previewCloseBtn}
                  activeOpacity={0.8}
                  onPress={() => setVideoPreviewModalVisible(false)}
                >
                  <Text style={styles.previewCloseText}>Close Preview</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        visible={rescheduleModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRescheduleModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Propose Reschedule</Text>
                <Text style={styles.modalSubtitle}>For {selectedConsultation?.studentName}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setRescheduleModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>New Date Slot:</Text>
            <View style={styles.sectorPillsRow}>
              {['Tomorrow (05 Mar)', 'Friday (07 Mar)', 'Next Mon (10 Mar)'].map((slot) => (
                <TouchableOpacity
                  key={slot}
                  style={[styles.smallChip, newDateSlot === slot && styles.smallChipActive]}
                  onPress={() => setNewDateSlot(slot)}
                >
                  <Text style={[styles.smallChipText, newDateSlot === slot && styles.smallChipTextActive]}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>New Time Window:</Text>
            <View style={styles.sectorPillsRow}>
              {['11:00 AM IST', '02:00 PM IST', '04:30 PM IST'].map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.smallChip, newTimeSlot === time && styles.smallChipActive]}
                  onPress={() => setNewTimeSlot(time)}
                >
                  <Text style={[styles.smallChipText, newTimeSlot === time && styles.smallChipTextActive]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.submitBtn}
              activeOpacity={0.88}
              onPress={handleConfirmReschedule}
            >
              <Text style={styles.submitBtnText}>Confirm Rescheduled Slot →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Complete Add New Service / Capability Modal (Matching Website Architecture) */}
      <Modal
        visible={serviceModalVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCancelPublish}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.publishModalContent]}>
            {/* Top Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={styles.capabilityBadgeRow}>
                  <View style={styles.capabilityPill}>
                    <Text style={styles.capabilityPillText}>
                      {serviceType === 'Teaching Service' ? 'MENTOR TEACHING' : 'MEMBER CAPABILITY'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.modalTitle}>Add New Service / Capability</Text>
                <Text style={styles.modalSubtitle}>
                  FIC Member Capability Directory & Marketplace Submission
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={handleCancelPublish}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 30 }}
            >
              {/* SECTION 1: BASIC INFORMATION */}
              <View style={styles.formSectionBox}>
                <View style={styles.formSectionHeaderRow}>
                  <View style={styles.sectionNumberBadge}>
                    <Text style={styles.sectionNumberText}>1</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formSectionTitle}>Basic Information</Text>
                    <Text style={styles.formSectionSubtitle}>Core identification and categorization</Text>
                  </View>
                </View>

                {/* Service Title * */}
                <Text style={styles.inputLabel}>
                  Service Title <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, !!formErrors.serviceTitle && styles.textInputError]}
                  placeholder="e.g., Precision CNC Machining & High-Tolerance Turning"
                  placeholderTextColor="#94A3B8"
                  value={serviceTitle}
                  onChangeText={(val) => {
                    setServiceTitle(val);
                    if (formErrors.serviceTitle) {
                      setFormErrors((prev) => ({ ...prev, serviceTitle: undefined }));
                    }
                  }}
                />
                {!!formErrors.serviceTitle && (
                  <Text style={styles.errorText}>⚠ {formErrors.serviceTitle}</Text>
                )}

                {/* Primary Sector * Dropdown */}
                <Text style={styles.inputLabel}>
                  Primary Sector <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dropdownSelector, !!formErrors.primarySector && styles.textInputError]}
                  activeOpacity={0.75}
                  onPress={() => setSectorPickerVisible(true)}
                >
                  <Text style={styles.dropdownSelectorText}>{primarySector}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
                {!!formErrors.primarySector && (
                  <Text style={styles.errorText}>⚠ {formErrors.primarySector}</Text>
                )}

                {/* Subcategory / Specialization */}
                <Text style={styles.inputLabel}>Subcategory / Specialization</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., Precision Machining, Tooling, Aerospace Components"
                  placeholderTextColor="#94A3B8"
                  value={subcategory}
                  onChangeText={setSubcategory}
                />

                {/* Short Card Summary (1–2 sentences) */}
                <Text style={styles.inputLabel}>Short Card Summary (1–2 sentences)</Text>
                <Text style={styles.inputHint}>
                  Brief summary displayed on the marketplace card (Max 160 characters)
                </Text>
                <TextInput
                  style={[styles.textInput, { height: 62, textAlignVertical: 'top' }]}
                  placeholder="e.g., Tier-1 aerospace and automotive precision CNC turning with ISO certification."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  maxLength={160}
                  value={cardSummary}
                  onChangeText={setCardSummary}
                />
                <Text style={styles.charCountText}>{cardSummary.length}/160 characters</Text>

                {/* Full Description & Scope of Capability * */}
                <Text style={styles.inputLabel}>
                  Full Description & Scope of Capability <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <Text style={styles.inputHint}>
                  Provide comprehensive technical specifications, equipment, capacity, and scope
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    { height: 95, textAlignVertical: 'top' },
                    !!formErrors.fullDescription && styles.textInputError,
                  ]}
                  placeholder="Detailed breakdown of capabilities, facility capacity, machinery, certifications, batch sizes, tolerances, and inspection standards..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={fullDescription}
                  onChangeText={(val) => {
                    setFullDescription(val);
                    if (formErrors.fullDescription) {
                      setFormErrors((prev) => ({ ...prev, fullDescription: undefined }));
                    }
                  }}
                />
                {!!formErrors.fullDescription && (
                  <Text style={styles.errorText}>⚠ {formErrors.fullDescription}</Text>
                )}
              </View>

              {/* SECTION 2: SCOPE, DELIVERABLES & DELIVERY */}
              <View style={styles.formSectionBox}>
                <View style={styles.formSectionHeaderRow}>
                  <View style={styles.sectionNumberBadge}>
                    <Text style={styles.sectionNumberText}>2</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formSectionTitle}>Scope, Deliverables & Delivery</Text>
                    <Text style={styles.formSectionSubtitle}>Execution parameters and service coverage</Text>
                  </View>
                </View>

                {/* Key Services Offered / Deliverables */}
                <Text style={styles.inputLabel}>Key Services Offered / Deliverables</Text>
                <Text style={styles.inputHint}>
                  List specific deliverables, milestones, or service items
                </Text>
                <TextInput
                  style={[styles.textInput, { height: 75, textAlignVertical: 'top' }]}
                  placeholder="e.g., CAD/CAM Feasibility Audit, Batch Turning to 5 Micron Tolerance, Material Test Certification"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  value={keyServices}
                  onChangeText={setKeyServices}
                />

                {/* Core Skills & Competencies */}
                <Text style={styles.inputLabel}>Core Skills & Competencies</Text>
                <Text style={styles.inputHint}>
                  Technical proficiencies, machinery, frameworks, tools
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., 5-Axis CNC, Mastercam, ISO 9001, GD&T, CMM Inspection"
                  placeholderTextColor="#94A3B8"
                  value={coreSkills}
                  onChangeText={setCoreSkills}
                />

                {/* Marketplace Tags */}
                <Text style={styles.inputLabel}>Marketplace Tags</Text>
                <Text style={styles.inputHint}>
                  Comma-separated search keywords for discoverability
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., CNC, Machining, Aerospace, Tooling, Rapid Prototyping"
                  placeholderTextColor="#94A3B8"
                  value={marketplaceTags}
                  onChangeText={setMarketplaceTags}
                />

                {/* Coverage Area Dropdown */}
                <Text style={styles.inputLabel}>Coverage Area</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  activeOpacity={0.75}
                  onPress={() => setCoveragePickerVisible(true)}
                >
                  <Text style={styles.dropdownSelectorText}>{coverageArea}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>

                {/* Delivery Mode Dropdown */}
                <Text style={styles.inputLabel}>Delivery Mode</Text>
                <TouchableOpacity
                  style={styles.dropdownSelector}
                  activeOpacity={0.75}
                  onPress={() => setDeliveryPickerVisible(true)}
                >
                  <Text style={styles.dropdownSelectorText}>{deliveryMode}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </TouchableOpacity>
              </View>

              {/* SECTION 3: PORTFOLIO & SUPPORTING PROOF (OPTIONAL) */}
              <View style={styles.formSectionBox}>
                <View style={styles.formSectionHeaderRow}>
                  <View style={styles.sectionNumberBadge}>
                    <Text style={styles.sectionNumberText}>3</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.formSectionTitle}>Portfolio & Supporting Proof</Text>
                    <Text style={styles.formSectionSubtitle}>Optional evidence & credentials</Text>
                  </View>
                </View>

                {/* Portfolio / Website Link */}
                <Text style={styles.inputLabel}>Portfolio / Website Link</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://company.com or drive portfolio link"
                  placeholderTextColor="#94A3B8"
                  keyboardType="url"
                  autoCapitalize="none"
                  value={portfolioUrl}
                  onChangeText={setPortfolioUrl}
                />

                {/* Certification / Supporting Document Reference */}
                <Text style={styles.inputLabel}>Certification / Supporting Document Reference</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g., ISO 9001:2015 Cert #49281, AS9100D, Trade License"
                  placeholderTextColor="#94A3B8"
                  value={certificationRef}
                  onChangeText={setCertificationRef}
                />
              </View>

              {/* SECTION 4: FIC INTERMEDIARY GOVERNANCE PROTOCOL */}
              <View style={[styles.formSectionBox, { backgroundColor: '#F0F7FF', borderColor: '#BFDBFE' }]}>
                <View style={styles.governanceHeaderRow}>
                  <Text style={styles.governanceShieldIcon}>🛡️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.governanceTitle}>FIC Intermediary Governance Protocol</Text>
                    <Text style={styles.governanceSubtitle}>Member Privacy & Intermediary Protection</Text>
                  </View>
                </View>

                <View style={styles.governanceNoticeBox}>
                  <View style={styles.govBulletRow}>
                    <Text style={styles.govBulletDot}>•</Text>
                    <Text style={styles.govBulletText}>
                      <Text style={styles.govBold}>Member Privacy Guarantee:</Text> Public marketplace listings never display your private personal name, mobile number, or direct email.
                    </Text>
                  </View>
                  <View style={styles.govBulletRow}>
                    <Text style={styles.govBulletDot}>•</Text>
                    <Text style={styles.govBulletText}>
                      <Text style={styles.govBold}>FIC Sub-Admin Moderation:</Text> All member inquiries, scope discussions, proposals, and contracts are mediated by FIC Sub-Admins.
                    </Text>
                  </View>
                  <View style={styles.govBulletRow}>
                    <Text style={styles.govBulletDot}>•</Text>
                    <Text style={styles.govBulletText}>
                      <Text style={styles.govBold}>No Direct Bypass:</Text> Direct commercial bypass outside the platform is prohibited to guarantee bilateral IP protection and contract escrow.
                    </Text>
                  </View>
                </View>

                {/* Mandatory Declaration Checkbox */}
                <TouchableOpacity
                  style={[
                    styles.declarationRow,
                    !!formErrors.governanceAgreed && styles.declarationRowError,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setGovernanceAgreed(!governanceAgreed);
                    if (formErrors.governanceAgreed) {
                      setFormErrors((prev) => ({ ...prev, governanceAgreed: undefined }));
                    }
                  }}
                >
                  <View style={[styles.checkboxSquare, governanceAgreed && styles.checkboxSquareActive]}>
                    {governanceAgreed && <Text style={styles.checkboxCheckmark}>✓</Text>}
                  </View>
                  <Text style={styles.declarationText}>
                    I confirm that all information provided is accurate and agree to the{' '}
                    <Text style={{ fontWeight: '700', color: '#1E40AF' }}>
                      FIC Intermediary Governance Protocol
                    </Text>
                    , bilateral confidentiality, and FIC Sub-Admin moderation before listing publication.{' '}
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </Text>
                </TouchableOpacity>
                {!!formErrors.governanceAgreed && (
                  <Text style={[styles.errorText, { marginTop: 6 }]}>⚠ {formErrors.governanceAgreed}</Text>
                )}
              </View>

              {/* SECTION 5: ACTION BUTTONS */}
              <View style={styles.formActionButtonsCol}>
                {/* Submit for FIC Approval (Primary) */}
                <TouchableOpacity
                  style={styles.submitApprovalBtn}
                  activeOpacity={0.88}
                  onPress={handleSubmitForApproval}
                >
                  <Text style={styles.submitApprovalBtnText}>Submit for FIC Approval →</Text>
                </TouchableOpacity>

                {/* Save as Draft & Cancel Row */}
                <View style={styles.secondaryActionsRow}>
                  <TouchableOpacity
                    style={styles.saveDraftBtn}
                    activeOpacity={0.8}
                    onPress={handleSaveDraft}
                  >
                    <Text style={styles.saveDraftBtnText}>💾 Save as Draft</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.8}
                    onPress={handleCancelPublish}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Primary Sector Dropdown Picker Modal */}
      <Modal
        visible={sectorPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setSectorPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setSectorPickerVisible(false)}
        >
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Primary Sector</Text>
              <TouchableOpacity onPress={() => setSectorPickerVisible(false)}>
                <Text style={styles.pickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
              {SECTOR_OPTIONS.map((item) => {
                const isSelected = primarySector === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    onPress={() => {
                      setPrimarySector(item);
                      if (formErrors.primarySector) {
                        setFormErrors((prev) => ({ ...prev, primarySector: undefined }));
                      }
                      setSectorPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {item}
                    </Text>
                    {isSelected && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Coverage Area Dropdown Picker Modal */}
      <Modal
        visible={coveragePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCoveragePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setCoveragePickerVisible(false)}
        >
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Coverage Area</Text>
              <TouchableOpacity onPress={() => setCoveragePickerVisible(false)}>
                <Text style={styles.pickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {COVERAGE_AREA_OPTIONS.map((item) => {
                const isSelected = coverageArea === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    onPress={() => {
                      setCoverageArea(item);
                      setCoveragePickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {item}
                    </Text>
                    {isSelected && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Delivery Mode Dropdown Picker Modal */}
      <Modal
        visible={deliveryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeliveryPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setDeliveryPickerVisible(false)}
        >
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select Delivery Mode</Text>
              <TouchableOpacity onPress={() => setDeliveryPickerVisible(false)}>
                <Text style={styles.pickerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
              {DELIVERY_MODE_OPTIONS.map((item) => {
                const isSelected = deliveryMode === item;
                return (
                  <TouchableOpacity
                    key={item}
                    style={[styles.pickerItem, isSelected && styles.pickerItemActive]}
                    onPress={() => {
                      setDeliveryMode(item);
                      setDeliveryPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                      {item}
                    </Text>
                    {isSelected && <Text style={styles.pickerItemCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  statLabel: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
    fontFamily: fontSansSerif,
  },
  publishBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  publishBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  mentorTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  mentorTabChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  mentorTabChipActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  mentorTabChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  mentorTabChipTextActive: {
    color: '#1E40AF',
    fontWeight: '800',
  },
  filterTabsRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterTabActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  activeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
    fontFamily: fontSansSerif,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
    fontFamily: fontSansSerif,
  },
  sectorText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginBottom: 8,
  },
  deliverablesBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  deliverablesLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  deliverablesVal: {
    fontSize: 11,
    color: '#334155',
    fontFamily: fontSansSerif,
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tatPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tatText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  inquiriesPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  inquiriesText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
    fontFamily: fontSansSerif,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reqStudentName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  reqCollege: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  statusBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeScheduled: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeCompleted: {
    backgroundColor: '#EFF6FF',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  statusTextScheduled: {
    color: '#15803D',
  },
  statusTextCompleted: {
    color: '#1D4ED8',
  },
  statusTextRejected: {
    color: '#B91C1C',
  },
  reqTopicLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
    marginTop: 4,
  },
  reqTopicText: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
    fontFamily: fontSansSerif,
    marginBottom: 4,
  },
  reqSlotText: {
    fontSize: 11,
    color: '#2563EB',
    fontFamily: fontSansSerif,
    marginBottom: 10,
  },
  reqActionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  btnAccept: {
    flex: 1.5,
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  btnAcceptText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnReschedule: {
    flex: 1.2,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  btnRescheduleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  btnReject: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
  },
  btnRejectText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
  },
  btnComplete: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
  },
  btnCompleteText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#475569',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    fontFamily: fontSansSerif,
    marginTop: 8,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#1E293B',
    fontFamily: fontSansSerif,
  },
  sectorPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  smallChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smallChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  smallChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  smallChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  splitRow: {
    flexDirection: 'row',
  },
  textInputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  videoUploadBox: {
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    padding: 16,
    alignItems: 'center',
    marginBottom: 4,
  },
  videoUploadBoxError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  videoUploadIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  videoUploadTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
  },
  videoUploadSubtitle: {
    fontSize: 10,
    color: '#3B82F6',
    marginBottom: 8,
  },
  videoTapToBrowseText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 8,
    fontFamily: fontSansSerif,
  },
  videoFormatBtnsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  btnVideoFormat: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  btnVideoFormatText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  videoAttachedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 12,
    padding: 10,
    marginBottom: 4,
  },
  videoAttachedIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  videoAttachedEmoji: {
    fontSize: 20,
  },
  videoAttachedStatusBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
    backgroundColor: '#BBF7D0',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 5,
  },
  videoAttachedFormatBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoFileName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#166534',
    fontFamily: fontSansSerif,
  },
  videoFileSize: {
    fontSize: 10,
    color: '#15803D',
    marginTop: 2,
  },
  videoActionBtnsColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  btnVideoActionPreview: {
    backgroundColor: '#2563EB',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  btnVideoActionPreviewText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnVideoActionReplace: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  btnVideoActionReplaceText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  btnVideoActionRemove: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  btnVideoActionRemoveText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  // Bottom Sheet Styles
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'android' ? 24 : 36,
  },
  sheetHandle: {
    width: 44,
    height: 4.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    fontFamily: fontSansSerif,
  },
  sheetSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 16,
    fontFamily: fontSansSerif,
  },
  sheetOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  sheetOptionIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetOptionEmoji: {
    fontSize: 20,
  },
  sheetOptionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: fontSansSerif,
  },
  sheetOptionDesc: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  sheetArrow: {
    fontSize: 22,
    color: '#94A3B8',
    fontWeight: '600',
    marginLeft: 6,
  },
  sheetCancelBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  sheetCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  // Video Preview Modal Styles
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  previewSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  previewPlayerBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  previewPlayerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
    marginTop: 8,
    fontFamily: fontSansSerif,
  },
  previewMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  previewMetaPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  previewMetaPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  previewNativePlayBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    marginBottom: 8,
  },
  previewNativePlayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  previewCloseBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  previewCloseText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  submitBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  // --- New Add Service / Capability Form Styles ---
  publishModalContent: {
    maxHeight: '92%',
    paddingBottom: 8,
  },
  capabilityBadgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  capabilityPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  capabilityPillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5,
  },
  formSectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  formSectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  sectionNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  formSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  formSectionSubtitle: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
    fontFamily: fontSansSerif,
  },
  requiredAsterisk: {
    color: '#DC2626',
    fontWeight: '800',
  },
  inputHint: {
    fontSize: 10.5,
    color: '#64748B',
    marginBottom: 6,
    fontFamily: fontSansSerif,
  },
  charCountText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'right',
    marginTop: 3,
    marginBottom: 6,
    fontFamily: fontSansSerif,
  },
  errorText: {
    fontSize: 10.5,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  dropdownSelector: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  dropdownSelectorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: fontSansSerif,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#64748B',
  },
  governanceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  governanceShieldIcon: {
    fontSize: 22,
    marginRight: 8,
  },
  governanceTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
  },
  governanceSubtitle: {
    fontSize: 10,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: fontSansSerif,
  },
  governanceNoticeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 10,
    marginBottom: 12,
  },
  govBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  govBulletDot: {
    fontSize: 14,
    color: '#2563EB',
    marginRight: 6,
    lineHeight: 16,
  },
  govBulletText: {
    flex: 1,
    fontSize: 11,
    color: '#334155',
    lineHeight: 15.5,
    fontFamily: fontSansSerif,
  },
  govBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 10,
  },
  declarationRowError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  checkboxSquareActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkboxCheckmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 14,
  },
  declarationText: {
    flex: 1,
    fontSize: 11,
    color: '#1E293B',
    lineHeight: 15.5,
    fontFamily: fontSansSerif,
  },
  formActionButtonsCol: {
    marginTop: 4,
    marginBottom: 10,
  },
  submitApprovalBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitApprovalBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  saveDraftBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDraftBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    fontFamily: fontSansSerif,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  // --- Dropdown Picker Modal Styles ---
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxHeight: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  pickerCloseText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '700',
    paddingHorizontal: 6,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  pickerItemActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  pickerItemText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    fontFamily: fontSansSerif,
  },
  pickerItemTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  pickerItemCheck: {
    fontSize: 13,
    fontWeight: '800',
    color: '#2563EB',
  },
  // --- Service Card Enhancements ---
  statusBadgeUnderReview: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FCD34D',
  },
  statusTextUnderReview: {
    color: '#B45309',
  },
  statusBadgeDraft: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  statusTextDraft: {
    color: '#475569',
  },
  serviceShortSummary: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 4,
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
});
