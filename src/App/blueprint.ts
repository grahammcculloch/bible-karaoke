import * as BP from '@blueprintjs/core';
import styled, { StyledComponent } from 'styled-components';
import {
  space,
  position,
  flexbox,
  typography,
  layout,
  SpaceProps,
  PositionProps,
  FlexboxProps,
  TypographyProps,
  LayoutProps,
} from 'styled-system';

type STLProps = SpaceProps & TypographyProps & LayoutProps;

type SLFProps = SpaceProps & LayoutProps & FlexboxProps;

type SLPProps = SpaceProps & LayoutProps & PositionProps;

type SLFPProps = SpaceProps & LayoutProps & FlexboxProps & PositionProps;

export const Text: StyledComponent<typeof BP.Text, any, {} & STLProps> = styled(BP.Text)`
  ${space} ${typography} ${layout}
`;
export const H1: StyledComponent<typeof BP.H1, any, {} & STLProps> = styled(BP.H1)`
  ${space} ${typography} ${layout}
`;
export const H2: StyledComponent<typeof BP.H2, any, {} & STLProps> = styled(BP.H2)`
  ${space} ${typography} ${layout}
`;
export const H3: StyledComponent<typeof BP.H3, any, {} & STLProps> = styled(BP.H3)`
  ${space} ${typography} ${layout}
`;
export const H4: StyledComponent<typeof BP.H4, any, {} & STLProps> = styled(BP.H4)`
  ${space} ${typography} ${layout}
`;
export const H5: StyledComponent<typeof BP.H5, any, {} & STLProps> = styled(BP.H5)`
  ${space} ${typography} ${layout}
`;
export const H6: StyledComponent<typeof BP.H6, any, {} & STLProps> = styled(BP.H6)`
  ${space} ${typography} ${layout}
`;
export const Button: StyledComponent<typeof BP.Button, any, {} & SLPProps> = styled(BP.Button)`
  ${space} ${layout} ${position}
`;
export const ButtonGroup: StyledComponent<typeof BP.ButtonGroup, any, {} & SLPProps> = styled(BP.ButtonGroup)`
  ${space} ${layout} ${position}
`;
export const Icon: StyledComponent<typeof BP.Icon, any, {} & SLPProps> = styled(BP.Icon)`
  ${space} ${layout} ${position}
`;
export const Card: StyledComponent<typeof BP.Card, any, {} & SLFProps> = styled(BP.Card)`
  ${space} ${layout} ${flexbox}
`;
export const Checkbox: StyledComponent<typeof BP.Checkbox, any, {} & SLFProps> = styled(BP.Checkbox)`
  ${space} ${layout} ${flexbox}
`;
export const Radio: StyledComponent<typeof BP.Radio, any, {} & SLFProps> = styled(BP.Radio)`
  ${space} ${layout} ${flexbox}
`;
export const HTMLSelect: StyledComponent<typeof BP.HTMLSelect, any, {} & SLFProps> = styled(BP.HTMLSelect)`
  ${space} ${layout} ${flexbox}
`;
export const Tag: StyledComponent<typeof BP.Tag, any, {} & SLFPProps> = styled(BP.Tag)`
  ${space} ${layout} ${flexbox} ${position}
`;

export const Colors: { [x: string]: string } = {
  logo: '#006666',
  background1: '#30404d',
  background2: '#293742',
  background3: '#28323a',
};
