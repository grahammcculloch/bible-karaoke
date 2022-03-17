import { Drawer, Classes, Tooltip, Position } from "@blueprintjs/core";
import React from "react";
import { Flex } from "reflexbox";
import packageData from "../../../package.json";
import { Button, Text } from "../blueprint";
import Settings from "./Settings";

export default function SettingsButton(): JSX.Element {
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  return (
    <React.Fragment>
      <Tooltip content="Settings" position={Position.TOP}>
        <Button minimal onClick={(): void => setSettingsOpen(true)} icon="cog" />
      </Tooltip>
      <Drawer
        className={Classes.DARK}
        isOpen={settingsOpen}
        onClose={(): void => setSettingsOpen(false)}
        icon="cog"
        title={
          <Flex justifyContent="space-between" alignItems="center">
            Settings
            <Text fontSize="70%" mr={2} className={Classes.TEXT_MUTED}>
              v{packageData.version}
            </Text>
          </Flex>
        }
        position={Position.RIGHT}
      >
        <Settings />
      </Drawer>
    </React.Fragment>
  );
}
