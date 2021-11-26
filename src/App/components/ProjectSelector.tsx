import _ from "lodash";
import { useObserver } from "mobx-react";
import React from "react";
import { HTMLSelect } from "../blueprint";
import { Project, useStores } from "../store";
import { useAnalytics } from "./Analytics";

export default function ProjectSelector(): JSX.Element {
  const { appState } = useStores();
  const { analytics } = useAnalytics();
  const onChange = React.useCallback(
    (event) => {
      if (!event.target.value && appState.projects.activeProjectName) {
        // Do not allow user to 'un-select' a project
        return;
      }
      appState.projects.setActiveProject(event.target.value);

      // If a chapter has already been selected in the project set the first one as active.
      // This will show the chapters when returning to a project.
      const project = appState.projects.activeProject;
      if (project.bookSelection.length > 0) {
        project.setActiveBook(project.bookSelection[0]);
      }
      analytics.trackEvent("User Interaction", "Project Loaded");
    },
    [appState, analytics]
  );
  return useObserver(() => {
    const projectOptions = [
      { value: "", label: "Select a project..." },
      ..._.map(appState.projects.items, (p: Project) => ({ value: p.name, label: p.name })),
    ];
    return (
      <HTMLSelect
        fill
        large={!appState.projects.activeProjectName}
        id="select-project"
        options={projectOptions}
        value={appState.projects.activeProjectName}
        onChange={onChange}
      />
    );
  });
}
