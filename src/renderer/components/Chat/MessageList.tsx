import { useEffect, useRef } from 'react';
import { Spin, Button } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage } from '@shared/types';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export default function MessageList({ messages, loading, error, onRetry }: MessageListProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="chat-empty-state">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-empty-state">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
        </svg>
        <div style={{ color: '#f87171', marginTop: 12, fontSize: 14 }}>{error}</div>
        {onRetry && (
          <Button
            onClick={onRetry}
            style={{ marginTop: 12, borderRadius: 6, borderColor: '#37373a', color: '#cdd9e5' }}
          >
            重试
          </Button>
        )}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="chat-empty-state">
        <h3>开始对话吧</h3>
        <p>发送消息开始聊天</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="message-list">
      <div className="message-list-inner">
        {messages.map((message) => (
          <div key={message.id} className={`message-wrapper ${message.role}`}>
            <div className={`message-bubble ${message.role}`}>
              {message.role === 'user' ? (
                <div className="message-content">{message.content}</div>
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !className;
                        return isInline ? (
                          <code {...props}>{children}</code>
                        ) : (
                          <pre><code {...props}>{children}</code></pre>
                        );
                      },
                      a: ({ href, children }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <div className="message-time">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
