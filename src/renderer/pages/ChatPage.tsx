import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionStore, useMessageStore, useSettingsStore } from '../stores/settingsStore';
import { MessageList } from '../components/Chat';
import { fetchRemoteMessages, extractRemoteId } from '../services';
import { BackendProviderDisplayNames, BackendProviderColors } from '@shared/types';

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { setCurrentSession, sessions } = useSessionStore();
  const { messages, loading, error, loadMessages, addMessage, clearMessages } = useMessageStore();

  const currentSession = sessions.find((s) => s.id === sessionId);

  useEffect(() => {
    if (sessionId) {
      setCurrentSession(sessionId);
      loadMessagesAndSync(sessionId);
    } else {
      clearMessages();
    }
  }, [sessionId, setCurrentSession]);

  const loadMessagesAndSync = useCallback(async (sid: string) => {
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
  }, [loadMessages, addMessage]);

  return (
    <div className="chat-page">
      <div className="chat-header">
        <span className="chat-header-title">
          {currentSession?.name || (sessionId ? '对话' : '新对话')}
        </span>
        {sessionId && currentSession && (
          <span
            style={{
              fontSize: 10,
              padding: '2px 7px',
              borderRadius: 4,
              background: `${BackendProviderColors[currentSession.backend]}20`,
              color: BackendProviderColors[currentSession.backend],
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {BackendProviderDisplayNames[currentSession.backend]}
          </span>
        )}
      </div>

      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        onRetry={() => sessionId && loadMessages(sessionId)}
      />
    </div>
  );
}
