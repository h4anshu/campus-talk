export interface MockTicketUser {
  name: string;
  initials: string;
  year: number | null;
  dept: string | null;
  avatarColor: string;
}

export interface MockTicketMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  createdAt: Date;
}

export interface MockTicket {
  id: string;
  subject: string;
  type?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  user: MockTicketUser;
  createdAt: Date;
  messages: MockTicketMessage[];
  // Whether the *current viewer* (whichever side they're on) has an unseen
  // message on this ticket. Computed server-side per request, since "unread"
  // is relative to who's asking — undefined for mock data.
  unread?: boolean;
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const MOCK_TICKETS: MockTicket[] = [
  {
    id: 'ticket-1',
    subject: 'Wifi not working in Block C hostel',
    status: 'OPEN',
    user: { name: 'Rahul Tiwari', initials: 'RT', year: 2, dept: 'ECE', avatarColor: '#1D4ED8' },
    createdAt: daysAgo(1),
    messages: [
      {
        id: 'ticket-1-msg-1',
        content: "Block C wifi has been down for 4 days now. I already posted about it in Hostel & Mess but no one from admin has responded. Can someone look into this?",
        senderId: 'user-rahul-tiwari',
        senderName: 'Rahul Tiwari',
        senderRole: 'user',
        createdAt: daysAgo(1),
      },
    ],
  },
  {
    id: 'ticket-2',
    subject: 'Request to un-pin outdated exam announcement',
    status: 'IN_PROGRESS',
    user: { name: 'Priya Sharma', initials: 'PS', year: 3, dept: 'IT', avatarColor: '#2C3555' },
    createdAt: daysAgo(3),
    messages: [
      {
        id: 'ticket-2-msg-1',
        content: "The mid-term datesheet announcement is still pinned at the top of Announcements even though exams ended last week. Can it be un-pinned so newer notices are visible?",
        senderId: 'user-priya-sharma',
        senderName: 'Priya Sharma',
        senderRole: 'user',
        createdAt: daysAgo(3),
      },
      {
        id: 'ticket-2-msg-2',
        content: "Thanks for flagging this — checking with the exam cell and will update the pin by tomorrow.",
        senderId: 'admin',
        senderName: 'Admin',
        senderRole: 'admin',
        createdAt: daysAgo(2),
      },
    ],
  },
  {
    id: 'ticket-3',
    subject: 'Reporting a spam post in Confession space',
    status: 'RESOLVED',
    user: { name: 'Kavya Reddy', initials: 'KR', year: 4, dept: 'IT', avatarColor: '#5B6584' },
    createdAt: daysAgo(6),
    messages: [
      {
        id: 'ticket-3-msg-1',
        content: "There's a confession post that's just an ad for an external tuition service, not an actual confession. Reporting it for removal.",
        senderId: 'user-kavya-reddy',
        senderName: 'Kavya Reddy',
        senderRole: 'user',
        createdAt: daysAgo(6),
      },
      {
        id: 'ticket-3-msg-2',
        content: "Reviewed and removed the post, thanks for the report. We've also warned the account.",
        senderId: 'admin',
        senderName: 'Admin',
        senderRole: 'admin',
        createdAt: daysAgo(5),
      },
      {
        id: 'ticket-3-msg-3',
        content: 'Appreciate the quick action!',
        senderId: 'user-kavya-reddy',
        senderName: 'Kavya Reddy',
        senderRole: 'user',
        createdAt: daysAgo(5),
      },
    ],
  },
];
