import { formatDistanceToNowStrict } from 'date-fns';
import type { MockAuthor } from '@/lib/mock/posts';
import Avatar from '@/components/shared/Avatar';
import YearBadge from '@/components/shared/YearBadge';

interface PostMetaProps {
  author: MockAuthor;
  createdAt: Date;
  anonymous?: boolean;
}

export default function PostMeta({ author, createdAt, anonymous }: PostMetaProps) {
  return (
    <div className="flex items-center gap-2">
      <Avatar
        initials={anonymous ? '?' : author.initials}
        color={anonymous ? '#444860' : author.avatarColor}
        size={22}
      />
      <span className="text-[12px] font-medium text-[var(--text-primary)]">
        {anonymous ? 'Anonymous' : author.name}
      </span>
      {!anonymous && author.year > 0 && <YearBadge year={author.year} />}
      {!anonymous && author.dept && (
        <span className="text-[11px] text-[var(--text-muted)]">{author.dept}</span>
      )}
      <span className="ml-auto shrink-0 text-[11px] text-[var(--text-muted)]">
        {formatDistanceToNowStrict(createdAt, { addSuffix: true })}
      </span>
    </div>
  );
}
