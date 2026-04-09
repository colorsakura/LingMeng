import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SyncOutlined, SettingOutlined } from '@ant-design/icons';
import { Popconfirm } from 'antd';
import { BackendProviderColors } from '@shared/types';
import { useSessionStore, useSettingsStore, useNoteStore } from '../../stores/settingsStore';
import BackendSwitcher from './BackendSwitcher';
import { Note } from '@shared/types';

type ActiveTab = 'chat' | 'notes';

function formatRelativeTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)} 分钟前`;
  if (diff < 2 * hour) return '1 小时前';
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 2 * day) return '昨天';
  return `${Math.floor(diff / day)} 天前`;
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { syncing, syncFromRemote, error } = useSessionStore();
  const tokens = useSettingsStore((s) => s.tokens);
  const [searchValue, setSearchValue] = useState('');
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    location.pathname.startsWith('/notes') ? 'notes' : 'chat'
  );

  const handleSync = async () => {
    await syncFromRemote(tokens);
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'chat') navigate('/');
    else navigate('/notes');
  };

  return (
    <div className="app-sider">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-left">
          <div className="sidebar-logo-icon">灵</div>
          <span className="sidebar-title">灵梦</span>
        </div>
      </div>

      {/* Search */}
      <div className="sidebar-search">
        <input
          className="sidebar-search-input"
          type="text"
          placeholder="搜索或创建..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchValue.trim() && activeTab === 'notes') {
              useNoteStore.getState().createNote(searchValue.trim(), '');
              setSearchValue('');
            }
          }}
        />
      </div>

      {/* Nav tabs */}
      <div className="sidebar-nav-tabs">
        <button
          className={`sidebar-nav-tab ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => handleTabChange('chat')}
        >
          会话
        </button>
        <button
          className={`sidebar-nav-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => handleTabChange('notes')}
        >
          笔记
        </button>
      </div>

      {/* Backend switcher (compact) */}
      <div className="sidebar-backend">
        <BackendSwitcher />
      </div>

      {/* Scrollable content */}
      <div className="sidebar-scroll">
        {error && <div className="sidebar-error">{error}</div>}

        {activeTab === 'chat' ? (
          <ChatSidebarContent />
        ) : (
          <NotesSidebarContent search={searchValue} />
        )}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-footer-btn" title="同步" onClick={handleSync}>
          <SyncOutlined spin={syncing} />
        </button>
        <button className="sidebar-footer-btn" title="设置" onClick={() => navigate('/settings')}>
          <SettingOutlined />
        </button>
      </div>
    </div>
  );
}

// ============ Chat Sidebar Content ============

function ChatSidebarContent() {
  const { sessions, currentSessionId } = useSessionStore();
  const navigate = useNavigate();

  if (sessions.length === 0) {
    return (
      <div className="sidebar-empty">
        <div>暂无对话</div>
        <div style={{ marginTop: 4, opacity: 0.6 }}>在会话列表开始对话</div>
      </div>
    );
  }

  return (
    <>
      <div className="sidebar-section-label">最近</div>
      <div className="sidebar-list">
        {sessions.map((session) => {
          const isSelected = currentSessionId === session.id;
          const color = BackendProviderColors[session.backend];

          return (
            <div
              key={session.id}
              className={`sidebar-item ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                const target = session.id === currentSessionId ? '/' : `/chat/${session.id}`;
                navigate(target);
              }}
            >
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div className="sidebar-item-content">
                <div className="sidebar-item-title">{session.name}</div>
                <div className="sidebar-item-subtitle">
                  {session.lastMessage || formatRelativeTime(session.updatedAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ============ Notes Sidebar Content ============

function NotesSidebarContent({ search }: { search: string }) {
  const { notes, currentNoteId, createNote, deleteNote } = useNoteStore();
  const setCurrentNote = useNoteStore((s) => s.setCurrentNote);
  const navigate = useNavigate();

  const handleCreateNote = async () => {
    const title = search.trim() || '无标题笔记';
    const note = await createNote(title, '');
    setCurrentNote(note.id);
    navigate('/notes');
  };

  const handleSelect = (noteId: string) => {
    setCurrentNote(noteId);
    navigate('/notes');
  };

  if (notes.length === 0) {
    return (
      <div className="sidebar-empty">
        <div>暂无笔记</div>
        <div style={{ marginTop: 4, opacity: 0.6 }}>
          {search.trim() ? `按 Enter 创建「${search}」` : '在搜索框输入标题创建笔记'}
        </div>
        {search.trim() && (
          <button
            onClick={handleCreateNote}
            style={{
              marginTop: 10,
              padding: '5px 14px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 5,
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            创建笔记
          </button>
        )}
      </div>
    );
  }

  // Group: recent (today) vs older
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const recent = notes.filter((n) => n.updatedAt >= todayStart);
  const older = notes.filter((n) => n.updatedAt < todayStart);

  return (
    <>
      {recent.length > 0 && (
        <>
          <div className="sidebar-section-label">最近</div>
          <div className="sidebar-list">
            {recent.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={currentNoteId === note.id}
                onSelect={handleSelect}
                onDelete={deleteNote}
              />
            ))}
          </div>
        </>
      )}

      {older.length > 0 && (
        <>
          <div className="sidebar-section-label">更早</div>
          <div className="sidebar-list">
            {older.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={currentNoteId === note.id}
                onSelect={handleSelect}
                onDelete={deleteNote}
              />
            ))}
          </div>
        </>
      )}

      {search.trim() && (
        <div style={{ padding: '8px 14px' }}>
          <button
            onClick={handleCreateNote}
            style={{
              width: '100%',
              padding: '7px 10px',
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              borderRadius: 5,
              color: 'var(--text-primary)',
              fontSize: 12,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>+</span>
            创建「{search}」
          </button>
        </div>
      )}
    </>
  );
}

function NoteItem({
  note,
  isSelected,
  onSelect,
  onDelete,
}: {
  note: Note;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
}) {
  return (
    <div
      className={`sidebar-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(note.id)}
    >
      <div className="sidebar-item-icon">📄</div>
      <div className="sidebar-item-content">
        <div className="sidebar-item-title">{note.title || '无标题笔记'}</div>
        <div className="sidebar-item-subtitle">{formatRelativeTime(note.updatedAt)}</div>
      </div>
      <Popconfirm
        title="删除笔记"
        description="确定要删除吗？"
        onConfirm={(e) => {
          e?.stopPropagation();
          onDelete(note.id);
        }}
        okText="删除"
        cancelText="取消"
        placement="right"
      >
        <button
          onClick={(e) => e.stopPropagation()}
          className="note-del-btn"
          style={{
            width: 20,
            height: 20,
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            opacity: 0,
            transition: 'opacity 0.15s',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </Popconfirm>
    </div>
  );
}
