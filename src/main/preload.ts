import { contextBridge, ipcRenderer } from 'electron';
import { BackendProvider } from '../shared/types';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  db: {
    getSessions: () => ipcRenderer.invoke('db:getSessions'),
    getSession: (id: string) => ipcRenderer.invoke('db:getSession', id),
    createSession: (session: {
      id: string;
      name: string;
      lastMessage: string | null;
      backend: BackendProvider;
    }) => ipcRenderer.invoke('db:createSession', session),
    updateSession: (session: {
      id: string;
      name: string;
      lastMessage: string | null;
      backend: BackendProvider;
      createdAt: number;
      updatedAt: number;
    }) => ipcRenderer.invoke('db:updateSession', session),
    deleteSession: (id: string) => ipcRenderer.invoke('db:deleteSession', id),
    updateSessionLastMessage: (id: string, message: string) =>
      ipcRenderer.invoke('db:updateSessionLastMessage', id, message),

    getMessages: (sessionId: string) =>
      ipcRenderer.invoke('db:getMessages', sessionId),
    createMessage: (message: {
      id: string;
      sessionId: string;
      role: 'user' | 'assistant';
      content: string;
    }) => ipcRenderer.invoke('db:createMessage', message),
    deleteMessage: (id: string) => ipcRenderer.invoke('db:deleteMessage', id),
    deleteMessagesBySessionId: (sessionId: string) =>
      ipcRenderer.invoke('db:deleteMessagesBySessionId', sessionId),
  },

  // Settings operations
  settings: {
    getToken: (provider: BackendProvider) =>
      ipcRenderer.invoke('settings:getToken', provider),
    setToken: (provider: BackendProvider, token: string) =>
      ipcRenderer.invoke('settings:setToken', provider, token),
    getCurrentBackend: () => ipcRenderer.invoke('settings:getCurrentBackend'),
    setCurrentBackend: (provider: BackendProvider) =>
      ipcRenderer.invoke('settings:setCurrentBackend', provider),
  },
});
