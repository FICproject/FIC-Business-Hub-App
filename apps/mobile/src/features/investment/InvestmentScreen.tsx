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
import DocumentPicker, { types as docTypes } from 'react-native-document-picker';
import { StandardHeader } from '../../components/common/StandardHeader';
import { FieldError } from '../../components/common/FieldError';
import { notify } from '../../components/common/NotificationContext';
import { useAuth } from '../../state/AuthContext';
import { useStudentMentor } from '../../state/StudentMentorContext';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface AttachedPitchDeck {
  name: string;
  size?: string;
  uri?: string;
}

export interface FundingRequestRecord {
  id: string;
  trackingNumber: string;
  businessName: string;
  businessType?: string;
  category: string;
  subcategory: string;
  sector: string;
  country?: string;
  state?: string;
  cityDistrict?: string;
  pincode?: string;
  businessLocation: string;
  stage: string;
  requiredAmount: string;
  fundingPurpose: string[] | string;
  fundingUtilization?: string;
  currentRevenue?: string;
  description: string;
  fundingType: string;
  equityOffered?: string;
  expectedTimeline: string;
  pitchDeck?: AttachedPitchDeck | null;
  additionalInfo?: string;
  status: 'Sent' | 'Under Review' | 'Matched';
  createdAt: string;
  userId?: string;
  userName?: string;
}

export interface InvestorInterestRecord {
  id: string;
  trackingNumber: string;
  investorName: string;
  category?: string;
  subcategory?: string;
  investorType: string;
  preferredSectors: string[];
  investmentRange: string;
  preferredStage: string;
  investmentType: 'Equity' | 'Debt' | 'Other';
  preferredLocation: string;
  investmentObjectives: string;
  expectedDuration: string;
  riskPreference: 'Conservative' | 'Moderate' | 'Aggressive';
  previousExperience?: string;
  additionalNotes?: string;
  status: 'Sent' | 'Under Review' | 'Matched';
  createdAt: string;
  userId?: string;
  userName?: string;
}

const BUSINESS_TYPE_OPTIONS = [
  'Private Limited (Pvt Ltd)',
  'Limited Liability Partnership (LLP)',
  'Sole Proprietorship',
  'Partnership Firm',
  'One Person Company (OPC)',
  'Public Limited',
  'Individual / Freelancer',
  'Trust / Society / NGO',
  'Other',
];

const SECTOR_OPTIONS = [
  'Manufacturing',
  'Technology',
  'Agriculture',
  'Healthcare',
  'Education',
  'Professional Services',
  'Energy & Utilities',
  'Retail & E-commerce',
  'Creative Media',
  'Real Estate & Infrastructure',
  'Finance & FinTech',
  'Logistics & Supply Chain',
  'Other',
];

const COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Arab Emirates',
  'Singapore',
  'United Kingdom',
  'Other Country',
];

const INDIAN_STATES = [
  'Tamil Nadu',
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Telangana',
  'Gujarat',
  'Uttar Pradesh',
  'Kerala',
  'Andhra Pradesh',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Other State / UT',
];

const BUSINESS_STAGE_OPTIONS = [
  'Idea / Pre-Revenue',
  'Early Stage / Prototype',
  'Early Traction / Seed',
  'Growth Stage / Scaling',
  'Expansion / Established',
  'Mature / Profitable',
];

const FUNDING_PURPOSE_OPTIONS = [
  'Business Expansion',
  'Working Capital',
  'Machinery / Equipment Purchase',
  'Technology / Product Development',
  'Marketing & Sales',
  'New Branch / Location',
  'Infrastructure Development',
  'Other',
];

const ANNUAL_REVENUE_OPTIONS = [
  'Pre-Revenue / Nil',
  'Less than ₹25 Lakhs',
  '₹25 Lakhs - ₹1 Crore',
  '₹1 Crore - ₹5 Crores',
  '₹5 Crores - ₹25 Crores',
  '₹25 Crores - ₹100 Crores',
  'More than ₹100 Crores',
];

const FUNDING_TYPE_OPTIONS = [
  'Equity',
  'Debt / Loan',
  'Grant',
  'Convertible Note',
  'Other',
];

const TIMELINE_OPTIONS = [
  'Immediate (< 1 Month)',
  '1 - 3 Months',
  '3 - 6 Months',
  '6 - 12 Months',
  'Flexible / Open',
];

const INVESTOR_TYPES = ['Individual Angel', 'Venture Fund', 'Corporate Investor', 'Family Office', 'Syndicate / HNI'];
const RISK_PREFERENCES = ['Conservative', 'Moderate', 'Aggressive'] as const;
const DURATIONS = ['1 - 2 Years', '3 - 5 Years', '5+ Years (Long Term)'];

interface InvestmentScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const InvestmentScreen: React.FC<InvestmentScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const { addChamberRequest } = useStudentMentor();

  // Two Main Top Options: 'FUNDING' | 'INVEST'
  const [activeMainOption, setActiveMainOption] = useState<'FUNDING' | 'INVEST'>('FUNDING');

  // Subview toggle: 'FORM' | 'HISTORY'
  const [fundingSubView, setFundingSubView] = useState<'FORM' | 'HISTORY'>('HISTORY');
  const [investSubView, setInvestSubView] = useState<'FORM' | 'HISTORY'>('HISTORY');

  // Local submissions lists
  const [fundingRequests, setFundingRequests] = useState<FundingRequestRecord[]>([]);
  const [investorInterests, setInvestorInterests] = useState<InvestorInterestRecord[]>([]);

  // Selected item modal for detailed view
  const [selectedFundingRecord, setSelectedFundingRecord] = useState<FundingRequestRecord | null>(null);
  const [selectedInvestRecord, setSelectedInvestRecord] = useState<InvestorInterestRecord | null>(null);

  // -------------------------------------------------------------
  // MEMBER REGISTRATION METADATA (Single Source of Truth)
  // -------------------------------------------------------------
  const memberCategory = user?.category?.trim() || 'Not Available';
  const memberSubcategory =
    (user?.subcategory || (user as any)?.subCategory)?.trim() || 'Not Available';

  // -------------------------------------------------------------
  // FUNDING FORM STATE (Section A: Business, Section B: Funding)
  // -------------------------------------------------------------
  // Section A – Business Information
  const [fBusinessName, setFBusinessName] = useState('');
  const [fBusinessType, setFBusinessType] = useState('Private Limited (Pvt Ltd)');
  const [fSector, setFSector] = useState('Technology');
  const [fCountry, setFCountry] = useState('India');
  const [fState, setFState] = useState(user?.stateRegion || 'Tamil Nadu');
  const [fCityDistrict, setFCityDistrict] = useState(user?.district || user?.city || '');
  const [fPincode, setFPincode] = useState(user?.pincode || '');
  const [fStage, setFStage] = useState('Growth Stage / Scaling');

  // Section B – Funding Requirement
  const [fRequiredAmount, setFRequiredAmount] = useState('');
  const [fPurposes, setFPurposes] = useState<string[]>(['Business Expansion', 'Working Capital']);
  const [fUtilization, setFUtilization] = useState('');
  const [fRevenue, setFRevenue] = useState('₹25 Lakhs - ₹1 Crore');
  const [fDescription, setFDescription] = useState('');
  const [fFundingType, setFFundingType] = useState('Equity');
  const [fEquityOffered, setFEquityOffered] = useState('10');
  const [fTimeline, setFTimeline] = useState('1 - 3 Months');
  const [fPitchDeck, setFPitchDeck] = useState<AttachedPitchDeck | null>(null);
  const [fAdditionalInfo, setFAdditionalInfo] = useState('');

  // Dropdown Picker Modal
  const [pickerModal, setPickerModal] = useState<{
    visible: boolean;
    title: string;
    options: string[];
    selectedValue?: string;
    onSelect: (val: string) => void;
  }>({
    visible: false,
    title: '',
    options: [],
    selectedValue: '',
    onSelect: () => {},
  });

  const openDropdownPicker = (
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (val: string) => void
  ) => {
    setPickerModal({
      visible: true,
      title,
      options,
      selectedValue,
      onSelect: (val) => {
        onSelect(val);
        setPickerModal((prev) => ({ ...prev, visible: false }));
      },
    });
  };

  const formatINR = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    if (!digits) return '';
    const num = parseInt(digits, 10);
    if (isNaN(num)) return '';
    return '₹ ' + num.toLocaleString('en-IN');
  };

  const handleAmountChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (!digits) {
      setFRequiredAmount('');
      return;
    }
    setFRequiredAmount(formatINR(digits));
    if (errFRequiredAmount) setErrFRequiredAmount(null);
  };

  const toggleFundingPurpose = (item: string) => {
    setFPurposes((prev) => {
      const exists = prev.includes(item);
      const updated = exists ? prev.filter((p) => p !== item) : [...prev, item];
      if (updated.length > 0 && errFPurposes) {
        setErrFPurposes(null);
      }
      return updated;
    });
  };

  // Inline Validation Errors - Funding
  const [errFBusinessName, setErrFBusinessName] = useState<string | null>(null);
  const [errFBusinessType, setErrFBusinessType] = useState<string | null>(null);
  const [errFSector, setErrFSector] = useState<string | null>(null);
  const [errFCountry, setErrFCountry] = useState<string | null>(null);
  const [errFState, setErrFState] = useState<string | null>(null);
  const [errFCityDistrict, setErrFCityDistrict] = useState<string | null>(null);
  const [errFPincode, setErrFPincode] = useState<string | null>(null);
  const [errFStage, setErrFStage] = useState<string | null>(null);
  const [errFRequiredAmount, setErrFRequiredAmount] = useState<string | null>(null);
  const [errFPurposes, setErrFPurposes] = useState<string | null>(null);
  const [errFUtilization, setErrFUtilization] = useState<string | null>(null);
  const [errFDescription, setErrFDescription] = useState<string | null>(null);
  const [errFEquityOffered, setErrFEquityOffered] = useState<string | null>(null);

  // -------------------------------------------------------------
  // INVEST FORM STATE
  // -------------------------------------------------------------
  const [iInvestorName, setIInvestorName] = useState(user?.fullName || '');
  const [iInvestorType, setIInvestorType] = useState('Individual Angel');
  const [iPreferredSectors, setIPreferredSectors] = useState<string[]>(['Manufacturing', 'Technology']);
  const [iInvestmentRange, setIInvestmentRange] = useState('');
  const [iPreferredStage, setIPreferredStage] = useState('Growth / Series A+');
  const [iInvestmentType, setIInvestmentType] = useState<'Equity' | 'Debt' | 'Other'>('Equity');
  const [iPreferredLocation, setIPreferredLocation] = useState('Pan-India');
  const [iObjectives, setIObjectives] = useState('');
  const [iDuration, setIDuration] = useState('3 - 5 Years');
  const [iRiskPreference, setIRiskPreference] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [iPreviousExperience, setIPreviousExperience] = useState('');
  const [iAdditionalNotes, setIAdditionalNotes] = useState('');

  // Inline Validation Errors - Invest
  const [errIInvestorName, setErrIInvestorName] = useState<string | null>(null);
  const [errIInvestmentRange, setErrIInvestmentRange] = useState<string | null>(null);
  const [errIPreferredSectors, setErrIPreferredSectors] = useState<string | null>(null);
  const [errIObjectives, setErrIObjectives] = useState<string | null>(null);
  const [errILocation, setErrILocation] = useState<string | null>(null);

  // -------------------------------------------------------------
  // PITCH DECK DOCUMENT PICKER
  // -------------------------------------------------------------
  const handlePickPitchDeck = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [
          docTypes.pdf,
          docTypes.doc,
          docTypes.docx,
          docTypes.ppt,
          docTypes.pptx,
          docTypes.images,
          docTypes.allFiles,
        ],
        copyTo: 'cachesDirectory',
        allowMultiSelection: false,
      });

      const file = Array.isArray(res) ? res[0] : res;
      if (file && file.uri) {
        setFPitchDeck({
          name: file.name || 'Pitch_Deck_Document.pdf',
          size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.5 MB',
          uri: file.uri,
        });
        notify.info(`Attached "${file.name || 'document'}" successfully.`, 'File Selected');
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        return;
      }
      console.warn('Document pick error:', err);
      notify.warning('Could not open file manager. You may proceed without an attachment.', 'Attachment Notice');
    }
  };

  // -------------------------------------------------------------
  // SUBMIT FUNDING REQUEST
  // -------------------------------------------------------------
  const handleSubmitFunding = () => {
    let isValid = true;

    // Reset inline error states
    setErrFBusinessName(null);
    setErrFBusinessType(null);
    setErrFSector(null);
    setErrFCountry(null);
    setErrFState(null);
    setErrFCityDistrict(null);
    setErrFPincode(null);
    setErrFStage(null);
    setErrFRequiredAmount(null);
    setErrFPurposes(null);
    setErrFUtilization(null);
    setErrFDescription(null);
    setErrFEquityOffered(null);

    // Section A Validations
    if (!fBusinessName.trim() || fBusinessName.trim().length < 2) {
      setErrFBusinessName('Business / Company Name is required (minimum 2 characters).');
      isValid = false;
    }

    if (!fBusinessType.trim()) {
      setErrFBusinessType('Please select a Business Type.');
      isValid = false;
    }

    if (!fSector.trim()) {
      setErrFSector('Please select an Industry / Business Sector.');
      isValid = false;
    }

    if (!fCountry.trim()) {
      setErrFCountry('Country is required.');
      isValid = false;
    }

    if (!fState.trim()) {
      setErrFState('State / Region is required.');
      isValid = false;
    }

    if (!fCityDistrict.trim()) {
      setErrFCityDistrict('City / District is required.');
      isValid = false;
    }

    const cleanPin = fPincode.replace(/[^0-9]/g, '');
    if (!cleanPin || cleanPin.length < 4) {
      setErrFPincode('Valid Pincode / Postal code is required (min 4 digits).');
      isValid = false;
    }

    if (!fStage.trim()) {
      setErrFStage('Please select your current Business Stage.');
      isValid = false;
    }

    // Section B Validations
    const rawDigits = fRequiredAmount.replace(/[^0-9]/g, '');
    if (!rawDigits || parseInt(rawDigits, 10) <= 0) {
      setErrFRequiredAmount('Funding Amount Required is required and must be greater than 0.');
      isValid = false;
    }

    if (fPurposes.length === 0) {
      setErrFPurposes('Please select at least one Funding Purpose.');
      isValid = false;
    }

    if (!fUtilization.trim() || fUtilization.trim().length < 10) {
      setErrFUtilization('Please explain how you will use the funding (minimum 10 characters).');
      isValid = false;
    }

    if (!fDescription.trim() || fDescription.trim().length < 15) {
      setErrFDescription('Business Description is required (minimum 15 characters).');
      isValid = false;
    }

    if (fFundingType === 'Equity') {
      const eqNum = parseFloat(fEquityOffered.replace(/[^0-9.]/g, ''));
      if (isNaN(eqNum) || eqNum <= 0 || eqNum > 100) {
        setErrFEquityOffered('Valid Equity percentage is required (between 0.1% and 100%).');
        isValid = false;
      }
    }

    if (!isValid) {
      notify.warning('Please complete all mandatory fields marked with an asterisk (*).', 'Incomplete Form');
      return;
    }

    const trackingNumber = `FIC-FND-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullLocation = `${fCityDistrict.trim()}, ${fState.trim()}, ${fPincode.trim()}, ${fCountry.trim()}`;

    const newRecord: FundingRequestRecord = {
      id: `fnd-${Date.now()}`,
      trackingNumber,
      businessName: fBusinessName.trim(),
      businessType: fBusinessType,
      category: memberCategory,
      subcategory: memberSubcategory,
      sector: fSector,
      country: fCountry.trim(),
      state: fState.trim(),
      cityDistrict: fCityDistrict.trim(),
      pincode: fPincode.trim(),
      businessLocation: fullLocation,
      stage: fStage,
      requiredAmount: fRequiredAmount.trim(),
      fundingPurpose: fPurposes,
      fundingUtilization: fUtilization.trim(),
      currentRevenue: fRevenue || 'Not specified',
      description: fDescription.trim(),
      fundingType: fFundingType,
      equityOffered: fFundingType === 'Equity' ? `${fEquityOffered.trim()}%` : undefined,
      expectedTimeline: fTimeline,
      pitchDeck: fPitchDeck,
      additionalInfo: fAdditionalInfo.trim() || undefined,
      status: 'Sent',
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      userId: user?.id,
      userName: user?.fullName,
    };

    // Save under member history
    setFundingRequests((prev) => [newRecord, ...prev]);

    // Register into Central Chamber Request Bus
    addChamberRequest({
      serviceTitle: `Funding Requirement: ${newRecord.businessName} [${newRecord.trackingNumber}]`,
      sector: newRecord.sector,
      notes: newRecord.description,
      details: {
        businessType: newRecord.businessType,
        fundingType: newRecord.fundingType,
        requiredAmount: newRecord.requiredAmount,
        fundingPurpose: Array.isArray(newRecord.fundingPurpose) ? newRecord.fundingPurpose.join(', ') : newRecord.fundingPurpose,
        stage: newRecord.stage,
        equityOffered: newRecord.equityOffered,
        timeline: newRecord.expectedTimeline,
        location: newRecord.businessLocation,
      },
    });

    // Reset Form Fields
    setFBusinessName('');
    setFRequiredAmount('');
    setFUtilization('');
    setFDescription('');
    setFEquityOffered('10');
    setFPitchDeck(null);
    setFAdditionalInfo('');

    // Switch to history tab to display the new submission
    setFundingSubView('HISTORY');

    notify.success(
      `Funding Request [${trackingNumber}] submitted successfully. Assigned to FIC Private Capital Facilitator.`,
      'Funding Request Sent'
    );
  };

  // -------------------------------------------------------------
  // SUBMIT INVESTOR INTEREST
  // -------------------------------------------------------------
  const handleSubmitInvest = () => {
    let isValid = true;

    setErrIInvestorName(null);
    setErrIInvestmentRange(null);
    setErrIPreferredSectors(null);
    setErrIObjectives(null);
    setErrILocation(null);

    if (!iInvestorName.trim()) {
      setErrIInvestorName('Investor / Organization name is required.');
      isValid = false;
    }

    if (iPreferredSectors.length === 0) {
      setErrIPreferredSectors('Select at least one preferred sector.');
      isValid = false;
    }

    if (!iInvestmentRange.trim()) {
      setErrIInvestmentRange('Investment amount / range (₹) is required.');
      isValid = false;
    }

    if (!iPreferredLocation.trim()) {
      setErrILocation('Preferred investment location is required.');
      isValid = false;
    }

    if (!iObjectives.trim()) {
      setErrIObjectives('Investment objectives are required.');
      isValid = false;
    }

    if (!isValid) {
      notify.warning('Please complete all mandatory fields marked with an asterisk (*).', 'Incomplete Form');
      return;
    }

    const trackingNumber = `FIC-INV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: InvestorInterestRecord = {
      id: `inv-${Date.now()}`,
      trackingNumber,
      investorName: iInvestorName.trim(),
      category: memberCategory,
      subcategory: memberSubcategory,
      investorType: iInvestorType,
      preferredSectors: iPreferredSectors,
      investmentRange: iInvestmentRange.trim(),
      preferredStage: iPreferredStage,
      investmentType: iInvestmentType,
      preferredLocation: iPreferredLocation.trim(),
      investmentObjectives: iObjectives.trim(),
      expectedDuration: iDuration,
      riskPreference: iRiskPreference,
      previousExperience: iPreviousExperience.trim() || undefined,
      additionalNotes: iAdditionalNotes.trim() || undefined,
      status: 'Sent',
      createdAt: '06 Nov 2026',
      userId: user?.id,
      userName: user?.fullName,
    };

    // Save under member history
    setInvestorInterests((prev) => [newRecord, ...prev]);

    // Register into Central Chamber Request Bus
    addChamberRequest({
      serviceTitle: `Investor Profile: ${newRecord.investorName} [${newRecord.trackingNumber}]`,
      sector: newRecord.preferredSectors.join(', '),
      notes: newRecord.investmentObjectives,
      details: {
        investorType: newRecord.investorType,
        investmentRange: newRecord.investmentRange,
        investmentType: newRecord.investmentType,
        riskPreference: newRecord.riskPreference,
        preferredLocation: newRecord.preferredLocation,
      },
    });

    // Reset Form Fields
    setIInvestmentRange('');
    setIObjectives('');
    setIPreviousExperience('');
    setIAdditionalNotes('');

    // Switch to history tab to display the new submission
    setInvestSubView('HISTORY');

    notify.success(
      `Investor Interest [${trackingNumber}] registered successfully. Confidential deal matches will be curated by FIC.`,
      'Investor Interest Sent'
    );
  };

  const toggleSectorSelection = (sector: string) => {
    if (iPreferredSectors.includes(sector)) {
      if (iPreferredSectors.length > 1) {
        setIPreferredSectors(iPreferredSectors.filter((s) => s !== sector));
      }
    } else {
      setIPreferredSectors([...iPreferredSectors, sector]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Investment"
        subtitle="Private Capital & Syndication"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Investment"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ============================================================== */}
        {/* 1. TWO MAIN OPTIONS: FUNDING vs INVEST                         */}
        {/* ============================================================== */}
        <View style={styles.mainOptionsContainer}>
          {/* Option A: Funding (Need Investment) */}
          <TouchableOpacity
            style={[
              styles.mainOptionCard,
              activeMainOption === 'FUNDING' && styles.mainOptionCardActive,
            ]}
            activeOpacity={0.88}
            onPress={() => setActiveMainOption('FUNDING')}
          >
            <View style={styles.mainOptionHeader}>
              <View
                style={[
                  styles.mainOptionIconBox,
                  activeMainOption === 'FUNDING' && styles.mainOptionIconBoxActive,
                ]}
              >
                <Text style={styles.mainOptionEmoji}>🚀</Text>
              </View>
              {activeMainOption === 'FUNDING' && (
                <View style={styles.selectedPill}>
                  <Text style={styles.selectedPillText}>✓ Selected</Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.mainOptionTitle,
                activeMainOption === 'FUNDING' && styles.mainOptionTitleActive,
              ]}
            >
              Funding
            </Text>
            <Text style={styles.mainOptionSub}>Need Investment</Text>
            <Text style={styles.mainOptionDesc}>
              Submit capital requirement for accredited chamber investor review
            </Text>
          </TouchableOpacity>

          {/* Option B: Invest (Provide Investment) */}
          <TouchableOpacity
            style={[
              styles.mainOptionCard,
              activeMainOption === 'INVEST' && styles.mainOptionCardActive,
            ]}
            activeOpacity={0.88}
            onPress={() => setActiveMainOption('INVEST')}
          >
            <View style={styles.mainOptionHeader}>
              <View
                style={[
                  styles.mainOptionIconBox,
                  activeMainOption === 'INVEST' && styles.mainOptionIconBoxActive,
                ]}
              >
                <Text style={styles.mainOptionEmoji}>💎</Text>
              </View>
              {activeMainOption === 'INVEST' && (
                <View style={styles.selectedPill}>
                  <Text style={styles.selectedPillText}>✓ Selected</Text>
                </View>
              )}
            </View>

            <Text
              style={[
                styles.mainOptionTitle,
                activeMainOption === 'INVEST' && styles.mainOptionTitleActive,
              ]}
            >
              Invest
            </Text>
            <Text style={styles.mainOptionSub}>Provide Investment</Text>
            <Text style={styles.mainOptionDesc}>
              Register investor criteria to discover pre-screened deal syndicates
            </Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* 2. SECTION A: FUNDING (NEED INVESTMENT)                        */}
        {/* ============================================================== */}
        {activeMainOption === 'FUNDING' && (
          <View style={styles.sectionWrapper}>
            {/* Sub-view access: Request History */}
            <View style={styles.subViewTabsRow}>
              <TouchableOpacity
                style={[styles.subViewTab, styles.subViewTabActive]}
                activeOpacity={0.8}
                onPress={() => setFundingSubView('HISTORY')}
              >
                <Text style={[styles.subViewTabText, styles.subViewTabTextActive]}>
                  {fundingSubView === 'FORM' ? '← View Request History' : 'Request History'} ({fundingRequests.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* FUNDING FORM */}
            {fundingSubView === 'FORM' && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.formTitle}>Funding Request Form</Text>
                    <TouchableOpacity onPress={() => setFundingSubView('HISTORY')}>
                      <Text style={styles.headerBackHistoryText}>History ({fundingRequests.length})</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.formSubtitle}>
                    Private Capital Proposal for FIC Syndicate Evaluation
                  </Text>
                </View>

                {/* ========================================================= */}
                {/* SECTION A – BUSINESS INFORMATION                          */}
                {/* ========================================================= */}
                <View style={styles.formSectionHeader}>
                  <View style={styles.formSectionBadge}>
                    <Text style={styles.formSectionBadgeText}>Section A</Text>
                  </View>
                  <Text style={styles.formSectionTitle}>Business Information</Text>
                </View>

                {/* Member Registered Category & Subcategory (Read-only) */}
                <View style={styles.rowTwoCols}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={styles.fieldLabel}>Main Category</Text>
                    <TextInput
                      style={[styles.inputField, styles.inputFieldReadonly]}
                      value={memberCategory}
                      editable={false}
                      placeholder="Not Available"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.fieldLabel}>Subcategory</Text>
                    <TextInput
                      style={[styles.inputField, styles.inputFieldReadonly]}
                      value={memberSubcategory}
                      editable={false}
                      placeholder="Not Available"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* 1. Business / Company Name */}
                <Text style={styles.fieldLabel}>
                  Business / Company Name <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, !!errFBusinessName && styles.inputFieldError]}
                  placeholder="e.g. Apex Precision Aero Components"
                  placeholderTextColor="#94A3B8"
                  value={fBusinessName}
                  onChangeText={(val) => {
                    setFBusinessName(val);
                    if (errFBusinessName) setErrFBusinessName(null);
                  }}
                />
                <FieldError error={errFBusinessName} />

                {/* 2. Business Type */}
                <Text style={styles.fieldLabel}>
                  Business Type <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dropdownPill, !!errFBusinessType && styles.inputFieldError]}
                  activeOpacity={0.8}
                  onPress={() =>
                    openDropdownPicker(
                      'Select Business Type',
                      BUSINESS_TYPE_OPTIONS,
                      fBusinessType,
                      (val) => {
                        setFBusinessType(val);
                        if (errFBusinessType) setErrFBusinessType(null);
                      }
                    )
                  }
                >
                  <Text style={[styles.dropdownPillText, !fBusinessType && styles.dropdownPlaceholder]} numberOfLines={1}>
                    {fBusinessType || 'Select Business Type'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>
                <FieldError error={errFBusinessType} />

                {/* 3. Industry / Business Sector */}
                <Text style={styles.fieldLabel}>
                  Industry / Business Sector <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dropdownPill, !!errFSector && styles.inputFieldError]}
                  activeOpacity={0.8}
                  onPress={() =>
                    openDropdownPicker(
                      'Select Industry / Business Sector',
                      SECTOR_OPTIONS,
                      fSector,
                      (val) => {
                        setFSector(val);
                        if (errFSector) setErrFSector(null);
                      }
                    )
                  }
                >
                  <Text style={[styles.dropdownPillText, !fSector && styles.dropdownPlaceholder]} numberOfLines={1}>
                    {fSector || 'Select Industry / Sector'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>
                <FieldError error={errFSector} />

                {/* 4. Business Location */}
                <Text style={styles.fieldLabel}>
                  Business Location <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                {/* Location: Country & State */}
                <View style={styles.rowTwoCols}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={styles.subFieldLabel}>Country</Text>
                    <TouchableOpacity
                      style={[styles.dropdownPill, !!errFCountry && styles.inputFieldError]}
                      activeOpacity={0.8}
                      onPress={() =>
                        openDropdownPicker(
                          'Select Country',
                          COUNTRY_OPTIONS,
                          fCountry,
                          (val) => {
                            setFCountry(val);
                            if (errFCountry) setErrFCountry(null);
                          }
                        )
                      }
                    >
                      <Text style={[styles.dropdownPillText, !fCountry && styles.dropdownPlaceholder]} numberOfLines={1}>
                        {fCountry || 'Country'}
                      </Text>
                      <Text style={styles.dropdownChevron}>▼</Text>
                    </TouchableOpacity>
                    <FieldError error={errFCountry} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.subFieldLabel}>State / Region</Text>
                    <TouchableOpacity
                      style={[styles.dropdownPill, !!errFState && styles.inputFieldError]}
                      activeOpacity={0.8}
                      onPress={() =>
                        openDropdownPicker(
                          'Select State / Region',
                          INDIAN_STATES,
                          fState,
                          (val) => {
                            setFState(val);
                            if (errFState) setErrFState(null);
                          }
                        )
                      }
                    >
                      <Text style={[styles.dropdownPillText, !fState && styles.dropdownPlaceholder]} numberOfLines={1}>
                        {fState || 'State'}
                      </Text>
                      <Text style={styles.dropdownChevron}>▼</Text>
                    </TouchableOpacity>
                    <FieldError error={errFState} />
                  </View>
                </View>

                {/* Location: City/District & Pincode */}
                <View style={styles.rowTwoCols}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={styles.subFieldLabel}>City / District</Text>
                    <TextInput
                      style={[styles.inputField, !!errFCityDistrict && styles.inputFieldError]}
                      placeholder="e.g. Coimbatore"
                      placeholderTextColor="#94A3B8"
                      value={fCityDistrict}
                      onChangeText={(val) => {
                        setFCityDistrict(val);
                        if (errFCityDistrict) setErrFCityDistrict(null);
                      }}
                    />
                    <FieldError error={errFCityDistrict} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.subFieldLabel}>Pincode / Postal Code</Text>
                    <TextInput
                      style={[styles.inputField, !!errFPincode && styles.inputFieldError]}
                      placeholder="e.g. 641001"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      maxLength={8}
                      value={fPincode}
                      onChangeText={(val) => {
                        setFPincode(val);
                        if (errFPincode) setErrFPincode(null);
                      }}
                    />
                    <FieldError error={errFPincode} />
                  </View>
                </View>

                {/* 5. Business Stage */}
                <Text style={styles.fieldLabel}>
                  Business Stage <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dropdownPill, !!errFStage && styles.inputFieldError]}
                  activeOpacity={0.8}
                  onPress={() =>
                    openDropdownPicker(
                      'Select Business Stage',
                      BUSINESS_STAGE_OPTIONS,
                      fStage,
                      (val) => {
                        setFStage(val);
                        if (errFStage) setErrFStage(null);
                      }
                    )
                  }
                >
                  <Text style={[styles.dropdownPillText, !fStage && styles.dropdownPlaceholder]} numberOfLines={1}>
                    {fStage || 'Select Business Stage'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>
                <FieldError error={errFStage} />

                {/* ========================================================= */}
                {/* SECTION B – FUNDING REQUIREMENT                           */}
                {/* ========================================================= */}
                <View style={[styles.formSectionHeader, { marginTop: 22 }]}>
                  <View style={styles.formSectionBadge}>
                    <Text style={styles.formSectionBadgeText}>Section B</Text>
                  </View>
                  <Text style={styles.formSectionTitle}>Funding Requirement</Text>
                </View>

                {/* 6. Funding Amount Required (INR) */}
                <Text style={styles.fieldLabel}>
                  Funding Amount Required (INR) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, !!errFRequiredAmount && styles.inputFieldError]}
                  placeholder="e.g. ₹ 50,00,000"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={fRequiredAmount}
                  onChangeText={handleAmountChange}
                />
                <FieldError error={errFRequiredAmount} />

                {/* 7. Funding Purpose (multi-select) */}
                <Text style={styles.fieldLabel}>
                  Funding Purpose (Select multiple) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.multiSelectChipsWrap}>
                  {FUNDING_PURPOSE_OPTIONS.map((purpose) => {
                    const isSelected = fPurposes.includes(purpose);
                    return (
                      <TouchableOpacity
                        key={purpose}
                        style={[styles.multiChip, isSelected && styles.multiChipActive]}
                        activeOpacity={0.75}
                        onPress={() => toggleFundingPurpose(purpose)}
                      >
                        <Text style={[styles.multiChipText, isSelected && styles.multiChipTextActive]}>
                          {isSelected ? '✓ ' : '+ '}
                          {purpose}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <FieldError error={errFPurposes} />

                {/* 8. Explain How You Will Use the Funding */}
                <Text style={styles.fieldLabel}>
                  Explain How You Will Use the Funding <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, styles.textAreaField, !!errFUtilization && styles.inputFieldError]}
                  placeholder="Detail how the capital will be allocated (e.g. 40% automated machinery, 30% working capital inventory, 20% team hiring, 10% marketing)..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={fUtilization}
                  onChangeText={(val) => {
                    setFUtilization(val);
                    if (errFUtilization) setErrFUtilization(null);
                  }}
                />
                <FieldError error={errFUtilization} />

                {/* 9. Current Annual Revenue */}
                <Text style={styles.fieldLabel}>Current Annual Revenue (Optional)</Text>
                <TouchableOpacity
                  style={styles.dropdownPill}
                  activeOpacity={0.8}
                  onPress={() =>
                    openDropdownPicker(
                      'Select Current Annual Revenue',
                      ANNUAL_REVENUE_OPTIONS,
                      fRevenue,
                      (val) => setFRevenue(val)
                    )
                  }
                >
                  <Text style={[styles.dropdownPillText, !fRevenue && styles.dropdownPlaceholder]} numberOfLines={1}>
                    {fRevenue || 'Select Current Revenue'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>

                {/* 10. Business Description */}
                <Text style={styles.fieldLabel}>
                  Business Description <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, styles.textAreaField, !!errFDescription && styles.inputFieldError]}
                  placeholder="Describe your operational model, products/services, competitive moat, customer traction, and revenue channels..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={4}
                  value={fDescription}
                  onChangeText={(val) => {
                    setFDescription(val);
                    if (errFDescription) setErrFDescription(null);
                  }}
                />
                <FieldError error={errFDescription} />

                {/* 11. Funding Type */}
                <Text style={styles.fieldLabel}>
                  Funding Type <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {FUNDING_TYPE_OPTIONS.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chipPill, fFundingType === type && styles.chipPillActive]}
                      onPress={() => setFFundingType(type)}
                    >
                      <Text style={[styles.chipText, fFundingType === type && styles.chipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* 12. Equity Offered (%) – ONLY when Equity is selected */}
                {fFundingType === 'Equity' && (
                  <View style={styles.conditionalBox}>
                    <Text style={styles.fieldLabel}>
                      Equity Offered (%) <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.inputField, !!errFEquityOffered && styles.inputFieldError]}
                      placeholder="e.g. 10"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={fEquityOffered}
                      onChangeText={(val) => {
                        setFEquityOffered(val);
                        if (errFEquityOffered) setErrFEquityOffered(null);
                      }}
                    />
                    <FieldError error={errFEquityOffered} />
                    <Text style={styles.conditionalHelper}>
                      Specify the approximate equity stake allocated for this capital tranche.
                    </Text>
                  </View>
                )}

                {/* 13. Expected Funding Timeline */}
                <Text style={styles.fieldLabel}>Expected Funding Timeline</Text>
                <TouchableOpacity
                  style={styles.dropdownPill}
                  activeOpacity={0.8}
                  onPress={() =>
                    openDropdownPicker(
                      'Select Expected Funding Timeline',
                      TIMELINE_OPTIONS,
                      fTimeline,
                      (val) => setFTimeline(val)
                    )
                  }
                >
                  <Text style={[styles.dropdownPillText, !fTimeline && styles.dropdownPlaceholder]} numberOfLines={1}>
                    {fTimeline || 'Select Expected Timeline'}
                  </Text>
                  <Text style={styles.dropdownChevron}>▼</Text>
                </TouchableOpacity>

                {/* 14. Pitch Deck / Supporting Document Upload */}
                <Text style={styles.fieldLabel}>Pitch Deck / Supporting Document (Optional)</Text>
                {fPitchDeck ? (
                  <View style={styles.fileAttachedRow}>
                    <View style={styles.fileInfoCol}>
                      <Text style={styles.fileNameText}>📄 {fPitchDeck.name}</Text>
                      <Text style={styles.fileSizeText}>{fPitchDeck.size || 'Attached'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.fileRemoveBtn}
                      onPress={() => setFPitchDeck(null)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.fileRemoveText}>✕ Remove</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadDocBtn}
                    activeOpacity={0.8}
                    onPress={handlePickPitchDeck}
                  >
                    <Text style={styles.uploadDocIcon}>📎</Text>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.uploadDocTitle}>Upload Pitch Deck / Teaser PDF</Text>
                      <Text style={styles.uploadDocSub}>Supports PDF, PPT, DOCX (Max 25MB)</Text>
                    </View>
                    <Text style={styles.uploadDocAction}>Browse</Text>
                  </TouchableOpacity>
                )}

                {/* 15. Additional Information */}
                <Text style={styles.fieldLabel}>Additional Information / Facilitator Notes</Text>
                <TextInput
                  style={[styles.inputField, styles.textAreaField]}
                  placeholder="Specify customer traction, patent filings, or specific investor preferences..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  value={fAdditionalInfo}
                  onChangeText={setFAdditionalInfo}
                />

                {/* 16. Form Action Buttons */}
                <View style={styles.formActionButtonsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.8}
                    onPress={() => setFundingSubView('HISTORY')}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitBtnFlex}
                    activeOpacity={0.88}
                    onPress={handleSubmitFunding}
                  >
                    <Text style={styles.submitBtnText}>Submit Funding Request →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* FUNDING REQUEST HISTORY */}
            {fundingSubView === 'HISTORY' && (
              <View>
                <View style={styles.historyHeaderRow}>
                  <Text style={styles.historyTitle}>
                    Your Funding Requests ({fundingRequests.length})
                  </Text>
                  <TouchableOpacity onPress={() => setFundingSubView('FORM')}>
                    <Text style={styles.newSubmissionLink}>+ New Request</Text>
                  </TouchableOpacity>
                </View>

                {fundingRequests.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>💼</Text>
                    <Text style={styles.emptyTitle}>No Funding Requests yet</Text>
                    <Text style={styles.emptySub}>
                      Submit your business capital requirement to connect with accredited chamber investors.
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={() => setFundingSubView('FORM')}
                    >
                      <Text style={styles.emptyActionBtnText}>+ Create Funding Request</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  fundingRequests.map((req) => (
                    <View key={req.id} style={styles.requestHistoryCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.trackingPill}>
                          <Text style={styles.trackingPillText}>{req.trackingNumber}</Text>
                        </View>
                        <View style={styles.statusSentPill}>
                          <Text style={styles.statusSentText}>● {req.status}</Text>
                        </View>
                      </View>

                      <Text style={styles.reqCardTitle}>{req.businessName}</Text>
                      <Text style={styles.reqCardSector}>
                        Sector: {req.sector} • Stage: {req.stage}
                      </Text>

                      <View style={styles.reqDetailsGrid}>
                        <View style={styles.reqDetailItem}>
                          <Text style={styles.reqDetailLabel}>Required Funding:</Text>
                          <Text style={styles.reqDetailValue}>{req.requiredAmount}</Text>
                        </View>
                        <View style={styles.reqDetailItem}>
                          <Text style={styles.reqDetailLabel}>Funding Type:</Text>
                          <Text style={styles.reqDetailValue}>
                            {req.fundingType}
                            {req.equityOffered ? ` (${req.equityOffered} equity)` : ''}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.purposeBox}>
                        <Text style={styles.purposeLabel}>
                          Purpose: {Array.isArray(req.fundingPurpose) ? req.fundingPurpose.join(', ') : req.fundingPurpose}
                        </Text>
                        <Text style={styles.purposeDesc} numberOfLines={2}>
                          {req.description}
                        </Text>
                      </View>

                      <View style={styles.cardFooterRow}>
                        <Text style={styles.footerDateText}>Submitted: {req.createdAt}</Text>
                        <TouchableOpacity
                          style={styles.viewDetailsBtn}
                          onPress={() => setSelectedFundingRecord(req)}
                        >
                          <Text style={styles.viewDetailsBtnText}>View Details →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* 3. SECTION B: INVEST (PROVIDE INVESTMENT)                      */}
        {/* ============================================================== */}
        {activeMainOption === 'INVEST' && (
          <View style={styles.sectionWrapper}>
            {/* Sub-view access: Interest History */}
            <View style={styles.subViewTabsRow}>
              <TouchableOpacity
                style={[styles.subViewTab, styles.subViewTabActive]}
                activeOpacity={0.8}
                onPress={() => setInvestSubView('HISTORY')}
              >
                <Text style={[styles.subViewTabText, styles.subViewTabTextActive]}>
                  {investSubView === 'FORM' ? '← View Interest History' : 'Interest History'} ({investorInterests.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* INVESTOR FORM */}
            {investSubView === 'FORM' && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.formTitle}>Investor Interest Registration</Text>
                    <TouchableOpacity onPress={() => setInvestSubView('HISTORY')}>
                      <Text style={styles.headerBackHistoryText}>History ({investorInterests.length})</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.formSubtitle}>
                    Register deployment preferences for accredited chamber deal curation
                  </Text>
                </View>

                {/* 1. Investor Name / Organization */}
                <Text style={styles.fieldLabel}>
                  Investor Name / Organization <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, !!errIInvestorName && styles.inputFieldError]}
                  placeholder="e.g. Sundaram Capital Partners / Angel Office"
                  placeholderTextColor="#94A3B8"
                  value={iInvestorName}
                  onChangeText={(val) => {
                    setIInvestorName(val);
                    if (errIInvestorName) setErrIInvestorName(null);
                  }}
                />
                <FieldError error={errIInvestorName} />

                {/* 2. Main Category and Subcategory (Dynamic from Member Registration) */}
                <View style={styles.rowTwoCols}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={styles.fieldLabel}>Main Category</Text>
                    <TextInput
                      style={[styles.inputField, styles.inputFieldReadonly]}
                      value={memberCategory}
                      editable={false}
                      placeholder="Not Available"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.fieldLabel}>Subcategory</Text>
                    <TextInput
                      style={[styles.inputField, styles.inputFieldReadonly]}
                      value={memberSubcategory}
                      editable={false}
                      placeholder="Not Available"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* 3. Investor Type */}
                <Text style={styles.fieldLabel}>
                  Investor Type <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {INVESTOR_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.chipPill, iInvestorType === type && styles.chipPillActive]}
                      onPress={() => setIInvestorType(type)}
                    >
                      <Text style={[styles.chipText, iInvestorType === type && styles.chipTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* 3. Preferred Investment Sectors */}
                <Text style={styles.fieldLabel}>
                  Preferred Investment Sectors (Select multiple) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.multiSelectChipsWrap}>
                  {SECTOR_OPTIONS.map((sec) => {
                    const isSelected = iPreferredSectors.includes(sec);
                    return (
                      <TouchableOpacity
                        key={sec}
                        style={[styles.multiChip, isSelected && styles.multiChipActive]}
                        onPress={() => toggleSectorSelection(sec)}
                      >
                        <Text style={[styles.multiChipText, isSelected && styles.multiChipTextActive]}>
                          {isSelected ? '✓ ' : '+ '}
                          {sec}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <FieldError error={errIPreferredSectors} />

                {/* 4. Investment Amount / Range (₹) */}
                <Text style={styles.fieldLabel}>
                  Investment Amount / Range (₹) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, !!errIInvestmentRange && styles.inputFieldError]}
                  placeholder="e.g. ₹25 Lakhs - ₹1.5 Crores"
                  placeholderTextColor="#94A3B8"
                  value={iInvestmentRange}
                  onChangeText={(val) => {
                    setIInvestmentRange(val);
                    if (errIInvestmentRange) setErrIInvestmentRange(null);
                  }}
                />
                <FieldError error={errIInvestmentRange} />

                {/* 5. Preferred Funding Stage */}
                <Text style={styles.fieldLabel}>Preferred Funding Stage</Text>
                <View style={styles.choiceRow}>
                  {['Seed / Early', 'Growth / Expansion', 'Pre-IPO'].map((stg) => (
                    <TouchableOpacity
                      key={stg}
                      style={[styles.choiceBtn, iPreferredStage === stg && styles.choiceBtnActive]}
                      onPress={() => setIPreferredStage(stg)}
                    >
                      <Text style={[styles.choiceBtnText, iPreferredStage === stg && styles.choiceBtnTextActive]}>
                        {stg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 6. Investment Type */}
                <Text style={styles.fieldLabel}>
                  Investment Type <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.choiceRow}>
                  {['Equity', 'Debt', 'Other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.choiceBtn, iInvestmentType === type && styles.choiceBtnActive]}
                      onPress={() => setIInvestmentType(type as any)}
                    >
                      <Text style={[styles.choiceBtnText, iInvestmentType === type && styles.choiceBtnTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 7. Preferred Investment Location */}
                <Text style={styles.fieldLabel}>
                  Preferred Investment Location <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, !!errILocation && styles.inputFieldError]}
                  placeholder="e.g. Pan-India or South India / Tamil Nadu"
                  placeholderTextColor="#94A3B8"
                  value={iPreferredLocation}
                  onChangeText={(val) => {
                    setIPreferredLocation(val);
                    if (errILocation) setErrILocation(null);
                  }}
                />
                <FieldError error={errILocation} />

                {/* 8. Investment Objectives */}
                <Text style={styles.fieldLabel}>
                  Investment Objectives <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, styles.textAreaField, !!errIObjectives && styles.inputFieldError]}
                  placeholder="Specify strategic objectives, target returns, board participation, and syndication scope..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  value={iObjectives}
                  onChangeText={(val) => {
                    setIObjectives(val);
                    if (errIObjectives) setErrIObjectives(null);
                  }}
                />
                <FieldError error={errIObjectives} />

                {/* 9. Expected Investment Duration */}
                <Text style={styles.fieldLabel}>Expected Investment Duration</Text>
                <View style={styles.choiceRow}>
                  {DURATIONS.map((dur) => (
                    <TouchableOpacity
                      key={dur}
                      style={[styles.choiceBtn, iDuration === dur && styles.choiceBtnActive]}
                      onPress={() => setIDuration(dur)}
                    >
                      <Text style={[styles.choiceBtnText, iDuration === dur && styles.choiceBtnTextActive]}>
                        {dur}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 10. Risk Preference */}
                <Text style={styles.fieldLabel}>Risk Preference</Text>
                <View style={styles.choiceRow}>
                  {RISK_PREFERENCES.map((risk) => (
                    <TouchableOpacity
                      key={risk}
                      style={[styles.choiceBtn, iRiskPreference === risk && styles.choiceBtnActive]}
                      onPress={() => setIRiskPreference(risk)}
                    >
                      <Text style={[styles.choiceBtnText, iRiskPreference === risk && styles.choiceBtnTextActive]}>
                        {risk}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 11. Previous Investment Experience (if applicable) */}
                <Text style={styles.fieldLabel}>Previous Investment Experience (if applicable)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. 5+ deals completed in automotive tooling and industrial IoT"
                  placeholderTextColor="#94A3B8"
                  value={iPreviousExperience}
                  onChangeText={setIPreviousExperience}
                />

                {/* 12. Additional Notes */}
                <Text style={styles.fieldLabel}>Additional Notes</Text>
                <TextInput
                  style={[styles.inputField, styles.textAreaField]}
                  placeholder="Any co-investor syndication preferences, due diligence timelines, or governance notes..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                  value={iAdditionalNotes}
                  onChangeText={setIAdditionalNotes}
                />

                {/* 13. Form Action Buttons */}
                <View style={styles.formActionButtonsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.8}
                    onPress={() => setInvestSubView('HISTORY')}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.submitBtnFlex}
                    activeOpacity={0.88}
                    onPress={handleSubmitInvest}
                  >
                    <Text style={styles.submitBtnText}>Submit Investment Interest →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* INVESTOR INTEREST HISTORY */}
            {investSubView === 'HISTORY' && (
              <View>
                <View style={styles.historyHeaderRow}>
                  <Text style={styles.historyTitle}>
                    Your Investment Interests ({investorInterests.length})
                  </Text>
                  <TouchableOpacity onPress={() => setInvestSubView('FORM')}>
                    <Text style={styles.newSubmissionLink}>+ New Interest</Text>
                  </TouchableOpacity>
                </View>

                {investorInterests.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📈</Text>
                    <Text style={styles.emptyTitle}>No Investment Interests submitted yet</Text>
                    <Text style={styles.emptySub}>
                      Register your investment criteria to receive confidential, vetted deal-room opportunities.
                    </Text>
                    <TouchableOpacity
                      style={styles.emptyActionBtn}
                      onPress={() => setInvestSubView('FORM')}
                    >
                      <Text style={styles.emptyActionBtnText}>+ Register Investor Profile</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  investorInterests.map((inv) => (
                    <View key={inv.id} style={styles.requestHistoryCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.trackingPill}>
                          <Text style={styles.trackingPillText}>{inv.trackingNumber}</Text>
                        </View>
                        <View style={styles.statusSentPill}>
                          <Text style={styles.statusSentText}>● {inv.status}</Text>
                        </View>
                      </View>

                      <Text style={styles.reqCardTitle}>{inv.investorName}</Text>
                      <Text style={styles.reqCardSector}>
                        Type: {inv.investorType} • Risk: {inv.riskPreference}
                      </Text>

                      <View style={styles.reqDetailsGrid}>
                        <View style={styles.reqDetailItem}>
                          <Text style={styles.reqDetailLabel}>Deployment Range:</Text>
                          <Text style={styles.reqDetailValue}>{inv.investmentRange}</Text>
                        </View>
                        <View style={styles.reqDetailItem}>
                          <Text style={styles.reqDetailLabel}>Structure:</Text>
                          <Text style={styles.reqDetailValue}>
                            {inv.investmentType} ({inv.expectedDuration})
                          </Text>
                        </View>
                      </View>

                      <View style={styles.purposeBox}>
                        <Text style={styles.purposeLabel}>
                          Preferred Sectors: {inv.preferredSectors.join(', ')}
                        </Text>
                        <Text style={styles.purposeDesc} numberOfLines={2}>
                          {inv.investmentObjectives}
                        </Text>
                      </View>

                      <View style={styles.cardFooterRow}>
                        <Text style={styles.footerDateText}>Registered: {inv.createdAt}</Text>
                        <TouchableOpacity
                          style={styles.viewDetailsBtn}
                          onPress={() => setSelectedInvestRecord(inv)}
                        >
                          <Text style={styles.viewDetailsBtnText}>View Profile Details →</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ============================================================== */}
      {/* 4. MODAL: FUNDING REQUEST DETAILS                              */}
      {/* ============================================================== */}
      <Modal
        visible={!!selectedFundingRecord}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedFundingRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTrackingText}>{selectedFundingRecord?.trackingNumber}</Text>
                <Text style={styles.modalTitleText}>{selectedFundingRecord?.businessName}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedFundingRecord(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Status:</Text>
                <View style={styles.statusSentPill}>
                  <Text style={styles.statusSentText}>● {selectedFundingRecord?.status}</Text>
                </View>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Main Category:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.category || 'Not Available'}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Subcategory:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.subcategory || 'Not Available'}</Text>
              </View>

              {selectedFundingRecord?.businessType && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Business Type:</Text>
                  <Text style={styles.modalDetailVal}>{selectedFundingRecord.businessType}</Text>
                </View>
              )}

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Industry / Sector:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.sector}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Business Stage:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.stage}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Location:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.businessLocation}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Funding Amount (₹):</Text>
                <Text style={[styles.modalDetailVal, { color: '#2563EB', fontWeight: '800' }]}>
                  {selectedFundingRecord?.requiredAmount}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Funding Type:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.fundingType}</Text>
              </View>

              {selectedFundingRecord?.equityOffered && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Equity Offered:</Text>
                  <Text style={styles.modalDetailVal}>{selectedFundingRecord.equityOffered}</Text>
                </View>
              )}

              {selectedFundingRecord?.currentRevenue && (
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Annual Revenue:</Text>
                  <Text style={styles.modalDetailVal}>{selectedFundingRecord.currentRevenue}</Text>
                </View>
              )}

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Timeline:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.expectedTimeline}</Text>
              </View>

              <View style={styles.modalSectionBox}>
                <Text style={styles.modalSectionLabel}>Funding Purpose:</Text>
                <Text style={styles.modalSectionBody}>
                  {Array.isArray(selectedFundingRecord?.fundingPurpose)
                    ? selectedFundingRecord?.fundingPurpose.join(', ')
                    : selectedFundingRecord?.fundingPurpose}
                </Text>
              </View>

              {selectedFundingRecord?.fundingUtilization && (
                <View style={styles.modalSectionBox}>
                  <Text style={styles.modalSectionLabel}>Use of Funding:</Text>
                  <Text style={styles.modalSectionBody}>{selectedFundingRecord.fundingUtilization}</Text>
                </View>
              )}

              <View style={styles.modalSectionBox}>
                <Text style={styles.modalSectionLabel}>Business Description:</Text>
                <Text style={styles.modalSectionBody}>{selectedFundingRecord?.description}</Text>
              </View>

              {selectedFundingRecord?.additionalInfo && (
                <View style={styles.modalSectionBox}>
                  <Text style={styles.modalSectionLabel}>Additional Facilitator Notes:</Text>
                  <Text style={styles.modalSectionBody}>{selectedFundingRecord.additionalInfo}</Text>
                </View>
              )}

              {selectedFundingRecord?.pitchDeck && (
                <View style={styles.modalSectionBox}>
                  <Text style={styles.modalSectionLabel}>Pitch Deck:</Text>
                  <Text style={styles.modalSectionBody}>
                    📄 {selectedFundingRecord.pitchDeck.name} ({selectedFundingRecord.pitchDeck.size})
                  </Text>
                </View>
              )}

              <View style={styles.modalEscrowNotice}>
                <Text style={styles.modalEscrowText}>
                  🔒 Facilitated by FIC Deal Room. An FIC Investment Coordinating Officer will review this proposal and initiate bilateral syndication.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* 5. MODAL: INVESTOR INTEREST DETAILS                            */}
      {/* ============================================================== */}
      <Modal
        visible={!!selectedInvestRecord}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedInvestRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTrackingText}>{selectedInvestRecord?.trackingNumber}</Text>
                <Text style={styles.modalTitleText}>{selectedInvestRecord?.investorName}</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedInvestRecord(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Status:</Text>
                <View style={styles.statusSentPill}>
                  <Text style={styles.statusSentText}>● {selectedInvestRecord?.status}</Text>
                </View>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Main Category:</Text>
                <Text style={styles.modalDetailVal}>{selectedInvestRecord?.category || 'Not Available'}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Subcategory:</Text>
                <Text style={styles.modalDetailVal}>{selectedInvestRecord?.subcategory || 'Not Available'}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Investor Type:</Text>
                <Text style={styles.modalDetailVal}>{selectedInvestRecord?.investorType}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Target Range (₹):</Text>
                <Text style={[styles.modalDetailVal, { color: '#2563EB', fontWeight: '800' }]}>
                  {selectedInvestRecord?.investmentRange}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Preferred Sectors:</Text>
                <Text style={styles.modalDetailVal}>
                  {selectedInvestRecord?.preferredSectors.join(', ')}
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Structure & Duration:</Text>
                <Text style={styles.modalDetailVal}>
                  {selectedInvestRecord?.investmentType} ({selectedInvestRecord?.expectedDuration})
                </Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Risk Preference:</Text>
                <Text style={styles.modalDetailVal}>{selectedInvestRecord?.riskPreference}</Text>
              </View>

              <View style={styles.modalSectionBox}>
                <Text style={styles.modalSectionLabel}>Investment Objectives:</Text>
                <Text style={styles.modalSectionBody}>{selectedInvestRecord?.investmentObjectives}</Text>
              </View>

              <View style={styles.modalEscrowNotice}>
                <Text style={styles.modalEscrowText}>
                  🔒 Registered under FIC Bilateral Capital Syndicate. Curated opportunities matching your criteria will be presented privately.
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* 6. GENERIC BOTTOM SHEET DROPDOWN PICKER                        */}
      {/* ============================================================== */}
      <Modal
        visible={pickerModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
      >
        <TouchableOpacity
          style={styles.pickerModalOverlay}
          activeOpacity={1}
          onPress={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
        >
          <View
            style={styles.pickerModalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>{pickerModal.title}</Text>
              <TouchableOpacity
                style={styles.pickerModalCloseBtn}
                onPress={() => setPickerModal((prev) => ({ ...prev, visible: false }))}
              >
                <Text style={styles.pickerModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.pickerModalBody} showsVerticalScrollIndicator={false}>
              {pickerModal.options.map((opt) => {
                const isSelected = pickerModal.selectedValue === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.pickerOptionItem, isSelected && styles.pickerOptionItemSelected]}
                    onPress={() => pickerModal.onSelect(opt)}
                  >
                    <Text
                      style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}
                    >
                      {opt}
                    </Text>
                    {isSelected && <Text style={styles.pickerCheckmark}>✓</Text>}
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

  // 1. Two Main Options Cards
  mainOptionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  mainOptionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  mainOptionCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    shadowColor: '#2563EB',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  mainOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainOptionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainOptionIconBoxActive: {
    backgroundColor: '#DBEAFE',
  },
  mainOptionEmoji: {
    fontSize: 18,
  },
  selectedPill: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  selectedPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  mainOptionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  mainOptionTitleActive: {
    color: '#1D4ED8',
  },
  mainOptionSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  mainOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    fontFamily: fontSansSerif,
  },

  // Subview tabs (Form vs History)
  sectionWrapper: {
    marginTop: 2,
  },
  subViewTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  subViewTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  subViewTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  subViewTabText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  subViewTabTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // Form Card
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  formHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
    fontFamily: fontSansSerif,
  },
  requiredAsterisk: {
    color: '#DC2626',
  },
  inputField: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  inputFieldError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputFieldReadonly: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  textAreaField: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  rowTwoCols: {
    flexDirection: 'row',
  },

  // Choice chips / pills
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  chipPill: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipPillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  chipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  choiceBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  choiceBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  choiceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
    fontFamily: fontSansSerif,
  },
  choiceBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  multiSelectChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  multiChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  multiChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  multiChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  multiChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },

  // Conditional Equity Box
  conditionalBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    marginTop: 8,
    marginBottom: 6,
  },
  conditionalHelper: {
    fontSize: 11,
    color: '#1E40AF',
    marginTop: 4,
    fontFamily: fontSansSerif,
  },

  // Upload Doc Button
  uploadDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#94A3B8',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  uploadDocIcon: {
    fontSize: 22,
  },
  uploadDocTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  uploadDocSub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  uploadDocAction: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    fontFamily: fontSansSerif,
  },
  fileAttachedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#93C5FD',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  fileInfoCol: {
    flex: 1,
  },
  fileNameText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
  },
  fileSizeText: {
    fontSize: 11,
    color: '#60A5FA',
    fontFamily: fontSansSerif,
  },
  fileRemoveBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
  },
  fileRemoveText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
    fontFamily: fontSansSerif,
  },

  // Form Action Buttons
  formActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 6,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  submitBtnFlex: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  headerBackHistoryText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },

  // Submit Button
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 6,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },

  // History list & cards
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  newSubmissionLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  requestHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  trackingPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  trackingPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    fontFamily: fontSansSerif,
  },
  statusSentPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  statusSentText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  reqCardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  reqCardSector: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginBottom: 10,
  },
  reqDetailsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  reqDetailItem: {
    flex: 1,
  },
  reqDetailLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  reqDetailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  purposeBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: 8,
    padding: 9,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  purposeLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7E22CE',
    marginBottom: 2,
    fontFamily: fontSansSerif,
  },
  purposeDesc: {
    fontSize: 11.5,
    color: '#581C87',
    lineHeight: 16,
    fontFamily: fontSansSerif,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  footerDateText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: fontSansSerif,
  },
  viewDetailsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },

  // Empty state container
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 6,
    marginBottom: 16,
  },
  emptyIcon: {
    fontSize: 34,
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
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: fontSansSerif,
    marginBottom: 14,
  },
  emptyActionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emptyActionBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '82%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  modalTrackingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  modalTitleText: {
    fontSize: 16,
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
    color: '#475569',
  },
  modalBody: {
    paddingBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
    alignItems: 'center',
  },
  modalDetailLabel: {
    fontSize: 12.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  modalDetailVal: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalSectionBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  modalSectionBody: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    fontFamily: fontSansSerif,
  },
  modalEscrowNotice: {
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 10,
  },
  modalEscrowText: {
    fontSize: 11.5,
    color: '#065F46',
    lineHeight: 16,
    fontFamily: fontSansSerif,
  },

  // Section Headers & Dropdown Pickers
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  formSectionBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  formSectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  formSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  subFieldLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  dropdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    minHeight: 46,
  },
  dropdownPillText: {
    fontSize: 13.5,
    color: '#0F172A',
    fontWeight: '500',
    flex: 1,
    fontFamily: fontSansSerif,
  },
  dropdownPlaceholder: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  dropdownChevron: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 6,
  },

  // Dropdown Picker Modal
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  pickerModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '65%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  pickerModalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerModalCloseText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '700',
  },
  pickerModalBody: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  pickerOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginVertical: 2,
  },
  pickerOptionItemSelected: {
    backgroundColor: '#EFF6FF',
  },
  pickerOptionText: {
    fontSize: 13.5,
    color: '#334155',
    fontFamily: fontSansSerif,
    flex: 1,
  },
  pickerOptionTextSelected: {
    color: '#2563EB',
    fontWeight: '700',
  },
  pickerCheckmark: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '700',
    marginLeft: 8,
  },
});
