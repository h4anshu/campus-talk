# CampusVoice — Claude Code Master Instructions

> Read this file fully before writing any code. These instructions define what this
> project is, what phase we are in, and what rules must never be broken.

---

## 1. Project Identity

**Name:** CampusVoice  
**Type:** College-exclusive community forum — think Reddit + Stack Overflow + Quora, built for a single college campus.  
**Audience:** Verified students and admins of one specific college (college email domain only).  
**Goal:** A place for students to ask academic questions, share resources, find collaborators, post confessions anonymously, report lost items, and stay updated on official announcements and events.

---

## 2. Current Phase

We are in **Phase 1 — UI only.**

- Build every page, component, layout, and interaction with **dummy/mock data.**
- Wire up navigation, routing, dropdowns, modals, voting, tabs — everything should be clickable and feel real.
- Do NOT build real API routes or database queries yet. Mock data goes in `/lib/mock/` files.
- Exception: Set up the **base Prisma schema** (models only, no queries) so the structure exists when Phase 2 begins.
- Phase 2 (backend, auth, real data) comes after the entire UI is complete and approved.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router + TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Components | shadcn/ui (base) + custom components |
| Animations | Framer Motion (already installed) |
| Server state | TanStack Query (React Query) |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Rich text editor | Tiptap |
| ORM | Prisma |
| Database | PostgreSQL on Neon |
| Auth | NextAuth.js v5 |
| Image storage | Cloudinary (presigned upload) |
| Short video | Azure Blob Storage (SAS token upload) |
| Long video | YouTube embed (store video ID only) |
| Documents | Google Drive link embed |
| Real-time | Supabase Realtime (notifications only) |
| Email | Resend |
| Video player | HLS.js (for Azure videos) |
| Package manager | pnpm |

**Never** swap any of these for alternatives without being told to.

---

## 4. Design System — Blueprint Dark Theme

This is the only theme. Do not create a light mode. Do not use any other colors except those defined here.

### CSS Variables — put these in `globals.css`

```css
:root {
  /* Backgrounds — 4 layers of depth */
  --bg-page:     #0C0E17;
  --bg-surface:  #12151F;
  --bg-elevated: #191D2C;
  --bg-panel:    #1F2438;

  /* Borders */
  --border:        rgba(255, 255, 255, 0.08);
  --border-med:    rgba(255, 255, 255, 0.12);
  --border-strong: rgba(255, 255, 255, 0.22);

  /* Blue accent — the ONLY accent color */
  --accent:        #4D8EF5;
  --accent-fill:   #1D4ED8;
  --accent-dim:    rgba(77, 142, 245, 0.10);
  --accent-border: rgba(77, 142, 245, 0.22);

  /* Text */
  --text-primary:   #E6E8F0;
  --text-secondary: #7E8398;
  --text-muted:     #444860;

  /* Status — use ONLY in small badges, never as large fills */
  --success:        #1DB874;
  --success-dim:    rgba(29, 184, 116, 0.10);
  --success-border: rgba(29, 184, 116, 0.22);

  --warning:        #D97706;
  --warning-dim:    rgba(217, 119, 6, 0.10);
  --warning-border: rgba(217, 119, 6, 0.22);

  --danger:        #DC3545;
  --danger-dim:    rgba(220, 53, 69, 0.10);
  --danger-border: rgba(220, 53, 69, 0.22);
}
```

### Design Rules

- **One accent color.** Blue (`--accent`, `--accent-fill`) is used for interactive elements only: active nav items, buttons, links, vote arrows when voted, focused inputs, badges.
- **No purple, no orange, no teal, no rainbow.** Every non-status color must be from the gray/blue scale above.
- **Status colors** (success/warning/danger) appear only in small badge chips — never as large card backgrounds.
- **Borders:** always `0.5px` or `1px solid var(--border)`. Never thicker decorative borders.
- **No gradients.** No `box-shadow` except `0 0 0 2px var(--accent)` for focus rings.
- **No rounded corners above `12px`** on cards. Use `var(--radius)` (8px) for buttons and inputs, `12px` for cards.
- **Typography:** `font-weight: 400` for body, `500` for headings and labels. Never use `600` or `700` — too heavy.
- **Font sizes:** minimum `11px`. Scale: `11px` captions → `12px` meta → `13px` body → `14px` card titles → `16px` section headings → `20px` page headings.

### Tailwind Config

Extend Tailwind with the above CSS variables in `tailwind.config.ts` so classes like `bg-surface`, `text-primary`, `border-accent` etc. work everywhere.

---

## 5. Feature Map

### Spaces (admin-controlled)

| Space | Who posts | Approval needed |
|---|---|---|
| Announcements | Admin only | No (admin posts directly) |
| Events | Admin only | No (admin posts directly) |
| Resources | Any student | Yes — admin must approve |
| Lost & Found | Any student | Yes — admin must approve |
| Collaboration | Any student | Yes — admin must approve |
| Confession | Any student (anonymous) | Yes — admin must approve |

### Discussion Topics (open to all students)

Academics, Assignment, Placements, Internship, Coding, Projects, Hostel & Mess, Events, General

Students post freely in discussions. No approval needed.

### Admin Features

- Compose announcements and events
- Approve / reject pending Space posts
- Student ticket system (contact admin)
- Pin, lock, or remove any post
- User management (warn / suspend)

---

## 6. Routing Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── verify/page.tsx
├── (main)/
│   ├── layout.tsx                    ← Navbar + sidebar shell
│   ├── page.tsx                      ← Home feed (all posts, sorted Hot)
│   ├── discussions/
│   │   └── [topic]/page.tsx          ← /discussions/placements etc.
│   ├── spaces/
│   │   └── [space]/page.tsx          ← /spaces/resources etc.
│   ├── post/
│   │   └── [id]/page.tsx             ← Full post with comment thread
│   ├── profile/
│   │   └── [username]/page.tsx
│   └── saved/page.tsx
├── (admin)/
│   ├── layout.tsx
│   ├── page.tsx                      ← Admin dashboard
│   ├── approvals/page.tsx
│   ├── tickets/page.tsx
│   └── announcements/page.tsx
└── landing/page.tsx                  ← Public landing page (unauthenticated)
```

Every route change must push to browser history so the back button works correctly. Use `next/navigation` `useRouter` and `Link` — never `window.location`.

---

## 7. Component Architecture

```
components/
├── layout/
│   ├── Navbar.tsx
│   ├── LeftSidebar.tsx
│   ├── RightSidebar.tsx
│   └── MobileBottomNav.tsx
├── feed/
│   ├── Feed.tsx
│   ├── SortBar.tsx
│   └── CreatePostBar.tsx
├── post/
│   ├── PostCard.tsx                  ← Feed card (compact)
│   ├── PostDetail.tsx                ← Full post view
│   ├── VoteBlock.tsx
│   ├── PostMeta.tsx                  ← Author + year badge + time
│   ├── PostActions.tsx               ← Comment count, share, save, report
│   └── PostBadges.tsx                ← Answered, Hot, Pinned, Anonymous
├── comment/
│   ├── CommentThread.tsx
│   ├── CommentItem.tsx               ← Single comment with nested replies
│   └── CommentComposer.tsx
├── answer/
│   ├── AnswerList.tsx
│   ├── AnswerCard.tsx
│   └── AnswerComposer.tsx
├── spaces/
│   ├── AnnouncementCard.tsx
│   ├── EventCard.tsx
│   ├── ResourceCard.tsx
│   ├── LostFoundCard.tsx
│   ├── CollaborationCard.tsx
│   └── ConfessionCard.tsx
├── editor/
│   └── RichTextEditor.tsx            ← Tiptap instance
├── media/
│   ├── ImageGallery.tsx
│   ├── YoutubeEmbed.tsx
│   ├── VideoPlayer.tsx               ← Azure video with HLS.js
│   └── DriveCard.tsx
├── admin/
│   ├── ApprovalCard.tsx
│   └── TicketThread.tsx
├── ui/                               ← shadcn/ui components live here
└── shared/
    ├── Avatar.tsx                    ← Initials circle with color
    ├── YearBadge.tsx
    ├── TagPill.tsx
    └── EmptyState.tsx
```

---

## 8. Navbar Specification

The navbar is fixed at the top. It must contain:

- **Left:** Logo mark (blue square + school icon) + "CampusVoice" text + college name subtitle (small, muted)
- **Center:** Search bar with `Ctrl+K` shortcut badge, opens a full-screen search overlay on click
- **Right (in order):** Messages icon with count badge → Bell icon with count badge → "Create post" button (blue fill) → Avatar with chevron dropdown + green online dot

**Below the navbar:** A breadcrumb sub-bar showing current location (e.g. Home › Discussions › Placements) + online user count (right-aligned).

**Avatar dropdown** contains: View profile → My posts → Saved posts → Admin messages (with badge) → divider → Settings → Log out (danger color).

---

## 9. Left Sidebar Specification

Top: Mini user profile (avatar + name + year tag + dept)

**SPACES section** with unread badges where applicable:
Announcements · Events · Resources · Lost & Found · Collaboration · Confession

**DISCUSSIONS section:**
Academics · Assignment · Placements · Internship · Coding · Projects · Hostel & Mess · Events · General

Active item: `background: var(--accent-dim); color: var(--accent);`  
Hover item: slightly lighter than surface, text goes to `--text-secondary`  
Default item: `color: var(--text-muted)`

Footer: Contact admin button + Settings button

---

## 10. Post Card Specification

Every post card uses a two-column grid: **vote block (32px)** | **content**.

**Vote block** (left column, darker bg): up arrow → vote count (blue) → down arrow. Confession posts show an eye-off icon instead of votes.

**Content area:**
- Row 1: Space/Topic flair badge + status badges (Answered, Hot, Pinned, etc.)
- Row 2: Author avatar (initials) + name + year badge + dept + timestamp (right-aligned)
- Row 3: Post title (font-weight 500, 13px)
- Row 4: Body preview (2 lines, truncated, 11px)
- Row 5: Tag pills
- Row 6 (collaboration only): Slot progress bar + skill tags
- Row 7 (confession only): Reaction buttons (Relate, Support) instead of vote block
- Bottom: Action bar — Comments · Views · Share · Save · More (···)

Pinned posts: `border-color: var(--accent-border)`  
Hot posts: `border-color: var(--warning-border)`

---

## 11. Dummy Data Requirements

Seed at least the following mock data in `/lib/mock/`:

- **10 discussion posts** across different topics (placements, coding, academics, general)
- **3 space posts** (1 announcement pinned, 1 event, 1 resource)
- **1 collaboration post** with slot bar (2/4 filled)
- **1 confession post** with anonymous label
- **4 trending items** for right sidebar
- **3 upcoming events** for right sidebar
- **1 logged-in user** (Anshu K., 3rd Year, CSE)
- **5 dummy comments** on the first post with 2 levels of nesting

All mock data must feel like real Indian college content — real subject names, realistic post titles, Indian names for authors.

---

## 12. Hard Rules — Never Break These

1. **Never change the Blueprint theme colors.** No new colors without instruction.
2. **Always use Next.js App Router.** Never Pages Router.
3. **Always use TypeScript.** No `.js` files in `src/` or `app/`.
4. **Always use `next/link` and `next/navigation`.** Never `<a href>` for internal links or `window.location`.
5. **Every interactive element must be clickable.** No static UI. Every button, nav item, dropdown, and tab must respond to user interaction even if it only toggles state or navigates to a route.
6. **Back button must always work.** Never use `router.replace` for main navigation — use `router.push` so history is preserved.
7. **Mobile responsive from day one.** Every component must work on 375px screen width.
8. **No inline styles** except for dynamic values (e.g. slot fill percentage). All styling through Tailwind classes.
9. **Framer Motion for all animations.** No CSS `transition` or `animation` for component-level animations. Use Framer Motion `animate`, `initial`, `exit` props.
10. **shadcn/ui for base components.** Don't build custom modals, dropdowns, or tooltips from scratch — use and extend shadcn/ui primitives.

---

## 13. Claude's Freedom

You have full independence on the following — make the best decision without asking:

- Exact Framer Motion animation values (duration, easing, spring configs)
- Exact Tailwind class combinations to achieve the spec
- Internal component state structure
- How to handle loading, empty, and error states visually
- Micro-interactions (hover effects, focus rings, active press states)
- Exact shadcn/ui component configuration
- How to organise hooks and utilities
- Responsive breakpoint decisions
- Accessibility attributes (aria labels, roles, keyboard navigation)
- How to structure Zustand stores
- Code-splitting and lazy loading decisions

---

## 14. Base Prisma Schema (Phase 2 skeleton — models only)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  STUDENT
  MODERATOR
  ADMIN
}

enum PostType {
  DISCUSSION
  SPACE
}

enum SpaceType {
  ANNOUNCEMENTS
  EVENTS
  RESOURCES
  LOST_FOUND
  COLLABORATION
  CONFESSION
}

enum TopicType {
  ACADEMICS
  ASSIGNMENT
  PLACEMENTS
  INTERNSHIP
  CODING
  PROJECTS
  HOSTEL_MESS
  EVENTS
  GENERAL
}

enum PostStatus {
  PENDING
  APPROVED
  REJECTED
  REMOVED
}

enum VoteType {
  UP
  DOWN
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  image     String?
  year      Int
  dept      String
  bio       String?
  role      Role     @default(STUDENT)
  reputation Int     @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  posts     Post[]
  comments  Comment[]
  votes     Vote[]
  tickets   Ticket[]
  savedPosts SavedPost[]
}

model Post {
  id        String     @id @default(cuid())
  title     String
  body      String     @db.Text
  type      PostType
  space     SpaceType?
  topic     TopicType?
  status    PostStatus @default(PENDING)
  anonymous Boolean    @default(false)
  pinned    Boolean    @default(false)
  locked    Boolean    @default(false)
  authorId  String
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
  votes     Vote[]
  media     Media[]
  tags      Tag[]
  savedBy   SavedPost[]
}

model Comment {
  id        String   @id @default(cuid())
  body      String   @db.Text
  anonymous Boolean  @default(false)
  accepted  Boolean  @default(false)
  authorId  String
  postId    String
  parentId  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author    User      @relation(fields: [authorId], references: [id])
  post      Post      @relation(fields: [postId], references: [id])
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   Comment[] @relation("CommentReplies")
  votes     Vote[]
}

model Vote {
  id        String   @id @default(cuid())
  type      VoteType
  userId    String
  postId    String?
  commentId String?
  createdAt DateTime @default(now())

  user    User     @relation(fields: [userId], references: [id])
  post    Post?    @relation(fields: [postId], references: [id])
  comment Comment? @relation(fields: [commentId], references: [id])

  @@unique([userId, postId])
  @@unique([userId, commentId])
}

model Media {
  id           String   @id @default(cuid())
  type         String   // image | video | youtube | drive
  url          String
  thumbnailUrl String?
  providerId   String?
  postId       String
  createdAt    DateTime @default(now())

  post Post @relation(fields: [postId], references: [id])
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  posts Post[]
}

model SavedPost {
  userId    String
  postId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  post Post @relation(fields: [postId], references: [id])

  @@id([userId, postId])
}

model Ticket {
  id        String       @id @default(cuid())
  subject   String
  body      String       @db.Text
  type      String       // POST_REQUEST | REPORT | QUERY
  status    TicketStatus @default(OPEN)
  userId    String
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  user     User           @relation(fields: [userId], references: [id])
  messages TicketMessage[]
}

model TicketMessage {
  id        String   @id @default(cuid())
  body      String   @db.Text
  fromAdmin Boolean  @default(false)
  ticketId  String
  createdAt DateTime @default(now())

  ticket Ticket @relation(fields: [ticketId], references: [id])
}
```

---

## 15. Folder Structure

```
campus-voice/
├── .claude/
│   ├── ui-ux-pro-max/SKILL.md
│   └── planning-implementation/SKILL.md
├── app/
│   ├── (auth)/
│   ├── (main)/
│   ├── (admin)/
│   ├── landing/
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── layout/
│   ├── feed/
│   ├── post/
│   ├── comment/
│   ├── answer/
│   ├── spaces/
│   ├── editor/
│   ├── media/
│   ├── admin/
│   ├── ui/
│   └── shared/
├── lib/
│   ├── mock/             ← All dummy data lives here (Phase 1)
│   ├── utils.ts
│   ├── validations/
│   └── constants.ts      ← Spaces list, topics list, enums
├── hooks/                ← Custom React hooks
├── store/                ← Zustand stores
├── prisma/
│   └── schema.prisma
├── public/
├── tailwind.config.ts
├── next.config.ts
└── CLAUDE.md             ← This file
```

---

## 16. What to Build First (in order)

1. `globals.css` — theme variables + Tailwind config
2. Landing page (`/landing`)
3. Main layout shell — Navbar + LeftSidebar + RightSidebar
4. Home feed page with mock posts
5. PostCard component (all 6 types)
6. Individual post detail page with comment thread
7. Discussion topic pages (`/discussions/[topic]`)
8. Space pages (`/spaces/[space]`) with their unique card layouts
9. Profile page
10. Admin panel shell
11. Create post flow (modal or page)
12. Search overlay

Do not skip steps. Build in this order.

---

*Last updated: Phase 1 start. Backend planning begins after all UI is complete.*
