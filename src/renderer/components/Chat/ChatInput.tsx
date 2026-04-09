import { useState } from 'react';
import { Input, Button } from 'antd';
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
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <Input.TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
            disabled={disabled}
            autoSize={{ minRows: 1, maxRows: 5 }}
            style={{ borderRadius: 10, resize: 'none' }}
          />
        </div>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!canSend}
          style={{ borderRadius: 10, height: 40, width: 40, padding: 0 }}
        />
      </div>
    </div>
  );
}
