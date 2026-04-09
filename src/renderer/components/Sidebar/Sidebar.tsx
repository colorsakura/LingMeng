import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Button, Tooltip } from 'antd';
import { MessageOutlined, SettingOutlined, PlusOutlined, SyncOutlined, FileTextOutlined } from '@ant-design/icons';
import { useSessionStore, useSettingsStore } from '../../stores/settingsStore';
import SessionList from './SessionList';
import BackendSwitcher from './BackendSwitcher';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncing, syncFromRemote, error } = useSessionStore();
  const tokens = useSettingsStore((s) => s.tokens);

  const handleSync = async () => {
    await syncFromRemote(tokens);
  };

  const handleNewChat = () => {
    navigate('/');
  };

  // Menu key based on current route
  const selectedKey =
    location.pathname === '/settings'
      ? 'settings'
      : location.pathname === '/notes' || location.pathname.startsWith('/notes')
      ? 'notes'
      : 'chat';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">灵</div>
        <span className="sidebar-title">灵梦</span>
      </div>

      {/* New Chat + Sync Buttons */}
      <div style={{ padding: '12px 16px', display: 'flex', gap: 8 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewChat}
          className="sidebar-new-chat-btn"
          style={{ flex: 1 }}
        >
          新对话
        </Button>
        <Tooltip title="同步会话">
          <Button
            icon={<SyncOutlined spin={syncing} />}
            onClick={handleSync}
            disabled={syncing}
          />
        </Tooltip>
      </div>

      {/* Navigation Menu */}
      <div style={{ padding: '0 16px' }}>
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[selectedKey]}
          onClick={({ key }) => {
            if (key === 'chat') navigate('/');
            if (key === 'settings') navigate('/settings');
            if (key === 'notes') navigate('/notes');
          }}
          items={[
            {
              key: 'chat',
              icon: <MessageOutlined />,
              label: '会话',
            },
            {
              key: 'notes',
              icon: <FileTextOutlined />,
              label: '笔记',
            },
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: '设置',
            },
          ]}
          style={{ background: 'transparent', border: 'none' }}
        />
      </div>

      {/* Divider */}
      {error && (
        <div style={{ padding: '8px 16px' }}>
          <div style={{
            padding: '8px 12px',
            background: 'rgba(250, 38, 38, 0.15)',
            border: '1px solid rgba(250, 38, 38, 0.3)',
            borderRadius: 8,
            color: '#ff7875',
            fontSize: 12,
          }}>
            同步失败: {error}
          </div>
        </div>
      )}

      {/* Session List */}
      <div className="session-list">
        <SessionList />
      </div>

      {/* Backend Switcher */}
      <div className="backend-switcher-wrapper">
        <BackendSwitcher />
      </div>
    </div>
  );
}
