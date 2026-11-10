import { NativeModules, Platform } from 'react-native';
import { storageService } from './storageService';

const { FCMModule } = NativeModules;

export interface ScheduledReminderItem {
  id: string;
  requestCode: number;
  targetMillis: number;
  remainingDays: string;
  expiryDate: string;
  interval: string;
  slotTime: string;
  status: 'SCHEDULED' | 'PAST' | 'DELIVERED';
}

export interface ScheduleStatusData {
  expiryDate: string;
  formattedExpiry: string;
  planName: string;
  totalScheduleCount: number;
  activeScheduledCount: number;
  pastCount: number;
  updatedAt: number;
  reminders: ScheduledReminderItem[];
}

export interface MembershipNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  read: boolean;
  type: 'MEMBERSHIP';
  action: string;
  expiryDate: string;
  remainingDays: string;
  planName: string;
  screen: string;
  createdAt: number;
}

const STORAGE_KEY_MEMBERSHIP_NOTIFS = 'FIC_MEMBERSHIP_NOTIFICATIONS';
const STORAGE_KEY_MEMBERSHIP_EXPIRY = 'FIC_MEMBERSHIP_EXPIRY_DATE';
const STORAGE_KEY_MEMBERSHIP_PLAN = 'FIC_MEMBERSHIP_PLAN';

type NotificationChangeListener = () => void;
const changeListeners = new Set<NotificationChangeListener>();

export const membershipNotificationService = {
  /**
   * Subscribe to notification updates (read state changes, new notifications, etc.)
   */
  subscribe(listener: NotificationChangeListener): () => void {
    changeListeners.add(listener);
    return () => {
      changeListeners.delete(listener);
    };
  },

  /**
   * Notify all subscribers when notification data changes
   */
  notifyChange(): void {
    changeListeners.forEach((fn) => {
      try {
        fn();
      } catch (err) {
        console.warn('[MembershipService] Error in change listener:', err);
      }
    });
  },

  /**
   * Retrieves current unread membership notification count.
   */
  async getUnreadCount(): Promise<number> {
    try {
      const list = await this.getStoredNotifications();
      return list.filter((n) => !n.read).length;
    } catch {
      return 0;
    }
  },
  /**
   * Schedules the 10 automatic membership expiry reminders.
   * Schedule:
   * - 3 months before: 9:00 AM (1 notif)
   * - 1 month before: 9:00 AM (1 notif)
   * - 15 days before: 9:00 AM (1 notif)
   * - 7 days before: 9:00 AM (1 notif)
   * - 3 days before: 9:00 AM (1 notif)
   * - 2 days before: 9:00 AM & 6:00 PM (2 notifs)
   * - 1 day before: 9:00 AM, 1:00 PM & 7:00 PM (3 notifs)
   */
  async scheduleReminders(
    expiryDate: string,
    planName: string = 'FIC Enterprise Membership'
  ): Promise<{ success: boolean; scheduledCount: number; data?: ScheduleStatusData }> {
    try {
      await storageService.setItem(STORAGE_KEY_MEMBERSHIP_EXPIRY, expiryDate);
      await storageService.setItem(STORAGE_KEY_MEMBERSHIP_PLAN, planName);

      if (Platform.OS === 'android' && FCMModule?.scheduleMembershipReminders) {
        const rawResult = await FCMModule.scheduleMembershipReminders(expiryDate, planName);
        const parsed = typeof rawResult === 'string' ? JSON.parse(rawResult) : rawResult;
        return {
          success: parsed.success ?? true,
          scheduledCount: parsed.scheduledCount ?? 0,
          data: parsed.data,
        };
      }
      return { success: true, scheduledCount: 0 };
    } catch (e) {
      console.warn('[MembershipService] Error scheduling reminders:', e);
      return { success: false, scheduledCount: 0 };
    }
  },

  /**
   * Cancels all pending reminders.
   */
  async cancelReminders(): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && FCMModule?.cancelMembershipReminders) {
        return await FCMModule.cancelMembershipReminders();
      }
      return true;
    } catch (e) {
      console.warn('[MembershipService] Error cancelling reminders:', e);
      return false;
    }
  },

  /**
   * Retrieves schedule breakdown and active reminders.
   */
  async getScheduleStatus(): Promise<{ schedule: ScheduleStatusData | null; deliveredNotifications: MembershipNotification[] }> {
    try {
      if (Platform.OS === 'android' && FCMModule?.getMembershipRemindersStatus) {
        const raw = await FCMModule.getMembershipRemindersStatus();
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return {
          schedule: parsed.schedule || null,
          deliveredNotifications: parsed.deliveredNotifications || [],
        };
      }
      return { schedule: null, deliveredNotifications: [] };
    } catch (e) {
      console.warn('[MembershipService] Error getting schedule status:', e);
      return { schedule: null, deliveredNotifications: [] };
    }
  },

  /**
   * Triggers an immediate real notification on demand for verification/testing.
   */
  async triggerTestReminder(remainingDays: string = '2 days'): Promise<string | null> {
    try {
      if (Platform.OS === 'android' && FCMModule?.triggerTestMembershipReminder) {
        const res = await FCMModule.triggerTestMembershipReminder(remainingDays);
        this.notifyChange();
        return res;
      }
      return null;
    } catch (e) {
      console.warn('[MembershipService] Error triggering test reminder:', e);
      return null;
    }
  },

  /**
   * Retrieves delivered membership notifications for in-app Notifications tab.
   */
  async getStoredNotifications(): Promise<MembershipNotification[]> {
    try {
      const raw = await storageService.getItem(STORAGE_KEY_MEMBERSHIP_NOTIFS);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.warn('[MembershipService] Error loading stored notifications:', e);
      return [];
    }
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(id: string): Promise<MembershipNotification[]> {
    try {
      const list = await this.getStoredNotifications();
      const updated = list.map((item) => (item.id === id ? { ...item, read: true } : item));
      await storageService.setItem(STORAGE_KEY_MEMBERSHIP_NOTIFS, JSON.stringify(updated));
      this.notifyChange();
      return updated;
    } catch (e) {
      console.warn('[MembershipService] Error marking as read:', e);
      return [];
    }
  },

  /**
   * Marks all stored membership notifications as read.
   */
  async markAllAsRead(): Promise<MembershipNotification[]> {
    try {
      const list = await this.getStoredNotifications();
      const updated = list.map((item) => ({ ...item, read: true }));
      await storageService.setItem(STORAGE_KEY_MEMBERSHIP_NOTIFS, JSON.stringify(updated));
      this.notifyChange();
      return updated;
    } catch (e) {
      console.warn('[MembershipService] Error marking all as read:', e);
      return [];
    }
  },

  /**
   * Renewal Workflow:
   * Extends the expiry date by +1 full year, cancels previous pending reminder cycle,
   * schedules a fresh 10-notification cycle, and updates persistent storage.
   */
  async processRenewal(
    currentExpiryDateStr: string = '05 Nov 2027',
    planName: string = 'FIC Enterprise Membership'
  ): Promise<{ newExpiryDate: string; success: boolean }> {
    try {
      // Calculate new expiry date +1 year
      const parsedDate = new Date(currentExpiryDateStr);
      let targetDate: Date;
      if (!isNaN(parsedDate.getTime())) {
        targetDate = new Date(parsedDate);
        targetDate.setFullYear(targetDate.getFullYear() + 1);
      } else {
        // Fallback: parse DD MMM YYYY
        const parts = currentExpiryDateStr.split(' ');
        if (parts.length === 3) {
          const year = parseInt(parts[2], 10) + 1;
          targetDate = new Date(`${parts[0]} ${parts[1]} ${year}`);
        } else {
          targetDate = new Date();
          targetDate.setFullYear(targetDate.getFullYear() + 1);
        }
      }

      const day = String(targetDate.getDate()).padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthStr = months[targetDate.getMonth()];
      const yearStr = targetDate.getFullYear();
      const newExpiryDateFormatted = `${day} ${monthStr} ${yearStr}`;

      // Stop pending reminders and schedule fresh cycle
      await this.cancelReminders();
      await this.scheduleReminders(newExpiryDateFormatted, planName);

      return {
        newExpiryDate: newExpiryDateFormatted,
        success: true,
      };
    } catch (e) {
      console.warn('[MembershipService] Error during renewal process:', e);
      return {
        newExpiryDate: currentExpiryDateStr,
        success: false,
      };
    }
  },
};

