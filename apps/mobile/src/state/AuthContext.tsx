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
  category: 'Business & Entrepreneurship',
  subcategory: 'Business Member',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = (role: MemberRole = 'MSME', customData?: Partial<UserProfile>) => {
    setUser({
      ...defaultMockUser,
      role,
      fullName:
        customData?.fullName || 'Member',
      category:
        customData?.category ||
        (role === 'STUDENT' || role === 'MENTOR'
          ? 'Education & Knowledge'
          : defaultMockUser.category),
      subcategory:
        customData?.subcategory ||
        (role === 'STUDENT' ? 'Student' : role === 'MENTOR' ? 'Mentor' : defaultMockUser.subcategory),
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

