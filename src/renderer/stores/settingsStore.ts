import { create } from 'zustand';
import { BackendProvider, ChatSession, ChatMessage, Note } from '@shared/types';
import { SyncService } from '../services/syncService';

// Session Store
interface SessionState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  loading: boolean;
  syncing: boolean;
  error: string | null;

  loadSessions: () => Promise<void>;
  createSession: (name: string, backend: BackendProvider) => Promise<ChatSession>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (id: string | null) => void;
  updateSessionLastMessage: (id: string, message: string) => Promise<void>;
  syncFromRemote: (tokens: Record<BackendProvider, string | null>) => Promise<void>;
}

export const useSessionStore = create<SessionState>((set) => ({
  sessions: [],
  currentSessionId: null,
  loading: false,
  syncing: false,
  error: null,

  loadSessions: async () => {
    set({ loading: true, error: null });
    try {
      const sessions = await window.electronAPI.db.getSessions();
      set({ sessions, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createSession: async (name: string, backend: BackendProvider) => {
    const id = crypto.randomUUID();
    const session = await window.electronAPI.db.createSession({
      id,
      name,
      lastMessage: null,
      backend,
    });
    set((state) => ({
      sessions: [session, ...state.sessions],
      currentSessionId: id,
    }));
    return session;
  },

  deleteSession: async (id: string) => {
    await window.electronAPI.db.deleteSession(id);
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
      currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
    }));
  },

  setCurrentSession: (id: string | null) => {
    set({ currentSessionId: id });
  },

  updateSessionLastMessage: async (id: string, message: string) => {
    await window.electronAPI.db.updateSessionLastMessage(id, message);
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, lastMessage: message, updatedAt: Date.now() } : s
      ),
    }));
  },

  syncFromRemote: async (tokens: Record<BackendProvider, string | null>) => {
    set({ syncing: true, error: null });
    try {
      // Sync from each configured backend
      for (const provider of Object.values(BackendProvider)) {
        const token = tokens[provider];
        if (token) {
          await SyncService.syncRemoteSessions(provider, token);
        }
      }
      // Reload sessions after sync
      const sessions = await window.electronAPI.db.getSessions();
      set({ sessions, syncing: false });
    } catch (error) {
      set({ error: (error as Error).message, syncing: false });
    }
  },
}));

// Message Store
interface MessageState {
  messages: ChatMessage[];
  loading: boolean;
  sending: boolean;
  error: string | null;

  loadMessages: (sessionId: string) => Promise<void>;
  addMessage: (message: ChatMessage) => Promise<void>;
  setSending: (sending: boolean) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  loading: false,
  sending: false,
  error: null,

  loadMessages: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const messages = await window.electronAPI.db.getMessages(sessionId);
      set({ messages, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addMessage: async (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  setSending: (sending: boolean) => {
    set({ sending });
  },

  clearMessages: () => {
    set({ messages: [], error: null });
  },
}));

// Settings Store
interface SettingsState {
  currentBackend: BackendProvider;
  tokens: Record<BackendProvider, string | null>;
  loading: boolean;

  loadSettings: () => Promise<void>;
  setCurrentBackend: (backend: BackendProvider) => Promise<void>;
  setToken: (backend: BackendProvider, token: string) => Promise<void>;
  getToken: (backend: BackendProvider) => string | null;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  currentBackend: BackendProvider.Kimi,
  tokens: {
    [BackendProvider.Kimi]: null,
    [BackendProvider.DeepSeek]: null,
    [BackendProvider.Doubao]: null,
    [BackendProvider.Qianwen]: null,
  },
  loading: true,

  loadSettings: async () => {
    try {
      const currentBackend = await window.electronAPI.settings.getCurrentBackend();
      const tokens = {
        [BackendProvider.Kimi]: await window.electronAPI.settings.getToken(BackendProvider.Kimi),
        [BackendProvider.DeepSeek]: await window.electronAPI.settings.getToken(BackendProvider.DeepSeek),
        [BackendProvider.Doubao]: await window.electronAPI.settings.getToken(BackendProvider.Doubao),
        [BackendProvider.Qianwen]: await window.electronAPI.settings.getToken(BackendProvider.Qianwen),
      };
      set({ currentBackend, tokens, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setCurrentBackend: async (backend: BackendProvider) => {
    await window.electronAPI.settings.setCurrentBackend(backend);
    set({ currentBackend: backend });
  },

  setToken: async (backend: BackendProvider, token: string) => {
    await window.electronAPI.settings.setToken(backend, token);
    set((state) => ({
      tokens: { ...state.tokens, [backend]: token },
    }));
  },

  getToken: (backend: BackendProvider) => {
    return get().tokens[backend];
  },
}));

// Chat Store (for streaming state)
interface ChatState {
  isStreaming: boolean;
  streamingContent: string;

  setStreaming: (streaming: boolean) => void;
  appendStreamingContent: (content: string) => void;
  clearStreamingContent: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isStreaming: false,
  streamingContent: '',

  setStreaming: (streaming: boolean) => {
    set({ isStreaming: streaming });
  },

  appendStreamingContent: (content: string) => {
    set((state) => ({
      streamingContent: state.streamingContent + content,
    }));
  },

  clearStreamingContent: () => {
    set({ streamingContent: '', isStreaming: false });
  },
}));

// Note Store
interface NoteState {
  notes: Note[];
  currentNoteId: string | null;
  loading: boolean;

  loadNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<Note>;
  updateNote: (id: string, title?: string, content?: string) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (id: string | null) => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  currentNoteId: null,
  loading: false,

  loadNotes: async () => {
    set({ loading: true });
    try {
      const notes = await window.electronAPI.db.getNotes();
      set({ notes, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createNote: async (title: string, content: string) => {
    const id = crypto.randomUUID();
    const note = await window.electronAPI.db.createNote({ id, title, content });
    set((state) => ({
      notes: [note, ...state.notes],
      currentNoteId: id,
    }));
    return note;
  },

  updateNote: async (id: string, title?: string, content?: string) => {
    const existing = get().notes.find((n) => n.id === id);
    if (!existing) return;
    const updated: Note = {
      ...existing,
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      updatedAt: Date.now(),
    };
    await window.electronAPI.db.updateNote(updated);
    set((state) => ({
      notes: state.notes.map((n) => (n.id === id ? updated : n)),
    }));
  },

  deleteNote: async (id: string) => {
    await window.electronAPI.db.deleteNote(id);
    set((state) => ({
      notes: state.notes.filter((n) => n.id !== id),
      currentNoteId: state.currentNoteId === id ? null : state.currentNoteId,
    }));
  },

  setCurrentNote: (id: string | null) => {
    set({ currentNoteId: id });
  },
}));
