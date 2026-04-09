import { useEffect, useCallback, useRef, useState } from 'react';
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

  const [toast, setToast] = useState<{ type: 'error' | 'info'; message: string } | null>(null);
  // Use ref for sending guard to avoid stale closure issues
  const sendingRef = useRef(false);
  const [isSending, setIsSending] = useState(false); // triggers re-render for disabled prop

  const showToast = useCallback((type: 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load messages when session changes
  useEffect(() => {
    if (sessionId) {
      setCurrentSession(sessionId);
      loadMessagesAndSync(sessionId);
    } else {
      clearMessages();
    }
  }, [sessionId, setCurrentSession]);

  // Load messages from local DB, and fetch from remote if empty
  const loadMessagesAndSync = async (sid: string) => {
    // First load from local database
    await loadMessages(sid);

    // Use getState to avoid stale closure for sessions and tokens
    const currentMessages = useMessageStore.getState().messages;
    const currentSessions = useSessionStore.getState().sessions;
    const currentTokens = useSettingsStore.getState().tokens;

    // Find the session to get backend info
    const session = currentSessions.find((s) => s.id === sid);
    if (!session) return;

    // If no local messages, try to fetch from remote
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

        // Save remote messages to local DB and add to UI
        for (const msg of remoteMessages) {
          await window.electronAPI.db.createMessage(msg);
          addMessage(msg);
        }
      } catch (err) {
        console.error('[ChatPage] Failed to fetch remote messages:', err);
      }
    }
  };

  // Find current session
  const currentSession = sessions.find((s) => s.id === sessionId);

  const handleSend = useCallback(async (content: string) => {
    if (!sessionId || sendingRef.current) return;

    const token = tokens[currentBackend];
    if (!token) {
      showToast('info', `请先在设置中配置 ${currentBackend} 的 API Token`);
      navigate('/settings');
      return;
    }

    sendingRef.current = true;
    setIsSending(true);

    // Get fresh messages via getState to avoid stale closure
    const conversationHistory = useMessageStore.getState().messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Create user message
    const userMessage = {
      id: crypto.randomUUID(),
      sessionId,
      role: 'user' as const,
      content,
      createdAt: Date.now(),
    };

    try {
      // Save to database and add to UI
      await window.electronAPI.db.createMessage(userMessage);
      addMessage(userMessage);

      // Update session last message
      await updateSessionLastMessage(sessionId, content.substring(0, 50));

      // Send to AI backend
      const backend = getBackend(currentBackend);
      backend.setAccessToken(token);

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
    } catch (err) {
      // Rollback: remove the user message we just created
      await window.electronAPI.db.deleteMessage(userMessage.id);

      if (err instanceof BackendException) {
        showToast('error', `发送失败: ${err.message}`);
      } else {
        showToast('error', `发送失败: ${(err as Error).message}`);
      }
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  }, [sessionId, currentBackend, tokens, updateSessionLastMessage, addMessage, navigate, showToast]);

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
    <div className="flex-1 flex flex-col overflow-hidden relative">
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
      <ChatInput onSend={handleSend} disabled={!sessionId || isSending} />

      {/* Toast notification */}
      {toast && (
        <div className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium z-10 ${
          toast.type === 'error'
            ? 'bg-red-500 text-white'
            : 'bg-blue-500 text-white'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
