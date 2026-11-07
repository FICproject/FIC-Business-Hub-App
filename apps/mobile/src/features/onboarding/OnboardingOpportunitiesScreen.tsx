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
import {
  ConnectionsIcon,
  IdeasIcon,
  InvestmentIcon,
  PartnershipsIcon,
  NetworkingIcon,
} from './OnboardingIcons';

const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

interface OnboardingOpportunitiesScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingOpportunitiesScreen: React.FC<OnboardingOpportunitiesScreenProps> = ({
  onNext,
  onSkip,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEE7D4" />

      {/* Subtle bottom decorative wave accent matching reference design */}
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
        {/* Top Content Block */}
        <View style={styles.topSection}>
          {/* Top Header Row with Skip Button */}
          <View style={styles.topBar}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={onSkip} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          </View>

          {/* Headlines */}
          <View style={styles.headerBlock}>
            <Text style={styles.titleMain}>Discover More</Text>
            <Text style={styles.titleHighlight}>Opportunities</Text>
            <Text style={styles.subtitle}>
              Be part of a growing ecosystem with multiple benefits.
            </Text>
          </View>

          {/* 5 Benefit Cards in consistent vertical stack */}
          <View style={styles.cardsContainer}>
            {/* Card 1: Offer & Access Services */}
            <View style={[styles.benefitCard, { backgroundColor: '#EEF7F2' }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#D7EFE3' }]}>
                <ConnectionsIcon color="#0D684D" size={20} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.cardTitle}>Offer & Access Services</Text>
                <Text style={styles.cardSubtitle}>
                  Discover and provide approved services across industries.
                </Text>
              </View>
            </View>

            {/* Card 2: Business Ideas */}
            <View style={[styles.benefitCard, { backgroundColor: '#FFF8EC' }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#FDEBC8' }]}>
                <IdeasIcon color="#D97706" size={20} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.cardTitle}>Business Ideas</Text>
                <Text style={styles.cardSubtitle}>
                  Share your ideas and get the right support.
                </Text>
              </View>
            </View>

            {/* Card 3: Investment Opportunities */}
            <View style={[styles.benefitCard, { backgroundColor: '#EDF4FB' }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#D6E6F9' }]}>
                <InvestmentIcon color="#1D4ED8" size={20} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.cardTitle}>Investment Opportunities</Text>
                <Text style={styles.cardSubtitle}>
                  Explore funding and investment options.
                </Text>
              </View>
            </View>

            {/* Card 4: Partnerships & Tie-ups */}
            <View style={[styles.benefitCard, { backgroundColor: '#FDF1F1' }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#FBD7D7' }]}>
                <PartnershipsIcon color="#DC2626" size={20} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.cardTitle}>Partnerships & Tie-ups</Text>
                <Text style={styles.cardSubtitle}>
                  Build valuable business partnerships.
                </Text>
              </View>
            </View>

            {/* Card 5: Networking */}
            <View style={[styles.benefitCard, { backgroundColor: '#F4F0FB' }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#E5DCF7' }]}>
                <NetworkingIcon color="#7C3AED" size={20} />
              </View>
              <View style={styles.textColumn}>
                <Text style={styles.cardTitle}>Networking</Text>
                <Text style={styles.cardSubtitle}>
                  Connect and grow through FIC-mediated opportunities.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Section - Perfectly anchored lower area eliminating unwanted empty gap */}
        <View style={styles.bottomSection}>
          {/* 4 Pagination Dots (Dot 2 active) */}
          <View style={styles.dotsRow}>
            <View style={styles.inactiveDot} />
            <View style={styles.activeDot} />
            <View style={styles.inactiveDot} />
            <View style={styles.inactiveDot} />
          </View>

          {/* Next Button */}
          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.88} onPress={onNext}>
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
    marginBottom: 4,
    height: 32,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4A3B32',
    fontFamily: fontSansSerif,
  },
  headerBlock: {
    marginBottom: 12,
  },
  titleMain: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0B3542',
    lineHeight: 33,
    fontFamily: fontSansSerif,
  },
  titleHighlight: {
    fontSize: 27,
    fontWeight: '800',
    color: '#A67C2E',
    lineHeight: 33,
    fontFamily: fontSansSerif,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#5C4D44',
    marginTop: 4,
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  cardsContainer: {
    gap: 9,
    marginBottom: 8,
  },
  benefitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },
  textColumn: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0B3542',
    marginBottom: 1.5,
    fontFamily: fontSansSerif,
  },
  cardSubtitle: {
    fontSize: 11.5,
    fontWeight: '400',
    color: '#5C4D44',
    lineHeight: 15,
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
