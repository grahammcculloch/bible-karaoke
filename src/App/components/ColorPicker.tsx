import { Popover } from "@blueprintjs/core";
import PropTypes from "prop-types";
import React from "react";
import { Color, ColorChangeHandler, ColorResult, SketchPicker } from "react-color";
import { Box } from "reflexbox";
import styled from "styled-components";

const SWATCH_COLORS = [
  "#ff3b30",
  "#4cd964",
  "#2196f3",
  "#ff2d55",
  "#ffcc00",
  "#ff9500",
  "#9c27b0",
  "#673ab7",
  "#5ac8fa",
  "#009688",
  "#cddc39",
  "#ff6b22",
  "#00BCD4",
  "#AED581",
  "#ffff00",
  "#ffffff",
  "#DCDCDC",
  "#D3D3D3",
  "#C0C0C0",
  "#A9A9A9",
  "#808080",
  "#696969",
  "#333333",
  "#000000",
];

const Swatch = styled(Box).attrs({
  width: 30,
  height: 30,
  borderRadius: 4,
})`
  border: solid grey 1px;
  ${(props: { disabled: boolean }): string => {
    return props.disabled ? "cursor: not-allowed;" : "";
  }}
`;

interface ColorPickerSettings {
  value?: Color;
  presetColors?: { color: string; title: string }[] | string[];
  disableAlpha?: boolean;
  disabled?: boolean;
  onChange?: ColorChangeHandler;
  props?: any;
}

export default class ColorPicker extends React.Component<ColorPickerSettings> {
  constructor(props: ColorPickerSettings) {
    super(props);

    this.defaultOnChange = this.defaultOnChange.bind(this);
  }

  defaultOnChange(color: ColorResult): void {
    this.setState({ color: color.rgb });
  }

  get propTypes(): any {
    return {
      value: PropTypes.string,
      presetColors: PropTypes.arrayOf(PropTypes.string),
      disableAlpha: PropTypes.bool,
      disabled: PropTypes.bool,
      onChange: PropTypes.func,
    };
  }

  get defaultProps(): any {
    return {
      color: undefined,
      presetColors: SWATCH_COLORS,
      disableAlpha: true,
    };
  }

  render(): JSX.Element {
    return (
      <Popover disabled={this.props.disabled}>
        <Swatch
          {...this.props.props}
          bg={this.props.disabled ? undefined : this.props.value}
          disabled={this.props.disabled}
        />
        <SketchPicker
          presetColors={this.props.presetColors}
          disableAlpha={this.props.disableAlpha}
          color={this.props.value}
          onChange={this.props.onChange || this.defaultOnChange}
        />
      </Popover>
    );
  }
}
