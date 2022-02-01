import { observer } from "mobx-react";
import React from "react";
import { HTMLSelect } from "../blueprint";
import { PROJECT_TYPE } from "../constants";
import { Project, useStores } from "../store";
import { useAnalytics } from "./Analytics";

const ProjectSelector = observer((): JSX.Element => {
  const { appState } = useStores();
  const { analytics } = useAnalytics();
  const onChange = React.useCallback(
    (event) => {
      if (!event.target.value && appState.projects.activeProjectPath) {
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

  const hearThisProjects = appState.projects.items
    .filter((p: Project) => p.sourceType === PROJECT_TYPE.hearThis)
    .map((p: Project) => (
      <option value={p.folderPath} key={p.folderPath}>
        {p.name}
      </option>
    ));
  const SABProjects = appState.projects.items
    .filter((p: Project) => p.sourceType === PROJECT_TYPE.scriptureAppBuilder)
    .map((p: Project) => (
      <option value={p.folderPath} key={p.folderPath}>
        {p.name}
      </option>
    ));
  return (
    <HTMLSelect
      fill
      large={!appState.projects.activeProjectPath}
      id="select-project"
      value={appState.projects.activeProjectPath}
      onChange={onChange}
    >
      <option value="" key="Select a project...">
        Select a project...
      </option>
      <optgroup label="HearThis">{hearThisProjects}</optgroup>
      <optgroup label="SAB">{SABProjects}</optgroup>
    </HTMLSelect>
  );
});

export default ProjectSelector;
