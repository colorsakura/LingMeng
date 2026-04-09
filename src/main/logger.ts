import log from 'electron-log';

export let logger = log.default || log;

export function initLogger(): void {
  logger.transports.file.level = 'info';
  logger.transports.console.level = 'debug';
  logger.transports.file.maxSize = 5 * 1024 * 1024;
}
