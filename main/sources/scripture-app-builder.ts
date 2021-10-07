import ProjectSource from '../models/projectSource.model';
import { Project } from './util';

const PROJECT_TYPE = 'scriptureAppBuilder';

class ScriptureAppBuilder implements ProjectSource {
  get PROJECT_TYPE(): string {
    return PROJECT_TYPE;
  }
  getProjectStructure(directories: string[]): Project[] {
    return [];
  }
}

export default new ScriptureAppBuilder();
