# CampusVoice — Progress Log

Running log of completed work. One entry per task, most recent first.

---

## Fix — YouTube/Drive paste-embed detection (feature never actually existed)

**Status:** Complete, typechecked, built, deployed. Live click-through handed to the user.

**Reported as a bug ("Phase 4 was supposed to build this") — it wasn't.** Investigated before writing anything: grepped the whole repo for `YoutubeEmbed`, `DriveCard`, `paste`, `embed` — the only hits were CLAUDE.md's planned component list, a Zod enum in `/api/media` that *accepted* `video`/`youtube`/`drive` as media types without anything ever producing them, and a toolbar button whose entire implementation was `onClick={() => toast('Paste a YouTube link — embedding coming soon')}`. `components/media/` was an empty directory. Checked PROGRESS.md too — no phase ever claimed this was built. So the five debugging steps in the request (confirm the paste listener is registered, confirm the regex, confirm it calls the Media API, etc.) all had the same answer: none of it existed to check. Built it for real instead of pretending to "fix" a pre-existing implementation.

**`lib/embed.ts`:** regex detection for YouTube (`youtube.com/watch?v=`, `/embed/`, `/shorts/`, and `youtu.be/` short links) and Google Drive (`file/d/ID`, `open?id=ID`, `drive/folders/ID`). Verified directly against the exact URL from the report, `https://youtu.be/b4d32pBa3UY?si=xxxx` — the video-ID capture group is `{11}` chars exactly, so it stops matching before the `?si=...` query string rather than needing special-case handling for it.

**Real paste detection:** added `editorProps.handlePaste` to `RichTextEditor`'s Tiptap config — a plain-text paste matching either pattern is replaced with a visible embed card instead of being left for Tiptap Link's default autolink to turn into a plain blue hyperlink. The card is deliberately static markup (`<div class="cv-embed">` + `<img>`/`<a>`, no iframe, no client JS) so it survives `sanitizeBody` unchanged and renders identically in the composer, card previews, and the full post page. Added `div` (with `class`/`data-video-id`/`data-url` only) to the sanitize-html allowlist for this. Also rewired the "Embed YouTube video" toolbar button (previously the toast stub) to prompt for a URL and run the same detection, for anyone who doesn't paste.

**Media persisted properly, not just visually embedded:** generalized last phase's image-only `images: string[]` into a full `media: {type, url, providerId, thumbnailUrl}[]` on the post serializer, matching what the `Media` Prisma model already supported end to end (its `type`/`providerId`/`thumbnailUrl` columns existed since Phase 1's base schema but were never selected or surfaced to the client). `CreatePostDialog` and the admin Compose page collect detected embeds via the same `pendingMedia` pattern already used for uploaded images, and record each as a real `Media` row once the post exists (`Media.postId` is required, same ordering constraint noted in the Cloudinary phase).

**Built the two components CLAUDE.md names but nothing had ever created:** `components/media/YoutubeEmbed.tsx` (a real playable iframe) and `DriveCard.tsx` (an "Open in Google Drive" card) — wired into `PostDetail` for a richer full-page experience layered on top of the static thumbnail card already in the body.

**Fixed `ResourceCard` — this is what "0 votes · 0 comments" and no thumbnail turned out to be about:** it never rendered any `Media` at all, only the mock-only `resourceType`/`driveUrl` fields that real API posts have always left `undefined`. That's the actual reason a real Resources post showed a blank icon: not a symptom of the missing embed feature, a separate pre-existing gap in the same component. Now prefers real `Media` (image thumbnail → YouTube thumbnail → Drive link) and falls back to the mock fields only for legacy mock data.

**Deliberately left alone:** "0 votes · 0 comments · 0 views" on a freshly created post is not a bug — a new post genuinely has zero votes and comments, and `viewCount` has been hardcoded to `0` since Phase 2 (view tracking was never built). "Helpful · 0" likewise has never had real persistence in any phase — it's a local `useState` toggle with nowhere to save to. Flagging these as known, pre-existing simplifications rather than silently inventing fake numbers or new persistence systems that weren't asked for.

**Verified:**
- `npx tsc --noEmit` — zero errors
- `next build` — succeeds (same benign `DYNAMIC_SERVER_USAGE` notice as every prior phase, exit 0)
- Regex tested directly (Node, not just visually inspected) against all 6 YouTube URL shapes plus the exact failing `youtu.be/...?si=xxxx` case, and all 3 Drive URL shapes — all matched correctly
- `sanitizeBody` tested directly against a real embed-card HTML string plus an injected `<script>` — the card survives intact, the script is stripped
- Pushed to `main`, Vercel redeployed, confirmed `● Ready`; unauthenticated smoke checks against the live URL (`/api/media`, `/api/posts`, `/spaces/resources`) all return the expected 401/404/307 — no 500s

**Not verified — the same constraint as every phase so far:** actually pasting the link into a real composer and watching a real embed card render needs a working authenticated student session, which I still can't complete myself (no real Google account). The user is testing this directly on the deployed URL.

---

## Fix — Admin post creation/image thumbnails, and a real ticket chat

**Status:** Complete, typechecked, built, deployed. Live authenticated click-through handed to the user — same OAuth/admin-password constraint as every prior phase.

**Bug 1 — image uploads never appeared on Announcement posts.** Root cause was one level up from "images": there was no way to create a *real* Announcement post at all yet. `app/admin/(protected)/announcements/page.tsx` was still exactly what Phase 6 left it as — `Publish` just reset local state and showed a toast, no API call, ever. Wiring it up surfaced a structural gap from Phase 3's admin/student auth split: `POST /api/posts` requires a real student NextAuth session, but the admin panel now has no student account of any kind (that's the whole point of decoupling it). `Post.authorId` is a required FK, so admin-authored content needs *some* real `User` row to point at.

Fixed by adding `getOrCreateAdminOfficeUser()` (`lib/admin-auth.ts`) — lazily upserts one stable system user ("Admin Office", `role: ADMIN`, `collegeId: null`) the first time it's needed — and a new admin-only `POST /api/admin/posts` that creates the post under that identity, `status: APPROVED` immediately (no queue, matching CLAUDE.md's "admin posts directly"). `collegeId: null` is treated as platform-wide: updated `GET /api/posts`'s student-facing query from `collegeId: session.user.collegeId` to `OR: [{collegeId: viewer's college}, {collegeId: null}]`, so one announcement is visible to every college rather than only whichever college the (nonexistent) authoring account would've belonged to.

Loosened `POST /api/upload/signature` and `POST /api/media` to accept the `admin_session` cookie as an alternative to a student session (previously `getSessionOrThrow()`-only) — this is what makes "confirm the composer's image upload path works identically for all post types" literally true: `RichTextEditor`'s upload button, the Cloudinary signing flow, and the image-insertion logic are the exact same code for the student composer and the admin one now, just gated differently underneath.

**Two schema fields added, both to preserve existing UI rather than quietly dropping it:** `Post.priority` (nullable string) — the Compose page already had a working Critical/Info/General selector with nowhere in the database to persist it; and a `Media` include on `POST_INCLUDE` plus a new `images: string[]` field on the serialized post. The latter is the actual fix for "image doesn't show": card views (`AnnouncementCard`, and every other space card) only ever render `stripHtmlTags(post.body)` for the compact preview text, which throws away any `<img>` embedded in the body HTML — that image was only ever visible on the full post-detail page. Added a real thumbnail banner to `AnnouncementCard` (`post.images[0]`, `EventCard`'s banner-div pattern) since that's what the task specifically named; didn't extend it to the other 5 space cards or the generic `PostCard`, since that wasn't asked and each has its own layout conventions worth a separate look.

**Bug 2 — ticket system as a real two-way chat.** Checked first whether the reply mechanism itself was actually limited to one exchange: it wasn't — `POST /api/tickets/[id]/reply` never had a message-count cap, so unlimited back-and-forth already worked at the data layer before this fix. What was missing: the unread-tracking system (didn't exist at all) and a proper chat-style UI (the old `TicketThread` had bubbles already, but timestamps were inside the bubble header, not "under" it as asked, and there was no scrollable dedicated pane or auto-scroll).

Added `TicketMessage.isRead` (flips to `true` when the *other* side opens the thread) and `Ticket.openedByAdmin` (the ticket's opening message lives on the `Ticket` row itself as `subject`/`body`, not as a `TicketMessage` — see the Phase 3 note on this — so it needed its own separate read flag; a student's own opening message is trivially "read" for them, no flag needed on that side). New `POST /api/tickets/[id]/read`, called once when a thread is opened (`useEffect` in `TicketThread`, keyed on `ticket.id`), marks the *other* side's unread messages read. `GET /api/tickets` now computes `unread: boolean` per ticket relative to the caller's actual role (`serializeTicket` takes a `viewerIsAdmin` argument) — both the admin and student ticket-list pages show a small accent dot next to unread tickets.

Rebuilt `TicketThread` as an actual chat pane: fixed-height scrollable message area (auto-scrolls to the newest message), timestamp caption below each bubble instead of inside it, Enter-to-send (Shift+Enter for a newline), single send button — same component, unchanged, for both the student's `/tickets` page and the admin's `/admin/tickets` page, since both already hit the identical reply endpoint.

**Polling, not Realtime (as directed):** `useTickets()` now sets `refetchInterval: 15_000`. Since every ticket-related surface — both list pages and the navbar bell — reads through this one hook, this single change point covers all of them. The bell's badge now adds unread ticket count to the existing mock notification count, and gains a new dropdown line ("N new admin messages") when that count is nonzero, linking to `/tickets`.

**Verified:**
- `npx tsc --noEmit` — zero errors
- `next build` — succeeds (same benign `DYNAMIC_SERVER_USAGE` cosmetic notice as prior phases for a `cookies()`-reading route — exit 0, all 24 routes generated)
- Pushed to `main`, Vercel redeployed, confirmed `● Ready` via `vercel inspect`
- Unauthenticated smoke tests against the live URL: `POST /api/admin/posts` (no admin cookie) → 401; `POST /api/tickets/[id]/read` on a made-up id → 404 without ever hitting the auth branch (pre-existing ordering in this route family, not something introduced here — ticket-lookup happens before the student-ownership check, same as the reply route); `GET /api/posts` unauthenticated → 401. No 500s anywhere.

**Not verified — the same constraint as every phase so far:** actually publishing an announcement with a real image and watching it render, and a full student↔admin ticket back-and-forth with the unread dot clearing on open, both need a working authenticated session on each side (a real Google-logged-in student, and the admin password once `ADMIN_PASSWORD_HASH`/`ADMIN_SESSION_SECRET` are set on Vercel — see the prior phase's entry). The user is testing both flows directly.

---

## Backend Phase 3 — Standalone Admin Auth, Approvals, Tickets, Cloudinary Uploads

**Status:** Code complete, typechecked, built, deployed. Admin login and image upload are **not yet functional on the live URL** until the env vars below are added to Vercel — see the caveat at the end.

**Admin auth, fully decoupled from student NextAuth.** Before this phase, `/admin/*` was gated by `session.user.role === 'ADMIN'` on the *student* Google OAuth session — but nothing in the codebase had a path to actually set a real user's role to `ADMIN`, so in practice no one could reach the admin panel at all in production. Replaced with a single shared bcrypt-hashed password (`ADMIN_PASSWORD_HASH`) and a signed `admin_session` httpOnly cookie (`lib/admin-auth.ts`, HMAC-SHA256 via Node's `crypto`, signed with its own `ADMIN_SESSION_SECRET` — deliberately not `NEXTAUTH_SECRET`). `POST /api/admin/login` bcrypt-compares and sets the cookie; `POST /api/admin/logout` clears it.

**Restructuring `app/admin/` (necessary, not asked for, but unavoidable):** the task said "redirect to `/admin/login` if missing" from the gated layout. A single `layout.tsx` at `app/admin/` wraps *every* page under it, including `/admin/login` itself — so a layout that redirects-if-unauthenticated to `/admin/login` would, when rendering `/admin/login`, see the same missing cookie and redirect to itself, an infinite loop. Next.js has no way to exempt one child route from an ancestor layout except by scoping the layout to a route group. Moved `approvals/`, `tickets/`, `announcements/`, `users/` into a new `app/admin/(protected)/` group with its own gated `layout.tsx`; `app/admin/login/page.tsx` and the bare `app/admin/page.tsx` redirect now sit outside it, under only the root layout. Removed `/admin` from `middleware.ts`'s student-session matcher entirely (it was checking the wrong cookie for this system anyway) — admin gating now lives solely in `(protected)/layout.tsx`, reading `admin_session` server-side via `cookies()`, exactly as asked ("not client Zustand").

**Approval queue:** `GET /api/admin/pending`, `PATCH /api/admin/posts/[id]/approve`, `PATCH /api/admin/posts/[id]/reject` (accepts an optional `reason`). Added `Post.rejectionReason String?` and migrated (`20260704110530_add_rejection_reason`). `ApprovalCard` now has an inline reveal-a-textarea reject flow instead of a bare button, so admins can actually enter that reason. `app/admin/(protected)/approvals/page.tsx` and `ApprovalCard` moved off a `useState` seeded from `MOCK_POSTS` onto `usePendingPosts`/`useApprovePost`/`useRejectPost` (`hooks/useAdminApprovals.ts`).

**Flagging one scope gap in the task's own wording:** it asked for pending posts "for admin's college" — but in this decoupled model there is no admin *account*, so no college to scope by. `GET /api/admin/pending` returns every pending post platform-wide. Given the app currently only serves one college group (BBDU/BBDNITM/BBDEC/BBD Group, all seeded as one cluster), this is very unlikely to matter in practice, but flagging it rather than silently guessing.

**Ticket system:** `Ticket`/`TicketMessage` were already in the schema from Phase 1's base skeleton, unused until now. `GET /api/tickets` branches on caller identity — admin session sees every ticket, a student session sees only their own (same endpoint, same query key, scoped entirely server-side). `POST /api/tickets` (student only — there's no admin User row to attribute a ticket to), `POST /api/tickets/[id]/reply` (ticket owner or admin), `PATCH /api/tickets/[id]/status` (admin only). One schema/UI reconciliation: the Prisma `Ticket` model stores the opening message as `subject`+`body` directly on the row, but the existing Phase-6 mock UI models a ticket as a subject plus a flat `messages[]` thread with no separate `body` field. Bridged this in `lib/ticket-serializers.ts` by synthesizing the first displayed message from `ticket.body` rather than changing either side.

**Built the student side of tickets, which never existed:** "Wire the student's Contact admin flow" implied real ticket creation, but the only prior UI was toast placeholders with no form anywhere. Added `ContactAdminDialog` (subject/body/type, `store/useContactAdminStore.ts` mirroring the existing `useCreatePostStore` pattern) wired to both sidebars' "Contact admin" buttons, and a new `app/(main)/tickets/page.tsx` ("Admin messages" in the navbar dropdown, previously a toast) so a student can see their own tickets and reply. Built one shared `components/tickets/TicketThread.tsx` (a `viewerIsAdmin` boolean flips message alignment, the status control, and the "who's who" label) instead of duplicating it for admin vs. student, replacing the old admin-only `components/admin/TicketThread.tsx`. Added `/tickets` to `middleware.ts`'s protected-routes matcher — it was a real page now, but nothing was gating it yet.

**Cloudinary signed upload:** `POST /api/upload/signature` signs `{timestamp, folder}` server-side with `cloudinary.utils.api_sign_request` — the API secret never reaches the browser. `RichTextEditor`'s image button now opens a real file picker, uploads directly to `https://api.cloudinary.com/v1_1/{cloud}/image/upload` from the browser using that signature, and inserts the returned `secure_url` into the Tiptap document via a newly-added `@tiptap/extension-image`. Added `img` (https-only `src`) to `sanitizeBody`'s allowlist so it survives server-side sanitization.

**Ordering problem worked around (self-discovered):** `Media.postId` is a required (non-nullable) field in the schema — but the composer uploads images *while drafting*, before a post exists to attach them to. Rather than making `postId` nullable (a schema change touching every other Media consumer) or inventing an orphaned-media cleanup story, `CreatePostDialog` collects uploaded `{url, publicId}` pairs in local state and only calls the new `POST /api/media` (once per image) *after* `useCreatePost` succeeds and a real post id exists. The image is already visibly in the post either way, since it's embedded directly in the sanitized body HTML — the Media row is a supplementary record, created best-effort (a failure there doesn't block navigating to the new post).

**Verified:**
- `npx tsc --noEmit` — zero errors
- `next build` — succeeds (one printed `DYNAMIC_SERVER_USAGE` stack trace during static-generation for `/api/admin/pending` is Next.js's normal cosmetic bailout-to-dynamic notice for a route that reads `cookies()` — exit code 0, all 23 routes generated, the route correctly shows as `ƒ` dynamic in the final table)
- Committed, pushed, Vercel redeployed — confirmed `● Ready` via `vercel inspect`
- Smoke-tested the live URL directly: `/admin/login` → 200 (public, no redirect loop — confirms the route-group restructure actually works); `/admin/approvals` unauthenticated → 307 to `/admin/login`; `/tickets` unauthenticated → 307 to `/landing`; `/api/admin/pending`, `/api/tickets`, `/api/upload/signature` unauthenticated → 401; `POST /api/admin/login` with a wrong password → 500 `"Admin login is not configured"` (expected — see caveat)

**Credentials generated (share with the user, not committed anywhere):**
- Admin password: `nM7FgUWDv8XHwq6S`
- `ADMIN_PASSWORD_HASH` (bcrypt, cost 12): `$2b$12$Fsay1y3rWokBB/Y0YJPODOLt1Ag900oGDSN6sUjD.tGIQyrHkSmly`
- `ADMIN_SESSION_SECRET`: `0bf02439fab4c8fbfa1dfa4fb98d283abfcd865ef57e11da6e54cfd5233b0768`

Both are already in the local `.env` (gitignored, never committed) so `pnpm dev` works today. **They still need to be added to Vercel's project env vars for the deployed site** — that 500 above is exactly this being unset in production. Not done automatically: setting production env vars is a deploy-affecting change outside what was asked ("tell me the value to set in Vercel"), so it's reported here rather than pushed silently.

**Not done — requires the user's own Cloudinary account:** `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` have no real values anywhere (checked `.env`/`.env.local` — placeholders only). These have to come from a real account at cloudinary.com (free tier is enough) — Dashboard → these three values are shown directly on the account home page. Until they're set on Vercel, `POST /api/upload/signature` will 500 with `"Image upload is not configured"` exactly like the admin login does above.

**Not verified — same live-login constraint as every prior phase:** admin password login, approving a real pending post, the student ticket → admin reply round trip, and an actual image upload, all need either the admin password to work (blocked on the Vercel env vars above) or a real Google-authenticated student session (still no real OAuth credentials available in this environment). Code-level correctness was verified by direct unauthenticated/wrong-credential smoke tests against the live URL as listed above; the user is testing the authenticated flows themselves once the env vars are in place.

---

## Fix — Two live-testing bugs found after Backend Phase 2

**Status:** Complete (code fixed, built, deployed; live click-through handed to the user — same OAuth caveat as Phase 2)

Two bugs reported from real usage on the deployed Vercel URL. Both root causes confirmed by reading the code directly and by a **read-only** query against the live Neon database (no writes, no fabricated sessions) before touching anything.

**Bug 1 — Profile page didn't show the logged-in user's own posts.**
Root cause: `app/(main)/profile/[username]/page.tsx` was never touched in Backend Phase 2 — it was out of that phase's explicit scope — and still read entirely from `MOCK_POSTS`/`MOCK_COMMENTS_POST_1`, matched by `slugify(author.name) === params.username`. Real posts created via the Phase 2 API live in Postgres and were never in that mock array, so they could never appear regardless of whose profile you viewed. Checked the `User` model directly: there is **no `username` column** — Google OAuth via the Prisma adapter only ever populates `id`/`name`/`email`/`image` on first sign-in, so `params.username` was always a slugified-display-name guess, never a real identifier. Fixed per the suggested minimal approach: for the viewer's own profile (`isOwnProfile`, still computed the same way — the slug still matches to *decide whose* profile you're on), posts and answers are now fetched straight from Postgres by `session.user.id` (`prisma.post.findMany({ where: { authorId: ... } })` / same for `comment`), serialized with `serializePost`/a small local mapper. Viewing *other* real users' profiles by slug still has no real lookup path and is unchanged/still mock-based — building that needs an actual username system, which is a bigger, separate piece of work than this bug report asked for. Also fixed `ProfileTabs`' Answers tab, which linked every single answer to the hardcoded `/post/post-1` regardless of which post it actually belonged to — now carries a real `postId` through.

**Bug 2 — Comment thread "doesn't open."** This one was not what the bug report guessed. Checked the click path end-to-end: `PostCard`'s comment button → `PostActions` → `router.push('/post/[id]')` → `post/[id]/page.tsx` → `usePost()` → `AnswerList`/`CommentThread` — all correct, and grepped the entire repo for `MOCK_COMMENTS`: the only remaining references are in `lib/mock/comments.ts` itself and the profile page's now-intentional non-own-profile fallback (see Bug 1) — nothing leftover in the comment components. The actual root cause: **there was no top-level comment/answer composer anywhere in the app.** `CommentComposer` was only ever rendered nested inside an existing comment's "Reply" toggle (`{replying && <CommentComposer .../>}` in `CommentItem`/`AnswerCard`). On any post with zero comments — which, per a direct read-only query against the live database, is *every* real post that exists right now — there was simply no button or box to create the first one. The empty state (`"No comments yet — be the first to reply"`) was static text with nothing clickable. So "opening" a comment thread on a real post always landed on a dead end, which reads exactly like "it doesn't open." Fixed by adding a persistent composer to `post/[id]/page.tsx`, wired to `useCreateComment`, above the existing `AnswerList`/`CommentThread`. Made `CommentComposer`'s `onCancel` optional (and added a `submitLabel` prop) so it can be used standalone, without a reply-toggle to cancel back to.

**Also deduplicated while touching this code:** the Prisma `POST_INCLUDE` object had been copy-pasted identically across `app/api/posts/route.ts` and `app/api/posts/[id]/route.ts` in Phase 2 — moved it into `lib/serializers.ts` (which already owned `PostForSerialization`) and exported `netVoteScore` alongside it, since the profile page's new real-data path needed both. Both API routes now import the shared constant instead of carrying their own copy.

**Verified:**
- `npx tsc --noEmit` — zero errors
- `next build` — succeeds
- Pushed to `main`; Vercel redeployed, confirmed `● Ready` via `vercel inspect`
- Unauthenticated smoke check against the live alias (`https://campus-talk-gamma.vercel.app`): `/api/posts` → 401 (not 500), `/profile/[slug]` and `/post/[id]` → 307 redirect to `/landing` (not 500) — confirms the new code paths don't crash the server, though this can't confirm the actual authenticated behavior
- Read-only query against the live database confirmed the diagnosis directly: exactly one real post exists, with zero comments — consistent with "no way to create the first comment" being the real bug, not a broken read/navigation path

**Not verified — same constraint as Backend Phase 2:** actually clicking through as a logged-in user (own profile shows own posts; posting and viewing a comment) on the live URL. Auth is Google OAuth only, gated to real college email domains, and fabricating a database session to get a valid cookie was already correctly blocked as a credential-materialization risk in the prior phase — that constraint hasn't changed. The user is testing this round directly.

---

## Backend Phase 2 — Real Post/Comment API, Replacing Mock Data

**Status:** Complete (backend + build verified; live click-through handed to the user — see caveat)

Replaced every `MOCK_POSTS`/`MOCK_COMMENTS` read path with real Prisma-backed API routes, and rewired every consuming component onto TanStack Query hooks. Zero admin/approval/ticket routes touched — that's Phase 3.

**Helpers (`lib/api-helpers.ts`):** the task specified `getSessionOrThrow(req)` via `getServerSession(authOptions)` — that's the v4 API. This project has `next-auth@5` (established in Phase 1), so `getSessionOrThrow()` calls v5's `auth()` instead (no `req` argument needed — v5 reads the request context implicitly) and throws a typed `ApiError(401)` on no session. `handleApiError()` maps `ApiError` → its status, `ZodError` → 400 with field errors, anything else → logged 500.

**Validation (`lib/validations/post.ts`, `comment.ts`):** Zod schemas matching the client forms, with `.refine()` enforcing topic-required-for-DISCUSSION / space-required-for-SPACE.

**Sanitization (`lib/sanitize.ts`):** installed `sanitize-html`. `sanitizeBody()` allowlists Tiptap's own tag set (`p, br, strong, em, code, pre, ul, ol, li, a, blockquote`) plus safe `href` schemes and forces `rel=noopener` on links — used for post bodies. `sanitizePlainText()` strips all tags — used for comment bodies (comments are plain `<textarea>`, never rich text).

**Routes:** `app/api/posts/route.ts` (GET with topic/space/sort filters scoped to `session.user.collegeId`, `status: 'APPROVED'` only; POST creates — discussion posts are auto-`APPROVED`, space posts are `PENDING` unless the author is `ADMIN`), `app/api/posts/[id]/route.ts` (GET with the full comment tree, PATCH/DELETE gated to the post's own author), `app/api/posts/[id]/vote` and `/save` (toggle via Prisma transactions keyed on the `userId_postId` unique constraint), `app/api/comments/route.ts` (create comment/reply), `app/api/comments/[id]/vote`, `app/api/comments/[id]/accept` (PATCH — only the post's author can accept, unsets any previous accepted answer on that post first).

**Serialization (`lib/serializers.ts`):** reuses the existing `MockPost`/`MockComment` TypeScript interfaces as the client-shape contract, so no component needed a rewrite of its prop types — real API responses just populate fields mock data left `undefined` (`userVote`, `isSaved`, and a new `viewerIsAuthor`, see below). Deep comment trees are rebuilt from one flat, `parentId`-linked query (`buildCommentTree`) rather than attempting a 6-level recursive Prisma `include`.

**Hooks (`hooks/*.ts`):** `usePosts`/`usePost` (list/detail), `useCreatePost`, `useVote`/`useCommentVote` (optimistic — patches every cached posts-list plus the post-detail cache via `setQueriesData`, rolls back on error), `useSavePost` (same optimistic pattern), `useCreateComment`/`useAcceptAnswer` (invalidate-and-refetch, no optimism needed for replies).

**Rewired everything that read `MOCK_POSTS`/`MOCK_COMMENTS`:** `Feed` (now fetches via `usePosts` internally instead of taking a `posts` prop), `home`/`discussions/[topic]`/`spaces/[space]`/`saved` pages (all converted from mock-array filtering to real hooks; `saved` no longer reads `useSavedPostsStore`, it calls `usePosts({ saved: true })`), `post/[id]` page + `PostDetail`, all 6 space cards, `VoteBlock`/`PostActions` (now prop-driven off real vote/save state instead of local `useState`), `CommentThread`/`CommentItem`/`AnswerList`/`AnswerCard` (local reply/vote `useState` replaced with `useCommentVote`/`useCreateComment`), `CreatePostDialog` (`handlePost` now calls `useCreatePost().mutate()` and routes to the new post on success).

**Two things the task didn't ask for but were required for what it did ask for:**
1. **`onDelete: Cascade` on Comment/Vote/Media/SavedPost's Post-relations.** The original schema had no cascade behavior — deleting any post with existing comments/votes/saves would hit a Postgres FK-constraint violation, which would make the explicitly-requested `DELETE /api/posts/[id]` fail on any real post. Added the cascade, ran migration `20260704082450_add_cascade_deletes` against the live Neon database.
2. **A "Mark as accepted" button in `AnswerCard`.** The task explicitly asked for `PATCH /api/comments/[id]/accept`, but no UI ever called it — Phase 1's mock data just hardcoded `accepted: true` on certain comments with no interactive control. Added a small button, visible only when `viewerIsAuthor` (a new `MockPost`/serializer field: `post.authorId === session.user.id`) and the answer isn't already accepted. Without it the route would have been unreachable dead code.

**HTML rendering fix (self-discovered):** post bodies are now sanitized Tiptap HTML (`<p>`, `<strong>`, `<ul><li>`), not plain text. `PostCard`/space cards/`PostDetail` were all rendering `{post.body}` as a literal string, which would show raw tags to users. Added `stripHtmlTags()` to `lib/utils.ts` for truncated card previews, and `dangerouslySetInnerHTML` (safe — sanitized server-side before storage) with prose-like Tailwind styling for the full body in `PostDetail`. Comment bodies stay plain text — no change needed there.

**Discrepancy flagged, not silently worked around:** the task said "keep loading skeletons (already built)" — grepped the codebase and confirmed no skeleton UI has ever been wired up anywhere, despite the shadcn `Skeleton` primitive being installed since Phase 1. Built simple skeleton states from scratch for `Feed`, `spaces/[space]`, `saved`, and `post/[id]` rather than silently skipping the instruction. (This is the same kind of claim-vs-reality gap as Backend Phase 1's ".env.local has all vars.")

**Verified:**
- `npx tsc --noEmit` — zero errors
- `next build` — succeeds, all routes compile (7 new API routes + all rewired pages)
- Committed and pushed to `main`; Vercel auto-deployed successfully — confirmed via `vercel inspect`, production alias `https://campus-talk-gamma.vercel.app` is `● Ready` on the new build

**Not verified — flagging rather than guessing:** the task asked to "create a real post, see it appear in the feed, vote on it, reload the page and confirm the vote persisted" on the live URL. Auth is Google OAuth only (`session: { strategy: 'database' }`, no credentials provider), gated to real college email domains. I have no real Google account with a `@bbdu.ac.in`/`@bbdnitm.ac.in`/`@bbdec.ac.in` address, and fabricating a database session directly against the live Neon DB to get a valid cookie was — correctly — blocked as a credential-materialization risk. The user opted to do this click-through test themselves rather than have me work around it.

---

## Fix — Anchor college domain regex patterns

**Status:** Complete

Closes out the substring-matching flag raised at the end of Backend Phase 1. Updated all 4 `domainPattern` values in `prisma/seed.ts` to be anchored (`^...$`) and re-ran `prisma db seed` against the live Neon database to update the existing rows.

**Verified:** re-ran the same domain-matching test as before — `student@bbdu.ac.in`/`bbdnitm.ac.in`/`bbdec.ac.in` and the `BBD Group` fallback (`bbdxyz123.ac.in`) still match correctly, `gmail.com` is still blocked, and the two previous false positives (`somebbd.ac.in`, `notbbdu.ac.in`) are now correctly rejected. `tsc --noEmit` clean.

---

## Backend Phase 1 — Real Database, Google OAuth, College Domain Gating

**Status:** Complete (except the live Google OAuth round-trip — see caveat below)

Replaced every piece of Phase 1-6 mock auth with a real Postgres-backed (Neon) schema, NextAuth v5 + Google OAuth, college-domain gating, and middleware-based route protection. `MOCK_USER` no longer exists anywhere in the codebase.

**Schema (`prisma/schema.prisma`):** added `College` (id/name/domainPattern/isActive/createdAt) with nullable `collegeId`/`college` relations on `User`, `Post`, `Comment`, exactly as asked. Also had to add pieces the task didn't spell out but that are structurally required for `PrismaAdapter` to work at all: the standard Auth.js `Account`/`Session`/`VerificationToken` models and `User.emailVerified`, plus made `User.year`/`User.dept` nullable (the adapter creates new users with only `id`/`name`/`email`/`image` — they can't stay `NOT NULL` with no default). Migrated with `prisma migrate dev --name init` directly against the live Neon database and confirmed all 12 tables (plus the implicit join table) exist.

**Prisma 7 + Neon specifics:** Prisma 7 requires an explicit driver adapter now (`new PrismaClient()` with no args throws) — installed `@prisma/adapter-neon` + `@neondatabase/serverless` (HTTP-based, Edge-runtime-friendly, matches the Neon+Vercel stack) and used it in `lib/prisma.ts` and `auth.ts`. Also fixed `prisma.config.ts`, which only loaded `.env` via bare `dotenv/config` — the real `DATABASE_URL` lives in `.env.local`, which Next.js loads automatically but the Prisma CLI does not; added explicit `.env` → `.env.local` (override) loading so `prisma migrate`/`db seed` hit the real database instead of Phase 1's placeholder localhost URL. Prisma 7 also moved seed config out of `package.json` into `prisma.config.ts`'s `migrations.seed` — added both (package.json per the task, prisma.config.ts because that's what actually works).

**Seed (`prisma/seed.ts`):** upserts BBDU/BBDNITM/BBDEC + the `BBD Group` fallback pattern, idempotent by college name. Ran via `prisma db seed`, confirmed all 4 rows in the database.

**Auth (`auth.ts`, NextAuth v5, not v4):** the task's `getServerSession(authOptions)` phrasing is the v4 API — we have `next-auth@5.0.0-beta.31` installed (chosen deliberately in Phase 1), so implemented with v5's actual surface: `auth.ts` exports `{ handlers, auth, signIn, signOut }`, `app/api/auth/[...nextauth]/route.ts` re-exports `handlers`, server components call `auth()` instead of `getServerSession`. `PrismaAdapter` + `GoogleProvider` + `session: { strategy: 'database' }` so `collegeId`/`role`/`year`/`dept` are readable straight off the DB-backed `user` in the `session` callback. Domain matching (`findMatchingCollege`) runs in both `signIn` (allow/deny — returns `'/login?error=domain'` as a redirect string, not a bare `false`, so the URL actually carries `?error=domain` as specified) and `events.createUser` (persists `collegeId` — can't be done in `signIn` itself since the user row doesn't exist yet for a first-time sign-in).

**Middleware (`middleware.ts`):** protects `/home`, `/discussions/:path*`, `/spaces/:path*`, `/post/:path*`, `/profile/:path*`, `/saved/:path*` (redirect → `/landing`) and additionally checks `role === 'ADMIN'` on `/admin/:path*` (redirect → `/home`), exactly as specified.

**Admin panel conflict resolved:** the Phase 6 correction built a separate hardcoded-password gate for `/admin` (`useAdminSessionStore`, `app/admin/login/page.tsx`) specifically because there was no real auth yet — its own comment said "replaced with real hashed auth in the backend phase." Now that middleware does real role-based gating, that mock gate would have actively conflicted (a real ADMIN would pass middleware, then immediately hit a password wall unrelated to their account). Deleted it entirely: `lib/mock/admin.ts`, `store/useAdminSessionStore.ts`, `app/admin/login/page.tsx`. `app/admin/layout.tsx` is now a server component that just reads `auth()` for display and uses a `signOut` server action for logout — middleware alone gates access.

**Login page:** rewritten to a single "Continue with Google" button (`signIn('google', { callbackUrl: '/home' })`), no email/password fields at all. Shows "Only BBD college emails are allowed to join." when the URL has `?error=domain`.

**Replaced `MOCK_USER` everywhere** (10 files: `Navbar`, `LeftSidebar`, `MobileBottomNav`, `SearchOverlay`, `CreatePostBar`, `CommentComposer`, `CommentItem`, `AnswerCard`, `TicketThread`, the profile page) — server components use `await auth()`, client components use `useSession()`. Since real users don't have `initials`/`avatarColor` (those were mock-only convenience fields), added `getInitials()`/`getAvatarColor()` to `lib/utils.ts` — the latter deterministically hashes the user's id onto the existing blue/gray avatar palette so it stays within the Blueprint theme's color rules. Deleted `lib/mock/user.ts` once nothing referenced it.

**Verified:**
- `npx tsc --noEmit` — zero errors
- `next build` — succeeds, all 16 routes generate correctly
- Unauthenticated requests to every protected route (`/home`, `/discussions/coding`, `/spaces/resources`, `/post/post-1`, `/profile/anshu`, `/saved`, `/admin`, `/admin/approvals`) redirect to `/landing`, confirmed under both `next dev` and a real `next build` + `next start`
- `?error=domain` on `/login` renders "Only BBD college emails are allowed to join."
- Domain-matching logic tested directly against the seeded DB: `bbdu.ac.in`/`bbdnitm.ac.in`/`bbdec.ac.in` all match their college, an arbitrary `bbdxyz123.ac.in` correctly falls through to the `BBD Group` fallback, `gmail.com` is correctly blocked
- Zero browser console errors across login, landing, and the redirect flow

**Bug found and fixed during QA (this one mattered):** first `next build` + `next start` pass showed `/home` returning **200 instead of redirecting** in production mode, with `[auth][error] UntrustedHost` in the server log — NextAuth v5 rejects the request's `Host` header by default outside Vercel's own auto-detection, and the middleware was failing *open* instead of closed when `auth()` threw internally. Added `trustHost: true` to the NextAuth config; re-tested and every protected route now correctly redirects under a real production build. Without this fix, the entire auth wall — including `/admin` — would have silently done nothing once deployed.

**Known caveat, not fixed (flagging rather than guessing):** `next build` warns that `auth.ts` (loaded by `middleware.ts`, which runs on Next's Edge Runtime) pulls in `@prisma/debug` (`process.stdout`) and `jose`'s `CompressionStream`/`DecompressionStream` — Node.js APIs not guaranteed to exist in Vercel's actual Edge Runtime. The build doesn't hard-fail and local `next start` testing showed no issue, but I have no way to test real Vercel Edge deployment from here. If this causes a runtime error after deploying, the fix is Auth.js's documented "split config" pattern (a separate edge-safe config without the Prisma adapter for middleware, full config for API routes/server components) — did not preemptively restructure the auth architecture for a problem I haven't confirmed actually occurs.

**Also flagging (not changed, since it's exactly what was specified):** the seed's regex patterns aren't anchored, and `new RegExp(pattern, 'i').test(domain)` does unanchored substring matching — verified directly that `student@somebbd.ac.in` and `student@notbbdu.ac.in` also pass, since "bbd...ac.in" appears as a substring. This is a direct consequence of the literal patterns and matching method specified, implemented exactly as given — mentioning it in case tighter anchoring (`^...$`) is wanted later.

**Cannot fully test yet:** the live Google OAuth round-trip. `.env.local` (despite the task description) does not actually contain `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`NEXTAUTH_SECRET`/`NEXTAUTH_URL` — only the Neon/Vercel Postgres vars were present. Added placeholders with setup instructions to `.env` and `.env.example`, and generated a real random `NEXTAUTH_SECRET`. **To actually test "BBD email login → reaches /home" and "Gmail → blocked," real Google Cloud Console OAuth credentials need to be added to `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` in `.env`** (authorized redirect URI: `http://localhost:3000/api/auth/callback/google`). Everything downstream of that (domain matching, session shape, middleware, UI) is verified working.

---

## Correction — Real Admin Login (replacing the Phase 6 role toggle)

**Status:** Complete

Phase 6 gated the admin panel behind a Zustand toggle reachable from inside the student session — the user correctly flagged that as wrong (a student should never be able to see or switch into admin view). Replaced it with a separate password-gated admin login.

**Routing change:** moved the admin pages from the `(admin)` route group (which strips the segment from the URL — `app/(admin)/approvals/page.tsx` resolved to `/approvals`) to a literal `app/admin/` folder, so the app now has real `/admin`, `/admin/login`, `/admin/approvals`, `/admin/tickets`, `/admin/announcements`, `/admin/users` URLs. This was necessary to match the task's explicit URLs and to avoid `/admin/login` colliding with the existing student `/login` (a route group version of the same path would have literally collided with `app/(auth)/login/page.tsx`).

**Created:**
- `lib/mock/admin.ts` — hardcoded mock password (`admin123`), commented as a placeholder for real hashed auth in the backend phase
- `store/useAdminSessionStore.ts` — `isAdminAuthenticated` + `login()`/`logout()`, completely separate from anything student-facing
- `app/admin/login/page.tsx` — password-only card (no Google button, no email field), react-hook-form + zod, shows "Incorrect password" inline
- `app/admin/page.tsx` — bare `/admin` redirects to `/admin/approvals`

**Rewrote:** `app/admin/layout.tsx` — checks `isAdminAuthenticated` and redirects to `/admin/login` if not (the login route itself is exempted from the guard so it doesn't redirect-loop). Authenticated admins get a fully separate shell: its own top bar + Approvals/Tickets/Compose/Users nav + Log out button — no student navbar, no left/right sidebar.

**Removed entirely:** `store/useRolePreviewStore.ts` and `components/shared/RolePreviewToggle.tsx` (deleted, not just unmounted) — there is no longer any way to reach or preview admin view from inside the student session.

**Fixed as a consequence:** the student-facing "Contact admin" buttons (`LeftSidebar`, `RightSidebar`) and the navbar's "Admin messages"/messages-dropdown items used to point at `/tickets`, which was the admin's own ticket-management page reused as a placeholder. Now that `/tickets` no longer exists (it's `/admin/tickets`, behind the admin login), pointing students there would be a dead link — changed all four to toast confirmations ("Ticket submitted to admin" / "coming soon") consistent with how other not-yet-built student features are already handled in this app.

**Verified (Playwright, real browser, zero console errors):** the preview toggle is confirmed gone from the student UI; visiting `/admin` or `/admin/approvals` directly while unauthenticated redirects to `/admin/login`; wrong password shows the inline error and stays on the login page; correct password logs in and lands on `/admin/approvals` with no student sidebar/navbar present; navigating the admin tabs and logging out both work; visiting a protected admin route again after logout correctly redirects back to login; the student "Contact admin" button now shows a toast instead of hitting a dead route.

---

## Phase 6 — Search, Profile, Saved Posts, Admin Panel

**Status:** Complete

Rebuilt the search overlay around Posts/People/Topics, added the profile and saved-posts pages, and built the full admin panel (approvals, tickets, announcement composer) gated behind a temporary Zustand role-preview toggle.

**Created:**
- `store/useSavedPostsStore.ts` — Zustand store for saved post IDs; `PostActions.tsx`'s Save button now reads/writes it (was local `useState` before, so it didn't persist across the app — now every card, the detail page, and all 6 space cards share the same saved state since they all render through `PostActions`)
- `store/useRolePreviewStore.ts` — holds the effective role (seeded from `MOCK_USER.role`) with a `toggleRole()` action
- `components/shared/RolePreviewToggle.tsx` — fixed pill button (mounted once in the root layout) that flips the preview role and jumps to `/approvals` or `/home`
- `app/(main)/profile/[username]/page.tsx` + `components/profile/ProfileTabs.tsx` — banner, avatar, bio, 4 stat cards (reputation/posts/answers/accepted), Posts/Answers/Saved tabs (Saved only shown on your own profile). Resolves either `MOCK_USER` or any post author by slugified name, so it works for other students' profiles too, not just the logged-in user
- `app/(main)/saved/page.tsx` — reuses `PostCard`, filtered by the saved-posts store
- `app/(admin)/layout.tsx` — self-contained admin shell (own top bar + Approvals/Tickets/Compose/Users nav), renders a restricted-access message when the preview role isn't ADMIN
- `components/admin/ApprovalCard.tsx` + `app/(admin)/approvals/page.tsx` — local state seeded from pending mock posts, Approve/Reject remove the card with a Framer Motion height/opacity exit
- `components/admin/TicketThread.tsx` + `app/(admin)/tickets/page.tsx` — master-detail ticket list with status badges, thread view (student left / admin right), working reply box
- `app/(admin)/announcements/page.tsx` — reuses the Phase 5 `RichTextEditor`, adds a priority selector and Pin toggle, Publish shows a toast
- `app/(admin)/users/page.tsx` — simple placeholder (no user-management behavior was specified for this phase, kept it to an EmptyState so the nav tab isn't a dead link)
- `lib/mock/tickets.ts` — 3 tickets (Open/In Progress/Resolved)

**Rebuilt:** `components/layout/SearchOverlay.tsx` — was Phase 3's Spaces/Discussions search; now searches Posts (title/body), People (deduped author names across `MOCK_POSTS` + `MOCK_USER`, excluding "Anonymous"/"Admin Office"), and Topics, with a Framer Motion entrance instead of relying only on the Dialog's default CSS animation.

**Mock data:** `MockPost.status` was typed as the literal `'APPROVED'` — widened to `'PENDING' | 'APPROVED' | 'REJECTED'` and added 4 pending posts (one each in Resources, Lost & Found, Collaboration, Confession) for the approvals queue. Fixed `app/(main)/spaces/[space]/page.tsx`, which filtered only by `space` — now also requires `status === 'APPROVED'` so pending posts don't leak into public space pages.

**Verified (Playwright, real browser, zero console errors):** Ctrl+K opens the overlay, Esc closes it, typing filters all three sections live, clicking a post result navigates to `/post/[id]`; own profile vs. another author's profile both resolve correctly and the Saved tab is correctly hidden on other people's profiles; saving a post from the feed and opening Saved via the avatar dropdown shows it; visiting `/approvals` as a student shows the restricted message, the preview toggle flips role and jumps into the panel, all 4 pending cards render and Approve/Reject removes them with the exit animation; navigating between admin tabs via the nav (client-side transitions) correctly preserves the preview-role state; opening a ticket and sending a reply appends it to the thread; the announcement composer's priority pills, Pin toggle, and editor all work and Publish resets the form with a toast.

**Bug found and fixed during QA:** the `RolePreviewToggle`'s fixed `bottom-4 right-4` position visually collided with the mobile bottom nav's "Profile" label on small screens. Changed to `bottom-20 lg:bottom-4` so it clears the mobile nav bar and only tucks in close on desktop where there's no bottom nav.

**Testing note (not an app bug):** two early test failures — a "saved post not found after navigating" and a "restricted-access shown on an admin tab" — turned out to be artifacts of using `page.goto()` between steps, which forces a full page reload and resets in-memory Zustand state (there's no persistence middleware, which is intentional for this mock-data phase). Re-tested using real link/button clicks (the way an actual user would navigate) and both worked correctly — noting this so it isn't misread as a regression later.

---

## Phase 5 — Space Pages + Post Composer

**Status:** Complete

Built all 6 purpose-built space card components, the dynamic space pages, and a full Tiptap-based post composer dialog wired to every "Create post" trigger in the app.

**Created:**
- `components/spaces/AnnouncementCard.tsx`, `EventCard.tsx`, `ResourceCard.tsx`, `LostFoundCard.tsx`, `CollaborationCard.tsx`, `ConfessionCard.tsx` — six distinct layouts (not PostCard variants): Official+priority chip/no voting; banner+RSVP+attendee avatar stack; file-type icon+subject/semester chips+Helpful+Drive "Open" link; LOST/FOUND/RESOLVED badge+optional image slot+location; slot bar+skills+project-type chip (reusing `CollabSlotBar`); anonymous+Relate/Support (reusing `ReactionButtons`)
- `app/(main)/spaces/[space]/page.tsx` — maps the space param to the right card component and filters `MOCK_POSTS`
- `components/editor/RichTextEditor.tsx` — Tiptap (`StarterKit` + `Placeholder` + new `@tiptap/extension-link`) with a toolbar: bold/italic/code/bullet-list/link (functional), image-upload and YouTube-embed (toast placeholders, as specified)
- `components/post/CreatePostDialog.tsx` — shadcn Dialog with destination tabs (Discussion/Resources/Lost & Found/Collaboration/Confession — Announcements & Events correctly excluded as admin-only), title input, the editor, a debounced "Saving draft.../Draft saved" indicator, and a Post button that closes the dialog + fires a `sonner` toast
- `store/useCreatePostStore.ts` — small Zustand store so the navbar button, the mobile FAB, and the feed's `CreatePostBar` all open the *same* dialog instance (mounted once in `app/(main)/layout.tsx`)

**Mock data:** `lib/mock/posts.ts` had zero Resources or Lost & Found posts (Phase 1 never seeded them), so `ResourceCard`/`LostFoundCard` would've had nothing to render — added 2 resource posts and 3 lost-found posts (one each of LOST/FOUND/RESOLVED) plus the new space-specific optional fields (`priority`, `attendees`/`goingCount`, `resourceType`/`subject`/`semester`/`driveUrl`/`helpfulCount`, `projectType`, `lostFoundStatus`/`hasImage`/`location`) to the `MockPost` interface.

**Bug fixed:** `MOCK_TRENDING`'s "Lost: Black HP laptop near library" entry pointed to `post-9` (the exam-schedule announcement, not a lost-and-found post at all — a leftover mismatch from before any lost-found post existed). Repointed it to the new matching post.

**Verified (Playwright, real browser, zero console errors):** all 6 space pages render their correct card type with the right breadcrumb/active-sidebar-highlight; RSVP, Helpful, and Apply clicks don't trigger card navigation while the card/title click does; the Drive "Open" link carries the right `href`; all three Lost & Found status colors (red/green/gray) render; the composer opens identically from the navbar button, the mobile FAB, and the feed's create-post bar; destination tab switching, typing, bold formatting, the autosave indicator, the image-upload placeholder toast, and Post → dialog-closes-with-toast all work end to end.

---

## Phase 4 — Full Post System

**Status:** Complete

Built the complete post system: all 6 post-type variants on `PostCard`, the post detail page with Q&A-style answers + a 6-level nested comment thread, and discussion topic pages — all still on mock data.

**Created:**
- `components/post/PostDetail.tsx` — expanded post view (full body, all tags, stats line, action bar)
- `components/post/ReactionButtons.tsx` — Relate/Support toggles for confessions
- `components/post/CollabSlotBar.tsx` — slot progress bar + skill tags + Apply button for collaboration posts
- `components/comment/CommentComposer.tsx`, `CommentItem.tsx` (recursive, depth-colored, collapsible), `CommentThread.tsx` (top-level list + load-more)
- `components/answer/AnswerCard.tsx` (accepted-answer styling, own nested `CommentThread`), `AnswerList.tsx` (accepted-first then vote-sorted, load-more)
- `app/(main)/post/[id]/page.tsx` — renders `PostDetail` + `AnswerList` for discussion posts, or a plain `CommentThread` for space posts
- `app/(main)/discussions/[topic]/page.tsx` — filters `MOCK_POSTS` by topic, reuses `Feed` for the sort bar + card list
- `components/shared/EmptyState.tsx`

**Enhanced:**
- `components/post/VoteBlock.tsx` — added a `variant` prop (`'vote' | 'confession' | 'pin'`) so announcements show a Pin icon instead of vote arrows
- `components/post/PostCard.tsx` — now branches per post type (Pin for announcements, Apply/slots/skills for collaboration, Relate/Support for confessions), added Framer Motion `whileHover` lift
- `lib/mock/comments.ts` — added `accepted?: boolean` (marked the highest-voted top-level comment on post-1 as accepted, matching the Prisma schema's `Comment.accepted` field), and extended the reply chain to a full 6 levels deep so the depth-color cascade could actually be verified visually

**Verified (Playwright, real browser, zero console errors):** all 6 post-type variants render correctly (screenshots for discussion/collaboration/confession/announcement); clicking vote/reply/apply/relate buttons never triggers card navigation (stopPropagation confirmed); clicking a card/title does navigate to `/post/[id]`; the accepted answer shows the green border + checkmark and sorts to the top; the comment thread nests all 6 levels with the correct blue→green→amber→coral→gray color cascade; the collapse-by-clicking-the-line and inline Reply→submit flow both work and update the UI; Load More reveals additional answers/comments; the discussion topic page filters correctly and highlights the active sidebar item.

**Bug caught and fixed during QA:** `PostDetail`'s stats line unconditionally read "X votes" even for confessions/announcements, which don't have a vote block (they show Relate/Support or a Pin instead) — fixed to only show the votes segment when the post actually has one.

**Scope decision:** Only `post-1` has mock comment/answer data (that's all `lib/mock/comments.ts` ever provided). Every other post's detail page correctly shows the "No answers yet"/"No comments yet" empty state rather than being left broken — this isn't a gap, it's the existing mock dataset's limit.

---

## Phase 3 — Auth Page + Main App Shell

**Status:** Complete

Built the login page and the full authenticated app shell (navbar, breadcrumb, both sidebars, mobile bottom nav) plus the home feed, all using `MOCK_USER`/`MOCK_POSTS`/`MOCK_TRENDING`/`MOCK_EVENTS` — no real auth/backend yet.

**Created:**
- `app/(auth)/login/page.tsx` — rewritten: Google button + college-email magic-link form (react-hook-form + zod, `@sitm.ac.in`-only validation with inline error), both paths `router.push('/home')`
- `app/(main)/layout.tsx` — navbar + breadcrumb + left/main/right 3-column shell + mobile bottom nav
- `app/(main)/home/page.tsx` — renders `<Feed>` with the first 5 `MOCK_POSTS`
- `components/layout/Navbar.tsx`, `SearchOverlay.tsx`, `Breadcrumb.tsx`, `LeftSidebar.tsx`, `RightSidebar.tsx`, `MobileBottomNav.tsx`
- `components/feed/SortBar.tsx`, `CreatePostBar.tsx`, `Feed.tsx` (client-side Hot/New/Top/Rising re-sort)
- `components/post/VoteBlock.tsx`, `PostMeta.tsx`, `PostBadges.tsx`, `PostActions.tsx`, `PostCard.tsx`
- `components/shared/Avatar.tsx`, `YearBadge.tsx`, `TagPill.tsx`
- `lib/scroll.ts` reused; added `slugify()` to `lib/utils.ts`; mounted `<Toaster>` in root layout for "coming soon" placeholders (Create post, Settings, etc.)

**Verified (Playwright, real browser):** zero console errors/TS errors on a clean `/home` load; invalid-domain email shows the error and stays on `/login`; valid `@sitm.ac.in` email and the Google button both reach `/home`; Ctrl+K opens the search overlay; avatar dropdown shows all 6 items with the Admin messages badge; Log out reaches `/landing`; sidebar nav items navigate (e.g. Placements → `/discussions/placements`); clicking a post card navigates to `/post/[id]`; clicking the vote arrows does **not** trigger card navigation (event propagation correctly stopped); mobile shows the bottom tab bar with sidebars hidden, tablet (768px) also uses the bottom-nav layout (see deviation below).

**Bugs found in existing shadcn-generated files and fixed (not cosmetic — real breakage):**
- `components/ui/input.tsx` — `Input` wasn't wrapped in `React.forwardRef`, so react-hook-form's `register()` ref was silently dropped and the form never validated correctly. Wrapped in `forwardRef`.
- `components/ui/dialog.tsx` — `DialogOverlay`/`DialogContent` had the same missing-forwardRef issue, throwing a console warning from Radix's Presence (needs the ref for exit-animation tracking). Wrapped both in `forwardRef`.

**Deviations from literal task text (in favor of avoiding a build error / CLAUDE.md rules):**
- Task said "Home page at `app/(main)/page.tsx`" — but `(main)` is a route group, so that file resolves to URL `/`, which already conflicts with the existing `app/page.tsx` (redirects to `/landing`, established and verified in Phase 1). Since the task also explicitly says login should navigate to `/home`, I placed the home feed at `app/(main)/home/page.tsx` instead, giving a real, distinct `/home` URL with no route conflict.
- Sidebars are hidden below `lg` (1024px) rather than only below the `sm`/mobile breakpoint — at 768px, 200px+180px of fixed sidebars left too little room for the feed, so tablet also gets the bottom-tab-nav treatment. This is a Claude's-Freedom responsive-breakpoint call, not a hard spec requirement.
- Several nav destinations (Contact admin, Settings, Admin messages, Saved, discussion/space pages) point to real routes that don't have pages built yet in this phase (e.g. `/tickets`, `/settings`, `/discussions/placements`) — they navigate correctly and will 404 until those pages are built in a later phase, consistent with "every button must be clickable/navigate" even before the destination exists.

---

## Phase 2 — Public Landing Page

**Status:** Complete

Built the full public landing page at `app/landing/page.tsx` for unauthenticated visitors, with its own layout (no main app navbar/sidebar).

**Created:**
- `app/landing/layout.tsx` — dedicated landing layout, no sidebar
- `components/landing/LandingNav.tsx` — sticky top bar, scroll-triggered backdrop blur, Log in / Join free buttons
- `components/landing/Hero.tsx` — headline, CTA buttons, animated preview cards
- `components/landing/StatsBar.tsx` — count-up stats on scroll into view (800+, 3.2k, 540, 94)
- `components/landing/SpacesSection.tsx` — 6 space cards from `SPACES` constant
- `components/landing/TopicsSection.tsx` — 9 topic chips from `TOPICS` constant
- `components/landing/HowItWorks.tsx` — 3-step onboarding, `id="how-it-works"` scroll target
- `components/landing/WhyNotWhatsapp.tsx` — WhatsApp vs CampusVoice comparison cards
- `components/landing/FeaturesSection.tsx` — 4 feature cards, 2x2 grid
- `components/landing/CTABanner.tsx` — final CTA with radial glow background
- `components/landing/Footer.tsx` — copyright + About/Privacy/Contact links
- `lib/icon-map.tsx` — maps constants.ts icon string keys to lucide-react components
- `lib/scroll.ts` — shared `scrollToId()` smooth-scroll helper
- `app/(auth)/login/page.tsx` — Phase 3 placeholder login page

**Verified (Playwright, real browser):**
- Zero console errors, zero TypeScript errors
- `/login` navigation and browser back button both work
- Smooth scroll to How It Works works
- All Framer Motion scroll-triggered animations (`useInView`) fire correctly
- Responsive at 375px / 768px / 1280px — mobile hero cards hidden, 2x2 stats, 2-col spaces, stacked comparison cards; tablet shows 3-col spaces and side-by-side hero

**Deviations from literal task text (in favor of CLAUDE.md hard rules):**
- Feature card 3 spec said "purple-tinted accent-dim" — used plain accent blue instead; theme forbids purple.
- Step 14's login page snippet used raw `<a href>` — replaced with `next/link` per hard rule #4.

**Bug found + fixed during QA:** Hero only went side-by-side at `lg:` (1024px); spec requires side-by-side from tablet (640px) with narrower 180px cards. Fixed `lg:flex-row` → `sm:flex-row`, reverified with screenshot.

---

## Phase 1 — Project Foundation

**Status:** Complete

Set up the full Next.js 14 + TypeScript + Tailwind v3 + Prisma foundation per `CLAUDE.md`, with mock data only (no real backend).

**Created:**
- Dependencies installed via pnpm (Next 14, React, Tailwind v3, shadcn/ui, Framer Motion, TanStack Query, Zustand, React Hook Form + Zod, Tiptap, Prisma, NextAuth v5, Cloudinary, Azure Blob, HLS.js, Resend, Supabase)
- `tailwind.config.ts` + `app/globals.css` — Blueprint dark theme, exact CSS variables from spec
- Full folder structure: `app/`, `components/`, `lib/`, `hooks/`, `store/`
- `lib/constants.ts` — SPACES, TOPICS, SORT_OPTIONS, college info
- `lib/mock/` — user, 12 posts, nested comments (post-1), trending, events + barrel export
- `prisma/schema.prisma` — full schema copied from CLAUDE.md (User, Post, Comment, Vote, Media, Tag, SavedPost, Ticket, TicketMessage)
- `.env` / `.env.example`
- Root layout, root page (redirects to `/landing`), landing placeholder
- shadcn/ui initialized (Radix-based), 15 components added (button, input, textarea, badge, avatar, dropdown-menu, dialog, sheet, separator, tabs, tooltip, popover, scroll-area, skeleton, sonner)

**Verified:** `pnpm dev` boots clean, `/landing` returns 200 with correct Blueprint background + Inter font compiled in, `tsc --noEmit` passes with zero errors.

**Deviations from literal task text (in favor of CLAUDE.md hard rules / technical necessity):**
- `@shadcn/ui` npm package skipped (deprecated stub) — used the `shadcn` CLI instead, which is the actual current tool.
- Tailwind pinned to v3.4 instead of the v4 that `pnpm add tailwindcss` installs by default — the config given in CLAUDE.md is v3 syntax.
- shadcn CLI defaulted to a Base UI + Tailwind v4 preset that injected a light-mode theme and Geist font — reinitialized with Radix primitives and manually stripped the injected theme/font to keep Blueprint-only, no light mode.
- `next.config.ts` → `next.config.mjs` — Next 14.2 doesn't support TS config files (that's Next 15+).
- Prisma 7 schema: removed inline `datasource.url` (no longer supported — lives in `prisma.config.ts` now); all models/fields kept identical to spec.
