import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { BackButton } from '../../components/common/BackButton';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

interface OnboardingPlanScreenProps {
  onBack: () => void;
  onContinueRegistration: () => void;
}

export const OnboardingPlanScreen: React.FC<OnboardingPlanScreenProps> = ({
  onBack,
  onContinueRegistration,
}) => {
  const planFeatures = [
    'Access to all business categories',
    'Offer and request services',
    'Submit business ideas',
    'Explore investment opportunities',
    'Build partnerships and networking',
    'FIC-mediated connections',
    'Secure and trusted platform',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEE7D4" />

      {/* Decorative bottom wave accent matching reference design */}
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
        <View style={styles.topSection}>
          {/* Top Bar with Reusable Circular Back Button */}
          <View style={styles.topBar}>
            <BackButton onPress={onBack} accessibilityLabel="Back to Onboarding" />
          </View>

          {/* Headlines */}
          <View style={styles.headerBlock}>
            <Text style={styles.titlePrefix}>Get Started with</Text>
            <Text style={styles.titleMain}>
              FIC Business <Text style={styles.titleHighlight}>Hub</Text>
            </Text>
            <Text style={styles.subtitle}>
              Join a trusted ecosystem and access business opportunities, services and networks.
            </Text>
          </View>

          {/* Membership Plan Card */}
          <View style={styles.planCard}>
            {/* Header: Title & Most Popular Badge */}
            <View style={styles.planCardHeader}>
              <Text style={styles.planTitle}>Membership Plan</Text>
              <View style={styles.badgePopular}>
                <Text style={styles.badgePopularText}>Most Popular</Text>
              </View>
            </View>

            {/* Price & Crown Journey Box Row */}
            <View style={styles.pricingRow}>
              {/* Left Column: Price */}
              <View style={styles.priceColumn}>
                <Text style={styles.priceSubhead}>First Year</Text>
                <Text style={styles.priceAmount}>₹99</Text>
                <Text style={styles.priceDuration}>for the first year</Text>
              </View>

              {/* Right Column: Golden Journey Box */}
              <View style={styles.journeyBox}>
                <Text style={styles.journeyCrown}>👑</Text>
                <Text style={styles.journeyText}>Start Your</Text>
                <Text style={styles.journeyText}>Business Journey</Text>
                <Text style={styles.journeyText}>Today</Text>
              </View>
            </View>

            {/* Subtle Divider */}
            <View style={styles.cardDivider} />

            {/* 7 Checklist Benefits */}
            <View style={styles.featuresList}>
              {planFeatures.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Bottom Section with Continue Registration Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.88}
            onPress={onContinueRegistration}
          >
            <Text style={styles.primaryButtonText}>Continue Registration  →</Text>
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
    paddingTop: Platform.OS === 'android' ? 12 : 8,
    paddingBottom: Platform.OS === 'android' ? 24 : 18,
    backgroundColor: 'transparent',
  },
  topSection: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    height: 40,
  },
  headerBlock: {
    marginBottom: 12,
  },
  titlePrefix: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0B3542',
    lineHeight: 33,
    fontFamily: fontSansSerif,
  },
  titleMain: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0B3542',
    lineHeight: 33,
    fontFamily: fontSansSerif,
  },
  titleHighlight: {
    color: '#A67C2E',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C4D44',
    marginTop: 4,
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EFE5D6',
    padding: 16,
    marginBottom: 12,
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0B3542',
    fontFamily: fontSansSerif,
  },
  badgePopular: {
    backgroundColor: '#C88536',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePopularText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceColumn: {
    flex: 1,
  },
  priceSubhead: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6E5D52',
    fontFamily: fontSansSerif,
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 38,
    fontWeight: '900',
    color: '#0C4E3D',
    lineHeight: 44,
    fontFamily: fontSansSerif,
  },
  priceDuration: {
    fontSize: 11.5,
    color: '#6E5D52',
    fontWeight: '500',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },
  journeyBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  journeyCrown: {
    fontSize: 22,
    marginBottom: 2,
  },
  journeyText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#92400E',
    lineHeight: 14,
    textAlign: 'center',
    fontFamily: fontSansSerif,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F3EDE2',
    marginVertical: 10,
  },
  featuresList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0C4E3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
  },
  featureText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: fontSansSerif,
    flex: 1,
  },
  bottomSection: {
    width: '100%',
    marginTop: 18,
    paddingBottom: Platform.OS === 'android' ? 24 : 18,
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
