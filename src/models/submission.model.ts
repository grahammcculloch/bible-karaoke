import { ConvertProject } from '../../main/models/convertFormat.model';
import { AnimationSettings } from './animationSettings.model';

export interface SubmissionArgs {
  combined: boolean;
  sourceDirectory?: string;
  project: ConvertProject;
  animationSettings: AnimationSettings;
}

export interface SubmissionReturn {
  outputDirectory?: string;
  error?: Error;
}
