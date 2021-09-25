import { format as dateFormat } from 'date-fns';
import fs from 'fs-extra';
import os from 'os';
import { join } from 'path';
import util from 'util';
import winston from 'winston';
import isDev from '../../../../src/utility/isDev';

// Sets up the logger. Should be called when opening the app.
export async function prepareLogger(numLogsToKeep = 10, pathToLogDir = ''): Promise<void> {
  // make sure the logging directory exists
  const homedir = os.homedir();
  if (pathToLogDir === '') {
    switch (process.platform) {
      case 'darwin':
        pathToLogDir = join(homedir, 'Library', 'Logs', 'bible-karaoke');
        break;

      case 'win32':
        pathToLogDir = join(homedir, 'AppData', 'Roaming', 'bible-karaoke', 'logs');
        break;

      default:
        pathToLogDir = join(homedir, '.config', 'bible-karaoke', 'logs');
        break;
    }
  }
  fs.mkdirsSync(pathToLogDir);

  // remove log files that are > numLogsToKeep
  const entries = fs.readdirSync(pathToLogDir);
  while (entries && entries.length > numLogsToKeep) {
    const fileToRemove = entries.shift();
    if (fileToRemove != null) {
      const pathToFile = join(pathToLogDir, fileToRemove);
      fs.removeSync(pathToFile);
    } else {
      break;
    }
  }

  // now create a Logger with a new log file:
  const name = `${dateFormat(new Date(), 'yyyyMMdd_HHmmss')}.log`;
  const pathLogFile = join(pathToLogDir, name);

  // Configure winston default logger
  winston.configure({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({
        filename: pathLogFile,
        handleExceptions: true,
      }),
    ],
  });

  // If we're not in production then log to the `console`.
  if (isDev()) {
    winston.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({
            colors: {
              error: 'red',
              warn: 'yellow',
              info: 'cyan',
            },
          }),
          winston.format.printf(({ level, message, service, ...meta }) => {
            // remove Symbol information
            const metaWithoutSymbols = Object.keys(meta)
              .filter((key) => typeof key !== 'symbol')
              .reduce((obj, key) => {
                obj[key] = meta[key];
                return obj;
              }, {});

            if (Object.keys(metaWithoutSymbols).length > 0) {
              return `${level}: ${message} ${util.inspect(metaWithoutSymbols, { depth: 3, colors: true })}`;
            } else {
              return `${level}: ${message}`;
            }
          })
        ),
      })
    );
  }
  winston.info('Logger Initialized');
}
