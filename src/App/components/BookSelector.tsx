import React from 'react';
import { useObserver } from 'mobx-react';
import _ from 'lodash';
import styled from 'styled-components';
import { Flex } from 'reflexbox';
import { Intent } from '@blueprintjs/core';
import { Tag, H3, Card, Button } from '../blueprint';
import { useStores } from '../store';

const BookButton = styled(Button).attrs({
  position: "relative",
  m: 1
})``;

const BookTag = styled(Tag).attrs({
  position: "absolute",
  zIndex: 2,
  right: "-10px",
  top: "-10px"
})``;

export default function BookSelector(props: any): JSX.Element | null {
  const { appState } = useStores();
  return useObserver(() => {
    const project = appState.projects.activeProject;
    if (!project) {
      return null;
    }
    return (
      <Card {...props}>
        <H3>{project.name}</H3>
        <Flex flexWrap="wrap" m={-1}>
          {project.bookList.map((book: any): JSX.Element => {
            let selectionCount = null;
            if (book.isSelected) {
              selectionCount = _.indexOf(project.bookSelection, book.name) + 1;
            }
            return (
              <BookButton
                key={book.name}
                intent={book.isSelected ? Intent.PRIMARY : undefined}
                onClick={(): void => { project.setActiveBook(book.name); }}
                active={project.activeBookName === book.name}
              >
                {book.name}
                {book.isSelected && project.bookSelection.length > 1 && (
                  <BookTag round intent={Intent.SUCCESS}>
                    {selectionCount}
                  </BookTag>
                )}
              </BookButton>
            );
          })}
        </Flex>
      </Card>
    );
  });
}
