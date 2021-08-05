import * as BP from '@blueprintjs/core';
import styled from 'styled-components';
import { space, position, flexbox, typography, layout, SpaceProps, PositionProps, FlexboxProps, TypographyProps, LayoutProps } from 'styled-system';

type STLProps = SpaceProps & TypographyProps & LayoutProps;

type SLFProps = SpaceProps & LayoutProps & FlexboxProps;

type SLPProps = SpaceProps & LayoutProps & PositionProps;

type SLFPProps = SpaceProps & LayoutProps & FlexboxProps & PositionProps;

export const Text = styled(BP.Text)<STLProps>`
  ${space} ${typography} ${layout}
`;
export const H1 = styled(BP.H1)<STLProps>`
  ${space} ${typography} ${layout}
`;
export const H2 = styled(BP.H2)<STLProps>`
  ${space} ${typography} ${layout}
`;
export const H3 = styled(BP.H3)<STLProps>`
  ${space} ${typography} ${layout}
`;
export const H4 = styled(BP.H4)<STLProps>`
  ${space} ${typography} ${layout}
`;
export const H5 = styled(BP.H5)<STLProps>`
  ${space} ${typography} ${layout}
`;
export const H6 = styled(BP.H6)<STLProps>`
  ${space} ${typography} ${layout}
`;
export const Button = styled(BP.Button)<SLPProps>`
  ${space} ${layout} ${position}
`;
export const ButtonGroup = styled(BP.ButtonGroup)<SLPProps>`
  ${space} ${layout} ${position}
`;
export const Icon = styled(BP.Icon)<SLPProps>`
  ${space} ${layout} ${position}
`;
export const Card = styled(BP.Card)<SLFProps>`
  ${space} ${layout} ${flexbox}
`;
export const Checkbox = styled(BP.Checkbox)<SLFProps>`
  ${space} ${layout} ${flexbox}
`;
export const Radio = styled(BP.Radio)<SLFProps>`
  ${space} ${layout} ${flexbox}
`;
export const HTMLSelect = styled(BP.HTMLSelect)<SLFProps>`
  ${space} ${layout} ${flexbox}
`;
export const Tag = styled(BP.Tag)<SLFPProps>`
  ${space} ${layout} ${flexbox} ${position}
`;

export const Colors: { [x: string]: string } = {
  logo: '#006666',
  background1: '#30404d',
  background2: '#293742',
  background3: '#28323a',
};
