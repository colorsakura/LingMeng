import { useNavigate } from 'react-router-dom';
import { List, Spin, Tag } from 'antd';
import { BackendProvider, BackendProviderDisplayNames, BackendProviderColors } from '@shared/types';
import { useSessionStore } from '../../stores/settingsStore';

export default function SessionList() {
  const { sessions, loading, error, currentSessionId } = useSessionStore();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#ff7875' }}>
        <div>加载失败: {error}</div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ color: '#94a3b8', fontSize: 14 }}>
          暂无对话
        </div>
        <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 4, opacity: 0.6 }}>
          点击上方「+」按钮新建对话
        </div>
      </div>
    );
  }

  return (
    <List
      dataSource={sessions}
      renderItem={(session) => {
        const isSelected = currentSessionId === session.id;
        const color = BackendProviderColors[session.backend];

        return (
          <List.Item
            style={{
              padding: '8px 4px',
              marginBottom: 2,
              borderRadius: 8,
              background: isSelected ? 'rgba(22, 119, 255, 0.15)' : 'transparent',
              cursor: 'pointer',
              position: 'relative',
              border: 'none',
            }}
            onClick={() => navigate(session.id === currentSessionId ? '/' : `/chat/${session.id}`)}
          >
            {isSelected && (
              <div className="session-item-indicator" />
            )}

            {/* Icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.08)',
                marginRight: 10,
                fontSize: 16,
                color,
                flexShrink: 0,
              }}
            >
              {session.backend === BackendProvider.Kimi && 'K'}
              {session.backend === BackendProvider.DeepSeek && 'DS'}
              {session.backend === BackendProvider.Doubao && 'D'}
              {session.backend === BackendProvider.Qianwen && 'Q'}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="session-item-title">{session.name}</div>
              {session.lastMessage && (
                <div className="session-item-preview">{session.lastMessage}</div>
              )}
            </div>

            {/* Badge */}
            <Tag
              style={{
                background: `${color}20`,
                color,
                border: 'none',
                fontSize: 10,
                fontWeight: 600,
                flexShrink: 0,
                marginLeft: 8,
              }}
            >
              {BackendProviderDisplayNames[session.backend]}
            </Tag>
          </List.Item>
        );
      }}
    />
  );
}
