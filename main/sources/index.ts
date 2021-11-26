import ProjectSource from '../models/projectSource.model';
import hearThis from './hear-this';
import scriptureAppBuilder from './scripture-app-builder';

export default class SourceIndex {
  static getSource(projectType: string): ProjectSource | undefined {
    switch (projectType) {
      case hearThis.SOURCE_TYPE:
        return hearThis;
      case scriptureAppBuilder.SOURCE_TYPE:
        return scriptureAppBuilder;
      default:
        return undefined;
    }
  }
}
