import { serializePost } from './lib/serializers';

const post = {
  id: '1',
  title: 'Test',
  body: '<p>Test</p><img src="https://res.cloudinary.com/demo/image/upload/sample.jpg" alt="test">',
  type: 'DISCUSSION',
  status: 'APPROVED',
  anonymous: false,
  pinned: false,
  locked: false,
  authorId: 'user1',
  createdAt: new Date(),
  updatedAt: new Date(),
  collegeId: 'college1',
  author: { id: 'user1', name: 'Test User', image: null, year: 1, dept: 'CSE' },
  tags: [],
  votes: [],
  media: [],
  _count: { comments: 0 }
};

const serialized = serializePost(post as any, 'user1');
console.log(JSON.stringify(serialized.media, null, 2));
