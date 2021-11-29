import { ipcRenderer } from 'electron';
import _ from 'lodash';
import { observable, computed, action, reaction, toJS, makeObservable } from 'mobx';
import { persist } from 'mobx-persist';
import { ProgressState } from '../../../main/models/progressState.model';
import { BKProject, BKBook, BKChapter, BKAudio, BKSegment } from '../../../main/models/projectFormat.model';
import {
  BackgroundSettings,
  BackgroundType,
  SpeechBubbleSettings,
  TextLocationSettings,
  TextSettings,
} from '../../models/animationSettings.model';
import { SubmissionArgs, SubmissionReturn } from '../../models/submission.model';
import { TEXT_LOCATION, BACKGROUND_TYPE, DEFAULT_BG_COLOR } from '../constants';
import { getChapterDisplayName } from '../util';
import Store from '.';

const SAMPLE_VERSES = [
  'In the beginning, God created the heavens and the earth.',
  'The earth was without form and void, and darkness was over the face of the deep. ' +
    'And the Spirit of God was hovering over the face of the waters.',
  'And God said, "Let there be light," and there was light.',
  'And God saw that the light was good. And God separated the light from the darkness.',
  'God called the light Day, and the darkness he called Night. ' +
    'And there was evening and there was morning, the first day.',
];

const isVideo = _.memoize((ext: string): boolean => ['mp4', 'webm', 'mov', 'avi'].includes(ext.toLowerCase()));

class Background implements BackgroundSettings {
  constructor() {
    makeObservable(this);
  }

  @persist
  @observable
  color = DEFAULT_BG_COLOR;

  @persist
  @observable
  file = '';

  @computed
  get type(): BackgroundType {
    if (!this.file) {
      return BACKGROUND_TYPE.color;
    }
    const ext: string = this.file.split('.').pop() ?? '';
    return isVideo(ext) ? BACKGROUND_TYPE.video : BACKGROUND_TYPE.image;
  }

  @action.bound
  setFile(file: string): void {
    this.color = '';
    this.file = file;
  }

  @action.bound
  setColor(color: string): void {
    this.color = color;
    this.file = '';
  }

  @action.bound
  update({ file, color }: { file: string; color: string }): void {
    this.file = file;
    this.color = color;
  }
}

type ChapterConstructor = { name: string; audio: BKAudio; segments: BKSegment[] };

export class Chapter implements BKChapter {
  name: string;
  audio: BKAudio;
  segments: BKSegment[];

  constructor({ name, audio, segments }: ChapterConstructor) {
    makeObservable(this);
    this.name = name;
    this.audio = audio;
    this.segments = segments;
  }

  @observable
  isSelected = false;

  @action.bound
  setIsSelected(isSelected: boolean): void {
    this.isSelected = isSelected;
  }

  @action.bound
  toggleIsSelected(): void {
    this.isSelected = !this.isSelected;
  }
}

type BookConstructor = { name: string; chapters: ChapterConstructor[] };

export class Book implements BKBook {
  name: string;

  constructor({ name, chapters }: BookConstructor) {
    makeObservable(this);
    this.name = name;
    this.chapters = chapters.map((chapter: ChapterConstructor) => new Chapter(chapter));
  }

  @observable
  chapters: Chapter[] = [];

  @computed({ keepAlive: true })
  get selectedChapters(): Chapter[] {
    return _.filter(this.chapters, 'isSelected');
  }

  @computed({ keepAlive: true })
  get isSelected(): boolean {
    return _.some(this.chapters, 'isSelected');
  }

  @computed({ keepAlive: true })
  get allSelected(): boolean {
    return _.every(this.chapters, 'isSelected');
  }

  @action.bound
  toggleAllChapters(): void {
    const isSelected = this.allSelected;
    this.chapters.forEach((chapter: Chapter) => chapter.setIsSelected(!isSelected));
  }

  selectionToString(): string {
    return `${this.name}_${this.selectedChapters
      .map((chapter: Chapter) => getChapterDisplayName(chapter.name))
      .join('-')}`;
  }
}

type ProjectConstructor = { name: string; folderPath: string; sourceType: string; books: BookConstructor[] };

export class Project implements BKProject {
  name: string;
  folderPath: string;
  readonly sourceType: string;

  constructor({ name, folderPath, sourceType, books }: ProjectConstructor) {
    makeObservable(this);
    this.name = name;
    this.folderPath = folderPath;
    this.sourceType = sourceType;
    this.books = books.map((book: BookConstructor) => new Book(book));
    this.books.forEach((book: Book) => {
      reaction(
        () => book.isSelected,
        (isSelected: boolean) => {
          this.updateBookSelection(book.name, isSelected);
        }
      );
    });
  }

  @observable
  books: Book[] = [];

  @observable
  bookSelection: string[] = [];

  @observable
  activeBookName = '';

  @computed({ keepAlive: true })
  get selectedBooks(): Book[] {
    return _.filter(this.books, 'isSelected');
  }

  @computed({ keepAlive: true })
  get selectedChapterCount(): number {
    return _.reduce(
      this.selectedBooks,
      (count, book) => {
        count += book.selectedChapters.length;
        return count;
      },
      0
    );
  }

  @computed({ keepAlive: true })
  get activeBook(): Book | undefined {
    return _.find(this.books, { name: this.activeBookName });
  }

  @action.bound
  setActiveBook(bookName: string): void {
    this.activeBookName = bookName;
  }

  @action.bound
  updateBookSelection(bookName: string, isSelected: boolean): void {
    _.remove(this.bookSelection, (book: string) => book === bookName);
    if (isSelected) {
      this.bookSelection.push(bookName);
    }
  }

  selectionToJS(): BKProject {
    return {
      name: this.name,
      folderPath: this.folderPath,
      sourceType: this.sourceType,
      books: this.selectedBooks.map((book) => ({
        name: book.name,
        chapters: book.selectedChapters.map((chapter) => ({
          name: chapter.name,
          audio: { files: [] },
          segments: [],
        })),
      })),
    };
  }
}

class ProjectList {
  constructor() {
    makeObservable(this);
    ipcRenderer.on('did-finish-getbkproject', (_event: Event, projects: Project[]) => {
      this.setProjects(projects);
    });
  }

  @observable
  items: Project[] = [];

  @observable
  activeProjectName = '';

  @computed({ keepAlive: true })
  get activeProject(): Project {
    return _.find(this.items, { name: this.activeProjectName }) as Project;
  }

  @computed({ keepAlive: true })
  get selectedChapters(): Chapter[] {
    return this.activeProject.selectedBooks.reduce((acc: Chapter[], book: Book) => {
      acc.concat(book.selectedChapters);
      return acc;
    }, []);
  }

  @computed({ keepAlive: true })
  get firstSelectedChapter(): Chapter | undefined {
    return _.get(this, ['activeProject', 'selectedBooks', '0', 'selectedChapters', '0']);
  }

  @action.bound
  setProjects(projectList: BKProject[]): void {
    this.items = projectList.map((project) => new Project(project));
    if (projectList.length === 1) {
      this.activeProjectName = projectList[0].name;
    } else if (!_.find(this.items, { name: this.activeProjectName })) {
      this.activeProjectName = '';
    }
  }

  @action.bound
  setActiveProject(projectName = ''): void {
    this.activeProjectName = projectName;
    this.items.forEach((project) => project.setActiveBook(''));
  }
}

export class Progress {
  constructor() {
    makeObservable(this);
    ipcRenderer.on('on-progress', (_event: Event, progress: ProgressState) => {
      this.setProgress(progress);
    });
    ipcRenderer.on('did-finish-conversion', (_event: Event, result: SubmissionReturn) => {
      if (result.outputDirectory) {
        this.finish();
      } else if (result.error?.message) {
        this.setError(result.error.message);
      }
    });
  }

  @observable
  percent = 0;

  @observable
  remainingTime = '';

  @observable
  status = '';

  @observable
  error = '';

  @observable
  inProgress = false;

  @observable
  combined = false;

  @action.bound
  start(args: SubmissionArgs): void {
    console.log('Requesting processing', args);
    ipcRenderer.send('did-start-conversion', args);
    this.combined = args.combined;
    this.error = '';
    this.status = 'Getting things started...';
    this.percent = 0;
    this.remainingTime = '';
    this.inProgress = true;
  }

  @action.bound
  reset(): void {
    this.error = '';
    this.status = '';
    this.percent = 0;
    this.remainingTime = '';
    this.inProgress = false;
  }

  @action.bound
  finish(): void {
    this.error = '';
    this.status = '';
    this.percent = 0;
    this.remainingTime = '';
    this.inProgress = false;
  }

  @action.bound
  setProgress({ status, percent, remainingTime }: ProgressState): void {
    this.status = status;
    this.percent = percent;
    this.remainingTime = remainingTime ?? '';
    this.inProgress = true;
  }

  @action.bound
  setError(error: string): void {
    this.error = error;
  }
}

class AppState {
  root: Store;
  timingFile: string;

  constructor(root: Store) {
    makeObservable(this);
    this.root = root;
    this.timingFile = '';
    reaction(
      () => this.projects.firstSelectedChapter,
      (firstSelectedChapter) => {
        if (firstSelectedChapter && firstSelectedChapter.segments && firstSelectedChapter.segments[0].text) {
          const sampleVerses = firstSelectedChapter.segments.slice(0, 4).map((segment: BKSegment) => segment.text);
          this.setVerses(sampleVerses);
        } else {
          this.setVerses(SAMPLE_VERSES);
        }
      }
    );
  }

  // Temporary migration function from old localStorage persistance.
  // See issue #76.
  migrateFromLocalStorage(): void {
    [
      { key: 'speechBubble', setter: this.setSpeechBubbleProps },
      { key: 'textLocation', setter: this.setTextLocation },
      { key: 'background', setter: this.background.update },
      { key: 'text', setter: this.setTextProps },
    ].forEach(({ key, setter }) => {
      if (localStorage[key]) {
        setter(JSON.parse(localStorage[key]));
        localStorage.removeItem(key);
      }
    });
  }

  @observable
  progress = new Progress();

  @observable
  projects = new ProjectList();

  @observable
  verses = SAMPLE_VERSES;

  @persist('object')
  @observable
  textLocation: TextLocationSettings = {
    location: TEXT_LOCATION.center,
  };

  @persist('object', Background)
  @observable
  background = new Background();

  @persist('object')
  @observable
  text: TextSettings = {
    fontFamily: 'Arial',
    fontSize: 20,
    color: '#555',
    bold: false,
    italic: false,
    highlightColor: 'yellow',
    highlightRGB: 'rgba(255,255,0,1)',
  };

  @persist('object')
  @observable
  speechBubble: SpeechBubbleSettings = {
    color: '#FFF',
    rgba: 'rgba(255,255,255,1)',
    opacity: 1,
  };

  getVideoName(): string {
    // E.g
    // 'Mii_Mark_1.mp4'
    // 'Mii_Mark_1-2-3.mp4'
    // 'Mii_Mark_1-2_Luke_3.mp4'
    const videoType = 'mp4';
    const selection = this.projects.activeProject.selectedBooks
      .map((book) => {
        return book.selectionToString();
      })
      .join('_');
    return `${this.projects.activeProject.name}_${selection}.${videoType}`;
  }

  @action.bound
  setVerses(verses: string[]): void {
    this.verses = verses;
  }

  @action.bound
  setTimingFile(file: string): void {
    this.timingFile = file;
  }

  @action.bound
  setTextLocation(textLocationProps: TextLocationSettings): void {
    this.textLocation = { ...this.textLocation, ...textLocationProps };
  }

  @action.bound
  setTextProps(textProps: Partial<TextSettings>): void {
    this.text = { ...this.text, ...textProps };
  }

  @action.bound
  setSpeechBubbleProps(speechBubbleProps: Partial<SpeechBubbleSettings>): void {
    this.speechBubble = { ...this.speechBubble, ...speechBubbleProps };
  }

  @action.bound
  generateVideo(combined: boolean): void {
    // TODO: Pass selected project structure to the CLI
    const project = this.projects.activeProject.selectionToJS();
    const sourceDirectory = _.get(this.projects, ['activeProject', 'folderPath']);
    const args: SubmissionArgs = {
      project,
      combined,
      sourceDirectory,
      animationSettings: {
        textLocation: toJS(this.textLocation),
        background: _.pick(this.background, 'file', 'color', 'type'),
        text: toJS(this.text),
        speechBubble: toJS(this.speechBubble),
        output: {
          filename: this.getVideoName(),
          directory: toJS(this.root.settings.outputDirectory),
          overwriteOutputFiles: toJS(this.root.settings.overwriteOutputFiles),
        },
      },
    };
    this.progress.start(args);
  }
}

export default AppState;
