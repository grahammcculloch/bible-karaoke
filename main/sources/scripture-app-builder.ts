import { BKProject } from '../models/projectFormat.model';
import ProjectSource from '../models/projectSource.model';

const PROJECT_TYPE = 'scriptureAppBuilder';

class ScriptureAppBuilder implements ProjectSource {
  get PROJECT_TYPE(): string {
    return PROJECT_TYPE;
  }
  getProjectStructure(directories: string[]): BKProject[] {
    return [];
  }
}

export default new ScriptureAppBuilder();
