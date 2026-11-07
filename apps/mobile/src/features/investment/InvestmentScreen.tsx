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
  category: string;
  subcategory: string;
  sector: string;
  fundingPurpose: string;
  fundingType: 'Equity' | 'Debt' | 'Grant' | 'Other';
  requiredAmount: string;
  stage: 'Idea' | 'Startup' | 'Growth' | 'Expansion';
  description: string;
  currentRevenue?: string;
  equityOffered?: string;
  expectedTimeline: string;
  businessLocation: string;
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
];

const FUNDING_PURPOSES = [
  'Working Capital & Cash Flow',
  'Machinery & Plant Expansion',
  'Technology R&D & Product Launch',
  'Market Expansion & Channel Scaling',
  'Refinancing & Debt Restructuring',
];

const FUNDING_TYPES = ['Equity', 'Debt', 'Grant', 'Other'] as const;
const STAGES = ['Idea', 'Startup', 'Growth', 'Expansion'] as const;
const TIMELINES = ['Immediate (< 30 days)', '1 - 3 Months', '3 - 6 Months', 'Flexible / Strategic'];
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
  const [fundingSubView, setFundingSubView] = useState<'FORM' | 'HISTORY'>('FORM');
  const [investSubView, setInvestSubView] = useState<'FORM' | 'HISTORY'>('FORM');

  // Local submissions lists
  const [fundingRequests, setFundingRequests] = useState<FundingRequestRecord[]>([]);
  const [investorInterests, setInvestorInterests] = useState<InvestorInterestRecord[]>([]);

  // Selected item modal for detailed view
  const [selectedFundingRecord, setSelectedFundingRecord] = useState<FundingRequestRecord | null>(null);
  const [selectedInvestRecord, setSelectedInvestRecord] = useState<InvestorInterestRecord | null>(null);

  // -------------------------------------------------------------
  // FUNDING FORM STATE
  // -------------------------------------------------------------
  const [fBusinessName, setFBusinessName] = useState('');
  const [fCategory, setFCategory] = useState(user?.category || 'Business & Entrepreneurship');
  const [fSubcategory, setFSubcategory] = useState(user?.subcategory || 'Startup Founder');
  const [fSector, setFSector] = useState('Manufacturing');
  const [fPurpose, setFPurpose] = useState('Working Capital & Cash Flow');
  const [fFundingType, setFFundingType] = useState<'Equity' | 'Debt' | 'Grant' | 'Other'>('Equity');
  const [fRequiredAmount, setFRequiredAmount] = useState('');
  const [fStage, setFStage] = useState<'Idea' | 'Startup' | 'Growth' | 'Expansion'>('Growth');
  const [fDescription, setFDescription] = useState('');
  const [fCurrentRevenue, setFCurrentRevenue] = useState('');
  const [fEquityOffered, setFEquityOffered] = useState('');
  const [fTimeline, setFTimeline] = useState('1 - 3 Months');
  const [fLocation, setFLocation] = useState('');
  const [fPitchDeck, setFPitchDeck] = useState<AttachedPitchDeck | null>(null);
  const [fAdditionalInfo, setFAdditionalInfo] = useState('');

  // Inline Validation Errors - Funding
  const [errFBusinessName, setErrFBusinessName] = useState<string | null>(null);
  const [errFSector, setErrFSector] = useState<string | null>(null);
  const [errFPurpose, setErrFPurpose] = useState<string | null>(null);
  const [errFRequiredAmount, setErrFRequiredAmount] = useState<string | null>(null);
  const [errFDescription, setErrFDescription] = useState<string | null>(null);
  const [errFEquityOffered, setErrFEquityOffered] = useState<string | null>(null);
  const [errFLocation, setErrFLocation] = useState<string | null>(null);

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

    // Reset errors
    setErrFBusinessName(null);
    setErrFSector(null);
    setErrFPurpose(null);
    setErrFRequiredAmount(null);
    setErrFDescription(null);
    setErrFEquityOffered(null);
    setErrFLocation(null);

    if (!fBusinessName.trim()) {
      setErrFBusinessName('Business or Project Name is required.');
      isValid = false;
    }

    if (!fSector.trim()) {
      setErrFSector('Industry / Sector is required.');
      isValid = false;
    }

    if (!fPurpose.trim()) {
      setErrFPurpose('Funding purpose is required.');
      isValid = false;
    }

    if (!fRequiredAmount.trim()) {
      setErrFRequiredAmount('Required funding amount (₹) is required.');
      isValid = false;
    }

    if (!fDescription.trim()) {
      setErrFDescription('Business & project description is required.');
      isValid = false;
    }

    if (fFundingType === 'Equity' && !fEquityOffered.trim()) {
      setErrFEquityOffered('Equity offered (%) is required when Equity funding is selected.');
      isValid = false;
    }

    if (!fLocation.trim()) {
      setErrFLocation('Business location (City / State) is required.');
      isValid = false;
    }

    if (!isValid) {
      notify.warning('Please complete all mandatory fields marked with an asterisk (*).', 'Incomplete Form');
      return;
    }

    const trackingNumber = `FIC-FND-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord: FundingRequestRecord = {
      id: `fnd-${Date.now()}`,
      trackingNumber,
      businessName: fBusinessName.trim(),
      category: fCategory.trim(),
      subcategory: fSubcategory.trim(),
      sector: fSector,
      fundingPurpose: fPurpose,
      fundingType: fFundingType,
      requiredAmount: fRequiredAmount.trim(),
      stage: fStage,
      description: fDescription.trim(),
      currentRevenue: fCurrentRevenue.trim() || 'Not specified',
      equityOffered: fFundingType === 'Equity' ? fEquityOffered.trim() : undefined,
      expectedTimeline: fTimeline,
      businessLocation: fLocation.trim(),
      pitchDeck: fPitchDeck,
      additionalInfo: fAdditionalInfo.trim() || undefined,
      status: 'Sent',
      createdAt: '06 Nov 2026',
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
        fundingType: newRecord.fundingType,
        requiredAmount: newRecord.requiredAmount,
        stage: newRecord.stage,
        equityOffered: newRecord.equityOffered,
        timeline: newRecord.expectedTimeline,
        location: newRecord.businessLocation,
      },
    });

    // Reset Form Fields
    setFBusinessName('');
    setFRequiredAmount('');
    setFDescription('');
    setFCurrentRevenue('');
    setFEquityOffered('');
    setFLocation('');
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
            {/* Sub-view toggle tabs: Form vs History */}
            <View style={styles.subViewTabsRow}>
              <TouchableOpacity
                style={[styles.subViewTab, fundingSubView === 'FORM' && styles.subViewTabActive]}
                activeOpacity={0.8}
                onPress={() => setFundingSubView('FORM')}
              >
                <Text style={[styles.subViewTabText, fundingSubView === 'FORM' && styles.subViewTabTextActive]}>
                  + New Funding Request
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subViewTab, fundingSubView === 'HISTORY' && styles.subViewTabActive]}
                activeOpacity={0.8}
                onPress={() => setFundingSubView('HISTORY')}
              >
                <Text style={[styles.subViewTabText, fundingSubView === 'HISTORY' && styles.subViewTabTextActive]}>
                  Request History ({fundingRequests.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* FUNDING FORM */}
            {fundingSubView === 'FORM' && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Funding Request Form</Text>
                  <Text style={styles.formSubtitle}>
                    Private Capital Proposal for FIC Syndicate Evaluation
                  </Text>
                </View>

                {/* 1. Business / Project Name */}
                <Text style={styles.fieldLabel}>
                  Business / Project Name <Text style={styles.requiredAsterisk}>*</Text>
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

                {/* 2. Main Category and Subcategory */}
                <View style={styles.rowTwoCols}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={styles.fieldLabel}>Main Category</Text>
                    <TextInput
                      style={[styles.inputField, styles.inputFieldReadonly]}
                      value={fCategory}
                      onChangeText={setFCategory}
                      placeholder="Category"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.fieldLabel}>Subcategory</Text>
                    <TextInput
                      style={[styles.inputField, styles.inputFieldReadonly]}
                      value={fSubcategory}
                      onChangeText={setFSubcategory}
                      placeholder="Subcategory"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>

                {/* 3. Industry / Sector */}
                <Text style={styles.fieldLabel}>
                  Industry / Sector <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {SECTOR_OPTIONS.map((sec) => (
                    <TouchableOpacity
                      key={sec}
                      style={[styles.chipPill, fSector === sec && styles.chipPillActive]}
                      onPress={() => setFSector(sec)}
                    >
                      <Text style={[styles.chipText, fSector === sec && styles.chipTextActive]}>{sec}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <FieldError error={errFSector} />

                {/* 4. Funding Purpose */}
                <Text style={styles.fieldLabel}>
                  Funding Purpose <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {FUNDING_PURPOSES.map((purp) => (
                    <TouchableOpacity
                      key={purp}
                      style={[styles.chipPill, fPurpose === purp && styles.chipPillActive]}
                      onPress={() => setFPurpose(purp)}
                    >
                      <Text style={[styles.chipText, fPurpose === purp && styles.chipTextActive]}>{purp}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <FieldError error={errFPurpose} />

                {/* 5. Funding Type */}
                <Text style={styles.fieldLabel}>
                  Funding Type <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.choiceRow}>
                  {FUNDING_TYPES.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[styles.choiceBtn, fFundingType === type && styles.choiceBtnActive]}
                      onPress={() => setFFundingType(type)}
                    >
                      <Text style={[styles.choiceBtnText, fFundingType === type && styles.choiceBtnTextActive]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 6. Required Funding Amount (₹) */}
                <Text style={styles.fieldLabel}>
                  Required Funding Amount (₹) <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, !!errFRequiredAmount && styles.inputFieldError]}
                  placeholder="e.g. ₹50 Lakhs or ₹2.5 Crores"
                  placeholderTextColor="#94A3B8"
                  value={fRequiredAmount}
                  onChangeText={(val) => {
                    setFRequiredAmount(val);
                    if (errFRequiredAmount) setErrFRequiredAmount(null);
                  }}
                />
                <FieldError error={errFRequiredAmount} />

                {/* 7. Business Stage */}
                <Text style={styles.fieldLabel}>
                  Business Stage <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <View style={styles.choiceRow}>
                  {STAGES.map((stg) => (
                    <TouchableOpacity
                      key={stg}
                      style={[styles.choiceBtn, fStage === stg && styles.choiceBtnActive]}
                      onPress={() => setFStage(stg)}
                    >
                      <Text style={[styles.choiceBtnText, fStage === stg && styles.choiceBtnTextActive]}>
                        {stg}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 8. Business / Project Description */}
                <Text style={styles.fieldLabel}>
                  Business / Project Description <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, styles.textAreaField, !!errFDescription && styles.inputFieldError]}
                  placeholder="Describe your operational model, products/services, competitive moat, and revenue channels..."
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

                {/* 9. Current Revenue (if applicable) */}
                <Text style={styles.fieldLabel}>Current Annual / Monthly Revenue (if applicable)</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="e.g. ₹42 Lakhs ARR or Pre-revenue"
                  placeholderTextColor="#94A3B8"
                  value={fCurrentRevenue}
                  onChangeText={setFCurrentRevenue}
                />

                {/* 10. Equity Offered (%) – ONLY when Equity is selected */}
                {fFundingType === 'Equity' && (
                  <View style={styles.conditionalBox}>
                    <Text style={styles.fieldLabel}>
                      Equity Offered (%) <Text style={styles.requiredAsterisk}>*</Text>
                    </Text>
                    <TextInput
                      style={[styles.inputField, !!errFEquityOffered && styles.inputFieldError]}
                      placeholder="e.g. 10% - 15%"
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

                {/* 11. Expected Funding Timeline */}
                <Text style={styles.fieldLabel}>Expected Funding Timeline</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  {TIMELINES.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[styles.chipPill, fTimeline === time && styles.chipPillActive]}
                      onPress={() => setFTimeline(time)}
                    >
                      <Text style={[styles.chipText, fTimeline === time && styles.chipTextActive]}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* 12. Business Location */}
                <Text style={styles.fieldLabel}>
                  Business Location <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={[styles.inputField, !!errFLocation && styles.inputFieldError]}
                  placeholder="e.g. Coimbatore, Tamil Nadu, India"
                  placeholderTextColor="#94A3B8"
                  value={fLocation}
                  onChangeText={(val) => {
                    setFLocation(val);
                    if (errFLocation) setErrFLocation(null);
                  }}
                />
                <FieldError error={errFLocation} />

                {/* 13. Pitch Deck / Supporting Document Upload */}
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

                {/* 14. Additional Information */}
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

                {/* 15. Submit Funding Request button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  activeOpacity={0.88}
                  onPress={handleSubmitFunding}
                >
                  <Text style={styles.submitBtnText}>Submit Funding Request →</Text>
                </TouchableOpacity>
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
                        <Text style={styles.purposeLabel}>Purpose: {req.fundingPurpose}</Text>
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
            {/* Sub-view toggle tabs: Form vs History */}
            <View style={styles.subViewTabsRow}>
              <TouchableOpacity
                style={[styles.subViewTab, investSubView === 'FORM' && styles.subViewTabActive]}
                activeOpacity={0.8}
                onPress={() => setInvestSubView('FORM')}
              >
                <Text style={[styles.subViewTabText, investSubView === 'FORM' && styles.subViewTabTextActive]}>
                  + New Investor Interest
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.subViewTab, investSubView === 'HISTORY' && styles.subViewTabActive]}
                activeOpacity={0.8}
                onPress={() => setInvestSubView('HISTORY')}
              >
                <Text style={[styles.subViewTabText, investSubView === 'HISTORY' && styles.subViewTabTextActive]}>
                  Interest History ({investorInterests.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* INVESTOR FORM */}
            {investSubView === 'FORM' && (
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.formTitle}>Investor Interest Registration</Text>
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

                {/* 2. Investor Type */}
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

                {/* 13. Submit Investment Interest button */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  activeOpacity={0.88}
                  onPress={handleSubmitInvest}
                >
                  <Text style={styles.submitBtnText}>Submit Investment Interest →</Text>
                </TouchableOpacity>
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
                <Text style={styles.modalDetailLabel}>Industry / Sector:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.sector}</Text>
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

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Business Stage:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.stage}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Location:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.businessLocation}</Text>
              </View>

              <View style={styles.modalDetailRow}>
                <Text style={styles.modalDetailLabel}>Timeline:</Text>
                <Text style={styles.modalDetailVal}>{selectedFundingRecord?.expectedTimeline}</Text>
              </View>

              <View style={styles.modalSectionBox}>
                <Text style={styles.modalSectionLabel}>Business Description:</Text>
                <Text style={styles.modalSectionBody}>{selectedFundingRecord?.description}</Text>
              </View>

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
});
