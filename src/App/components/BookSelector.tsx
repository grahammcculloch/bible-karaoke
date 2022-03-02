import { Alignment, Intent } from "@blueprintjs/core";
import { observer } from "mobx-react";
import React from "react";
import { Flex } from "reflexbox";
import { Button, Card, CardProps, Checkbox, H3 } from "../blueprint";
import { Book, useStores } from "../store";

const BookSelector = observer((props: CardProps): JSX.Element | null => {
  const { appState } = useStores();
  const project = appState.projects.activeProject;
  if (!project) {
    return null;
  }
  return (
    <Card {...props}>
      <Flex alignItems="center" justifyContent="space-between">
        <H3>{project.name}</H3>
        <Checkbox
          label={project.isSelected ? "Clear all" : "Select all"}
          alignIndicator={Alignment.RIGHT}
          onChange={(): void => {
            project.toggleAllChapters();
          }}
          checked={project.allSelected}
          indeterminate={project.isSelected && !project.allSelected}
        />
      </Flex>
      <Flex flexWrap="wrap" m={-1}>
        {project.books.map((book: Book): JSX.Element => {
          return (
            <Button
              position="relative"
              m={1}
              key={book.name}
              intent={book.isSelected ? Intent.PRIMARY : undefined}
              onClick={(): void => {
                project.setActiveBook(book.name);
              }}
              active={project.activeBookName === book.name}
            >
              {book.name}
            </Button>
          );
        })}
      </Flex>
    </Card>
  );
});

export default BookSelector;
