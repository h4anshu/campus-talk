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

export const SORT_OPTIONS = ['Hot', 'New', 'Top', 'Rising'] as const;

export const SPACE_KEYS = SPACES.map(s => s.key);
export const TOPIC_KEYS = TOPICS.map(t => t.key);

export type SpaceKey = typeof SPACES[number]['key'];
export type TopicKey = typeof TOPICS[number]['key'];
export type SortOption = typeof SORT_OPTIONS[number];

export const COLLEGE_NAME = 'SITM College, Lucknow';
export const PLATFORM_NAME = 'CampusVoice';
export const COLLEGE_EMAIL_DOMAIN = '@sitm.ac.in';
