/**
 * Secure Storage Service for Authentication Tokens and Offline Session Data
 */

export class StorageService {
  private static memoryStore: Record<string, string> = {};

  static async setItem(key: string, value: string): Promise<void> {
    this.memoryStore[key] = value;
  }

  static async getItem(key: string): Promise<string | null> {
    return this.memoryStore[key] || null;
  }

  static async removeItem(key: string): Promise<void> {
    delete this.memoryStore[key];
  }

  static async clear(): Promise<void> {
    this.memoryStore = {};
  }
}

