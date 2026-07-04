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

/** Returns null if the pasted/typed text isn't a recognized YouTube or Drive link. */
export function detectEmbed(text: string): DetectedEmbed | null {
  const trimmed = text.trim();

  const youtubeMatch = trimmed.match(YOUTUBE_REGEX);
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return {
      type: 'youtube',
      url: trimmed,
      providerId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  const driveMatch = trimmed.match(DRIVE_REGEX);
  if (driveMatch) {
    const fileId = driveMatch[1] ?? driveMatch[2] ?? driveMatch[3];
    return { type: 'drive', url: trimmed, providerId: fileId };
  }

  return null;
}

/**
 * Static HTML for the embed card — inserted directly into the Tiptap
 * document as a real, visible card (not a plain auto-linked hyperlink).
 * Deliberately just a <div>+<img>/<a>, no JS/iframe: it has to survive
 * sanitize-html and render identically wherever the sanitized body is shown
 * (composer, card previews, full post page) with no extra client logic.
 */
export function buildEmbedCardHtml(embed: DetectedEmbed): string {
  if (embed.type === 'youtube') {
    return `<div class="cv-embed cv-embed-youtube" data-video-id="${embed.providerId}" data-url="${embed.url}"><img src="${embed.thumbnailUrl}" alt="YouTube video thumbnail" /></div>`;
  }
  return `<div class="cv-embed cv-embed-drive" data-url="${embed.url}"><a href="${embed.url}" target="_blank" rel="noopener noreferrer">Open in Google Drive</a></div>`;
}
