import { useEffect, useRef } from 'react';
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

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-500 mt-2">正在加载会话内容...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-500 mt-2">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              重试
            </button>
          )}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-base font-medium text-gray-600 mt-4">开始对话吧</p>
          <p className="text-sm text-gray-400 mt-1">发送消息开始聊天</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.map((message) => (
        <div key={message.id}>
          <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
              message.role === 'user'
                ? 'bg-primary-500 text-white'
                : 'bg-white border border-gray-200 text-gray-800'
            }`}>
              {message.role === 'user' ? (
                // User messages: plain text
                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </p>
              ) : (
                // AI messages: render markdown
                <div className="markdown-content text-sm leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      // Style code blocks
                      code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        const isInline = !match && !className;
                        return isInline ? (
                          <code className="px-1 py-0.5 bg-gray-100 rounded text-primary-600 text-xs" {...props}>
                            {children}
                          </code>
                        ) : (
                          <code className="block p-3 bg-gray-900 text-gray-100 rounded-lg text-xs overflow-x-auto" {...props}>
                            {children}
                          </code>
                        );
                      },
                      // Style paragraphs
                      p: ({ children }) => (
                        <p className="mb-2 last:mb-0 whitespace-pre-wrap break-words">{children}</p>
                      ),
                      // Style links
                      a: ({ href, children }) => (
                        <a href={href} className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                      // Style lists
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside mb-2">{children}</ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside mb-2">{children}</ol>
                      ),
                      // Style blockquotes
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-gray-300 pl-3 italic text-gray-600 mb-2">
                          {children}
                        </blockquote>
                      ),
                      // Style headings
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                      // Style table
                      table: ({ children }) => (
                        <table className="border-collapse border border-gray-300 mb-2 text-xs">
                          {children}
                        </table>
                      ),
                      th: ({ children }) => (
                        <th className="border border-gray-300 bg-gray-100 px-2 py-1">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="border border-gray-300 px-2 py-1">{children}</td>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              )}
              <p className={`text-[10px] mt-1 ${
                message.role === 'user' ? 'text-primary-200' : 'text-gray-400'
              }`}>
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
