'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RichTextEditor from '@/components/editor/RichTextEditor';
import { useQueryClient } from '@tanstack/react-query';
import { useCreatePostStore } from '@/store/useCreatePostStore';
import { useCreatePost } from '@/hooks/useCreatePost';
import { TOPICS, SECTION_META, type TopicKey } from '@/lib/constants';
import { SECTION_ICONS } from '@/components/shared/SectionBanner';
import { fetchJson } from '@/lib/api-client';
import { extractEmbedsFromHtml } from '@/lib/embed';

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
  const queryClient = useQueryClient();
  const { open, context, closeDialog, clearContext } = useCreatePostStore();
  const { mutateAsync: createPostAsync, isPending } = useCreatePost();
  const [destination, setDestination] = useState<(typeof DESTINATIONS)[number]['key']>('discussion');
  const [topic, setTopic] = useState<TopicKey | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [draftState, setDraftState] = useState<DraftState>('idle');
  const [pendingMedia, setPendingMedia] = useState<PendingMedia[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Collaboration state
  const [collabProjectType, setCollabProjectType] = useState<string>('');
  const [collabTotalSlots, setCollabTotalSlots] = useState<string>('');
  const [collabSkills, setCollabSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [collabDeadline, setCollabDeadline] = useState<string>('');
  const [collabContactType, setCollabContactType] = useState<string>('WhatsApp');
  const [collabContactValue, setCollabContactValue] = useState<string>('');

  const hasContext = context.type !== null;

  // The Discussions "Events" topic shares its route param (`events`) with
  // the Spaces "Events" space, so SECTION_META keys the discussion one
  // separately as `events-discussion` — mirrors the same remap done in
  // discussions/[topic]/page.tsx when picking its own SectionBanner.
  const styleSlug = context.type === 'discussion' && context.slug === 'events' ? 'events-discussion' : context.slug;
  const sectionMeta = styleSlug ? SECTION_META[styleSlug] : undefined;
  const SectionIcon = sectionMeta ? SECTION_ICONS[sectionMeta.icon] : undefined;

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
    setCollabProjectType('');
    setCollabTotalSlots('');
    setCollabSkills([]);
    setSkillInput('');
    setCollabDeadline('');
    setCollabContactType('WhatsApp');
    setCollabContactValue('');
    clearContext();
  };

  const canPost =
    title.trim().length >= 5 && !isPending && (hasContext || destination !== 'discussion' || !!topic);

  const submitLabel = !hasContext
    ? 'Post'
    : context.requiresApproval && context.isAnonymous
      ? 'Submit anonymously'
      : context.requiresApproval
        ? 'Submit for review'
        : 'Post';

  const handlePost = async () => {
    if (!canPost) return;

    const resolvedSpace = hasContext ? context.slug : destination;
    const isCollaboration = resolvedSpace === 'collaboration';

    if (isCollaboration && !collabTotalSlots) {
      toast.error('Please select how many teammates you need.');
      return;
    }

    const payload = hasContext
      ? context.type === 'discussion'
        ? { title, body, type: 'DISCUSSION' as const, topic: context.slug!, tags: [], anonymous: false }
        : { title, body, type: 'SPACE' as const, space: context.slug!, tags: [], anonymous: context.isAnonymous }
      : destination === 'discussion'
        ? { title, body, type: 'DISCUSSION' as const, topic: topic!, tags: [], anonymous: false }
        : {
            title,
            body,
            type: 'SPACE' as const,
            space: destination,
            tags: [],
            anonymous: destination === 'confession',
          };

    if (isCollaboration) {
      Object.assign(payload, {
        collabTotalSlots: parseInt(collabTotalSlots, 10),
        collabSkills,
        collabProjectType: collabProjectType || null,
        collabDeadline: collabDeadline ? new Date(collabDeadline).toISOString() : null,
        collabContact: collabContactValue ? `${collabContactType}: ${collabContactValue}` : null,
      });
    }

    let post;
    try {
      post = await createPostAsync(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create post');
      return;
    }

    // ── Save media rows ──────────────────────────────────────────────
    // Images are recorded via pendingMedia as they're uploaded (their
    // Cloudinary public_id isn't recoverable from the <img src> alone).
    // YouTube/Drive embeds are derived from the final submitted body
    // HTML — Tiptap's Link extension autolinks a URL the moment it's
    // typed, not just pasted, so scanning the body catches it
    // regardless of how the link got there.
    //
    // IMPORTANT: We use mutateAsync (not mutate) here because React
    // Query's mutate() does NOT await async onSuccess callbacks — it
    // calls the callback, receives the Promise, and drops it.  That
    // meant the POST /api/media calls could be silently interrupted
    // before completing, leaving zero Media rows for the post.
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
      console.error('Failed to save media for post', post.id, failures);
      toast.error(`Post created, but ${failures.length} attachment(s) failed to save`);
    }

    // Invalidate AFTER media rows exist in the DB.
    queryClient.invalidateQueries({ queryKey: ['posts'] });
    queryClient.invalidateQueries({ queryKey: ['post', post.id] });

    closeDialog();
    reset();
    toast(post.status === 'PENDING' ? 'Post submitted for admin approval' : 'Post created');
    router.push(`/post/${post.id}`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          closeDialog();
          clearContext();
        }
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

          {hasContext && sectionMeta && (
            <div
              className="mx-5 mt-4 flex shrink-0 items-center gap-2 rounded-[8px] border px-3 py-[9px] text-[12px]"
              style={{ background: `${sectionMeta.color}12`, borderColor: sectionMeta.borderColor }}
            >
              {SectionIcon && (
                <SectionIcon
                  className="h-[15px] w-[15px] shrink-0"
                  style={{ color: sectionMeta.color }}
                  aria-hidden="true"
                />
              )}
              <span style={{ color: 'var(--text-secondary)' }}>
                Posting in <span style={{ color: sectionMeta.color, fontWeight: 500 }}>{context.label}</span>
                {context.isAnonymous
                  ? ' — your identity will be completely hidden.'
                  : context.requiresApproval
                    ? ' — your post will appear here after admin approval.'
                    : ' — your post will be visible to everyone instantly.'}
              </span>
            </div>
          )}

          {/* This is the ONLY part that scrolls — DialogContent is capped at
              85vh above, so no matter how tall the embed/description gets,
              the dialog itself never grows past the viewport. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {!hasContext && (
              <>
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
              </>
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

            {(hasContext ? context.slug : destination) === 'collaboration' && (
              <div className="mt-4 flex flex-col gap-4 border-b-[0.5px] border-[var(--border)] pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[var(--text-secondary)]">Project type</label>
                    <Select value={collabProjectType} onValueChange={setCollabProjectType}>
                      <SelectTrigger className="h-[34px] w-full border-[var(--border)] bg-[var(--bg-panel)] text-[12px] text-[var(--text-primary)]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Hackathon', 'Research paper', 'College project', 'Startup idea', 'Open source'].map((type) => (
                          <SelectItem key={type} value={type} className="text-[12px]">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[var(--text-secondary)]">Team slots needed</label>
                    <Select value={collabTotalSlots} onValueChange={setCollabTotalSlots}>
                      <SelectTrigger className="h-[34px] w-full border-[var(--border)] bg-[var(--bg-panel)] text-[12px] text-[var(--text-primary)]">
                        <SelectValue placeholder="How many people?" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <SelectItem key={num} value={num.toString()} className="text-[12px]">{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 flex items-center justify-between text-[11px] font-medium text-[var(--text-secondary)]">
                    <span>Skills you're looking for</span>
                    <span className="text-[var(--text-muted)]">{collabSkills.length}/8</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = skillInput.trim();
                          if (val && val.length <= 20 && collabSkills.length < 8 && !collabSkills.includes(val)) {
                            setCollabSkills([...collabSkills, val]);
                            setSkillInput('');
                          }
                        }
                      }}
                      placeholder="e.g. React, UI/UX"
                      className="h-[34px] flex-1 rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2.5 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = skillInput.trim();
                        if (val && val.length <= 20 && collabSkills.length < 8 && !collabSkills.includes(val)) {
                          setCollabSkills([...collabSkills, val]);
                          setSkillInput('');
                        }
                      }}
                      disabled={!skillInput.trim() || collabSkills.length >= 8}
                      className="h-[34px] rounded-[8px] bg-[var(--accent-fill)] px-3 text-[11px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  {collabSkills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {collabSkills.map((skill) => (
                        <div key={skill} className="flex items-center gap-1 rounded-full border border-[var(--accent-border)] bg-[var(--accent-dim)] px-2 py-0.5 text-[11px] text-[var(--accent)]">
                          {skill}
                          <button
                            type="button"
                            onClick={() => setCollabSkills(collabSkills.filter((s) => s !== skill))}
                            className="text-[var(--accent)] hover:text-red-500"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[var(--text-secondary)]">Join deadline</label>
                    <input
                      type="date"
                      value={collabDeadline}
                      onChange={(e) => setCollabDeadline(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-[34px] w-full rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2.5 text-[13px] text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[11px] font-medium text-[var(--text-secondary)]">Contact</label>
                    <div className="flex gap-1">
                      <div className="w-[110px]">
                        <Select value={collabContactType} onValueChange={setCollabContactType}>
                          <SelectTrigger className="h-[34px] border-[var(--border)] bg-[var(--bg-panel)] text-[12px] text-[var(--text-primary)]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {['WhatsApp', 'Instagram', 'College email'].map((c) => (
                              <SelectItem key={c} value={c} className="text-[12px]">{c}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <input
                        type="text"
                        value={collabContactValue}
                        onChange={(e) => setCollabContactValue(e.target.value)}
                        placeholder="ID / Number"
                        className="h-[34px] flex-1 rounded-[8px] border-[0.5px] border-[var(--border)] bg-[var(--bg-panel)] px-2.5 text-[12px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-3">
              <RichTextEditor
                onChange={(html) => {
                  setBody(html);
                  markDirty();
                }}
                onImageUploaded={(url, publicId) =>
                  setPendingMedia((prev) => [...prev, { type: 'image', url, providerId: publicId }])
                }
                placeholder={`Write your ${(hasContext ? context.label : DESTINATIONS.find((d) => d.key === destination)?.label)?.toLowerCase()} post...`}
              />
            </div>

            {hasContext && context.requiresApproval && (
              <div
                className="mt-3 flex items-center gap-2 rounded-[8px] border px-3 py-[9px] text-[12px]"
                style={{ background: 'rgba(217,119,6,0.07)', borderColor: 'rgba(217,119,6,0.2)' }}
              >
                <Clock className="h-[15px] w-[15px] shrink-0" style={{ color: '#D97706' }} aria-hidden="true" />
                <span style={{ color: 'var(--text-secondary)' }}>
                  {context.isAnonymous ? (
                    <>
                      Confessions need <span style={{ color: '#D97706', fontWeight: 500 }}>admin approval</span>{' '}
                      before going live. Your identity stays hidden throughout.
                    </>
                  ) : (
                    <>
                      This post needs <span style={{ color: '#D97706', fontWeight: 500 }}>admin approval</span>{' '}
                      before it&apos;s visible to others. You&apos;ll be notified once reviewed.
                    </>
                  )}
                </span>
              </div>
            )}
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
                {submitLabel}
              </button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
