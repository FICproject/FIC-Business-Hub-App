import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { FCMModule } = NativeModules;

export interface FCMNotificationPayload {
  title: string;
  body: string;
  data?: {
    screen?: string;
    targetId?: string;
    module?: string;
    [key: string]: any;
  };
}

class FCMServiceManager {
  private emitter: NativeEventEmitter | null = null;

  constructor() {
    if (Platform.OS === 'android' && FCMModule) {
      this.emitter = new NativeEventEmitter(FCMModule);
    }
  }

  /**
   * Request Android 13+ POST_NOTIFICATIONS permission
   */
  async requestPermission(): Promise<boolean> {
    if (Platform.OS !== 'android' || !FCMModule) return true;
    try {
      return await FCMModule.requestNotificationPermission();
    } catch (err) {
      console.warn('[FCM] Permission request failed:', err);
      return false;
    }
  }

  /**
   * Retrieve the current device's FCM registration token
   */
  async getDeviceToken(): Promise<string | null> {
    if (Platform.OS !== 'android' || !FCMModule) return null;
    try {
      const token = await FCMModule.getFCMToken();
      console.log('[FCM] Active Device Token:', token);
      return token;
    } catch (err) {
      console.warn('[FCM] Failed to get device token:', err);
      return null;
    }
  }

  /**
   * Check if app was cold-started from a notification tap
   */
  async getInitialNotification(): Promise<FCMNotificationPayload | null> {
    if (Platform.OS !== 'android' || !FCMModule) return null;
    try {
      const initial = await FCMModule.getInitialNotification();
      if (initial) {
        console.log('[FCM] App opened from initial notification:', initial);
      }
      return initial;
    } catch (err) {
      console.warn('[FCM] Failed to check initial notification:', err);
      return null;
    }
  }

  /**
   * Listener for incoming notifications when app is in foreground
   */
  onMessageReceived(callback: (notification: FCMNotificationPayload) => void) {
    if (!this.emitter) return () => {};
    const subscription = this.emitter.addListener('onFCMMessageReceived', callback);
    return () => subscription.remove();
  }

  /**
   * Listener for notification taps when app is in background or foreground
   */
  onNotificationOpened(callback: (notification: FCMNotificationPayload) => void) {
    if (!this.emitter) return () => {};
    const subscription = this.emitter.addListener('onFCMNotificationOpened', callback);
    return () => subscription.remove();
  }

  /**
   * Listener for token refresh
   */
  onTokenRefresh(callback: (token: string) => void) {
    if (!this.emitter) return () => {};
    const subscription = this.emitter.addListener('onFCMTokenRefresh', callback);
    return () => subscription.remove();
  }
}

export const FCMService = new FCMServiceManager();

