import { BackendProvider, ChatSession } from '@shared/types';
import { getBackend } from './base';

export class SyncService {
  /**
   * 从指定后端获取远程会话
   */
  static async fetchSessionsFromBackend(
    provider: BackendProvider,
    token: string
  ): Promise<ChatSession[]> {
    const backend = getBackend(provider);
    backend.setAccessToken(token);

    try {
      // Try to call listChats if it exists
      if ('listChats' in backend && typeof backend.listChats === 'function') {
        return await (backend as any).listChats();
      }
    } catch (error) {
      console.error(`[SyncService] Failed to fetch sessions from ${provider}:`, error);
    }
    return [];
  }

  /**
   * 从所有已配置的后端获取会话并合并
   */
  static async fetchAllSessions(
    tokens: Record<BackendProvider, string | null>
  ): Promise<ChatSession[]> {
    const allSessions: ChatSession[] = [];

    for (const provider of Object.values(BackendProvider)) {
      const token = tokens[provider];
      if (token) {
        try {
          const sessions = await this.fetchSessionsFromBackend(provider, token);
          allSessions.push(...sessions);
        } catch (error) {
          console.error(`[SyncService] Error syncing ${provider}:`, error);
        }
      }
    }

    // Sort by updated time ascending (oldest first)
    allSessions.sort((a, b) => a.updatedAt - b.updatedAt);
    return allSessions;
  }

  /**
   * 同步远程会话到本地数据库
   * - 远程存在但本地不存在：插入
   * - 远程和本地都存在：更新本地
   */
  static async syncRemoteSessions(
    provider: BackendProvider,
    token: string
  ): Promise<{ added: number; updated: number }> {
    const remoteSessions = await this.fetchSessionsFromBackend(provider, token);
    const localSessions = await window.electronAPI.db.getSessions();

    let added = 0;
    let updated = 0;

    for (const remote of remoteSessions) {
      const local = localSessions.find((s) => s.id === remote.id);

      if (!local) {
        // Insert new session
        await window.electronAPI.db.createSession({
          id: remote.id,
          name: remote.name,
          lastMessage: remote.lastMessage,
          backend: remote.backend,
        });
        added++;
      } else if (remote.updatedAt > local.updatedAt) {
        // Update if remote is newer
        await window.electronAPI.db.updateSession({
          ...local,
          name: remote.name,
          lastMessage: remote.lastMessage,
          updatedAt: remote.updatedAt,
        });
        updated++;
      }
    }

    return { added, updated };
  }
}
