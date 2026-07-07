export const SPACES = [
  { key: 'announcements', label: 'Announcements', icon: 'speakerphone',  adminOnly: true  },
  { key: 'events',        label: 'Events',         icon: 'calendar-event', adminOnly: true  },
  { key: 'resources',     label: 'Resources',      icon: 'books',          adminOnly: false },
  { key: 'lost-found',    label: 'Lost & Found',   icon: 'map-search',     adminOnly: false },
  { key: 'collaboration', label: 'Collaboration',  icon: 'users',          adminOnly: false },
  { key: 'confession',    label: 'Confession',     icon: 'message-dots',   adminOnly: false },
] as const;

export const TOPICS = [
  { key: 'academics',    label: 'Academics',     icon: 'school'           },
  { key: 'assignment',   label: 'Assignment',    icon: 'notebook'         },
  { key: 'placements',   label: 'Placements',    icon: 'briefcase'        },
  { key: 'internship',   label: 'Internship',    icon: 'building'         },
  { key: 'coding',       label: 'Coding',        icon: 'code'             },
  { key: 'projects',     label: 'Projects',      icon: 'device-desktop'   },
  { key: 'hostel-mess',  label: 'Hostel & Mess', icon: 'home'             },
  { key: 'events',       label: 'Events',        icon: 'calendar'         },
  { key: 'general',      label: 'General',       icon: 'world'            },
] as const;

// Section intro-banner metadata. Keys match the actual route params used by
// `/spaces/[space]` (SPACES keys) and `/discussions/[topic]` (TOPICS keys).
// The Discussions "Events" topic shares the param `events` with the Spaces
// "Events" space, so it's keyed here as `events-discussion` and the discussion
// page remaps `events` → `events-discussion` when picking its banner.
// `icon` values are resolved to lucide-react components in SectionBanner.
export const SECTION_META: Record<
  string,
  { icon: string; color: string; borderColor: string; description: string }
> = {
  // Spaces
  announcements: {
    icon: 'speakerphone',
    color: '#4D8EF5',
    borderColor: 'rgba(77,142,245,0.2)',
    description:
      'Official notices from BBD Campus admin — exam schedules, fee deadlines, college events, and important updates. Read-only for students.',
  },
  events: {
    icon: 'calendar-event',
    color: '#1DB874',
    borderColor: 'rgba(29,184,116,0.2)',
    description:
      "Hackathons, fests, seminars, cultural nights, and workshops happening on campus. Mark \"I'm going\" to let others know you're attending.",
  },
  resources: {
    icon: 'books',
    color: '#4D8EF5',
    borderColor: 'rgba(77,142,245,0.2)',
    description:
      'Share anything useful with your batch — upload images directly or drop links from Google Drive, OneDrive, or any cloud storage. Paste a YouTube link and it embeds automatically. No direct file uploads to keep the platform fast. Posts go live after admin approval.',
  },
  'lost-found': {
    icon: 'map-pin',
    color: '#D97706',
    borderColor: 'rgba(217,119,6,0.2)',
    description:
      'Lost something on campus? Post here. Found something? Help it reach its owner. Mark your post resolved once the item is returned.',
  },
  collaboration: {
    icon: 'users',
    color: '#1DB874',
    borderColor: 'rgba(29,184,116,0.2)',
    description:
      'Find teammates for projects, hackathons, startups, or research. Post your idea, list the skills you need, and fill your slots.',
  },
  confession: {
    icon: 'eye-off',
    color: '#DC3545',
    borderColor: 'rgba(220,53,69,0.18)',
    description:
      "Share what you can't say out loud — anonymously. Rants, regrets, crushes, campus truths. Your identity stays hidden. Be real, not cruel.",
  },
  // Discussions
  academics: {
    icon: 'school',
    color: '#4D8EF5',
    borderColor: 'rgba(77,142,245,0.2)',
    description:
      'Doubts, syllabus questions, subject tips, and study strategies. Ask anything academic — seniors and batchmates are here to help.',
  },
  assignment: {
    icon: 'clipboard-list',
    color: '#D97706',
    borderColor: 'rgba(217,119,6,0.2)',
    description:
      'Stuck on an assignment? Post your question here. Discuss approaches, share references, and help each other submit on time.',
  },
  placements: {
    icon: 'briefcase',
    color: '#1DB874',
    borderColor: 'rgba(29,184,116,0.2)',
    description:
      'Interview experiences, company-wise prep, offer updates, and placement drive discussions. Share what helped you crack it.',
  },
  internship: {
    icon: 'building-factory',
    color: '#4D8EF5',
    borderColor: 'rgba(77,142,245,0.2)',
    description:
      'Finding internships, stipend questions, WFH vs on-site experiences, and referral requests. Learn from those who have been there.',
  },
  coding: {
    icon: 'code',
    color: '#1DB874',
    borderColor: 'rgba(29,184,116,0.2)',
    description:
      'DSA doubts, competitive programming, debugging help, and language-specific questions. Paste your code, explain the problem, get help.',
  },
  projects: {
    icon: 'device-laptop',
    color: '#D97706',
    borderColor: 'rgba(217,119,6,0.2)',
    description:
      'Mini projects, final year projects, tech stack advice, and demo feedback. Show what you are building and get input from peers.',
  },
  'hostel-mess': {
    icon: 'home',
    color: '#DC3545',
    borderColor: 'rgba(220,53,69,0.18)',
    description:
      'Room issues, mess food feedback, warden complaints, and hostel life discussions. A space for boarders to talk freely.',
  },
  'events-discussion': {
    icon: 'confetti',
    color: '#1DB874',
    borderColor: 'rgba(29,184,116,0.2)',
    description:
      'Discuss ongoing or past campus events — your experience, highlights, or what could have been better. Different from the admin-only Events space.',
  },
  general: {
    icon: 'messages',
    color: '#4D8EF5',
    borderColor: 'rgba(77,142,245,0.2)',
    description:
      'Anything that does not fit elsewhere — campus life, random thoughts, recommendations, or just venting. Keep it civil.',
  },
};

export const SORT_OPTIONS = ['Hot', 'New', 'Top', 'Rising'] as const;

export const SPACE_KEYS = SPACES.map(s => s.key);
export const TOPIC_KEYS = TOPICS.map(t => t.key);

export type SpaceKey = typeof SPACES[number]['key'];
export type TopicKey = typeof TOPICS[number]['key'];
export type SortOption = typeof SORT_OPTIONS[number];

export const COLLEGE_NAME = 'BBD Campus';
export const PLATFORM_NAME = 'Campus Thread';
export const COLLEGE_EMAIL_DOMAIN = '@sitm.ac.in';

// UI keys are kebab-case ('hostel-mess'); Prisma's TopicType/SpaceType enums
// are UPPER_SNAKE_CASE ('HOSTEL_MESS'). These convert between the two.
export function keyToEnum(key: string): string {
  return key.toUpperCase().replace(/-/g, '_');
}

export function enumToKey(value: string): string {
  return value.toLowerCase().replace(/_/g, '-');
}
