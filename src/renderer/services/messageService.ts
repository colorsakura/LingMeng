import { BackendProvider, ChatMessage } from '@shared/types';
import { getBackend, BackendException } from './base';

/**
 * 获取远程会话的消息
 * - Kimi: 调用 getChatDetail，返回会话概要作为消息
 * - 其他后端: 暂不支持
 */
export async function fetchRemoteMessages(
  provider: BackendProvider,
  remoteChatId: string,
  sessionId: string,
  token: string
): Promise<ChatMessage[]> {
  const backend = getBackend(provider);
  backend.setAccessToken(token);

  try {
    switch (provider) {
      case BackendProvider.Kimi: {
        // Kimi API 只返回会话概要，不是完整消息列表
        const detail = await (backend as any).getChatDetail(remoteChatId);
        if (detail && detail.messageContent) {
          return [{
            id: crypto.randomUUID(),
            sessionId,
            role: 'assistant',
            content: detail.messageContent,
            createdAt: Date.now(),
          }];
        }
        return [];
      }
      case BackendProvider.DeepSeek:
      case BackendProvider.Doubao:
      case BackendProvider.Qianwen:
        throw new BackendException(`${provider} 消息获取暂未支持`);
    }
  } catch (error) {
    if (error instanceof BackendException) {
      throw error;
    }
    throw new BackendException(`获取消息失败: ${(error as Error).message}`);
  }
}

/**
 * 从会话ID中提取远程chat ID
 * 格式: kimi_xxxxx -> xxxxx
 */
export function extractRemoteId(sessionId: string): string {
  if (sessionId.includes('_')) {
    return sessionId.substring(sessionId.indexOf('_') + 1);
  }
  return sessionId;
}
