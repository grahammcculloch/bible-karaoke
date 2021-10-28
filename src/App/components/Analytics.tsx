import { Alert, Intent, Classes } from "@blueprintjs/core";
import PropTypes from "prop-types";
import React from "react";
import { AnalyticsInterface } from "../../../main/models/analytic.model";
import Analytics from "../analytics";
import { Text } from "../blueprint";

export interface AnalyticsContext {
  analytics: AnalyticsInterface;
}

const analyticsContext = React.createContext<AnalyticsContext>({ analytics: new Analytics({ enableAnalytics: true }) });

interface AnalyticsProviderSettings {
  enableAnalytics: boolean;
  setEnableAnalytics(confirmed: boolean): void;
}

export function AnalyticsProvider(prop: {
  settings: AnalyticsProviderSettings;
  children: JSX.Element[] | JSX.Element;
}): JSX.Element {
  const [analyticsNoticeDisplayed, setAnalyticsNoticeDisplayed] = React.useState(localStorage.analyticsNoticeDisplayed);
  const [analytics] = React.useState<AnalyticsInterface>(new Analytics(prop.settings));

  const onClose = React.useCallback(
    (confirmed) => {
      setAnalyticsNoticeDisplayed(true);
      localStorage.setItem("analyticsNoticeDisplayed", "true");
      prop.settings.setEnableAnalytics(confirmed);
      confirmed && analytics.trackEvent("Analytics", "Opted In");
    },
    [prop.settings, analytics]
  );

  return (
    <analyticsContext.Provider value={{ analytics }}>
      <Alert
        className={Classes.DARK}
        isOpen={!analyticsNoticeDisplayed}
        cancelButtonText="No - I do not accept"
        confirmButtonText="Yes - I accept"
        icon="chart"
        intent={Intent.SUCCESS}
        onClose={onClose}
      >
        <Text mb={2}>We&apos;d like to use Google Analytics to help improve Bible Karaoke.</Text>
        <Text mb={2}>Is this okay?</Text>
      </Alert>
      {prop.children}
    </analyticsContext.Provider>
  );
}

AnalyticsProvider.propTypes = {
  settings: PropTypes.object,
  children: PropTypes.node,
};

export function useAnalytics(): AnalyticsContext {
  return React.useContext(analyticsContext);
}
