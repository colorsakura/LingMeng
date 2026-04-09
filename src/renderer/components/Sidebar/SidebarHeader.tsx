import { useNavigate } from 'react-router-dom';
import { useSessionStore, useSettingsStore } from '../../stores/settingsStore';

export default function SidebarHeader() {
  const navigate = useNavigate();
  const syncing = useSessionStore((s) => s.syncing);
  const error = useSessionStore((s) => s.error);
  const syncFromRemote = useSessionStore((s) => s.syncFromRemote);
  const tokens = useSettingsStore((s) => s.tokens);

  const handleSync = async () => {
    await syncFromRemote(tokens);
  };

  return (
    <div className="sidebar-header">
      {/* Logo & Title */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M12 6C8.69 6 6 8.69 6 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>
        <span className="sidebar-title">灵梦</span>
      </div>

      {/* Action Buttons */}
      <div className="sidebar-actions">
        {/* Sync Button */}
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`sidebar-action-btn ${syncing ? 'syncing' : ''}`}
          title="同步会话"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3" strokeLinecap="round" />
            <path d="M21 3V8H16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => navigate('/settings')}
          className="sidebar-action-btn"
          title="设置"
        >
          <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="sidebar-error">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>同步失败</span>
        </div>
      )}
    </div>
  );
}
