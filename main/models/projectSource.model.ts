import { BKProject } from './projectFormat.model';

export default interface ProjectSource {
  SOURCE_TYPE: string;
  getBKProjects(rootDirectories: string[]): BKProject[];
  reloadProject(project: BKProject): BKProject;
}
