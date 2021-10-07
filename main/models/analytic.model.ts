import GoogleAnalytics from 'electron-ga-uuid';

export interface AnalyticsInterface {
  isEnabled: boolean;
  ga?: GoogleAnalytics;
  resetClientId(): void;
  trackScreenview(screenName: string): Promise<void>;
  trackEvent(category: string, action: string, label?: string, value?: number): Promise<void>;
  trackError(error: object | string, fatal: number): Promise<void>;
}
