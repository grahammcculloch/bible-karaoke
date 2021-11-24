import { BKProject } from './projectFormat.model';

export default interface ProjectSource {
  PROJECT_TYPE: string;
  getBKProject(rootDirectories: string[]): BKProject[];
}
