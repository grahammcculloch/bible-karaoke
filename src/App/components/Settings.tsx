import { Icon, Tooltip, Classes, Position } from "@blueprintjs/core";
import classnames from "classnames";
import _ from "lodash";
import { observer } from "mobx-react";
import PropTypes from "prop-types";
import React from "react";
import { Flex } from "reflexbox";
import styled from "styled-components";
import { repository } from "../../../package.json";
import { H5, Colors, Text, Card, Button, Checkbox } from "../blueprint";
import { useStores } from "../store";
import { useAnalytics } from "./Analytics";
import FileSelector from "./FileSelector";

const DirectoryHeading = styled(Flex)`
  .file-selector > * {
    margin: 0;
  }
`;

const descriptionTextClass = classnames(Classes.TEXT_SMALL, Classes.TEXT_MUTED);

const defaultHearThisDirectory = window.api.getDefaultHearThisDirectory();
const defaultAppBuilderDirectory = window.api.getDefaultScriptureAppBuilderDirectory();

interface DirectoriesCardInterface {
  name: string;
  directories: string[];
  onSetDirectories(directories: string[]): void;
  defaultDirectory: string;
}

const DirectoriesCard = (prop: DirectoriesCardInterface): JSX.Element => {
  const addDirectory = (folder: string): void => {
    prop.onSetDirectories(_.uniq([...prop.directories, folder]));
  };

  const removeDirectory = (folder: string): void => {
    prop.onSetDirectories(_.without(prop.directories, folder));
  };

  const resetDirectories = (): void => {
    prop.onSetDirectories([prop.defaultDirectory]);
  };

  return (
    <Card mb={3} className="settings__card">
      <Flex alignItems="center" justifyContent="space-between" mb={2}>
        <H5 mb={0}>{prop.name} Projects Folders</H5>
        <DirectoryHeading alignItems="center">
          <Tooltip content="Reset to default directory">
            <Button mr={2} minimal icon="reset" onClick={resetDirectories} />
          </Tooltip>
          <FileSelector
            buttonText="Add folder..."
            buttonIcon="folder-new"
            options={{
              title: `Select ${prop.name} folder`,
              properties: ["openDirectory"],
            }}
            onFileSelected={addDirectory}
          />
        </DirectoryHeading>
      </Flex>
      {prop.directories.map((dir: string) => (
        <Flex alignItems="center" key={dir}>
          <Icon icon="folder-close" />
          {/* <TextPx2 ellipsize title={dir}> */}
          <Text px={2} ellipsize>
            {dir}
          </Text>
          <Button
            minimal
            icon="cross"
            onClick={(): void => {
              removeDirectory(dir);
            }}
          />
        </Flex>
      ))}
    </Card>
  );
};

DirectoriesCard.propTypes = {
  name: PropTypes.string,
  directories: PropTypes.array,
  onSetDirectories: PropTypes.func,
  defaultDirectory: PropTypes.string,
};

const Settings = observer((): JSX.Element => {
  const { settings } = useStores();
  const { analytics } = useAnalytics();
  const repoUrl = repository.url.replace(/\.git$/, "");
  const resetOutputDir = (): void => settings.setOutputDirectory(window.api.getDefaultOutputDirectory());
  React.useEffect(() => {
    analytics.trackScreenview("Settings");
  }, [analytics]);
  return (
    <Flex
      backgroundColor={Colors.background2}
      p={3}
      flex={1}
      flexDirection="column"
      overflowY="auto"
      className="settings"
    >
      <DirectoriesCard
        name="HearThis"
        directories={settings.hearThisRootDirectories}
        onSetDirectories={settings.setHearThisRootDirectories}
        defaultDirectory={defaultHearThisDirectory}
      />
      <DirectoriesCard
        name="Scripture App Builder"
        directories={settings.scriptureAppBuilderRootDirectories}
        onSetDirectories={settings.setScriptureAppBuilderRootDirectories}
        defaultDirectory={defaultAppBuilderDirectory}
      />
      <Card mb={3}>
        <H5 mb={3}>Output</H5>
        <Flex mb={3} alignItems="center">
          <FileSelector
            buttonText="Save videos to..."
            file={settings.outputDirectory}
            options={{
              title: "Select Output Folder",
              properties: ["openDirectory"],
            }}
            onFileSelected={settings.setOutputDirectory}
          />
          <Tooltip content="Reset to default directory" position={Position.BOTTOM}>
            <Button minimal icon="reset" onClick={resetOutputDir} />
          </Tooltip>
        </Flex>
        <Checkbox
          checked={settings.overwriteOutputFiles}
          onChange={(event): void => {
            settings.setOverwriteFile(event.currentTarget.checked);
          }}
          label="Overwrite existing files"
        />
      </Card>
      <Card mb={3}>
        <Flex alignItems="center" justifyContent="space-between">
          <H5 mb={0}>Google Analytics</H5>
        </Flex>
        <Text my={3} className={descriptionTextClass}>
          Google Analytics helps us understand how Bible Karaoke is being used and when errors occur.
        </Text>
        <Checkbox
          checked={settings.enableAnalytics}
          onChange={(event): void => {
            settings.setEnableAnalytics(event.currentTarget.checked);
          }}
          label="Enable Google Analytics"
        />
        <Button
          mt={2}
          text="Reset tracking ID"
          icon="reset"
          disabled={!settings.enableAnalytics}
          onClick={analytics.resetClientId}
        />
      </Card>
      <Text mt={3} textAlign="center" className={descriptionTextClass}>
        This software is released under the{" "}
        <a target="_blank" rel="noopener noreferrer" href={`${repoUrl}/blob/master/LICENSE.md`}>
          MIT License
        </a>
      </Text>
    </Flex>
  );
});

export default Settings;
