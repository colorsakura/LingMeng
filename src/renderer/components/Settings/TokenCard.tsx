import { useState } from 'react';
import { Card, Input, Button, Tag, message } from 'antd';
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
    <Card
      className="token-card"
      styles={{ body: { padding: 20 } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: color,
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 14,
            }}
          >
            {initials[provider]}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15, color: '#262626' }}>
              {BackendProviderDisplayNames[provider]}
            </div>
          </div>
        </div>
        <Tag color={hasToken ? 'success' : 'warning'}>
          {hasToken ? '已配置' : '未配置'}
        </Tag>
      </div>

      <div style={{ marginBottom: 12 }}>
        <Input.Password
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={hasToken ? '已保存，输入新token覆盖' : '输入 API Token'}
          style={{ borderRadius: 8 }}
        />
      </div>

      <Button
        type="primary"
        onClick={handleSave}
        disabled={!token.trim()}
        loading={saving}
        block
        style={{ borderRadius: 8 }}
      >
        保存 Token
      </Button>

      <div style={{ marginTop: 12, fontSize: 12, color: '#8c8c8c', lineHeight: 1.6 }}>
        {getInstructions()}
      </div>
    </Card>
  );
}
