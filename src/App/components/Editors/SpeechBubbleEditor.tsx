import { Slider } from "@blueprintjs/core";
import { useObserver } from "mobx-react";
import React from "react";
import { ColorResult } from "react-color";
import { Box } from "reflexbox";
import styled from "styled-components";
import { Text } from "../../blueprint";
import { useStores } from "../../store";
import ColorPicker from "../ColorPicker";
import EditPopover, { EditRow, EditPopoverProps } from "./EditPopover";

const StyleColorPicker = styled(ColorPicker).attrs({
  mr: 3,
})``;

export default function SpeechBubbleEditor(props: EditPopoverProps): JSX.Element {
  const { appState } = useStores();

  const setSpeechBubbleColor = (color: ColorResult): void => {
    appState.setSpeechBubbleProps({
      color: color.hex,
      rgba: `rgba(${color.rgb.r},${color.rgb.g},${color.rgb.b},${color.rgb.a})`,
    });
  };

  const setSpeechBubbleOpacity = (opacity: number): void => {
    appState.setSpeechBubbleProps({ opacity });
  };

  return useObserver((): JSX.Element => {
    const { speechBubble } = appState;
    return (
      <EditPopover title="Edit verse background" {...props}>
        <EditRow>
          <StyleColorPicker value={speechBubble.color} onChange={setSpeechBubbleColor} />
          <Text mr={4}>Opacity:</Text>
          <Box mr={3} maxWidth="200px">
            <Slider value={speechBubble.opacity} min={0} max={1} stepSize={0.05} onChange={setSpeechBubbleOpacity} />
          </Box>
        </EditRow>
      </EditPopover>
    );
  });
}
