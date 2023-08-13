import { Tooltip, Popover, PopoverInteractionKind, PopoverPosition, IconName, MaybeElement } from "@blueprintjs/core";
import React from "react";
import { Box, Flex, BoxProps } from "reflexbox";
import styled from "styled-components";
import { position, PositionProps } from "styled-system";
import { Button, H5 } from "../../blueprint";

const Wrapper = styled(Box)<PositionProps>`
  ${position}
  position: absolute;
`;

export const EditRow = styled(Flex).attrs({
  flexDirection: "row",
  alignItems: "center",
})``;

export interface EditPopoverProps extends PositionProps, BoxProps {
  icon?: IconName | MaybeElement;
  title?: string | React.JSX.Element;
  children?: React.JSX.Element | React.JSX.Element[];
}

export default function EditPopover({
  icon = "annotation",
  title,
  children,
  ...props
}: EditPopoverProps): React.JSX.Element {
  return (
    <Wrapper top="8px" right="8px" {...props}>
      <Popover position={PopoverPosition.RIGHT_TOP} interactionKind={PopoverInteractionKind.CLICK}>
        <Tooltip content={title}>
          <Button minimal icon={icon} />
        </Tooltip>
        <Box p={3}>
          <H5 mb={3}>{title}</H5>
          {children}
        </Box>
      </Popover>
    </Wrapper>
  );
}
