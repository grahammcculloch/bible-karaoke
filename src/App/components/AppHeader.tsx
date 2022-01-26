import classnames from "classnames";
import { observer } from "mobx-react";
import React from "react";
import { Flex, Box } from "reflexbox";
import styled from "styled-components";
import { H2, Colors } from "../blueprint";
import { useStores } from "../store";
import ProjectSelector from "./ProjectSelector";
import SettingsButton from "./SettingsButton";

const HeaderBackground = styled(Box)`
  background-color: ${Colors.background1};
  height: 64px;
  width: 100%;
`;

const HeaderWrapper = styled(Flex)`
  z-index: 2;
  pointer-events: none;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${Colors.background1};
  transition: background-color 200ms linear 500ms;

  .header__item {
    pointer-events: auto;
    position: absolute;
    margin: 0;
    padding: 0;
    transition-timing-function: ease-in-out;
    transition: transform 500ms, top 500ms, left 500ms, right 500ms;
    &--logo {
      transition: transform 500ms, top 500ms, left 500ms, right 500ms, width 500ms, height 500ms;
      width: 200px;
      height: 200px;
      top: calc(50% - 268px);
      left: calc(50% - 100px);
    }
    &--title {
      line-height: 1;
      transform: scale(2);
      top: calc(50% - 28px);
      left: calc(50% - 93.5px);
    }
    &--select {
      width: 200px;
      top: calc(50% + 48px);
      left: calc(50% - 100px);
    }
    &--button {
      top: calc(50% + 128px);
      right: calc(50% - 15px);
    }
  }

  &.header--minimized {
    background-color: transparent;
    .header__item {
      &--logo {
        top: 16px;
        left: 16px;
        width: 32px;
        height: 32px;
      }
      &--title {
        margin-bottom: 0;
        transform: scale(1);
        top: 16px;
        left: 64px;
      }
      &--select {
        margin-bottom: 0;
        top: 17px;
        left: 267px;
      }
      &--button {
        top: 17px;
        right: 16px;
      }
    }
  }
`;

const AppHeader = observer((): JSX.Element => {
  const { appState } = useStores();
  return (
    <HeaderBackground>
      <HeaderWrapper className={classnames("header", { "header--minimized": !!appState.projects.activeProjectPath })}>
        <img className="header__item header__item--logo" alt="logo" src="./logo512.png" />
        <H2 className="header__item header__item--title">Bible Karaoke</H2>
        <Box className="header__item header__item--select">
          <ProjectSelector />
        </Box>
        <Box className="header__item header__item--button">
          <SettingsButton />
        </Box>
      </HeaderWrapper>
    </HeaderBackground>
  );
});

export default AppHeader;
