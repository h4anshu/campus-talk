'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Code, List, Link2, ImagePlus, Video } from 'lucide-react';
import { toast } from 'sonner';

interface RichTextEditorProps {
  onChange: (html: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  active,
  onClick,
  children,
  label,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-7 w-7 items-center justify-center rounded transition-colors ${
        active
          ? 'bg-[var(--accent-dim)] text-[var(--accent)]'
          : 'text-[var(--text-muted)] hover:bg-[var(--bg-panel)] hover:text-[var(--text-secondary)]'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  onChange,
  placeholder = 'Write your post...',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    editorProps: {
      attributes: {
        class:
          'min-h-[160px] text-[13px] leading-[1.7] text-[var(--text-primary)] outline-none [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[var(--accent)] [&_a]:underline [&_code]:rounded [&_code]:bg-[var(--bg-panel)] [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px]',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const setLink = () => {
    const url = window.prompt('Enter a URL');
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="rounded border-[0.5px] border-[var(--border-med)] bg-[var(--bg-panel)]">
      <div className="flex items-center gap-0.5 border-b-[0.5px] border-[var(--border)] px-2 py-1.5">
        <ToolbarButton
          label="Bold"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Code"
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton label="Link" active={editor.isActive('link')} onClick={setLink}>
          <Link2 className="h-3.5 w-3.5" />
        </ToolbarButton>

        <div className="mx-1 h-4 w-px bg-[var(--border)]" />

        <ToolbarButton
          label="Upload image"
          onClick={() => toast('Image upload — coming soon')}
        >
          <ImagePlus className="h-3.5 w-3.5" />
        </ToolbarButton>
        <ToolbarButton
          label="Embed YouTube video"
          onClick={() => toast('Paste a YouTube link — embedding coming soon')}
        >
          <Video className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      <div className="px-3 py-2.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
