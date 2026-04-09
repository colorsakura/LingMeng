import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore, useMessageStore, useSettingsStore } from '../stores/settingsStore';
import { MessageList, ChatInput } from '../components/Chat';
import { getBackend, BackendException, fetchRemoteMessages, extractRemoteId } from '../services';

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { sessions, setCurrentSession, updateSessionLastMessage } = useSessionStore();
  const { messages, loading, error, loadMessages, addMessage, clearMessages } = useMessageStore();
  const { currentBackend, tokens } = useSettingsStore();

  // Load messages when session changes
  useEffect(() => {
    if (sessionId) {
      setCurrentSession(sessionId);
      loadMessagesAndSync(sessionId);
    } else {
      clearMessages();
    }
  }, [sessionId, setCurrentSession, clearMessages]);

  // Load messages from local DB, and fetch from remote if empty
  const loadMessagesAndSync = async (sid: string) => {
    // First load from local database
    await loadMessages(sid);

    // Use getState to get current messages after load
    const currentMessages = useMessageStore.getState().messages;

    // Find the session to get backend info
    const session = sessions.find((s) => s.id === sid);
    if (!session) return;

    // If no local messages, try to fetch from remote
    if (currentMessages.length === 0) {
      const token = tokens[session.backend];
      if (!token) return;

      try {
        const remoteId = extractRemoteId(sid);
        const remoteMessages = await fetchRemoteMessages(
          session.backend,
          remoteId,
          sid,
          token
        );

        // Save remote messages to local DB and add to UI
        for (const msg of remoteMessages) {
          await window.electronAPI.db.createMessage(msg);
          addMessage(msg);
        }
      } catch (error) {
        console.error('[ChatPage] Failed to fetch remote messages:', error);
      }
    }
  };

  // Find current session
  const currentSession = sessions.find((s) => s.id === sessionId);

  const handleSend = useCallback(async (content: string) => {
    if (!sessionId) return;

    const token = tokens[currentBackend];
    if (!token) {
      alert(`请先在设置中配置 ${currentBackend} 的 API Token`);
      navigate('/settings');
      return;
    }

    try {
      // Create user message
      const userMessage = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'user' as const,
        content,
        createdAt: Date.now(),
      };

      // Save to database and add to UI
      await window.electronAPI.db.createMessage(userMessage);
      addMessage(userMessage);

      // Update session last message
      await updateSessionLastMessage(sessionId, content.substring(0, 50));

      // Send to AI backend
      const backend = getBackend(currentBackend);
      backend.setAccessToken(token);

      // Prepare conversation history for API
      const conversationHistory = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call AI API
      const response = await backend.sendMessage(
        sessionId,
        content,
        conversationHistory
      );

      // Create assistant message
      const assistantMessage = {
        id: crypto.randomUUID(),
        sessionId,
        role: 'assistant' as const,
        content: response,
        createdAt: Date.now(),
      };

      // Save to database and add to UI
      await window.electronAPI.db.createMessage(assistantMessage);
      addMessage(assistantMessage);

      // Update session last message
      await updateSessionLastMessage(sessionId, response.substring(0, 50));
    } catch (error) {
      if (error instanceof BackendException) {
        alert(`发送失败: ${error.message}`);
      } else {
        alert(`发送失败: ${(error as Error).message}`);
      }
    }
  }, [sessionId, currentBackend, tokens, messages, updateSessionLastMessage, addMessage, navigate]);

  // Session not found
  if (sessionId && !currentSession && !loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg text-gray-500 mt-4">会话不存在</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            返回主页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Chat messages */}
      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        onRetry={() => sessionId && loadMessages(sessionId)}
      />

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          内容由 AI 生成，请谨慎参考
        </p>
      </div>

      {/* Chat input */}
      <ChatInput onSend={handleSend} disabled={!sessionId} />
    </div>
  );
}
