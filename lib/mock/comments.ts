export interface MockCommentAuthor {
  name: string;
  initials: string;
  year: number;
  dept: string;
  avatarColor: string;
}

export interface MockComment {
  id: string;
  body: string;
  author: MockCommentAuthor;
  voteCount: number;
  createdAt: Date;
  parentId: string | null;
  accepted?: boolean;
  replies: MockComment[];
}

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

export const MOCK_COMMENTS_POST_1: MockComment[] = [
  {
    id: 'comment-1',
    body: "Startups care way more about what you've actually built than internship logos on your resume. Focus on 2-3 solid projects with real users, even if it's just your friend circle using them.",
    author: { name: 'Ishita Agarwal', initials: 'IA', year: 4, dept: 'CSE', avatarColor: '#4D8EF5' },
    voteCount: 34,
    createdAt: daysAgo(4),
    parentId: null,
    accepted: true,
    replies: [
      {
        id: 'comment-1-1',
        body: "This. I got into a 12-person startup with just a GitHub full of side projects, no internship at all. They asked me to walk through my code in the interview, nothing about my resume gaps.",
        author: { name: 'Rohit Verma', initials: 'RV', year: 4, dept: 'CSE', avatarColor: '#4D8EF5' },
        voteCount: 18,
        createdAt: daysAgo(4),
        parentId: 'comment-1',
        replies: [
          {
            id: 'comment-1-1-1',
            body: "How many projects did you have on your GitHub when you started applying? Trying to figure out if 3 is enough or I need more.",
            author: { name: 'Arjun Mehta', initials: 'AM', year: 1, dept: 'CSE', avatarColor: '#2C3555' },
            voteCount: 6,
            createdAt: daysAgo(3),
            parentId: 'comment-1-1',
            replies: [
              {
                id: 'comment-1-1-1-1',
                body: "3 solid ones beat 10 half-finished tutorials copies. Pick projects that solve a real problem you had.",
                author: { name: 'Rohit Verma', initials: 'RV', year: 4, dept: 'CSE', avatarColor: '#4D8EF5' },
                voteCount: 4,
                createdAt: daysAgo(3),
                parentId: 'comment-1-1-1',
                replies: [
                  {
                    id: 'comment-1-1-1-1-1',
                    body: "This is underrated advice. My placement mentor said the same — depth over breadth every time.",
                    author: { name: 'Kavya Reddy', initials: 'KR', year: 4, dept: 'IT', avatarColor: '#5B6584' },
                    voteCount: 3,
                    createdAt: daysAgo(2),
                    parentId: 'comment-1-1-1-1',
                    replies: [
                      {
                        id: 'comment-1-1-1-1-1-1',
                        body: "Bookmarking this whole thread, exactly what I needed before I start applying next month.",
                        author: { name: 'Anshu Kumar', initials: 'AK', year: 3, dept: 'CSE', avatarColor: '#1D4ED8' },
                        voteCount: 2,
                        createdAt: daysAgo(1),
                        parentId: 'comment-1-1-1-1-1',
                        replies: [],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'comment-1-2',
        body: "Agree with the projects point, but also cold-email founders directly. Startups don't always post on the placement portal.",
        author: { name: 'Kavya Reddy', initials: 'KR', year: 4, dept: 'IT', avatarColor: '#5B6584' },
        voteCount: 12,
        createdAt: daysAgo(3),
        parentId: 'comment-1',
        replies: [],
      },
    ],
  },
  {
    id: 'comment-2',
    body: "Don't underestimate LinkedIn. Half my interview calls came from recruiters at small startups who found my profile after I started posting about my projects.",
    author: { name: 'Sneha Gupta', initials: 'SG', year: 4, dept: 'CSE', avatarColor: '#4D8EF5' },
    voteCount: 21,
    createdAt: daysAgo(4),
    parentId: null,
    replies: [],
  },
  {
    id: 'comment-3',
    body: "Startups pay less and the hours can be brutal, just going in with eyes open. But it's genuinely one of the fastest ways to learn if you can handle the pace.",
    author: { name: 'Vikram Yadav', initials: 'VY', year: 3, dept: 'ME', avatarColor: '#1D4ED8' },
    voteCount: 15,
    createdAt: daysAgo(3),
    parentId: null,
    replies: [],
  },
  {
    id: 'comment-4',
    body: "Our placement cell actually has a separate drive for startups in Feb, way less competitive than the big product companies. Check with your TnP coordinator.",
    author: { name: 'Priya Sharma', initials: 'PS', year: 3, dept: 'IT', avatarColor: '#2C3555' },
    voteCount: 9,
    createdAt: daysAgo(2),
    parentId: null,
    replies: [],
  },
  {
    id: 'comment-5',
    body: "Contributing to open source helped me a lot more than an internship would have. A few merged PRs to a mid-size repo and recruiters actually asked about them in interviews.",
    author: { name: 'Aditya Rana', initials: 'AR', year: 3, dept: 'CSE', avatarColor: '#4D8EF5' },
    voteCount: 27,
    createdAt: daysAgo(2),
    parentId: null,
    replies: [],
  },
];
