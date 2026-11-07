import React, { createContext, useContext, useState, useMemo } from 'react';

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  title: string;
  amount: number;
  date: string;
  referenceId: string;
  paymentMethod: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  accountDetails?: string;
}

export interface ReferralRecord {
  id: string;
  name: string;
  emailMasked: string;
  phoneMasked: string;
  category: string;
  date: string;
  status: 'COMPLETED' | 'PENDING';
  reward: number;
}

export interface ReferralStats {
  totalInvited: number;
  successful: number;
  pending: number;
  totalEarned: number;
}

export interface BankWithdrawalDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

export interface UpiWithdrawalDetails {
  upiId: string;
}

interface WalletReferralContextType {
  walletBalance: number;
  transactions: WalletTransaction[];
  referralCode: string;
  referralLink: string;
  memberId: string;
  referrals: ReferralRecord[];
  referralStats: ReferralStats;
  isBackendConnected: boolean;
  backendNotice: string;
  addMoney: (
    amount: number,
    paymentMethod: string,
    notes?: string
  ) => Promise<{ success: boolean; message: string; newBalance: number }>;
  withdrawMoney: (
    amount: number,
    methodType: 'BANK' | 'UPI',
    details: BankWithdrawalDetails | UpiWithdrawalDetails
  ) => Promise<{ success: boolean; message: string; newBalance: number }>;
  registerReferral: (
    code: string,
    newUserName: string,
    category: string
  ) => { success: boolean; message: string };
}

const WalletReferralContext = createContext<WalletReferralContextType | undefined>(undefined);

export const WalletReferralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletBalance, setWalletBalance] = useState<number>(0.0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);

  const referralCode = 'REF1234';
  const memberId = 'FIC-M-000001';
  const referralLink = `https://ficbusinesshub.com/register?ref=${referralCode}&mid=${memberId}`;

  // Live Banking Backend Status
  // Since there is no live banking server, real-money transactions are disabled and run in sandbox ledger test mode
  const isBackendConnected = false;
  const backendNotice =
    'Live Banking Gateway Disconnected: Real-money operations are disabled in this environment. Test sandbox ledger verification active.';

  const referralStats: ReferralStats = useMemo(() => {
    const totalInvited = referrals.length;
    const successful = referrals.filter((r) => r.status === 'COMPLETED').length;
    const pending = referrals.filter((r) => r.status === 'PENDING').length;
    const totalEarned = referrals
      .filter((r) => r.status === 'COMPLETED')
      .reduce((sum, r) => sum + r.reward, 0);

    return { totalInvited, successful, pending, totalEarned };
  }, [referrals]);

  const addMoney = async (
    amount: number,
    paymentMethod: string,
    notes?: string
  ): Promise<{ success: boolean; message: string; newBalance: number }> => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, message: 'Please enter a valid amount greater than ₹0.', newBalance: walletBalance };
    }
    if (amount < 100) {
      return { success: false, message: 'Minimum deposit amount is ₹100.00.', newBalance: walletBalance };
    }

    const refId = `DEP-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const formattedTime = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + `, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;

    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'CREDIT',
      title: `Wallet Deposit (${paymentMethod})`,
      amount,
      date: `Today, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      referenceId: refId,
      paymentMethod,
      status: 'SUCCESS',
      accountDetails: notes || 'Sandbox Verified Top-up',
    };

    const newBalance = walletBalance + amount;
    setWalletBalance(newBalance);
    setTransactions((prev) => [newTxn, ...prev]);

    return {
      success: true,
      message: `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} added successfully via ${paymentMethod}!`,
      newBalance,
    };
  };

  const withdrawMoney = async (
    amount: number,
    methodType: 'BANK' | 'UPI',
    details: BankWithdrawalDetails | UpiWithdrawalDetails
  ): Promise<{ success: boolean; message: string; newBalance: number }> => {
    if (amount <= 0 || isNaN(amount)) {
      return { success: false, message: 'Please enter a valid withdrawal amount.', newBalance: walletBalance };
    }
    if (amount < 100) {
      return { success: false, message: 'Minimum withdrawal amount is ₹100.00.', newBalance: walletBalance };
    }
    if (amount > walletBalance) {
      return {
        success: false,
        message: `Withdrawal amount (₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) exceeds available balance (₹${walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}).`,
        newBalance: walletBalance,
      };
    }

    const now = new Date();
    const refId = `WTH-${Date.now().toString().slice(-6)}`;
    let destinationLabel = '';
    let accountDesc = '';

    if (methodType === 'BANK') {
      const bank = details as BankWithdrawalDetails;
      destinationLabel = `${bank.bankName || 'Bank'} A/C`;
      accountDesc = `A/C: ****${bank.accountNumber?.slice(-4) || '****'} | IFSC: ${bank.ifscCode || ''}`;
    } else {
      const upi = details as UpiWithdrawalDetails;
      destinationLabel = `UPI (${upi.upiId})`;
      accountDesc = `VPA: ${upi.upiId}`;
    }

    const newTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'DEBIT',
      title: `Withdrawal to ${destinationLabel}`,
      amount,
      date: `Today, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      referenceId: refId,
      paymentMethod: methodType === 'BANK' ? 'Bank Transfer (IMPS)' : 'Instant UPI',
      status: 'SUCCESS',
      accountDetails: accountDesc,
    };

    const newBalance = walletBalance - amount;
    setWalletBalance(newBalance);
    setTransactions((prev) => [newTxn, ...prev]);

    return {
      success: true,
      message: `Withdrawal request of ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} processed successfully to ${destinationLabel}!`,
      newBalance,
    };
  };

  const registerReferral = (
    code: string,
    newUserName: string,
    category: string
  ): { success: boolean; message: string } => {
    if (!code || code.trim().toUpperCase() !== referralCode.toUpperCase()) {
      return { success: false, message: 'Invalid referral code.' };
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const newRecord: ReferralRecord = {
      id: `REF-REC-${Date.now().toString().slice(-4)}`,
      name: newUserName || 'New Member',
      emailMasked: `${newUserName.toLowerCase().replace(/\s+/g, '.')}***@fic.org`,
      phoneMasked: '+91 98*** ' + Math.floor(10000 + Math.random() * 90000),
      category: category || 'General Member',
      date: formattedDate,
      status: 'COMPLETED',
      reward: 100,
    };

    // Credit referral reward
    const rewardTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'CREDIT',
      title: `Referral Reward (${newUserName})`,
      amount: 100.0,
      date: `Today, ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
      referenceId: `REF-${Date.now().toString().slice(-6)}`,
      paymentMethod: 'Referral Reward',
      status: 'SUCCESS',
      accountDetails: `Member Referral: ${newUserName} (${category})`,
    };

    setReferrals((prev) => [newRecord, ...prev]);
    setWalletBalance((prev) => prev + 100);
    setTransactions((prev) => [rewardTxn, ...prev]);

    return {
      success: true,
      message: `Referral associated with ${newUserName}! ₹100.00 referral reward credited to your wallet.`,
    };
  };

  return (
    <WalletReferralContext.Provider
      value={{
        walletBalance,
        transactions,
        referralCode,
        referralLink,
        memberId,
        referrals,
        referralStats,
        isBackendConnected,
        backendNotice,
        addMoney,
        withdrawMoney,
        registerReferral,
      }}
    >
      {children}
    </WalletReferralContext.Provider>
  );
};

export const useWalletReferral = (): WalletReferralContextType => {
  const context = useContext(WalletReferralContext);
  if (!context) {
    throw new Error('useWalletReferral must be used within a WalletReferralProvider');
  }
  return context;
};

