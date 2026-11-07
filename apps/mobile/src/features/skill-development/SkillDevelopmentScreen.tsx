import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { StandardHeader } from '../../components/common/StandardHeader';
import { useAuth } from '../../state/AuthContext';
import { notify } from '../../components/common/NotificationContext';
import {
  useStudentMentor,
  VerifiedMentor,
  SharedMasterclass,
} from '../../state/StudentMentorContext';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

interface SkillDevelopmentScreenProps {
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

export const SkillDevelopmentScreen: React.FC<SkillDevelopmentScreenProps> = ({
  onBack,
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const { mentors, courses, bookConsultation } = useStudentMentor();

  const [activeMainTab, setActiveMainTab] = useState<'COURSES' | 'MENTORS'>('COURSES');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'All' | 'Tamil' | 'English' | 'Hindi'>('All');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [activeCourse, setActiveCourse] = useState<SharedMasterclass | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<SharedMasterclass | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // 1-on-1 Consultation Booking Modal State
  const [consultationModalVisible, setConsultationModalVisible] = useState(false);
  const [selectedMentorObj, setSelectedMentorObj] = useState<VerifiedMentor | null>(null);
  const [bookingTopic, setBookingTopic] = useState('');
  const [selectedDateSlot, setSelectedDateSlot] = useState('Tomorrow (05 Mar)');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('03:00 PM IST');
  const [agendaText, setAgendaText] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const domains = [
    'All',
    'Manufacturing & Industrial',
    'Technology & Digital',
    'Business & Entrepreneurship',
    'Agriculture & Natural Resources',
  ];

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = selectedLanguage === 'All' || c.language === selectedLanguage;
    const matchesDomain = selectedDomain === 'All' || c.domain === selectedDomain;
    return matchesSearch && matchesLang && matchesDomain;
  });

  const filteredMentors = mentors.filter((m) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.domain.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = selectedDomain === 'All' || m.domain === selectedDomain;
    const matchesLang =
      selectedLanguage === 'All' || m.languages.includes(selectedLanguage as any);
    return matchesSearch && matchesDomain && matchesLang;
  });

  const handleOpenBooking = (mentor: VerifiedMentor) => {
    setSelectedMentorObj(mentor);
    setBookingTopic(`Advisory on ${mentor.domain}`);
    setAgendaText('');
    setAdditionalNotes('');
    setConsultationModalVisible(true);
  };

  const handleOpenBookingFromCourse = (instructorName: string) => {
    // Find matching mentor or default to first verified mentor
    const matchedMentor =
      mentors.find(
        (m) =>
          m.name.toLowerCase().includes(instructorName.toLowerCase()) ||
          instructorName.toLowerCase().includes(m.name.toLowerCase())
      ) || mentors[0];
    handleOpenBooking(matchedMentor);
  };

  const handleConfirmConsultation = () => {
    if (!selectedMentorObj) return;

    if (!bookingTopic.trim()) {
      notify.warning('Please enter a consultation topic.', 'Topic Required');
      return;
    }

    if (!agendaText.trim()) {
      notify.warning(
        'Please outline your session objective or specific questions for the mentor.',
        'Agenda Required'
      );
      return;
    }

    // Submit consultation linked strictly to this mentor
    bookConsultation({
      mentorId: selectedMentorObj.id,
      mentorName: selectedMentorObj.name,
      topic: bookingTopic.trim(),
      domain: selectedMentorObj.domain,
      preferredDate: selectedDateSlot,
      preferredTime: selectedTimeSlot,
      duration: '45 mins',
      agenda: agendaText.trim(),
      notes: additionalNotes.trim(),
    });

    setConsultationModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StandardHeader
        title="Skill Development"
        subtitle="Regional Masterclasses & Mentorship Desk"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Skill Development"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section Navigation Tabs: Courses vs Verified Mentors */}
        <View style={styles.mainTabRow}>
          <TouchableOpacity
            style={[styles.mainTabBtn, activeMainTab === 'COURSES' && styles.mainTabBtnActive]}
            activeOpacity={0.75}
            onPress={() => setActiveMainTab('COURSES')}
          >
            <Text style={[styles.mainTabBtnText, activeMainTab === 'COURSES' && styles.mainTabBtnTextActive]}>
              📚 Explore Courses ({filteredCourses.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.mainTabBtn, activeMainTab === 'MENTORS' && styles.mainTabBtnActive]}
            activeOpacity={0.75}
            onPress={() => setActiveMainTab('MENTORS')}
          >
            <Text style={[styles.mainTabBtnText, activeMainTab === 'MENTORS' && styles.mainTabBtnTextActive]}>
              👨‍🏫 Verified Mentors ({filteredMentors.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={activeMainTab === 'COURSES' ? 'Search courses, skills, instructors...' : 'Search mentors by name, specialty...'}
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Domain Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {domains.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.domainChip, selectedDomain === d && styles.domainChipActive]}
              activeOpacity={0.7}
              onPress={() => setSelectedDomain(d)}
            >
              <Text style={[styles.domainChipText, selectedDomain === d && styles.domainChipTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Language Filter */}
        <View style={styles.langFilterRow}>
          <Text style={styles.langFilterLabel}>Language:</Text>
          {(['All', 'Tamil', 'English', 'Hindi'] as const).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.langChip, selectedLanguage === lang && styles.langChipActive]}
              activeOpacity={0.7}
              onPress={() => setSelectedLanguage(lang)}
            >
              <Text style={[styles.langChipText, selectedLanguage === lang && styles.langChipTextActive]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ============================================================== */}
        {/* TAB 1: CURATED MASTERCLASSES                                   */}
        {/* ============================================================== */}
        {activeMainTab === 'COURSES' && (
          <View>
            <View style={styles.headingRow}>
              <Text style={styles.sectionHeading}>
                Curated Masterclasses ({filteredCourses.length}):
              </Text>
            </View>

            {filteredCourses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🎬</Text>
                <Text style={styles.emptyTitle}>
                  {searchQuery || selectedDomain !== 'All' || selectedLanguage !== 'All'
                    ? 'No Masterclasses Found'
                    : 'No courses available'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {searchQuery || selectedDomain !== 'All' || selectedLanguage !== 'All'
                    ? 'Try adjusting your search terms, domain, or language filters.'
                    : 'Verified masterclasses and video courses will appear here once published.'}
                </Text>
              </View>
            ) : (
              filteredCourses.map((mc) => (
                <View key={mc.id} style={styles.courseCard}>
                  <View style={styles.courseHeader}>
                    <View style={styles.domainPill}>
                      <Text style={styles.domainPillText}>{mc.domain}</Text>
                    </View>
                    <View style={styles.langBadge}>
                      <Text style={styles.langBadgeText}>🗣 {mc.language}</Text>
                    </View>
                  </View>

                  <Text style={styles.courseTitle}>{mc.title}</Text>
                  <Text style={styles.instructorText}>Instructor: {mc.instructor}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.metaItem}>⏱ {mc.duration}</Text>
                    <Text style={styles.metaItem}>📚 {mc.modulesCount || mc.syllabus.length} Lessons</Text>
                    <Text style={styles.metaItem}>🎖 Certificate</Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.viewSyllabusBtn}
                      activeOpacity={0.7}
                      onPress={() => setActiveCourse(mc)}
                    >
                      <Text style={styles.viewSyllabusText}>Syllabus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.videoPlayBtn}
                      activeOpacity={0.7}
                      onPress={() => setActiveVideoModal(mc)}
                    >
                      <Text style={styles.videoPlayText}>▶ Watch</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.bookConsultBtn}
                      activeOpacity={0.85}
                      onPress={() => handleOpenBookingFromCourse(mc.instructor)}
                    >
                      <Text style={styles.bookConsultText}>1-on-1 Advice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* TAB 2: VERIFIED MENTORS DIRECTORY                              */}
        {/* ============================================================== */}
        {activeMainTab === 'MENTORS' && (
          <View>
            <View style={styles.headingRow}>
              <Text style={styles.sectionHeading}>
                Verified Industry Faculty & Mentors ({filteredMentors.length}):
              </Text>
            </View>

            {filteredMentors.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>👨‍🏫</Text>
                <Text style={styles.emptyTitle}>
                  {searchQuery || selectedDomain !== 'All' || selectedLanguage !== 'All'
                    ? 'No Mentors Found'
                    : 'No verified mentors available'}
                </Text>
                <Text style={styles.emptyDesc}>
                  {searchQuery || selectedDomain !== 'All' || selectedLanguage !== 'All'
                    ? 'Try adjusting your search terms, domain, or language filters.'
                    : 'Verified industry faculty and mentors will appear here.'}
                </Text>
              </View>
            ) : (
              filteredMentors.map((mentor) => (
                <View key={mentor.id} style={styles.mentorCard}>
                  <View style={styles.mentorCardTop}>
                    <View style={styles.mentorAvatarCircle}>
                      <Text style={styles.mentorAvatarInitial}>
                        {mentor.name.replace('Dr. ', '').replace('Prof. ', '').replace('CA ', '').charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.mentorHeaderMeta}>
                      <View style={styles.mentorNameRow}>
                        <Text style={styles.mentorCardName}>{mentor.name}</Text>
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedBadgeText}>✓ Verified</Text>
                        </View>
                      </View>
                      <Text style={styles.mentorCardTitle}>{mentor.title}</Text>
                      <View style={styles.mentorStatsRow}>
                        <Text style={styles.mentorStatText}>⭐ {mentor.rating}</Text>
                        <Text style={styles.mentorStatDivider}>•</Text>
                        <Text style={styles.mentorStatText}>{mentor.experienceYears}+ yrs exp</Text>
                        <Text style={styles.mentorStatDivider}>•</Text>
                        <Text style={styles.mentorStatText}>{mentor.consultationsCount} consultations</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.mentorBio}>{mentor.bio}</Text>

                  <View style={styles.mentorTagsRow}>
                    <View style={styles.domainTag}>
                      <Text style={styles.domainTagText}>{mentor.domain}</Text>
                    </View>
                    <View style={styles.languageTag}>
                      <Text style={styles.languageTagText}>🗣 {mentor.languages.join(', ')}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.requestSessionBtn}
                    activeOpacity={0.88}
                    onPress={() => handleOpenBooking(mentor)}
                  >
                    <Text style={styles.requestSessionBtnText}>
                      📅 Book Consultation with {mentor.name.split(' ')[mentor.name.split(' ').length - 1]} →
                    </Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Video Player Modal */}
      <Modal visible={!!activeVideoModal} transparent animationType="slide" onRequestClose={() => setActiveVideoModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.videoModalContent}>
            <View style={styles.videoPlayerScreen}>
              <Text style={styles.videoWatermark}>FIC ENCRYPTED STREAM</Text>
              <TouchableOpacity
                style={styles.playerPlayBtn}
                onPress={() => setIsPlaying(!isPlaying)}
              >
                <Text style={styles.playerPlayIcon}>{isPlaying ? '⏸' : '▶'}</Text>
              </TouchableOpacity>
              <View style={styles.playerControls}>
                <Text style={styles.playerTime}>04:32 / {activeVideoModal?.duration}</Text>
                <View style={styles.playerTrack}>
                  <View style={[styles.playerThumb, { width: '35%' }]} />
                </View>
              </View>
            </View>

            <View style={styles.videoMetaBody}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>{activeVideoModal?.title}</Text>
                  <Text style={styles.modalSubtitle}>Instructor: {activeVideoModal?.instructor}</Text>
                </View>
                <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveVideoModal(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.videoCurriculumTitle}>Included Lessons ({activeVideoModal?.modulesCount || activeVideoModal?.syllabus.length}):</Text>
              <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                {activeVideoModal?.syllabus.map((lesson, idx) => (
                  <View key={idx} style={styles.lessonRow}>
                    <View style={styles.lessonNumBox}>
                      <Text style={styles.lessonNumText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.lessonTitleText}>{lesson}</Text>
                    <Text style={styles.lessonDurationText}>18m</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Course Syllabus Modal */}
      <Modal visible={!!activeCourse} transparent animationType="slide" onRequestClose={() => setActiveCourse(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{activeCourse?.title}</Text>
                <Text style={styles.modalSubtitle}>By {activeCourse?.instructor} • Language: {activeCourse?.language}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setActiveCourse(null)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalSectionTitle}>Detailed Lesson Syllabus:</Text>
              {activeCourse?.syllabus.map((lesson, idx) => (
                <View key={idx} style={styles.lessonRow}>
                  <View style={styles.lessonNumBox}>
                    <Text style={styles.lessonNumText}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.lessonTitleText}>{lesson}</Text>
                </View>
              ))}

              <TouchableOpacity
                style={styles.startStreamBtn}
                activeOpacity={0.85}
                onPress={() => {
                  const c = activeCourse;
                  setActiveCourse(null);
                  setActiveVideoModal(c);
                }}
              >
                <Text style={styles.startStreamBtnText}>▶ Start Video Playback</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 1-on-1 Consultation Booking Modal */}
      <Modal visible={consultationModalVisible} transparent animationType="slide" onRequestClose={() => setConsultationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Book 1-on-1 Consultation</Text>
                <Text style={styles.modalSubtitle}>With {selectedMentorObj?.name}</Text>
              </View>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setConsultationModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Consultation Topic / Subject *:</Text>
              <TextInput
                style={styles.topicInput}
                placeholder="E.g. Precision CNC Toolpath & Career Guidance"
                placeholderTextColor="#94A3B8"
                value={bookingTopic}
                onChangeText={setBookingTopic}
              />

              <Text style={styles.fieldLabel}>Preferred Date Slot:</Text>
              <View style={styles.slotRow}>
                {['Tomorrow (05 Mar)', 'Friday (07 Mar)', 'Next Mon (10 Mar)'].map((slot, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotChip, selectedDateSlot === slot && styles.slotChipActive]}
                    onPress={() => setSelectedDateSlot(slot)}
                  >
                    <Text style={[styles.slotChipText, selectedDateSlot === slot && styles.slotChipTextActive]}>{slot}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Preferred Time Window:</Text>
              <View style={styles.slotRow}>
                {['11:00 AM IST', '03:00 PM IST', '05:30 PM IST'].map((time, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.slotChip, selectedTimeSlot === time && styles.slotChipActive]}
                    onPress={() => setSelectedTimeSlot(time)}
                  >
                    <Text style={[styles.slotChipText, selectedTimeSlot === time && styles.slotChipTextActive]}>{time}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Session Agenda & Specific Questions *:</Text>
              <TextInput
                style={styles.agendaInput}
                placeholder="Outline what you want to achieve or specific technical/career questions for your mentor..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={agendaText}
                onChangeText={setAgendaText}
              />

              <Text style={styles.fieldLabel}>Additional Notes / Project Context (Optional):</Text>
              <TextInput
                style={[styles.agendaInput, { height: 60 }]}
                placeholder="Mention current year/course, institution, or project repo link..."
                placeholderTextColor="#94A3B8"
                multiline
                value={additionalNotes}
                onChangeText={setAdditionalNotes}
              />

              <TouchableOpacity
                style={styles.confirmBookingBtn}
                activeOpacity={0.88}
                onPress={handleConfirmConsultation}
              >
                <Text style={styles.confirmBookingBtnText}>Send Consultation Request →</Text>
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
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 16,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  portalBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  portalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
    fontFamily: fontSansSerif,
  },
  activePill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#166534',
    fontFamily: fontSansSerif,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
    fontFamily: fontSansSerif,
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 18,
  },
  mainTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  mainTabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  mainTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  mainTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  mainTabBtnTextActive: {
    color: '#2563EB',
    fontWeight: '800',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    paddingVertical: 0,
  },
  clearSearchText: {
    fontSize: 12,
    color: '#94A3B8',
    padding: 4,
  },
  filterScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  domainChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  domainChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  domainChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  domainChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  langFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  langFilterLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  langChip: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  langChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  langChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headingRow: {
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: fontSansSerif,
    textAlign: 'center',
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  domainPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  domainPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  langBadge: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  langBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    lineHeight: 19,
    marginBottom: 4,
  },
  instructorText: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  metaItem: {
    fontSize: 11,
    color: '#475569',
    fontFamily: fontSansSerif,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  viewSyllabusBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewSyllabusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  videoPlayBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  bookConsultBtn: {
    flex: 1.2,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookConsultText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  mentorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  mentorCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mentorAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mentorAvatarInitial: {
    fontSize: 20,
    fontWeight: '900',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  mentorHeaderMeta: {
    flex: 1,
  },
  mentorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mentorCardName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  verifiedBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  mentorCardTitle: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },
  mentorStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  mentorStatText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  mentorStatDivider: {
    fontSize: 10,
    color: '#94A3B8',
  },
  mentorBio: {
    fontSize: 11.5,
    color: '#475569',
    fontFamily: fontSansSerif,
    lineHeight: 16,
    marginBottom: 10,
  },
  mentorTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  domainTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  domainTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  languageTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  languageTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  requestSessionBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestSessionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
    width: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16.5,
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
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  consultNoticeBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 14,
  },
  consultNoticeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
    marginBottom: 4,
  },
  consultNoticeDesc: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#334155',
    fontFamily: fontSansSerif,
    marginBottom: 6,
    marginTop: 10,
  },
  topicInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 8,
  },
  slotChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  slotChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  slotChipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  agendaInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12.5,
    color: '#0F172A',
    fontFamily: fontSansSerif,
    height: 70,
    textAlignVertical: 'top',
  },
  confirmBookingBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 8,
  },
  confirmBookingBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  videoModalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  videoPlayerScreen: {
    height: 200,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoWatermark: {
    position: 'absolute',
    top: 10,
    left: 12,
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  playerPlayBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerPlayIcon: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  playerControls: {
    position: 'absolute',
    bottom: 8,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playerTime: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  playerTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  playerThumb: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  videoMetaBody: {
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  videoCurriculumTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lessonNumBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lessonNumText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2563EB',
  },
  lessonTitleText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  lessonDurationText: {
    fontSize: 11,
    color: '#94A3B8',
    marginLeft: 6,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  startStreamBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  startStreamBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
