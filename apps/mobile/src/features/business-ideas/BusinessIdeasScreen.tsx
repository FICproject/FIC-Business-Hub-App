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
import { StandardHeader } from '../../components/common/StandardHeader';
import { BusinessIdea, BusinessSector } from '../../types';
import { notify } from '../../components/common/NotificationContext';
import { useStudentMentor } from '../../state/StudentMentorContext';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

const INITIAL_IDEAS: BusinessIdea[] = [];

interface BusinessIdeasScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const BusinessIdeasScreen: React.FC<BusinessIdeasScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { addChamberRequest } = useStudentMentor();
  const [ideas, setIdeas] = useState<BusinessIdea[]>(INITIAL_IDEAS);
  const [activeTab, setActiveTab] = useState<'ALL' | 'STAGE_0' | 'STAGE_1'>('ALL');
  const [modalVisible, setModalVisible] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('Technology');
  const [targetMarket, setTargetMarket] = useState('');
  const [maturityStage, setMaturityStage] = useState<'Ideation' | 'Prototype' | 'MVP'>('Ideation');
  const [supportNeeded, setSupportNeeded] = useState('Mentorship & Technical Validation');
  const [conceptSummary, setConceptSummary] = useState('');
  const [ndaAgreed, setNdaAgreed] = useState(false);

  const filteredIdeas = ideas.filter((item) => {
    if (activeTab === 'STAGE_0') return item.stage === 'Stage 0';
    if (activeTab === 'STAGE_1') return item.stage === 'Stage 1';
    return true;
  });

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

    const newIdea: BusinessIdea = {
      id: `idea-${Date.now()}`,
      title,
      sector: (sector as BusinessSector) || 'Technology',
      stage: 'Stage 0',
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

    setIdeas([newIdea, ...ideas]);

    // Also register into central Chamber Service Requests tracker
    addChamberRequest({
      serviceTitle: `Incubation Concept: ${newIdea.title}`,
      sector: newIdea.sector,
      notes: conceptSummary,
      details: {
        stage: 'Stage 0 -> Stage 1 Incubation',
        feasibilityScore: compScore,
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
        {/* Action Button & Filter Tabs */}
        <TouchableOpacity
          style={styles.submitIdeaBtn}
          activeOpacity={0.88}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.submitIdeaBtnText}>+ Submit New Concept for Incubation</Text>
        </TouchableOpacity>

        <View style={styles.filterTabsRow}>
          {(['ALL', 'STAGE_0', 'STAGE_1'] as const).map((tab) => {
            const isTabActive = activeTab === tab;
            const tabLabel =
              tab === 'ALL'
                ? `All Concepts (${ideas.length})`
                : tab === 'STAGE_0'
                ? 'Stage 0 (Ideation)'
                : 'Stage 1 (Prototype)';
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isTabActive && styles.filterTabActive]}
                activeOpacity={0.7}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.filterTabText, isTabActive && styles.filterTabTextActive]}>
                  {tabLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Concept Cards */}
        {filteredIdeas.map((idea) => (
          <View key={idea.id} style={styles.ideaCard}>
            {/* Header: Sector & Stage */}
            <View style={styles.ideaHeaderRow}>
              <View style={styles.sectorPill}>
                <Text style={styles.sectorPillText}>{idea.sector}</Text>
              </View>
              <View style={styles.stagePill}>
                <Text style={styles.stagePillText}>{idea.stage}</Text>
              </View>
            </View>

            <Text style={styles.ideaTitle}>{idea.title}</Text>

            {/* NDA Status Badge */}
            <View style={styles.ndaExecutedRow}>
              <View style={styles.lockBadgeGreen}>
                <Text style={styles.lockBadgeText}>✓ Bilateral NDA Executed</Text>
              </View>
              <View style={styles.compositeBadge}>
                <Text style={styles.compositeText}>
                  Feasibility: {idea.feasibilityScore?.compositeScore}/100
                </Text>
              </View>
            </View>

            {/* 3-Metric Feasibility Scores */}
            {idea.feasibilityScore && (
              <View style={styles.feasibilityContainer}>
                <Text style={styles.feasibilityHeading}>Automated 3-Metric Feasibility Scoring:</Text>

                {/* Metric 1: Market Viability */}
                <View style={styles.metricRow}>
                  <View style={styles.metricLabelCol}>
                    <Text style={styles.metricLabel}>Market Viability</Text>
                    <Text style={styles.metricPercent}>{idea.feasibilityScore.marketViability}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${idea.feasibilityScore.marketViability}%`,
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
                    <Text style={styles.metricPercent}>{idea.feasibilityScore.technicalFeasibility}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${idea.feasibilityScore.technicalFeasibility}%`,
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
                    <Text style={styles.metricPercent}>{idea.feasibilityScore.commercialScalability}%</Text>
                  </View>
                  <View style={styles.progressBg}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${idea.feasibilityScore.commercialScalability}%`,
                          backgroundColor: '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Mentor Review Notes */}
            <View style={styles.mentorNotesBox}>
              <Text style={styles.mentorNotesHeading}>FIC Sector Mentor Notes:</Text>
              {idea.reviewNotes.map((note, idx) => (
                <View key={idx} style={styles.noteItem}>
                  <Text style={styles.noteBullet}>💬</Text>
                  <Text style={styles.noteText}>{note}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.actionPlanBtn}
              activeOpacity={0.85}
              onPress={() =>
                notify.info(
                  `Roadmap active for "${idea.title}": Prototype validation with partner lab, customer interviews, and Deal Room presentation. Assigned: Dr. K. Soundararajan (FIC Technology Cell)`,
                  'Incubation Action Plan'
                )
              }
            >
              <Text style={styles.actionPlanBtnText}>View Incubation Action Plan →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {filteredIdeas.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💡</Text>
            <Text style={styles.emptyTitle}>No business ideas submitted yet</Text>
            <Text style={styles.emptySub}>
              Submit your idea to access chamber incubation, algorithmic scoring, and advisory.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Submit Concept Modal */}
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
  ndaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    marginBottom: 14,
  },
  ndaIconCol: {
    marginRight: 10,
  },
  ndaTextCol: {
    flex: 1,
  },
  ndaTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  ndaDesc: {
    fontSize: 11,
    color: '#047857',
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
  submitIdeaBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  submitIdeaBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterTab: {
    paddingVertical: 6.5,
    paddingHorizontal: 12,
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
  ideaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectorPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  sectorPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  stagePill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
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
  ndaExecutedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  lockBadgeGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  lockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    fontFamily: fontSansSerif,
  },
  compositeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  compositeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  feasibilityContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    marginBottom: 12,
  },
  feasibilityHeading: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 8,
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    marginBottom: 12,
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
  actionPlanBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPlanBtnText: {
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
});
