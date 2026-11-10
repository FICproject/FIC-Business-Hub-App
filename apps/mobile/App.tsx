import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, StatusBar, BackHandler } from 'react-native';
import { colors } from './src/theme';
import { AuthProvider, useAuth } from './src/state/AuthContext';
import { NotificationProvider, notify } from './src/components/common/NotificationContext';
import { StudentMentorProvider, useStudentMentor } from './src/state/StudentMentorContext';
import { WalletReferralProvider } from './src/state/WalletReferralContext';
import { SplashScreen } from './src/features/onboarding/SplashScreen';
import { OnboardingWelcomeScreen } from './src/features/onboarding/OnboardingWelcomeScreen';
import { OnboardingOpportunitiesScreen } from './src/features/onboarding/OnboardingOpportunitiesScreen';
import { OnboardingNetworkScreen } from './src/features/onboarding/OnboardingNetworkScreen';
import { OnboardingPlanScreen } from './src/features/onboarding/OnboardingPlanScreen';
import { AuthScreen } from './src/features/auth/AuthScreen';
import { RegistrationScreen } from './src/features/registration/RegistrationScreen';
import { DashboardScreen } from './src/features/dashboard/DashboardScreen';
import { MarketplaceScreen } from './src/features/marketplace/MarketplaceScreen';
import { MyRequestsScreen } from './src/features/my-requests/MyRequestsScreen';
import { BusinessIdeasScreen } from './src/features/business-ideas/BusinessIdeasScreen';
import { ScalingScreen } from './src/features/scaling/ScalingScreen';
import { InvestmentScreen } from './src/features/investment/InvestmentScreen';
import { MeetingsScreen } from './src/features/meetings/MeetingsScreen';
import { SkillDevelopmentScreen } from './src/features/skill-development/SkillDevelopmentScreen';
import { MyServicesScreen } from './src/features/my-services/MyServicesScreen';
import { NotificationsScreen } from './src/features/notifications/NotificationsScreen';
import { ProfileScreen } from './src/features/profile/ProfileScreen';
import { MembershipPaymentsScreen } from './src/features/membership/MembershipPaymentsScreen';
import { membershipNotificationService } from './src/services/membershipNotificationService';
import { BottomNavBar, TabKey } from './src/navigation/BottomNavBar';
import { FCMService } from './src/services/FCMService';

type FlowState = 'SPLASH' | 'ONBOARDING_1' | 'ONBOARDING_2' | 'ONBOARDING_3' | 'ONBOARDING_4' | 'AUTH';

interface NavState {
  tab: TabKey;
  subModule: string | null;
}

const MobileAppContent: React.FC = () => {
  const { isAuthenticated, logout, login, user } = useAuth();
  const { notifications } = useStudentMentor();
  const [membershipUnreadCount, setMembershipUnreadCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    const syncCount = async () => {
      try {
        const count = await membershipNotificationService.getUnreadCount();
        if (isMounted) setMembershipUnreadCount(count);
      } catch {
        if (isMounted) setMembershipUnreadCount(0);
      }
    };
    syncCount();
    const unsubService = membershipNotificationService.subscribe(syncCount);
    const unsubFCM = FCMService.onMessageReceived(() => syncCount());
    return () => {
      isMounted = false;
      unsubService();
      unsubFCM();
    };
  }, []);

  const unreadNotifCount = notifications.filter((n) => !n.read).length + membershipUnreadCount;

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

  // Onboarding & Auth flow state
  const [flowState, setFlowState] = useState<FlowState>('SPLASH');
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Dashboard navigation state
  const [currentTab, setCurrentTab] = useState<TabKey>('Home');
  const [activeSubModule, setActiveSubModule] = useState<string | null>(null);
  const [navHistory, setNavHistory] = useState<NavState[]>([]);
  const [marketplaceCategory, setMarketplaceCategory] = useState<string>('All');

  // Exit App Confirmation Dialog (Reusing existing notification & confirm dialog)
  const showExitConfirmation = useCallback(() => {
    notify.confirm({
      title: 'Exit Application',
      message: 'Are you sure you want to exit FIC Business Hub?',
      confirmText: 'Exit App',
      cancelText: 'Stay',
      isDestructive: true,
      onConfirm: () => {
        BackHandler.exitApp();
      },
    });
  }, []);

  // Central Android System Back Button & Gesture Handling
  useEffect(() => {
    const handleHardwareBack = () => {
      // 1. Unauthenticated onboarding / auth flow
      if (!isAuthenticated) {
        if (flowState === 'SPLASH') {
          return true;
        }
        if (flowState === 'ONBOARDING_1') {
          showExitConfirmation();
          return true;
        }
        if (flowState === 'ONBOARDING_2') {
          setFlowState('ONBOARDING_1');
          return true;
        }
        if (flowState === 'ONBOARDING_3') {
          setFlowState('ONBOARDING_2');
          return true;
        }
        if (flowState === 'ONBOARDING_4') {
          setFlowState('ONBOARDING_3');
          return true;
        }
        if (flowState === 'AUTH') {
          if (authView === 'REGISTER') {
            setAuthView('LOGIN');
            return true;
          }
          setFlowState('ONBOARDING_1');
          return true;
        }
        return true;
      }

      // 2. Authenticated user navigation
      // Step A: If inside an active sub-module (e.g. Business Ideas, Scaling, Investment, My Services, Skill Development)
      if (activeSubModule !== null) {
        if (navHistory.length > 0) {
          const prev = navHistory[navHistory.length - 1];
          setNavHistory((h) => h.slice(0, -1));
          setCurrentTab(prev.tab);
          setActiveSubModule(prev.subModule);
        } else {
          setActiveSubModule(null);
        }
        return true;
      }

      // Step B: If on any tab other than Home
      if (currentTab !== 'Home') {
        if (navHistory.length > 0) {
          const prev = navHistory[navHistory.length - 1];
          setNavHistory((h) => h.slice(0, -1));
          setCurrentTab(prev.tab);
          setActiveSubModule(prev.subModule);
        } else {
          setCurrentTab('Home');
        }
        return true;
      }

      // Step C: On the main Home dashboard (currentTab === 'Home' && activeSubModule === null)
      showExitConfirmation();
      return true;
    };

    const backSub = BackHandler.addEventListener('hardwareBackPress', handleHardwareBack);
    return () => backSub.remove();
  }, [
    isAuthenticated,
    flowState,
    authView,
    activeSubModule,
    currentTab,
    navHistory,
    showExitConfirmation,
  ]);

  // Navigate helper that properly maintains stack history
  const navigateTo = useCallback(
    (targetTab: TabKey, targetSubModule: string | null = null, params?: any) => {
      if (params?.category) {
        setMarketplaceCategory(params.category);
      }
      if (currentTab === targetTab && activeSubModule === targetSubModule) {
        return;
      }
      if (targetTab === 'Home' && targetSubModule === null) {
        setNavHistory([]);
        setCurrentTab('Home');
        setActiveSubModule(null);
      } else {
        setNavHistory((prev) => [
          ...prev,
          { tab: currentTab, subModule: activeSubModule },
        ]);
        setCurrentTab(targetTab);
        setActiveSubModule(targetSubModule);
      }
    },
    [currentTab, activeSubModule]
  );

  // Navigation handler supporting all 8 platform functions + direct shortcuts & category parameters
  const handleNavigateToModule = useCallback(
    (mod: string, params?: { category?: string } | any) => {
      let targetCategory: string | undefined = params?.category;

      let cleanMod = mod;
      if (mod.startsWith('Marketplace:') || mod.startsWith('Services:')) {
        const parts = mod.split(':');
        cleanMod = parts[0];
        targetCategory = parts[1];
      }

      if (targetCategory) {
        setMarketplaceCategory(targetCategory);
      } else if (cleanMod === 'Marketplace' || cleanMod === 'Services') {
        if (!params || params.category === undefined) {
          setMarketplaceCategory('All');
        }
      }

      switch (cleanMod) {
        case 'Dashboard':
        case 'Home':
          navigateTo('Home', null);
          break;
        case 'Marketplace':
        case 'Services':
          navigateTo('Services', null, { category: targetCategory || 'All' });
          break;
        case 'My Requests':
        case 'Requests':
          navigateTo('Requests', null);
          break;
        case 'Meetings':
        case 'Connections':
          navigateTo('Connections', null);
          break;
        case 'Business Ideas':
          navigateTo(currentTab, 'Business Ideas');
          break;
        case 'Scaling':
          navigateTo(currentTab, 'Scaling');
          break;
        case 'Investment':
          navigateTo(currentTab, 'Investment');
          break;
        case 'My Services':
          navigateTo(currentTab, isStudent ? 'Skill Development' : 'My Services');
          break;
        case 'Skill Development':
          navigateTo(currentTab, 'Skill Development');
          break;
        case 'Notifications':
          navigateTo('Notifications', null);
          break;
        case 'Profile':
          navigateTo('Profile', null);
          break;
        case 'Membership & Payments':
        case 'Membership':
        case 'Payments':
          navigateTo(currentTab, 'Membership & Payments');
          break;
        case 'Sessions':
          navigateTo(isMentor ? 'Sessions' : 'Connections', null);
          break;
        case 'Students':
          navigateTo(isMentor ? 'Students' : 'Connections', null);
          break;
        case 'Courses':
          navigateTo(isMentor ? 'Courses' : 'Services', null);
          break;
        default:
          navigateTo(currentTab, cleanMod);
      }
    },
    [currentTab, isMentor, isStudent, navigateTo]
  );

  // Firebase Cloud Messaging (FCM) Integration - must run unconditionally across all render passes
  useEffect(() => {
    // 1. Request notification permission (Android 13+ POST_NOTIFICATIONS)
    FCMService.requestPermission().then((granted) => {
      console.log('[FCM] Notification Permission Granted:', granted);
    });

    // 2. Fetch and register device FCM token
    FCMService.getDeviceToken().then((token) => {
      if (token) {
        console.log('[FCM] Active Device Token:', token);
      }
    });

    // 2b. Initialize Automatic Membership Expiry Reminders Schedule
    membershipNotificationService.scheduleReminders('05 Nov 2027', 'FIC Enterprise Membership');

    // 3. Listen for token rotations
    const unsubscribeTokenRefresh = FCMService.onTokenRefresh((newToken) => {
      console.log('[FCM] Token refreshed:', newToken);
    });

    // 4. Handle incoming notification when app is in foreground
    const unsubscribeMessage = FCMService.onMessageReceived((payload) => {
      console.log('[FCM] Message received in foreground:', payload);
      notify.toast(payload.body, 'info', payload.title);
    });

    // 5. Handle notification opened by user tap (background to foreground)
    const unsubscribeOpened = FCMService.onNotificationOpened((payload) => {
      console.log('[FCM] Notification tapped by user:', payload);
      const targetScreen = payload.data?.screen || payload.data?.module;
      if (targetScreen) {
        handleNavigateToModule(targetScreen);
      }
    });

    // 6. Handle cold-start from notification tap (app was closed/killed)
    FCMService.getInitialNotification().then((payload) => {
      if (payload) {
        const targetScreen = payload.data?.screen || payload.data?.module;
        if (targetScreen) {
          handleNavigateToModule(targetScreen);
        }
      }
    });

    return () => {
      unsubscribeTokenRefresh();
      unsubscribeMessage();
      unsubscribeOpened();
    };
  }, [handleNavigateToModule]);

  if (!isAuthenticated) {
    if (flowState === 'SPLASH') {
      return (
        <SplashScreen
          onFinish={() => setFlowState('ONBOARDING_1')}
        />
      );
    }

    if (flowState === 'ONBOARDING_1') {
      return (
        <OnboardingWelcomeScreen
          onNext={() => setFlowState('ONBOARDING_2')}
          onLogin={() => {
            setAuthView('LOGIN');
            setFlowState('AUTH');
          }}
          onSkip={() => {
            setAuthView('LOGIN');
            setFlowState('AUTH');
          }}
        />
      );
    }

    if (flowState === 'ONBOARDING_2') {
      return (
        <OnboardingOpportunitiesScreen
          onNext={() => setFlowState('ONBOARDING_3')}
          onSkip={() => {
            setAuthView('LOGIN');
            setFlowState('AUTH');
          }}
        />
      );
    }

    if (flowState === 'ONBOARDING_3') {
      return (
        <OnboardingNetworkScreen
          onNext={() => setFlowState('ONBOARDING_4')}
          onSkip={() => {
            setAuthView('LOGIN');
            setFlowState('AUTH');
          }}
        />
      );
    }

    if (flowState === 'ONBOARDING_4') {
      return (
        <OnboardingPlanScreen
          onBack={() => setFlowState('ONBOARDING_3')}
          onContinueRegistration={() => {
            setAuthView('REGISTER');
            setFlowState('AUTH');
          }}
        />
      );
    }

    // flowState === 'AUTH'
    if (authView === 'REGISTER') {
      return (
        <RegistrationScreen
          onBackToLogin={() => setAuthView('LOGIN')}
          onRegistrationComplete={(userData) => {
            const userSubLower = userData?.subCategory?.toLowerCase() || '';
            const isMentorUser =
              userData?.role === 'MENTOR' ||
              userSubLower === 'mentor' ||
              userSubLower === 'mentor / trainer' ||
              userSubLower === 'mentor/trainer' ||
              userSubLower === 'trainer' ||
              userSubLower === 'teacher' ||
              userSubLower === 'professor' ||
              userSubLower === 'teacher / professor' ||
              userSubLower === 'teacher/professor';
            const isStudentUser =
              !isMentorUser &&
              (userData?.role === 'STUDENT' ||
                userSubLower === 'student');
            const role = isMentorUser ? 'MENTOR' : isStudentUser ? 'STUDENT' : ((userData?.role as any) || 'MSME');
            login(role, {
              fullName: userData?.fullName || 'Member',
              category: userData?.category || 'Education & Knowledge',
              subcategory: userData?.subCategory || (isMentorUser ? 'Mentor / Trainer' : isStudentUser ? 'Student' : 'Startup Founder'),
              role,
              dob: userData?.dob,
              streetAddress: userData?.streetAddress,
              stateRegion: userData?.stateRegion,
              district: userData?.district,
              city: userData?.city,
              pincode: userData?.pincode,
              categoryDocNumber: userData?.categoryDocNumber,
            });
            setCurrentTab('Home');
          }}
        />
      );
    }
    return (
      <AuthScreen
        onNavigateToRegistration={() => setAuthView('REGISTER')}
        onLoginSuccess={() => setCurrentTab('Home')}
      />
    );
  }

  // Render main tab views or active sub-module with persistent bottom navigation bar
  const renderTabContent = () => {
    if (activeSubModule) {
      switch (activeSubModule) {
        case 'Business Ideas':
          return (
            <BusinessIdeasScreen
              onBack={() => setActiveSubModule(null)}
              onNavigateToModule={handleNavigateToModule}
            />
          );
        case 'Scaling':
          return (
            <ScalingScreen
              onBack={() => setActiveSubModule(null)}
              onNavigateToModule={handleNavigateToModule}
            />
          );
        case 'Investment':
          return (
            <InvestmentScreen
              onBack={() => setActiveSubModule(null)}
              onNavigateToModule={handleNavigateToModule}
            />
          );
        case 'Meetings':
          return (
            <MeetingsScreen
              onBack={() => setActiveSubModule(null)}
              onNavigateToModule={handleNavigateToModule}
            />
          );
        case 'My Services':
          return (
            <MyServicesScreen
              onBack={() => setActiveSubModule(null)}
              onNavigateToModule={handleNavigateToModule}
            />
          );
        case 'Skill Development':
          return (
            <SkillDevelopmentScreen
              onBack={() => setActiveSubModule(null)}
              onNavigateToModule={handleNavigateToModule}
            />
          );
        case 'Membership & Payments':
        case 'Membership':
          return (
            <MembershipPaymentsScreen
              onBack={() => setActiveSubModule(null)}
              onNavigateToModule={handleNavigateToModule}
            />
          );
      }
    }

    switch (currentTab) {
      case 'Home':
        return (
          <DashboardScreen
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Services':
      case 'Marketplace':
        return (
          <MarketplaceScreen
            initialSector={marketplaceCategory}
            onBack={() => {
              if (navHistory.length > 0) {
                const prev = navHistory[navHistory.length - 1];
                setNavHistory((h) => h.slice(0, -1));
                setCurrentTab(prev.tab);
                setActiveSubModule(prev.subModule);
              } else {
                setCurrentTab('Home');
              }
            }}
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Requests':
        return (
          <MyRequestsScreen
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Connections':
        return (
          <MeetingsScreen
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Notifications':
        return (
          <NotificationsScreen
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Profile':
        return (
          <ProfileScreen
            onLogout={logout}
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Sessions':
        return (
          <MeetingsScreen
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Students':
        return (
          <MeetingsScreen
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        );
      case 'Courses':
        return isMentor ? (
          <MyServicesScreen
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        ) : (
          <SkillDevelopmentScreen
            onBack={() => setCurrentTab('Home')}
            onNavigateToModule={handleNavigateToModule}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
        translucent={true}
      />
      <View style={styles.contentArea}>{renderTabContent()}</View>
      <BottomNavBar
        currentTab={currentTab}
        isMentor={isMentor}
        onSelectTab={(tab) => {
          if (tab === 'Services') {
            setMarketplaceCategory('All');
          }
          navigateTo(tab, null);
        }}
        unreadCount={unreadNotifCount}
      />
    </View>
  );
};

export default function App(): React.JSX.Element {
  return (
    <NotificationProvider>
      <AuthProvider>
        <StudentMentorProvider>
          <WalletReferralProvider>
            <MobileAppContent />
          </WalletReferralProvider>
        </StudentMentorProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  contentArea: {
    flex: 1,
  },
});
