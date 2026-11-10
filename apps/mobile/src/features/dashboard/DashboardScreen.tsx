import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { useAuth } from '../../state/AuthContext';
import { useStudentMentor } from '../../state/StudentMentorContext';
import { useWalletReferral } from '../../state/WalletReferralContext';
import { FunctionsMenuModal } from '../../components/common/FunctionsMenuModal';
import { notify } from '../../components/common/NotificationContext';
import { launchAssignedMeeting, MeetingPlatform } from '../../utils/meetingLauncher';
import { membershipNotificationService } from '../../services/membershipNotificationService';
import { FCMService } from '../../services/FCMService';

const { width } = Dimensions.get('window');
const SCREEN_WIDTH = width;
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0;
const WAVE_WIDTH = SCREEN_WIDTH;
const WAVE_HEIGHT = WAVE_WIDTH * (576 / 1024);

interface DashboardScreenProps {
  onNavigateToModule: (moduleName: string) => void;
}

// -------------------------------------------------------------
// Pure Vector Icons for Pixel-Perfect Matching with Image 2
// -------------------------------------------------------------

// Document Icon (used in KPI 1 and My Requests 1)
const DocVectorIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 18,
      height: 22,
      borderRadius: 3.5,
      borderWidth: 2,
      borderColor: color,
      paddingHorizontal: 2.5,
      paddingTop: 3.5,
      justifyContent: 'space-between',
    }}
  >
    <View style={{ width: 9, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 7, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ width: 9, height: 2, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

// People / Active Connections Icon (KPI 2 & My Requests 3)
const PeopleVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 18, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
    <View style={{ alignItems: 'center', marginRight: -3, zIndex: 2 }}>
      <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color }} />
      <View
        style={{
          width: 12,
          height: 6,
          borderTopLeftRadius: 6,
          borderTopRightRadius: 6,
          backgroundColor: color,
          marginTop: 1,
        }}
      />
    </View>
    <View style={{ alignItems: 'center', zIndex: 1 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: 0.8 }} />
      <View
        style={{
          width: 10,
          height: 5,
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          backgroundColor: color,
          marginTop: 1,
          opacity: 0.8,
        }}
      />
    </View>
  </View>
);

// Trend Up / Growth Icon (KPI 3)
const TrendUpVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 18, justifyContent: 'flex-end', alignItems: 'center' }}>
    {/* Diagonal line */}
    <View
      style={{
        position: 'absolute',
        top: 2,
        right: 2,
        width: 0,
        height: 0,
        borderLeftWidth: 4,
        borderRightWidth: 4,
        borderBottomWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
    <View
      style={{
        width: 18,
        height: 2,
        backgroundColor: color,
        transform: [{ rotate: '-25deg' }],
        position: 'absolute',
        bottom: 7,
      }}
    />
    {/* Bars */}
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2.5, width: '100%', paddingHorizontal: 1 }}>
      <View style={{ width: 3.5, height: 6, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3.5, height: 9, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3.5, height: 13, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3.5, height: 17, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </View>
);

// Handshake Icon (KPI 4 & My Requests 2)
const HandshakeVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 18, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {/* Left wrist & hand */}
      <View
        style={{
          width: 9,
          height: 7,
          backgroundColor: color,
          borderTopLeftRadius: 3,
          borderBottomLeftRadius: 3,
          borderTopRightRadius: 2,
          transform: [{ rotate: '-18deg' }],
        }}
      />
      {/* Clasp center */}
      <View
        style={{
          width: 6,
          height: 8,
          backgroundColor: color,
          borderRadius: 2,
          marginHorizontal: -1,
          zIndex: 2,
        }}
      />
      {/* Right wrist & hand */}
      <View
        style={{
          width: 9,
          height: 7,
          backgroundColor: color,
          borderTopRightRadius: 3,
          borderBottomRightRadius: 3,
          borderTopLeftRadius: 2,
          transform: [{ rotate: '18deg' }],
        }}
      />
    </View>
  </View>
);

// Quick Action 1: Plus in Square
const PlusSquareVectorIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 26,
      height: 26,
      borderRadius: 7,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <View style={{ width: 12, height: 2.5, backgroundColor: '#FFFFFF', borderRadius: 1.25 }} />
    <View
      style={{
        position: 'absolute',
        width: 2.5,
        height: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 1.25,
      }}
    />
  </View>
);

// Quick Action 2: Find Members / Search
const SearchVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 15,
        height: 15,
        borderRadius: 7.5,
        borderWidth: 2.2,
        borderColor: color,
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: 2,
        right: 3,
        width: 6,
        height: 2.4,
        backgroundColor: color,
        borderRadius: 1.2,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

// Quick Action 3: View Connections / People Silhouette
const UsersActionVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
      <View style={{ alignItems: 'center', marginRight: -3, zIndex: 2 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <View
          style={{
            width: 14,
            height: 7,
            borderTopLeftRadius: 7,
            borderTopRightRadius: 7,
            backgroundColor: color,
            marginTop: 1.5,
          }}
        />
      </View>
      <View style={{ alignItems: 'center', zIndex: 1 }}>
        <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: color, opacity: 0.7 }} />
        <View
          style={{
            width: 11,
            height: 6,
            borderTopLeftRadius: 6,
            borderTopRightRadius: 6,
            backgroundColor: color,
            marginTop: 1.5,
            opacity: 0.7,
          }}
        />
      </View>
    </View>
  </View>
);

// Quick Action 4: Explore Categories / 4 Squares Grid
const GridVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 20, height: 20, justifyContent: 'space-between' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 8.5, height: 8.5, borderRadius: 2.5, backgroundColor: color }} />
      <View style={{ width: 8.5, height: 8.5, borderRadius: 2.5, backgroundColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <View style={{ width: 8.5, height: 8.5, borderRadius: 2.5, backgroundColor: color }} />
      <View style={{ width: 8.5, height: 8.5, borderRadius: 2.5, backgroundColor: color }} />
    </View>
  </View>
);

// Category 1: Manufacturing & Industrial (Factory)
const FactoryVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 22, justifyContent: 'flex-end', alignItems: 'center' }}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      {/* Chimney 1 */}
      <View style={{ width: 5, height: 16, backgroundColor: color, borderRadius: 1 }}>
        <View style={{ width: 3, height: 2, backgroundColor: '#FFFFFF', marginTop: 2, alignSelf: 'center' }} />
      </View>
      {/* Sawtooth section */}
      <View style={{ width: 7, height: 11, backgroundColor: color, borderTopRightRadius: 2 }} />
      <View style={{ width: 7, height: 8, backgroundColor: color, borderTopRightRadius: 2 }} />
    </View>
    <View style={{ width: 22, height: 2, backgroundColor: color, marginTop: 1, borderRadius: 1 }} />
  </View>
);

// Category 2: Technology & Digital (Laptop)
const LaptopVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 22, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 18,
        height: 12,
        borderRadius: 2,
        borderWidth: 2,
        borderColor: color,
        backgroundColor: '#FFFFFF',
      }}
    />
    <View
      style={{
        width: 22,
        height: 2.5,
        backgroundColor: color,
        borderRadius: 1.25,
        marginTop: 1,
      }}
    />
  </View>
);

// Category 3: Investment & Finance (Stack of Coins)
const CoinsVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 22, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 16,
        height: 7,
        borderRadius: 8,
        backgroundColor: color,
        borderWidth: 1.5,
        borderColor: '#B45309',
        marginBottom: -3,
        zIndex: 3,
      }}
    />
    <View
      style={{
        width: 16,
        height: 7,
        borderRadius: 8,
        backgroundColor: color,
        borderWidth: 1.5,
        borderColor: '#B45309',
        marginBottom: -3,
        zIndex: 2,
        opacity: 0.9,
      }}
    />
    <View
      style={{
        width: 16,
        height: 7,
        borderRadius: 8,
        backgroundColor: color,
        borderWidth: 1.5,
        borderColor: '#B45309',
        zIndex: 1,
        opacity: 0.8,
      }}
    />
  </View>
);

// Category 4: Education & Knowledge (Graduation Cap)
const GradCapVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 24, height: 22, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 11,
        borderRightWidth: 11,
        borderBottomWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        marginBottom: -1,
      }}
    />
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 11,
        borderRightWidth: 11,
        borderTopWidth: 6,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
      }}
    />
    <View
      style={{
        width: 10,
        height: 4,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        backgroundColor: color,
        marginTop: 1,
      }}
    />
  </View>
);

// Bell Vector Icon for Header
const BellVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 18, height: 19, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 4,
        height: 2.5,
        backgroundColor: color,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
      }}
    />
    <View
      style={{
        width: 13,
        height: 11,
        borderTopLeftRadius: 6.5,
        borderTopRightRadius: 6.5,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 1,
        backgroundColor: color,
      }}
    />
    <View
      style={{
        width: 17,
        height: 2.2,
        backgroundColor: color,
        borderRadius: 1,
      }}
    />
    <View
      style={{
        width: 4.5,
        height: 2.5,
        backgroundColor: color,
        borderBottomLeftRadius: 2.25,
        borderBottomRightRadius: 2.25,
        marginTop: 0.5,
      }}
    />
  </View>
);

// Clock Icon
const ClockVectorIcon = ({ color = '#64748B' }: { color?: string }) => (
  <View
    style={{
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 1.4,
      borderColor: color,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 4,
    }}
  >
    <View style={{ width: 1.2, height: 4, backgroundColor: color, position: 'absolute', top: 2.2 }} />
    <View style={{ width: 3.2, height: 1.2, backgroundColor: color, position: 'absolute', top: 5, right: 3 }} />
  </View>
);

// Video Camera Icon (Virtual Meeting)
const VideoCameraVectorIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 4 }}>
    <View
      style={{
        width: 13,
        height: 10,
        borderRadius: 2.5,
        backgroundColor: color,
      }}
    />
    <View
      style={{
        width: 0,
        height: 0,
        borderTopWidth: 3.5,
        borderBottomWidth: 3.5,
        borderRightWidth: 4.5,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: color,
        transform: [{ rotate: '180deg' }],
        marginLeft: 1,
      }}
    />
  </View>
);

interface UpcomingMeeting {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  type: string;
  status: 'Confirmed' | 'Scheduled' | 'In Review';
  moderator: string;
  location: string;
  agenda: string;
  platform?: MeetingPlatform;
  meetingUrl?: string;
}

const UPCOMING_MEETINGS: UpcomingMeeting[] = [];

interface BannerSlide {
  id: string;
  title: string;
  image: any;
  targetModule: string;
}

const BANNER_SLIDES: BannerSlide[] = [
  {
    id: 'slide-1',
    title: 'Grow Your Business Opportunities',
    image: require('../../assets/images/dashboard_banner.jpg'),
    targetModule: 'Marketplace',
  },
  {
    id: 'slide-2',
    title: 'Invest & Scale Your Business',
    image: require('../../assets/images/dashboard_banner_2.jpg'),
    targetModule: 'Investment',
  },
  {
    id: 'slide-3',
    title: 'Build Valuable Business Connections',
    image: require('../../assets/images/dashboard_banner_3.jpg'),
    targetModule: 'Meetings',
  },
];

interface DashboardBannerSliderProps {
  onNavigateToModule: (moduleName: string) => void;
}

const DashboardBannerSlider: React.FC<DashboardBannerSliderProps> = ({ onNavigateToModule }) => {
  const bannerScrollRef = useRef<ScrollView>(null);
  const currentIndexRef = useRef(0);
  const isInteractingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const bannerWidth = width - 32;
  const bannerHeight = bannerWidth * (480 / 1024);

  const startAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    timerRef.current = setInterval(() => {
      if (isInteractingRef.current) return;
      const nextIndex = (currentIndexRef.current + 1) % BANNER_SLIDES.length;
      currentIndexRef.current = nextIndex;
      bannerScrollRef.current?.scrollTo({
        x: nextIndex * bannerWidth,
        animated: true,
      });
    }, 4000);
  }, [bannerWidth]);

  const stopAutoScroll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    startAutoScroll();
    return () => {
      stopAutoScroll();
    };
  }, [startAutoScroll, stopAutoScroll]);

  return (
    <View style={styles.bannerWrapper}>
      <View style={styles.bannerInner}>
        <ScrollView
          ref={bannerScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          onScrollBeginDrag={() => {
            isInteractingRef.current = true;
            stopAutoScroll();
          }}
          onScrollEndDrag={() => {
            isInteractingRef.current = false;
            startAutoScroll();
          }}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            const newIndex = Math.round(offsetX / bannerWidth);
            if (newIndex >= 0 && newIndex < BANNER_SLIDES.length) {
              currentIndexRef.current = newIndex;
            }
            isInteractingRef.current = false;
            startAutoScroll();
          }}
          style={{ width: bannerWidth, height: bannerHeight }}
        >
          {BANNER_SLIDES.map((slide) => (
            <TouchableOpacity
              key={slide.id}
              style={{ width: bannerWidth, height: bannerHeight }}
              activeOpacity={0.92}
              onPress={() => onNavigateToModule(slide.targetModule)}
            >
              <Image
                source={slide.image}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

// Book / Lessons Vector Icon for Course Cards
const BookLessonsVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 14, height: 13, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: 12,
        height: 10,
        borderWidth: 1.4,
        borderColor: color,
        borderRadius: 2,
        backgroundColor: 'transparent',
      }}
    />
    <View style={{ position: 'absolute', width: 1.4, height: 10, backgroundColor: color }} />
  </View>
);

// Mentors Vector Icon (Card 1)
const MentorsVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color, marginBottom: 1.5 }} />
    <View
      style={{
        width: 15,
        height: 7,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        backgroundColor: color,
      }}
    />
  </View>
);

// Connections Directory Vector Icon (Card 2)
const ConnectionsVectorIcon = ({ color }: { color: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', gap: 3, alignItems: 'center' }}>
      <View style={{ width: 5.5, height: 5.5, borderRadius: 3, backgroundColor: color }} />
      <View style={{ width: 7.5, height: 7.5, borderRadius: 4, backgroundColor: color }} />
      <View style={{ width: 5.5, height: 5.5, borderRadius: 3, backgroundColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', gap: 3.5, marginTop: 1.5 }}>
      <View style={{ width: 7, height: 4.5, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: color }} />
      <View style={{ width: 9.5, height: 5.5, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: color }} />
      <View style={{ width: 7, height: 4.5, borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: color }} />
    </View>
  </View>
);

// Calendar Sessions Vector Icon (Card 3)
const CalendarSessionsVectorIcon = ({ color }: { color: string }) => (
  <View
    style={{
      width: 19,
      height: 19,
      borderRadius: 4,
      borderWidth: 1.8,
      borderColor: color,
      paddingTop: 3,
      alignItems: 'center',
    }}
  >
    <View style={{ width: 15, height: 1.5, backgroundColor: color, marginBottom: 2.5 }} />
    <View style={{ flexDirection: 'row', gap: 2.5 }}>
      <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
      <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: color }} />
    </View>
  </View>
);

export interface RecommendedCourse {
  id: string;
  title: string;
  mentor: string;
  duration: string;
  lessons: string;
  badge: string;
  image: any;
  thumbnailUrl: string;
  description: string;
  topics: string[];
}

const RECOMMENDED_COURSES: RecommendedCourse[] = [];

const STUDENT_CONNECTIONS_METRICS = [
  {
    id: 'mentors',
    value: '0',
    label: 'Mentors',
    actionText: 'View & Book →',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    targetModule: 'Skill Development',
  },
  {
    id: 'connections',
    value: '0',
    label: 'Connections',
    actionText: 'View Directory →',
    iconBg: '#ECFDF5',
    iconColor: '#10B981',
    targetModule: 'Meetings',
  },
  {
    id: 'sessions',
    value: '0',
    label: 'Upcoming Sessions',
    actionText: 'View Schedule →',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    targetModule: 'Meetings',
  },
];

// -------------------------------------------------------------
// Mentor Dashboard Specific Icons & Mock Data (Matching Image)
// -------------------------------------------------------------

// Active Students Icon (KPI 1)
const ActiveStudentsVectorIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', gap: 2.5, alignItems: 'center' }}>
      <View style={{ width: 6.5, height: 6.5, borderRadius: 3.5, backgroundColor: color }} />
      <View style={{ width: 6.5, height: 6.5, borderRadius: 3.5, backgroundColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', gap: 2.5, marginTop: 1.5 }}>
      <View style={{ width: 9, height: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: color }} />
      <View style={{ width: 9, height: 5, borderTopLeftRadius: 5, borderTopRightRadius: 5, backgroundColor: color }} />
    </View>
  </View>
);

// Green Calendar Icon (KPI 2)
const CalendarGreenVectorIcon = ({ color = '#10B981' }: { color?: string }) => (
  <View
    style={{
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1.8,
      borderColor: color,
      paddingTop: 3,
      alignItems: 'center',
    }}
  >
    <View style={{ width: 16, height: 1.5, backgroundColor: color, marginBottom: 2 }} />
    <View style={{ flexDirection: 'row', gap: 2.5 }}>
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
    </View>
    <View style={{ flexDirection: 'row', gap: 2.5, marginTop: 2 }}>
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
      <View style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: color }} />
    </View>
  </View>
);

// Monthly Earnings Icon (KPI 3)
const MonthlyEarningsVectorIcon = ({ color = '#9333EA' }: { color?: string }) => (
  <View style={{ width: 22, height: 20, justifyContent: 'flex-end', alignItems: 'center' }}>
    <View
      style={{
        position: 'absolute',
        top: 2,
        right: 2,
        width: 0,
        height: 0,
        borderLeftWidth: 3.5,
        borderRightWidth: 3.5,
        borderBottomWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2.5, width: '100%', paddingHorizontal: 1 }}>
      <View style={{ width: 3.5, height: 6, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3.5, height: 10, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3.5, height: 14, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: 3.5, height: 18, backgroundColor: color, borderRadius: 1 }} />
    </View>
  </View>
);

// Published Courses / Grad Cap Icon (KPI 4)
const GradCapOrangeVectorIcon = ({ color = '#EA580C' }: { color?: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 14,
        height: 14,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }, { scaleY: 0.55 }],
        borderRadius: 2,
      }}
    />
    <View
      style={{
        width: 11,
        height: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        borderWidth: 1.8,
        borderColor: color,
        borderTopWidth: 0,
        marginTop: -3.5,
      }}
    />
    <View
      style={{
        position: 'absolute',
        right: 2,
        top: 8,
        width: 1.5,
        height: 6,
        backgroundColor: color,
      }}
    />
  </View>
);

// Cloud Upload Vector Icon (Quick Action 3)
const CloudUploadVectorIcon = ({ color = '#7C3AED' }: { color?: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 16, height: 9, borderRadius: 4.5, backgroundColor: color, opacity: 0.9 }} />
    <View
      style={{
        position: 'absolute',
        top: 2,
        left: 5,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: color,
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: 3,
        width: 0,
        height: 0,
        borderLeftWidth: 3.5,
        borderRightWidth: 3.5,
        borderBottomWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFFFFF',
      }}
    />
    <View
      style={{
        position: 'absolute',
        bottom: 1,
        width: 2,
        height: 3,
        backgroundColor: '#FFFFFF',
      }}
    />
  </View>
);

// Find Students Search Icon (Quick Action 2)
const FindStudentsVectorIcon = ({ color = '#0D9488' }: { color?: string }) => (
  <View style={{ width: 22, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 13,
        height: 13,
        borderRadius: 6.5,
        borderWidth: 2,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
    </View>
    <View
      style={{
        position: 'absolute',
        right: 2,
        bottom: 2,
        width: 2,
        height: 6,
        backgroundColor: color,
        transform: [{ rotate: '-45deg' }],
        borderRadius: 1,
      }}
    />
  </View>
);

const INITIAL_MENTOR_COURSES: RecommendedCourse[] = [];

const MENTOR_UPCOMING_SESSIONS: UpcomingMeeting[] = [];

const MENTOR_STUDENT_NETWORK_METRICS = [
  {
    id: 'students',
    value: '0',
    label: 'Students',
    actionText: 'View Students →',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    targetModule: 'Students',
  },
  {
    id: 'connections',
    value: '0',
    label: 'Connections',
    actionText: 'View Directory →',
    iconBg: '#ECFDF5',
    iconColor: '#10B981',
    targetModule: 'Connections',
  },
  {
    id: 'bookings',
    value: '0',
    label: 'Upcoming Bookings',
    actionText: 'View Schedule →',
    iconBg: '#EFF6FF',
    iconColor: '#2563EB',
    targetModule: 'Sessions',
  },
];

// Modern three-dot More Options Icon matching reference image
const ThreeDotsVectorIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <View style={{ width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color, marginVertical: 2.2 }} />
    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
  </View>
);

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateToModule,
}) => {
  const { user } = useAuth();
  const {
    courses,
    chamberRequests,
    mentors,
    getMentorIncomingRequests,
    getStudentBookings,
    notifications,
  } = useStudentMentor();
  const { referralStats } = useWalletReferral();

  // Notification red dot state: synchronized with persistent storage & real-time events
  const [membershipUnreadCount, setMembershipUnreadCount] = useState<number>(0);
  const [isNotifLoaded, setIsNotifLoaded] = useState<boolean>(false);

  const fetchMembershipUnread = useCallback(async () => {
    try {
      const count = await membershipNotificationService.getUnreadCount();
      setMembershipUnreadCount(count);
      setIsNotifLoaded(true);
    } catch (err) {
      console.warn('[Dashboard] Error fetching unread count:', err);
      setMembershipUnreadCount(0);
      setIsNotifLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchMembershipUnread();

    const unsubscribeService = membershipNotificationService.subscribe(fetchMembershipUnread);
    const unsubscribeFCM = FCMService.onMessageReceived(() => {
      fetchMembershipUnread();
    });

    return () => {
      unsubscribeService();
      unsubscribeFCM();
    };
  }, [fetchMembershipUnread, user?.id]);

  // Dynamic unread count for current user
  const dynamicUnreadCount = (notifications || []).filter(
    (n) => !n.read && (!n.targetUserId || !user?.id || n.targetUserId === user?.id || n.targetUserId === 'all')
  ).length;

  // Real-time total unread count: strictly 0 while loading/errored to prevent false indicator
  const totalUnreadCount = isNotifLoaded ? dynamicUnreadCount + membershipUnreadCount : 0;
  const rawName = user?.fullName;
  const displayName = rawName
    ? (rawName.includes('(') ? rawName.split('(')[0].trim() : rawName)
    : 'Member';

  const subLower = user?.subcategory?.toLowerCase() || '';
  const isMentor =
    user?.role === 'MENTOR' ||
    subLower === 'mentor' ||
    subLower === 'mentor / trainer' ||
    subLower === 'mentor/trainer' ||
    subLower === 'trainer' ||
    subLower === 'teacher' ||
    subLower === 'professor' ||
    subLower === 'teacher / professor' ||
    subLower === 'teacher/professor';

  const isStudent =
    !isMentor &&
    (user?.role === 'STUDENT' ||
      subLower === 'student' ||
      (user?.category === 'Education & Knowledge' && subLower === 'student'));

  const mentorRequests = isMentor ? getMentorIncomingRequests(user?.id, user?.fullName) : [];
  const studentBookings = isStudent ? getStudentBookings(user?.id) : [];

  // Dynamically derive mentor KPI counts
  const dynamicActiveStudents = mentorRequests.length;
  const dynamicUpcomingSessions = mentorRequests.filter((r) => r.status === 'ACCEPTED').length;
  const dynamicPublishedCourses = courses.filter((c) => c.mentorId === user?.id).length;

  const mentorMetrics = [
    {
      id: 'students',
      value: dynamicActiveStudents.toString(),
      label: 'Students',
      actionText: 'View Students →',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      targetModule: 'Students',
    },
    {
      id: 'connections',
      value: '0',
      label: 'Connections',
      actionText: 'View Directory →',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      targetModule: 'Connections',
    },
    {
      id: 'bookings',
      value: mentorRequests.filter((r) => r.status === 'PENDING').length.toString(),
      label: 'Upcoming Bookings',
      actionText: 'View Schedule →',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      targetModule: 'Sessions',
    },
  ];

  const studentMetrics = [
    {
      id: 'mentors',
      value: mentors.length.toString(),
      label: 'Mentors',
      actionText: 'View & Book →',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      targetModule: 'Skill Development',
    },
    {
      id: 'connections',
      value: '0',
      label: 'Connections',
      actionText: 'View Directory →',
      iconBg: '#ECFDF5',
      iconColor: '#10B981',
      targetModule: 'Meetings',
    },
    {
      id: 'sessions',
      value: studentBookings.filter((b) => b.status === 'ACCEPTED').length.toString(),
      label: 'Upcoming Sessions',
      actionText: 'View Schedule →',
      iconBg: '#EFF6FF',
      iconColor: '#2563EB',
      targetModule: 'Meetings',
    },
  ];

  // Student Recommended Courses dynamically combined with shared masterclasses
  const dynamicRecommendedCourses: RecommendedCourse[] = [
    ...courses.map((c) => ({
      id: c.id,
      title: c.title,
      mentor: `By ${c.instructor}`,
      duration: c.duration,
      lessons: `${c.modulesCount} Lessons`,
      badge: 'Recorded',
      image: require('../../assets/images/dashboard_banner.jpg'),
      thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
      description: c.description || 'Chamber-certified engineering & professional masterclass.',
      topics: c.syllabus || ['Module 1', 'Module 2'],
    })),
    ...RECOMMENDED_COURSES,
  ];

  const [selectedMeeting, setSelectedMeeting] = useState<UpcomingMeeting | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<RecommendedCourse | null>(null);
  const [functionsMenuVisible, setFunctionsMenuVisible] = useState(false);

  // Mentor Specific Interactive State
  const [mentorCourses, setMentorCourses] = useState<RecommendedCourse[]>([]);
  const [uploadCourseModalVisible, setUploadCourseModalVisible] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDomain, setNewCourseDomain] = useState('Business Strategy');
  const [newCourseDuration, setNewCourseDuration] = useState('2h 15m');
  const [newCourseLessons, setNewCourseLessons] = useState('5 Lessons');

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={true} />

      {/* Pure White Status Bar / Top Safe Area */}
      <View style={styles.statusBarSpacer} />

      {/* Top Header Bar with Curved Blue and Gold Wave Background */}
      <View style={styles.topHeaderWrapper}>
        <Image
          source={require('../../assets/images/header_wave_bg.jpg')}
          style={styles.headerBackgroundImage}
          resizeMode="cover"
        />
        <View style={styles.topHeaderContent}>
          {/* Left Side: Three-dot More Options Button + Brand Logo & Title */}
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              style={styles.moreOptionsButton}
              activeOpacity={0.7}
              onPress={() => setFunctionsMenuVisible(true)}
              accessibilityLabel="Platform Functions Menu"
            >
              <ThreeDotsVectorIcon color="#2563EB" />
            </TouchableOpacity>

            <View style={styles.brandRow}>
              {/* Official Brand Logo */}
              <Image
                source={require('../../assets/images/logo.png')}
                style={styles.brandLogoImage}
                resizeMode="contain"
              />
              <View style={styles.brandTextCol}>
                <Text style={styles.brandTitle}>Business Connector</Text>
                <Text style={styles.brandTagline}>Learn • Earn • Benefits</Text>
              </View>
            </View>
          </View>

          {/* Right Header Action: Notification Bell Button */}
          <TouchableOpacity
            style={styles.bellButton}
            activeOpacity={0.7}
            onPress={() => onNavigateToModule('Notifications')}
            accessibilityLabel={`Notifications${totalUnreadCount > 0 ? `, ${totalUnreadCount} unread` : ''}`}
          >
            <BellVectorIcon color="#475569" />
            {totalUnreadCount > 0 && <View style={styles.notificationDot} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.mainScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================== */}
        {/* DYNAMIC DASHBOARD: MENTOR vs STUDENT vs MSME                   */}
        {/* ============================================================== */}
        {isMentor ? (
          <>
            {/* 1. Mentor Welcome Greeting Section (Reference Image) */}
            <View style={styles.userGreetingCard}>
              <View style={styles.greetingLeft}>
                <Text style={styles.greetingTitle}>Welcome Back</Text>
                <Text style={styles.greetingName}>
                  {displayName} <Text style={styles.greetingWave}>👋</Text>
                </Text>
              </View>
            </View>

            {/* 2. Shared Dashboard Banner Slider (All 3 Slides) */}
            <DashboardBannerSlider onNavigateToModule={onNavigateToModule} />

            {/* 3. 4 Mentor KPI Cards (2x2 Grid) */}
            <View style={styles.kpiGrid}>
              {/* Card 1: Active Students */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('Students')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <ActiveStudentsVectorIcon color="#2563EB" />
                </View>
                <Text style={styles.kpiValue}>{dynamicActiveStudents}</Text>
                <Text style={styles.kpiLabel}>Active Students</Text>
              </TouchableOpacity>

              {/* Card 2: Upcoming Sessions */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('My Requests')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <CalendarGreenVectorIcon color="#10B981" />
                </View>
                <Text style={styles.kpiValue}>{dynamicUpcomingSessions}</Text>
                <Text style={styles.kpiLabel}>Upcoming Sessions</Text>
              </TouchableOpacity>

              {/* Card 3: Monthly Earnings */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('Profile')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#FAF5FF' }]}>
                  <MonthlyEarningsVectorIcon color="#9333EA" />
                </View>
                <Text style={styles.kpiValue}>₹ 0</Text>
                <Text style={styles.kpiLabel}>Monthly Earnings</Text>
              </TouchableOpacity>

              {/* Card 4: Published Courses */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('My Services')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <GradCapOrangeVectorIcon color="#EA580C" />
                </View>
                <Text style={styles.kpiValue}>{dynamicPublishedCourses}</Text>
                <Text style={styles.kpiLabel}>Published Courses</Text>
              </TouchableOpacity>
            </View>

            {/* 4. Mentor Quick Actions (Reference Image) */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <TouchableOpacity onPress={() => onNavigateToModule('Sessions')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickActionsRow}>
                {/* Action 1: Manage Sessions */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Sessions')}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <CalendarSessionsVectorIcon color="#2563EB" />
                  </View>
                  <Text style={styles.actionLabel}>Manage{'\n'}Sessions</Text>
                </TouchableOpacity>

                {/* Action 2: Find Students */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Students')}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <FindStudentsVectorIcon color="#0D9488" />
                  </View>
                  <Text style={styles.actionLabel}>Find{'\n'}Students</Text>
                </TouchableOpacity>

                {/* Action 3: Upload Course */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => setUploadCourseModalVisible(true)}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#F5F3FF' }]}>
                    <CloudUploadVectorIcon color="#7C3AED" />
                  </View>
                  <Text style={styles.actionLabel}>Upload{'\n'}Course</Text>
                </TouchableOpacity>

                {/* Action 4: Mentor Services */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('My Services')}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#FAF5FF' }]}>
                    <GridVectorIcon color="#9333EA" />
                  </View>
                  <Text style={styles.actionLabel}>Mentor{'\n'}Services</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. Mentor Upcoming Sessions (Reference Image) */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
                <TouchableOpacity onPress={() => onNavigateToModule('Sessions')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.meetingsList}>
                {mentorRequests.filter((r) => r.status === 'ACCEPTED').length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyTitle}>No upcoming sessions</Text>
                    <Text style={styles.emptySub}>
                      Facilitated student sessions and mentoring reviews will appear here.
                    </Text>
                  </View>
                ) : (
                  mentorRequests
                    .filter((r) => r.status === 'ACCEPTED')
                    .map((sess) => (
                      <TouchableOpacity
                        key={sess.id}
                        style={styles.meetingCard}
                        activeOpacity={0.85}
                        onPress={() => {}}
                      >
                        <View style={styles.meetingDateBadge}>
                          <Text style={styles.meetingDateMonth}>UP</Text>
                          <Text style={styles.meetingDateDay}>🗓</Text>
                        </View>

                        <View style={styles.meetingContentCol}>
                          <Text style={styles.meetingTitle} numberOfLines={1}>
                            {sess.topic}
                          </Text>

                          <View style={styles.meetingMetaRow}>
                            <View style={styles.meetingMetaItem}>
                              <ClockVectorIcon color="#64748B" />
                              <Text style={styles.meetingMetaText}>{sess.requestedDate || 'Facilitated'}</Text>
                            </View>
                            <Text style={styles.meetingMetaDivider}>|</Text>
                            <View style={styles.meetingMetaItem}>
                              <VideoCameraVectorIcon color="#2563EB" />
                              <Text style={[styles.meetingMetaText, { color: '#2563EB', fontWeight: '500' }]}>
                                Virtual Chamber
                              </Text>
                            </View>
                          </View>
                        </View>

                        <View style={styles.meetingActionCol}>
                          <Text style={styles.meetingChevron}>›</Text>
                        </View>
                      </TouchableOpacity>
                    ))
                )}
              </View>
            </View>

            {/* 6. My Courses (Reference Image) */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>My Courses</Text>
                <TouchableOpacity onPress={() => onNavigateToModule('Courses')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {courses.filter((c) => c.mentorId === user?.id).length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>🎬</Text>
                  <Text style={styles.emptyTitle}>No courses published yet</Text>
                  <Text style={styles.emptySub}>
                    Upload your masterclasses or video lectures to share your expertise.
                  </Text>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.coursesScrollList}
                >
                  {courses
                    .filter((c) => c.mentorId === user?.id)
                    .map((course) => (
                      <TouchableOpacity
                        key={course.id}
                        style={styles.courseCard}
                        activeOpacity={0.88}
                        onPress={() => {}}
                      >
                        <View style={styles.courseThumbContainer}>
                          <Image
                            source={require('../../assets/images/dashboard_banner.jpg')}
                            style={styles.courseThumbImage}
                            resizeMode="cover"
                          />
                          <View style={styles.coursePublishedBadge}>
                            <Text style={styles.coursePublishedBadgeText}>Published</Text>
                          </View>
                        </View>

                        <Text style={styles.courseCardTitle} numberOfLines={2}>
                          {course.title}
                        </Text>
                        <Text style={styles.courseCardMentor} numberOfLines={1}>
                          By {course.instructor}
                        </Text>

                        <View style={styles.courseCardMetaRow}>
                          <View style={styles.courseCardMetaItem}>
                            <ClockVectorIcon color="#64748B" />
                            <Text style={styles.courseCardMetaText}>{course.duration}</Text>
                          </View>
                          <View style={styles.courseCardMetaItem}>
                            <BookLessonsVectorIcon color="#64748B" />
                            <Text style={styles.courseCardMetaText}>{course.modulesCount || 1} Lessons</Text>
                          </View>
                          <Text style={styles.courseCardChevron}>›</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              )}
            </View>

            {/* 7. Your Students & Network (Reference Image) */}
            <View style={[styles.sectionContainer, { marginBottom: 28 }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Your Students & Network</Text>
                <TouchableOpacity onPress={() => onNavigateToModule('Students')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.studentMetricsRow}>
                {mentorMetrics.map((metric) => (
                  <TouchableOpacity
                    key={metric.id}
                    style={styles.studentMetricCard}
                    activeOpacity={0.85}
                    onPress={() => onNavigateToModule(metric.targetModule)}
                  >
                    <View style={[styles.studentMetricIconBox, { backgroundColor: metric.iconBg }]}>
                      {metric.id === 'students' && <ActiveStudentsVectorIcon color={metric.iconColor} />}
                      {metric.id === 'connections' && <ConnectionsVectorIcon color={metric.iconColor} />}
                      {metric.id === 'bookings' && <CalendarSessionsVectorIcon color={metric.iconColor} />}
                    </View>

                    <Text style={styles.studentMetricValue}>{metric.value}</Text>
                    <Text style={styles.studentMetricLabel} numberOfLines={1}>
                      {metric.label}
                    </Text>

                    <Text style={styles.studentMetricActionText}>{metric.actionText}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* ============================================================== */
          /* NON-MENTOR DASHBOARD: STUDENT & MSME (PRESERVED UNCHANGED)     */
          /* ============================================================== */
          <>
            {/* User Greeting Card */}
            <View style={styles.userGreetingCard}>
              <View style={styles.greetingLeft}>
                <Text style={styles.greetingTitle}>Welcome Back</Text>
                <Text style={styles.greetingName}>
                  {displayName} <Text style={styles.greetingWave}>👋</Text>
                </Text>
              </View>
            </View>

            {/* Featured Opportunities Banner Slider */}
            <DashboardBannerSlider onNavigateToModule={onNavigateToModule} />

            {/* 4 Metric KPI Cards (2x2 Grid) */}
            <View style={styles.kpiGrid}>
              {/* Card 1: Business Requests */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('My Requests')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <DocVectorIcon color="#2563EB" />
                </View>
                <Text style={styles.kpiValue}>{chamberRequests.length}</Text>
                <Text style={styles.kpiLabel}>Business Requests</Text>
              </TouchableOpacity>

              {/* Card 2: Active Connections */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('Meetings')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <PeopleVectorIcon color="#10B981" />
                </View>
                <Text style={styles.kpiValue}>0</Text>
                <Text style={styles.kpiLabel}>Active Connections</Text>
              </TouchableOpacity>

              {/* Card 3: Investment Interest */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('Investment')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#F5F3FF' }]}>
                  <TrendUpVectorIcon color="#8B5CF6" />
                </View>
                <Text style={styles.kpiValue}>₹ 0</Text>
                <Text style={styles.kpiLabel}>Investment Interest</Text>
              </TouchableOpacity>

              {/* Card 4: Successful Referrals */}
              <TouchableOpacity
                style={styles.kpiCard}
                activeOpacity={0.8}
                onPress={() => onNavigateToModule('Scaling')}
              >
                <View style={[styles.kpiIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <HandshakeVectorIcon color="#F97316" />
                </View>
                <Text style={styles.kpiValue}>{referralStats?.successful || 0}</Text>
                <Text style={styles.kpiLabel}>Successful Referrals</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <TouchableOpacity onPress={() => onNavigateToModule('Marketplace')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.quickActionsRow}>
                {/* Action 1: Post Requirement */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('My Requests')}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <PlusSquareVectorIcon color="#059669" />
                  </View>
                  <Text style={styles.actionLabel}>Post{'\n'}Requirement</Text>
                </TouchableOpacity>

                {/* Action 2: Find Members */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Marketplace')}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#ECFEFF' }]}>
                    <SearchVectorIcon color="#0891B2" />
                  </View>
                  <Text style={styles.actionLabel}>Find{'\n'}Members</Text>
                </TouchableOpacity>

                {/* Action 3: View Connections */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Meetings')}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#F5F3FF' }]}>
                    <UsersActionVectorIcon color="#7C3AED" />
                  </View>
                  <Text style={styles.actionLabel}>View{'\n'}Connections</Text>
                </TouchableOpacity>

                {/* Action 4: Explore Categories */}
                <TouchableOpacity
                  style={styles.actionItem}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Marketplace')}
                >
                  <View style={[styles.actionIconCircle, { backgroundColor: '#FFF7ED' }]}>
                    <GridVectorIcon color="#EA580C" />
                  </View>
                  <Text style={styles.actionLabel}>Explore{'\n'}Categories</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Business Categories */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Business Categories</Text>
                <TouchableOpacity onPress={() => onNavigateToModule('Marketplace')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.categoriesRow}>
                {/* Category 1: Manufacturing & Industrial */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Marketplace')}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: '#EFF6FF' }]}>
                    <FactoryVectorIcon color="#0284C7" />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    Manufacturing{'\n'}& Industrial
                  </Text>
                </TouchableOpacity>

                {/* Category 2: Technology & Digital */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Marketplace')}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: '#ECFDF5' }]}>
                    <LaptopVectorIcon color="#10B981" />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    Technology{'\n'}& Digital
                  </Text>
                </TouchableOpacity>

                {/* Category 3: Investment & Finance */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Investment')}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: '#FFFBEB' }]}>
                    <CoinsVectorIcon color="#F59E0B" />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    Investment{'\n'}& Finance
                  </Text>
                </TouchableOpacity>

                {/* Category 4: Education & Knowledge */}
                <TouchableOpacity
                  style={styles.categoryCard}
                  activeOpacity={0.8}
                  onPress={() => onNavigateToModule('Marketplace')}
                >
                  <View style={[styles.categoryIconCircle, { backgroundColor: '#FAF5FF' }]}>
                    <GradCapVectorIcon color="#8B5CF6" />
                  </View>
                  <Text style={styles.categoryName} numberOfLines={2}>
                    Education{'\n'}& Knowledge
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Upcoming Meetings */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
                <TouchableOpacity onPress={() => onNavigateToModule('Meetings')}>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.meetingsList}>
                {UPCOMING_MEETINGS.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>📅</Text>
                    <Text style={styles.emptyTitle}>No upcoming meetings</Text>
                    <Text style={styles.emptySub}>
                      Scheduled bilateral chambers and facilitator reviews will appear here.
                    </Text>
                  </View>
                ) : (
                  UPCOMING_MEETINGS.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={styles.meetingCard}
                      activeOpacity={0.85}
                      onPress={() => setSelectedMeeting(m)}
                    >
                      <View style={styles.meetingDateBadge}>
                        <Text style={styles.meetingDateMonth}>{m.month}</Text>
                        <Text style={styles.meetingDateDay}>{m.day}</Text>
                      </View>

                      <View style={styles.meetingContentCol}>
                        <Text style={styles.meetingTitle} numberOfLines={1}>
                          {m.title}
                        </Text>

                        <View style={styles.meetingMetaRow}>
                          <View style={styles.meetingMetaItem}>
                            <ClockVectorIcon color="#64748B" />
                            <Text style={styles.meetingMetaText}>{m.time}</Text>
                          </View>
                          <Text style={styles.meetingMetaDivider}>|</Text>
                          <View style={styles.meetingMetaItem}>
                            <VideoCameraVectorIcon color="#2563EB" />
                            <Text style={[styles.meetingMetaText, { color: '#2563EB', fontWeight: '500' }]}>
                              {m.type}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.meetingActionCol}>
                        <Text style={styles.meetingChevron}>›</Text>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            {/* Dynamic Student vs MSME Requests */}
            {isStudent ? (
              <>
                {/* Recommended Courses (Reference Image 5) */}
                <View style={styles.sectionContainer}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Recommended Courses</Text>
                    <TouchableOpacity onPress={() => onNavigateToModule('Skill Development')}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  {dynamicRecommendedCourses.length === 0 ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyIcon}>📚</Text>
                      <Text style={styles.emptyTitle}>No courses available</Text>
                      <Text style={styles.emptySub}>
                        Curated skill courses and masterclasses will appear here once published.
                      </Text>
                    </View>
                  ) : (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.coursesScrollList}
                    >
                      {dynamicRecommendedCourses.map((course) => (
                        <TouchableOpacity
                          key={course.id}
                          style={styles.courseCard}
                          activeOpacity={0.88}
                          onPress={() => setSelectedCourse(course)}
                        >
                          <View style={styles.courseThumbContainer}>
                            <Image
                              source={{ uri: course.thumbnailUrl }}
                              defaultSource={course.image}
                              style={styles.courseThumbImage}
                              resizeMode="cover"
                            />
                            <View style={styles.courseRecordedBadge}>
                              <Text style={styles.courseRecordedBadgeText}>{course.badge}</Text>
                            </View>
                          </View>

                          <Text style={styles.courseCardTitle} numberOfLines={2}>
                            {course.title}
                          </Text>
                          <Text style={styles.courseCardMentor} numberOfLines={1}>
                            {course.mentor}
                          </Text>

                          <View style={styles.courseCardMetaRow}>
                            <View style={styles.courseCardMetaItem}>
                              <ClockVectorIcon color="#64748B" />
                              <Text style={styles.courseCardMetaText}>{course.duration}</Text>
                            </View>
                            <View style={styles.courseCardMetaItem}>
                              <BookLessonsVectorIcon color="#64748B" />
                              <Text style={styles.courseCardMetaText}>{course.lessons}</Text>
                            </View>
                            <Text style={styles.courseCardChevron}>›</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>

                {/* Your Connections & Mentors (Reference Image 5) */}
                <View style={[styles.sectionContainer, { marginBottom: 28 }]}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Your Connections & Mentors</Text>
                    <TouchableOpacity onPress={() => onNavigateToModule('Meetings')}>
                      <Text style={styles.seeAllText}>See All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.studentMetricsRow}>
                    {studentMetrics.map((metric) => (
                      <TouchableOpacity
                        key={metric.id}
                        style={styles.studentMetricCard}
                        activeOpacity={0.85}
                        onPress={() => onNavigateToModule(metric.targetModule)}
                      >
                        <View style={[styles.studentMetricIconBox, { backgroundColor: metric.iconBg }]}>
                          {metric.id === 'mentors' && <MentorsVectorIcon color={metric.iconColor} />}
                          {metric.id === 'connections' && <ConnectionsVectorIcon color={metric.iconColor} />}
                          {metric.id === 'sessions' && <CalendarSessionsVectorIcon color={metric.iconColor} />}
                        </View>

                        <Text style={styles.studentMetricValue}>{metric.value}</Text>
                        <Text style={styles.studentMetricLabel} numberOfLines={1}>
                          {metric.label}
                        </Text>

                        <Text style={styles.studentMetricActionText}>{metric.actionText}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            ) : (
              /* Non-Student My Requests Section */
              <View style={[styles.sectionContainer, { marginBottom: 28 }]}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>My Requests</Text>
                  <TouchableOpacity onPress={() => onNavigateToModule('My Requests')}>
                    <Text style={styles.seeAllText}>See All</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.requestsList}>
                  {/* Request 1: Business Requirements */}
                  <TouchableOpacity
                    style={styles.requestItemCard}
                    activeOpacity={0.85}
                    onPress={() => onNavigateToModule('My Requests')}
                  >
                    <View style={[styles.requestIconBox, { backgroundColor: '#EFF6FF' }]}>
                      <DocVectorIcon color="#2563EB" />
                    </View>
                    <View style={styles.requestTextCol}>
                      <Text style={styles.requestTitle}>Business Requirements</Text>
                      <Text style={styles.requestSubtitle}>
                        {chamberRequests.length === 0 ? 'No requests yet' : `${chamberRequests.length} Active Request${chamberRequests.length > 1 ? 's' : ''}`}
                      </Text>
                    </View>
                    <Text style={styles.requestChevron}>›</Text>
                  </TouchableOpacity>

                  {/* Request 2: Business Offers */}
                  <TouchableOpacity
                    style={styles.requestItemCard}
                    activeOpacity={0.85}
                    onPress={() => onNavigateToModule('My Requests')}
                  >
                    <View style={[styles.requestIconBox, { backgroundColor: '#FFF7ED' }]}>
                      <HandshakeVectorIcon color="#F97316" />
                    </View>
                    <View style={styles.requestTextCol}>
                      <Text style={styles.requestTitle}>Business Offers</Text>
                      <Text style={styles.requestSubtitle}>0 Active Offers</Text>
                    </View>
                    <Text style={styles.requestChevron}>›</Text>
                  </TouchableOpacity>

                  {/* Request 3: Connection Requests */}
                  <TouchableOpacity
                    style={styles.requestItemCard}
                    activeOpacity={0.85}
                    onPress={() => onNavigateToModule('Meetings')}
                  >
                    <View style={[styles.requestIconBox, { backgroundColor: '#ECFDF5' }]}>
                      <PeopleVectorIcon color="#10B981" />
                    </View>
                    <View style={styles.requestTextCol}>
                      <Text style={styles.requestTitle}>Connection Requests</Text>
                      <Text style={styles.requestSubtitle}>0 Pending Requests</Text>
                    </View>
                    <Text style={styles.requestChevron}>›</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ============================================================== */}
      {/* MEETING DETAILS MODAL                                          */}
      {/* ============================================================== */}
      <Modal
        visible={!!selectedMeeting}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedMeeting(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailsModalCard}>
            <View style={styles.detailsModalHeader}>
              <View style={styles.modalIconBadge}>
                <VideoCameraVectorIcon color="#2563EB" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.modalHeading}>{selectedMeeting?.title}</Text>
                <View style={styles.modalStatusRow}>
                  <View
                    style={[
                      styles.meetingStatusPill,
                      selectedMeeting?.status === 'Confirmed'
                        ? styles.statusPillConfirmed
                        : styles.statusPillScheduled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.meetingStatusText,
                        selectedMeeting?.status === 'Confirmed'
                          ? styles.statusTextConfirmed
                          : styles.statusTextScheduled,
                      ]}
                    >
                      {selectedMeeting?.status}
                    </Text>
                  </View>
                  <Text style={styles.modalTypeText}>• {selectedMeeting?.type}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedMeeting(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.detailsModalBody}>
              <View style={styles.modalInfoRow}>
                <Text style={styles.infoLabel}>Date & Time:</Text>
                <Text style={styles.infoValue}>
                  {selectedMeeting?.month} {selectedMeeting?.day}, 2026 • {selectedMeeting?.time}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.infoLabel}>Meeting Type:</Text>
                <Text style={styles.infoValue}>{selectedMeeting?.type}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.infoLabel}>Assigned App:</Text>
                <Text style={[styles.infoValue, { color: '#2563EB', fontWeight: '700' }]}>
                  {selectedMeeting?.platform || selectedMeeting?.type || 'Google Meet'}
                </Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.infoLabel}>Chamber Location:</Text>
                <Text style={styles.infoValue}>{selectedMeeting?.location}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.infoLabel}>Chamber Moderator:</Text>
                <Text style={styles.infoValue}>{selectedMeeting?.moderator}</Text>
              </View>
              <View style={styles.modalInfoRow}>
                <Text style={styles.infoLabel}>Agenda Overview:</Text>
                <Text style={styles.infoValue}>{selectedMeeting?.agenda}</Text>
              </View>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalJoinBtn}
                activeOpacity={0.88}
                onPress={() => {
                  const m = selectedMeeting;
                  setSelectedMeeting(null);
                  if (m) {
                    launchAssignedMeeting({
                      id: m.id,
                      title: m.title,
                      platform: m.platform,
                      meetingUrl: m.meetingUrl,
                      location: m.location,
                      type: m.type,
                    });
                  }
                }}
              >
                <Text style={styles.modalJoinBtnText}>Enter Meeting  →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* STUDENT COURSE DETAILS MODAL                                   */}
      {/* ============================================================== */}
      <Modal
        visible={!!selectedCourse}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedCourse(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.courseDetailsModalCard}>
            <View style={styles.courseDetailsModalHeader}>
              <View style={styles.courseModalThumbBox}>
                <Image
                  source={{ uri: selectedCourse?.thumbnailUrl }}
                  defaultSource={selectedCourse?.image}
                  style={styles.courseModalThumbImage}
                  resizeMode="cover"
                />
                <View style={styles.courseRecordedBadge}>
                  <Text style={styles.courseRecordedBadgeText}>{selectedCourse?.badge}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.courseModalCloseBtn}
                onPress={() => setSelectedCourse(null)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.courseModalBody}>
              <Text style={styles.courseModalTitle}>{selectedCourse?.title}</Text>
              <Text style={styles.courseModalMentor}>{selectedCourse?.mentor}</Text>

              <View style={styles.courseModalPillRow}>
                <View style={styles.courseMetaBadge}>
                  <ClockVectorIcon color="#2563EB" />
                  <Text style={styles.courseMetaBadgeText}>{selectedCourse?.duration}</Text>
                </View>
                <View style={styles.courseMetaBadge}>
                  <BookLessonsVectorIcon color="#2563EB" />
                  <Text style={styles.courseMetaBadgeText}>{selectedCourse?.lessons}</Text>
                </View>
                <View style={[styles.courseMetaBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={[styles.courseMetaBadgeText, { color: '#059669' }]}>Self-Paced Video</Text>
                </View>
              </View>

              <Text style={styles.courseSectionHeading}>Course Overview</Text>
              <Text style={styles.courseModalDescription}>{selectedCourse?.description}</Text>

              <Text style={styles.courseSectionHeading}>What You Will Learn</Text>
              <View style={styles.courseTopicsList}>
                {selectedCourse?.topics.map((t, idx) => (
                  <View key={idx} style={styles.courseTopicItem}>
                    <Text style={styles.courseTopicCheck}>✓</Text>
                    <Text style={styles.courseTopicText}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.courseModalFooter}>
              <TouchableOpacity
                style={styles.startCourseBtn}
                activeOpacity={0.88}
                onPress={() => {
                  setSelectedCourse(null);
                  onNavigateToModule('Skill Development');
                }}
              >
                <Text style={styles.startCourseBtnText}>Open in Learning Desk  →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MENTOR UPLOAD COURSE MODAL                                     */}
      {/* ============================================================== */}
      <Modal
        visible={uploadCourseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setUploadCourseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.uploadModalCard}>
            <View style={styles.uploadModalHeader}>
              <Text style={styles.uploadModalTitle}>Upload New Masterclass</Text>
              <TouchableOpacity
                onPress={() => setUploadCourseModalVisible(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.uploadFieldLabel}>Course Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Scaling Tech Ventures"
                placeholderTextColor="#94A3B8"
                value={newCourseTitle}
                onChangeText={setNewCourseTitle}
              />

              <Text style={styles.uploadFieldLabel}>Domain & Specialization *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Business Strategy & Product"
                placeholderTextColor="#94A3B8"
                value={newCourseDomain}
                onChangeText={setNewCourseDomain}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploadFieldLabel}>Duration *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 2h 45m"
                    placeholderTextColor="#94A3B8"
                    value={newCourseDuration}
                    onChangeText={setNewCourseDuration}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.uploadFieldLabel}>Lesson Count *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 6 Lessons"
                    placeholderTextColor="#94A3B8"
                    value={newCourseLessons}
                    onChangeText={setNewCourseLessons}
                  />
                </View>
              </View>

              <Text style={styles.uploadFieldLabel}>Course Synopsis</Text>
              <TextInput
                style={[styles.modalInput, { height: 75, textAlignVertical: 'top' }]}
                placeholder="Outline syllabus, key deliverables, and target student audience..."
                placeholderTextColor="#94A3B8"
                multiline
              />
            </ScrollView>

            <TouchableOpacity
              style={styles.publishCourseBtn}
              activeOpacity={0.88}
              onPress={() => {
                if (!newCourseTitle.trim()) {
                  notify.warning('Please enter a course title.', 'Required Field');
                  return;
                }
                const newCourse: RecommendedCourse = {
                  id: `course-${Date.now()}`,
                  title: newCourseTitle,
                  mentor: `By Mr. ${displayName}`,
                  duration: newCourseDuration || '2h 00m',
                  lessons: newCourseLessons || '5 Lessons',
                  badge: 'Published',
                  image: require('../../assets/images/dashboard_banner.jpg'),
                  thumbnailUrl:
                    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
                  description: 'Comprehensive Chamber-verified masterclass by authorized Mentor faculty.',
                  topics: [
                    'Foundation & Structural Frameworks',
                    'Strategic Case Study Analysis',
                    'Interactive Q&A and Practical Assignment',
                  ],
                };
                setMentorCourses([newCourse, ...mentorCourses]);
                setNewCourseTitle('');
                setUploadCourseModalVisible(false);
                notify.success(
                  'Your new masterclass has been verified and published to the FIC Chamber Student Desk!',
                  'Masterclass Published'
                );
              }}
            >
              <Text style={styles.publishCourseBtnText}>Publish to Chamber Portal  →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Functions Menu Dropdown / Slide-down Modal */}
      <FunctionsMenuModal
        visible={functionsMenuVisible}
        onClose={() => setFunctionsMenuVisible(false)}
        onSelectFunction={(mod) => onNavigateToModule(mod)}
        activeFunction="Dashboard"
      />
    </View>
  );
};

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBarSpacer: {
    height: STATUSBAR_HEIGHT,
    backgroundColor: '#FFFFFF',
    width: '100%',
  },
  mainScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeaderWrapper: {
    position: 'relative',
    backgroundColor: '#D5E5FE',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
  },
  headerBackgroundImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: WAVE_WIDTH,
    height: WAVE_HEIGHT,
  },
  topHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  headerLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  moreOptionsButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  ringsContainer: {
    width: 36,
    height: 24,
    position: 'relative',
    marginRight: 10,
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  ringCyan: {
    borderColor: '#06B6D4',
    left: 0,
  },
  ringGreen: {
    borderColor: '#10B981',
    right: 0,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    letterSpacing: -0.2,
  },
  brandTagline: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    marginTop: 1.5,
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },

  // Greeting
  userGreetingCard: {
    marginBottom: 14,
  },
  greetingLeft: {
    width: '100%',
  },
  greetingTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    letterSpacing: -0.3,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  greetingWave: {
    fontSize: 20,
    fontWeight: 'normal',
  },
  avatarWrapper: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },

  // Banner Carousel (White outer container with rounded corners and soft shadow)
  bannerWrapper: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  bannerInner: {
    width: '100%',
    borderRadius: 17,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: (width - 32) * (480 / 1024),
  },

  // KPI Grid (Height reduced ~22%, equal dimensions, clean spacing)
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  kpiCard: {
    width: (width - 32 - 10) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  kpiValue: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    letterSpacing: -0.3,
    lineHeight: 23,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    marginTop: 1,
    lineHeight: 14,
  },
  kpiGrowth: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    marginTop: 3,
    lineHeight: 14,
  },

  // Section General
  sectionContainer: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    letterSpacing: -0.2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    textAlign: 'center',
    lineHeight: 14,
  },

  // Categories
  categoriesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#334155',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    textAlign: 'center',
    lineHeight: 12.5,
  },

  // My Requests List
  requestsList: {
    gap: 10,
  },
  requestItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  requestIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestTextCol: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
  },
  requestSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    marginTop: 2,
  },
  requestChevron: {
    fontSize: 22,
    color: '#94A3B8',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    fontWeight: '300',
    marginRight: 4,
  },

  // Upcoming Meetings Section
  meetingsList: {
    gap: 10,
  },
  meetingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  meetingDateBadge: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  meetingDateMonth: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
  },
  meetingDateDay: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    marginTop: -2,
  },
  meetingContentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  meetingTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    marginBottom: 4,
  },
  meetingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingMetaText: {
    fontSize: 11.5,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
  },
  meetingMetaDivider: {
    fontSize: 11,
    color: '#CBD5E1',
    marginHorizontal: 8,
    fontFamily: fontSansSerif,
  },
  meetingActionCol: {
    paddingLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  meetingChevron: {
    fontSize: 24,
    color: '#64748B',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
    fontWeight: '300',
  },

  meetingStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillConfirmed: {
    backgroundColor: '#DCFCE7',
  },
  statusTextConfirmed: {
    color: '#15803D',
  },
  statusPillScheduled: {
    backgroundColor: '#EFF6FF',
  },
  statusTextScheduled: {
    color: '#2563EB',
  },
  meetingStatusText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
  },

  // Meeting Details Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailsModalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  detailsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
  },
  modalStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  modalTypeText: {
    fontSize: 11.5,
    color: '#64748B',
    marginLeft: 6,
    fontFamily: fontSansSerif,
    fontStyle: 'normal',
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
    padding: 4,
    fontFamily: fontSansSerif,
  },
  detailsModalBody: {
    gap: 10,
    marginBottom: 18,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    width: '38%',
    fontFamily: fontSansSerif,
  },
  infoValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0F172A',
    width: '62%',
    textAlign: 'right',
    fontFamily: fontSansSerif,
  },
  modalButtonRow: {
    marginTop: 4,
  },
  modalJoinBtn: {
    height: 48,
    backgroundColor: '#0C4E3D',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalJoinBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },

  // Student Recommended Courses Styles (Reference Image 5)
  coursesScrollList: {
    paddingRight: 16,
    gap: 12,
  },
  courseCard: {
    width: Math.max((width - 44) / 2, 172),
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  courseThumbContainer: {
    width: '100%',
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  courseThumbImage: {
    width: '100%',
    height: '100%',
  },
  courseRecordedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  courseRecordedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: fontSansSerif,
  },
  courseCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    lineHeight: 18,
    fontFamily: fontSansSerif,
    height: 36,
  },
  courseCardMentor: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
    fontFamily: fontSansSerif,
  },
  courseCardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  courseCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
  },
  courseCardMetaText: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: fontSansSerif,
  },
  courseCardChevron: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '400',
    fontFamily: fontSansSerif,
    marginTop: -2,
  },

  // Student Connections & Mentors Styles (Reference Image 5)
  studentMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  studentMetricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'flex-start',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  studentMetricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  studentMetricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
    fontFamily: fontSansSerif,
    letterSpacing: -0.2,
  },
  studentMetricLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
    fontFamily: fontSansSerif,
  },
  studentMetricActionText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 8,
    fontFamily: fontSansSerif,
  },

  // Student Course Details Modal Styles
  courseDetailsModalCard: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  courseDetailsModalHeader: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#F1F5F9',
  },
  courseModalThumbBox: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  courseModalThumbImage: {
    width: '100%',
    height: '100%',
  },
  courseModalCloseBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  courseModalBody: {
    padding: 16,
  },
  courseModalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  courseModalMentor: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
    fontFamily: fontSansSerif,
  },
  courseModalPillRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    marginBottom: 12,
  },
  courseMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  courseMetaBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  courseSectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  courseModalDescription: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    fontFamily: fontSansSerif,
  },
  courseTopicsList: {
    marginTop: 6,
    gap: 4,
  },
  courseTopicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  courseTopicCheck: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  courseTopicText: {
    fontSize: 11.5,
    color: '#334155',
    flex: 1,
    fontFamily: fontSansSerif,
    lineHeight: 16,
  },
  courseModalFooter: {
    padding: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  startCourseBtn: {
    height: 46,
    backgroundColor: '#2563EB',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCourseBtnText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },

  // Mentor Greeting Badges
  greetingBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  premiumMentorBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  premiumMentorBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: fontSansSerif,
  },
  activeMembershipBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  activeMembershipBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: fontSansSerif,
  },

  // Mentor Banner Card (Exact match with reference image)
  mentorBannerCard: {
    width: width - 32,
    height: (width - 32) * (480 / 1024),
    borderRadius: 20,
    overflow: 'hidden',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#0F172A',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  mentorBannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  mentorBannerOverlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 41, 74, 0.45)',
  },
  mentorBannerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 23,
    fontFamily: fontSansSerif,
    letterSpacing: -0.3,
  },
  mentorBannerSubtitle: {
    fontSize: 11,
    color: '#E2E8F0',
    marginTop: 4,
    fontFamily: fontSansSerif,
    lineHeight: 15,
  },
  exploreSessionsBtn: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6.5,
    borderRadius: 16,
    marginTop: 10,
  },
  exploreSessionsBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  mentorPaginationDots: {
    position: 'absolute',
    right: 14,
    bottom: 12,
    flexDirection: 'row',
    gap: 4.5,
    alignItems: 'center',
  },
  mentorDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  mentorDotActive: {
    width: 7.5,
    height: 7.5,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  // Mentor Published Badge on Course Card
  coursePublishedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
  },
  coursePublishedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    fontFamily: fontSansSerif,
  },

  // Upload Course Modal
  uploadModalCard: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  uploadModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  uploadModalTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  uploadFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 6,
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginTop: 2,
    marginBottom: 10,
    fontFamily: fontSansSerif,
  },
  publishCourseBtn: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  publishCourseBtnText: {
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
    marginTop: 6,
    marginBottom: 12,
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
    fontFamily: fontSansSerif,
  },
  emptySub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 17,
    fontFamily: fontSansSerif,
  },
});
