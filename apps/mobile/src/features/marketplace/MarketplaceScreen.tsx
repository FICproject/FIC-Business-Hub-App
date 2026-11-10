import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { BusinessSector, MarketplaceService } from '../../types';
import { notify } from '../../components/common/NotificationContext';
import { useStudentMentor } from '../../state/StudentMentorContext';
import { storageService } from '../../services/storageService';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

const SECTORS: string[] = [
  'All',
  'Business & Entrepreneurship',
  'Manufacturing',
  'Technology',
  'Education',
  'Investment',
  'Professional Services',
  'Agriculture',
  'Healthcare',
  'Creative Media',
  'Employment & Community',
];

const resolveSector = (sec?: string): string => {
  if (!sec) return 'All';
  const s = sec.trim().toLowerCase();
  if (s.includes('manufacturing')) return 'Manufacturing';
  if (s.includes('tech')) return 'Technology';
  if (s.includes('education')) return 'Education';
  if (s.includes('invest') || s.includes('finance')) return 'Investment';
  if (s === 'all') return 'All';
  const found = SECTORS.find((item) => item.toLowerCase() === s);
  return found || sec;
};

const MOCK_SERVICES: MarketplaceService[] = [];

interface MarketplaceScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string, params?: any) => void;
  initialSector?: string;
}

export const MarketplaceScreen: React.FC<MarketplaceScreenProps> = ({
  onBack,
  onNavigateToModule,
  initialSector = 'All',
}) => {
  const { addChamberRequest } = useStudentMentor();
  const [selectedSector, setSelectedSector] = useState<string>(() => resolveSector(initialSector));
  const [services, setServices] = useState<MarketplaceService[]>(MOCK_SERVICES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<MarketplaceService | null>(null);
  const [requirementNotes, setRequirementNotes] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const sectorScrollRef = useRef<ScrollView>(null);
  const sectorLayouts = useRef<{ [key: string]: { x: number; width: number } }>({});

  const scrollToSector = useCallback((sectorName: string) => {
    const layout = sectorLayouts.current[sectorName];
    if (layout && sectorScrollRef.current) {
      sectorScrollRef.current.scrollTo({
        x: Math.max(0, layout.x - 20),
        animated: true,
      });
    }
  }, []);

  // Update selectedSector and scroll when initialSector prop changes
  useEffect(() => {
    if (initialSector) {
      const resolved = resolveSector(initialSector);
      setSelectedSector(resolved);
      setTimeout(() => {
        scrollToSector(resolved);
      }, 100);
    }
  }, [initialSector, scrollToSector]);

  // Load verified/approved services from storage or API
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const raw = await storageService.getItem('FIC_MY_SERVICES_DRAFTS');
        if (raw && isMounted) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const approved = parsed.filter((item: any) => item.status === 'APPROVED');
            if (approved.length > 0) {
              const mapped: MarketplaceService[] = approved.map((item: any) => ({
                id: item.id,
                title: item.title,
                sector: (item.sector || 'Manufacturing') as any,
                subcategory: item.subcategory || item.category || 'Capability',
                deliverables: item.deliverables ? item.deliverables.split('\n').filter((d: string) => d.trim()) : [],
                turnaroundTime: item.turnaroundTime || '3-5 Days',
                verifiedByFIC: true,
                description: item.description || '',
              }));
              setServices(mapped);
            }
          }
        }
      } catch (e) {
        console.warn('Error loading approved marketplace services:', e);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredServices = services.filter((srv) => {
    const srvSec = (srv.sector || '').toLowerCase();
    const matchesSector =
      selectedSector === 'All' ||
      srv.sector === selectedSector ||
      (selectedSector === 'Manufacturing' && srvSec.includes('manufactur')) ||
      (selectedSector === 'Technology' && srvSec.includes('tech')) ||
      (selectedSector === 'Education' && srvSec.includes('education')) ||
      (selectedSector === 'Investment' && (srvSec.includes('invest') || srvSec.includes('finance')));
    const matchesSearch =
      (srv.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.subcategory || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSector && matchesSearch;
  });

  const handleOpenRequest = (service: MarketplaceService) => {
    setSelectedService(service);
    setRequirementNotes('');
    setTargetQuantity('');
    setModalVisible(true);
  };

  const handleSubmitRequest = () => {
    if (!requirementNotes.trim()) {
      notify.warning('Please provide specific project specifications or requirements.', 'Required Information');
      return;
    }

    const newReq = addChamberRequest({
      serviceTitle: selectedService?.title || 'Precision CNC Machining & High-Tolerance Turning',
      sector: selectedService?.sector || 'Manufacturing',
      notes: requirementNotes,
      details: {
        targetQuantity,
        serviceId: selectedService?.id,
      },
    });

    setModalVisible(false);
    notify.success(
      `Your requirement for "${selectedService?.title}" has been lodged with FIC Governance Desk. Assigned Tracking ID: ${newReq.trackingNumber}. An FIC Coordinating Officer will initiate the matching review within 24 hours.`,
      'Service Requirement Submitted'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Universal Marketplace"
        subtitle="FIC Verified B2B Capabilities"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Marketplace"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search capabilities, sectors, services..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearSearch}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Sector Filter Chips */}
        <ScrollView
          ref={sectorScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sectorChipsContainer}
        >
          {SECTORS.map((sector) => {
            const isSelected = selectedSector === sector;
            return (
              <TouchableOpacity
                key={sector}
                style={[styles.sectorChip, isSelected && styles.sectorChipActive]}
                activeOpacity={0.7}
                onLayout={(e) => {
                  const { x, width } = e.nativeEvent.layout;
                  sectorLayouts.current[sector] = { x, width };
                  if (sector === selectedSector && sector !== 'All') {
                    sectorScrollRef.current?.scrollTo({
                      x: Math.max(0, x - 20),
                      animated: true,
                    });
                  }
                }}
                onPress={() => setSelectedSector(sector)}
              >
                <Text style={[styles.sectorChipText, isSelected && styles.sectorChipTextActive]}>
                  {sector}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Count Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>
            Verified Listings ({filteredServices.length})
          </Text>
          <Text style={styles.sectionSubHeading}>Pre-audited capability providers</Text>
        </View>

        {/* Listings List */}
        {filteredServices.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            {/* Card Header */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.sectorBadge}>
                <Text style={styles.sectorBadgeText}>{service.sector}</Text>
              </View>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedBadgeText}>✓ FIC Verified</Text>
              </View>
            </View>

            {/* Title & Description */}
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceSubcategory}>{service.subcategory}</Text>
            <Text style={styles.serviceDesc}>{service.description}</Text>

            {/* Deliverables Box */}
            <View style={styles.deliverablesContainer}>
              <Text style={styles.deliverablesHeader}>Key Deliverables & Specifications:</Text>
              {service.deliverables.map((item, idx) => (
                <View key={idx} style={styles.deliverableItem}>
                  <Text style={styles.bulletCheck}>•</Text>
                  <Text style={styles.deliverableText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Footer / Meta Row */}
            <View style={styles.cardFooter}>
              <View style={styles.metaRow}>
                <View style={styles.tatPill}>
                  <Text style={styles.tatText}>⏱️ {service.turnaroundTime}</Text>
                </View>
                <View style={styles.escrowPill}>
                  <Text style={styles.escrowText}>🔒 Escrow Protected</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.requestButton}
                activeOpacity={0.85}
                onPress={() => handleOpenRequest(service)}
              >
                <Text style={styles.requestButtonText}>Request Service through FIC →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {filteredServices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🏢</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Services Found' : 'No services available'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try adjusting your search query or selected sector filter.'
                : 'Pre-audited capability providers and verified B2B listings will appear here.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Requirement Submission Modal Bottom-Sheet */}
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
                <Text style={styles.modalTitle}>Submit Service Requirement</Text>
                <Text style={styles.modalSubtitle}>Coordinated through FIC Governance Desk</Text>
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
              <View style={styles.selectedServiceCard}>
                <Text style={styles.selectedServiceLabel}>{selectedService?.title}</Text>
                <Text style={styles.selectedServiceSector}>
                  Sector: {selectedService?.sector} • {selectedService?.subcategory}
                </Text>
              </View>

              <Text style={styles.inputLabel}>Target Quantity / Batch Size (Optional)</Text>
              <TextInput
                style={styles.inputField}
                placeholder="e.g. 5,000 units, 50-acre facility, pilot trial..."
                placeholderTextColor="#94A3B8"
                value={targetQuantity}
                onChangeText={setTargetQuantity}
              />

              <Text style={styles.inputLabel}>
                Specific Requirement Specifications <Text style={{ color: '#EF4444' }}>*</Text>
              </Text>
              <TextInput
                style={[styles.inputField, styles.textAreaField]}
                placeholder="Detail exact technical requirements, tolerance limits, desired timeline, or commercial constraints..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={requirementNotes}
                onChangeText={setRequirementNotes}
              />

              <TouchableOpacity
                style={styles.submitModalBtn}
                activeOpacity={0.88}
                onPress={handleSubmitRequest}
              >
                <Text style={styles.submitModalBtnText}>Submit to FIC Governance Desk →</Text>
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    paddingVertical: 0,
  },
  clearSearch: {
    fontSize: 13,
    color: '#94A3B8',
    padding: 4,
    fontWeight: '700',
  },
  sectorChipsContainer: {
    paddingBottom: 12,
    gap: 8,
  },
  sectorChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectorChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  sectorChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  sectorChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  governanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 12,
    marginBottom: 16,
  },
  bannerIconBox: {
    marginRight: 10,
  },
  bannerTextBox: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  sectionSubHeading: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },
  serviceCard: {
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
    marginBottom: 8,
  },
  sectorBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  sectorBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    fontFamily: fontSansSerif,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    lineHeight: 20,
    marginBottom: 2,
  },
  serviceSubcategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  serviceDesc: {
    fontSize: 12.5,
    color: '#475569',
    fontFamily: fontSansSerif,
    lineHeight: 18,
    marginBottom: 10,
  },
  deliverablesContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  deliverablesHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  bulletCheck: {
    fontSize: 14,
    color: '#2563EB',
    marginRight: 6,
    lineHeight: 16,
  },
  deliverableText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    fontFamily: fontSansSerif,
    lineHeight: 16,
  },
  cardFooter: {
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  tatPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tatText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#1D4ED8',
    fontFamily: fontSansSerif,
  },
  escrowPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  escrowText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#B45309',
    fontFamily: fontSansSerif,
  },
  requestButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: fontSansSerif,
    textAlign: 'center',
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
  selectedServiceCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 14,
  },
  selectedServiceLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  selectedServiceSector: {
    fontSize: 11.5,
    color: '#2563EB',
    fontFamily: fontSansSerif,
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
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 12,
    marginBottom: 16,
  },
  modalNoticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
    marginBottom: 3,
  },
  modalNoticeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
  submitModalBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  submitModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
});
