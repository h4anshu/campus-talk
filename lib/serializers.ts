import type { Post, Comment, User, Tag, Vote, SavedPost, Media, Prisma } from '@prisma/client';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { enumToKey } from '@/lib/constants';
import type { MockPost, MockAuthor } from '@/lib/mock/posts';
import type { MockComment, MockCommentAuthor } from '@/lib/mock/comments';

type AuthorLite = Pick<User, 'id' | 'name' | 'image' | 'year' | 'dept'>;

// Shared across every route/page that fetches posts for serialization, so the
// shape backing `PostForSerialization` can't silently drift between them.
export const POST_INCLUDE = {
  author: { select: { id: true, name: true, image: true, year: true, dept: true } },
  tags: true,
  votes: { select: { type: true, userId: true } },
  media: { select: { url: true, type: true }, orderBy: { createdAt: 'asc' as const } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

const ANONYMOUS_AUTHOR: MockAuthor = {
  name: 'Anonymous',
  initials: '?',
  year: null,
  dept: null,
  avatarColor: '#444860',
};

export function serializeAuthor(user: AuthorLite): MockAuthor {
  return {
    name: user.name,
    initials: getInitials(user.name),
    year: user.year,
    dept: user.dept,
    avatarColor: getAvatarColor(user.id),
  };
}

export function netVoteScore(votes: Pick<Vote, 'type' | 'userId'>[]) {
  const up = votes.filter((v) => v.type === 'UP').length;
  const down = votes.filter((v) => v.type === 'DOWN').length;
  return up - down;
}

function viewerVote(votes: Pick<Vote, 'type' | 'userId'>[], viewerId: string): 'up' | 'down' | null {
  const mine = votes.find((v) => v.userId === viewerId);
  if (!mine) return null;
  return mine.type === 'UP' ? 'up' : 'down';
}

export type PostForSerialization = Post & {
  author: AuthorLite;
  tags: Tag[];
  votes: Pick<Vote, 'type' | 'userId'>[];
  savedBy?: Pick<SavedPost, 'userId'>[];
  media?: Pick<Media, 'url' | 'type'>[];
  // Filtered include of just accepted top-level comments (used only to
  // compute the `answered` flag — not the full comment tree).
  comments?: { id: string }[];
  _count: { comments: number };
};

export function serializePost(post: PostForSerialization, viewerId: string): MockPost {
  const voteCount = netVoteScore(post.votes);
  const commentCount = post._count.comments;

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    type: post.type as MockPost['type'],
    topic: post.topic ? (enumToKey(post.topic) as MockPost['topic']) : undefined,
    space: post.space ? (enumToKey(post.space) as MockPost['space']) : undefined,
    status: post.status as MockPost['status'],
    anonymous: post.anonymous,
    pinned: post.pinned,
    locked: post.locked,
    hot: voteCount > 15 || commentCount > 15,
    answered: (post.comments?.length ?? 0) > 0,
    voteCount,
    commentCount,
    viewCount: 0,
    createdAt: post.createdAt,
    author: post.anonymous ? ANONYMOUS_AUTHOR : serializeAuthor(post.author),
    tags: post.tags.map((t) => t.name),
    userVote: viewerVote(post.votes, viewerId),
    isSaved: (post.savedBy?.length ?? 0) > 0,
    viewerIsAuthor: post.authorId === viewerId,
    priority: (post.priority as MockPost['priority']) ?? undefined,
    images: post.media?.filter((m) => m.type === 'image').map((m) => m.url) ?? [],
  };
}

export type CommentForSerialization = Comment & {
  author: AuthorLite;
  votes: Pick<Vote, 'type' | 'userId'>[];
};

function serializeCommentNode(comment: CommentForSerialization, viewerId: string): MockComment {
  const anonymousAuthor: MockCommentAuthor = ANONYMOUS_AUTHOR;
  return {
    id: comment.id,
    body: comment.body,
    author: comment.anonymous ? anonymousAuthor : serializeAuthor(comment.author),
    voteCount: netVoteScore(comment.votes),
    createdAt: comment.createdAt,
    parentId: comment.parentId,
    accepted: comment.accepted,
    userVote: viewerVote(comment.votes, viewerId),
    replies: [],
  };
}

/** Reconstructs the nested reply tree from a flat, parentId-linked list. */
export function buildCommentTree(flatComments: CommentForSerialization[], viewerId: string): MockComment[] {
  const byId = new Map<string, MockComment>();
  const roots: MockComment[] = [];

  for (const c of flatComments) {
    byId.set(c.id, serializeCommentNode(c, viewerId));
  }
  for (const c of flatComments) {
    const node = byId.get(c.id);
    if (!node) continue;
    if (c.parentId && byId.has(c.parentId)) {
      byId.get(c.parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
