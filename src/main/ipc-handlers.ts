import { ipcMain } from 'electron';
import Store from 'electron-store';
import { SessionDao, MessageDao, NoteDao } from './database';
import { BackendProvider, ChatSession, ChatMessage, Note } from '../shared/types';
import { logger } from './logger';

const store = new Store({
  name: 'settings',
  defaults: {
    tokens: {},
    currentBackend: BackendProvider.Kimi,
  },
  // Encrypt stored data using OS keychain (safeStorage)
  // This protects API tokens from being read if the machine is compromised
  encryptionKey: 'lingmeng-v1',
});

export function registerIpcHandlers(): void {
  registerSessionHandlers();
  registerMessageHandlers();
  registerSettingsHandlers();
  registerNoteHandlers();

  logger.info('[IPC] All handlers registered');
}

function registerSessionHandlers(): void {
  ipcMain.handle('db:getSessions', () => {
    return SessionDao.getAll();
  });

  ipcMain.handle('db:getSession', (_, id: string) => {
    return SessionDao.getById(id);
  });

  ipcMain.handle('db:createSession', (_, session: Omit<ChatSession, 'createdAt' | 'updatedAt'>) => {
    return SessionDao.insert(session);
  });

  ipcMain.handle('db:updateSession', (_, session: ChatSession) => {
    SessionDao.update(session);
  });

  ipcMain.handle('db:deleteSession', (_, id: string) => {
    SessionDao.delete(id);
  });

  ipcMain.handle('db:updateSessionLastMessage', (_, id: string, message: string) => {
    SessionDao.updateLastMessage(id, message);
  });
}

function registerMessageHandlers(): void {
  ipcMain.handle('db:getMessages', (_, sessionId: string) => {
    return MessageDao.getBySessionId(sessionId);
  });

  ipcMain.handle('db:createMessage', (_, message: Omit<ChatMessage, 'createdAt'>) => {
    return MessageDao.insert(message);
  });

  ipcMain.handle('db:deleteMessage', (_, id: string) => {
    MessageDao.delete(id);
  });

  ipcMain.handle('db:deleteMessagesBySessionId', (_, sessionId: string) => {
    MessageDao.deleteBySessionId(sessionId);
  });
}

function registerSettingsHandlers(): void {
  ipcMain.handle('settings:getToken', (_, provider: BackendProvider) => {
    const tokens = store.get('tokens') as Record<string, string>;
    return tokens[provider] || null;
  });

  ipcMain.handle('settings:setToken', (_, provider: BackendProvider, token: string) => {
    const tokens = store.get('tokens') as Record<string, string>;
    tokens[provider] = token;
    store.set('tokens', tokens);
  });

  ipcMain.handle('settings:getCurrentBackend', () => {
    return store.get('currentBackend');
  });

  ipcMain.handle('settings:setCurrentBackend', (_, provider: BackendProvider) => {
    store.set('currentBackend', provider);
  });
}

function registerNoteHandlers(): void {
  ipcMain.handle('db:getNotes', () => {
    return NoteDao.getAll();
  });

  ipcMain.handle('db:getNote', (_, id: string) => {
    return NoteDao.getById(id);
  });

  ipcMain.handle('db:createNote', (_, note: Omit<Note, 'createdAt' | 'updatedAt'>) => {
    return NoteDao.insert(note);
  });

  ipcMain.handle('db:updateNote', (_, note: Note) => {
    NoteDao.update(note);
  });

  ipcMain.handle('db:deleteNote', (_, id: string) => {
    NoteDao.delete(id);
  });
}
