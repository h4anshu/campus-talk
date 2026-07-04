# CampusVoice — Progress Log

Running log of completed work. One entry per task, most recent first.

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
