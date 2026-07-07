const html = `
<img 
  src="https://example.com/img.png"
/>
`;
console.log(html.match(/<img[^>]+src="([^">]+)"/g));
