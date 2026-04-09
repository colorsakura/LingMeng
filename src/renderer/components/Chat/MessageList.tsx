import { useEffect, useRef } from 'react';
import { Spin, Empty, Button } from 'antd';
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
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin tip="正在加载会话内容..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>
          <div style={{ color: '#ff4d4f', marginTop: 12 }}>{error}</div>
          {onRetry && (
            <Button type="primary" onClick={onRetry} style={{ marginTop: 12, borderRadius: 8 }}>
              重试
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty
          description={
            <div>
              <div style={{ fontSize: 15, color: '#595959', fontWeight: 500 }}>开始对话吧</div>
              <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>发送消息开始聊天</div>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div ref={listRef} className="message-list">
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
                        <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace', fontSize: 13, color: '#1677ff' }} {...props}>
                          {children}
                        </code>
                      ) : (
                        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: 12, borderRadius: 8, overflow: 'auto', margin: '8px 0' }}>
                          <code {...props}>{children}</code>
                        </pre>
                      );
                    },
                    p: ({ children }) => (
                      <p style={{ margin: '0 0 8px 0' }}>{children}</p>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} style={{ color: '#1677ff' }} target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ paddingLeft: 20, margin: '8px 0' }}>{children}</ol>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote style={{ borderLeft: '3px solid #d9d9d9', paddingLeft: 12, color: '#8c8c8c', fontStyle: 'italic', margin: '8px 0' }}>
                        {children}
                      </blockquote>
                    ),
                    h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 700, margin: '12px 0 8px' }}>{children}</h1>,
                    h2: ({ children }) => <h2 style={{ fontSize: 17, fontWeight: 700, margin: '10px 0 6px' }}>{children}</h2>,
                    h3: ({ children }) => <h3 style={{ fontSize: 15, fontWeight: 600, margin: '8px 0 4px' }}>{children}</h3>,
                    table: ({ children }) => (
                      <table style={{ borderCollapse: 'collapse', width: '100%', margin: '8px 0', fontSize: 13 }}>
                        {children}
                      </table>
                    ),
                    th: ({ children }) => (
                      <th style={{ border: '1px solid #d9d9d9', padding: '6px 10px', background: '#fafafa', fontWeight: 600 }}>{children}</th>
                    ),
                    td: ({ children }) => (
                      <td style={{ border: '1px solid #d9d9d9', padding: '6px 10px' }}>{children}</td>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            <div className="message-time" style={{ color: message.role === 'user' ? 'rgba(255,255,255,0.6)' : '#bfbfbf' }}>
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
