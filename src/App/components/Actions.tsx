import { Intent, IconName, MaybeElement } from "@blueprintjs/core";
import _ from "lodash";
import { useObserver } from "mobx-react";
import React from "react";
import { Flex, Box } from "reflexbox";
import styled from "styled-components";
import { Button, Text, Icon } from "../blueprint";
import { useStores } from "../store";
import { Progress } from "../store/AppState";
import { useAnalytics } from "./Analytics";
import AnimatedVisibility from "./AnimatedVisibility";

const ProgressIndicator = styled(Box)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  ${(prop: { percent: number }): string => {
    return `right: ${100 - prop.percent}%;`;
  }}
  background-color: rgba(0,0,0,0.2);
`;

const ActionButton = styled(Button).attrs({
  p: 0,
  m: 3,
})`
  position: relative;
  width: 440px;
  max-width: 100%;
  min-width: 245px;
  .bp3-button-text {
    flex: 1;
  }
`;

const ButtonContent = styled(Flex).attrs({
  p: 4,
  flex: 1,
  alignItems: "center",
  justifyContent: "flex-start",
  flexDirection: "row",
})`
  position: relative;
`;

const ActionIcon = styled(Icon).attrs({
  iconSize: 48,
  flex: 0,
})``;

const TextWrapper = styled(Flex).attrs({
  flex: 1,
  ml: 4,
  textAlign: "center",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
})``;

const ProgressText = (prop: { progress?: Progress }): JSX.Element => {
  if (prop.progress == null) {
    return <Text></Text>;
  }
  if (prop.progress.error) {
    return <Text>{prop.progress.error.toString()}</Text>;
  }

  const progressText: string[] = prop.progress.status.replace("% (", "%\n(").split("\n");
  return (
    <Text my={1}>
      {progressText}
      <br />
      {prop.progress.remainingTime ? `${prop.progress.remainingTime}` : ""}
    </Text>
  );
};

const Action = (prop: {
  icon: IconName | MaybeElement;
  intent: Intent;
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  combined: boolean;
  mainText: string;
  subText: string;
}): JSX.Element => {
  const { appState } = useStores();
  return useObserver(() => {
    const progress: Progress | undefined = appState.progress.combined === prop.combined ? appState.progress : undefined;
    const inProgress = _.get(progress, "inProgress");
    return (
      <ActionButton
        intent={_.get(progress, "error") ? Intent.DANGER : prop.intent}
        disabled={prop.disabled}
        // if there is an error, reset it; if in progress, do nothing; else onClick
        onClick={
          appState.progress.inProgress
            ? (): void => (appState.progress.error ? appState.progress.reset() : undefined)
            : prop.onClick
        }
        active={inProgress}
      >
        {progress && <ProgressIndicator percent={progress.percent} />}
        <ButtonContent>
          <ActionIcon icon={appState.progress.error ? "cross" : prop.icon} />
          <TextWrapper>
            {inProgress ? (
              <ProgressText progress={progress} />
            ) : (
              <React.Fragment>
                <Text fontSize="200%">{prop.mainText}</Text>
                <Text mt={2}>{prop.subText}</Text>
              </React.Fragment>
            )}
          </TextWrapper>
        </ButtonContent>
      </ActionButton>
    );
  });
};

export default function Actions(): JSX.Element {
  const { appState } = useStores();
  const { analytics } = useAnalytics();

  const onGenerateVideo = React.useCallback(
    (combined, videos = 1) => {
      appState.generateVideo(combined);
      analytics.trackEvent("Video", "Create Video", combined ? "Single" : "Multiple", videos);
    },
    [appState, analytics]
  );

  return useObserver(() => {
    const { projects } = appState;
    const totalChapterCount = _.get(projects, ["activeProject", "selectedChapterCount"], 0);
    return (
      <AnimatedVisibility visible={totalChapterCount > 0}>
        <Flex alignItems="center" justifyContent="center" flexDirection="column">
          <Action
            combined={false}
            icon="applications"
            disabled={totalChapterCount === 1}
            intent={Intent.PRIMARY}
            onClick={(): void => {
              onGenerateVideo(false, totalChapterCount);
            }}
            mainText={`Generate ${totalChapterCount} video${totalChapterCount > 1 ? "s" : ""}`}
            subText="(One video per chapter)"
          />
          <Action
            combined
            icon="application"
            disabled={false}
            intent={Intent.PRIMARY}
            onClick={(): void => {
              onGenerateVideo(true);
            }}
            mainText="Generate a single video"
            subText={`(${totalChapterCount} chapter${totalChapterCount > 1 ? "s" : ""})`}
          />
        </Flex>
      </AnimatedVisibility>
    );
  });
}
