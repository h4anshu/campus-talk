'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { MessageCircle, Eye, Share2, Bookmark, MoreHorizontal, Flag, EyeOff, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSavePost } from '@/hooks/useSavePost';
import { useDeletePost } from '@/hooks/useDeletePost';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

interface PostActionsProps {
  postId: string;
  commentCount: number;
  viewCount: number;
  isSaved?: boolean;
  /** Shows the Delete option — only the post's own author (or an admin) may see it. */
  viewerIsAuthor?: boolean;
}

export default function PostActions({
  postId,
  commentCount,
  viewCount,
  isSaved = false,
  viewerIsAuthor = false,
}: PostActionsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mutate: toggleSaved } = useSavePost(postId);
  const { mutate: deletePost, isPending: deleting } = useDeletePost(postId);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const stop = (e: React.SyntheticEvent) => e.stopPropagation();

  const handleDelete = () => {
    deletePost(undefined, {
      onSuccess: () => {
        setConfirmOpen(false);
        toast('Post deleted');
        if (pathname === `/post/${postId}`) {
          router.push('/home');
        }
      },
      onError: (error) => {
        toast.error(error instanceof Error ? error.message : 'Failed to delete post');
      },
    });
  };

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
          toggleSaved();
        }}
        className={`flex items-center gap-1.5 text-[11px] transition-colors hover:text-[var(--text-secondary)] ${
          isSaved ? 'text-[var(--accent)]' : ''
        }`}
      >
        <Bookmark className="h-3.5 w-3.5" fill={isSaved ? 'var(--accent)' : 'none'} />
        {isSaved ? 'Saved' : 'Save'}
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
          {viewerIsAuthor && (
            <DropdownMenuItem
              className="gap-2 text-[12px] text-[var(--danger)] focus:text-[var(--danger)]"
              onClick={(e) => {
                stop(e);
                setConfirmOpen(true);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete post
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {viewerIsAuthor && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this post?"
          description="This can't be undone. The post, its comments, and its votes will all be permanently removed."
          confirmLabel="Delete"
          isPending={deleting}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
