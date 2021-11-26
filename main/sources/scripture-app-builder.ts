import { BKProject } from '../models/projectFormat.model';
import ProjectSource from '../models/projectSource.model';

const SOURCE_TYPE = 'scriptureAppBuilder';

class ScriptureAppBuilder implements ProjectSource {
  get SOURCE_TYPE(): string {
    return SOURCE_TYPE;
  }
  getBKProjects(directories: string[]): BKProject[] {
    return [];
  }
  reloadProject(project: BKProject): BKProject {
    return project;
  }
}

export default new ScriptureAppBuilder();
