import * as BP from '@blueprintjs/core';
import styled, { StyledComponent } from 'styled-components';
import { space, position, flexbox, typography, layout } from 'styled-system';

export const Text: StyledComponent<typeof BP.Text, any, {}> = styled(BP.Text)`
  ${space} ${typography} ${layout}
`;
export const H1: StyledComponent<typeof BP.H1, any, {}> = styled(BP.H1)`
  ${space} ${typography} ${layout}
`;
export const H2: StyledComponent<typeof BP.H2, any, {}> = styled(BP.H2)`
  ${space} ${typography} ${layout}
`;
export const H3: StyledComponent<typeof BP.H3, any, {}> = styled(BP.H3)`
  ${space} ${typography} ${layout}
`;
export const H4: StyledComponent<typeof BP.H4, any, {}> = styled(BP.H4)`
  ${space} ${typography} ${layout}
`;
export const H5: StyledComponent<typeof BP.H5, any, {}> = styled(BP.H5)`
  ${space} ${typography} ${layout}
`;
export const H6: StyledComponent<typeof BP.H6, any, {}> = styled(BP.H6)`
  ${space} ${typography} ${layout}
`;
export const Button: StyledComponent<typeof BP.Button, any, {}> = styled(BP.Button)`
  ${space} ${layout} ${position}
`;
export const ButtonGroup: StyledComponent<typeof BP.ButtonGroup, any, {}> = styled(BP.ButtonGroup)`
  ${space} ${layout} ${position}
`;
export const Icon: StyledComponent<typeof BP.Icon, any, {}> = styled(BP.Icon)`
  ${space} ${layout} ${position}
`;
export const Card: StyledComponent<typeof BP.Card, any, {}> = styled(BP.Card)`
  ${space} ${layout} ${flexbox}
`;
export const Checkbox: StyledComponent<typeof BP.Checkbox, any, {}> = styled(BP.Checkbox)`
  ${space} ${layout} ${flexbox}
`;
export const Radio: StyledComponent<typeof BP.Radio, any, {}> = styled(BP.Radio)`
  ${space} ${layout} ${flexbox}
`;
export const HTMLSelect: StyledComponent<typeof BP.HTMLSelect, any, {}> = styled(BP.HTMLSelect)`
  ${space} ${layout} ${flexbox}
`;
export const Tag: StyledComponent<typeof BP.Tag, any, {}> = styled(BP.Tag)`
  ${space} ${layout} ${flexbox} ${position}
`;

export const Colors: { [x: string]: string } = {
  logo: '#006666',
  background1: '#30404d',
  background2: '#293742',
  background3: '#28323a',
};
