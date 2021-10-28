import classnames from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { Box } from "reflexbox";
import styled from "styled-components";

const Wrapper = styled(Box)`
  opacity: 0;
  transition: opacity 0ms;
  visibility: hidden;
  &.visible {
    transition: opacity 500ms ease-in-out;
    opacity: 1;
    visibility: visible;
  }
`;

interface AnimatedVisibilityProps {
  visible: boolean;
  children: JSX.Element[] | JSX.Element;
}

export default function AnimatedVisibility(prop: AnimatedVisibilityProps): JSX.Element {
  return (
    <Wrapper flex={1} className={classnames({ visible: prop.visible })}>
      {prop.children}
    </Wrapper>
  );
}

AnimatedVisibility.propTypes = {
  visible: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  children: PropTypes.node,
};
