import { Classes } from "@blueprintjs/core";
import { autorun } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { BoxType, Flex } from "reflexbox";
import styled, { StyledComponent } from "styled-components";
import { Colors } from "./blueprint";
import Actions from "./components/Actions";
import { AnalyticsContext, useAnalytics } from "./components/Analytics";
import AppHeader from "./components/AppHeader";
import BookSelector from "./components/BookSelector";
import ChapterSelector from "./components/ChapterSelector";
import Preview from "./components/Preview";
import { useStores } from "./store";
import "./index.scss";

const AppWrapper: StyledComponent<BoxType, Record<string, unknown>> = styled(Flex)`
  position: relative;
`;

const App = observer((): JSX.Element => {
  const { settings } = useStores();
  const analyticsContext: AnalyticsContext = useAnalytics();

  autorun((): void => {
    window.api.getBKProject(settings.rootDirectories);
  });

  React.useEffect((): void => {
    analyticsContext.analytics.trackScreenview("Home");
  }, [analyticsContext]);

  return (
    <AppWrapper
      minWidth="1024px"
      backgroundColor={Colors.background3}
      height="100%"
      className={Classes.DARK}
      flexDirection="column"
    >
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
  );
});

export default App;
