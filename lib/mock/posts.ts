import type { SpaceKey, TopicKey } from '@/lib/constants';

export interface MockAuthor {
  name: string;
  initials: string;
  year: number | null;
  dept: string | null;
  avatarColor: string;
}

export interface MockPost {
  id: string;
  title: string;
  body: string;
  type: 'DISCUSSION' | 'SPACE';
  topic?: TopicKey;
  space?: SpaceKey;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  anonymous: boolean;
  pinned: boolean;
  locked: boolean;
  hot?: boolean;
  answered?: boolean;
  voteCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: Date;
  author: MockAuthor;
  tags: string[];
  // Populated by real API responses (undefined for mock data) — the
  // current viewer's own vote/save state, so reloading the page shows
  // the correct persisted state instead of resetting to "not voted".
  userVote?: 'up' | 'down' | null;
  isSaved?: boolean;
  // True when the logged-in viewer is this post's author — used to gate
  // the "mark as accepted" answer control (only the OP may accept).
  viewerIsAuthor?: boolean;
  eventDate?: Date;
  venue?: string;
  slots?: { filled: number; total: number };
  skills?: string[];
  priority?: 'Critical' | 'Info' | 'General';
  attendees?: { initials: string; avatarColor: string }[];
  goingCount?: number;
  interestedCount?: number;
  resourceType?: 'pdf' | 'doc' | 'ppt' | 'sheet' | 'video' | 'link';
  subject?: string;
  semester?: number;
  driveUrl?: string;
  helpfulCount?: number;
  projectType?: string;
  lostFoundStatus?: 'LOST' | 'FOUND' | 'RESOLVED';
  hasImage?: boolean;
  location?: string;
  // Real Media rows attached to this post (undefined for mock data) — used
  // for card-view thumbnails/icons, separate from any <img>/embed card
  // already embedded in the sanitized `body` HTML itself.
  media?: MockPostMedia[];
  collabTotalSlots?: number | null;
  collabFilledSlots?: number | null;
  collabSkills?: string[];
  collabProjectType?: string | null;
  collabDeadline?: string | null;
  collabContact?: string | null;
  collabIsClosed?: boolean;
}

export interface MockPostMedia {
  type: 'image' | 'video' | 'youtube' | 'drive';
  url: string;
  providerId?: string | null;
  thumbnailUrl?: string | null;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const MOCK_POSTS: MockPost[] = [
  {
    id: 'post-1',
    title: 'How to get placed at a startup with no internship?',
    body: "I'm in 3rd year with zero internship experience and placements are starting in 2 months. Are startups more lenient about this compared to product-based companies? Looking for a realistic roadmap.",
    type: 'DISCUSSION',
    topic: 'placements',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    answered: true,
    voteCount: 47,
    commentCount: 23,
    viewCount: 1400,
    createdAt: daysAgo(4),
    author: { name: 'Rohit Verma', initials: 'RV', year: 4, dept: 'CSE', avatarColor: '#4D8EF5' },
    tags: ['placements', 'startups', 'career'],
  },
  {
    id: 'post-2',
    title: 'Best YouTube channels for DSA before placements?',
    body: "Semester's ending and I want to start DSA from scratch. Which channels actually helped you understand patterns instead of just memorizing solutions?",
    type: 'DISCUSSION',
    topic: 'coding',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 31,
    commentCount: 15,
    viewCount: 892,
    createdAt: daysAgo(6),
    author: { name: 'Priya Sharma', initials: 'PS', year: 3, dept: 'IT', avatarColor: '#2C3555' },
    tags: ['dsa', 'coding', 'resources'],
  },
  {
    id: 'post-3',
    title: 'How to prepare for DBMS end sem in 1 week?',
    body: "I've barely attended DBMS classes this sem and exam is in a week. What are the highest-weightage topics I should focus on to at least clear it?",
    type: 'DISCUSSION',
    topic: 'academics',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    answered: true,
    voteCount: 28,
    commentCount: 18,
    viewCount: 1100,
    createdAt: daysAgo(2),
    author: { name: 'Ananya Singh', initials: 'AS', year: 2, dept: 'CSE', avatarColor: '#5B6584' },
    tags: ['dbms', 'exams', 'academics'],
  },
  {
    id: 'post-4',
    title: 'Petition: bring back the old canteen menu',
    body: "The new canteen contractor removed half the affordable items and doubled prices on the rest. Starting a petition to submit to admin — comment if you want your name added.",
    type: 'DISCUSSION',
    topic: 'general',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    hot: true,
    voteCount: 89,
    commentCount: 67,
    viewCount: 2100,
    createdAt: daysAgo(1),
    author: { name: 'Vikram Yadav', initials: 'VY', year: 3, dept: 'ME', avatarColor: '#1D4ED8' },
    tags: ['canteen', 'campus-life', 'petition'],
  },
  {
    id: 'post-5',
    title: 'My Flipkart SDE internship experience — full breakdown',
    body: "Just wrapped up my 6-month internship at Flipkart. Sharing the interview process, what the actual day-to-day work looked like, and tips for anyone targeting e-commerce companies.",
    type: 'DISCUSSION',
    topic: 'placements',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 62,
    commentCount: 34,
    viewCount: 3200,
    createdAt: daysAgo(8),
    author: { name: 'Sneha Gupta', initials: 'SG', year: 4, dept: 'CSE', avatarColor: '#4D8EF5' },
    tags: ['flipkart', 'internship', 'sde'],
  },
  {
    id: 'post-6',
    title: 'Can someone explain recursion simply?',
    body: "I understand the syntax but I genuinely cannot visualize what's happening in the call stack. Any analogies that actually clicked for you?",
    type: 'DISCUSSION',
    topic: 'coding',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 19,
    commentCount: 11,
    viewCount: 640,
    createdAt: daysAgo(3),
    author: { name: 'Arjun Mehta', initials: 'AM', year: 1, dept: 'CSE', avatarColor: '#2C3555' },
    tags: ['recursion', 'coding', 'basics'],
  },
  {
    id: 'post-7',
    title: 'Final year project ideas that aren\'t just another chatbot?',
    body: "Everyone in my batch is building yet another AI chatbot for their major project. Looking for ideas that are still doable in one sem but stand out on a resume.",
    type: 'DISCUSSION',
    topic: 'projects',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 44,
    commentCount: 28,
    viewCount: 1560,
    createdAt: daysAgo(5),
    author: { name: 'Kavya Reddy', initials: 'KR', year: 4, dept: 'IT', avatarColor: '#5B6584' },
    tags: ['projects', 'final-year', 'ideas'],
  },
  {
    id: 'post-8',
    title: 'Hostel wifi has been down for 4 days, no response from admin',
    body: "Block C wifi has been unusable since Monday. Submitted two tickets already with no reply. Anyone else facing this or is it just our block?",
    type: 'DISCUSSION',
    topic: 'hostel-mess',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    hot: true,
    voteCount: 55,
    commentCount: 41,
    viewCount: 1980,
    createdAt: daysAgo(1),
    author: { name: 'Rahul Tiwari', initials: 'RT', year: 2, dept: 'ECE', avatarColor: '#1D4ED8' },
    tags: ['hostel', 'wifi', 'complaint'],
  },
  {
    id: 'post-9',
    title: 'Mid-Term Examination Schedule — Odd Semester 2025',
    body: "The mid-term examination for all branches will be conducted from 18th to 25th November. Datesheet and seating arrangement have been uploaded to the student portal. Report to your allotted hall 15 minutes before the exam.",
    type: 'SPACE',
    space: 'announcements',
    status: 'APPROVED',
    anonymous: false,
    pinned: true,
    locked: false,
    voteCount: 12,
    commentCount: 6,
    viewCount: 4200,
    createdAt: daysAgo(2),
    author: { name: 'Admin Office', initials: 'AO', year: 0, dept: 'Administration', avatarColor: '#1D4ED8' },
    tags: ['exams', 'schedule', 'official'],
    priority: 'Critical',
  },
  {
    id: 'post-10',
    title: 'Tech Fest 2025 — Registrations Open',
    body: "BBD Campus's annual Tech Fest returns with hackathons, robotics, coding contests, and a startup pitch stage. Registration is open to all years and departments. Prizes worth ₹2 lakh across events.",
    type: 'SPACE',
    space: 'events',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 34,
    commentCount: 9,
    viewCount: 2700,
    createdAt: daysAgo(3),
    author: { name: 'Admin Office', initials: 'AO', year: 0, dept: 'Administration', avatarColor: '#1D4ED8' },
    tags: ['techfest', 'hackathon', 'event'],
    eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    venue: 'Main Auditorium',
    attendees: [
      { initials: 'RV', avatarColor: '#4D8EF5' },
      { initials: 'PS', avatarColor: '#2C3555' },
      { initials: 'AS', avatarColor: '#5B6584' },
      { initials: 'VY', avatarColor: '#1D4ED8' },
    ],
    goingCount: 48,
    interestedCount: 22,
  },
  {
    id: 'post-11',
    title: 'HackIndia 2025 — need 2 more teammates',
    body: "Team of 2 building an AI-powered campus resource-sharing app for HackIndia. Need a frontend dev comfortable with React and someone who can handle ML/backend. DMs open.",
    type: 'SPACE',
    space: 'collaboration',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 21,
    commentCount: 14,
    viewCount: 730,
    createdAt: daysAgo(1),
    author: { name: 'Aditya Rana', initials: 'AR', year: 3, dept: 'CSE', avatarColor: '#4D8EF5' },
    tags: ['hackathon', 'team', 'react'],
    slots: { filled: 2, total: 4 },
    skills: ['React', 'Node.js', 'Machine Learning', 'UI/UX'],
    projectType: 'Hackathon',
  },
  {
    id: 'post-12',
    title: 'Failed 2 subjects this sem and haven\'t told my parents',
    body: "Got backlogs in two core subjects and have no idea how to tell my parents. They've sacrificed a lot to send me here. Anyone been through this and come out okay?",
    type: 'SPACE',
    space: 'confession',
    status: 'APPROVED',
    anonymous: true,
    pinned: false,
    locked: false,
    voteCount: 76,
    commentCount: 39,
    viewCount: 1850,
    createdAt: daysAgo(2),
    author: { name: 'Anonymous', initials: '?', year: 0, dept: '', avatarColor: '#444860' },
    tags: ['confession', 'backlog', 'support'],
  },
  {
    id: 'post-13',
    title: 'DBMS Unit 3 Notes + Previous Year Questions',
    body: "Handwritten notes covering normalization, ER diagrams and transactions, plus the last 5 years' end-sem questions sorted by topic. Helped me clear the DBMS exam.",
    type: 'SPACE',
    space: 'resources',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 22,
    commentCount: 5,
    viewCount: 980,
    createdAt: daysAgo(6),
    author: { name: 'Ananya Singh', initials: 'AS', year: 2, dept: 'CSE', avatarColor: '#5B6584' },
    tags: ['dbms', 'notes', 'pyq'],
    resourceType: 'pdf',
    subject: 'DBMS',
    semester: 4,
    driveUrl: 'https://drive.google.com/drive/folders/dbms-unit3-notes',
    helpfulCount: 38,
  },
  {
    id: 'post-14',
    title: 'Recorded mock interview sessions — placement prep',
    body: "Uploaded recordings from last month's mock interview drive with alumni from Flipkart and TCS. Good reference for HR + technical rounds.",
    type: 'SPACE',
    space: 'resources',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 17,
    commentCount: 3,
    viewCount: 650,
    createdAt: daysAgo(9),
    author: { name: 'Sneha Gupta', initials: 'SG', year: 4, dept: 'CSE', avatarColor: '#4D8EF5' },
    tags: ['placements', 'interview', 'video'],
    resourceType: 'video',
    subject: 'Placement Prep',
    semester: 7,
    driveUrl: 'https://drive.google.com/drive/folders/mock-interview-recordings',
    helpfulCount: 24,
  },
  {
    id: 'post-15',
    title: 'Lost: Black HP laptop near library',
    body: "Left my HP laptop (black, has a Campus Thread sticker on the lid) on a table near the library reading room yesterday evening. Please contact me if found — reward offered.",
    type: 'SPACE',
    space: 'lost-found',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 14,
    commentCount: 8,
    viewCount: 610,
    createdAt: daysAgo(1),
    author: { name: 'Arjun Mehta', initials: 'AM', year: 1, dept: 'CSE', avatarColor: '#2C3555' },
    tags: ['lost', 'laptop', 'library'],
    lostFoundStatus: 'LOST',
    hasImage: false,
    location: 'Central Library, 2nd floor',
  },
  {
    id: 'post-16',
    title: 'Found: College ID card near canteen',
    body: "Found a student ID card lying near the canteen entrance this morning. Name partially visible starts with 'Ka...'. DM to claim with your details.",
    type: 'SPACE',
    space: 'lost-found',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 9,
    commentCount: 2,
    viewCount: 340,
    createdAt: daysAgo(2),
    author: { name: 'Priya Sharma', initials: 'PS', year: 3, dept: 'IT', avatarColor: '#2C3555' },
    tags: ['found', 'id-card', 'canteen'],
    lostFoundStatus: 'FOUND',
    hasImage: true,
    location: 'Canteen entrance',
  },
  {
    id: 'post-17',
    title: 'Reunited: Blue water bottle from Seminar Hall B',
    body: "Update — the water bottle I found after the workshop has been returned to its owner. Thanks to everyone who shared this post!",
    type: 'SPACE',
    space: 'lost-found',
    status: 'APPROVED',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 5,
    commentCount: 1,
    viewCount: 210,
    createdAt: daysAgo(4),
    author: { name: 'Kavya Reddy', initials: 'KR', year: 4, dept: 'IT', avatarColor: '#5B6584' },
    tags: ['resolved', 'water-bottle'],
    lostFoundStatus: 'RESOLVED',
    hasImage: false,
    location: 'Seminar Hall B',
  },
  {
    id: 'post-18',
    title: 'Placement Cell interview question bank (2025 batch)',
    body: "Compiled technical + HR questions shared by seniors who cleared TCS, Infosys and Wipro drives this year. Submitting for the Resources space.",
    type: 'SPACE',
    space: 'resources',
    status: 'PENDING',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 0,
    commentCount: 0,
    viewCount: 12,
    createdAt: daysAgo(0),
    author: { name: 'Arjun Mehta', initials: 'AM', year: 1, dept: 'CSE', avatarColor: '#2C3555' },
    tags: ['placements', 'interview', 'questions'],
    resourceType: 'doc',
    subject: 'Placement Prep',
    semester: 7,
    driveUrl: 'https://drive.google.com/drive/folders/interview-question-bank',
    helpfulCount: 0,
  },
  {
    id: 'post-19',
    title: 'Found: Silver wristwatch near the gym',
    body: "Found a silver analog wristwatch on the bench outside the gym this morning. Holding onto it — DM with a description to claim.",
    type: 'SPACE',
    space: 'lost-found',
    status: 'PENDING',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 0,
    commentCount: 0,
    viewCount: 4,
    createdAt: daysAgo(0),
    author: { name: 'Vikram Yadav', initials: 'VY', year: 3, dept: 'ME', avatarColor: '#1D4ED8' },
    tags: ['found', 'wristwatch', 'gym'],
    lostFoundStatus: 'FOUND',
    hasImage: false,
    location: 'Gym entrance',
  },
  {
    id: 'post-20',
    title: 'Need a UI designer for a research visualization tool',
    body: "Building a data visualization tool for a faculty research project. Need someone comfortable with Figma to design the dashboard screens. Can credit as co-author on the paper.",
    type: 'SPACE',
    space: 'collaboration',
    status: 'PENDING',
    anonymous: false,
    pinned: false,
    locked: false,
    voteCount: 0,
    commentCount: 0,
    viewCount: 7,
    createdAt: daysAgo(0),
    author: { name: 'Kavya Reddy', initials: 'KR', year: 4, dept: 'IT', avatarColor: '#5B6584' },
    tags: ['research', 'design', 'figma'],
    slots: { filled: 1, total: 3 },
    skills: ['Figma', 'UI/UX', 'Data Viz'],
    projectType: 'Research',
  },
  {
    id: 'post-21',
    title: "Feeling like I don't belong in this college",
    body: "Everyone around me seems to have it figured out — internships, projects, friend groups. I still feel like an outsider after 2 years. Anyone else feel this way?",
    type: 'SPACE',
    space: 'confession',
    status: 'PENDING',
    anonymous: true,
    pinned: false,
    locked: false,
    voteCount: 0,
    commentCount: 0,
    viewCount: 3,
    createdAt: daysAgo(0),
    author: { name: 'Anonymous', initials: '?', year: 0, dept: '', avatarColor: '#444860' },
    tags: ['confession', 'belonging', 'support'],
  },
];
