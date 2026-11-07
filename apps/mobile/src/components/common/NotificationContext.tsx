import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Modal,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const fontSansSerif = Platform.OS === 'android' ? 'sans-serif' : 'System';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id?: number;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  secondaryText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onSecondary?: () => void;
  onCancel?: () => void;
}

export interface NotificationContextType {
  showToast: (message: string, type?: NotificationType, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showConfirm: (config: ConfirmConfig) => void;
  hideToast: () => void;
}

// Global Singleton Bridge so non-hook functions can also show toasts & confirms seamlessly
type NotificationHandler = {
  showToast: (message: string, type?: NotificationType, title?: string, duration?: number) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showConfirm: (config: ConfirmConfig) => void;
  hideToast: () => void;
};

let globalHandler: NotificationHandler | null = null;

export const notify = {
  toast: (message: string, type: NotificationType = 'info', title?: string, duration?: number) => {
    globalHandler?.showToast(message, type, title, duration);
  },
  success: (message: string, title: string = 'Success') => {
    globalHandler?.showSuccess(message, title);
  },
  error: (message: string, title: string = 'Error') => {
    globalHandler?.showError(message, title);
  },
  warning: (message: string, title: string = 'Attention') => {
    globalHandler?.showWarning(message, title);
  },
  info: (message: string, title: string = 'Information') => {
    globalHandler?.showInfo(message, title);
  },
  confirm: (config: ConfirmConfig) => {
    globalHandler?.showConfirm(config);
  },
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmConfig | null>(null);

  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToast(null);
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (message: string, type: NotificationType = 'info', title?: string, duration: number = 3500) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToast({
        id: Date.now(),
        type,
        title,
        message,
        duration,
      });

      translateY.setValue(-80);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 70,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [translateY, opacity, hideToast]
  );

  const showSuccess = useCallback(
    (message: string, title: string = 'Success') => {
      showToast(message, 'success', title);
    },
    [showToast]
  );

  const showError = useCallback(
    (message: string, title: string = 'Action Required') => {
      showToast(message, 'error', title);
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title: string = 'Notice') => {
      showToast(message, 'warning', title);
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title: string = 'Information') => {
      showToast(message, 'info', title);
    },
    [showToast]
  );

  const showConfirm = useCallback((config: ConfirmConfig) => {
    setConfirmDialog(config);
  }, []);

  // Bind singleton
  useEffect(() => {
    globalHandler = {
      showToast,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showConfirm,
      hideToast,
    };
    return () => {
      globalHandler = null;
    };
  }, [showToast, showSuccess, showError, showWarning, showInfo, showConfirm, hideToast]);

  const getToastColors = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: '#F0FDF4',
          border: '#BBF7D0',
          iconBg: '#16A34A',
          titleColor: '#166534',
          msgColor: '#15803D',
          iconSymbol: '✓',
        };
      case 'error':
        return {
          bg: '#FEF2F2',
          border: '#FECACA',
          iconBg: '#DC2626',
          titleColor: '#991B1B',
          msgColor: '#B91C1C',
          iconSymbol: '✕',
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          border: '#FDE68A',
          iconBg: '#D97706',
          titleColor: '#92400E',
          msgColor: '#B45309',
          iconSymbol: '!',
        };
      case 'info':
      default:
        return {
          bg: '#EFF6FF',
          border: '#BFDBFE',
          iconBg: '#2563EB',
          titleColor: '#1E40AF',
          msgColor: '#1D4ED8',
          iconSymbol: 'ℹ',
        };
    }
  };

  const topInset = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 10 : 54;
  const toastTheme = toast ? getToastColors(toast.type) : null;

  return (
    <NotificationContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showConfirm,
        hideToast,
      }}
    >
      {children}

      {/* Floating Animated Toast / Snackbar */}
      {toast && toastTheme && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: topInset,
              backgroundColor: toastTheme.bg,
              borderColor: toastTheme.border,
              transform: [{ translateY }],
              opacity,
            },
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity
            style={styles.toastContent}
            activeOpacity={0.92}
            onPress={hideToast}
          >
            {/* Type Indicator Icon Badge */}
            <View style={[styles.iconBadge, { backgroundColor: toastTheme.iconBg }]}>
              <Text style={styles.iconText}>{toastTheme.iconSymbol}</Text>
            </View>

            {/* Notification Text Column */}
            <View style={styles.textCol}>
              {toast.title ? (
                <Text style={[styles.toastTitle, { color: toastTheme.titleColor }]}>
                  {toast.title}
                </Text>
              ) : null}
              <Text style={[styles.toastMessage, { color: toastTheme.msgColor }]} numberOfLines={3}>
                {toast.message}
              </Text>
            </View>

            {/* Quick Dismiss Button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={hideToast}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Custom Designed Confirmation Dialog for Irreversible / Critical Actions */}
      {confirmDialog && (
        <Modal
          visible={!!confirmDialog}
          transparent
          animationType="fade"
          onRequestClose={() => {
            confirmDialog.onCancel?.();
            setConfirmDialog(null);
          }}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.confirmCard}>
              {/* Header Icon */}
              <View
                style={[
                  styles.confirmIconCircle,
                  {
                    backgroundColor: confirmDialog.isDestructive ? '#FEE2E2' : '#EFF6FF',
                  },
                ]}
              >
                <Text style={{ fontSize: 24 }}>
                  {confirmDialog.isDestructive ? '⚠️' : '💼'}
                </Text>
              </View>

              {/* Title & Description */}
              <Text style={styles.confirmTitle}>{confirmDialog.title}</Text>
              <Text style={styles.confirmMessage}>{confirmDialog.message}</Text>

              {/* Action Buttons */}
              {confirmDialog.secondaryText ? (
                <View style={{ width: '100%', gap: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.actionConfirmBtn,
                      {
                        backgroundColor: confirmDialog.isDestructive ? '#DC2626' : '#2563EB',
                        width: '100%',
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      const action = confirmDialog.onConfirm;
                      setConfirmDialog(null);
                      action();
                    }}
                  >
                    <Text style={styles.actionConfirmBtnText}>
                      {confirmDialog.confirmText || 'Confirm'}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', gap: 10, width: '100%' }}>
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      activeOpacity={0.75}
                      onPress={() => {
                        confirmDialog.onCancel?.();
                        setConfirmDialog(null);
                      }}
                    >
                      <Text style={styles.cancelBtnText}>
                        {confirmDialog.cancelText || 'Cancel'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.cancelBtn,
                        { borderColor: '#BFDBFE', backgroundColor: '#EFF6FF' },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => {
                        const sec = confirmDialog.onSecondary;
                        setConfirmDialog(null);
                        sec?.();
                      }}
                    >
                      <Text style={[styles.cancelBtnText, { color: '#1D4ED8' }]}>
                        {confirmDialog.secondaryText}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.confirmActionsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    activeOpacity={0.75}
                    onPress={() => {
                      confirmDialog.onCancel?.();
                      setConfirmDialog(null);
                    }}
                  >
                    <Text style={styles.cancelBtnText}>
                      {confirmDialog.cancelText || 'Cancel'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.actionConfirmBtn,
                      {
                        backgroundColor: confirmDialog.isDestructive ? '#DC2626' : '#2563EB',
                      },
                    ]}
                    activeOpacity={0.85}
                    onPress={() => {
                      const action = confirmDialog.onConfirm;
                      setConfirmDialog(null);
                      action();
                    }}
                  >
                    <Text style={styles.actionConfirmBtnText}>
                      {confirmDialog.confirmText || 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 99999,
    borderRadius: 14,
    borderWidth: 1.2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    fontFamily: fontSansSerif,
  },
  textCol: {
    flex: 1,
    paddingRight: 8,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: fontSansSerif,
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  toastMessage: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: fontSansSerif,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  confirmIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  confirmTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: fontSansSerif,
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: fontSansSerif,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    fontFamily: fontSansSerif,
  },
  actionConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: fontSansSerif,
  },
});

