import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSessionStore } from '../../stores/settingsStore';
import SessionTile from './SessionTile';
import { ChatSession } from '@shared/types';

export default function SessionList() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, loading, error, deleteSession } = useSessionStore();
  const [pendingDelete, setPendingDelete] = useState<ChatSession | null>(null);

  if (loading) {
    return (
      <div className="session-list-loading">
        <div className="session-list-spinner" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="session-list-error">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
        <span>加载失败: {error}</span>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="session-list-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="session-list-empty-title">暂无对话</span>
        <span className="session-list-empty-hint">点击上方 + 按钮新建对话</span>
      </div>
    );
  }

  const handleDelete = (session: ChatSession) => {
    setPendingDelete(session);
  };

  const confirmDelete = async () => {
    if (pendingDelete) {
      await deleteSession(pendingDelete.id);
      if (sessionId === pendingDelete.id) {
        navigate('/');
      }
      setPendingDelete(null);
    }
  };

  return (
    <>
      <div className="session-list">
        {sessions.map((session) => (
          <SessionTile
            key={session.id}
            session={session}
            isSelected={sessionId === session.id}
            onTap={() => navigate(`/chat/${session.id}`)}
            onDelete={() => handleDelete(session)}
          />
        ))}
      </div>

      {/* Delete confirmation dialog */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-5 w-72 text-center">
            <h3 className="text-base font-semibold text-gray-900 mb-1">删除会话</h3>
            <p className="text-sm text-gray-500 mb-4">
              确定要删除「{pendingDelete.name}」吗？此操作不可撤销。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
