// Matches youtube.com/watch?v=, youtube.com/embed/, youtube.com/shorts/, and
// youtu.be/ short links. The {11} quantifier on the capture group is what
// makes this safe against trailing query params (e.g. youtu.be/ID?si=...) —
// it stops consuming characters after exactly 11, so `?si=xxxx` is simply
// left unmatched/ignored rather than breaking the match.
const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

// Matches drive.google.com/file/d/ID, /open?id=ID, and /drive/folders/ID.
const DRIVE_REGEX =
  /https?:\/\/(?:www\.)?drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|open\?(?:.*&)?id=([a-zA-Z0-9_-]+)|drive\/folders\/([a-zA-Z0-9_-]+))/i;

export interface DetectedEmbed {
  type: 'youtube' | 'drive';
  url: string;
  providerId?: string;
  thumbnailUrl?: string;
}

function normalizeMatchedUrl(matched: string): string {
  return matched.startsWith('http') ? matched : `https://${matched}`;
}

/**
 * Returns null if the pasted/typed text isn't a recognized YouTube or Drive
 * link. Deliberately uses only the *matched* substring (`match[0]`) as the
 * embed's url — never the raw input — so a crafted paste like
 * `javascript:alert(1)//youtu.be/xxxxxxxxxxx` (which still matches, since the
 * regex just needs the pattern somewhere in the string) can't smuggle an
 * attacker-controlled prefix into a value that later gets used as an href.
 */
export function detectEmbed(text: string): DetectedEmbed | null {
  const trimmed = text.trim();

  const youtubeMatch = trimmed.match(YOUTUBE_REGEX);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      url: normalizeMatchedUrl(youtubeMatch[0]),
      providerId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  const driveMatch = trimmed.match(DRIVE_REGEX);
  if (driveMatch) {
    const fileId = driveMatch[1] ?? driveMatch[2] ?? driveMatch[3];
    return { type: 'drive', url: normalizeMatchedUrl(driveMatch[0]), providerId: fileId };
  }

  return null;
}

/**
 * Scans a post body's rendered HTML for every `href` and runs each one
 * through `detectEmbed`. This is the source of truth for which Media rows
 * get created on submit — deliberately content-derived rather than tied to
 * *how* the link ended up in the body (pasted, typed, dictated, edited in
 * later, dragged in). Tiptap's Link extension autolinks a URL the moment
 * it's typed, not just when it's pasted, so a paste-event-only detector
 * would miss anything the user typed, retyped, or corrected — silently
 * leaving a plain link with no Media row behind it.
 */
export function extractEmbedsFromHtml(html: string): DetectedEmbed[] {
  const found = new Map<string, DetectedEmbed>();
  const hrefRegex = /href="([^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = hrefRegex.exec(html))) {
    const embed = detectEmbed(match[1]);
    if (embed) found.set(embed.url, embed);
  }
  return Array.from(found.values());
}
