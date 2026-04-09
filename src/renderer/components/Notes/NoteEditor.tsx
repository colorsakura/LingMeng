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
import { Button, Space, Divider } from 'antd';

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
      {/* Title input */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <input
          type="text"
          defaultValue={initialTitle}
          placeholder="笔记标题..."
          onChange={handleTitleChange}
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: 18,
            fontWeight: 600,
            background: 'transparent',
            color: '#262626',
          }}
        />
      </div>

      {/* Toolbar */}
      <div
        style={{
          padding: '4px 12px',
          borderBottom: '1px solid #f0f0f0',
          background: '#fafafa',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Space size={2}>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark('bold');
            }}
            style={{ minWidth: 32, fontWeight: 700 }}
          >
            B
          </Button>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark('italic');
            }}
            style={{ minWidth: 32, fontStyle: 'italic' }}
          >
            I
          </Button>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark('underline');
            }}
            style={{ minWidth: 32, textDecoration: 'underline' }}
          >
            U
          </Button>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark('strikethrough');
            }}
            style={{ minWidth: 32, textDecoration: 'line-through' }}
          >
            S
          </Button>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark('code');
            }}
            style={{ minWidth: 32, fontFamily: 'monospace' }}
          >
            {'</>'}
          </Button>
        </Space>

        <Divider type="vertical" style={{ margin: '0 4px' }} />

        <Space size={2}>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock('h1');
            }}
            style={{ minWidth: 32, fontWeight: 700 }}
          >
            H1
          </Button>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock('h2');
            }}
            style={{ minWidth: 32, fontWeight: 700 }}
          >
            H2
          </Button>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock('h3');
            }}
            style={{ minWidth: 32, fontWeight: 700 }}
          >
            H3
          </Button>
        </Space>

        <Divider type="vertical" style={{ margin: '0 4px' }} />

        <Space size={2}>
          <Button
            type="text"
            size="small"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleBlock('blockquote');
            }}
            style={{ minWidth: 32 }}
          >
            &ldquo;
          </Button>
        </Space>
      </div>

      {/* Editor */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        <Plate editor={editor}>
          <PlateContent
            style={{
              minHeight: '100%',
              outline: 'none',
              fontSize: 14,
              lineHeight: 1.7,
              color: '#262626',
            }}
          >
            <Editable
              onChange={handleEditorChange}
              placeholder="开始写作..."
              style={{
                minHeight: '100%',
                outline: 'none',
              }}
            />
          </PlateContent>
        </Plate>
      </div>
    </div>
  );
}
