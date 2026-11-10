import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../state/AuthContext';
import { notify } from '../../components/common/NotificationContext';

const { width } = Dimensions.get('window');

interface AuthScreenProps {
  onNavigateToRegistration: () => void;
  onLoginSuccess: () => void;
}

// Crisp line-art icons matching the exact #0B3542 dark teal brand aesthetic
const MailIcon = () => (
  <View style={iconStyles.mailContainer}>
    <View style={iconStyles.mailFlap} />
  </View>
);

const LockIcon = () => (
  <View style={iconStyles.lockContainer}>
    <View style={iconStyles.lockShackle} />
    <View style={iconStyles.lockBody}>
      <View style={iconStyles.lockKeyhole} />
    </View>
  </View>
);

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <View style={iconStyles.eyeContainer}>
    <View style={iconStyles.eyeOutline}>
      <View style={iconStyles.eyePupil} />
    </View>
    {!visible && <View style={iconStyles.eyeSlash} />}
  </View>
);

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onNavigateToRegistration,
  onLoginSuccess,
}) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      const lower = email.toLowerCase().trim();
      if (lower.includes('sundaram') || lower.includes('mentor1')) {
        login('MENTOR', {
          id: 'usr_mentor_sundaram',
          fullName: 'Dr. K. S. Sundaram',
          email: 'dr.sundaram@mentor.fic.org',
          category: 'Education & Knowledge',
          subcategory: 'Mentor / Trainer',
          role: 'MENTOR',
        });
      } else if (lower.includes('anand') || lower.includes('mentor2')) {
        login('MENTOR', {
          id: 'usr_mentor_anand',
          fullName: 'Dr. Anand Kumar',
          email: 'dr.anand@mentor.fic.org',
          category: 'Education & Knowledge',
          subcategory: 'Teacher / Professor',
          role: 'MENTOR',
        });
      } else if (lower.includes('professor') || lower.includes('teacher')) {
        login('MENTOR', {
          id: 'usr_prof_anand',
          fullName: 'Prof. Anand Kumar',
          email: 'prof.anand@mentor.fic.org',
          category: 'Education & Knowledge',
          subcategory: 'Teacher / Professor',
          role: 'MENTOR',
        });
      } else if (lower.includes('trainer') || lower.includes('mentor')) {
        login('MENTOR', {
          id: 'usr_mentor_sundaram',
          fullName: 'Dr. K. S. Sundaram',
          email: 'dr.sundaram@mentor.fic.org',
          category: 'Education & Knowledge',
          subcategory: 'Mentor / Trainer',
          role: 'MENTOR',
        });
      } else if (lower.includes('karthik') || lower.includes('student2')) {
        login('STUDENT', {
          id: 'usr_student_karthik',
          fullName: 'Karthik Raja',
          email: 'karthik.raja@student.fic.org',
          category: 'Education & Knowledge',
          subcategory: 'Student',
          role: 'STUDENT',
        });
      } else if (lower.includes('priya') || lower.includes('student1') || lower.includes('student')) {
        login('STUDENT', {
          id: 'usr_student_priya',
          fullName: 'Priya Sundaram',
          email: 'priya.sundaram@student.fic.org',
          category: 'Education & Knowledge',
          subcategory: 'Student',
          role: 'STUDENT',
        });
      } else {
        const emailUser = email.split('@')[0] || '';
        const derivedName = emailUser
          ? emailUser.charAt(0).toUpperCase() + emailUser.slice(1).replace(/[._]/g, ' ')
          : 'Member';
        login('MSME', {
          id: `usr_${Date.now()}`,
          fullName: derivedName,
          email: email.trim() || 'member@fic.org',
          role: 'MSME',
        });
      }
      setLoading(false);
      onLoginSuccess();
    }, 350);
  };

  const handleForgotPassword = () => {
    notify.info('A password reset link has been dispatched to your registered email address.', 'Password Reset Link Dispatched');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEE8D2" translucent={false} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Section: Banner & Form */}
          <View style={styles.topAndFormWrapper}>
            {/* Top Banner (Image 3 preserved at native 4:3 aspect ratio without cropping/distortion) */}
            <View style={styles.bannerContainer}>
              <Image
                source={require('../../assets/images/login_banner.jpg')}
                style={styles.bannerImage}
                resizeMode="contain"
              />
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Title & Subtitle immediately below the banner wave */}
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>
                Sign in to your FIC Business Hub account
              </Text>

              {/* Email Address Input Pill */}
              <View style={styles.inputPill}>
                <View style={styles.iconWrapper}>
                  <MailIcon />
                </View>
                <View style={styles.verticalDivider} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email Address"
                  placeholderTextColor="#8A7E75"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input Pill */}
              <View style={styles.inputPill}>
                <View style={styles.iconWrapper}>
                  <LockIcon />
                </View>
                <View style={styles.verticalDivider} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Password"
                  placeholderTextColor="#8A7E75"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
                  style={styles.eyeButton}
                >
                  <EyeIcon visible={showPassword} />
                </TouchableOpacity>
              </View>

              {/* Remember Me & Forgot Password Row */}
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeContainer}
                  activeOpacity={0.8}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      rememberMe ? styles.checkboxChecked : styles.checkboxUnchecked,
                    ]}
                  >
                    {rememberMe && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                activeOpacity={0.88}
                onPress={handleSignIn}
                disabled={loading}
              >
                <Text style={styles.signInButtonText}>
                  {loading ? 'Signing In...' : 'Sign In  →'}
                </Text>
              </TouchableOpacity>

              {/* Register Now Redirect */}
              <View style={styles.registerRow}>
                <Text style={styles.registerPrefix}>New to FIC Business Hub? </Text>
                <TouchableOpacity
                  onPress={onNavigateToRegistration}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.registerHighlight}>Register Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Bottom Wave Graphic */}
          <View style={styles.bottomWaveContainer}>
            <Image
              source={require('../../assets/images/bottom_waves.png')}
              style={styles.bottomWaveImage}
              resizeMode="stretch"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const iconStyles = StyleSheet.create({
  mailContainer: {
    width: 20,
    height: 15,
    borderRadius: 3,
    borderWidth: 1.8,
    borderColor: '#0B3542',
    alignItems: 'center',
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  mailFlap: {
    width: 14,
    height: 14,
    borderLeftWidth: 1.6,
    borderBottomWidth: 1.6,
    borderColor: '#0B3542',
    transform: [{ rotate: '-45deg' }],
    marginTop: -8,
  },
  lockContainer: {
    width: 18,
    height: 20,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  lockShackle: {
    width: 11,
    height: 9,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1.8,
    borderBottomWidth: 0,
    borderColor: '#0B3542',
    marginBottom: -1,
  },
  lockBody: {
    width: 17,
    height: 12,
    borderRadius: 3.5,
    borderWidth: 1.8,
    borderColor: '#0B3542',
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockKeyhole: {
    width: 2.2,
    height: 4,
    backgroundColor: '#0B3542',
    borderRadius: 1,
  },
  eyeContainer: {
    width: 22,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyeOutline: {
    width: 20,
    height: 13,
    borderRadius: 10,
    borderWidth: 1.8,
    borderColor: '#0B3542',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0B3542',
  },
  eyeSlash: {
    position: 'absolute',
    width: 20,
    height: 1.8,
    backgroundColor: '#0B3542',
    transform: [{ rotate: '-42deg' }],
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEE8D2',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#FEE8D2',
    justifyContent: 'space-between',
  },
  topAndFormWrapper: {
    width: '100%',
  },
  bannerContainer: {
    width: width,
    height: width * (768 / 1024),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE8D2',
  },
  bannerImage: {
    width: width,
    height: '100%',
  },
  formSection: {
    paddingHorizontal: 24,
    marginTop: -16,
    backgroundColor: '#FEE8D2',
  },
  welcomeTitle: {
    fontSize: 27,
    fontWeight: '800',
    color: '#0B3542',
    letterSpacing: -0.4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#685D56',
    marginTop: 4,
    marginBottom: 20,
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    borderRadius: 26,
    paddingHorizontal: 16,
    marginBottom: 14,
    shadowColor: '#3D2F14',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrapper: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verticalDivider: {
    width: 1.2,
    height: 20,
    backgroundColor: '#E4D9CC',
    marginHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '500',
    color: '#0B3542',
    paddingVertical: 0,
  },
  eyeButton: {
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 26,
    paddingHorizontal: 2,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0C4E3D',
  },
  checkboxUnchecked: {
    borderWidth: 1.5,
    borderColor: '#0C4E3D',
    backgroundColor: 'transparent',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    lineHeight: 13,
  },
  rememberMeText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  forgotPasswordText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#2C3E50',
  },
  signInButton: {
    backgroundColor: '#0C4E3D',
    borderRadius: 26,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0C4E3D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 16,
  },
  registerPrefix: {
    fontSize: 13.5,
    fontWeight: '500',
    color: '#2C3E50',
  },
  registerHighlight: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#C88536',
  },
  bottomWaveContainer: {
    width: width,
    height: 72,
    overflow: 'hidden',
  },
  bottomWaveImage: {
    width: '100%',
    height: '100%',
  },
});
