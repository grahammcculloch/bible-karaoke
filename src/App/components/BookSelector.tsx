import { Intent } from "@blueprintjs/core";
import _ from "lodash";
import { useObserver } from "mobx-react";
import React from "react";
import { Flex } from "reflexbox";
import { Tag, H3, Card, Button } from "../blueprint";
import { useStores } from "../store";

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
                {book.isSelected && project.bookSelection.length > 1 && (
                  <Tag position="absolute" zIndex={2} right="-10px" top="-10px" round intent={Intent.SUCCESS}>
                    {selectionCount}
                  </Tag>
                )}
              </Button>
            );
          })}
        </Flex>
      </Card>
    );
  });
}
