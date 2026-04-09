import { useState } from 'react';
import { Input, Button, message } from 'antd';
import { BackendProvider, BackendProviderDisplayNames, BackendProviderColors } from '@shared/types';
import { useSettingsStore } from '../../stores/settingsStore';

interface TokenCardProps {
  provider: BackendProvider;
}

export default function TokenCard({ provider }: TokenCardProps) {
  const [token, setToken] = useState('');
  const [saving, setSaving] = useState(false);
  const { tokens, setToken: saveToken } = useSettingsStore();

  const currentToken = tokens[provider];
  const hasToken = !!currentToken;
  const color = BackendProviderColors[provider];

  const handleSave = async () => {
    if (!token.trim()) return;
    setSaving(true);
    try {
      await saveToken(provider, token.trim());
      setToken('');
      message.success('Token 保存成功');
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const getInstructions = () => {
    switch (provider) {
      case BackendProvider.Kimi:
        return '在 Kimi 网页中打开开发者工具 (F12)，找到 Application > Local Storage，复制 Authorization 值';
      case BackendProvider.DeepSeek:
        return '前往 DeepSeek 开放平台获取 API Key: https://platform.deepseek.com/api_keys';
      case BackendProvider.Doubao:
        return '在火山引擎控制台获取 Doubao API Key';
      case BackendProvider.Qianwen:
        return '在阿里云百炼平台获取通义千问 API Key: https://bailian.console.aliyun.com';
    }
  };

  const initials: Record<BackendProvider, string> = {
    [BackendProvider.Kimi]: 'K',
    [BackendProvider.DeepSeek]: 'DS',
    [BackendProvider.Doubao]: 'D',
    [BackendProvider.Qianwen]: 'Q',
  };

  return (
    <div className="token-card">
      <div className="token-card-header">
        <div className="token-card-info">
          <div
            className="token-card-avatar"
            style={{ background: color }}
          >
            {initials[provider]}
          </div>
          <div>
            <div className="token-card-name">{BackendProviderDisplayNames[provider]}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              {hasToken ? '已配置' : '未配置'}
            </div>
          </div>
        </div>
        <span
          style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: 4,
            background: hasToken ? 'rgba(82,196,26,0.15)' : 'rgba(250,173,20,0.15)',
            color: hasToken ? '#52c41a' : '#faad14',
            fontWeight: 600,
          }}
        >
          {hasToken ? '已配置' : '未配置'}
        </span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Input.Password
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={hasToken ? '已保存，输入新token覆盖' : '输入 API Token'}
        />
      </div>

      <Button
        type="primary"
        onClick={handleSave}
        disabled={!token.trim()}
        loading={saving}
        block
        style={{ borderRadius: 6 }}
      >
        保存 Token
      </Button>

      <div className="token-card-instructions">{getInstructions()}</div>
    </div>
  );
}
