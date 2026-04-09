import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { TokenCard } from '../components/Settings';
import { BackendProvider } from '@shared/types';

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg-content)' }}>
      {/* Header */}
      <div className="settings-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ color: 'var(--text-primary)' }}
        />
        <span className="settings-header-title">设置</span>
      </div>

      {/* Content — scrollable */}
      <div className="settings-content" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          <div className="settings-section-title" style={{ border: 'none', marginBottom: 8, padding: 0 }}>
            API Token 配置
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            配置各 AI 后端的 API Token，每个后端可独立配置。Token 仅存储在本地。
          </p>
        </div>

        <TokenCard provider={BackendProvider.Kimi} />
        <TokenCard provider={BackendProvider.DeepSeek} />
        <TokenCard provider={BackendProvider.Doubao} />
        <TokenCard provider={BackendProvider.Qianwen} />
      </div>
    </div>
  );
}
