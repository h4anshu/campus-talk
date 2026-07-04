import { Node, mergeAttributes } from '@tiptap/core';

// A real Tiptap Node (not a raw HTML string inserted via `insertContent`).
// That was the actual bug: StarterKit/Link/Image's schema has no node type
// for a bare <div>, so Tiptap's HTML parser silently unwrapped it on insert
// — the <img>/<a> inside survived, but the wrapping `cv-embed` div (and its
// data-video-id/data-url) never made it into the document at all, so the
// saved post body lost every marker that would let PostDetail/ResourceCard
// recognize it as an embed. Declaring the node here means Tiptap parses and
// serializes the exact same markup on both ends.
export interface EmbedCardAttrs {
  embedType: 'youtube' | 'drive';
  videoId: string | null;
  url: string | null;
  thumbnailUrl: string | null;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    embedCard: {
      insertEmbedCard: (attrs: EmbedCardAttrs) => ReturnType;
    };
  }
}

export const EmbedCard = Node.create({
  name: 'embedCard',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,

  addAttributes() {
    return {
      embedType: { default: 'youtube' },
      videoId: { default: null },
      url: { default: null },
      thumbnailUrl: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div.cv-embed-youtube',
        getAttrs: (el) => {
          if (typeof el === 'string') return false;
          return {
            embedType: 'youtube',
            videoId: el.getAttribute('data-video-id'),
            url: el.getAttribute('data-url'),
            thumbnailUrl: el.querySelector('img')?.getAttribute('src') ?? null,
          };
        },
      },
      {
        tag: 'div.cv-embed-drive',
        getAttrs: (el) => {
          if (typeof el === 'string') return false;
          return { embedType: 'drive', videoId: null, url: el.getAttribute('data-url'), thumbnailUrl: null };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const { embedType, videoId, url, thumbnailUrl } = node.attrs as EmbedCardAttrs;
    if (embedType === 'youtube') {
      return [
        'div',
        mergeAttributes({ class: 'cv-embed cv-embed-youtube', 'data-video-id': videoId, 'data-url': url }),
        ['img', { src: thumbnailUrl, alt: 'YouTube video thumbnail' }],
      ];
    }
    return [
      'div',
      mergeAttributes({ class: 'cv-embed cv-embed-drive', 'data-url': url }),
      ['a', { href: url, target: '_blank', rel: 'noopener noreferrer' }, 'Open in Google Drive'],
    ];
  },

  addCommands() {
    return {
      insertEmbedCard:
        (attrs: EmbedCardAttrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
