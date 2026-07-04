'use client';

import { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Code, List, Link2, ImagePlus, Video, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchJson } from '@/lib/api-client';
import { detectEmbed } from '@/lib/embed';

interface RichTextEditorProps {
  onChange: (html: string) => void;
  placeholder?: string;
  /** Fires once the file has actually landed in Cloudinary, so the composer
   * can also record it as a Media row once the post itself exists. */
  onImageUploaded?: (url: string, publicId: string) => void;
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
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
  onImageUploaded,
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      // StarterKit ships its own Link extension by default, which collided
      // with the one configured below (Tiptap warned "Duplicate extension
      // names found: ['link']") and made autolink's attributes/rel resolve
      // unpredictably depending on which instance won the dedupe.
      StarterKit.configure({ link: false }),
      Placeholder.configure({ placeholder }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
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

  const promptForEmbed = () => {
    const url = window.prompt('Paste a YouTube or Google Drive link');
    if (!url) return;
    const embed = detectEmbed(url);
    if (!embed) {
      toast.error("That doesn't look like a YouTube or Google Drive link");
      return;
    }
    // Inserted as a structured text+mark node (never a raw HTML string), so
    // there's no way for embed.url to be interpreted as markup. No separate
    // callback needed here — the Media row gets created from the final body
    // HTML at submit time (see CreatePostDialog), same as any other link.
    editor
      .chain()
      .focus()
      .insertContent({
        type: 'text',
        text: embed.url,
        marks: [{ type: 'link', attrs: { href: embed.url, target: '_blank', rel: 'noopener noreferrer' } }],
      })
      .run();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    try {
      const sig = await fetchJson<SignatureResponse>('/api/upload/signature', { method: 'POST' });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sig.apiKey);
      formData.append('timestamp', String(sig.timestamp));
      formData.append('signature', sig.signature);
      formData.append('folder', sig.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Upload to Cloudinary failed');
      const uploaded = (await uploadRes.json()) as { secure_url: string; public_id: string };

      editor.chain().focus().setImage({ src: uploaded.secure_url }).run();
      onImageUploaded?.(uploaded.secure_url, uploaded.public_id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Image upload failed');
    } finally {
      setUploading(false);
    }
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
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
        </ToolbarButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
        <ToolbarButton label="Embed YouTube or Drive link" onClick={promptForEmbed}>
          <Video className="h-3.5 w-3.5" />
        </ToolbarButton>
      </div>

      <div className="px-3 py-2.5">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
