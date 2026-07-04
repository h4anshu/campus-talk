import { Users } from 'lucide-react';
import EmptyState from '@/components/shared/EmptyState';

export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="text-[18px] font-medium text-[var(--text-primary)]">Users</h1>
      <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
        Manage student accounts, warnings and suspensions.
      </p>
      <div className="mt-4">
        <EmptyState icon={Users} title="User management coming soon" />
      </div>
    </div>
  );
}
