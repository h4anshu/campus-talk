'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MOCK_POSTS } from '@/lib/mock';
import ApprovalCard from '@/components/admin/ApprovalCard';
import EmptyState from '@/components/shared/EmptyState';

export default function ApprovalsPage() {
  const [pending, setPending] = useState(() => MOCK_POSTS.filter((p) => p.status === 'PENDING'));

  const handle = (id: string, action: 'approved' | 'rejected') => {
    setPending((prev) => prev.filter((p) => p.id !== id));
    toast(action === 'approved' ? 'Post approved' : 'Post rejected');
  };

  return (
    <div>
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Approvals</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        {pending.length} post{pending.length === 1 ? '' : 's'} awaiting review
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {pending.length === 0 ? (
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
                  onApprove={() => handle(post.id, 'approved')}
                  onReject={() => handle(post.id, 'rejected')}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
