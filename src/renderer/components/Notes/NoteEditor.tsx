import { useRef, useEffect } from 'react';
import { usePlateEditor, Plate, PlateContent } from 'platejs/react';
import { Editable } from 'slate-react';
import {
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  BlockquotePlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
} from '@platejs/basic-nodes/react';
import { useNoteStore } from '../../stores/settingsStore';

interface NoteEditorProps {
  noteId: string;
  initialTitle: string;
  initialContent: string;
}

export default function NoteEditor({ noteId, initialTitle, initialContent }: NoteEditorProps) {
  const { updateNote } = useNoteStore();
  const titleRef = useRef(initialTitle);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      BlockquotePlugin,
      H1Plugin,
      H2Plugin,
      H3Plugin,
    ],
    value: initialContent ? JSON.parse(initialContent) : [{ type: 'p', children: [{ text: '' }] }],
  });

  const scheduleSave = (title: string, content: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      updateNote(noteId, title, content);
    }, 500);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    titleRef.current = e.target.value;
    scheduleSave(e.target.value, JSON.stringify(editor.children));
  };

  const handleEditorChange = () => {
    scheduleSave(titleRef.current, JSON.stringify(editor.children));
  };

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleMark = (markKey: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor.tf as any).toggleMark?.(markKey);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toggleBlock = (blockKey: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor.tf as any).toggleBlock?.(blockKey);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Title */}
      <div
        style={{
          padding: '20px 24px 0',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-content)',
        }}
      >
        <input
          type="text"
          defaultValue={initialTitle}
          placeholder="笔记标题..."
          onChange={handleTitleChange}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: 22,
            fontWeight: 700,
            background: 'transparent',
            color: 'var(--text-strong)',
            lineHeight: 1.3,
            paddingBottom: 14,
          }}
        />
      </div>

      {/* Toolbar */}
      <div className="note-editor-toolbar">
        <button className="note-editor-toolbar-btn" title="粗体" onMouseDown={(e) => { e.preventDefault(); toggleMark('bold'); }}><strong>B</strong></button>
        <button className="note-editor-toolbar-btn" title="斜体" onMouseDown={(e) => { e.preventDefault(); toggleMark('italic'); }}><em>I</em></button>
        <button className="note-editor-toolbar-btn" title="下划线" onMouseDown={(e) => { e.preventDefault(); toggleMark('underline'); }} style={{ textDecoration: 'underline' }}>U</button>
        <button className="note-editor-toolbar-btn" title="删除线" onMouseDown={(e) => { e.preventDefault(); toggleMark('strikethrough'); }} style={{ textDecoration: 'line-through' }}>S</button>
        <button className="note-editor-toolbar-btn" title="行内代码" onMouseDown={(e) => { e.preventDefault(); toggleMark('code'); }} style={{ fontFamily: 'monospace', fontSize: 12 }}>&lt;/&gt;</button>
        <div className="note-editor-toolbar-divider" />
        <button className="note-editor-toolbar-btn" title="标题1" onMouseDown={(e) => { e.preventDefault(); toggleBlock('h1'); }} style={{ fontWeight: 700, fontSize: 11 }}>H1</button>
        <button className="note-editor-toolbar-btn" title="标题2" onMouseDown={(e) => { e.preventDefault(); toggleBlock('h2'); }} style={{ fontWeight: 700, fontSize: 11 }}>H2</button>
        <button className="note-editor-toolbar-btn" title="标题3" onMouseDown={(e) => { e.preventDefault(); toggleBlock('h3'); }} style={{ fontWeight: 700, fontSize: 11 }}>H3</button>
        <div className="note-editor-toolbar-divider" />
        <button className="note-editor-toolbar-btn" title="引用" onMouseDown={(e) => { e.preventDefault(); toggleBlock('blockquote'); }} style={{ fontSize: 16 }}>&ldquo;</button>
      </div>

      {/* Editor */}
      <div className="note-editor-content">
        <div className="note-editor-inner">
          <Plate editor={editor}>
            <PlateContent
              style={{
                minHeight: '100%',
                outline: 'none',
                fontSize: 15,
                lineHeight: 1.8,
                color: 'var(--text-strong)',
              }}
            >
              <Editable
                onChange={handleEditorChange}
                placeholder="开始写作..."
                style={{
                  minHeight: '100%',
                  outline: 'none',
                  color: 'var(--text-strong)',
                }}
              />
            </PlateContent>
          </Plate>
        </div>
      </div>
    </div>
  );
}
