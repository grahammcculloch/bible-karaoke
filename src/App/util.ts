export function getChapterDisplayName(chapter: string): string {
  if (chapter === '0') {
    return 'Intro';
  } else {
    return chapter;
  }
}
