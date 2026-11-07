import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

interface OnboardingNetworkScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingNetworkScreen: React.FC<OnboardingNetworkScreenProps> = ({
  onNext,
  onSkip,
}) => {
  // Proportional globe & handshake illustration sizing matching Image 1
  const illustrationSize = Math.min(width - 32, height * 0.42, 350);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEE7D4" />

      {/* Subtle bottom decorative wave accent */}
      <Image
        source={require('../../assets/images/bottom_waves.png')}
        style={styles.bottomWaveAccent}
        resizeMode="stretch"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Top Header Row with Skip Button */}
        <View style={styles.topBar}>
          <View style={{ flex: 1 }} />
          <TouchableOpacity
            onPress={onSkip}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
          >
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Headlines */}
        <View style={styles.headerBlock}>
          <Text style={styles.titleMain}>Grow Your</Text>
          <Text style={styles.titleHighlight}>Business Network</Text>
          <Text style={styles.subtitle}>
            Build, collaborate and scale with the right support.
          </Text>
        </View>

        {/* Globe & Handshake Illustration - Prominently Sized */}
        <View style={styles.illustrationWrapper}>
          <Image
            source={require('../../assets/images/onboarding_network_faded.png')}
            style={[
              styles.illustrationImage,
              { width: illustrationSize, height: illustrationSize },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* Tagline directly below illustration */}
        <Text style={styles.tagline}>Connect  •  Collaborate  •  Grow</Text>

        {/* Bottom Navigation Block positioned cleanly directly below tagline */}
        <View style={styles.bottomSection}>
          {/* Pagination Indicators (Dot 3 active) */}
          <View style={styles.dotsRow}>
            <View style={styles.inactiveDot} />
            <View style={styles.inactiveDot} />
            <View style={styles.activeDot} />
            <View style={styles.inactiveDot} />
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={onNext}
          >
            <Text style={styles.primaryButtonText}>Next  →</Text>
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
  bottomWaveAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 120,
    opacity: 0.85,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 10 : 6,
    paddingBottom: Platform.OS === 'android' ? 24 : 18,
    backgroundColor: 'transparent',
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
    marginBottom: 6,
  },
  titleMain: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0B3542',
    lineHeight: 32,
    fontFamily: fontSansSerif,
  },
  titleHighlight: {
    fontSize: 26,
    fontWeight: '800',
    color: '#A67C2E',
    lineHeight: 32,
    fontFamily: fontSansSerif,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C4D44',
    marginTop: 3,
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  illustrationWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  illustrationImage: {
    maxWidth: '100%',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0B3542',
    textAlign: 'center',
    letterSpacing: 0.4,
    marginTop: 8,
    marginBottom: 8,
    fontFamily: fontSansSerif,
  },
  bottomSection: {
    width: '100%',
    marginTop: 18,
    paddingBottom: Platform.OS === 'android' ? 24 : 18,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
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
});
