import type { MockPost } from '@/lib/mock/posts';
import type { MockComment } from '@/lib/mock/comments';

export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** JSON responses carry ISO date strings — the client types expect real Date objects. */
export function hydratePost(post: MockPost): MockPost {
  return { ...post, createdAt: new Date(post.createdAt) };
}

export function hydrateCommentTree(comments: MockComment[]): MockComment[] {
  return comments.map((c) => ({
    ...c,
    createdAt: new Date(c.createdAt),
    replies: hydrateCommentTree(c.replies),
  }));
}
