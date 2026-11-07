/**
 * FIC Business Hub - FCM Event Trigger Payloads & Dispatch Service
 * Defines structured push notifications for all business modules.
 */

export type FCMEventType =
  | 'REGISTRATION_APPROVED'
  | 'MEMBERSHIP_ACTIVE'
  | 'KYC_VERIFIED'
  | 'CONSULTATION_REQUESTED'
  | 'CONSULTATION_ACCEPTED'
  | 'CONSULTATION_RESCHEDULED'
  | 'CONSULTATION_COMPLETED'
  | 'CHAMBER_REQUEST_UPDATE'
  | 'MEETING_SCHEDULED'
  | 'COURSE_PUBLISHED'
  | 'PAYMENT_RECEIVED'
  | 'GENERAL_ALERT';

export interface FCMEventNotification {
  type: FCMEventType;
  title: string;
  body: string;
  targetScreen: string; // The screen to open when tapped: 'Home' | 'Services' | 'Requests' | 'Connections' | 'Meetings' | 'Marketplace' | 'Courses' | 'Profile' | etc.
  targetId?: string;
  extraData?: Record<string, string>;
}

export function buildFCMNotification(
  type: FCMEventType,
  params: {
    actorName?: string;
    entityTitle?: string;
    entityId?: string;
    details?: string;
  }
): FCMEventNotification {
  switch (type) {
    case 'REGISTRATION_APPROVED':
      return {
        type,
        title: 'Registration Approved 🎉',
        body: 'Welcome to FIC Business Hub! Your membership account is now fully approved.',
        targetScreen: 'Profile',
        targetId: params.entityId,
      };

    case 'MEMBERSHIP_ACTIVE':
      return {
        type,
        title: 'Membership Activated 🌟',
        body: 'Your FIC Hub membership tier is active. Access all 8 advisory modules now.',
        targetScreen: 'Home',
      };

    case 'KYC_VERIFIED':
      return {
        type,
        title: 'KYC Verified 🛡️',
        body: 'Your business identity credentials have been successfully verified.',
        targetScreen: 'Profile',
      };

    case 'CONSULTATION_REQUESTED':
      return {
        type,
        title: 'New Consultation Request 📅',
        body: `A member has booked a consultation session for "${params.entityTitle || 'Advisory'}".`,
        targetScreen: 'Sessions',
        targetId: params.entityId,
      };

    case 'CONSULTATION_ACCEPTED':
      return {
        type,
        title: 'Consultation Confirmed ✅',
        body: `Your consultation request for "${params.entityTitle || 'Session'}" was confirmed. Join link is available.`,
        targetScreen: 'Connections',
        targetId: params.entityId,
      };

    case 'CONSULTATION_RESCHEDULED':
      return {
        type,
        title: 'Consultation Reschedule Proposed ⏱️',
        body: `A new time slot has been proposed for "${params.entityTitle || 'Session'}". Please review.`,
        targetScreen: 'Connections',
        targetId: params.entityId,
      };

    case 'CONSULTATION_COMPLETED':
      return {
        type,
        title: 'Consultation Completed 🎓',
        body: `Session summary & follow-up guidance are ready for "${params.entityTitle || 'Session'}".`,
        targetScreen: 'Connections',
        targetId: params.entityId,
      };

    case 'CHAMBER_REQUEST_UPDATE':
      return {
        type,
        title: 'Chamber Request Updated 📋',
        body: `Service request "${params.entityTitle || 'Request'}" status has been updated: ${params.details || 'In Progress'}.`,
        targetScreen: 'Requests',
        targetId: params.entityId,
      };

    case 'MEETING_SCHEDULED':
      return {
        type,
        title: 'Chamber Meeting Scheduled 🏛️',
        body: `You have an upcoming facilitated chamber session: "${params.entityTitle || 'Chamber Meeting'}".`,
        targetScreen: 'Meetings',
        targetId: params.entityId,
      };

    case 'COURSE_PUBLISHED':
      return {
        type,
        title: 'New Masterclass Available 🚀',
        body: `A new verified masterclass "${params.entityTitle || 'Course'}" is now available in Skill Studio.`,
        targetScreen: 'Courses',
        targetId: params.entityId,
      };

    case 'PAYMENT_RECEIVED':
      return {
        type,
        title: 'Payment Confirmed 💳',
        body: `Your transaction of ${params.details || 'funds'} was processed successfully.`,
        targetScreen: 'Profile',
        targetId: params.entityId,
      };

    default:
      return {
        type: 'GENERAL_ALERT',
        title: 'FIC Hub Notification',
        body: params.details || 'You have a new update in FIC Business Hub.',
        targetScreen: 'Home',
      };
  }
}

