import ProjectSource from '../models/projectSource.model';
import hearThis from './hear-this';
import scriptureAppBuilder from './scripture-app-builder';

export default class SourceIndex {
  static getProject(projectType: string): ProjectSource | undefined {
    switch (projectType) {
      case hearThis.PROJECT_TYPE:
        return hearThis;
      case scriptureAppBuilder.PROJECT_TYPE:
        return scriptureAppBuilder;
      default:
        return undefined;
    }
  }
}
