export interface AnimationSettings {
  readonly text: TextSettings;
  readonly background: BackgroundSettings;
  readonly speechBubble: SpeechBubbleSettings;
  readonly output: OutputSettings;
  readonly textLocation: TextLocationSettings;
}

export interface TextSettings {
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly color: string;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly highlightColor: string;
  readonly highlightRGB: string;
}

export interface BackgroundSettings {
  readonly color: string;
  readonly file?: string;
  readonly type?: 'image' | 'video' | 'color';
}

export interface SpeechBubbleSettings {
  readonly color: string;
  readonly rgba: string;
  readonly opacity: number;
}

export interface OutputSettings {
  readonly directory: string;
  readonly filename: string;
  readonly overwriteOutputFiles: boolean;
}

export interface TextLocationSettings {
  readonly location: 'center' | 'subtitle';
}
