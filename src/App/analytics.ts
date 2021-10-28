import GoogleAnalytics, { resetClientId } from 'electron-ga-uuid';
import { reaction } from 'mobx';
import { AnalyticsInterface } from '../../main/models/analytic.model';
import packageData from '../../package.json';
import isDev from '../utility/isDev';

const DEV_TRACK_ID = 'UA-169320344-1';
const TRACK_ID = 'UA-22170471-17';

export default class Analytics implements AnalyticsInterface {
  constructor(settings: { enableAnalytics: boolean }) {
    this.isEnabled = !isDev() && settings.enableAnalytics;
    const updateProxy = (enableAnalytics: boolean): void => {
      this.isEnabled = !isDev() && enableAnalytics;
      if (this.isEnabled) {
        this.ga = new GoogleAnalytics(isDev() ? DEV_TRACK_ID : TRACK_ID, {
          appName: packageData.name,
          appVersion: packageData.version,
        });
      }
    };
    updateProxy(settings.enableAnalytics);
    reaction(
      (): boolean => settings.enableAnalytics,
      (enableAnalytics: boolean): void => {
        updateProxy(enableAnalytics);
      }
    );

    this.resetClientId = this.resetClientId.bind(this);
    this.trackScreenview = this.trackScreenview.bind(this);
    this.trackEvent = this.trackEvent.bind(this);
    this.trackError = this.trackError.bind(this);
  }
  isEnabled: boolean;
  ga: GoogleAnalytics | undefined = undefined;

  resetClientId(): void {
    if (this.isEnabled) resetClientId();
    else console.log('Resetting Google Analytics Client ID');
  }

  async trackScreenview(screenName: string): Promise<void> {
    const params = { cd: screenName };

    if (this.isEnabled && this.ga) {
      await this.ga.send('screenview', params);
    } else {
      console.log('Analytics Screenview', params);
    }
  }

  async trackEvent(category: string, action: string, label = '', value = 0): Promise<void> {
    const params = { ec: category, ea: action, el: label, ev: value };
    if (this.isEnabled && this.ga) {
      await this.ga.send('event', params);
    } else {
      console.log('Analytics Event', params);
    }
  }

  async trackError(error: object | string, fatal: number): Promise<void> {
    const params = { exd: error, exf: fatal == null ? 1 : fatal };
    if (this.isEnabled && this.ga) {
      await this.ga.send('exception', params);
    } else {
      console.log('Analytics Error', params);
    }
  }
}
