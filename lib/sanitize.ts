import sanitizeHtml from 'sanitize-html';

// Matches the formatting the Tiptap editor (RichTextEditor) actually produces:
// bold/italic/code, links, bullet/ordered lists, blockquotes, paragraphs,
// images (Cloudinary upload — always https, from our own signed upload flow),
// and the YouTube/Drive embed card (lib/embed.ts) — a plain <div>+<img>/<a>
// with a fixed `class` and `data-*` attributes we generate ourselves, never
// from arbitrary user HTML.
// Everything else — scripts, styles, event handlers, iframes — is stripped.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'code', 'pre',
  'ul', 'ol', 'li', 'a', 'blockquote', 'img', 'div',
];

export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'rel', 'target'],
      img: ['src', 'alt'],
      div: ['class', 'data-video-id', 'data-url'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['https'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  }).trim();
}

export function sanitizePlainText(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}
