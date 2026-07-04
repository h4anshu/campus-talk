import sanitizeHtml from 'sanitize-html';

// Matches the formatting the Tiptap editor (RichTextEditor) actually produces:
// bold/italic/code, links, bullet/ordered lists, blockquotes, paragraphs.
// Everything else — scripts, styles, event handlers, iframes — is stripped.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'code', 'pre',
  'ul', 'ol', 'li', 'a', 'blockquote',
];

export function sanitizeBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'rel', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' }),
    },
  }).trim();
}

export function sanitizePlainText(text: string): string {
  return sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} }).trim();
}
