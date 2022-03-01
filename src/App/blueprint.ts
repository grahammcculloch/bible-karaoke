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

export const Text: StyledComponent<typeof BP.Text, object, {} & STLProps> = styled(BP.Text)`
  ${space} ${typography} ${layout}
`;
export const H1: StyledComponent<typeof BP.H1, object, {} & STLProps> = styled(BP.H1)`
  ${space} ${typography} ${layout}
`;
export const H2: StyledComponent<typeof BP.H2, object, {} & STLProps> = styled(BP.H2)`
  ${space} ${typography} ${layout}
`;
export const H3: StyledComponent<typeof BP.H3, object, {} & STLProps> = styled(BP.H3)`
  ${space} ${typography} ${layout}
`;
export const H4: StyledComponent<typeof BP.H4, object, {} & STLProps> = styled(BP.H4)`
  ${space} ${typography} ${layout}
`;
export const H5: StyledComponent<typeof BP.H5, object, {} & STLProps> = styled(BP.H5)`
  ${space} ${typography} ${layout}
`;
export const H6: StyledComponent<typeof BP.H6, object, {} & STLProps> = styled(BP.H6)`
  ${space} ${typography} ${layout}
`;
export const Button: StyledComponent<typeof BP.Button, object, {} & SLPProps> = styled(BP.Button)`
  ${space} ${layout} ${position}
`;
export const ButtonGroup: StyledComponent<typeof BP.ButtonGroup, object, {} & SLPProps> = styled(BP.ButtonGroup)`
  ${space} ${layout} ${position}
`;
export const Icon: StyledComponent<typeof BP.Icon, object, {} & SLPProps> = styled(BP.Icon)`
  ${space} ${layout} ${position}
`;
export type CardProps = SLFProps;
export const Card: StyledComponent<typeof BP.Card, object, {} & CardProps> = styled(BP.Card)`
  ${space} ${layout} ${flexbox}
`;
export const Checkbox: StyledComponent<typeof BP.Checkbox, object, {} & SLFProps> = styled(BP.Checkbox)`
  ${space} ${layout} ${flexbox}
`;
export const Radio: StyledComponent<typeof BP.Radio, object, {} & SLFProps> = styled(BP.Radio)`
  ${space} ${layout} ${flexbox}
`;
export const HTMLSelect: StyledComponent<typeof BP.HTMLSelect, object, {} & SLFProps> = styled(BP.HTMLSelect)`
  ${space} ${layout} ${flexbox}
`;

export const Colors: { [x: string]: string } = {
  logo: '#006666',
  background1: '#30404d',
  background2: '#293742',
  background3: '#28323a',
};
