// BK Project Format
export interface BKProject {
  readonly name: string;
  readonly folderPath: string;
  readonly sourceType: string;
  readonly books: BKBook[];
}

export interface BKBook {
  readonly name: string;
  readonly chapters: BKChapter[];
}

export interface BKChapter {
  readonly name: string;
  audio: BKAudio;
  readonly segments: BKSegment[];
}

export interface BKAudio {
  files: {
    filename: string;
    length: number;
  }[];
  length?: number;
}

export interface BKSegment {
  readonly segmentId: number;
  readonly text: string;
  readonly verse: string;
  readonly startTime: number;
  readonly length: number;
  readonly isHeading: boolean;
}
