export const REPUTATION_POINTS = {
  // Post & Content
  POST_PUBLISHED: 2,
  POST_LIKED: 5,
  POST_LIKED_REMOVED: -5, // an upvote on your post was retracted
  POST_DISLIKED: -2,
  POST_DISLIKED_REMOVED: 2, // a downvote on your post was retracted
  SPACE_POST_APPROVED: 3,
  POST_REMOVED_BY_REPORT: -10,

  // Comments & Answers
  COMMENT_LIKED: 3,
  COMMENT_LIKED_REMOVED: -3, // an upvote on your comment was retracted
  ANSWER_ACCEPTED: 15,

  // Reporting & Verification
  REPORT_VERIFIED: 8, // your report led to post removal
  REPORT_FALSE: -3, // your report was dismissed
  LOST_FOUND_RETURNED: 10,
  COLLAB_SLOT_FILLED: 7,

  // Milestones (one-time)
  FIRST_POST: 5,
  TEN_HELPFUL_ANSWERS: 20,
  FIFTY_LIKES_TOTAL: 25,
} as const;

export type ReputationReason = keyof typeof REPUTATION_POINTS;

export const REPUTATION_LABELS: Record<ReputationReason, string> = {
  POST_PUBLISHED: 'Published a post',
  POST_LIKED: 'Post received a like',
  POST_LIKED_REMOVED: 'Post like removed',
  POST_DISLIKED: 'Post received a dislike',
  POST_DISLIKED_REMOVED: 'Post dislike removed',
  SPACE_POST_APPROVED: 'Space post approved by admin',
  POST_REMOVED_BY_REPORT: 'Post removed after report',
  COMMENT_LIKED: 'Comment received a like',
  COMMENT_LIKED_REMOVED: 'Comment like removed',
  ANSWER_ACCEPTED: 'Answer marked as accepted',
  REPORT_VERIFIED: 'Report confirmed by admin',
  REPORT_FALSE: 'Report dismissed',
  LOST_FOUND_RETURNED: 'Lost & Found item returned',
  COLLAB_SLOT_FILLED: 'Collaboration slot filled',
  FIRST_POST: 'First post milestone',
  TEN_HELPFUL_ANSWERS: '10 helpful answers milestone',
  FIFTY_LIKES_TOTAL: '50 total likes milestone',
};

export const REPUTATION_TIERS = [
  { min: 0, max: 99, label: 'Newcomer', color: '#7E8398' },
  { min: 100, max: 499, label: 'Member', color: '#4D8EF5' },
  { min: 500, max: 999, label: 'Regular', color: '#1DB874' },
  { min: 1000, max: 2499, label: 'Trusted', color: '#D97706' },
  { min: 2500, max: Infinity, label: 'Top Contributor', color: '#DC3545' },
] as const;

export function getReputationTier(points: number) {
  return REPUTATION_TIERS.find((t) => points >= t.min && points <= t.max) ?? REPUTATION_TIERS[0];
}
