import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notify } from '../components/common/NotificationContext';
import { storageService } from '../services/storageService';

export type ConsultationStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'RESCHEDULE_PROPOSED'
  | 'COMPLETED'
  | 'REJECTED';

export interface VerifiedMentor {
  id: string;
  name: string;
  title: string;
  domain: string;
  languages: ('Tamil' | 'English' | 'Hindi')[];
  rating: number;
  consultationsCount: number;
  experienceYears: number;
  bio: string;
  avatarSeed: string;
  availableDays: string[];
}

export interface ConsultationBooking {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail?: string;
  mentorId: string;
  mentorName: string;
  topic: string;
  domain: string;
  requestedDate: string;
  requestedTime: string;
  duration: string;
  agenda: string;
  status: ConsultationStatus;
  createdAt: string;

  // When ACCEPTED / SCHEDULED
  confirmedDate?: string;
  confirmedTime?: string;
  meetingMode?: 'Online (Google Meet)' | 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Offline (Chamber)' | string;
  meetingUrl?: string;
  mentorNotes?: string;

  // When RESCHEDULE_PROPOSED
  proposedDate?: string;
  proposedTime?: string;
  rescheduleNotes?: string;

  // When REJECTED
  rejectionReason?: string;

  // When COMPLETED
  completionSummary?: string;
  recommendedMaterials?: string;
  followUpGuidance?: string;
  completedAt?: string;
}

export interface SharedMasterclass {
  id: string;
  mentorId: string;
  instructor: string;
  title: string;
  domain: string;
  language: 'Tamil' | 'English' | 'Hindi';
  duration: string;
  modulesCount: number;
  level: string;
  syllabus: string[];
  status: 'PUBLISHED' | 'UNDER_REVIEW';
  createdAt: string;
  videoFileName?: string;
  videoUri?: string;
  videoSize?: string;
  description?: string;
}

export interface InAppNotification {
  id: string;
  targetUserId: string; // Specific user ID to receive notification
  title: string;
  body: string;
  type: 'CONSULTATION' | 'COURSE' | 'CHAMBER' | 'KYC' | 'MEETING' | 'REQUEST' | 'ADVISORY';
  timestamp: string;
  read: boolean;
}

export interface ChamberServiceRequest {
  id: string;
  trackingNumber: string;
  serviceTitle: string;
  sector: string;
  status: 'UNDER_REVIEW' | 'PROPOSAL_SHARED' | 'IN_PROGRESS' | 'COMPLETED';
  currentStageIndex: number;
  createdAt: string;
  lastUpdated: string;
  facilitatorAssigned: string;
  estimatedCompletion: string;
  notes?: string;
  details?: Record<string, any>;
}

interface StudentMentorContextType {
  mentors: VerifiedMentor[];
  consultations: ConsultationBooking[];
  courses: SharedMasterclass[];
  notifications: InAppNotification[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  chamberRequests: ChamberServiceRequest[];

  // Chamber Service Requests
  addChamberRequest: (params: {
    serviceTitle: string;
    sector: string;
    notes?: string;
    details?: Record<string, any>;
  }) => ChamberServiceRequest;

  // Student Actions
  bookConsultation: (params: {
    mentorId: string;
    mentorName: string;
    topic: string;
    domain: string;
    preferredDate: string;
    preferredTime: string;
    duration?: string;
    agenda: string;
    notes?: string;
  }) => ConsultationBooking;
  studentAcceptReschedule: (bookingId: string) => void;
  studentDeclineReschedule: (bookingId: string) => void;

  // Mentor Actions
  acceptConsultation: (
    bookingId: string,
    details: {
      confirmedDate?: string;
      confirmedTime?: string;
      meetingMode?: 'Online (Google Meet)' | 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Offline (Chamber)' | string;
      meetingUrl?: string;
      mentorNotes?: string;
    }
  ) => void;
  proposeReschedule: (
    bookingId: string,
    details: {
      proposedDate: string;
      proposedTime: string;
      notes: string;
    }
  ) => void;
  rejectConsultation: (bookingId: string, rejectionReason: string) => void;
  completeConsultation: (
    bookingId: string,
    audit: {
      summary: string;
      recommendedMaterials: string;
      followUpGuidance: string;
    }
  ) => void;

  // Course Upload & Publication
  publishCourse: (courseData: {
    title: string;
    domain: string;
    language: 'Tamil' | 'English' | 'Hindi';
    duration: string;
    modulesCount?: number;
    level?: string;
    syllabus?: string[];
    description: string;
    videoFileName?: string;
    videoUri?: string;
    videoSize?: string;
  }) => SharedMasterclass;

  // Helpers
  getStudentBookings: (studentId?: string) => ConsultationBooking[];
  getMentorIncomingRequests: (mentorId?: string, mentorName?: string) => ConsultationBooking[];
}

export const VERIFIED_MENTORS: VerifiedMentor[] = [
  {
    id: 'usr_mentor_sundaram',
    name: 'Dr. K. S. Sundaram',
    title: 'Senior Industrial Mentor & Facilitator',
    domain: 'Manufacturing & Industrial',
    languages: ['Tamil', 'English'],
    rating: 4.9,
    consultationsCount: 18,
    experienceYears: 16,
    bio: 'Lead Facilitator at FIC Advisory. Expertise in industrial automation, shop-floor operations, and incubation advisory.',
    avatarSeed: 'Sundaram',
    availableDays: ['Mon', 'Wed', 'Fri'],
  },
  {
    id: 'usr_mentor_anand',
    name: 'Dr. Anand Kumar',
    title: 'Technology & Cloud Architecture Professor',
    domain: 'Technology & Digital',
    languages: ['Tamil', 'English', 'Hindi'],
    rating: 4.8,
    consultationsCount: 14,
    experienceYears: 12,
    bio: 'Professor of Computer Science & FIC Digital Desk Lead. Guiding mentees on cloud systems, AI workflows, and software development.',
    avatarSeed: 'Anand',
    availableDays: ['Tue', 'Thu', 'Sat'],
  },
];

const INITIAL_COURSES: SharedMasterclass[] = [
  {
    id: 'course-1',
    mentorId: 'usr_mentor_anand',
    instructor: 'Dr. Anand Kumar',
    title: 'Full-Stack Web Development & Modern API Design',
    domain: 'Technology & Digital',
    language: 'English',
    duration: '4h 30m',
    modulesCount: 6,
    level: 'Intermediate',
    syllabus: [
      'Modern TypeScript & Node.js Architecture',
      'REST & GraphQL API Best Practices',
      'Database Modeling & PostgreSQL Optimization',
      'Cloud Deployment & CI/CD Pipelines',
      'Authentication, OAuth2 & JWT Security',
      'Building Production Full-Stack Workflows',
    ],
    description: 'Master full-stack web engineering, resilient backend systems, and modern API design with FIC Industry Mentors.',
    status: 'PUBLISHED',
    createdAt: '01 Nov 2026',
  },
  {
    id: 'course-2',
    mentorId: 'usr_mentor_sundaram',
    instructor: 'Dr. K. S. Sundaram',
    title: 'Industrial Automation & Industry 4.0 Foundations',
    domain: 'Manufacturing & Industrial',
    language: 'Tamil',
    duration: '3h 45m',
    modulesCount: 5,
    level: 'Beginner',
    syllabus: [
      'Introduction to Industrial Automation & PLC Architecture',
      'Sensors, Actuators & Industrial Protocols (Modbus / MQTT)',
      'SCADA & HMI Interface Design',
      'Shop-Floor Lean Manufacturing & Predictive Maintenance',
      'Case Studies: Modernizing Indian MSME Manufacturing Units',
    ],
    description: 'Practical grounding in manufacturing automation, shop-floor PLC controls, and smart factory technologies.',
    status: 'PUBLISHED',
    createdAt: '28 Oct 2026',
  },
  {
    id: 'course-3',
    mentorId: 'usr_mentor_anand',
    instructor: 'Dr. Anand Kumar',
    title: 'AI Engineering & Machine Learning Workflows',
    domain: 'Technology & Digital',
    language: 'English',
    duration: '5h 15m',
    modulesCount: 7,
    level: 'Advanced',
    syllabus: [
      'Foundations of Modern Deep Learning & Transformers',
      'Large Language Models & Prompt Engineering',
      'Retrieval-Augmented Generation (RAG) Architecture',
      'Vector Databases & Semantic Embeddings',
      'Fine-Tuning & Quantization Techniques',
      'Model Serving, Latency & Cost Optimization',
      'Ethical AI, Safety & Production Monitoring',
    ],
    description: 'Comprehensive deep dive into building production AI applications, RAG pipelines, and agentic workflows.',
    status: 'PUBLISHED',
    createdAt: '03 Nov 2026',
  },
];

const INITIAL_CONSULTATIONS: ConsultationBooking[] = [
  {
    id: 'BO-749102',
    studentId: 'student-demo',
    studentName: 'Student Member',
    mentorId: 'usr_mentor_anand',
    mentorName: 'Dr. Anand Kumar',
    topic: 'Full-Stack Architecture & Career Guidance',
    domain: 'Technology & Digital',
    requestedDate: '24-11-2026',
    requestedTime: '05:30 PM IST',
    duration: '45 mins',
    agenda: 'Guidance on full-stack architecture, portfolio preparation, and placement roadmap.',
    status: 'ACCEPTED',
    createdAt: '10 Nov 2026',
    confirmedDate: '24-11-2026',
    confirmedTime: '05:30 PM IST',
    meetingMode: 'Virtual Video Meet',
    meetingUrl: 'https://meet.google.com/fic-mentor-session',
    mentorNotes: 'Please prepare your GitHub portfolio link and key project questions prior to the session.',
  },
];

export const INITIAL_CHAMBER_REQUESTS: ChamberServiceRequest[] = [];

const StudentMentorContext = createContext<StudentMentorContextType | undefined>(undefined);

export const StudentMentorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [mentors] = useState<VerifiedMentor[]>(VERIFIED_MENTORS);
  const [consultations, setConsultations] = useState<ConsultationBooking[]>(INITIAL_CONSULTATIONS);
  const [courses, setCourses] = useState<SharedMasterclass[]>(INITIAL_COURSES);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [chamberRequests, setChamberRequests] = useState<ChamberServiceRequest[]>(INITIAL_CHAMBER_REQUESTS);

  const storageKey = `FIC_INAPP_NOTIFICATIONS_${user?.id || 'guest'}`;
  const chamberStorageKey = `FIC_CHAMBER_REQUESTS_${user?.id || 'guest'}`;
  const consultationStorageKey = `FIC_CONSULTATIONS_${user?.id || 'guest'}`;

  // Load stored consultations for active user
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await storageService.getItem(consultationStorageKey);
        if (raw && isMounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setConsultations(parsed);
          }
        }
      } catch (err) {
        console.warn('[StudentMentorContext] Error loading consultations:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [consultationStorageKey]);

  const persistConsultations = useCallback(
    async (newList: ConsultationBooking[]) => {
      try {
        await storageService.setItem(consultationStorageKey, JSON.stringify(newList));
      } catch (err) {
        console.warn('[StudentMentorContext] Error persisting consultations:', err);
      }
    },
    [consultationStorageKey]
  );

  // Load stored chamber requests for active user
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await storageService.getItem(chamberStorageKey);
        if (raw && isMounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setChamberRequests(parsed);
          }
        }
      } catch (err) {
        console.warn('[StudentMentorContext] Error loading chamber requests:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [chamberStorageKey]);

  const persistChamberRequests = useCallback(
    async (newList: ChamberServiceRequest[]) => {
      try {
        await storageService.setItem(chamberStorageKey, JSON.stringify(newList));
      } catch (err) {
        console.warn('[StudentMentorContext] Error persisting chamber requests:', err);
      }
    },
    [chamberStorageKey]
  );

  // Load stored notifications for active user
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await storageService.getItem(storageKey);
        if (raw && isMounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        }
      } catch (err) {
        console.warn('[StudentMentorContext] Error loading notifications:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  const persistNotifications = useCallback(
    async (newList: InAppNotification[]) => {
      try {
        await storageService.setItem(storageKey, JSON.stringify(newList));
      } catch (err) {
        console.warn('[StudentMentorContext] Error persisting notifications:', err);
      }
    },
    [storageKey]
  );

  // Add internal in-app notification
  const addNotification = useCallback((targetUserId: string, title: string, body: string, type: InAppNotification['type'] = 'CONSULTATION') => {
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      targetUserId,
      title,
      body,
      type,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => {
      const updated = [newNotif, ...prev];
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  // Mark single notification as read
  const markNotificationAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
        persistNotifications(updated);
        return updated;
      });
    },
    [persistNotifications]
  );

  // Mark all notifications as read
  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      persistNotifications(updated);
      return updated;
    });
  }, [persistNotifications]);

  // Chamber Service Request lodging (Marketplace, Incubation, Scaling, Investment)
  const addChamberRequest = useCallback(
    (params: {
      serviceTitle: string;
      sector: string;
      notes?: string;
      details?: Record<string, any>;
    }): ChamberServiceRequest => {
      const trackingNumber = `FIC-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
      const newReq: ChamberServiceRequest = {
        id: `req-${Date.now()}`,
        trackingNumber,
        serviceTitle: params.serviceTitle,
        sector: params.sector,
        status: 'UNDER_REVIEW',
        currentStageIndex: 1,
        createdAt: '06 Nov 2026',
        lastUpdated: 'Just now',
        facilitatorAssigned: 'Mr. R. Natarajan (FIC Lead Specialist)',
        estimatedCompletion: 'In Review (3-5 Days)',
        notes: params.notes,
        details: params.details,
      };

      setChamberRequests((prev) => {
        const updated = [newReq, ...prev];
        persistChamberRequests(updated);
        return updated;
      });
      addNotification(
        user?.id || 'all',
        'Chamber Service Request Lodged',
        `Your request for "${params.serviceTitle}" [${trackingNumber}] is in review by Mr. R. Natarajan.`,
        'CHAMBER'
      );

      return newReq;
    },
    [user?.id, addNotification]
  );

  // 1. Student -> Book Consultation
  const bookConsultation = useCallback(
    (params: {
      mentorId: string;
      mentorName: string;
      topic: string;
      domain: string;
      preferredDate: string;
      preferredTime: string;
      duration?: string;
      agenda: string;
      notes?: string;
    }): ConsultationBooking => {
      const studentId = user?.id || 'usr_student_priya';
      const studentName = user?.fullName || 'Priya Sundaram (Engineering Student)';
      const studentEmail = user?.email || 'priya.sundaram@student.fic.org';

      const newBooking: ConsultationBooking = {
        id: `cons-req-${Date.now()}`,
        studentId,
        studentName,
        studentEmail,
        mentorId: params.mentorId,
        mentorName: params.mentorName,
        topic: params.topic,
        domain: params.domain || 'Education & Knowledge',
        requestedDate: params.preferredDate,
        requestedTime: params.preferredTime,
        duration: params.duration || '45 mins',
        agenda: params.agenda,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      setConsultations((prev) => {
        const updated = [newBooking, ...prev];
        persistConsultations(updated);
        return updated;
      });

      // Deliver notification specifically to the selected Mentor
      addNotification(
        params.mentorId,
        'New 1-on-1 Consultation Request',
        `${studentName} requested an advisory session on "${params.topic}" for ${params.preferredDate} at ${params.preferredTime}. Review in My Requests.`,
        'CONSULTATION'
      );

      // Notification for Student
      addNotification(
        studentId,
        'Consultation Request Lodged',
        `Your request with ${params.mentorName} for ${params.preferredDate} has been lodged. Track status under My Requests → My Mentor Bookings.`,
        'CONSULTATION'
      );

      notify.success(
        `Consultation request successfully lodged with ${params.mentorName}. Track status under My Mentor Bookings.`,
        'Request Sent'
      );

      return newBooking;
    },
    [user, addNotification]
  );

  // 2. Mentor -> Accept & Schedule
  const acceptConsultation = useCallback(
    (
      bookingId: string,
      details: {
        confirmedDate?: string;
        confirmedTime?: string;
        meetingMode?: 'Online (Google Meet)' | 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Offline (Chamber)' | string;
        meetingUrl?: string;
        mentorNotes?: string;
      }
    ) => {
      setConsultations((prev) => {
        const updatedList = prev.map((item) => {
          if (item.id !== bookingId) return item;
          const updated: ConsultationBooking = {
            ...item,
            status: 'ACCEPTED',
            confirmedDate: details.confirmedDate || item.requestedDate,
            confirmedTime: details.confirmedTime || item.requestedTime,
            meetingMode: details.meetingMode || 'Online (Google Meet)',
            meetingUrl: details.meetingUrl || 'https://meet.google.com/fic-chamber-advisory',
            mentorNotes: details.mentorNotes || 'Looking forward to the session. Meeting link active.',
          };

          // Notify student
          addNotification(
            item.studentId,
            'Consultation Confirmed',
            `${item.mentorName} accepted your session for ${updated.confirmedDate} at ${updated.confirmedTime}. Meeting link: ${updated.meetingUrl}`,
            'CONSULTATION'
          );

          return updated;
        });
        persistConsultations(updatedList);
        return updatedList;
      });

      notify.success(
        'Session accepted and calendar invitation dispatched with chamber meeting link.',
        'Session Confirmed'
      );
    },
    [addNotification]
  );

  // 3. Mentor -> Propose Reschedule
  const proposeReschedule = useCallback(
    (
      bookingId: string,
      details: {
        proposedDate: string;
        proposedTime: string;
        notes: string;
      }
    ) => {
      setConsultations((prev) =>
        prev.map((item) => {
          if (item.id !== bookingId) return item;
          const updated: ConsultationBooking = {
            ...item,
            status: 'RESCHEDULE_PROPOSED',
            proposedDate: details.proposedDate,
            proposedTime: details.proposedTime,
            rescheduleNotes: details.notes,
          };

          // Notify student
          addNotification(
            item.studentId,
            'Reschedule Proposal Received',
            `${item.mentorName} proposed an alternate slot (${details.proposedDate} • ${details.proposedTime}): "${details.notes}". Please confirm.`,
            'CONSULTATION'
          );

          return updated;
        })
      );

      notify.info(
        `Reschedule proposal sent to student for ${details.proposedDate} at ${details.proposedTime}.`,
        'Reschedule Dispatched'
      );
    },
    [addNotification]
  );

  // 4. Student -> Accept Reschedule Proposal
  const studentAcceptReschedule = useCallback(
    (bookingId: string) => {
      setConsultations((prev) =>
        prev.map((item) => {
          if (item.id !== bookingId) return item;
          const updated: ConsultationBooking = {
            ...item,
            status: 'ACCEPTED',
            confirmedDate: item.proposedDate || item.requestedDate,
            confirmedTime: item.proposedTime || item.requestedTime,
            meetingMode: 'Online (Google Meet)',
            meetingUrl: item.meetingUrl || 'https://meet.google.com/fic-rescheduled-chamber',
            mentorNotes: 'Rescheduled session confirmed by student.',
          };

          // Notify mentor
          addNotification(
            item.mentorId,
            'Student Accepted Reschedule',
            `${item.studentName} accepted the proposed time (${updated.confirmedDate} • ${updated.confirmedTime}).`,
            'CONSULTATION'
          );

          return updated;
        })
      );

      notify.success(
        'You have confirmed the rescheduled session with your mentor.',
        'Reschedule Accepted'
      );
    },
    [addNotification]
  );

  // 5. Student -> Decline Reschedule Proposal
  const studentDeclineReschedule = useCallback(
    (bookingId: string) => {
      setConsultations((prev) =>
        prev.map((item) => {
          if (item.id !== bookingId) return item;
          const updated: ConsultationBooking = {
            ...item,
            status: 'REJECTED',
            rejectionReason: 'Student declined proposed reschedule slot.',
          };

          // Notify mentor
          addNotification(
            item.mentorId,
            'Student Declined Reschedule',
            `${item.studentName} was unable to attend at the proposed alternate time. Booking closed.`,
            'CONSULTATION'
          );

          return updated;
        })
      );

      notify.info(
        'You declined the proposed reschedule. The booking has been closed.',
        'Booking Closed'
      );
    },
    [addNotification]
  );

  // 6. Mentor -> Reject Consultation
  const rejectConsultation = useCallback(
    (bookingId: string, rejectionReason: string) => {
      setConsultations((prev) =>
        prev.map((item) => {
          if (item.id !== bookingId) return item;
          const updated: ConsultationBooking = {
            ...item,
            status: 'REJECTED',
            rejectionReason: rejectionReason || 'Mentor schedule fully committed.',
          };

          // Notify student
          addNotification(
            item.studentId,
            'Consultation Request Declined',
            `${item.mentorName} was unable to accept your request: "${updated.rejectionReason}". You may book another verified mentor.`,
            'CONSULTATION'
          );

          return updated;
        })
      );

      notify.warning(
        'Consultation request declined and constructive feedback dispatched to student.',
        'Request Declined'
      );
    },
    [addNotification]
  );

  // 7. Mentor -> Complete Session & Log Audit
  const completeConsultation = useCallback(
    (
      bookingId: string,
      audit: {
        summary: string;
        recommendedMaterials: string;
        followUpGuidance: string;
      }
    ) => {
      setConsultations((prev) =>
        prev.map((item) => {
          if (item.id !== bookingId) return item;
          const updated: ConsultationBooking = {
            ...item,
            status: 'COMPLETED',
            completionSummary: audit.summary,
            recommendedMaterials: audit.recommendedMaterials,
            followUpGuidance: audit.followUpGuidance,
            completedAt: new Date().toLocaleDateString(),
          };

          // Notify student
          addNotification(
            item.studentId,
            'Mentorship Session Concluded & Audited',
            `${item.mentorName} concluded your advisory session. Session summary and recommended materials are logged in My Mentor Bookings.`,
            'CONSULTATION'
          );

          return updated;
        })
      );

      notify.success(
        'Session concluded, mentorship minutes logged, and chamber certificate credits updated.',
        'Audit Completed'
      );
    },
    [addNotification]
  );

  // 8. Mentor -> Publish Recorded Masterclass Course
  const publishCourse = useCallback(
    (courseData: {
      title: string;
      domain: string;
      language: 'Tamil' | 'English' | 'Hindi';
      duration: string;
      modulesCount?: number;
      level?: string;
      syllabus?: string[];
      description: string;
      videoFileName?: string;
      videoUri?: string;
      videoSize?: string;
    }): SharedMasterclass => {
      const mentorId = user?.id || 'usr_mentor_sundaram';
      const instructor = user?.fullName || 'Dr. K. S. Sundaram';

      const newCourse: SharedMasterclass = {
        id: `mc-${Date.now()}`,
        mentorId,
        instructor: instructor.includes('Dr.') || instructor.includes('Prof.') ? instructor : `Dr. ${instructor}`,
        title: courseData.title,
        domain: courseData.domain,
        language: courseData.language,
        duration: courseData.duration || '2.5 Hours',
        modulesCount: courseData.modulesCount || 6,
        level: courseData.level || 'Intermediate',
        syllabus: courseData.syllabus && courseData.syllabus.length > 0
          ? courseData.syllabus
          : [
              'Module 1: Foundation & Core Industrial Framework',
              'Module 2: Practical Implementation & Telemetry Analysis',
              'Module 3: Case Studies & High-Tolerance Execution',
              'Module 4: Quality Validation & Summary Assessment',
            ],
        status: 'PUBLISHED',
        createdAt: new Date().toISOString().split('T')[0],
        videoFileName: courseData.videoFileName,
        videoUri: courseData.videoUri,
        videoSize: courseData.videoSize,
        description: courseData.description,
      };

      setCourses((prev) => [newCourse, ...prev]);

      notify.success(
        `"${newCourse.title}" has been verified and published to the Student Skill Development catalog.`,
        'Course Published'
      );

      return newCourse;
    },
    [user]
  );

  // 9. Filtering helpers with strict Authorization and Privacy Isolation
  const getStudentBookings = useCallback(
    (studentId?: string): ConsultationBooking[] => {
      const effectiveStudentId = studentId || user?.id;
      // If student is logged in, show only bookings belonging to this student
      if (effectiveStudentId) {
        return consultations.filter(
          (c) => c.studentId === effectiveStudentId || c.studentEmail === user?.email
        );
      }
      return consultations;
    },
    [consultations, user]
  );

  const getMentorIncomingRequests = useCallback(
    (mentorId?: string, mentorName?: string): ConsultationBooking[] => {
      const effectiveMentorId = mentorId || user?.id;
      const effectiveMentorName = mentorName || user?.fullName;

      // Crucial Isolation Rule: Show ONLY requests assigned to THIS mentor
      return consultations.filter((c) => {
        if (effectiveMentorId && c.mentorId === effectiveMentorId) return true;
        if (effectiveMentorName && (c.mentorName.includes(effectiveMentorName) || effectiveMentorName.includes(c.mentorName))) return true;
        return false;
      });
    },
    [consultations, user]
  );

  const effectiveMentors = useMemo(() => {
    const subLower = user?.subcategory?.toLowerCase() || '';
    const isMentorRole =
      user?.role === 'MENTOR' ||
      subLower === 'mentor' ||
      subLower === 'mentor / trainer' ||
      subLower === 'mentor/trainer' ||
      subLower === 'trainer' ||
      subLower === 'teacher' ||
      subLower === 'professor' ||
      subLower === 'teacher / professor' ||
      subLower === 'teacher/professor';
    if (user && isMentorRole) {
      const selfMentor: VerifiedMentor = {
        id: user.id || 'usr_mentor_self',
        name: user.fullName || 'Mentor',
        title: user.specialization ? `${user.specialization} Specialist` : 'Industry Specialist',
        domain: user.category || 'Education & Knowledge',
        languages: ['English', 'Tamil'],
        rating: 5.0,
        consultationsCount: consultations.filter((c) => c.status === 'COMPLETED').length,
        experienceYears: 5,
        bio: user.description || 'Verified chamber mentor.',
        avatarSeed: user.fullName || 'Mentor',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      };
      return [selfMentor, ...mentors.filter((m) => m.id !== selfMentor.id)];
    }
    return mentors;
  }, [user, mentors, consultations]);

  return (
    <StudentMentorContext.Provider
      value={{
        mentors: effectiveMentors,
        consultations,
        courses,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        chamberRequests,
        addChamberRequest,
        bookConsultation,
        studentAcceptReschedule,
        studentDeclineReschedule,
        acceptConsultation,
        proposeReschedule,
        rejectConsultation,
        completeConsultation,
        publishCourse,
        getStudentBookings,
        getMentorIncomingRequests,
      }}
    >
      {children}
    </StudentMentorContext.Provider>
  );
};

export const useStudentMentor = () => {
  const context = useContext(StudentMentorContext);
  if (!context) {
    throw new Error('useStudentMentor must be used within a StudentMentorProvider');
  }
  return context;
};

