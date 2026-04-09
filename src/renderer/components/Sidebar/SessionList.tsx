import { useNavigate } from 'react-router-dom';
import { BackendProviderColors } from '@shared/types';
import { useSessionStore } from '../../stores/settingsStore';

export default function SessionList() {
  const { sessions, loading, error, currentSessionId } = useSessionStore();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="session-empty">
        加载中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-empty" style={{ color: '#f87171' }}>
        加载失败: {error}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="session-empty">
        <div>暂无对话</div>
        <div style={{ marginTop: 4, opacity: 0.6 }}>点击上方「+」新建对话</div>
      </div>
    );
  }

  return (
    <div>
      {sessions.map((session) => {
        const isSelected = currentSessionId === session.id;
        const color = BackendProviderColors[session.backend];

        return (
          <div
            key={session.id}
            className={`session-item ${isSelected ? 'selected' : ''}`}
            onClick={() => {
              const target = session.id === currentSessionId ? '/' : `/chat/${session.id}`;
              navigate(target);
            }}
          >
            <div
              className="session-provider-dot"
              style={{ background: color }}
            />
            <div className="session-item-content">
              <div className="session-item-title">{session.name}</div>
              {session.lastMessage && (
                <div className="session-item-preview">{session.lastMessage}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
