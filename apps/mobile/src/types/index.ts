export type MemberRole =
  | 'BUSINESS_OWNER'
  | 'MSME'
  | 'MANUFACTURER'
  | 'FREELANCER'
  | 'STUDENT'
  | 'MENTOR'
  | 'PROFESSOR'
  | 'INVESTOR';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: MemberRole;
  membershipPlan: 'FIC_ASSOCIATE' | 'FIC_ENTERPRISE' | 'FIC_STUDENT_PRO';
  membershipStatus: 'ACTIVE' | 'PENDING_PAYMENT' | 'EXPIRED';
  kycStatus: 'APPROVED' | 'SUBMITTED' | 'REJECTED' | 'NOT_SUBMITTED';
  category: string;
  subcategory: string;
  dob?: string;
  streetAddress?: string;
  district?: string;
  city?: string;
  stateRegion?: string;
  pincode?: string;
  categoryDocNumber?: string;
  businessName?: string;
  businessType?: string;
  specialization?: string;
  turnover?: string;
  experience?: string;
  description?: string;
  companyName?: string;
}

export type BusinessSector =
  | 'Business & Entrepreneurship'
  | 'Manufacturing'
  | 'Technology'
  | 'Education'
  | 'Professional Services'
  | 'Agriculture'
  | 'Investment & Finance'
  | 'Healthcare'
  | 'Creative Media'
  | 'Employment & Community';

export interface MarketplaceService {
  id: string;
  title: string;
  sector: BusinessSector;
  subcategory: string;
  deliverables: string[];
  turnaroundTime: string;
  verifiedByFIC: boolean;
  description: string;
}

export type RequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REQUIREMENTS_COLLECTED'
  | 'ASSIGNED_TO_PROVIDER'
  | 'PROPOSAL_SHARED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ServiceRequest {
  id: string;
  trackingNumber: string;
  serviceTitle: string;
  sector: BusinessSector;
  status: RequestStatus;
  createdAt: string;
  lastUpdated: string;
  facilitatorAssigned?: string;
  estimatedCompletion?: string;
}

export interface BusinessIdea {
  id: string;
  title: string;
  sector: BusinessSector;
  stage: 'Stage 0' | 'Stage 1';
  ndaSigned: boolean;
  feasibilityScore: {
    marketViability: number;
    technicalFeasibility: number;
    commercialScalability: number;
    compositeScore: number;
  };
  reviewNotes: string[];
}

export interface EnterpriseScalingRequest {
  id: string;
  companyName: string;
  bottleneckDomain: 'Factory Optimization' | 'ERP Modernization' | 'Supply Chain' | 'Capital Restructuring';
  status: 'DIAGNOSTIC_SUBMITTED' | 'ROADMAP_GENERATED' | 'FIC_SPECIALIST_DEPLOYED';
  diagnosticSummary: string;
}

export interface DealRoomListing {
  id: string;
  opportunityCode: string;
  sector: BusinessSector;
  ticketSize: string;
  stage: 'Pre-Series A' | 'Growth / Expansion' | 'Debt / Working Capital';
  confidentialNDA: boolean;
  brief: string;
}

export interface FacilitatedMeeting {
  id: string;
  subject: string;
  dateTime: string;
  ficModeratorName: string;
  meetingLinkOrLocation: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CONCLUDED';
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'KYC' | 'MEETING' | 'REQUEST' | 'ADVISORY';
}

