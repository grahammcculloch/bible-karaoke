import { IOptionProps } from "@blueprintjs/core/lib/esm/common/props";
import { observer } from "mobx-react";
import React from "react";
import { ColorResult } from "react-color";
import { HTMLSelect, Text, Button, ButtonGroup } from "../../blueprint";
import { useStores } from "../../store";
import ColorPicker from "../ColorPicker";
import EditPopover, { EditRow, EditPopoverProps } from "./EditPopover";

const FONT_SIZES = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((n) => ({
  value: n,
  label: `${n}pt`,
}));

const FontEditor = observer((props: EditPopoverProps): JSX.Element => {
  const { appState } = useStores();
  const [fonts, setFonts] = React.useState<IOptionProps[]>();

  React.useEffect(() => {
    window.api.onGetFonts((newFonts: string[] | Error) => {
      if (Array.isArray(newFonts)) {
        setFonts(
          newFonts.map((fontName: string): IOptionProps => {
            return {
              value: fontName,
              label: fontName,
            };
          })
        );
      } else {
        console.warn("No fonts for selection", newFonts);
      }
    });
    window.api.getFonts();
  }, []);

  const setFontFamily = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    appState.setTextProps({ fontFamily: evt.currentTarget.value });
  };

  const setFontSize = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    appState.setTextProps({ fontSize: +evt.currentTarget.value });
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

  const { text } = appState;

  return (
    <EditPopover icon="font" title="Edit font" {...props}>
      <EditRow>
        <HTMLSelect mr={2} value={text.fontFamily} onChange={setFontFamily} options={fonts} />
        <HTMLSelect mr={2} value={text.fontSize} onChange={setFontSize} options={FONT_SIZES} />
        <ColorPicker value={text.color} onChange={setTextColor} />
      </EditRow>
      <EditRow mt={3}>
        <ButtonGroup mr={3}>
          <Button active={text.bold} text={<Text fontWeight="bold">B</Text>} onClick={toggleBold} />
          <Button active={text.italic} text={<Text fontStyle="italic">i</Text>} onClick={toggleItalic} />
        </ButtonGroup>
        <Text mr={2}>Highlight:</Text>
        <ColorPicker value={text.highlightColor} onChange={setHighlightColor} />
      </EditRow>
    </EditPopover>
  );
});

export default FontEditor;
