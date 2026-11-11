import React, { useState, useEffect, useMemo } from 'react';
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
import { notify } from '../../components/common/NotificationContext';
import { useStudentMentor, ChamberServiceRequest } from '../../state/StudentMentorContext';
import { useAuth } from '../../state/AuthContext';
import { storageService } from '../../services/storageService';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface ScalingRequestRecord {
  id: string;
  trackingNumber: string;
  businessName: string;
  scalingType: string;
  sector: string;
  turnover: string;
  bottlenecks: string;
  targetObjectives?: string;
  submittedDate: string;
  status: string;
  assignedSpecialist?: string;
  estimatedCompletion?: string;
  rawRequest?: ChamberServiceRequest;
}

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

  // History Toggle State (false = default diagnostic view, true = history view)
  const [showHistory, setShowHistory] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScalingRequestRecord | null>(null);

  const storageKey = `FIC_SCALING_REQUESTS_${user?.id || 'guest'}`;
  const [storedScalingList, setStoredScalingList] = useState<ScalingRequestRecord[]>([]);

  // Load persistent member scaling submissions
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await storageService.getItem(storageKey);
        if (raw && isMounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setStoredScalingList(parsed);
          }
        }
      } catch (err) {
        console.warn('Error loading scaling storage:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  // Derive all actual scaling requests for logged-in member from central chamberRequests and storage
  const memberScalingRequests = useMemo<ScalingRequestRecord[]>(() => {
    const list: ScalingRequestRecord[] = [];

    // 1. Process from central chamberRequests
    chamberRequests.forEach((req) => {
      const lowerTitle = (req.serviceTitle || '').toLowerCase();
      const details = req.details || {};

      const isScaling =
        details.module === 'Scaling' ||
        details.type === 'SCALING' ||
        lowerTitle.includes('enterprise diagnostic') ||
        lowerTitle.includes('scaling');

      if (isScaling) {
        const bName =
          details.enterpriseName ||
          req.serviceTitle.replace(/^Enterprise Diagnostic:\s*/i, '').trim() ||
          user?.companyName ||
          user?.fullName ||
          'My Enterprise';

        list.push({
          id: req.id,
          trackingNumber: req.trackingNumber || `SCL-${req.id.slice(-6).toUpperCase()}`,
          businessName: bName,
          scalingType: details.growthArea || 'Enterprise Diagnostic',
          sector: req.sector || 'Manufacturing',
          turnover: details.turnover || 'Under Evaluation',
          bottlenecks: req.notes || 'Operational bottleneck evaluation requested.',
          targetObjectives: details.targetObjectives || '',
          submittedDate: req.createdAt || 'Recent',
          status: (req.status || 'UNDER_REVIEW').replace(/_/g, ' '),
          assignedSpecialist: req.facilitatorAssigned || 'FIC Senior Scaling Specialist',
          estimatedCompletion: req.estimatedCompletion || '3-5 Business Days',
          rawRequest: req,
        });
      }
    });

    // 2. Merge any items stored locally that are not yet in list
    storedScalingList.forEach((stored) => {
      if (!list.some((item) => item.id === stored.id || item.trackingNumber === stored.trackingNumber)) {
        list.push(stored);
      }
    });

    return list;
  }, [chamberRequests, storedScalingList, user]);

  const latestScalingReq = memberScalingRequests[0];

  const [hasDiagnostic, setHasDiagnostic] = useState(memberScalingRequests.length > 0);
  const [enterpriseName, setEnterpriseName] = useState(
    latestScalingReq
      ? latestScalingReq.businessName
      : user?.companyName || user?.fullName || 'My Enterprise'
  );
  const [currentTurnover, setCurrentTurnover] = useState(latestScalingReq?.turnover || '');
  const [bottleneck, setBottleneck] = useState(latestScalingReq?.bottlenecks || '');
  const [modalVisible, setModalVisible] = useState(false);

  // Form states for "+ Request Enterprise Diagnostic"
  const [newEnterprise, setNewEnterprise] = useState(user?.companyName || user?.fullName || '');
  const [newSector, setNewSector] = useState('Manufacturing');
  const [growthArea, setGrowthArea] = useState(latestScalingReq?.scalingType || 'Export Capacity & Modernization');
  const [targetObjectives, setTargetObjectives] = useState('');
  const [newBottleneck, setNewBottleneck] = useState('');
  const [newTurnover, setNewTurnover] = useState('');

  // Update diagnostic banner state if memberScalingRequests change
  useEffect(() => {
    if (memberScalingRequests.length > 0) {
      setHasDiagnostic(true);
      const top = memberScalingRequests[0];
      setEnterpriseName(top.businessName);
      setCurrentTurnover(top.turnover);
      setBottleneck(top.bottlenecks);
    }
  }, [memberScalingRequests]);

  // Hardware Back Handler (Android back button)
  useEffect(() => {
    const onBackPress = () => {
      if (selectedRecord) {
        setSelectedRecord(null);
        return true;
      }
      if (modalVisible) {
        setModalVisible(false);
        return true;
      }
      if (showHistory) {
        setShowHistory(false);
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
  }, [selectedRecord, modalVisible, showHistory, onBack]);

  const handleRequestDiagnostic = () => {
    if (!newBottleneck.trim()) {
      notify.warning('Please describe your operational bottleneck or constraint.', 'Required Information');
      return;
    }

    const bName = newEnterprise.trim() || enterpriseName;
    setEnterpriseName(bName);
    setBottleneck(newBottleneck);
    setCurrentTurnover(newTurnover || 'Under Evaluation');
    setHasDiagnostic(true);

    const generatedId = `scl-${Date.now()}`;
    const trackingNo = `SCL-${Math.floor(100000 + Math.random() * 900000)}`;
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newRecord: ScalingRequestRecord = {
      id: generatedId,
      trackingNumber: trackingNo,
      businessName: bName,
      scalingType: growthArea,
      sector: newSector,
      turnover: newTurnover || 'Under Evaluation',
      bottlenecks: newBottleneck.trim(),
      targetObjectives: targetObjectives.trim(),
      submittedDate: today,
      status: 'Under Review',
      assignedSpecialist: 'FIC Senior Scaling Specialist',
      estimatedCompletion: '3-5 Business Days',
    };

    const updatedStored = [newRecord, ...storedScalingList];
    setStoredScalingList(updatedStored);
    storageService.setItem(storageKey, JSON.stringify(updatedStored)).catch((e) => console.warn(e));

    // Register into central Chamber Service Requests tracker
    addChamberRequest({
      serviceTitle: `Enterprise Diagnostic: ${bName}`,
      sector: newSector,
      notes: newBottleneck.trim(),
      details: {
        type: 'SCALING',
        module: 'Scaling',
        enterpriseName: bName,
        growthArea,
        targetObjectives: targetObjectives.trim(),
        turnover: newTurnover || 'Under Evaluation',
        submittedDate: today,
      },
    });

    setModalVisible(false);
    setNewBottleneck('');
    setTargetObjectives('');

    notify.success(
      'An FIC Senior Scaling Specialist has been assigned to audit your operational bottleneck and prepare a customized phased diagnostic roadmap.',
      'Enterprise Diagnostic Requested'
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
    if (s.includes('PENDING') || s.includes('PROGRESS')) {
      return { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' };
    }
    // Default: Under Review / Sent / Scheduled
    return { bg: '#EFF6FF', text: '#2563EB', dot: '#3B82F6' };
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
        {/* Top History Button (below header, above existing diagnostic section) */}
        <View style={styles.historyBtnRow}>
          <TouchableOpacity
            style={[styles.historyTabBtn, showHistory && styles.historyTabBtnActive]}
            activeOpacity={0.7}
            onPress={() => setShowHistory(!showHistory)}
            accessibilityLabel="View Scaling Request History"
          >
            <Text style={[styles.historyTabBtnText, showHistory && styles.historyTabBtnTextActive]}>
              History ({memberScalingRequests.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* ------------------------------------------------------------- */}
        {/* HISTORY SECTION (Displayed when user clicks History)          */}
        {/* ------------------------------------------------------------- */}
        {showHistory ? (
          <View style={styles.historyContainer}>
            {memberScalingRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📈</Text>
                <Text style={styles.emptyTitle}>No scaling requests submitted yet.</Text>
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
                {memberScalingRequests.map((req) => {
                  const statusStyle = getStatusStyle(req.status);
                  return (
                    <View key={req.id} style={styles.historyCard}>
                      {/* Header Row: Request ID Pill and Status Badge */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.requestIdPill}>
                          <Text style={styles.requestIdText}>{req.trackingNumber}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor: statusStyle.bg,
                              borderColor: statusStyle.dot + '33',
                            },
                          ]}
                        >
                          <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
                          <Text style={[styles.statusBadgeText, { color: statusStyle.text }]}>
                            {req.status}
                          </Text>
                        </View>
                      </View>

                      {/* Business Name */}
                      <Text style={styles.historyBusinessName}>{req.businessName}</Text>

                      {/* Request Details Box */}
                      <View style={styles.metaBox}>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Scaling / Diagnostic Type:</Text>
                          <Text style={styles.metaVal}>{req.scalingType}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Submission Date:</Text>
                          <Text style={styles.metaVal}>{req.submittedDate}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Sector / Domain:</Text>
                          <Text style={styles.metaVal}>{req.sector}</Text>
                        </View>
                        <View style={styles.metaRow}>
                          <Text style={styles.metaLabel}>Turnover Tier:</Text>
                          <Text style={styles.metaVal}>{req.turnover}</Text>
                        </View>
                      </View>

                      {/* View Details Button */}
                      <TouchableOpacity
                        style={styles.viewDetailsBtn}
                        activeOpacity={0.85}
                        onPress={() => setSelectedRecord(req)}
                      >
                        <Text style={styles.viewDetailsBtnText}>View Details →</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* Additional Request Shortcut */}
                <TouchableOpacity
                  style={[styles.requestSpecialistBtn, { marginTop: 6 }]}
                  activeOpacity={0.88}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.requestSpecialistBtnText}>
                    + Request Enterprise Diagnostic
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          /* ----------------------------------------------------------- */
          /* EXISTING DIAGNOSTIC SECTION (Design and features unchanged) */
          /* ----------------------------------------------------------- */
          <>
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
          </>
        )}
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* VIEW DETAILS MODAL: Complete submitted scaling request info   */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={!!selectedRecord}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedRecord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={styles.modalTitle}>{selectedRecord?.trackingNumber}</Text>
                  {selectedRecord && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusStyle(selectedRecord.status).bg,
                          borderColor: getStatusStyle(selectedRecord.status).dot + '33',
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: getStatusStyle(selectedRecord.status).dot },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: getStatusStyle(selectedRecord.status).text },
                        ]}
                      >
                        {selectedRecord.status}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.modalSubtitle} numberOfLines={2}>
                  {selectedRecord?.businessName}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
                onPress={() => setSelectedRecord(null)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedRecord && (
                <View style={styles.detailSectionBox}>
                  {/* Status Row */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Current Status</Text>
                    <Text style={[styles.detailVal, { color: getStatusStyle(selectedRecord.status).text }]}>
                      {selectedRecord.status}
                    </Text>
                  </View>

                  {/* Request ID */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Request ID</Text>
                    <Text style={styles.detailVal}>{selectedRecord.trackingNumber}</Text>
                  </View>

                  {/* Business Name */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Business Name</Text>
                    <Text style={styles.detailVal}>{selectedRecord.businessName}</Text>
                  </View>

                  {/* Scaling Type */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Scaling / Diagnostic Type</Text>
                    <Text style={styles.detailVal}>{selectedRecord.scalingType}</Text>
                  </View>

                  {/* Submission Date */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submission Date</Text>
                    <Text style={styles.detailVal}>{selectedRecord.submittedDate}</Text>
                  </View>

                  {/* Industry Sector */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Industry Sector</Text>
                    <Text style={styles.detailVal}>{selectedRecord.sector}</Text>
                  </View>

                  {/* Annual Turnover Tier */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Annual Turnover</Text>
                    <Text style={styles.detailVal}>{selectedRecord.turnover}</Text>
                  </View>

                  {/* Target Objectives */}
                  {selectedRecord.targetObjectives ? (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Target Objectives</Text>
                      <Text style={styles.detailVal}>{selectedRecord.targetObjectives}</Text>
                    </View>
                  ) : null}

                  {/* Assigned Specialist */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Assigned Specialist</Text>
                    <Text style={styles.detailVal}>{selectedRecord.assignedSpecialist}</Text>
                  </View>

                  {/* SLA */}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Estimated Completion</Text>
                    <Text style={styles.detailVal}>{selectedRecord.estimatedCompletion}</Text>
                  </View>

                  {/* Primary Operational Bottlenecks */}
                  <View style={{ marginTop: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                    <Text style={[styles.detailLabel, { marginBottom: 4, fontWeight: '700' }]}>
                      Identified Bottlenecks & Operational Constraints:
                    </Text>
                    <Text style={styles.detailNotesText}>{selectedRecord.bottlenecks}</Text>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* Existing Diagnostic Request Modal (Unchanged)                  */}
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
  // History Container & Cards
  historyContainer: {
    marginBottom: 14,
  },
  historyCard: {
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
  requestIdPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  requestIdText: {
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
    backgroundColor: '#2563EB',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  historyBusinessName: {
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
    textAlign: 'right',
    maxWidth: '65%',
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
  // Existing Diagnostic section styles
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  turnoverText: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  bottleneckBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bottleneckLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  bottleneckVal: {
    fontSize: 12,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    lineHeight: 17,
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
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 12,
    marginBottom: 8,
  },
  stepNumBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
  },
  stepActive: {
    backgroundColor: '#2563EB',
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
  },
  inProgressBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  inProgressBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  stepDesc: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
    lineHeight: 15,
    marginBottom: 4,
  },
  stepMeta: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#7C3AED',
    fontFamily: fontSansSerif,
  },
  requestSpecialistBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  requestSpecialistBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
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
    height: 85,
    textAlignVertical: 'top',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  modalSubmitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
});
