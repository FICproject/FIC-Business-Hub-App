import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ConnectionsIcon,
  OpportunitiesIcon,
  PartnershipsIcon,
  IdeasIcon,
} from './OnboardingIcons';

const { width, height } = Dimensions.get('window');
const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

// Original image aspect ratio for the supplied 576 x 1024 portrait illustration
const IMG_ASPECT = 1024 / 576; // 1.7778

interface OnboardingWelcomeScreenProps {
  onNext: () => void;
  onLogin: () => void;
  onSkip: () => void;
}

export const OnboardingWelcomeScreen: React.FC<OnboardingWelcomeScreenProps> = ({
  onNext,
  onLogin,
  onSkip,
}) => {
  // Proportional sizing - moved upward directly below cards to eliminate empty sky gap
  const bannerHeight = Math.min(height * 0.40, 335);
  const imageDisplayWidth = width;
  const imageDisplayHeight = width * IMG_ASPECT;
  // Offset by ~15.5% so the top of his hair starts directly below the feature cards with minimal spacing
  const imageTopOffset = -Math.round(imageDisplayHeight * 0.155);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEE7D4" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header Row with Skip Button */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity onPress={onSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Headlines */}
        <View style={styles.headerBlock}>
          <Text style={styles.titlePrefix}>Welcome to</Text>
          <Text style={styles.titleMain}>
            FIC Business <Text style={styles.titleHighlight}>Hub</Text>
          </Text>
          <Text style={styles.subtitle}>
            One platform for business opportunities, services and growth.
          </Text>
        </View>

        {/* 2x2 Feature Grid - Equal dimensions and soft pastel backgrounds */}
        <View style={styles.featureGrid}>
          {/* Card 1: Business Connections */}
          <View style={[styles.gridCard, { backgroundColor: '#EAF6F0' }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#D4EFE2' }]}>
              <ConnectionsIcon color="#0D684D" size={17} />
            </View>
            <Text style={styles.cardLabel}>Business{'\n'}Connections</Text>
          </View>

          {/* Card 2: Opportunities */}
          <View style={[styles.gridCard, { backgroundColor: '#FFF7EB' }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FDEBC8' }]}>
              <OpportunitiesIcon color="#C88536" size={17} />
            </View>
            <Text style={styles.cardLabel}>Opportunities</Text>
          </View>

          {/* Card 3: Partnerships */}
          <View style={[styles.gridCard, { backgroundColor: '#EEF4FC' }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#D6E6F9' }]}>
              <PartnershipsIcon color="#2563EB" size={17} />
            </View>
            <Text style={styles.cardLabel}>Partnerships</Text>
          </View>

          {/* Card 4: Business Ideas */}
          <View style={[styles.gridCard, { backgroundColor: '#FDF1F1' }]}>
            <View style={[styles.iconCircle, { backgroundColor: '#FBD7D7' }]}>
              <IdeasIcon color="#DC2626" size={17} />
            </View>
            <Text style={styles.cardLabel}>Business{'\n'}Ideas</Text>
          </View>
        </View>

        {/* Professional Illustration (Image 5) - Full face, full hair & suit edge-to-edge */}
        <View style={[styles.heroImageContainer, { height: bannerHeight }]}>
          <Image
            source={require('../../assets/images/onboarding_businessman.jpg')}
            style={[
              styles.businessmanImage,
              {
                width: imageDisplayWidth,
                height: imageDisplayHeight,
                top: imageTopOffset,
              },
            ]}
            resizeMode="cover"
          />
        </View>

        {/* 4 Pagination Dots (Dot 1 active) */}
        <View style={styles.dotsRow}>
          <View style={styles.activeDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
          <View style={styles.inactiveDot} />
        </View>

        {/* Action Buttons: Get Started & Login */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.88} onPress={onNext}>
            <Text style={styles.primaryButtonText}>Get Started  →</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.88} onPress={onLogin}>
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FEE7D4',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 6,
    paddingBottom: Platform.OS === 'android' ? 24 : 18,
    backgroundColor: '#FEE7D4',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    height: 30,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A3B32',
    fontFamily: fontSansSerif,
  },
  headerBlock: {
    marginBottom: 10,
  },
  titlePrefix: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B3542',
    lineHeight: 32,
    fontFamily: fontSansSerif,
  },
  titleMain: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B3542',
    lineHeight: 32,
    fontFamily: fontSansSerif,
  },
  titleHighlight: {
    color: '#A67C2E',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C4D44',
    marginTop: 3,
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  gridCard: {
    width: (width - 40 - 10) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 6,
    height: 48,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  cardLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0B3542',
    lineHeight: 14,
    flexShrink: 1,
    fontFamily: fontSansSerif,
  },
  heroImageContainer: {
    width: width,
    marginHorizontal: -20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FEE7D4',
    marginTop: 2,
    marginBottom: 0,
  },
  businessmanImage: {
    position: 'absolute',
    left: 0,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
    gap: 6,
  },
  activeDot: {
    width: 22,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0C4E3D',
  },
  inactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D8D1C7',
  },
  buttonsContainer: {
    width: '100%',
    gap: 10,
  },
  primaryButton: {
    backgroundColor: '#0C4E3D',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0C4E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: fontSansSerif,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0C4E3D',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#0C4E3D',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.3,
    fontFamily: fontSansSerif,
  },
});
