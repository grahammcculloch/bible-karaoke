import { observer } from "mobx-react";
import React from "react";
import styled from "styled-components";
import { Radio } from "../../blueprint";
import { fileFilters, DEFAULT_BG_COLOR } from "../../constants";
import { useStores } from "../../store";
import ColorPicker from "../ColorPicker";
import FileSelector from "../FileSelector";
import EditPopover, { EditRow, EditPopoverProps } from "./EditPopover";

const EditRadio = styled(Radio).attrs({
  width: 100,
  mr: 3,
  mb: 0,
})``;

const BackgroundEditor = observer((props: EditPopoverProps): JSX.Element => {
  const { appState } = useStores();
  const { background } = appState;
  return (
    <EditPopover title="Edit background" {...props}>
      <EditRow>
        <EditRadio
          label="Image or Video"
          checked={!background.color}
          onChange={(): void => {
            appState.background.setFile("");
          }}
        />
        <FileSelector
          disabled={!!background.color}
          file={background.file}
          options={{
            title: "Select Background File",
            filters: fileFilters.background,
            properties: ["openFile"],
          }}
          onFileSelected={appState.background.setFile}
        />
      </EditRow>
      <EditRow mt={3}>
        <EditRadio
          label="Solid color"
          checked={!!background.color}
          onChange={(): void => {
            appState.background.setColor(DEFAULT_BG_COLOR);
          }}
        />
        <ColorPicker
          disabled={background.color === ""}
          value={background.color}
          onChange={(color): void => {
            appState.background.setColor(color.hex);
          }}
        />
      </EditRow>
    </EditPopover>
  );
});

export default BackgroundEditor;
