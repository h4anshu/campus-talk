'use client';

import { useRouter } from 'next/navigation';
import { MessageCircle, Eye, Share2, Bookmark, MoreHorizontal, Flag, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSavedPostsStore } from '@/store/useSavedPostsStore';

interface PostActionsProps {
  postId: string;
  commentCount: number;
  viewCount: number;
}

export default function PostActions({ postId, commentCount, viewCount }: PostActionsProps) {
  const router = useRouter();
  const saved = useSavedPostsStore((s) => s.isSaved(postId));
  const toggleSaved = useSavedPostsStore((s) => s.toggleSaved);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  return (
    <div className="mt-2.5 flex items-center gap-4 text-[var(--text-muted)]">
      <button
        onClick={(e) => {
          stop(e);
          router.push(`/post/${postId}`);
        }}
        className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-[var(--text-secondary)]"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {commentCount}
      </button>

      <span className="flex items-center gap-1.5 text-[11px]">
        <Eye className="h-3.5 w-3.5" />
        {viewCount}
      </span>

      <button
        onClick={(e) => {
          stop(e);
          toast('Link copied to clipboard');
        }}
        className="flex items-center gap-1.5 text-[11px] transition-colors hover:text-[var(--text-secondary)]"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>

      <button
        onClick={(e) => {
          stop(e);
          toggleSaved(postId);
        }}
        className={`flex items-center gap-1.5 text-[11px] transition-colors hover:text-[var(--text-secondary)] ${
          saved ? 'text-[var(--accent)]' : ''
        }`}
      >
        <Bookmark className="h-3.5 w-3.5" fill={saved ? 'var(--accent)' : 'none'} />
        {saved ? 'Saved' : 'Save'}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button onClick={stop} className="ml-auto transition-colors hover:text-[var(--text-secondary)]">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[160px] border-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
          onClick={stop}
        >
          <DropdownMenuItem className="gap-2 text-[12px]" onClick={() => toast('Post reported')}>
            <Flag className="h-3.5 w-3.5" /> Report
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 text-[12px]" onClick={() => toast('Post hidden')}>
            <EyeOff className="h-3.5 w-3.5" /> Hide post
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
