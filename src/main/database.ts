import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import { ChatSession, ChatMessage, BackendProvider, SessionRow, MessageRow, Note, NoteRow } from '../shared/types';
import { logger } from './logger';

let db: Database.Database;

export function initDatabase() {
  const dbPath = app.isPackaged
    ? path.join(app.getPath('userData'), 'lingmeng.db')
    : path.join(process.cwd(), 'lingmeng.db');

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      last_message TEXT,
      backend TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  logger.info('[Database] Initialized at:', dbPath);
}

export function closeDatabase() {
  if (db) {
    db.close();
    logger.info('[Database] Closed');
  }
}

// Session DAO
export class SessionDao {
  static getAll(): ChatSession[] {
    const rows = db.prepare(`
      SELECT * FROM sessions ORDER BY updated_at ASC
    `).all() as SessionRow[];
    return rows.map(SessionDao._rowToSession);
  }

  static getById(id: string): ChatSession | null {
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as SessionRow | undefined;
    return row ? SessionDao._rowToSession(row) : null;
  }

  static insert(session: Omit<ChatSession, 'createdAt' | 'updatedAt'>): ChatSession {
    const now = Date.now();
    const fullSession: ChatSession = {
      ...session,
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(`
      INSERT INTO sessions (id, name, last_message, backend, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      fullSession.id,
      fullSession.name,
      fullSession.lastMessage,
      fullSession.backend,
      fullSession.createdAt,
      fullSession.updatedAt
    );

    return fullSession;
  }

  static update(session: ChatSession): void {
    db.prepare(`
      UPDATE sessions SET name = ?, last_message = ?, backend = ?, updated_at = ?
      WHERE id = ?
    `).run(
      session.name,
      session.lastMessage,
      session.backend,
      Date.now(),
      session.id
    );
  }

  static delete(id: string): void {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  }

  static updateLastMessage(id: string, message: string): void {
    db.prepare(`
      UPDATE sessions SET last_message = ?, updated_at = ?
      WHERE id = ?
    `).run(message, Date.now(), id);
  }

  private static _rowToSession(row: SessionRow): ChatSession {
    return {
      id: row.id,
      name: row.name,
      lastMessage: row.last_message,
      backend: row.backend as BackendProvider,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

// Message DAO
export class MessageDao {
  static getBySessionId(sessionId: string): ChatMessage[] {
    const rows = db.prepare(`
      SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC
    `).all(sessionId) as MessageRow[];
    return rows.map(MessageDao._rowToMessage);
  }

  static insert(message: Omit<ChatMessage, 'createdAt'>): ChatMessage {
    const fullMessage: ChatMessage = {
      ...message,
      createdAt: Date.now(),
    };

    db.prepare(`
      INSERT INTO messages (id, session_id, role, content, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      fullMessage.id,
      fullMessage.sessionId,
      fullMessage.role,
      fullMessage.content,
      fullMessage.createdAt
    );

    return fullMessage;
  }

  static delete(id: string): void {
    db.prepare('DELETE FROM messages WHERE id = ?').run(id);
  }

  static deleteBySessionId(sessionId: string): void {
    db.prepare('DELETE FROM messages WHERE session_id = ?').run(sessionId);
  }

  private static _rowToMessage(row: MessageRow): ChatMessage {
    return {
      id: row.id,
      sessionId: row.session_id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      createdAt: row.created_at,
    };
  }
}

// Note DAO
export class NoteDao {
  static getAll(): Note[] {
    const rows = db.prepare(`
      SELECT * FROM notes ORDER BY updated_at DESC
    `).all() as NoteRow[];
    return rows.map(NoteDao._rowToNote);
  }

  static getById(id: string): Note | null {
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(id) as NoteRow | undefined;
    return row ? NoteDao._rowToNote(row) : null;
  }

  static insert(note: Omit<Note, 'createdAt' | 'updatedAt'>): Note {
    const now = Date.now();
    const fullNote: Note = {
      ...note,
      createdAt: now,
      updatedAt: now,
    };

    db.prepare(`
      INSERT INTO notes (id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(fullNote.id, fullNote.title, fullNote.content, fullNote.createdAt, fullNote.updatedAt);

    return fullNote;
  }

  static update(note: Note): void {
    db.prepare(`
      UPDATE notes SET title = ?, content = ?, updated_at = ?
      WHERE id = ?
    `).run(note.title, note.content, Date.now(), note.id);
  }

  static delete(id: string): void {
    db.prepare('DELETE FROM notes WHERE id = ?').run(id);
  }

  private static _rowToNote(row: NoteRow): Note {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export { db };
