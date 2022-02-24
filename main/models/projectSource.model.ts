import { BKProject } from './projectFormat.model';

export default interface ProjectSource {
  readonly SOURCE_TYPE: string;
  getBKProjects(rootDirectories: string[]): BKProject[];
  reloadProject(project: BKProject): BKProject;
}
