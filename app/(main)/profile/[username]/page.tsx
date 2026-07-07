import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { MOCK_POSTS } from '@/lib/mock';
import { MOCK_COMMENTS_POST_1, type MockComment } from '@/lib/mock/comments';
import { slugify, getInitials, getAvatarColor } from '@/lib/utils';
import { serializePost, netVoteScore, POST_INCLUDE, type PostForSerialization } from '@/lib/serializers';
import { getReputationTier } from '@/lib/reputation';
import type { MockPost } from '@/lib/mock/posts';
import Avatar from '@/components/shared/Avatar';
import YearBadge from '@/components/shared/YearBadge';
import ProfileTabs, { type ProfileAnswer } from '@/components/profile/ProfileTabs';
import EditProfileButton from '@/components/profile/EditProfileButton';

interface ProfilePageProps {
  params: { username: string };
}

function flattenAnswersByAuthor(comments: MockComment[], authorName: string): MockComment[] {
  return comments.filter((c) => c.author.name === authorName);
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const session = await auth();
  const currentUser = session?.user;
  const isOwnProfile = !!currentUser?.name && slugify(currentUser.name) === params.username;

  const matchingPost = MOCK_POSTS.find((p) => slugify(p.author.name) === params.username);

  let dbUser = null;
  if (isOwnProfile && currentUser) {
    dbUser = await prisma.user.findUnique({
      where: { id: currentUser.id },
    });
  }

  const profile = isOwnProfile && dbUser
    ? {
        name: dbUser.name,
        initials: getInitials(dbUser.name),
        year: dbUser.year,
        dept: dbUser.dept,
        avatarColor: getAvatarColor(dbUser.id),
        bio: dbUser.bio,
        reputation: dbUser.reputation,
        image: dbUser.image,
      }
    : matchingPost
      ? {
          name: matchingPost.author.name,
          initials: matchingPost.author.initials,
          year: matchingPost.author.year as number | null,
          dept: matchingPost.author.dept as string | null,
          avatarColor: matchingPost.author.avatarColor,
          bio: null as string | null,
          reputation: undefined as number | undefined,
          image: null as string | null,
        }
      : null;

  if (!profile) {
    return (
      <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <p className="text-[14px] font-medium text-[var(--text-primary)]">Profile not found</p>
        <Link href="/home" className="text-[13px] text-[var(--accent)]">
          ← Back to home
        </Link>
      </div>
    );
  }

  // Own profile reads real posts/answers straight out of Postgres, scoped to
  // the session user's id — `params.username` is only ever a slug of the
  // display name (there's no real `username` column on User yet), so it
  // can't be used to look posts up. Viewing *other* real users' profiles by
  // that slug isn't wired to the database yet; that's unchanged/out of scope
  // here and still falls back to the mock lookup below.
  let posts: MockPost[];
  let answers: ProfileAnswer[];

  if (isOwnProfile && currentUser) {
    const [rawPosts, rawComments] = await Promise.all([
      prisma.post.findMany({
        where: { authorId: currentUser.id, status: { not: 'REMOVED' } },
        orderBy: { createdAt: 'desc' },
        include: {
          ...POST_INCLUDE,
          savedBy: { where: { userId: currentUser.id }, select: { userId: true } },
          comments: { where: { parentId: null, accepted: true }, select: { id: true }, take: 1 },
        },
      }),
      prisma.comment.findMany({
        where: { authorId: currentUser.id },
        orderBy: { createdAt: 'desc' },
        include: { votes: { select: { type: true, userId: true } } },
      }),
    ]);

    posts = rawPosts.map((p) => serializePost(p as PostForSerialization, currentUser.id));
    answers = rawComments.map((c) => ({
      id: c.id,
      body: c.body,
      voteCount: netVoteScore(c.votes),
      createdAt: c.createdAt,
      accepted: c.accepted,
      postId: c.postId,
    }));
  } else {
    posts = MOCK_POSTS.filter((p) => p.author.name === profile.name && p.status === 'APPROVED');
    answers = flattenAnswersByAuthor(MOCK_COMMENTS_POST_1, profile.name).map((a) => ({
      id: a.id,
      body: a.body,
      voteCount: a.voteCount,
      createdAt: a.createdAt,
      accepted: a.accepted,
      postId: 'post-1',
    }));
  }

  const acceptedCount = answers.filter((a) => a.accepted).length;

  // Own profile's `reputation` is now the real, atomically-maintained
  // User.reputation counter (kept in sync by every vote/post/approval event
  // — see lib/updateReputation.ts) and must be shown as-is: it already
  // reflects every post/answer vote, so adding the vote-count sums below on
  // top would double-count them. The mock-data fallback path (viewing
  // another real user's profile — not yet wired to the database, see the
  // note above) has no persisted counter to read, so it keeps the old
  // approximate sum so those profiles don't just show a flat 0.
  const reputation =
    isOwnProfile && dbUser
      ? profile.reputation ?? 0
      : (profile.reputation ?? 0) +
        posts.reduce((sum, p) => sum + p.voteCount, 0) +
        answers.reduce((sum, a) => sum + a.voteCount, 0);
  const reputationTier = getReputationTier(reputation);

  return (
    <div className="mx-auto max-w-[720px] pb-8">
      <div className="relative h-[120px] overflow-hidden border-b-[0.5px] border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(29,78,216,0.15)_0%,transparent_60%)]" />
      </div>

      <div className="px-4 sm:px-6">
        <div className="-mt-9 flex items-end gap-3">
          <div className="rounded-full ring-4 ring-[var(--bg-page)]">
            <Avatar initials={profile.initials} color={profile.avatarColor} size={72} src={profile.image} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <h1 className="text-[18px] font-medium text-[var(--text-primary)]">{profile.name}</h1>
          {isOwnProfile && dbUser && (
            <EditProfileButton
              user={{
                name: dbUser.name,
                email: dbUser.email,
                bio: dbUser.bio,
                year: dbUser.year,
                dept: dbUser.dept,
              }}
            />
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5">
          <YearBadge year={profile.year} />
          {profile.dept && <span className="text-[12px] text-[var(--text-muted)]">{profile.dept}</span>}
        </div>
        {profile.bio && <p className="mt-2 max-w-[480px] text-[13px] text-[var(--text-secondary)]">{profile.bio}</p>}

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 text-center">
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[18px] font-medium text-[var(--text-primary)]">{reputation}</span>
              <span
                className="rounded-[4px] border px-2 py-[2px] text-[11px] font-medium"
                style={{
                  color: reputationTier.color,
                  background: `${reputationTier.color}18`,
                  borderColor: `${reputationTier.color}35`,
                }}
              >
                {reputationTier.label}
              </span>
            </div>
            <div className="mt-0.5 text-[11px] text-[var(--text-muted)]">Reputation</div>
          </div>
          {[
            { label: 'Posts', value: posts.length },
            { label: 'Answers', value: answers.length },
            { label: 'Accepted', value: acceptedCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border-[0.5px] border-[var(--border)] bg-[var(--bg-surface)] px-3 py-3 text-center"
            >
              <div className="text-[18px] font-medium text-[var(--text-primary)]">{stat.value}</div>
              <div className="text-[11px] text-[var(--text-muted)]">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <ProfileTabs posts={posts} answers={answers} isOwnProfile={isOwnProfile} />
        </div>
      </div>
    </div>
  );
}
