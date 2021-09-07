import React from 'react';
import styled from 'styled-components';
import { useObserver } from 'mobx-react';
import EditPopover, { EditRow } from './EditPopover';
import { Radio } from '../../blueprint';
import { fileFilters } from '../../constants';
import { useStores } from '../../store';
import ColorPicker from '../ColorPicker';
import FileSelector from '../FileSelector';
import { DEFAULT_BG_COLOR } from '../../constants';

const EditRadio = styled(Radio).attrs({
  width: 100,
  mr: 3,
  mb: 0,
})``;

export default function BackgroundEditor(props: any): JSX.Element {
  const { appState } = useStores();
  return useObserver(() => {
    const { background } = appState;
    return (
      <EditPopover title="Edit background" {...props}>
        <EditRow>
          <EditRadio
            label="Image or Video"
            checked={!background.color}
            onChange={(): void => {
              appState.background.setFile('');
            }}
          />
          <FileSelector
            disabled={!!background.color}
            file={background.file}
            options={{
              title: 'Select Background File',
              filters: fileFilters.background,
              properties: ['openFile'],
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
            disabled={background.color === ''}
            value={background.color}
            onChange={(color): void => {
              appState.background.setColor(color.hex);
            }}
          />
        </EditRow>
      </EditPopover>
    );
  });
}
