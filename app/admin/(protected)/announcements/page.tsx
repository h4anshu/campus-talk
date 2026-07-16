'use client';

import { useState } from 'react';
import { Pin, Megaphone, Loader2, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useCreateAdminPost } from '@/hooks/useAdminPosts';
import { fetchJson } from '@/lib/api-client';
import { extractEmbedsFromHtml } from '@/lib/embed';

interface PendingMedia {
  type: 'image' | 'youtube' | 'drive';
  url: string;
  providerId?: string;
  thumbnailUrl?: string;
}

const PRIORITIES = ['Critical', 'Info', 'General'] as const;
type Priority = (typeof PRIORITIES)[number];

const PRIORITY_STYLES: Record<Priority, string> = {
  Critical: 'border-[var(--danger-border)] bg-[var(--danger-dim)] text-[var(--danger)]',
  Info: 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]',
  General: 'border-[var(--border)] bg-[var(--bg-panel)] text-[var(--text-muted)]',
};

type SpaceTab = 'announcements' | 'events';

export default function ComposeAnnouncementPage() {
  const { mutate: createPost, isPending } = useCreateAdminPost();
  const [space, setSpace] = useState<SpaceTab>('announcements');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState<Priority>('Info');
  const [pinned, setPinned] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  const canPublish = title.trim().length >= 5 && !isPending;

  const publish = () => {
    if (!canPublish) return;

    createPost(
      {
        title,
        body,
        space,
        priority,
        pinned,
        tags: [],
        ...(space === 'events' && {
          eventDate: eventDate ? new Date(eventDate).toISOString() : null,
          eventLocation: eventLocation || null,
        }),
      },
      {
        onSuccess: async (post) => {
          const bodyEmbeds = extractEmbedsFromHtml(body);
          const mediaToSave: PendingMedia[] = [
            ...pendingMedia.filter((m) => m.type === 'image'),
            ...bodyEmbeds.map((embed) => ({
              type: embed.type,
              url: embed.url,
              providerId: embed.providerId,
              thumbnailUrl: embed.thumbnailUrl,
            })),
          ];

          const results = await Promise.allSettled(
            mediaToSave.map((media) =>
              fetchJson('/api/media', {
                method: 'POST',
                body: JSON.stringify({
                  postId: post.id,
                  url: media.url,
                  providerId: media.providerId,
                  thumbnailUrl: media.thumbnailUrl,
                  type: media.type,
                }),
              })
            )
          );
          const failures = results.filter((r) => r.status === 'rejected');
          if (failures.length > 0) {
            console.error('Failed to save media for announcement', post.id, failures);
            toast.error(`Published, but ${failures.length} attachment(s) failed to save`);
          }

          setTitle('');
          setBody('');
          setPriority('Info');
          setPinned(false);
          setPendingMedia([]);
          setEventDate('');
          setEventLocation('');
          toast(`${space === 'events' ? 'Event' : 'Announcement'} published — visible now at /spaces/${space}`);
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to publish announcement');
        },
      }
    );
  };

  return (
    <div className="mx-auto max-w-[640px]">
      <h1 className="flex items-center gap-2 text-[18px] font-medium text-[var(--text-primary)]">
        <Megaphone className="h-5 w-5 text-[var(--accent)]" />
        Compose post
      </h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        Published directly — no approval needed.
      </p>

      <div className="mt-4 flex items-center gap-1 rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-1 w-fit">
        {(['announcements', 'events'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSpace(s)}
            className={`rounded-[6px] px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${
              space === s
                ? 'bg-[var(--accent-fill)] text-white'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`rounded-full border-[0.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                priority === p ? PRIORITY_STYLES[p] : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => setPinned((p) => !p)}
          className={`flex items-center gap-1.5 rounded-full border-[0.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
            pinned
              ? 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)]'
          }`}
        >
          <Pin className="h-3.5 w-3.5" fill={pinned ? 'var(--accent)' : 'none'} />
          {pinned ? 'Pinned to top' : 'Pin to top'}
        </button>
      </div>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Announcement title..."
        className="mt-4 w-full border-b-[0.5px] border-[var(--border)] bg-transparent pb-2.5 text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
      />

      <div className="mt-3">
        <RichTextEditor
          onChange={setBody}
          placeholder="Write the announcement..."
          onImageUploaded={(url, publicId) =>
            setPendingMedia((prev) => [...prev, { type: 'image', url, providerId: publicId }])
          }
        />
      </div>

      {space === 'events' && (
        <div className="mt-3 space-y-3 rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-muted)]">
            <CalendarDays className="h-3 w-3" />
            Event details
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Event date &amp; time *</label>
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-[12px] text-[var(--text-muted)]">Venue / Location</label>
            <input
              type="text"
              placeholder="e.g. Main Auditorium"
              value={eventLocation}
              onChange={(e) => setEventLocation(e.target.value)}
              className="w-full rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] placeholder:text-[var(--text-muted)]"
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={publish}
          disabled={!canPublish}
          className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Publish {space === 'events' ? 'event' : 'announcement'}
        </button>
      </div>
    </div>
  );
}
