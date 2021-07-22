import { ipcRenderer } from 'electron';
import React from 'react';
import { useObserver } from 'mobx-react';
import { ColorResult } from 'react-color';
import styled from 'styled-components';
import EditPopover, { EditRow } from './EditPopover';
import { useStores } from '../../store';
import ColorPicker from '../ColorPicker';
import { HTMLSelect, Text, Button, ButtonGroup } from '../../blueprint';
import { IOptionProps } from '@blueprintjs/core/lib/esm/common/props';

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n) => ({
  value: n,
  label: `${n}pt`,
}));

const FontSelector = styled(HTMLSelect).attrs({
  mr: 2
})``;

const ButtonGrouping = styled(ButtonGroup).attrs({
  mr: 3
})``;

const TextBold = styled(Text).attrs({})`bold`;

const TextItalic = styled(Text).attrs({})`italic`;

const TextHighlight = styled(Text).attrs({
  mr: 2
})``;

// interface FontData extends IOptionProps {
//   value: string;
//   label: string;
//   prevState?: null
// }

interface HTMLSelectValueElement extends HTMLSelectElement {
  value: any;
}

export default function FontEditor(props: any): JSX.Element {
  const { appState } = useStores();
  const [fonts, setFonts] = React.useState<IOptionProps[]>();

  React.useEffect(() => {
    ipcRenderer.on('did-finish-getfonts', (_event, newFonts) => {
      if (Array.isArray(newFonts)) {
        setFonts(
          newFonts.map((fontName: string): IOptionProps => {
            return {
              value: fontName,
              label: fontName
            };
          })
        );
      } else {
        console.warn('No fonts for selection', newFonts);
      }
    });
    ipcRenderer.send('did-start-getfonts');
  }, []);

  const setFontFamily = (evt: React.ChangeEvent<HTMLSelectValueElement>): void => {
    appState.setTextProps({ fontFamily: evt.currentTarget.value });
  };

  const setFontSize = (evt: React.ChangeEvent<HTMLSelectValueElement>): void => {
    appState.setTextProps({ fontSize: evt.currentTarget.value });
  };

  const setTextColor = (color: ColorResult): void => {
    appState.setTextProps({ color: color.hex });
  };

  const setHighlightColor = (color: ColorResult): void => {
    appState.setTextProps({
      highlightColor: color.hex,
      highlightRGB: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`,
    });
  };

  const toggleBold = (): void => {
    appState.setTextProps({ bold: !appState.text.bold });
  };

  const toggleItalic = (): void => {
    appState.setTextProps({ italic: !appState.text.italic });
  };

  return useObserver(() => {
    const { text } = appState;
    return (
      <EditPopover icon="font" title="Edit font" {...props}>
        <EditRow>
          <FontSelector value={text.fontFamily} onChange={setFontFamily} options={fonts} />
          <FontSelector value={text.fontSize} onChange={setFontSize} options={FONT_SIZES} />
          <ColorPicker value={text.color} onChange={setTextColor} />
        </EditRow>
        <EditRow mt={3}>
          <ButtonGrouping>
            <Button active={text.bold} text={<TextBold>B</TextBold>} onClick={toggleBold} />
            <Button active={text.italic} text={<TextItalic>i</TextItalic>} onClick={toggleItalic} />
          </ButtonGrouping>
          <TextHighlight>Highlight:</TextHighlight>
          <ColorPicker value={text.highlightColor} onChange={setHighlightColor} />
        </EditRow>
      </EditPopover>
    );
  });
}
