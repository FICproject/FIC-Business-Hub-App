import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
  BackHandler,
  Easing,
} from 'react-native';
import { useAuth } from '../../state/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

// Sidebar covers approximately 74% of the screen width, matching the reference image
const DRAWER_WIDTH = Math.min(Math.round(SCREEN_WIDTH * 0.74), 320);

export interface FunctionItem {
  id: string;
  name: string;
  subtitle: string;
  badge?: string;
  bgColor: string;
  iconColor: string;
  iconType:
    | 'dashboard'
    | 'marketplace'
    | 'ideas'
    | 'scaling'
    | 'investment'
    | 'meetings'
    | 'requests'
    | 'services'
    | 'skills';
}

export const FUNCTIONS_LIST: FunctionItem[] = [
  {
    id: 'Dashboard',
    name: 'Dashboard',
    subtitle: 'KPIs & Overview',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
    iconType: 'dashboard',
  },
  {
    id: 'Marketplace',
    name: 'Marketplace',
    subtitle: 'Verified B2B Services',
    bgColor: '#ECFDF5',
    iconColor: '#059669',
    iconType: 'marketplace',
  },
  {
    id: 'Business Ideas',
    name: 'Business Ideas',
    subtitle: 'Stage 0  -  1 Incubation',
    bgColor: '#FEF3C7',
    iconColor: '#D97706',
    iconType: 'ideas',
  },
  {
    id: 'Scaling',
    name: 'Scaling',
    subtitle: 'Stage 1  -  10 Diagnostics',
    bgColor: '#F5F3FF',
    iconColor: '#7C3AED',
    iconType: 'scaling',
  },
  {
    id: 'Investment',
    name: 'Investment',
    subtitle: 'Private Deal Room',
    bgColor: '#ECFDF5',
    iconColor: '#059669',
    iconType: 'investment',
  },
  {
    id: 'Meetings',
    name: 'Meetings',
    subtitle: 'Facilitated Chambers',
    bgColor: '#EFF6FF',
    iconColor: '#1D4ED8',
    iconType: 'meetings',
  },
  {
    id: 'My Requests',
    name: 'My Requests',
    subtitle: 'Chamber Request & Status',
    bgColor: '#EFF6FF',
    iconColor: '#2563EB',
    iconType: 'requests',
  },
  {
    id: 'My Services',
    name: 'My Services',
    subtitle: 'Provider & Studio',
    bgColor: '#FDF2F8',
    iconColor: '#DB2777',
    iconType: 'services',
  },
];

// Clean vector chevron right icon
const ChevronRightIcon: React.FC<{ color: string }> = ({ color }) => (
  <View style={{ width: 12, height: 12, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 6,
        height: 6,
        borderTopWidth: 1.8,
        borderRightWidth: 1.8,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }}
    />
  </View>
);

// Red Logout Vector Icon (Door + Right Arrow)
const LogoutVectorIcon: React.FC<{ color?: string }> = ({ color = '#DC2626' }) => (
  <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center', marginRight: 8 }}>
    {/* Door Frame */}
    <View
      style={{
        position: 'absolute',
        left: 2,
        width: 9,
        height: 14,
        borderTopWidth: 1.8,
        borderBottomWidth: 1.8,
        borderLeftWidth: 1.8,
        borderTopLeftRadius: 2.5,
        borderBottomLeftRadius: 2.5,
        borderColor: color,
      }}
    />
    {/* Right-pointing Arrow */}
    <View style={{ flexDirection: 'row', alignItems: 'center', position: 'absolute', right: 1 }}>
      <View style={{ width: 8, height: 1.8, backgroundColor: color }} />
      <View
        style={{
          width: 5,
          height: 5,
          borderTopWidth: 1.8,
          borderRightWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: -3,
        }}
      />
    </View>
  </View>
);

// Profile Vector Icon (User Head & Torso)
const ProfileVectorIcon: React.FC<{ color?: string }> = ({ color = '#2563EB' }) => (
  <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
    {/* Head */}
    <View
      style={{
        width: 7.5,
        height: 7.5,
        borderRadius: 3.75,
        borderWidth: 1.6,
        borderColor: color,
        marginBottom: 1.5,
      }}
    />
    {/* Shoulders / Torso */}
    <View
      style={{
        width: 14,
        height: 5.5,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderWidth: 1.6,
        borderColor: color,
        borderBottomWidth: 0,
      }}
    />
  </View>
);

// High-fidelity vector icons matching the reference image pixel by pixel
const FunctionIcon: React.FC<{ type: FunctionItem['iconType']; color: string }> = ({
  type,
  color,
}) => {
  switch (type) {
    case 'dashboard':
      return (
        <View style={{ width: 17, height: 17, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: color }} />
            <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: color }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: color }} />
            <View style={{ width: 7, height: 7, borderRadius: 2, backgroundColor: color }} />
          </View>
        </View>
      );
    case 'marketplace':
      return (
        <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 11,
              height: 4.5,
              borderTopLeftRadius: 2.5,
              borderTopRightRadius: 2.5,
              borderWidth: 1.5,
              borderColor: color,
              borderBottomWidth: 0,
            }}
          />
          <View
            style={{
              width: 15,
              height: 10,
              borderRadius: 2.5,
              backgroundColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 5, height: 1.4, backgroundColor: '#FFFFFF', borderRadius: 0.7 }} />
          </View>
        </View>
      );
    case 'ideas':
      return (
        <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 13,
              height: 13,
              borderRadius: 6.5,
              borderWidth: 1.8,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 4.5, height: 4.5, borderRadius: 2.25, backgroundColor: color }} />
          </View>
          <View
            style={{
              width: 6,
              height: 2.5,
              backgroundColor: color,
              borderBottomLeftRadius: 1.2,
              borderBottomRightRadius: 1.2,
              marginTop: 0.8,
            }}
          />
        </View>
      );
    case 'scaling':
      return (
        <View style={{ width: 18, height: 17, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center' }}>
          <View style={{ width: 3.8, height: 6, backgroundColor: color, borderRadius: 1.2, marginRight: 2 }} />
          <View style={{ width: 3.8, height: 10.5, backgroundColor: color, borderRadius: 1.2, marginRight: 2 }} />
          <View style={{ width: 3.8, height: 15, backgroundColor: color, borderRadius: 1.2 }} />
        </View>
      );
    case 'skills':
      return (
        <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          {/* Graduation Cap Diamond / Mortarboard Top */}
          <View
            style={{
              width: 14,
              height: 7,
              backgroundColor: color,
              borderRadius: 1.5,
              marginBottom: 1.5,
            }}
          />
          {/* Cap Base Arch */}
          <View
            style={{
              width: 8,
              height: 4,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
              backgroundColor: color,
            }}
          />
        </View>
      );
    case 'investment':
      return (
        <View
          style={{
            width: 19,
            height: 19,
            borderRadius: 9.5,
            borderWidth: 1.6,
            borderColor: color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 10.5,
              fontWeight: '900',
              color: color,
              fontFamily: fontSansSerif,
              marginTop: Platform.OS === 'android' ? -1.2 : -0.8,
            }}
          >
            ₹
          </Text>
        </View>
      );
    case 'meetings':
      return (
        <View
          style={{
            width: 17,
            height: 15.5,
            borderRadius: 3,
            borderWidth: 1.5,
            borderColor: color,
            paddingTop: 3,
            alignItems: 'center',
          }}
        >
          <View style={{ width: 13, height: 1.4, backgroundColor: color, marginBottom: 2 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: 11 }}>
            <View style={{ width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: color }} />
            <View style={{ width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: color }} />
            <View style={{ width: 1.8, height: 1.8, borderRadius: 0.9, backgroundColor: color }} />
          </View>
        </View>
      );
    case 'requests':
      return (
        <View
          style={{
            width: 15,
            height: 17.5,
            borderRadius: 3,
            borderWidth: 1.5,
            borderColor: color,
            paddingHorizontal: 2,
            paddingVertical: 3,
            justifyContent: 'space-between',
          }}
        >
          <View style={{ width: 6.5, height: 1.5, backgroundColor: color, borderRadius: 0.8 }} />
          <View style={{ width: 8.5, height: 1.5, backgroundColor: color, borderRadius: 0.8 }} />
          <View style={{ width: 5.5, height: 1.5, backgroundColor: color, borderRadius: 0.8 }} />
        </View>
      );
    case 'services':
      return (
        <View style={{ width: 18, height: 17, alignItems: 'center', justifyContent: 'center' }}>
          <View
            style={{
              width: 8,
              height: 3,
              borderTopLeftRadius: 1.8,
              borderTopRightRadius: 1.8,
              borderWidth: 1.4,
              borderColor: color,
              borderBottomWidth: 0,
            }}
          />
          <View
            style={{
              width: 16,
              height: 11,
              borderRadius: 3,
              borderWidth: 1.6,
              borderColor: color,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ width: 4.5, height: 1.8, backgroundColor: color, borderRadius: 0.8 }} />
          </View>
        </View>
      );
  }
};

export interface FunctionsMenuModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectFunction: (functionId: string) => void;
  activeFunction?: string;
  onLogout?: () => void;
}

export const FunctionsMenuModal: React.FC<FunctionsMenuModalProps> = ({
  visible,
  onClose,
  onSelectFunction,
  activeFunction = 'Dashboard',
  onLogout,
}) => {
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const subLower = (user?.subcategory || (user as any)?.subCategory || '').toLowerCase();
  const userCategory = user?.category || '';
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
      (userCategory === 'Education & Knowledge' && subLower === 'student'));

  const functionsList: FunctionItem[] = useMemo(() => {
    if (isStudent) {
      return FUNCTIONS_LIST.map((item) => {
        if (item.id === 'Scaling') {
          return {
            id: 'Skill Development',
            name: 'Skill Development',
            subtitle: 'Courses & Masterclasses',
            bgColor: '#F5F3FF',
            iconColor: '#7C3AED',
            iconType: 'skills' as const,
          };
        }
        return item;
      }).filter((item) => item.id !== 'My Services');
    }
    return FUNCTIONS_LIST;
  }, [isStudent]);

  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateX, overlayOpacity]);

  const handleClose = useCallback(() => {
    if (showLogoutConfirm) {
      setShowLogoutConfirm(false);
      return;
    }
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onClose, translateX, overlayOpacity, showLogoutConfirm]);

  // Handle hardware back press while sidebar is visible
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showLogoutConfirm) {
        setShowLogoutConfirm(false);
        return true;
      }
      handleClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, handleClose, showLogoutConfirm]);

  const handleSelect = (id: string) => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      setTimeout(() => {
        onSelectFunction(id);
      }, 50);
    });
  };

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      logout();
      if (onLogout) {
        onLogout();
      }
    });
  };

  const isItemActive = (itemId: string, itemName: string): boolean => {
    if (!activeFunction) return false;
    const activeLower = activeFunction.toLowerCase().trim();
    const idLower = itemId.toLowerCase().trim();
    const nameLower = itemName.toLowerCase().trim();

    if (idLower === activeLower || nameLower === activeLower) return true;
    if ((activeLower === 'home' || activeLower === 'dashboard') && idLower === 'dashboard') return true;
    if ((activeLower === 'services' || activeLower === 'marketplace') && idLower === 'marketplace') return true;
    if ((activeLower === 'requests' || activeLower === 'my requests') && idLower === 'my requests') return true;
    if ((activeLower === 'connections' || activeLower === 'meetings' || activeLower === 'sessions') && idLower === 'meetings') return true;
    if ((activeLower === 'my services' || activeLower === 'skill development' || activeLower === 'courses') && (idLower === 'my services' || idLower === 'skill development')) return true;
    if (activeLower === 'profile' && (idLower === 'profile' || nameLower === 'profile')) return true;
    return false;
  };

  if (!visible) {
    return null;
  }

  const statusBarHeight = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <View style={styles.modalRoot}>
          {/* Semi-transparent dark overlay covering the background */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]} />
          </TouchableWithoutFeedback>

          {/* Sliding Left Sidebar */}
          <Animated.View
            style={[
              styles.sidebarContainer,
              {
                top: statusBarHeight,
                transform: [{ translateX }],
              },
            ]}
          >
            {/* Top Container: Header + 8 Functions (Fits on one screen without scrolling) */}
            <View style={styles.topSection}>
              {/* Sidebar Header */}
              <View style={styles.sidebarHeader}>
                <View style={styles.headerTopRow}>
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>FIC HUB NAVIGATION</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeBtn}
                    activeOpacity={0.7}
                    onPress={handleClose}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    accessibilityLabel="Close Navigation Sidebar"
                  >
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.headerTitle}>Platform Functions</Text>
                <Text style={styles.headerSubtitle}>
                  {`Select any of the ${functionsList.length} business & advisory modules`}
                </Text>
              </View>

              {/* Subtle horizontal divider line */}
              <View style={styles.headerDivider} />

              {/* 8 Functions Displayed Vertically One Below Another without scrolling */}
              <View style={styles.functionsContainer}>
                {functionsList.map((item) => {
                  const isActive = isItemActive(item.id, item.name);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.functionCard,
                        isActive ? styles.functionCardActive : styles.functionCardInactive,
                      ]}
                      activeOpacity={0.75}
                      onPress={() => handleSelect(item.id)}
                    >
                      <View style={styles.cardLeftGroup}>
                        <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                          <FunctionIcon type={item.iconType} color={item.iconColor} />
                        </View>
                        <View style={styles.cardTextGroup}>
                          <Text style={styles.cardTitle} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.cardSubtitle} numberOfLines={1}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>
                      <ChevronRightIcon color={isActive ? '#2563EB' : '#94A3B8'} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Bottom Section: Profile Button + Divider + Logout Button */}
            <View style={styles.bottomSection}>
              {/* Profile Button positioned in the space directly above Logout */}
              <TouchableOpacity
                style={[
                  styles.functionCard,
                  isItemActive('Profile', 'Profile')
                    ? styles.functionCardActive
                    : styles.functionCardInactive,
                  { marginBottom: 8 },
                ]}
                activeOpacity={0.75}
                onPress={() => handleSelect('Profile')}
                accessibilityLabel="Navigate to Profile"
              >
                <View style={styles.cardLeftGroup}>
                  <View style={[styles.iconContainer, { backgroundColor: '#EFF6FF' }]}>
                    <ProfileVectorIcon color="#2563EB" />
                  </View>
                  <View style={styles.cardTextGroup}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      Profile
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                      Account & Membership
                    </Text>
                  </View>
                </View>
                <ChevronRightIcon color={isItemActive('Profile', 'Profile') ? '#2563EB' : '#94A3B8'} />
              </TouchableOpacity>

              <View style={styles.logoutDivider} />
              <TouchableOpacity
                style={styles.logoutButton}
                activeOpacity={0.8}
                onPress={() => setShowLogoutConfirm(true)}
                accessibilityLabel="Log out of FIC Business Hub"
              >
                <LogoutVectorIcon color="#DC2626" />
                <Text style={styles.logoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Custom Logout Confirmation Dialog */}
      <Modal
        visible={showLogoutConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirm(false)}
        statusBarTranslucent
      >
        <View style={styles.confirmOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowLogoutConfirm(false)}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
          <View style={styles.confirmCard}>
            {/* Red Logout Icon Badge */}
            <View style={styles.confirmIconBadge}>
              <LogoutVectorIcon color="#DC2626" />
            </View>

            <Text style={styles.confirmTitle}>Confirm Logout</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={styles.confirmButtonsRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmLogoutButton}
                activeOpacity={0.8}
                onPress={handleConfirmLogout}
              >
                <Text style={styles.confirmLogoutButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    bottom: Platform.OS === 'android' ? 12 : 28,
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 20,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topSection: {
    flexShrink: 1,
  },
  sidebarHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 2,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
    alignSelf: 'flex-start',
  },
  headerBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: fontSansSerif,
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  headerTitle: {
    fontSize: 18.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '400',
    color: '#64748B',
    fontFamily: fontSansSerif,
    lineHeight: 15,
    marginTop: 2,
  },
  headerDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  functionsContainer: {
    paddingHorizontal: 12,
  },
  functionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6.5,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginBottom: 6,
  },
  functionCardInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  functionCardActive: {
    backgroundColor: '#F0F7FF',
    borderWidth: 1.5,
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cardTextGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },
  bottomSection: {
    paddingHorizontal: 12,
    paddingBottom: Platform.OS === 'android' ? 10 : 16,
  },
  logoutDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#DC2626',
    fontFamily: fontSansSerif,
    letterSpacing: 0.2,
  },
  // Custom Confirmation Dialog Styles
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: 'center',
    elevation: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
  },
  confirmIconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 13.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  confirmLogoutButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  confirmLogoutButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
});
