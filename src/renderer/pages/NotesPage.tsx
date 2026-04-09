import { useEffect } from 'react';
import { Empty } from 'antd';
import { NoteList, NoteEditor } from '../components/Notes';
import { useNoteStore } from '../stores/settingsStore';
import { Note } from '@shared/types';

export default function NotesPage() {
  const { notes, currentNoteId, loadNotes, setCurrentNote } = useNoteStore();

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const currentNote = notes.find((n) => n.id === currentNoteId) ?? null;

  const handleSelect = (note: Note) => {
    setCurrentNote(note.id);
  };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
      }}
    >
      {/* Note list sidebar */}
      <div style={{ width: 280, flexShrink: 0 }}>
        <NoteList selectedId={currentNoteId} onSelect={handleSelect} />
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, overflow: 'hidden', background: '#fff' }}>
        {currentNote ? (
          <NoteEditor
            key={currentNote.id}
            noteId={currentNote.id}
            initialTitle={currentNote.title}
            initialContent={currentNote.content}
          />
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#bfbfbf',
            }}
          >
            <Empty description="选择或新建笔记" />
          </div>
        )}
      </div>
    </div>
  );
}
