import { Button, IconName, MaybeElement } from "@blueprintjs/core";
import { ipcRenderer } from "electron";
import PropTypes from "prop-types";
import React from "react";
import "./FileSelector.scss";
import { SaveDialogOptions, OpenDialogOptions } from "./file-dialog.model";

const FileSelector = (prop: {
  save?: boolean;
  buttonText?: React.ReactNode;
  buttonIcon?: IconName | MaybeElement;
  disabled?: boolean;
  file?: string;
  options: SaveDialogOptions | OpenDialogOptions;
  onFileSelected: (file: string) => void;
}): JSX.Element => {
  const selectFile = async (): Promise<void> => {
    if (prop.save) {
      ipcRenderer.on("did-finish-file-save-dialog", (_, saveFilePath) => {
        if (saveFilePath) {
          prop.onFileSelected(saveFilePath);
        }
      });
      ipcRenderer.send("did-start-file-save-dialog", prop.options as SaveDialogOptions);
    } else {
      ipcRenderer.on("did-finish-file-open-dialog", (_, openFilePaths) => {
        const openFilePath = openFilePaths && openFilePaths.length === 1 ? openFilePaths[0] : "";
        if (openFilePath) {
          prop.onFileSelected(openFilePath);
        }
      });
      ipcRenderer.send("did-start-file-open-dialog", prop.options as OpenDialogOptions);
    }
  };
  return (
    <div className="file-selector">
      <div className="file-selector__button">
        <Button
          text={prop.buttonText || "Select"}
          icon={prop.buttonIcon}
          onClick={selectFile}
          disabled={prop.disabled || false}
        />
      </div>
      <div className="file-selector__filename">{prop.file}</div>
    </div>
  );
};

FileSelector.propTypes = {
  save: PropTypes.bool,
  buttonText: PropTypes.string,
  buttonIcon: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  disabled: PropTypes.bool,
  file: PropTypes.string,
  options: PropTypes.object,
  onFileSelected: PropTypes.func,
};

FileSelector.defaultProps = {};

export default FileSelector;
