'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { usePendingPosts, useApprovePost, useRejectPost } from '@/hooks/useAdminApprovals';
import ApprovalCard from '@/components/admin/ApprovalCard';
import EmptyState from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';

export default function ApprovalsPage() {
  const { data: pending, isLoading, isError } = usePendingPosts();
  const { mutate: approve } = useApprovePost();
  const { mutate: reject } = useRejectPost();

  const handleApprove = (id: string) => {
    approve(id, {
      onSuccess: () => toast('Post approved'),
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to approve'),
    });
  };

  const handleReject = (id: string, reason?: string) => {
    reject(
      { postId: id, reason },
      {
        onSuccess: () => toast('Post rejected'),
        onError: (error) => toast.error(error instanceof Error ? error.message : 'Failed to reject'),
      }
    );
  };

  return (
    <div>
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Approvals</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {pending?.length ?? 0} post{pending?.length === 1 ? '' : 's'} awaiting review
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[160px] rounded-card bg-[var(--bg-surface)]" />
          ))
        ) : isError ? (
          <EmptyState title="Couldn't load approvals" description="Something went wrong. Try refreshing the page." />
        ) : !pending || pending.length === 0 ? (
          <EmptyState title="All caught up" description="No posts are waiting for approval." />
        ) : (
          <AnimatePresence>
            {pending.map((post) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.25 }}
                style={{ overflow: 'hidden' }}
              >
                <ApprovalCard
                  post={post}
                  onApprove={() => handleApprove(post.id)}
                  onReject={(reason) => handleReject(post.id, reason)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
