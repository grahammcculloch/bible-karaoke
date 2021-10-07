//Used in the convert functions

export interface ConvertProject {
  name: string;
  fullPath: string;
  books: ConvertBook[];
}

export interface ConvertBook {
  name: string;
  chapters: ConvertChapter[];
}

export interface ConvertChapter {
  name: string;
}
