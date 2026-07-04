'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import { useCreatePost } from '@/hooks/useCreatePost';
import { TOPICS, type TopicKey } from '@/lib/constants';
import { fetchJson } from '@/lib/api-client';
import type { DetectedEmbed } from '@/lib/embed';

interface PendingMedia {
  type: 'image' | 'youtube' | 'drive';
  url: string;
  providerId?: string;
  thumbnailUrl?: string;
}

const DESTINATIONS = [
  { key: 'discussion', label: 'Discussion' },
  { key: 'resources', label: 'Resources' },
  { key: 'lost-found', label: 'Lost & Found' },
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'confession', label: 'Confession' },
] as const;

type DraftState = 'idle' | 'saving' | 'saved';

export default function CreatePostDialog() {
  const router = useRouter();
  const { open, closeDialog } = useCreatePostStore();
  const { mutate: createPost, isPending } = useCreatePost();
  const [destination, setDestination] = useState<(typeof DESTINATIONS)[number]['key']>('discussion');
  const [topic, setTopic] = useState<TopicKey | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [draftState, setDraftState] = useState<DraftState>('idle');
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markDirty = () => {
    setDraftState('saving');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDraftState('saved'), 700);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const reset = () => {
    setDestination('discussion');
    setTopic(null);
    setTitle('');
    setBody('');
    setDraftState('idle');
    setPendingMedia([]);
  };

  const canPost = title.trim().length >= 5 && (destination !== 'discussion' || !!topic) && !isPending;

  const handlePost = () => {
    if (!canPost) return;

    const payload =
      destination === 'discussion'
        ? { title, body, type: 'DISCUSSION' as const, topic: topic!, tags: [], anonymous: false }
        : {
            title,
            body,
            type: 'SPACE' as const,
            space: destination,
            tags: [],
            anonymous: destination === 'confession',
          };

    createPost(payload, {
      onSuccess: async (post) => {
        // Images and embed cards are already visible in `post.body` (inserted
        // into the editor at upload/paste time), so this is recording each
        // one as a proper Media row too — needed for ResourceCard/PostCard's
        // thumbnail rendering, which reads `post.media`, not the body HTML.
        // Previously these failures were silently swallowed (`.catch(() =>
        // {})`), which is exactly how a post could end up with an embed
        // visible in its body but no Media row at all — surfaced now instead.
        const results = await Promise.allSettled(
          pendingMedia.map((media) =>
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
          console.error('Failed to save media for post', post.id, failures);
          toast.error(`Post created, but ${failures.length} attachment(s) failed to save`);
        }

        closeDialog();
        reset();
        toast(post.status === 'PENDING' ? 'Post submitted for admin approval' : 'Post created');
        router.push(`/post/${post.id}`);
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to create post');
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) closeDialog();
      }}
    >
      <DialogContent
        showCloseButton
        className="flex max-h-[85vh] w-full max-w-[640px] flex-col gap-0 overflow-hidden border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] p-0"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18 }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <DialogTitle className="shrink-0 border-b-[0.5px] border-[var(--border)] px-5 py-4 text-[16px] font-medium text-[var(--text-primary)]">
            Create a post
          </DialogTitle>

          {/* This is the ONLY part that scrolls — DialogContent is capped at
              85vh above, so no matter how tall the embed/description gets,
              the dialog itself never grows past the viewport. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <div className="flex flex-wrap gap-1.5">
              {DESTINATIONS.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setDestination(d.key)}
                  className={`rounded-full border-[0.5px] px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    destination === d.key
                      ? 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            {destination === 'discussion' && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {TOPICS.map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTopic(t.key)}
                    className={`rounded-full border-[0.5px] px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      topic === t.key
                        ? 'border-[var(--accent-border)] bg-[var(--accent-dim)] text-[var(--accent)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-med)] hover:text-[var(--text-secondary)]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                markDirty();
              }}
              placeholder="Give your post a clear title..."
              className="mt-4 w-full border-b-[0.5px] border-[var(--border)] bg-transparent pb-2.5 text-[15px] font-medium text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />

            <div className="mt-3">
              <RichTextEditor
                onChange={(html) => {
                  setBody(html);
                  markDirty();
                }}
                onImageUploaded={(url, publicId) =>
                  setPendingMedia((prev) => [...prev, { type: 'image', url, providerId: publicId }])
                }
                onEmbedDetected={(embed: DetectedEmbed) =>
                  setPendingMedia((prev) => [
                    ...prev,
                    { type: embed.type, url: embed.url, providerId: embed.providerId, thumbnailUrl: embed.thumbnailUrl },
                  ])
                }
                placeholder={`Write your ${DESTINATIONS.find((d) => d.key === destination)?.label.toLowerCase()} post...`}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between border-t-[0.5px] border-[var(--border)] px-5 py-3">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              {draftState === 'saving' && (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving draft...
                </>
              )}
              {draftState === 'saved' && (
                <>
                  <Check className="h-3 w-3 text-[var(--success)]" />
                  Draft saved
                </>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  closeDialog();
                  reset();
                }}
                className="rounded px-3.5 py-2 text-[12px] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={handlePost}
                disabled={!canPost}
                className="flex items-center gap-1.5 rounded bg-[var(--accent-fill)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Post
              </button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
