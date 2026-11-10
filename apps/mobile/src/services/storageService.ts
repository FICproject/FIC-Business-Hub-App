import { NativeModules } from 'react-native';

const { FCMModule } = NativeModules;
const memoryCache: Record<string, string> = {};

export const storageService = {
  async setItem(key: string, value: string): Promise<boolean> {
    memoryCache[key] = value;
    if (FCMModule && typeof FCMModule.setStorageItem === 'function') {
      try {
        await FCMModule.setStorageItem(key, value);
        return true;
      } catch (err) {
        console.warn('[storageService] setStorageItem native call error:', err);
      }
    }
    return true;
  },

  async getItem(key: string): Promise<string | null> {
    if (FCMModule && typeof FCMModule.getStorageItem === 'function') {
      try {
        const val = await FCMModule.getStorageItem(key);
        if (val !== null && val !== undefined) {
          memoryCache[key] = val;
          return val;
        }
      } catch (err) {
        console.warn('[storageService] getStorageItem native call error:', err);
      }
    }
    return memoryCache[key] || null;
  },

  async removeItem(key: string): Promise<boolean> {
    delete memoryCache[key];
    if (FCMModule && typeof FCMModule.removeStorageItem === 'function') {
      try {
        await FCMModule.removeStorageItem(key);
        return true;
      } catch (err) {
        console.warn('[storageService] removeStorageItem native call error:', err);
      }
    }
    return true;
  },
};
