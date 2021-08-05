import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styled from 'styled-components';
import { Box } from 'reflexbox';

const Wrapper = styled(Box)`
  opacity: 0;
  transition: opacity 0ms;
  &.visible {
    transition: opacity 500ms ease-in-out;
    opacity: 1;
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
  visible: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]),
  children: PropTypes.node,
};
