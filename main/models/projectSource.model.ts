import { Project } from '../sources/util';

export default interface ProjectSource {
  PROJECT_TYPE: string;
  getProjectStructure(rootDirectories: string[]): Project[];
}
