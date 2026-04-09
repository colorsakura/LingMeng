import { NoteEditor } from '../components/Notes';
import { useNoteStore } from '../stores/settingsStore';

export default function NotesPage() {
  const { notes, currentNoteId } = useNoteStore();

  const currentNote = notes.find((n) => n.id === currentNoteId) ?? null;

  return (
    <div className="notes-page">
      <div className="note-editor">
        {currentNote ? (
          <NoteEditor
            key={currentNote.id}
            noteId={currentNote.id}
            initialTitle={currentNote.title}
            initialContent={currentNote.content}
          />
        ) : (
          <div className="chat-empty-state">
            <h3>选择或新建笔记</h3>
            <p>在左侧搜索框输入标题，按 Enter 创建笔记</p>
          </div>
        )}
      </div>
    </div>
  );
}
