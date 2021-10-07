import fs from 'fs';
import path from 'path';

const isDirectory = (source: string): boolean => fs.lstatSync(source).isDirectory();

export const getDirectories = (source: string): string[] =>
  fs.readdirSync(source).filter((name: string) => isDirectory(path.join(source, name)));
