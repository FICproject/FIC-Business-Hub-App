/**
 * FIC API Client Service for Mobile App
 * Direct integration with apps/backend modular monolith API (Port 5000)
 */

export const API_CONFIG = {
  DEV_BASE_URL: 'http://10.0.2.2:5000/api', // Android Emulator localhost bridge
  IOS_BASE_URL: 'http://localhost:5000/api',
  PROD_BASE_URL: 'https://api.ficbusinesshub.org/api',
  TIMEOUT_MS: 15000,
};

export class FICApiClient {
  private static authToken: string | null = null;

  static setToken(token: string | null) {
    this.authToken = token;
  }

  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    };

    const baseUrl = API_CONFIG.DEV_BASE_URL;
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      // Graceful fallback for offline / mock testing mode
      console.warn(`[FICApiClient] Fetch to ${url} failed or offline:`, err.message);
      throw err;
    }
  }
}

