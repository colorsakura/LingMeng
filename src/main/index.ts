import { app, BrowserWindow } from 'electron';
import { initLogger, logger } from './logger';
import { initDatabase, closeDatabase } from './database';
import { registerIpcHandlers } from './ipc-handlers';
import { createWindow } from './window';
import { createMenu } from './menu';

const isDev = !app.isPackaged;

app.whenReady().then(() => {
  initLogger();

  logger.info('Application starting...');

  initDatabase();
  registerIpcHandlers();
  createMenu();

  const mainWindow = createWindow();

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  logger.info('Application ready');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  logger.info('Application quitting...');
  closeDatabase();
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception:', error);
  app.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});
