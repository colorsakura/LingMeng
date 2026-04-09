import { useEffect, useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { message as antMessage } from 'antd';
import { useSessionStore, useMessageStore, useSettingsStore } from '../stores/settingsStore';
import { MessageList, ChatInput } from '../components/Chat';
import { getBackend, BackendException, fetchRemoteMessages, extractRemoteId } from '../services';

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { setCurrentSession, updateSessionLastMessage } = useSessionStore();
  const { messages, loading, error, loadMessages, addMessage, clearMessages } = useMessageStore();
  const { currentBackend, tokens } = useSettingsStore();

  const sendingRef = useRef(false);
  const [isSending, setIsSending] = useState(false);

  const showMessage = useCallback((type: 'error' | 'info', msg: string) => {
    if (type === 'error') {
      antMessage.error(msg, 4);
    } else {
      antMessage.info(msg, 4);
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      setCurrentSession(sessionId);
      loadMessagesAndSync(sessionId);
    } else {
      clearMessages();
    }
  }, [sessionId, setCurrentSession]);

  const loadMessagesAndSync = async (sid: string) => {
    await loadMessages(sid);

    const currentMessages = useMessageStore.getState().messages;
    const currentSessions = useSessionStore.getState().sessions;
    const currentTokens = useSettingsStore.getState().tokens;

    const session = currentSessions.find((s) => s.id === sid);
    if (!session) return;

    if (currentMessages.length === 0) {
      const token = currentTokens[session.backend];
      if (!token) return;

      try {
        const remoteId = extractRemoteId(sid);
        const remoteMessages = await fetchRemoteMessages(
          session.backend,
          remoteId,
          sid,
          token
        );

        for (const msg of remoteMessages) {
          await window.electronAPI.db.createMessage(msg);
          addMessage(msg);
        }
      } catch (err) {
        console.error('[ChatPage] Failed to fetch remote messages:', err);
      }
    }
  };

  const handleSend = useCallback(async (content: string) => {
    if (!sessionId || sendingRef.current) return;

    const token = tokens[currentBackend];
    if (!token) {
      showMessage('info', `请先在设置中配置 ${currentBackend} 的 API Token`);
      return;
    }

    sendingRef.current = true;
    setIsSending(true);

    const conversationHistory = useMessageStore.getState().messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const userMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: 'user' as const,
      content,
      createdAt: Date.now(),
    };

    try {
      await window.electronAPI.db.createMessage(userMessage);
      addMessage(userMessage);

      await updateSessionLastMessage(sessionId, content.substring(0, 50));

      const backend = getBackend(currentBackend);
      backend.setAccessToken(token);

      const response = await backend.sendMessage(
        sessionId,
        content,
        conversationHistory
      );

      const assistantMessage = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'assistant' as const,
        content: response,
        createdAt: Date.now(),
      };

      await window.electronAPI.db.createMessage(assistantMessage);
      addMessage(assistantMessage);

      await updateSessionLastMessage(sessionId, response.substring(0, 50));
    } catch (err) {
      await window.electronAPI.db.deleteMessage(userMessage.id);

      if (err instanceof BackendException) {
        showMessage('error', `发送失败: ${err.message}`);
      } else {
        showMessage('error', `发送失败: ${(err as Error).message}`);
      }
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }, [sessionId, currentBackend, tokens, updateSessionLastMessage, addMessage, showMessage]);

  return (
    <div className="chat-page">
      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        onRetry={() => sessionId && loadMessages(sessionId)}
      />

      <div className="chat-disclaimer">
        内容由 AI 生成，请谨慎参考
      </div>

      <ChatInput onSend={handleSend} disabled={!sessionId || isSending} />
    </div>
  );
}
