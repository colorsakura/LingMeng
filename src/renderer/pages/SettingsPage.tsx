import { useNavigate } from 'react-router-dom';
import { Layout, Typography, Button, Alert } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { BackendProvider } from '@shared/types';
import { TokenCard } from '../components/Settings';

const { Content } = Layout;
const { Title, Paragraph } = Typography;

export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <Layout className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        />
        <Title level={4} style={{ margin: 0 }}>设置</Title>
      </div>

      {/* Content */}
      <Content className="settings-content">
        <div style={{ marginBottom: 24 }}>
          <Title level={5} style={{ marginBottom: 4 }}>API Token 配置</Title>
          <Paragraph type="secondary" style={{ fontSize: 14 }}>
            配置各 AI 后端的 API Token，每个后端可独立配置
          </Paragraph>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TokenCard provider={BackendProvider.Kimi} />
          <TokenCard provider={BackendProvider.DeepSeek} />
          <TokenCard provider={BackendProvider.Doubao} />
          <TokenCard provider={BackendProvider.Qianwen} />
        </div>

        <Alert
          type="info"
          showIcon
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
          </svg>}
          message="关于 Token 安全"
          description="您的 API Token 仅存储在本地，不会发送到任何第三方服务器。请勿将 Token 泄露给他人。"
          style={{ marginTop: 24, borderRadius: 10 }}
        />
      </Content>
    </Layout>
  );
}
