import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSessionStore, useMessageStore } from '../stores/settingsStore';
import { MessageList } from '../components/Chat';

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const { setCurrentSession } = useSessionStore();
  const { messages, loading, error, loadMessages, clearMessages } = useMessageStore();

  useEffect(() => {
    if (sessionId) {
      setCurrentSession(sessionId);
      loadMessages(sessionId);
    } else {
      clearMessages();
    }
  }, [sessionId, setCurrentSession]);

  return (
    <div className="chat-page">
      <MessageList
        messages={messages}
        loading={loading}
        error={error}
        onRetry={() => sessionId && loadMessages(sessionId)}
      />
    </div>
  );
}
