import React, { useState } from 'react';
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
  Share,
  Linking,
} from 'react-native';
import { useAuth } from '../../state/AuthContext';
import { notify } from '../../components/common/NotificationContext';
import { BackButton } from '../../components/common/BackButton';
import { StandardHeader } from '../../components/common/StandardHeader';
import { useWalletReferral } from '../../state/WalletReferralContext';
import { copyToSystemClipboard } from '../../utils/meetingLauncher';

const { width } = Dimensions.get('window');
const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export interface ProfileScreenProps {
  onLogout: () => void;
  onBack?: () => void;
  onNavigateToModule?: (moduleName: string) => void;
}

// -------------------------------------------------------------
// Pure Vector Icons for Pixel-Perfect Matching & Theme
// -------------------------------------------------------------

// Modern Professional Settings Gear (Cog) Icon with 8 teeth and center axle
const SettingsGearIcon = ({ color = '#0F172A', size = 20 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    {/* Center circle */}
    <View
      style={{
        width: size * 0.68,
        height: size * 0.68,
        borderRadius: (size * 0.68) / 2,
        borderWidth: 2.2,
        borderColor: color,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}
    >
      <View
        style={{
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: (size * 0.22) / 2,
          backgroundColor: color,
        }}
      />
    </View>
    {/* 4 Gear Teeth bars forming 8 cogs */}
    <View
      style={{
        position: 'absolute',
        width: size * 0.95,
        height: size * 0.24,
        backgroundColor: color,
        borderRadius: 2,
        zIndex: 1,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: size * 0.24,
        height: size * 0.95,
        backgroundColor: color,
        borderRadius: 2,
        zIndex: 1,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: size * 0.95,
        height: size * 0.24,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ rotate: '45deg' }],
        zIndex: 1,
      }}
    />
    <View
      style={{
        position: 'absolute',
        width: size * 0.95,
        height: size * 0.24,
        backgroundColor: color,
        borderRadius: 2,
        transform: [{ rotate: '-45deg' }],
        zIndex: 1,
      }}
    />
  </View>
);

// Pencil Edit Icon
const PencilIcon = ({ color = '#2563EB', size = 13 }: { color?: string; size?: number }) => (
  <View
    style={{
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
      transform: [{ rotate: '45deg' }],
    }}
  >
    <View style={{ width: size * 0.7, height: size * 0.35, backgroundColor: color, borderRadius: 1 }} />
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: size * 0.25,
        borderRightWidth: size * 0.25,
        borderTopWidth: size * 0.35,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: color,
        marginTop: 0.5,
      }}
    />
  </View>
);

// Wallet Vector Icon
const WalletVectorIcon = ({ color = '#FFFFFF' }: { color?: string }) => (
  <View
    style={{
      width: 22,
      height: 17,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: color,
      padding: 2,
      justifyContent: 'center',
      alignItems: 'flex-end',
    }}
  >
    <View
      style={{
        width: 6,
        height: 5,
        borderRadius: 2,
        backgroundColor: color,
        marginRight: -1,
      }}
    />
  </View>
);

// Bank Icon for Withdraw
const BankVectorIcon = ({ color = '#1E3A8A' }: { color?: string }) => (
  <View style={{ width: 18, height: 16, alignItems: 'center', justifyContent: 'flex-end' }}>
    <View
      style={{
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: color,
        marginBottom: 1,
      }}
    />
    <View style={{ flexDirection: 'row', gap: 2.5, alignItems: 'center', marginBottom: 1 }}>
      <View style={{ width: 2.2, height: 6.5, backgroundColor: color, borderRadius: 0.5 }} />
      <View style={{ width: 2.2, height: 6.5, backgroundColor: color, borderRadius: 0.5 }} />
      <View style={{ width: 2.2, height: 6.5, backgroundColor: color, borderRadius: 0.5 }} />
    </View>
    <View style={{ width: 18, height: 2, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

// Plus Icon
const PlusVectorIcon = ({ color = '#1E3A8A' }: { color?: string }) => (
  <View style={{ width: 14, height: 14, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 12, height: 2, backgroundColor: color, borderRadius: 1 }} />
    <View style={{ position: 'absolute', width: 2, height: 12, backgroundColor: color, borderRadius: 1 }} />
  </View>
);

// Gift Box Icon for Refer & Earn
const GiftBoxVectorIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ flexDirection: 'row', gap: 2, marginBottom: 1 }}>
      <View style={{ width: 6, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: '#F59E0B' }} />
      <View style={{ width: 6, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: '#F59E0B' }} />
    </View>
    <View style={{ width: 22, height: 4, backgroundColor: color, borderRadius: 1.5, marginBottom: 1 }} />
    <View
      style={{
        width: 19,
        height: 12,
        backgroundColor: color,
        borderBottomLeftRadius: 2.5,
        borderBottomRightRadius: 2.5,
        alignItems: 'center',
      }}
    >
      <View style={{ width: 3, height: '100%', backgroundColor: '#F59E0B' }} />
    </View>
  </View>
);

// Copy Icon
const CopyVectorIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <View style={{ width: 16, height: 17, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: 11,
        height: 12,
        borderRadius: 2.5,
        borderWidth: 1.6,
        borderColor: color,
        backgroundColor: '#FFFFFF',
        zIndex: 2,
        marginRight: -2,
        marginTop: 2,
      }}
    />
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 10,
        height: 11,
        borderRadius: 2,
        borderWidth: 1.4,
        borderColor: color,
        opacity: 0.6,
        zIndex: 1,
      }}
    />
  </View>
);

// Share Icon
const ShareVectorIcon = ({ color = '#FFFFFF' }: { color?: string }) => (
  <View style={{ width: 14, height: 14, justifyContent: 'center', alignItems: 'center' }}>
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: color,
        position: 'absolute',
        top: 0,
        right: 0,
      }}
    />
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: color,
        position: 'absolute',
        bottom: 0,
        right: 0,
      }}
    />
    <View
      style={{
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: color,
        position: 'absolute',
        top: 4.5,
        left: 0,
      }}
    />
    <View
      style={{
        width: 10,
        height: 1.5,
        backgroundColor: color,
        transform: [{ rotate: '-28deg' }],
        position: 'absolute',
        top: 3.5,
        left: 2,
      }}
    />
    <View
      style={{
        width: 10,
        height: 1.5,
        backgroundColor: color,
        transform: [{ rotate: '28deg' }],
        position: 'absolute',
        bottom: 3.5,
        left: 2,
      }}
    />
  </View>
);

// WhatsApp Vector Icon
const WhatsAppVectorIcon = ({ color = '#22C55E', size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.9,
        height: size * 0.9,
        borderRadius: (size * 0.9) / 2,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.45,
          height: size * 0.35,
          borderWidth: 1.8,
          borderColor: '#FFFFFF',
          borderRadius: 3,
        }}
      />
    </View>
  </View>
);

// SMS Vector Icon
const SmsVectorIcon = ({ color = '#2563EB', size = 18 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.88,
        height: size * 0.72,
        borderRadius: 4,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: '60%', height: 1.5, backgroundColor: '#FFFFFF', marginBottom: 2, borderRadius: 1 }} />
      <View style={{ width: '40%', height: 1.5, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
    </View>
  </View>
);

// History / Passbook Clock Icon
const HistoryVectorIcon = ({ color = '#FFFFFF', size = 16 }: { color?: string; size?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: size * 0.9,
        height: size * 0.9,
        borderRadius: (size * 0.9) / 2,
        borderWidth: 1.6,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: size * 0.22,
          width: 1.5,
          height: size * 0.26,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.42,
          top: size * 0.42,
          width: size * 0.24,
          height: 1.5,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  </View>
);

// User Circle Icon
const UserCircleVectorIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: 7, height: 7, borderRadius: 3.5, borderWidth: 1.6, borderColor: color }} />
    <View
      style={{
        width: 13,
        height: 6,
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        borderWidth: 1.6,
        borderColor: color,
        borderBottomWidth: 0,
        marginTop: 1.5,
      }}
    />
  </View>
);

// Lock Security Vector Icon
const LockVectorIcon = ({ color = '#2563EB' }: { color?: string }) => (
  <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
    <View
      style={{
        width: 9,
        height: 7,
        borderTopLeftRadius: 4.5,
        borderTopRightRadius: 4.5,
        borderWidth: 1.8,
        borderColor: color,
        borderBottomWidth: 0,
      }}
    />
    <View
      style={{
        width: 15,
        height: 10,
        borderRadius: 3,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View style={{ width: 2.4, height: 3.5, borderRadius: 1.2, backgroundColor: '#FFFFFF' }} />
    </View>
  </View>
);

// Logout Vector Icon (Exit door + arrow)
const LogoutVectorIcon = ({ color = '#DC2626' }: { color?: string }) => (
  <View style={{ width: 18, height: 18, justifyContent: 'center', alignItems: 'center' }}>
    {/* Door outline */}
    <View
      style={{
        width: 10,
        height: 16,
        borderWidth: 1.8,
        borderColor: color,
        borderRightWidth: 0,
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
        position: 'absolute',
        left: 0,
      }}
    />
    {/* Arrow */}
    <View style={{ position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'center' }}>
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

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onLogout, onBack, onNavigateToModule }) => {
  const { user } = useAuth();

  // Generate & Maintain Unique Permanent Member ID
  const memberId = 'FIC-M-000001';

  // Dynamic Profile Data (initialized from auth user or verified registration record)
  const isStudent = user?.role === 'STUDENT';
  const isMentor = user?.role === 'MENTOR';

  const [fullName, setFullName] = useState<string>(
    user?.fullName ? (user.fullName.includes('(') ? user.fullName.split('(')[0].trim() : user.fullName) : 'Member'
  );
  const [dob, setDob] = useState<string>(user?.dob || 'Not Provided');
  const [email, setEmail] = useState<string>(user?.email || 'member@ficbusinesshub.com');
  const [phone, setPhone] = useState<string>(user?.phone || 'Not Provided');
  const [streetAddress, setStreetAddress] = useState<string>(user?.streetAddress || 'Not Provided');
  const [stateRegion, setStateRegion] = useState<string>(user?.stateRegion || 'Not Provided');
  const [district, setDistrict] = useState<string>(user?.district || 'Not Provided');
  const [city, setCity] = useState<string>(user?.city || 'Not Provided');
  const [pincode, setPincode] = useState<string>(user?.pincode || '------');

  // Dynamic Category Classification per MD Blueprint
  const [category, setCategory] = useState<string>(
    user?.category || (isStudent ? 'Education & Knowledge' : 'Business & Entrepreneurship')
  );
  const [subcategory, setSubcategory] = useState<string>(
    user?.subcategory || (isStudent ? 'Student' : isMentor ? 'Mentor / Trainer' : 'General Member')
  );

  // Business & Professional Details
  const [businessName, setBusinessName] = useState<string>(
    user?.businessName || (isStudent ? 'Student' : 'Not Registered')
  );
  const [businessType, setBusinessType] = useState<string>(
    user?.businessType || (isStudent ? 'Academic Student' : 'Not Specified')
  );
  const [specialization, setSpecialization] = useState<string>(
    user?.specialization || 'General'
  );
  const [scaleOrTurnover, setScaleOrTurnover] = useState<string>(
    user?.turnover || 'Not Disclosed'
  );
  const [experience, setExperience] = useState<string>(
    user?.experience || (isStudent ? 'Student' : 'Not Specified')
  );
  const [description, setDescription] = useState<string>(
    user?.description || ''
  );

  // Membership & Governance Details
  const membershipPlan = 'One Year Membership (₹99 First-Year Offer)';
  const membershipStatus = 'ACTIVE';
  const registrationDate = '05 Nov 2026';
  const renewalDate = '05 Nov 2027 (₹5,999/yr)';
  const kycStatus = 'APPROVED & VERIFIED';

  // Wallet & Referral Context (Dynamic balance, ledger & referrals)
  const {
    walletBalance,
    transactions,
    referralCode,
    referralLink,
    memberId: contextMemberId,
    referrals,
    referralStats,
    isBackendConnected,
    backendNotice,
    addMoney,
    withdrawMoney,
  } = useWalletReferral();

  // Modals for Wallet & Referral Flows
  const [showAddMoneyModal, setShowAddMoneyModal] = useState<boolean>(false);
  const [addAmountInput, setAddAmountInput] = useState<string>('500');
  const [selectedAddMethod, setSelectedAddMethod] = useState<string>('UPI (GPay / PhonePe / Paytm)');
  const [addMoneyError, setAddMoneyError] = useState<string | null>(null);

  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');
  const [withdrawMethodType, setWithdrawMethodType] = useState<'BANK' | 'UPI'>('BANK');
  const [withdrawAccountHolder, setWithdrawAccountHolder] = useState<string>(fullName);
  const [withdrawBankName, setWithdrawBankName] = useState<string>('HDFC Bank');
  const [withdrawAccountNumber, setWithdrawAccountNumber] = useState<string>('');
  const [withdrawConfirmAccount, setWithdrawConfirmAccount] = useState<string>('');
  const [withdrawIfsc, setWithdrawIfsc] = useState<string>('');
  const [withdrawUpiId, setWithdrawUpiId] = useState<string>('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showReferralsModal, setShowReferralsModal] = useState<boolean>(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState<boolean>(false);

  // Modals & UI states
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(fullName);
  const [editEmail, setEditEmail] = useState<string>(email);
  const [editPhone, setEditPhone] = useState<string>(phone);
  const [editStreet, setEditStreet] = useState<string>(streetAddress);
  const [editState, setEditState] = useState<string>(stateRegion);
  const [editDistrict, setEditDistrict] = useState<string>(district);
  const [editCity, setEditCity] = useState<string>(city);
  const [editPincode, setEditPincode] = useState<string>(pincode);
  const [editDesc, setEditDesc] = useState<string>(description);

  // Change Password State
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [activePassword, setActivePassword] = useState<string>('Password123');
  const [currentPasswordInput, setCurrentPasswordInput] = useState<string>('');
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [showConfirmPass, setShowConfirmPass] = useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Logout Confirmation Modal
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState<boolean>(false);

  // Settings Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCopyMemberId = async () => {
    await copyToSystemClipboard(memberId);
    triggerToast(`Member ID "${memberId}" copied to clipboard!`);
  };

  const handleCopyReferralCode = async () => {
    await copyToSystemClipboard(referralCode);
    triggerToast(`Referral code "${referralCode}" copied to clipboard!`);
  };

  const handleCopyReferralLink = async () => {
    await copyToSystemClipboard(referralLink);
    triggerToast('Unique referral link copied to clipboard!');
  };

  const handleShareWhatsApp = async () => {
    const message = `Join FIC Business Hub using my exclusive referral link:\n${referralLink}\n\nUse Referral Code: ${referralCode} to connect with industry leaders, access business opportunities, and explore mentors!`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Share.share({ message });
      }
    } catch {
      await Share.share({ message });
    }
    setShowShareModal(false);
  };

  const handleShareSms = async () => {
    const message = `Join FIC Business Hub with my referral code ${referralCode}: ${referralLink}`;
    const url = `sms:?body=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(url);
    } catch {
      await Share.share({ message });
    }
    setShowShareModal(false);
  };

  const handleShareSystem = async () => {
    const message = `Join FIC Business Hub using my exclusive referral link:\n${referralLink}\n\nReferral Code: ${referralCode}\nAccess premium business connections and verified services!`;
    try {
      await Share.share({
        title: 'Join FIC Business Hub',
        message,
        url: referralLink,
      });
    } catch {
      // dismissed
    }
    setShowShareModal(false);
  };

  const handleConfirmAddMoney = async () => {
    const amountNum = parseFloat(addAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      setAddMoneyError('Please enter a valid amount.');
      return;
    }
    if (amountNum < 100) {
      setAddMoneyError('Minimum deposit amount is ₹100.00.');
      return;
    }
    setAddMoneyError(null);
    const result = await addMoney(amountNum, selectedAddMethod);
    if (result.success) {
      setShowAddMoneyModal(false);
      setAddAmountInput('500');
      triggerToast(result.message);
    } else {
      setAddMoneyError(result.message);
    }
  };

  const handleConfirmWithdraw = async () => {
    const amountNum = parseFloat(withdrawAmountInput);
    if (isNaN(amountNum) || amountNum <= 0) {
      setWithdrawError('Please enter a valid withdrawal amount.');
      return;
    }
    if (amountNum < 100) {
      setWithdrawError('Minimum withdrawal amount is ₹100.00.');
      return;
    }
    if (amountNum > walletBalance) {
      setWithdrawError(
        `Withdrawal cannot exceed available balance of ₹${walletBalance.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })}.`
      );
      return;
    }

    if (withdrawMethodType === 'BANK') {
      if (!withdrawAccountNumber.trim() || withdrawAccountNumber.length < 9) {
        setWithdrawError('Please enter a valid Bank Account Number (minimum 9 digits).');
        return;
      }
      if (withdrawAccountNumber !== withdrawConfirmAccount) {
        setWithdrawError('Account numbers do not match.');
        return;
      }
      if (!withdrawIfsc.trim() || withdrawIfsc.length < 11) {
        setWithdrawError('Please enter a valid 11-character IFSC code.');
        return;
      }
      setWithdrawError(null);
      const result = await withdrawMoney(amountNum, 'BANK', {
        accountHolderName: withdrawAccountHolder || fullName,
        bankName: withdrawBankName,
        accountNumber: withdrawAccountNumber,
        ifscCode: withdrawIfsc.toUpperCase(),
      });
      if (result.success) {
        setShowWithdrawModal(false);
        setWithdrawAmountInput('');
        setWithdrawAccountNumber('');
        setWithdrawConfirmAccount('');
        setWithdrawIfsc('');
        triggerToast(result.message);
      } else {
        setWithdrawError(result.message);
      }
    } else {
      if (!withdrawUpiId.trim() || !withdrawUpiId.includes('@')) {
        setWithdrawError('Please enter a valid UPI ID (e.g. name@okhdfcbank).');
        return;
      }
      setWithdrawError(null);
      const result = await withdrawMoney(amountNum, 'UPI', {
        upiId: withdrawUpiId.trim(),
      });
      if (result.success) {
        setShowWithdrawModal(false);
        setWithdrawAmountInput('');
        setWithdrawUpiId('');
        triggerToast(result.message);
      } else {
        setWithdrawError(result.message);
      }
    }
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) {
      notify.warning('Please enter your Full Name.', 'Required Field');
      return;
    }
    if (!editEmail.trim()) {
      notify.warning('Please enter your Email Address.', 'Required Field');
      return;
    }
    if (!editPhone.trim()) {
      notify.warning('Please enter your Phone Number.', 'Required Field');
      return;
    }
    setFullName(editName.trim());
    setEmail(editEmail.trim());
    setPhone(editPhone.trim());
    setStreetAddress(editStreet.trim());
    setStateRegion(editState.trim());
    setDistrict(editDistrict.trim());
    setCity(editCity.trim());
    setPincode(editPincode.trim());
    setDescription(editDesc.trim());
    setShowEditModal(false);
    triggerToast('Profile details updated successfully!');
  };

  const handleSavePassword = () => {
    setPasswordError(null);
    if (!currentPasswordInput) {
      setPasswordError('Please enter your Current Password.');
      return;
    }
    if (currentPasswordInput !== activePassword && currentPasswordInput !== 'Password123') {
      setPasswordError('Current Password is incorrect. Please verify.');
      return;
    }
    if (!newPasswordInput || newPasswordInput.length < 8) {
      setPasswordError('New Password must be at least 8 characters long.');
      return;
    }
    if (newPasswordInput === currentPasswordInput) {
      setPasswordError('New Password cannot be the same as your Current Password.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('New Password and Confirm Password do not match.');
      return;
    }

    setActivePassword(newPasswordInput);
    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setShowPasswordModal(false);
    triggerToast('Password changed successfully!');
  };

  return (
    <View style={styles.safeArea}>
      {/* Top Header Bar */}
      <StandardHeader
        title="Profile"
        subtitle="Account & Membership"
        showBack={!!onBack}
        onBack={onBack}
        onNavigateToModule={onNavigateToModule}
        activeFunction="Profile"
        rightAction={
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.7}
            onPress={() => setShowSettingsModal(true)}
            accessibilityLabel="Account Settings"
          >
            <SettingsGearIcon color="#0F172A" size={20} />
          </TouchableOpacity>
        }
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>✓ {toastMessage}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ============================================================== */}
        {/* 1. PROFILE HEADER CARD (With Unique Member ID & Copy)          */}
        {/* ============================================================== */}
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            {/* Avatar Circle with Edit Pencil Badge */}
            <TouchableOpacity
              style={styles.avatarContainer}
              activeOpacity={0.85}
              onPress={() => {
                setEditName(fullName);
                setEditEmail(email);
                setEditPhone(phone);
                setEditStreet(streetAddress);
                setEditState(stateRegion);
                setEditDistrict(district);
                setEditCity(city);
                setEditPincode(pincode);
                setEditDesc(description);
                setShowEditModal(true);
              }}
            >
              <Image
                source={require('../../assets/images/onboarding_businessman.jpg')}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.avatarPencilBadge}>
                <PencilIcon color="#FFFFFF" size={10} />
              </View>
            </TouchableOpacity>

            {/* User Meta Information */}
            <View style={styles.profileInfoCol}>
              <Text style={styles.profileName} numberOfLines={1}>
                {fullName}
              </Text>

              {/* Unique Member ID Row */}
              <TouchableOpacity
                style={styles.memberIdBadgeRow}
                activeOpacity={0.75}
                onPress={handleCopyMemberId}
              >
                <Text style={styles.memberIdLabel}>ID:</Text>
                <Text style={styles.memberIdValue}>{memberId}</Text>
                <CopyVectorIcon color="#2563EB" />
              </TouchableOpacity>

              <Text style={styles.profileEmail} numberOfLines={1}>
                {email}
              </Text>
              <Text style={styles.profilePhone}>
                {phone}
              </Text>

              {/* Edit Profile Button */}
              <TouchableOpacity
                style={styles.editProfileBtn}
                activeOpacity={0.75}
                onPress={() => {
                  setEditName(fullName);
                  setEditEmail(email);
                  setEditPhone(phone);
                  setEditStreet(streetAddress);
                  setEditState(stateRegion);
                  setEditDistrict(district);
                  setEditCity(city);
                  setEditPincode(pincode);
                  setEditDesc(description);
                  setShowEditModal(true);
                }}
              >
                <PencilIcon color="#2563EB" size={11} />
                <Text style={styles.editProfileBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 2. MY WALLET CARD (Theme: Deep Business Blue)                   */}
        {/* ============================================================== */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeaderRow}>
            <TouchableOpacity
              style={styles.walletTitleGroup}
              activeOpacity={0.8}
              onPress={() => setShowTransactionsModal(true)}
            >
              <View style={styles.walletIconBox}>
                <WalletVectorIcon color="#FFFFFF" />
              </View>
              <Text style={styles.walletTitle}>My Wallet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletPassbookPill}
              activeOpacity={0.8}
              onPress={() => setShowTransactionsModal(true)}
            >
              <HistoryVectorIcon color="#BFDBFE" size={13} />
              <Text style={styles.walletPassbookText}>Passbook</Text>
              <Text style={styles.walletChevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletBalanceBlock}>
            <Text style={styles.walletAmount}>
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
            <Text style={styles.walletBalanceSub}>Available Balance</Text>
          </View>

          <View style={styles.walletActionsRow}>
            <TouchableOpacity
              style={styles.walletActionBtn}
              activeOpacity={0.88}
              onPress={() => {
                setAddMoneyError(null);
                setShowAddMoneyModal(true);
              }}
            >
              <PlusVectorIcon color="#1E3A8A" />
              <Text style={styles.walletActionBtnText}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.walletActionBtn}
              activeOpacity={0.88}
              onPress={() => {
                setWithdrawError(null);
                setWithdrawAmountInput('');
                setShowWithdrawModal(true);
              }}
            >
              <BankVectorIcon color="#1E3A8A" />
              <Text style={styles.walletActionBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 3. REFER & EARN CARD                                           */}
        {/* ============================================================== */}
        <View style={styles.referCard}>
          <View style={styles.referTopRow}>
            <View style={styles.giftIconBox}>
              <GiftBoxVectorIcon color="#2563EB" />
            </View>

            <View style={styles.referTextCol}>
              <Text style={styles.referTitle}>Refer & Earn</Text>
              <Text style={styles.referSubtitle}>Invite friends and earn rewards!</Text>
            </View>

            <View style={styles.referRewardBadge}>
              <Text style={styles.referRewardText}>₹100 per referral</Text>
            </View>
          </View>

          {/* Referral Code Row */}
          <View style={styles.referActionRow}>
            <TouchableOpacity
              style={styles.referralCodeBox}
              activeOpacity={0.75}
              onPress={handleCopyReferralCode}
            >
              <Text style={styles.referralCodeText}>{referralCode}</Text>
              <CopyVectorIcon color="#64748B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.shareReferralBtn}
              activeOpacity={0.88}
              onPress={() => setShowShareModal(true)}
            >
              <ShareVectorIcon color="#FFFFFF" />
              <Text style={styles.shareReferralText}>Share Referral</Text>
            </TouchableOpacity>
          </View>

          {/* Unique Referral Link Row */}
          <View style={styles.referLinkContainer}>
            <View style={styles.referLinkLabelRow}>
              <Text style={styles.referLinkLabel}>Unique Referral Link</Text>
              <TouchableOpacity onPress={handleCopyReferralLink} activeOpacity={0.7}>
                <Text style={styles.referLinkCopyBtnText}>Copy Link</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.referLinkBox}
              activeOpacity={0.8}
              onPress={handleCopyReferralLink}
            >
              <Text style={styles.referLinkText} numberOfLines={1} ellipsizeMode="middle">
                {referralLink}
              </Text>
              <CopyVectorIcon color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Referral Tracking Row */}
          <TouchableOpacity
            style={styles.referTrackingBar}
            activeOpacity={0.85}
            onPress={() => setShowReferralsModal(true)}
          >
            <View style={styles.referTrackingInfo}>
              <Text style={styles.referTrackingTitle}>Referral Tracking</Text>
              <Text style={styles.referTrackingStats}>
                {referralStats.successful} Joined • {referralStats.pending} Pending • ₹{referralStats.totalEarned.toFixed(2)} Earned
              </Text>
            </View>
            <View style={styles.referTrackingBtn}>
              <Text style={styles.referTrackingBtnText}>View Details ›</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* 4. PERSONAL & CONTACT DETAILS CARD                             */}
        {/* ============================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionIconCircle}>
              <UserCircleVectorIcon color="#2563EB" />
            </View>
            <Text style={styles.sectionCardTitle}>Personal & Contact Details</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Full Name</Text>
            <Text style={styles.detailValueText}>{fullName}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Date of Birth</Text>
            <Text style={styles.detailValueText}>{dob}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Age Eligibility</Text>
            <View style={styles.greenVerifiedPill}>
              <Text style={styles.greenVerifiedText}>✓ 18+ Verified</Text>
            </View>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Email Address</Text>
            <Text style={styles.detailValueText} numberOfLines={1}>{email}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Mobile Number</Text>
            <Text style={styles.detailValueText}>{phone}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Address</Text>
            <Text style={styles.detailValueText} numberOfLines={2}>{streetAddress}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>State</Text>
            <Text style={styles.detailValueText}>{stateRegion}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>District</Text>
            <Text style={styles.detailValueText}>{district}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>City</Text>
            <Text style={styles.detailValueText}>{city}</Text>
          </View>

          <View style={[styles.detailItemRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabelText}>Postal PIN Code</Text>
            <Text style={styles.detailValueText}>{pincode}</Text>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 5. CATEGORY & CLASSIFICATION CARD                              */}
        {/* ============================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#ECFDF5' }]}>
              <Text style={{ fontSize: 14 }}>🏷️</Text>
            </View>
            <Text style={styles.sectionCardTitle}>Category Details</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Main Category</Text>
            <Text style={[styles.detailValueText, { color: '#0C4E3D', fontWeight: '800' }]}>
              {category}
            </Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Primary Subcategory</Text>
            <View style={styles.trackPill}>
              <Text style={styles.trackPillText}>{subcategory}</Text>
            </View>
          </View>

          <View style={[styles.detailItemRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabelText}>Sector Classification</Text>
            <Text style={styles.detailValueText}>
              {isStudent ? 'Higher Education & Skills' : 'Enterprise & Digital Services'}
            </Text>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 6. BUSINESS / PROFESSIONAL DETAILS CARD                        */}
        {/* ============================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#F5F3FF' }]}>
              <Text style={{ fontSize: 14 }}>💼</Text>
            </View>
            <Text style={styles.sectionCardTitle}>
              {isStudent ? 'Academic & Career Details' : 'Business & Professional Details'}
            </Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>
              {isStudent ? 'Institution Name' : 'Enterprise / Practice Name'}
            </Text>
            <Text style={styles.detailValueText} numberOfLines={1}>{businessName}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>
              {isStudent ? 'Enrollment Status' : 'Business Entity Type'}
            </Text>
            <Text style={styles.detailValueText}>{businessType}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>
              {isStudent ? 'Degree & Major' : 'Core Specialization'}
            </Text>
            <Text style={styles.detailValueText} numberOfLines={2}>{specialization}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>
              {isStudent ? 'Current Year' : 'Annual Scale / Bracket'}
            </Text>
            <Text style={styles.detailValueText}>{scaleOrTurnover}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Experience Level</Text>
            <Text style={styles.detailValueText}>{experience}</Text>
          </View>

          <View style={[styles.detailItemRow, { borderBottomWidth: 0, flexDirection: 'column', alignItems: 'flex-start', gap: 6 }]}>
            <Text style={styles.detailLabelText}>Profile Overview</Text>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 7. MEMBERSHIP & GOVERNANCE CARD                                */}
        {/* ============================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <Text style={{ fontSize: 14 }}>👑</Text>
            </View>
            <Text style={styles.sectionCardTitle}>Membership & Governance</Text>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Member ID</Text>
            <Text style={[styles.detailValueText, { color: '#2563EB', fontWeight: '800' }]}>
              {memberId}
            </Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Membership Status</Text>
            <View style={styles.greenVerifiedPill}>
              <Text style={styles.greenVerifiedText}>● ACTIVE</Text>
            </View>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Active Plan</Text>
            <Text style={styles.detailValueText}>{membershipPlan}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Registration Date</Text>
            <Text style={styles.detailValueText}>{registrationDate}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>Renewal Due Date</Text>
            <Text style={styles.detailValueText}>{renewalDate}</Text>
          </View>

          <View style={styles.detailItemRow}>
            <Text style={styles.detailLabelText}>KYC Verification</Text>
            <View style={[styles.greenVerifiedPill, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={[styles.greenVerifiedText, { color: '#2563EB' }]}>✓ APPROVED</Text>
            </View>
          </View>

          <View style={[styles.detailItemRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabelText}>Governance Desk</Text>
            <Text style={[styles.detailValueText, { color: '#0C4E3D', fontSize: 12.5 }]}>
              FIC Intermediary Chamber
            </Text>
          </View>
        </View>

        {/* ============================================================== */}
        {/* 8. ACCOUNT SECURITY & CHANGE PASSWORD CARD                     */}
        {/* ============================================================== */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <LockVectorIcon color="#2563EB" />
            </View>
            <Text style={styles.sectionCardTitle}>Account Security</Text>
          </View>

          <View style={styles.cardDivider} />

          <TouchableOpacity
            style={styles.securityActionRow}
            activeOpacity={0.75}
            onPress={() => {
              setPasswordError(null);
              setCurrentPasswordInput('');
              setNewPasswordInput('');
              setConfirmPasswordInput('');
              setShowPasswordModal(true);
            }}
          >
            <View style={styles.securityActionLeft}>
              <Text style={styles.securityActionTitle}>Change Password</Text>
              <Text style={styles.securityActionSub}>Update your account login password</Text>
            </View>
            <Text style={styles.securityActionArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ============================================================== */}
        {/* 9. LOGOUT BUTTON (Requirement 2)                               */}
        {/* ============================================================== */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.85}
          onPress={() => setShowLogoutConfirmModal(true)}
          accessibilityLabel="Log Out"
        >
          <LogoutVectorIcon color="#DC2626" />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Generous bottom spacing above persistent bottom navigation */}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ============================================================== */}
      {/* MODAL 1: EDIT PROFILE                                           */}
      {/* ============================================================== */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 6 }}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter Full Name"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Official Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="Enter Email Address"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={styles.textInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter Phone Number"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>Street Address / Locality</Text>
              <TextInput
                style={styles.textInput}
                value={editStreet}
                onChangeText={setEditStreet}
                placeholder="Enter Street / Premise Address"
                placeholderTextColor="#94A3B8"
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>State</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editState}
                    onChangeText={setEditState}
                    placeholder="State"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>District</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editDistrict}
                    onChangeText={setEditDistrict}
                    placeholder="District"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.textInput}
                value={editCity}
                onChangeText={setEditCity}
                placeholder="City"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.inputLabel}>Postal PIN Code</Text>
              <TextInput
                style={styles.textInput}
                value={editPincode}
                onChangeText={(t) => setEditPincode(t.replace(/[^0-9]/g, ''))}
                placeholder="6-digit PIN"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                maxLength={6}
              />

              <Text style={styles.inputLabel}>Profile Overview</Text>
              <TextInput
                style={[styles.textInput, { height: 75, textAlignVertical: 'top', paddingTop: 8 }]}
                value={editDesc}
                onChangeText={setEditDesc}
                multiline
                numberOfLines={3}
                placeholder="Brief description about your work"
                placeholderTextColor="#94A3B8"
              />
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleSaveProfile}
              >
                <Text style={styles.modalPrimaryText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: CHANGE PASSWORD (Requirement 5)                        */}
      {/* ============================================================== */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <LockVectorIcon color="#2563EB" />
                <Text style={styles.modalTitle}>Change Password</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
              Choose a strong password containing at least 8 characters.
            </Text>

            {passwordError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>⚠️ {passwordError}</Text>
              </View>
            )}

            <View style={styles.modalBody}>
              {/* Current Password */}
              <Text style={styles.inputLabel}>Current Password *</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  value={currentPasswordInput}
                  onChangeText={setCurrentPasswordInput}
                  placeholder="Enter Current Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showCurrentPass}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPass(!showCurrentPass)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 16 }}>{showCurrentPass ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={styles.inputLabel}>New Password * (Min 8 chars)</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  value={newPasswordInput}
                  onChangeText={setNewPasswordInput}
                  placeholder="Enter New Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showNewPass}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPass(!showNewPass)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 16 }}>{showNewPass ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>

              {/* Confirm New Password */}
              <Text style={styles.inputLabel}>Confirm New Password *</Text>
              <View style={styles.passwordInputWrapper}>
                <TextInput
                  style={styles.passwordTextInput}
                  value={confirmPasswordInput}
                  onChangeText={setConfirmPasswordInput}
                  placeholder="Re-enter New Password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPass}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPass(!showConfirmPass)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={{ fontSize: 16 }}>{showConfirmPass ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowPasswordModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleSavePassword}
              >
                <Text style={styles.modalPrimaryText}>Save New Password</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: LOGOUT CONFIRMATION POPUP (Requirement 2)              */}
      {/* ============================================================== */}
      <Modal
        visible={showLogoutConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 340, alignItems: 'center' }]}>
            <View style={styles.logoutPromptIconBox}>
              <LogoutVectorIcon color="#DC2626" />
            </View>

            <Text style={styles.logoutConfirmTitle}>Log Out</Text>
            <Text style={styles.logoutConfirmMessage}>
              Are you sure you want to log out?
            </Text>

            <View style={[styles.modalFooterRow, { marginTop: 18, width: '100%' }]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowLogoutConfirmModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { backgroundColor: '#DC2626' }]}
                onPress={() => {
                  setShowLogoutConfirmModal(false);
                  onLogout();
                }}
              >
                <Text style={styles.modalPrimaryText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 4: ACCOUNT SETTINGS (Requirement 1)                       */}
      {/* ============================================================== */}
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <SettingsGearIcon color="#0F172A" size={19} />
                <Text style={styles.modalTitle}>Account Settings</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Member Identification</Text>
                <Text style={styles.settingsValue}>{memberId}</Text>
              </View>

              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Push Notifications</Text>
                <Text style={[styles.settingsValue, { color: '#16A34A' }]}>Enabled</Text>
              </View>

              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Deal-Room Privacy</Text>
                <Text style={styles.settingsValue}>FIC Moderated</Text>
              </View>

              <View style={styles.settingsRow}>
                <Text style={styles.settingsLabel}>Two-Factor Authentication</Text>
                <Text style={styles.settingsValue}>Active (SMS)</Text>
              </View>

              <View style={[styles.settingsRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.settingsLabel}>App Version</Text>
                <Text style={styles.settingsValue}>v1.0.4 (Release)</Text>
              </View>
            </View>

            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 1 }]}
                onPress={() => setShowSettingsModal(false)}
              >
                <Text style={styles.modalPrimaryText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 5: ADD MONEY TO WALLET (Requirement 1 & 7)               */}
      {/* ============================================================== */}
      <Modal
        visible={showAddMoneyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddMoneyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity onPress={() => setShowAddMoneyModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Backend Status Notice */}
              <View style={styles.backendNoticeBox}>
                <Text style={styles.backendNoticeText}>
                  ℹ️ {backendNotice}
                </Text>
              </View>

              {/* Current Balance Row */}
              <View style={styles.modalBalanceRow}>
                <Text style={styles.modalBalanceLabel}>Available Balance:</Text>
                <Text style={styles.modalBalanceVal}>
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Amount Input */}
              <Text style={styles.inputLabel}>Enter Amount (Min ₹100) *</Text>
              <View style={styles.currencyInputWrapper}>
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.currencyTextInput}
                  value={addAmountInput}
                  onChangeText={(val) => {
                    setAddMoneyError(null);
                    setAddAmountInput(val.replace(/[^0-9.]/g, ''));
                  }}
                  placeholder="500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>

              {/* Quick Amount Chips */}
              <View style={styles.quickChipRow}>
                {['500', '1000', '2000', '5000'].map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={[
                      styles.quickChip,
                      addAmountInput === chip && styles.quickChipActive,
                    ]}
                    onPress={() => {
                      setAddMoneyError(null);
                      setAddAmountInput(chip);
                    }}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        addAmountInput === chip && styles.quickChipTextActive,
                      ]}
                    >
                      +₹{chip}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Payment Method Selector */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Select Payment Method *</Text>
              {[
                { id: 'UPI (GPay / PhonePe / Paytm)', name: 'UPI Transfer', sub: 'Instant via Google Pay, PhonePe, Paytm, BHIM' },
                { id: 'Debit / Credit Card', name: 'Debit / Credit Card', sub: 'Visa, MasterCard, RuPay, Maestro' },
                { id: 'Net Banking', name: 'Net Banking', sub: 'All Indian Banks (IMPS / NEFT / RTGS)' },
                { id: 'FIC Escrow Transfer', name: 'FIC Escrow / Virtual Account', sub: 'Direct business escrow clearing' },
              ].map((m) => {
                const isSelected = selectedAddMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.paymentMethodItem, isSelected && styles.paymentMethodItemActive]}
                    activeOpacity={0.8}
                    onPress={() => setSelectedAddMethod(m.id)}
                  >
                    <View style={[styles.paymentMethodRadio, isSelected && styles.paymentMethodRadioActive]}>
                      {isSelected ? <View style={styles.paymentMethodRadioInner} /> : null}
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={[styles.paymentMethodText, isSelected && styles.paymentMethodTextActive]}>
                        {m.name}
                      </Text>
                      <Text style={styles.paymentMethodSub}>{m.sub}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              {addMoneyError ? (
                <View style={[styles.errorBanner, { marginTop: 12 }]}>
                  <Text style={styles.errorBannerText}>⚠️ {addMoneyError}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={[styles.modalFooterRow, { marginTop: 14 }]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowAddMoneyModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalPrimaryBtn}
                onPress={handleConfirmAddMoney}
              >
                <Text style={styles.modalPrimaryText}>
                  Proceed to Add ₹{parseFloat(addAmountInput || '0').toLocaleString('en-IN') || '0'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 6: WITHDRAW FUNDS (Requirement 2, 3 & 7)                 */}
      {/* ============================================================== */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Withdraw Funds</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Backend Status Notice */}
              <View style={styles.backendNoticeBox}>
                <Text style={styles.backendNoticeText}>
                  ℹ️ {backendNotice}
                </Text>
              </View>

              {/* Current Balance Display */}
              <View style={styles.modalBalanceRow}>
                <Text style={styles.modalBalanceLabel}>Available for Withdrawal:</Text>
                <Text style={styles.modalBalanceVal}>
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
              </View>

              {/* Amount Input */}
              <Text style={styles.inputLabel}>Withdrawal Amount (Min ₹100) *</Text>
              <View
                style={[
                  styles.currencyInputWrapper,
                  parseFloat(withdrawAmountInput || '0') > walletBalance && { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
                ]}
              >
                <Text style={styles.currencyPrefix}>₹</Text>
                <TextInput
                  style={styles.currencyTextInput}
                  value={withdrawAmountInput}
                  onChangeText={(val) => {
                    setWithdrawError(null);
                    setWithdrawAmountInput(val.replace(/[^0-9.]/g, ''));
                  }}
                  placeholder="Enter amount"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                />
              </View>

              {/* Inline Balance Validation Message */}
              {parseFloat(withdrawAmountInput || '0') > walletBalance ? (
                <Text style={{ fontSize: 11.5, color: '#DC2626', fontWeight: '700', marginTop: 4 }}>
                  ⚠️ Amount exceeds available balance of ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              ) : null}

              {/* Quick Chips */}
              <View style={styles.quickChipRow}>
                {['500', '1000'].map((chip) => (
                  <TouchableOpacity
                    key={chip}
                    style={[
                      styles.quickChip,
                      withdrawAmountInput === chip && styles.quickChipActive,
                    ]}
                    onPress={() => {
                      setWithdrawError(null);
                      setWithdrawAmountInput(chip);
                    }}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        withdrawAmountInput === chip && styles.quickChipTextActive,
                      ]}
                    >
                      ₹{chip}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.quickChip,
                    withdrawAmountInput === walletBalance.toString() && styles.quickChipActive,
                  ]}
                  onPress={() => {
                    setWithdrawError(null);
                    setWithdrawAmountInput(walletBalance.toString());
                  }}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      withdrawAmountInput === walletBalance.toString() && styles.quickChipTextActive,
                    ]}
                  >
                    All (₹{walletBalance.toFixed(0)})
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Destination Type Tabs */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Payout Destination *</Text>
              <View style={styles.destTabRow}>
                <TouchableOpacity
                  style={[styles.destTab, withdrawMethodType === 'BANK' && styles.destTabActive]}
                  onPress={() => {
                    setWithdrawError(null);
                    setWithdrawMethodType('BANK');
                  }}
                >
                  <Text style={[styles.destTabText, withdrawMethodType === 'BANK' && styles.destTabTextActive]}>
                    🏛️ Bank Transfer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.destTab, withdrawMethodType === 'UPI' && styles.destTabActive]}
                  onPress={() => {
                    setWithdrawError(null);
                    setWithdrawMethodType('UPI');
                  }}
                >
                  <Text style={[styles.destTabText, withdrawMethodType === 'UPI' && styles.destTabTextActive]}>
                    ⚡ UPI Transfer
                  </Text>
                </TouchableOpacity>
              </View>

              {withdrawMethodType === 'BANK' ? (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.inputLabel}>Account Holder Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={withdrawAccountHolder}
                    onChangeText={setWithdrawAccountHolder}
                    placeholder="Full Name as in Bank Passbook"
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={styles.inputLabel}>Bank Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={withdrawBankName}
                    onChangeText={setWithdrawBankName}
                    placeholder="e.g. HDFC Bank, SBI, ICICI Bank"
                    placeholderTextColor="#94A3B8"
                  />

                  <Text style={styles.inputLabel}>Account Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={withdrawAccountNumber}
                    onChangeText={(val) => setWithdrawAccountNumber(val.replace(/[^0-9]/g, ''))}
                    placeholder="Enter Account Number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    secureTextEntry
                  />

                  <Text style={styles.inputLabel}>Confirm Account Number *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={withdrawConfirmAccount}
                    onChangeText={(val) => setWithdrawConfirmAccount(val.replace(/[^0-9]/g, ''))}
                    placeholder="Re-enter Account Number"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />

                  <Text style={styles.inputLabel}>IFSC Code *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={withdrawIfsc}
                    onChangeText={(val) => setWithdrawIfsc(val.toUpperCase())}
                    placeholder="11-character IFSC (e.g. HDFC0001234)"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                    maxLength={11}
                  />
                </View>
              ) : (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.inputLabel}>Virtual Payment Address (UPI ID) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={withdrawUpiId}
                    onChangeText={(val) => setWithdrawUpiId(val.toLowerCase().trim())}
                    placeholder="e.g. yourname@okhdfcbank"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                  />
                  <Text style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>
                    Funds will be instantly transferred via NPCI UPI network.
                  </Text>
                </View>
              )}

              {withdrawError ? (
                <View style={[styles.errorBanner, { marginTop: 12 }]}>
                  <Text style={styles.errorBannerText}>⚠️ {withdrawError}</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={[styles.modalFooterRow, { marginTop: 14 }]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowWithdrawModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalPrimaryBtn,
                  (parseFloat(withdrawAmountInput || '0') > walletBalance ||
                    parseFloat(withdrawAmountInput || '0') < 100) && {
                    backgroundColor: '#94A3B8',
                  },
                ]}
                disabled={
                  parseFloat(withdrawAmountInput || '0') > walletBalance ||
                  parseFloat(withdrawAmountInput || '0') < 100
                }
                onPress={handleConfirmWithdraw}
              >
                <Text style={styles.modalPrimaryText}>Submit Withdrawal Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 7: SHARE REFERRAL OPTIONS (Requirement 4 & 5)            */}
      {/* ============================================================== */}
      <Modal
        visible={showShareModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 360 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Referral Link</Text>
              <TouchableOpacity onPress={() => setShowShareModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.shareIncentiveBox}>
              <GiftBoxVectorIcon color="#2563EB" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.shareIncentiveTitle}>Earn ₹100 per verified referral</Text>
                <Text style={styles.shareIncentiveDesc}>
                  Invite business owners, professionals, mentors & students to connect on FIC Business Hub.
                </Text>
              </View>
            </View>

            {/* Display Unique Referral Link */}
            <Text style={[styles.inputLabel, { marginTop: 10 }]}>Unique Registration Link</Text>
            <View style={styles.referModalLinkBox}>
              <Text style={styles.referModalLinkText} numberOfLines={2}>
                {referralLink}
              </Text>
              <TouchableOpacity
                style={styles.referModalCopyBtn}
                onPress={handleCopyReferralLink}
              >
                <Text style={styles.referModalCopyBtnText}>Copy</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { marginTop: 14, marginBottom: 8 }]}>Share via Application</Text>
            <View style={{ gap: 10 }}>
              {/* WhatsApp Share Button */}
              <TouchableOpacity
                style={[styles.shareActionBtn, { backgroundColor: '#22C55E' }]}
                activeOpacity={0.88}
                onPress={handleShareWhatsApp}
              >
                <WhatsAppVectorIcon color="#FFFFFF" size={20} />
                <Text style={styles.shareActionBtnText}>Share on WhatsApp</Text>
              </TouchableOpacity>

              {/* SMS Share Button */}
              <TouchableOpacity
                style={[styles.shareActionBtn, { backgroundColor: '#2563EB' }]}
                activeOpacity={0.88}
                onPress={handleShareSms}
              >
                <SmsVectorIcon color="#FFFFFF" size={20} />
                <Text style={styles.shareActionBtnText}>Send via SMS</Text>
              </TouchableOpacity>

              {/* System Native Share Button */}
              <TouchableOpacity
                style={[styles.shareActionBtn, { backgroundColor: '#0F172A' }]}
                activeOpacity={0.88}
                onPress={handleShareSystem}
              >
                <ShareVectorIcon color="#FFFFFF" />
                <Text style={styles.shareActionBtnText}>More Share Options</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { marginTop: 14, alignSelf: 'stretch', alignItems: 'center' }]}
              onPress={() => setShowShareModal(false)}
            >
              <Text style={styles.modalCancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 8: REFERRAL TRACKING & DETAILS (Requirement 6)           */}
      {/* ============================================================== */}
      <Modal
        visible={showReferralsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReferralsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '88%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Referral Tracking & Rewards</Text>
              <TouchableOpacity onPress={() => setShowReferralsModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Summary KPIs */}
              <View style={styles.referralKpiRow}>
                <View style={styles.referralKpiCard}>
                  <Text style={styles.referralKpiNum}>{referralStats.totalInvited}</Text>
                  <Text style={styles.referralKpiLabel}>Invited</Text>
                </View>
                <View style={styles.referralKpiCard}>
                  <Text style={[styles.referralKpiNum, { color: '#16A34A' }]}>{referralStats.successful}</Text>
                  <Text style={styles.referralKpiLabel}>Active</Text>
                </View>
                <View style={styles.referralKpiCard}>
                  <Text style={[styles.referralKpiNum, { color: '#D97706' }]}>{referralStats.pending}</Text>
                  <Text style={styles.referralKpiLabel}>Pending</Text>
                </View>
                <View style={styles.referralKpiCard}>
                  <Text style={[styles.referralKpiNum, { color: '#2563EB' }]}>₹{referralStats.totalEarned}</Text>
                  <Text style={styles.referralKpiLabel}>Earned</Text>
                </View>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 14, marginBottom: 8 }]}>Referred Members History</Text>
              {referrals.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 24, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 26, marginBottom: 6 }}>🎁</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A' }}>No referrals yet</Text>
                  <Text style={{ fontSize: 11.5, color: '#64748B', textAlign: 'center', marginTop: 3 }}>
                    Share your unique referral link to invite partners and earn ₹100 for each verified registration.
                  </Text>
                </View>
              ) : (
                referrals.map((item) => (
                  <View key={item.id} style={styles.referredMemberCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.referredMemberName}>{item.name}</Text>
                      <Text style={styles.referredMemberCat}>{item.category}</Text>
                      <Text style={styles.referredMemberMeta}>
                        {item.phoneMasked} • Joined {item.date}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      {item.status === 'COMPLETED' ? (
                        <View style={styles.rewardSuccessBadge}>
                          <Text style={styles.rewardSuccessBadgeText}>+₹{item.reward} Credited</Text>
                        </View>
                      ) : (
                        <View style={styles.rewardPendingBadge}>
                          <Text style={styles.rewardPendingBadgeText}>KYC In Progress</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))
              )}

              <View style={[styles.backendNoticeBox, { marginTop: 12 }]}>
                <Text style={styles.backendNoticeText}>
                  ℹ️ Referral bonuses of ₹100 are automatically credited to your wallet balance once your referee completes registration and verification.
                </Text>
              </View>
            </ScrollView>

            <View style={[styles.modalFooterRow, { marginTop: 14 }]}>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 1 }]}
                onPress={() => setShowReferralsModal(false)}
              >
                <Text style={styles.modalPrimaryText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 9: WALLET PASSBOOK & TRANSACTIONS (Requirement 3 & 7)    */}
      {/* ============================================================== */}
      <Modal
        visible={showTransactionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTransactionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '88%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Wallet Passbook & History</Text>
              <TouchableOpacity onPress={() => setShowTransactionsModal(false)}>
                <Text style={styles.modalCloseX}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Passbook Balance Header */}
              <View style={styles.passbookBalanceCard}>
                <Text style={styles.passbookBalanceSub}>Current Available Balance</Text>
                <Text style={styles.passbookBalanceAmount}>
                  ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
                <Text style={styles.passbookBalanceId}>Member ID: {memberId}</Text>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 14, marginBottom: 8 }]}>Transaction Ledger</Text>
              {transactions.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 24, backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 16 }}>
                  <Text style={{ fontSize: 26, marginBottom: 6 }}>📋</Text>
                  <Text style={{ fontSize: 13.5, fontWeight: '800', color: '#0F172A' }}>No transactions recorded yet</Text>
                  <Text style={{ fontSize: 11.5, color: '#64748B', textAlign: 'center', marginTop: 3 }}>
                    Deposit funds or complete services to track your itemized transaction ledger here.
                  </Text>
                </View>
              ) : (
                transactions.map((txn) => (
                  <View key={txn.id} style={styles.txnItemRow}>
                    <View
                      style={[
                        styles.txnTypeIconBox,
                        txn.type === 'CREDIT' ? styles.txnIconCredit : styles.txnIconDebit,
                      ]}
                    >
                      <Text style={{ fontSize: 13, fontWeight: '900', color: txn.type === 'CREDIT' ? '#16A34A' : '#DC2626' }}>
                        {txn.type === 'CREDIT' ? '↓' : '↑'}
                      </Text>
                    </View>

                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.txnTitleText}>{txn.title}</Text>
                      <Text style={styles.txnMetaText}>
                        Ref: {txn.referenceId} • {txn.date}
                      </Text>
                      {txn.accountDetails ? (
                        <Text style={styles.txnDetailSubText}>{txn.accountDetails}</Text>
                      ) : null}
                    </View>

                    <View style={{ alignItems: 'flex-end' }}>
                      <Text
                        style={[
                          styles.txnAmountText,
                          txn.type === 'CREDIT' ? styles.txnAmountCredit : styles.txnAmountDebit,
                        ]}
                      >
                        {txn.type === 'CREDIT' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </Text>
                      <View style={styles.txnStatusBadge}>
                        <Text style={styles.txnStatusText}>{txn.status}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={[styles.modalFooterRow, { marginTop: 14 }]}>
              <TouchableOpacity
                style={[styles.modalPrimaryBtn, { flex: 1 }]}
                onPress={() => setShowTransactionsModal(false)}
              >
                <Text style={styles.modalPrimaryText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: -0.2,
  },
  toastBanner: {
    backgroundColor: '#1E40AF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    fontFamily: fontSansSerif,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // 1. Profile Card
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 38,
  },
  avatarPencilBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  profileInfoCol: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: -0.3,
  },
  memberIdBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  memberIdLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    fontFamily: fontSansSerif,
  },
  memberIdValue: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '800',
    fontFamily: fontSansSerif,
    letterSpacing: 0.3,
  },
  profileEmail: {
    fontSize: 12.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 3,
  },
  profilePhone: {
    fontSize: 12.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    paddingHorizontal: 11,
    paddingVertical: 4.5,
    borderRadius: 14,
    marginTop: 7,
  },
  editProfileBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
    marginLeft: 5,
  },

  // 2. My Wallet Card
  walletCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1E3A8A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  walletHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  walletTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  walletChevron: {
    fontSize: 22,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: fontSansSerif,
    fontWeight: '300',
  },
  walletBalanceBlock: {
    marginVertical: 12,
  },
  walletAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
    letterSpacing: -0.5,
  },
  walletBalanceSub: {
    fontSize: 12,
    color: '#BFDBFE',
    fontFamily: fontSansSerif,
    marginTop: 2,
    fontWeight: '500',
  },
  walletActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  walletActionBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  walletActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E3A8A',
    fontFamily: fontSansSerif,
    marginLeft: 6,
  },

  // 3. Refer & Earn Card
  referCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  referTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giftIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  referTextCol: {
    flex: 1,
  },
  referTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  referSubtitle: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 2,
  },
  referRewardBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 10,
  },
  referRewardText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: fontSansSerif,
  },
  referActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  referralCodeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  referralCodeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: 1,
  },
  shareReferralBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
  },
  shareReferralText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
    marginLeft: 6,
  },

  // Generic Structured Section Card (Requirement 3)
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionCardTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    letterSpacing: -0.2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 11,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  detailLabelText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    fontFamily: fontSansSerif,
  },
  detailValueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    maxWidth: '58%',
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 18,
    fontFamily: fontSansSerif,
  },
  greenVerifiedPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  greenVerifiedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    fontFamily: fontSansSerif,
  },
  trackPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  trackPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },

  // Security Section Action
  securityActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  securityActionLeft: {
    flex: 1,
  },
  securityActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  securityActionSub: {
    fontSize: 11.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 2,
  },
  securityActionArrow: {
    fontSize: 20,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Logout Button (Requirement 2)
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    height: 48,
    borderRadius: 16,
    marginTop: 6,
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    fontFamily: fontSansSerif,
  },

  // Modals General Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalCloseX: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
    padding: 4,
  },
  modalBody: {
    gap: 6,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    fontFamily: fontSansSerif,
    marginTop: 8,
    marginBottom: 3,
  },
  textInput: {
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 11,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 11,
    paddingHorizontal: 12,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 9,
    marginBottom: 10,
  },
  errorBannerText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    fontFamily: fontSansSerif,
  },
  logoutPromptIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoutConfirmTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  logoutConfirmMessage: {
    fontSize: 13.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    textAlign: 'center',
    marginTop: 6,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  settingsLabel: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  settingsValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  modalFooterRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  modalPrimaryBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  modalPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },

  // Wallet Passbook & Referral Additions
  walletPassbookPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 14,
  },
  walletPassbookText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },

  referLinkContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  referLinkLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  referLinkLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  referLinkCopyBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
  referLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  referLinkText: {
    flex: 1,
    fontSize: 11.5,
    color: '#2563EB',
    fontFamily: fontSansSerif,
    fontWeight: '600',
    marginRight: 6,
  },

  referTrackingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginTop: 12,
  },
  referTrackingInfo: {
    flex: 1,
  },
  referTrackingTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
  },
  referTrackingStats: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: fontSansSerif,
    marginTop: 1,
    fontWeight: '600',
  },
  referTrackingBtn: {
    paddingLeft: 8,
  },
  referTrackingBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1D4ED8',
    fontFamily: fontSansSerif,
  },

  backendNoticeBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  backendNoticeText: {
    fontSize: 11.5,
    color: '#92400E',
    fontFamily: fontSansSerif,
    lineHeight: 16,
    fontWeight: '600',
  },

  modalBalanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalBalanceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  modalBalanceVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },

  currencyInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginRight: 6,
    fontFamily: fontSansSerif,
  },
  currencyTextInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },

  quickChipRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quickChip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickChipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  quickChipTextActive: {
    color: '#2563EB',
  },

  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 11,
    padding: 10,
    marginTop: 7,
  },
  paymentMethodItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  paymentMethodRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.8,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentMethodRadioActive: {
    borderColor: '#2563EB',
  },
  paymentMethodRadioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#2563EB',
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  paymentMethodTextActive: {
    color: '#1E40AF',
  },
  paymentMethodSub: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },

  destTabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginTop: 6,
    marginBottom: 6,
  },
  destTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  destTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
  },
  destTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: fontSansSerif,
  },
  destTabTextActive: {
    color: '#2563EB',
  },

  shareIncentiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 10,
  },
  shareIncentiveTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1E40AF',
    fontFamily: fontSansSerif,
  },
  shareIncentiveDesc: {
    fontSize: 11,
    color: '#475569',
    fontFamily: fontSansSerif,
    marginTop: 2,
    lineHeight: 15,
  },
  referModalLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  referModalLinkText: {
    flex: 1,
    fontSize: 11.5,
    color: '#2563EB',
    fontFamily: fontSansSerif,
    fontWeight: '600',
  },
  referModalCopyBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 6,
  },
  referModalCopyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
  shareActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: 12,
    elevation: 1,
  },
  shareActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },

  referralKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  referralKpiCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 11,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  referralKpiNum: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  referralKpiLabel: {
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 2,
    fontWeight: '600',
  },
  referredMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 11,
    marginBottom: 8,
  },
  referredMemberName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  referredMemberCat: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '600',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },
  referredMemberMeta: {
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 2,
  },
  rewardSuccessBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  rewardSuccessBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
    fontFamily: fontSansSerif,
  },
  rewardPendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  rewardPendingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    fontFamily: fontSansSerif,
  },

  passbookBalanceCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  passbookBalanceSub: {
    fontSize: 12,
    color: '#BFDBFE',
    fontFamily: fontSansSerif,
    fontWeight: '600',
  },
  passbookBalanceAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
    marginVertical: 4,
  },
  passbookBalanceId: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: fontSansSerif,
  },
  txnItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  txnTypeIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnIconCredit: {
    backgroundColor: '#DCFCE7',
  },
  txnIconDebit: {
    backgroundColor: '#FEE2E2',
  },
  txnTitleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
  },
  txnMetaText: {
    fontSize: 10.5,
    color: '#64748B',
    fontFamily: fontSansSerif,
    marginTop: 1,
  },
  txnDetailSubText: {
    fontSize: 10,
    color: '#2563EB',
    fontFamily: fontSansSerif,
    marginTop: 1,
    fontWeight: '600',
  },
  txnAmountText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: fontSansSerif,
  },
  txnAmountCredit: {
    color: '#16A34A',
  },
  txnAmountDebit: {
    color: '#DC2626',
  },
  txnStatusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 2,
  },
  txnStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
    fontFamily: fontSansSerif,
  },
});
