import { Button, List, Popconfirm, Empty } from 'antd';
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
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: '1px solid #f0f0f0',
        background: '#fafafa',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '12px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: 14, color: '#595959' }}>笔记</span>
        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleCreate}>
          新建
        </Button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {notes.length === 0 && !loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#bfbfbf' }}>
            <Empty description="暂无笔记" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          </div>
        ) : (
          <List
            loading={loading}
            dataSource={notes}
            renderItem={(note) => (
              <List.Item
                key={note.id}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: selectedId === note.id ? '#e6f4ff' : 'transparent',
                  borderBottom: '1px solid #f5f5f5',
                }}
                className="note-list-item"
                onClick={() => onSelect(note)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: selectedId === note.id ? '#1677ff' : '#262626',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {note.title || '无标题笔记'}
                  </div>
                  <div style={{ fontSize: 11, color: '#bfbfbf', marginTop: 2 }}>
                    {formatDate(note.updatedAt)}
                  </div>
                </div>
                <Popconfirm
                  title="删除笔记"
                  description="确定要删除这条笔记吗？"
                  onConfirm={(e) => handleDelete(e as unknown as React.MouseEvent, note.id)}
                  okText="删除"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                    onClick={(e) => e.stopPropagation()}
                    style={{ opacity: 0.6 }}
                  />
                </Popconfirm>
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );
}
