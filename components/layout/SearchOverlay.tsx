'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, FileText, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { TOPICS } from '@/lib/constants';
import { MOCK_POSTS, MOCK_USER } from '@/lib/mock';
import { ICON_MAP } from '@/lib/icon-map';
import { slugify } from '@/lib/utils';

interface SearchOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchOverlay({ open, onOpenChange }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const { posts, people, topics } = useMemo(() => {
    const q = query.trim().toLowerCase();

    const matchedPosts = MOCK_POSTS.filter((p) => p.status === 'APPROVED')
      .filter((p) => !q || p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
      .slice(0, 5);

    const authorNames = new Map<string, { name: string; initials: string; avatarColor: string }>();
    authorNames.set(MOCK_USER.name, {
      name: MOCK_USER.name,
      initials: MOCK_USER.initials,
      avatarColor: MOCK_USER.avatarColor,
    });
    for (const p of MOCK_POSTS) {
      if (p.author.name === 'Anonymous' || p.author.name === 'Admin Office') continue;
      if (!authorNames.has(p.author.name)) {
        authorNames.set(p.author.name, {
          name: p.author.name,
          initials: p.author.initials,
          avatarColor: p.author.avatarColor,
        });
      }
    }
    const matchedPeople = [...authorNames.values()]
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .slice(0, 5);

    const matchedTopics = TOPICS.filter((t) => !q || t.label.toLowerCase().includes(q)).slice(0, 6);

    return { posts: matchedPosts, people: matchedPeople, topics: matchedTopics };
  }, [query]);

  const hasResults = posts.length > 0 || people.length > 0 || topics.length > 0;

  const goTo = (href: string) => {
    onOpenChange(false);
    setQuery('');
    router.push(href);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[15%] max-w-[560px] translate-y-0 gap-0 border-[0.5px] border-[var(--border-med)] bg-[var(--bg-elevated)] p-0"
      >
        <DialogTitle className="sr-only">Search CampusVoice</DialogTitle>
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center gap-2.5 border-b-[0.5px] border-[var(--border)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--text-muted)]" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, people, topics..."
              className="w-full bg-transparent text-[13px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
            />
            <kbd className="rounded border-[0.5px] border-[var(--border-med)] px-1.5 py-0.5 text-[10px] text-[var(--text-muted)]">
              Esc
            </kbd>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {!hasResults && (
              <p className="px-2 py-6 text-center text-[12px] text-[var(--text-muted)]">
                No results for &quot;{query}&quot;
              </p>
            )}

            {posts.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                  Posts
                </div>
                {posts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => goTo(`/post/${post.id}`)}
                    className="flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-[13px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel)]"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                    <span className="truncate">{post.title}</span>
                  </button>
                ))}
              </div>
            )}

            {people.length > 0 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                  People
                </div>
                {people.map((person) => (
                  <button
                    key={person.name}
                    onClick={() => goTo(`/profile/${slugify(person.name)}`)}
                    className="flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-[13px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel)]"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-medium text-white"
                      style={{ backgroundColor: person.avatarColor }}
                    >
                      {person.initials}
                    </span>
                    {person.name}
                  </button>
                ))}
              </div>
            )}

            {topics.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                  Topics
                </div>
                {topics.map((topic) => {
                  const Icon = ICON_MAP[topic.icon] ?? UserIcon;
                  return (
                    <button
                      key={topic.key}
                      onClick={() => goTo(`/discussions/${topic.key}`)}
                      className="flex w-full items-center gap-2.5 rounded px-2 py-2 text-left text-[13px] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-panel)]"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                      {topic.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
