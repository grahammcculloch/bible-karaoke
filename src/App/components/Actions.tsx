import React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { useObserver } from 'mobx-react';
import { Intent, IconName, MaybeElement } from '@blueprintjs/core';
import { Flex, Box } from 'reflexbox';
import { Progress } from '../store/AppState';
import { useStores } from '../store';
import { Button, Text, Icon } from '../blueprint';
import AnimatedVisibility from './AnimatedVisibility';
import { useAnalytics } from './Analytics';

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
  .bp3-button-text {
    flex: 1;
  }
`;

const ButtonContent = styled(Flex).attrs({
  p: 4,
  flex: 1,
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'row',
})`
  position: relative;
`;

const ActionIcon = styled(Icon).attrs({
  iconSize: 48,
  flex: 0
})``;

const TextProgress = styled(Text).attrs({
  my: 1
})``;

const TextMain = styled(Text).attrs({
  fontSize: "200%"
})``;

const TextSub = styled(Text).attrs({
  mt: 2
})``;

const TextWrapper = styled(Flex).attrs({
  flex: 1,
  ml: 4,
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
})``;

const ProgressText = (prop: { progress: Progress }): JSX.Element => {
  if (prop.progress.error) {
    return <Text>{prop.progress.error.toString()}</Text>;
  }
  const progressText = prop.progress.status.replace('% (', '%\n(').split('\n');
  return <TextProgress>
    {progressText}
  </TextProgress>;
  // NOTE: TextWrapper's children should be JSX.Element (not JSX.Element[])
  // return progressText.map((line: string, index: number): JSX.Element => (
  //   <TextProgress key={index}>
  //     {line}
  //   </TextProgress>
  // ));
};

const Action = (prop: { icon: IconName | MaybeElement; intent: Intent; disabled: boolean; onClick: (event: React.MouseEvent<HTMLElement>) => void; combined: boolean; mainText: string; subText: string }): JSX.Element => {
  const { appState } = useStores();
  return useObserver(() => {
    const progress: Progress = appState.progress.combined === prop.combined ? appState.progress : null;
    const inProgress = _.get(progress, 'inProgress');
    return (
      <ActionButton
        intent={_.get(progress, 'error') ? Intent.DANGER : prop.intent}
        disabled={prop.disabled}
        onClick={appState.progress.inProgress ? (): void => undefined : prop.onClick}
        active={inProgress}
      >
        {progress && <ProgressIndicator percent={progress.percent} />}
        <ButtonContent>
          <ActionIcon icon={prop.icon} />
          <TextWrapper>
            {inProgress ? (
              <ProgressText progress={progress} />
            ) : (
              <React.Fragment>
                <TextMain>{prop.mainText}</TextMain>
                <TextSub>{prop.subText}</TextSub>
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
      analytics.trackEvent('Video', 'Create Video', combined ? 'Single' : 'Multiple', videos);
    },
    [appState, analytics]
  );

  return useObserver(() => {
    const { projects } = appState;
    const totalChapterCount = _.get(projects, ['activeProject', 'selectedChapterCount'], 0);
    return (
      <AnimatedVisibility visible={totalChapterCount > 0}>
        <Flex alignItems="center" justifyContent="center" flexDirection="column">
          <Action
            combined={false}
            icon="applications"
            disabled={totalChapterCount === 1}
            intent={Intent.PRIMARY}
            onClick={(): void => { onGenerateVideo(false, totalChapterCount); }}
            mainText={`Generate ${totalChapterCount} video${totalChapterCount > 1 ? 's' : ''}`}
            subText="(One video per chapter)"
          />
          <Action
            combined
            icon="application"
            disabled={false}
            intent={Intent.PRIMARY}
            onClick={(): void => { onGenerateVideo(true); }}
            mainText="Generate a single video"
            subText={`(${totalChapterCount} chapter${totalChapterCount > 1 ? 's' : ''})`}
          />
        </Flex>
      </AnimatedVisibility>
    );
  });
}
