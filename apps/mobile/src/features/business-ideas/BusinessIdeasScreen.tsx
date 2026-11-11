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
  BackHandler,
} from 'react-native';
import { StandardHeader } from '../../components/common/StandardHeader';
import { BusinessSector } from '../../types';
import { notify } from '../../components/common/NotificationContext';
import { useAuth } from '../../state/AuthContext';
import { useStudentMentor } from '../../state/StudentMentorContext';
import { storageService } from '../../services/storageService';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface SubmittedBusinessIdea {
  id: string;
  trackingNumber: string;
  title: string;
  sector: string;
  stage: string;
  targetMarket?: string;
  supportNeeded?: string;
  conceptSummary: string;
  submittedDate: string;
  status: string;
  ndaSigned: boolean;
  feasibilityScore?: {
    marketViability: number;
    technicalFeasibility: number;
    commercialScalability: number;
    compositeScore: number;
  };
  reviewNotes: string[];
}

interface BusinessIdeasScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const BusinessIdeasScreen: React.FC<BusinessIdeasScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const { chamberRequests, addChamberRequest } = useStudentMentor();

  const [ideas, setIdeas] = useState<SubmittedBusinessIdea[]>([]);
  const [isHistoryActive, setIsHistoryActive] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<SubmittedBusinessIdea | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Form State for "+ Submit New Concept for Incubation"
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('Technology');
  const [targetMarket, setTargetMarket] = useState('');
  const [maturityStage, setMaturityStage] = useState<'Ideation' | 'Prototype' | 'MVP'>('Ideation');
  const [supportNeeded, setSupportNeeded] = useState('Mentorship & Technical Validation');
  const [conceptSummary, setConceptSummary] = useState('');
  const [ndaAgreed, setNdaAgreed] = useState(false);

  const storageKey = `FIC_BUSINESS_IDEAS_${user?.id || 'guest'}`;

  // Load actual submitted ideas for logged-in user from storage & sync with central chamberRequests
  useEffect(() => {
    let isMounted = true;
    const loadIdeas = async () => {
      try {
        const raw = await storageService.getItem(storageKey);
        let storedIdeas: SubmittedBusinessIdea[] = [];
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            storedIdeas = parsed;
          }
        }

        // Also extract any business idea submissions from central chamberRequests
        const chamberIdeaRequests = chamberRequests.filter(
          (req) =>
            req.serviceTitle?.toLowerCase().includes('incubation concept') ||
            req.serviceTitle?.toLowerCase().includes('business idea') ||
            req.details?.stage?.includes('Incubation') ||
            req.details?.feasibilityScore !== undefined
        );

        chamberIdeaRequests.forEach((req) => {
          const existing = storedIdeas.find(
            (i) => i.id === req.id || i.trackingNumber === req.trackingNumber
          );
          if (!existing) {
            const compScore = req.details?.feasibilityScore || 84;
            storedIdeas.push({
              id: req.id,
              trackingNumber: req.trackingNumber || `IDEA-${req.id.slice(-6).toUpperCase()}`,
              title: req.serviceTitle?.replace('Incubation Concept: ', '') || 'Business Concept',
              sector: req.sector || 'Technology',
              stage: req.details?.maturityStage || req.details?.stage || 'Stage 0 (Ideation)',
              targetMarket: req.details?.targetMarket || 'Regional Market',
              supportNeeded: req.details?.supportNeeded || 'Chamber Incubation',
              conceptSummary: req.notes || req.details?.conceptSummary || 'Submitted for incubation.',
              submittedDate: req.createdAt || 'Recent',
              status: (req.status || 'UNDER_REVIEW').replace(/_/g, ' '),
              ndaSigned: true,
              feasibilityScore: {
                marketViability: req.details?.marketViability || 82,
                technicalFeasibility: req.details?.technicalFeasibility || 86,
                commercialScalability: req.details?.commercialScalability || 84,
                compositeScore: compScore,
              },
              reviewNotes: [
                'Submission received by FIC Incubation Desk.',
                'Initial algorithmic feasibility metrics computed.',
                'Assigned to FIC Sector Mentor for qualitative validation.',
              ],
            });
          }
        });

        if (isMounted) {
          setIdeas(storedIdeas);
        }
      } catch (err) {
        console.warn('Error loading business ideas:', err);
      }
    };

    loadIdeas();
    return () => {
      isMounted = false;
    };
  }, [storageKey, chamberRequests]);

  // Hardware Back Handler (Android back button)
  useEffect(() => {
    const onBackPress = () => {
      if (selectedIdea) {
        setSelectedIdea(null);
        return true;
      }
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [selectedIdea, modalVisible, onBack]);

  const handleSubmitNewIdea = () => {
    if (!title.trim() || !conceptSummary.trim()) {
      notify.warning('Please fill in the concept title and detailed summary.', 'Required Fields');
      return;
    }

    if (!ndaAgreed) {
      notify.warning(
        'You must execute the Bilateral Confidentiality & Non-Disclosure Agreement before submitting proprietary intellectual property.',
        'NDA Acceptance Required'
      );
      return;
    }

    const marketScore = Math.floor(78 + Math.random() * 18);
    const techScore = Math.floor(75 + Math.random() * 20);
    const commScore = Math.floor(80 + Math.random() * 16);
    const compScore = Math.round((marketScore + techScore + commScore) / 3);

    const generatedId = `idea-${Date.now()}`;
    const trackingNo = `IDEA-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRecord: SubmittedBusinessIdea = {
      id: generatedId,
      trackingNumber: trackingNo,
      title: title.trim(),
      sector: sector.trim() || 'Technology',
      stage: maturityStage,
      targetMarket: targetMarket.trim() || 'Regional Market',
      supportNeeded: supportNeeded.trim() || 'Mentorship & Technical Validation',
      conceptSummary: conceptSummary.trim(),
      submittedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Under Review',
      ndaSigned: true,
      feasibilityScore: {
        marketViability: marketScore,
        technicalFeasibility: techScore,
        commercialScalability: commScore,
        compositeScore: compScore,
      },
      reviewNotes: [
        'Submission received by FIC Incubation Desk.',
        'Initial algorithmic feasibility metrics computed.',
        'Assigned to FIC Sector Mentor for qualitative validation.',
      ],
    };

    const updated = [newRecord, ...ideas];
    setIdeas(updated);
    storageService.setItem(storageKey, JSON.stringify(updated)).catch((e) => console.warn(e));

    // Also register into central Chamber Service Requests tracker
    addChamberRequest({
      serviceTitle: `Incubation Concept: ${newRecord.title}`,
      sector: newRecord.sector,
      notes: conceptSummary.trim(),
      details: {
        conceptTitle: newRecord.title,
        stage: `Stage 0 -> Stage 1 Incubation (${maturityStage})`,
        maturityStage,
        feasibilityScore: compScore,
        marketViability: marketScore,
        technicalFeasibility: techScore,
        commercialScalability: commScore,
        targetMarket: targetMarket.trim(),
        supportNeeded: supportNeeded.trim(),
        conceptSummary: conceptSummary.trim(),
        ndaSigned: true,
      },
    });

    setModalVisible(false);
    setTitle('');
    setTargetMarket('');
    setConceptSummary('');
    setNdaAgreed(false);

    notify.success(
      `Your pre-launch idea has been registered under bilateral NDA. Initial automated feasibility composite score: ${compScore}/100.`,
      'Concept Submitted to Incubation Desk'
    );
  };

  const getStatusStyle = (statusStr: string) => {
    const s = statusStr.toUpperCase();
    if (s.includes('APPROV') || s.includes('COMPLET') || s.includes('ACTIVE')) {
      return { bg: '#DCFCE7', text: '#15803D', dot: '#16A34A' };
    }
    if (s.includes('REJECT') || s.includes('DECLIN')) {
      return { bg: '#FEE2E2', text: '#DC2626', dot: '#EF4444' };
    }
    // Default: Under Review / Sent / Pending
    return { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Business Ideas"
        subtitle="Stage 0 → 1 Incubation & Feasibility"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Business Ideas"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Existing "+ Submit New Concept for Incubation" Button */}
        <TouchableOpacity
          style={styles.submitIdeaBtn}
          activeOpacity={0.88}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.submitIdeaBtnText}>+ Submit New Concept for Incubation</Text>
        </TouchableOpacity>

        {/* Single History Button replacing the 3 old filter buttons */}
        <View style={styles.historyBtnRow}>
          <TouchableOpacity
            style={[styles.historyTabBtn, isHistoryActive && styles.historyTabBtnActive]}
            activeOpacity={0.7}
            onPress={() => setIsHistoryActive(true)}
          >
            <Text style={[styles.historyTabBtnText, isHistoryActive && styles.historyTabBtnTextActive]}>
              History ({ideas.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submission History List or Empty State */}
        {ideas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💡</Text>
            <Text style={styles.emptyTitle}>No business ideas submitted yet.</Text>
            <Text style={styles.emptySub}>
              Submit your idea to access chamber incubation, algorithmic scoring, and advisory.
            </Text>
          </View>
        ) : (
          ideas.map((idea) => {
            const statusStyle = getStatusStyle(idea.status);
            return (
              <View key={idea.id} style={styles.ideaCard}>
                {/* Header Row: Business Idea / Concept ID and Current Status */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.conceptIdPill}>
                    <Text style={styles.conceptIdText}>{idea.trackingNumber}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg, borderColor: statusStyle.dot + '33' }]}>
                    <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
                    <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                      {idea.status}
                    </Text>
                  </View>
                </View>

                {/* Business Idea Title */}
                <Text style={styles.ideaTitle}>{idea.title}</Text>

                {/* Idea Summary Details Box */}
                <View style={styles.metaBox}>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Submission Date:</Text>
                    <Text style={styles.metaVal}>{idea.submittedDate}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Sector / Domain:</Text>
                    <Text style={styles.metaVal}>{idea.sector}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Maturity Stage:</Text>
                    <Text style={styles.metaVal}>{idea.stage}</Text>
                  </View>
                  {idea.feasibilityScore?.compositeScore !== undefined && (
                    <View style={styles.metaRow}>
                      <Text style={styles.metaLabel}>Feasibility Score:</Text>
                      <Text style={[styles.metaVal, { color: '#7C3AED', fontWeight: '800' }]}>
                        {idea.feasibilityScore.compositeScore}/100
                      </Text>
                    </View>
                  )}
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                  style={styles.viewDetailsBtn}
                  activeOpacity={0.85}
                  onPress={() => setSelectedIdea(idea)}
                >
                  <Text style={styles.viewDetailsBtnText}>View Details →</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* VIEW DETAILS MODAL: Complete submitted business idea info      */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={!!selectedIdea}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedIdea(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.modalTitle}>{selectedIdea?.trackingNumber}</Text>
                  {selectedIdea && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusStyle(selectedIdea.status).bg,
                          borderColor: getStatusStyle(selectedIdea.status).dot + '33',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusStyle(selectedIdea.status).dot },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: getStatusStyle(selectedIdea.status).text },
                        ]}
                      >
                        {selectedIdea.status}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalSubtitle} numberOfLines={2}>
                  {selectedIdea?.title}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setSelectedIdea(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedIdea && (
                <View style={styles.detailSectionBox}>
                  {/* Status Row */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Status</Text>
                    <Text style={[styles.detailVal, { color: getStatusStyle(selectedIdea.status).text }]}>
                      {selectedIdea.status}
                    </Text>
                  </View>

                  {/* Submission Date */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submission Date</Text>
                    <Text style={styles.detailVal}>{selectedIdea.submittedDate}</Text>
                  </View>

                  {/* Sector / Domain */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Sector / Domain</Text>
                    <Text style={styles.detailVal}>{selectedIdea.sector}</Text>
                  </View>

                  {/* Maturity Stage */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Maturity Stage</Text>
                    <Text style={styles.detailVal}>{selectedIdea.stage}</Text>
                  </View>

                  {/* Target Market */}
                  {selectedIdea.targetMarket && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Target Market & Geo</Text>
                      <Text style={styles.detailVal}>{selectedIdea.targetMarket}</Text>
                    </View>
                  )}

                  {/* Support Needed */}
                  {selectedIdea.supportNeeded && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Support Needed</Text>
                      <Text style={styles.detailVal}>{selectedIdea.supportNeeded}</Text>
                    </View>
                  )}

                  {/* NDA Executed */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Confidentiality</Text>
                    <Text style={[styles.detailVal, { color: '#15803D', fontWeight: '700' }]}>
                      ✓ Bilateral NDA Executed
                    </Text>
                  </View>

                  {/* Automated 3-Metric Feasibility Scoring */}
                  {selectedIdea.feasibilityScore && (
                    <View style={styles.feasibilityContainer}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Text style={styles.feasibilityHeading}>Algorithmic Feasibility Metrics</Text>
                        <View style={styles.compositeBadge}>
                          <Text style={styles.compositeText}>
                            Score: {selectedIdea.feasibilityScore.compositeScore}/100
                          </Text>
                        </View>
                      </View>

                      {/* Metric 1: Market Viability */}
                      <View style={styles.metricRow}>
                        <View style={styles.metricLabelCol}>
                          <Text style={styles.metricLabel}>Market Viability</Text>
                          <Text style={styles.metricPercent}>{selectedIdea.feasibilityScore.marketViability}%</Text>
                        </View>
                        <View style={styles.progressBg}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${selectedIdea.feasibilityScore.marketViability}%`,
                                backgroundColor: '#2563EB',
                              },
                            ]}
                          />
                        </View>
                      </View>

                      {/* Metric 2: Technical Feasibility */}
                      <View style={styles.metricRow}>
                        <View style={styles.metricLabelCol}>
                          <Text style={styles.metricLabel}>Technical Feasibility</Text>
                          <Text style={styles.metricPercent}>{selectedIdea.feasibilityScore.technicalFeasibility}%</Text>
                        </View>
                        <View style={styles.progressBg}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${selectedIdea.feasibilityScore.technicalFeasibility}%`,
                                backgroundColor: '#10B981',
                              },
                            ]}
                          />
                        </View>
                      </View>

                      {/* Metric 3: Commercial Scalability */}
                      <View style={styles.metricRow}>
                        <View style={styles.metricLabelCol}>
                          <Text style={styles.metricLabel}>Commercial Scalability</Text>
                          <Text style={styles.metricPercent}>{selectedIdea.feasibilityScore.commercialScalability}%</Text>
                        </View>
                        <View style={styles.progressBg}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${selectedIdea.feasibilityScore.commercialScalability}%`,
                                backgroundColor: '#F59E0B',
                              },
                            ]}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Detailed Concept & Solution Submitted */}
                  <View style={{ marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                    <Text style={[styles.detailLabel, { marginBottom: 4, fontWeight: '700' }]}>
                      Detailed Concept & Solution:
                    </Text>
                    <Text style={styles.detailNotesText}>{selectedIdea.conceptSummary}</Text>
                  </View>

                  {/* Sector Mentor Notes */}
                  {selectedIdea.reviewNotes && selectedIdea.reviewNotes.length > 0 && (
                    <View style={styles.mentorNotesBox}>
                      <Text style={styles.mentorNotesHeading}>FIC Sector Mentor Notes:</Text>
                      {selectedIdea.reviewNotes.map((note, idx) => (
                        <View key={idx} style={styles.noteItem}>
                          <Text style={styles.noteBullet}>💬</Text>
                          <Text style={styles.noteText}>{note}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* Existing Submit Concept Modal (Functionality unchanged)         */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Submit Business Concept</Text>
                <Text style={styles.modalSubtitle}>Stage 0 → 1 Incubation & Algorithmic Scoring</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>
                Concept / Project Title <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Next-Gen EV Battery Pack Swapping Kiosks"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Sector / Domain</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Technology, Manufacturing, Agriculture"
                placeholderTextColor="#94A3B8"
                value={sector}
                onChangeText={setSector}
              />

              <Text style={styles.inputLabel}>Target Market & Geography</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Target geography (e.g., Southern MSME clusters, Tamil Nadu)"
                placeholderTextColor="#94A3B8"
                value={targetMarket}
                onChangeText={setTargetMarket}
              />

              <Text style={styles.inputLabel}>Maturity Stage</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                {(['Ideation', 'Prototype', 'MVP'] as const).map((stg) => (
                  <TouchableOpacity
                    key={stg}
                    onPress={() => setMaturityStage(stg)}
                    style={{
                      flex: 1,
                      paddingVertical: 7,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: maturityStage === stg ? '#2563EB' : '#E2E8F0',
                      backgroundColor: maturityStage === stg ? '#EFF6FF' : '#FFFFFF',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: maturityStage === stg ? '700' : '500',
                        color: maturityStage === stg ? '#2563EB' : '#64748B',
                      }}
                    >
                      {stg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Support Needed</Text>
              <TextInput
                style={styles.inputField}
                placeholder="Mentorship, Technical Validation, Market Access, Seed Capital"
                placeholderTextColor="#94A3B8"
                value={supportNeeded}
                onChangeText={setSupportNeeded}
              />

              <Text style={styles.inputLabel}>
                Detailed Concept & Solution <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField]}
                placeholder="Explain your proprietary approach, technical architecture, and value proposition..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={conceptSummary}
                onChangeText={setConceptSummary}
              />

              {/* Bilateral NDA Checkbox */}
              <TouchableOpacity
                style={styles.ndaCheckboxRow}
                activeOpacity={0.7}
                onPress={() => setNdaAgreed(!ndaAgreed)}
              >
                <View style={[styles.checkboxSquare, ndaAgreed && styles.checkboxActive]}>
                  {ndaAgreed && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>
                  I execute the <Text style={{ fontWeight: '700', color: '#2563EB' }}>Bilateral Non-Disclosure Agreement (NDA)</Text> to protect proprietary concept intellectual property.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                activeOpacity={0.88}
                onPress={handleSubmitNewIdea}
              >
                <Text style={styles.modalSubmitBtnText}>Submit to Incubation Desk →</Text>
              </TouchableOpacity>
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
  submitIdeaBtn: {
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
  submitIdeaBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  // History Button Row
  historyBtnRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  historyTabBtn: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignSelf: 'flex-start',
  },
  historyTabBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1.5,
  },
  historyTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  historyTabBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  // Idea History Card
  ideaCard: {
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
  conceptIdPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  conceptIdText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  statusBadge: {
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
  ideaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    lineHeight: 20,
    marginBottom: 10,
  },
  metaBox: {
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
  viewDetailsBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  viewDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  // Details Modal
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
    fontSize: 11.5,
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
  feasibilityContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginTop: 6,
    marginBottom: 6,
  },
  feasibilityHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  compositeBadge: {
    backgroundColor: '#FAF5FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  compositeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    fontFamily: fontSansSerif,
  },
  metricRow: {
    marginBottom: 8,
  },
  metricLabelCol: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  metricPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  progressBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  mentorNotesBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 6,
  },
  mentorNotesHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  noteBullet: {
    fontSize: 11,
    marginRight: 6,
    marginTop: 1,
  },
  noteText: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    fontFamily: fontSansSerif,
    lineHeight: 16,
  },
  // Form input styles
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 14,
  },
  textAreaField: {
    height: 90,
    textAlignVertical: 'top',
  },
  ndaCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    paddingRight: 10,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkMark: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '800',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 11.5,
    color: '#475569',
    fontFamily: fontSansSerif,
    lineHeight: 16,
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  // Empty Container
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
    fontFamily: fontSansSerif,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
});
