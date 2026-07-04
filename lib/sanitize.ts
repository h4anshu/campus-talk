import sanitizeHtml from 'sanitize-html';

// Matches the formatting the Tiptap editor (RichTextEditor) actually produces:
// bold/italic/code, links, bullet/ordered lists, blockquotes, paragraphs, and
// images (inserted via the Cloudinary upload button — always an https URL
// from our own signed upload flow, never user-supplied markup).
// Everything else — scripts, styles, event handlers, iframes — is stripped.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'code', 'pre',
  'ul', 'ol', 'li', 'a', 'blockquote', 'img',
];

export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'rel', 'target'],
      img: ['src', 'alt'],
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
