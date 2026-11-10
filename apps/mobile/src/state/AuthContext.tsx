import React, { createContext, useContext, useState } from 'react';
import { UserProfile, MemberRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (role?: MemberRole, customData?: Partial<UserProfile>) => void;
  logout: () => void;
  switchRole: (role: MemberRole) => void;
  updateKYCStatus: (status: UserProfile['kycStatus']) => void;
}

const defaultMockUser: UserProfile = {
  id: 'usr_fic_9021',
  fullName: 'Member',
  email: 'member@fic.org',
  phone: '+91 98765 43210',
  role: 'MSME',
  membershipPlan: 'FIC_ENTERPRISE',
  membershipStatus: 'ACTIVE',
  kycStatus: 'APPROVED',
  category: 'Technology & Digital',
  subcategory: 'Software Development',
};

// Persistent registry of registered members to maintain profile integrity across logout/login
const registeredProfilesDB: Record<string, Partial<UserProfile>> = {
  'member@fic.org': {
    fullName: 'Member',
    email: 'member@fic.org',
    category: 'Technology & Digital',
    subcategory: 'Software Development',
    role: 'MSME',
  },
  'dr.sundaram@mentor.fic.org': {
    fullName: 'Dr. K. S. Sundaram',
    email: 'dr.sundaram@mentor.fic.org',
    category: 'Education & Knowledge',
    subcategory: 'Mentor / Trainer',
    role: 'MENTOR',
  },
  'dr.anand@mentor.fic.org': {
    fullName: 'Dr. Anand Kumar',
    email: 'dr.anand@mentor.fic.org',
    category: 'Education & Knowledge',
    subcategory: 'Teacher / Professor',
    role: 'MENTOR',
  },
  'prof.anand@mentor.fic.org': {
    fullName: 'Prof. Anand Kumar',
    email: 'prof.anand@mentor.fic.org',
    category: 'Education & Knowledge',
    subcategory: 'Teacher / Professor',
    role: 'MENTOR',
  },
  'karthik.raja@student.fic.org': {
    fullName: 'Karthik Raja',
    email: 'karthik.raja@student.fic.org',
    category: 'Education & Knowledge',
    subcategory: 'Student',
    role: 'STUDENT',
  },
  'priya.sundaram@student.fic.org': {
    fullName: 'Priya Sundaram',
    email: 'priya.sundaram@student.fic.org',
    category: 'Education & Knowledge',
    subcategory: 'Student',
    role: 'STUDENT',
  },
};

let lastRegisteredProfile: Partial<UserProfile> | null = {
  fullName: 'Member',
  email: 'member@fic.org',
  category: 'Technology & Digital',
  subcategory: 'Software Development',
  role: 'MSME',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = (role: MemberRole = 'MSME', customData?: Partial<UserProfile>) => {
    const emailKey = (customData?.email || '').trim().toLowerCase();
    
    // Save registration details to registry if provided
    if (customData?.category && customData?.subcategory) {
      if (emailKey) {
        registeredProfilesDB[emailKey] = { ...customData, role };
      }
      lastRegisteredProfile = { ...customData, role };
    }

    // Retrieve existing registration details if available
    const savedProfile = (emailKey && registeredProfilesDB[emailKey]) || lastRegisteredProfile;

    const resolvedCategory =
      customData?.category ||
      savedProfile?.category ||
      (role === 'STUDENT' || role === 'MENTOR' ? 'Education & Knowledge' : defaultMockUser.category);

    const resolvedSubcategory =
      customData?.subcategory ||
      (customData as any)?.subCategory ||
      savedProfile?.subcategory ||
      (role === 'STUDENT' ? 'Student' : role === 'MENTOR' ? 'Mentor' : defaultMockUser.subcategory);

    setUser({
      ...defaultMockUser,
      role,
      fullName: customData?.fullName || savedProfile?.fullName || 'Member',
      category: resolvedCategory,
      subcategory: resolvedSubcategory,
      ...customData,
    });
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: MemberRole) => {
    if (user) {
      setUser({ ...user, role: newRole });
    }
  };

  const updateKYCStatus = (kycStatus: UserProfile['kycStatus']) => {
    if (user) {
      setUser({ ...user, kycStatus });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        switchRole,
        updateKYCStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

