import sanitizeHtml from 'sanitize-html';

const html = '<img src="https://example.com/img.png">';
const clean = sanitizeHtml(html, {
  allowedTags: ['img'],
  allowedAttributes: { img: ['src', 'alt'] },
  allowedSchemesByTag: { img: ['https'] }
});

console.log('clean:', clean);
console.log('matches:', clean.match(/<img[^>]+src="([^">]+)"/g));
