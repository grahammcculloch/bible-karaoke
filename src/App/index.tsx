import { ipcRenderer } from 'electron';
import React from 'react';
import { useObserver } from 'mobx-react';
import styled, { StyledComponent } from 'styled-components';
import { Classes } from '@blueprintjs/core';
import { BoxType, Flex } from 'reflexbox';
import { Colors } from './blueprint';
import AppHeader from './components/AppHeader';
import BookSelector from './components/BookSelector';
import ChapterSelector from './components/ChapterSelector';
import Preview from './components/Preview';
import Actions from './components/Actions';
import { useStores } from './store';
import { AnalyticsContext, useAnalytics } from './components/Analytics';
import './index.scss';

const AppWrapper: StyledComponent<BoxType, any, {}> = styled(Flex)`
  position: relative;
`;

export default function App(): JSX.Element {
  const storeRecord: Record<string, any> = useStores();
  const analyticsContext: AnalyticsContext = useAnalytics();

  React.useEffect((): void => {
    ipcRenderer.send('did-start-getprojectstructure', storeRecord.settings.rootDirectories);
  }, [storeRecord.settings.rootDirectories]);

  React.useEffect((): void => {
    analyticsContext.analytics.trackScreenview('Home');
  }, []);

  return useObserver(() => (
    <AppWrapper backgroundColor={Colors.background3} height="100%" className={Classes.DARK} flexDirection="column">
      <AppHeader />
      <Flex flex={1} flexDirection="column" overflowY="auto">
        <Flex flex={1}>
          <Flex p={3} flex={1} maxWidth="50%">
            <BookSelector flex={1} />
          </Flex>
          <Flex p={3} flex={1} maxWidth="50%">
            <ChapterSelector flex={1} />
          </Flex>
        </Flex>
        <Flex flex={1}>
          <Flex p={3} flex="0 auto">
            <Preview />
          </Flex>
          <Flex p={3} flex={1} alignItems="center" justifyContent="center">
            <Actions />
          </Flex>
        </Flex>
      </Flex>
    </AppWrapper>
  ));
}
