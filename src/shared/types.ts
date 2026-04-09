// Backend Provider Types
export enum BackendProvider {
  Kimi = 'kimi',
  DeepSeek = 'deepseek',
  Doubao = 'doubao',
  Qianwen = 'qianwen',
}

export const BackendProviderDisplayNames: Record<BackendProvider, string> = {
  [BackendProvider.Kimi]: 'Kimi',
  [BackendProvider.DeepSeek]: 'DeepSeek',
  [BackendProvider.Doubao]: '豆包',
  [BackendProvider.Qianwen]: '通义千问',
};

export const BackendProviderColors: Record<BackendProvider, string> = {
  [BackendProvider.Kimi]: '#4F46E5',
  [BackendProvider.DeepSeek]: '#10B981',
  [BackendProvider.Doubao]: '#F97316',
  [BackendProvider.Qianwen]: '#8B5CF6',
};

// Session Model
export interface ChatSession {
  id: string;
  name: string;
  lastMessage: string | null;
  backend: BackendProvider;
  createdAt: number; // timestamp in ms
  updatedAt: number; // timestamp in ms
}

// Message Model
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number; // timestamp in ms
}

// Database Row Types
export interface SessionRow {
  id: string;
  name: string;
  last_message: string | null;
  backend: string;
  created_at: number;
  updated_at: number;
}

export interface MessageRow {
  id: string;
  session_id: string;
  role: string;
  content: string;
  created_at: number;
}

// IPC API Types
export interface ElectronAPI {
  // Database operations
  db: {
    getSessions: () => Promise<ChatSession[]>;
    getSession: (id: string) => Promise<ChatSession | null>;
    createSession: (session: Omit<ChatSession, 'createdAt' | 'updatedAt'>) => Promise<ChatSession>;
    updateSession: (session: ChatSession) => Promise<void>;
    deleteSession: (id: string) => Promise<void>;
    updateSessionLastMessage: (id: string, message: string) => Promise<void>;

    getMessages: (sessionId: string) => Promise<ChatMessage[]>;
    createMessage: (message: Omit<ChatMessage, 'createdAt'>) => Promise<ChatMessage>;
    deleteMessage: (id: string) => Promise<void>;
    deleteMessagesBySessionId: (sessionId: string) => Promise<void>;
  };

  // Settings operations
  settings: {
    getToken: (provider: BackendProvider) => Promise<string | null>;
    setToken: (provider: BackendProvider, token: string) => Promise<void>;
    getCurrentBackend: () => Promise<BackendProvider>;
    setCurrentBackend: (provider: BackendProvider) => Promise<void>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
