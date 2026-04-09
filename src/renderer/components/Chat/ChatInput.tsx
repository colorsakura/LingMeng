import { useState } from 'react';
import { Input } from 'antd';
import { SendOutlined } from '@ant-design/icons';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('');

  const handleSend = () => {
    if (content.trim() && !disabled) {
      onSend(content.trim());
      setContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = content.trim() && !disabled;

  return (
    <div className="chat-input-wrapper">
      <div className="chat-input-inner">
        <div style={{ flex: 1 }}>
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
            disabled={disabled}
            autoSize={{ minRows: 1, maxRows: 5 }}
            style={{
              resize: 'none',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            border: 'none',
            background: canSend ? '#6e8cba' : '#252526',
            color: canSend ? '#fff' : '#6b6b6b',
            cursor: canSend ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
            fontSize: 16,
          }}
        >
          <SendOutlined />
        </button>
      </div>
    </div>
  );
}
