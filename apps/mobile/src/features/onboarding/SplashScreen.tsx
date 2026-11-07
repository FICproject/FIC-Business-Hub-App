import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

// Exact aspect ratio of Image 2 (576 x 1024)
const IMG_WIDTH = 576;
const IMG_HEIGHT = 1024;
const IMG_ASPECT = IMG_HEIGHT / IMG_WIDTH; // 1.7778

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start(() => {
      onFinish();
    });
  }, [progressAnim, onFinish]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110],
  });

  // Calculate proportional height based on full screen width so 0% of the sides are cropped
  const imageDisplayWidth = width;
  const imageDisplayHeight = width * IMG_ASPECT;
  // Move illustration downward to match Image 1 reference position (offset ~9.3% of screen height)
  const imageTop = Platform.OS === 'android' ? Math.round(height * 0.093) : Math.round(height * 0.088);

  return (
    <View style={styles.rootContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEE7D4" translucent />

      {/* Main Illustration - moved downward to match Image 1 alignment */}
      <View
        style={[
          styles.imageContainer,
          {
            top: imageTop,
            height: imageDisplayHeight,
          },
        ]}
      >
        <Image
          source={require('../../assets/images/splash_skyline.jpg')}
          style={{
            width: imageDisplayWidth,
            height: imageDisplayHeight,
          }}
          resizeMode="contain"
        />

        {/* Bottom Tagline & Progress Indicator positioned directly below wave design matching Image 1 spacing */}
        <View
          style={[
            styles.bottomSection,
            {
              top: imageDisplayHeight * 0.912,
            },
          ]}
        >
          <Text style={styles.bottomHeadline}>A Trusted Business Ecosystem</Text>
          <Text style={styles.bottomSubtext}>for a Brighter Tomorrow</Text>

          <View style={styles.progressBarTrack}>
            <Animated.View
              style={[styles.progressBarFill, { width: progressWidth }]}
            />
          </View>
        </View>
      </View>

      <SafeAreaView style={styles.safeOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.contentContainer}
          activeOpacity={1}
          onPress={onFinish}
        >
          {/* Brand Header centered in upper sky area per Image 1 */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/fic_splash_logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FEE7D4',
  },
  imageContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    width: width,
    alignItems: 'center',
    backgroundColor: '#FEE7D4',
  },
  safeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? Math.round(height * 0.128) : Math.round(height * 0.122),
  },
  header: {
    alignItems: 'center',
  },
  logoImage: {
    width: 185,
    height: 70,
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  bottomHeadline: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1B2A32',
    textAlign: 'center',
    fontFamily: fontSansSerif,
    letterSpacing: 0.2,
  },
  bottomSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3D45',
    textAlign: 'center',
    marginTop: 3,
    fontFamily: fontSansSerif,
  },
  progressBarTrack: {
    width: 110,
    height: 4.5,
    backgroundColor: '#DFE7E2',
    borderRadius: 2.5,
    marginTop: 13,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0C4E3D',
    borderRadius: 2.5,
  },
});
