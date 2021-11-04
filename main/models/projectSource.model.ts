import { BKProject } from './projectFormat.model';

export default interface ProjectSource {
  PROJECT_TYPE: string;
  getProjectStructure(rootDirectories: string[]): BKProject[];
}
