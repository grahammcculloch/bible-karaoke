import React from 'react';
import PropTypes from 'prop-types';
import { Button, IconName, MaybeElement } from '@blueprintjs/core';
import './FileSelector.scss';
import { remote, OpenDialogOptions, SaveDialogOptions } from 'electron';

const { dialog } = remote;

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
    let filePath = '';

    if (prop.save) {
      filePath = (await dialog.showSaveDialog(prop.options as SaveDialogOptions)).filePath || '';
    }
    else {
      const filePaths = (await dialog.showOpenDialog(prop.options as OpenDialogOptions)).filePaths;
      filePath = filePaths && filePaths.length === 1 ? filePaths[0] : '';
    }

    if (filePath) {
      prop.onFileSelected(filePath);
    }
  };
  return (
    <div className="file-selector">
      <div className="file-selector__button">
        <Button text={prop.buttonText || 'Select'} icon={prop.buttonIcon} onClick={selectFile} disabled={prop.disabled || false} />
      </div>
      <div className="file-selector__filename">{prop.file}</div>
    </div>
  );
};

FileSelector.propTypes = {
  save: PropTypes.bool,
  buttonText: PropTypes.string,
  buttonIcon: PropTypes.object,
  disabled: PropTypes.bool,
  file: PropTypes.string,
  options: PropTypes.object,
  onFileSelected: PropTypes.func,
};

FileSelector.defaultProps = {};

export default FileSelector;
