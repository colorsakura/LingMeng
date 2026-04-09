import { Button, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNoteStore } from '../../stores/settingsStore';
import { Note } from '@shared/types';

interface NoteListProps {
  onSelect: (note: Note) => void;
  selectedId: string | null;
}

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

export default function NoteList({ onSelect, selectedId }: NoteListProps) {
  const { notes, createNote, deleteNote, loading } = useNoteStore();

  const handleCreate = async () => {
    const note = await createNote('无标题笔记', '');
    onSelect(note);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNote(id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div className="notes-sidebar-header">
        <span className="notes-sidebar-title">笔记</span>
        <Button
          type="text"
          size="small"
          icon={<PlusOutlined />}
          onClick={handleCreate}
          style={{ color: 'var(--text-primary)', fontSize: 13 }}
        >
          新建
        </Button>
      </div>

      {/* List */}
      <div className="notes-sidebar-list">
        {notes.length === 0 && !loading ? (
          <div className="note-list-empty">暂无笔记</div>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`note-list-item ${selectedId === note.id ? 'selected' : ''}`}
              onClick={() => onSelect(note)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="note-list-item-title">{note.title || '无标题笔记'}</div>
                <div className="note-list-item-date">{formatDate(note.updatedAt)}</div>
              </div>
              <div className="note-list-item-delete">
                <Popconfirm
                  title="删除笔记"
                  description="确定要删除这条笔记吗？"
                  onConfirm={(e) => handleDelete(e as unknown as React.MouseEvent, note.id)}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true, size: 'small' }}
                  cancelButtonProps={{ size: 'small' }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    style={{
                      color: '#f87171',
                      fontSize: 12,
                      width: 24,
                      height: 24,
                    }}
                  />
                </Popconfirm>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
