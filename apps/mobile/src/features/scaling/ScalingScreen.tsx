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
import { notify } from '../../components/common/NotificationContext';
import { useStudentMentor } from '../../state/StudentMentorContext';
import { useAuth } from '../../state/AuthContext';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

interface ScalingScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const ScalingScreen: React.FC<ScalingScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const { chamberRequests, addChamberRequest } = useStudentMentor();

  // Find member's existing scaling requests
  const memberScalingRequests = chamberRequests.filter(
    (req) =>
      req.details?.module === 'Scaling' ||
      req.details?.type === 'SCALING' ||
      req.serviceTitle?.toLowerCase().includes('enterprise diagnostic') ||
      req.serviceTitle?.toLowerCase().includes('scaling')
  );
  const latestScalingReq = memberScalingRequests[0];

  const [hasDiagnostic, setHasDiagnostic] = useState(!!latestScalingReq);
  const [enterpriseName, setEnterpriseName] = useState(
    latestScalingReq
      ? latestScalingReq.serviceTitle.replace(/^Enterprise Diagnostic:\s*/i, '').trim() || user?.companyName || user?.fullName || 'My Enterprise'
      : user?.companyName || user?.fullName || 'My Enterprise'
  );
  const [currentTurnover, setCurrentTurnover] = useState(latestScalingReq?.details?.turnover || '');
  const [bottleneck, setBottleneck] = useState(latestScalingReq?.notes || '');
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [newEnterprise, setNewEnterprise] = useState(user?.companyName || user?.fullName || '');
  const [newSector, setNewSector] = useState('Manufacturing');
  const [growthArea, setGrowthArea] = useState(latestScalingReq?.details?.growthArea || 'Export Capacity & Modernization');
  const [targetObjectives, setTargetObjectives] = useState('');
  const [newBottleneck, setNewBottleneck] = useState('');
  const [newTurnover, setNewTurnover] = useState('');

  const handleRequestDiagnostic = () => {
    if (!newBottleneck.trim()) {
      notify.warning('Please describe your operational bottleneck or constraint.', 'Required Information');
      return;
    }

    if (newEnterprise.trim()) {
      setEnterpriseName(newEnterprise);
    }
    setBottleneck(newBottleneck);
    setCurrentTurnover(newTurnover || 'Under Evaluation');
    setHasDiagnostic(true);

    // Register into central Chamber Service Requests tracker
    addChamberRequest({
      serviceTitle: `Enterprise Diagnostic: ${newEnterprise.trim() || enterpriseName}`,
      sector: newSector,
      notes: newBottleneck,
      details: {
        type: 'SCALING',
        module: 'Scaling',
        growthArea,
        targetObjectives,
        turnover: newTurnover,
      },
    });

    setModalVisible(false);

    notify.success(
      'An FIC Senior Scaling Specialist has been assigned to audit your operational bottleneck and prepare a customized phased diagnostic roadmap.',
      'Enterprise Diagnostic Requested'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Scaling"
        subtitle="Stage 1 → 10 Diagnostic & Lean Roadmap"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Scaling"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!hasDiagnostic ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚀</Text>
            <Text style={styles.emptyTitle}>No active scaling diagnostic</Text>
            <Text style={styles.emptySub}>
              Request an operational audit and phased turnaround roadmap tailored for your enterprise.
            </Text>
            <TouchableOpacity
              style={[styles.requestSpecialistBtn, { width: '100%', marginTop: 16 }]}
              activeOpacity={0.88}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.requestSpecialistBtnText}>
                + Request Enterprise Diagnostic
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Enterprise Profile Card */}
            <View style={styles.enterpriseCard}>
              <View style={styles.enterpriseHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.companyName}>{enterpriseName}</Text>
                  <Text style={styles.turnoverText}>Annual Turnover: {currentTurnover}</Text>
                </View>
                <View style={styles.statusIndicator}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusLabel}>Under Review</Text>
                </View>
              </View>

              <View style={styles.bottleneckBox}>
                <Text style={styles.bottleneckLabel}>Identified Bottleneck / Focus Area:</Text>
                <Text style={styles.bottleneckVal}>{bottleneck}</Text>
              </View>

              {/* Phased Scaling Roadmap */}
              <Text style={styles.roadmapHeading}>Phased Diagnostic Roadmap:</Text>

              {/* Phase 1 */}
              <View style={styles.roadmapStepCard}>
                <View style={[styles.stepNumBadge, styles.stepActive]}>
                  <Text style={styles.stepNumText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <View style={styles.stepHeaderRow}>
                    <Text style={styles.stepTitle}>Phase 1: Diagnostic Audit</Text>
                    <View style={styles.inProgressBadge}>
                      <Text style={styles.inProgressBadgeText}>In Progress</Text>
                    </View>
                  </View>
                  <Text style={styles.stepDesc}>
                    FIC Coordinating Desk is reviewing your submitted specifications to prepare the baseline audit report.
                  </Text>
                  <Text style={styles.stepMeta}>Focus: {growthArea}</Text>
                </View>
              </View>
            </View>

            {/* Action Button */}
            <TouchableOpacity
              style={styles.requestSpecialistBtn}
              activeOpacity={0.88}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.requestSpecialistBtnText}>
                + Request Additional Intervention
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Diagnostic Request Modal */}
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
                <Text style={styles.modalTitle}>Request Scaling Diagnostic</Text>
                <Text style={styles.modalSubtitle}>Stage 1 → 10 Operational Turnaround</Text>
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
              <Text style={styles.inputLabel}>Enterprise Name</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Acme Precision Components Pvt Ltd"
                placeholderTextColor="#94A3B8"
                value={newEnterprise}
                onChangeText={setNewEnterprise}
              />

              <Text style={styles.inputLabel}>Industry Sector</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Manufacturing, Logistics, IT Services"
                placeholderTextColor="#94A3B8"
                value={newSector}
                onChangeText={setNewSector}
              />

              <Text style={styles.inputLabel}>Annual Turnover Tier</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. ₹1.0 - ₹5.0 Crores"
                placeholderTextColor="#94A3B8"
                value={newTurnover}
                onChangeText={setNewTurnover}
              />

              <Text style={styles.inputLabel}>Growth Area</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Export Modernization, Capacity Expansion, Lean Kaizen"
                placeholderTextColor="#94A3B8"
                value={growthArea}
                onChangeText={setGrowthArea}
              />

              <Text style={styles.inputLabel}>
                Primary Operational Bottlenecks <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField]}
                placeholder="Describe throughput delays, scrap rates, ERP software friction, or supply chain blockages..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={newBottleneck}
                onChangeText={setNewBottleneck}
              />

              <Text style={styles.inputLabel}>Target Objectives</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. Target +30% OEE yield, 0 scrap, ISO 9001 compliance"
                placeholderTextColor="#94A3B8"
                value={targetObjectives}
                onChangeText={setTargetObjectives}
              />

              <TouchableOpacity
                style={styles.modalSubmitBtn}
                activeOpacity={0.88}
                onPress={handleRequestDiagnostic}
              >
                <Text style={styles.modalSubmitBtnText}>Submit Diagnostic Request →</Text>
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
  deskBanner: {
    backgroundColor: '#F5F3FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    padding: 16,
    marginBottom: 14,
  },
  deskBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deskBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  deskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    fontFamily: fontSansSerif,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    fontFamily: fontSansSerif,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4C1D95',
    fontFamily: fontSansSerif,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#6D28D9',
    fontFamily: fontSansSerif,
    lineHeight: 17,
  },
  enterpriseCard: {
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
  enterpriseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    lineHeight: 20,
    marginBottom: 2,
  },
  turnoverText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: fontSansSerif,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 5,
  },
  statusLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  bottleneckBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  bottleneckLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  bottleneckVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    lineHeight: 18,
  },
  roadmapHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 10,
  },
  roadmapStepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    marginBottom: 10,
  },
  stepNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepCompleted: {
    backgroundColor: '#10B981',
  },
  stepActive: {
    backgroundColor: '#7C3AED',
  },
  stepScheduled: {
    backgroundColor: '#E2E8F0',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  stepContent: {
    flex: 1,
  },
  stepHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  stepTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    flex: 1,
    paddingRight: 6,
  },
  doneBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  doneBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },
  inProgressBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inProgressBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7C3AED',
  },
  scheduledBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scheduledBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  stepDesc: {
    fontSize: 11.5,
    color: '#475569',
    fontFamily: fontSansSerif,
    lineHeight: 16,
    marginBottom: 4,
  },
  stepMeta: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  requestSpecialistBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestSpecialistBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
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
  modalNoticeBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    padding: 12,
    marginBottom: 16,
  },
  modalNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5B21B6',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  modalNoticeText: {
    fontSize: 11,
    color: '#6D28D9',
    fontFamily: fontSansSerif,
    lineHeight: 15,
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
