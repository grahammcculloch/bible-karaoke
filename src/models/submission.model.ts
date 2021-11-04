import { BKProject } from '../../main/models/projectFormat.model';
import { AnimationSettings } from './animationSettings.model';

export interface SubmissionArgs {
  combined: boolean;
  sourceDirectory?: string;
  project: BKProject;
  animationSettings: AnimationSettings;
}

export interface SubmissionReturn {
  outputDirectory?: string;
  error?: Error;
}
