# CampusThread — Full UI/UX Audit

**Method:** Every finding below was verified against **rendered DOM + computed styles** (Chrome DevTools Protocol) at 375 / 768 / 1024 / 1440 / 1920 px, plus WCAG contrast math on the actual Blueprint theme values, plus source review of all pages and components. Findings marked _(measured)_ come from live `getComputedStyle`/`getBoundingClientRect`, not source guesses.

**Severity key:** 🔴 critical (breaks layout / fails a hard rule) · 🟠 moderate (visible/quality/a11y) · 🟡 minor (polish/consistency).

---

## 0. Hero Section — root-cause investigation (priority per request)

The Hero has been "reported broken repeatedly." I inspected the **computed** styles to separate authored-vs-effective CSS. Result: **the previously-reported symptoms are now fixed and there is no competing/overridden CSS.** Two *new*, real, measured issues remain (tablet crop + intentional column overlap). Details:

### What is NOT broken (measured, so we stop chasing it)
At 1920×1080 _(measured)_:
- `section` → `height: 1020px` (= `100vh − 60px`), `display:flex`, `align-items:center`, `overflow:hidden`. No `min-height` in play. ✅
- Left column wrapper → `align-self:stretch`, `height:1020px`, `display:flex`, `flex-direction:column`, `justify-content:center`. Text is **perfectly centered: `gapAbove = gapBelow = 284px`** (identical at 1440: 194/194; 1024: 147/147; 768: 257/257). ✅
- `<img>` → `object-fit:cover` and `object-position:50% 0%` are applied **to the `<img>` element itself** (the correct element), not a wrapper. `max-height:none`. ✅
- No duplicate/conflicting rules from `globals.css` (globals only sets `box-sizing`, `margin/padding:0`, body font, scrollbar, focus ring — none touch the hero). No inline style fighting a class. **The "authored vs computed" gap that caused earlier confusion is gone.**

**Conclusion:** the illustration sizing/alignment root cause was the earlier combination of `object-position:bottom` (cropped faces) + `min-height` growth. Both are already corrected. Do **not** re-touch centering or object-fit.

### 🟠 HERO-1 — Illustration is heavily cropped at tablet widths _(measured)_
`object-cover` on a **square** source (1254×1254) inside a fixed `w-[56%]` column that becomes tall-and-narrow at ≤1024px:
- 1920px: shows 98% of source width ✅
- 1440px: shows 89% ✅
- 1024px: shows **75%** 🟠 (edge students clipping)
- 768px: shows **44.6%** 🔴 within-Hero (both side students cut off; only the center girl survives)

**Root cause:** column width in `%` + square image + `object-cover` → at portrait-ish column aspect ratios cover crops the horizontal axis. File: `components/landing/Hero.tsx:88` (`w-[56%] lg:w-[52%]`) and `:92` (`object-cover`).
**Fix:** either (a) gate the whole illustration column to `lg:` only and stack/hide on `md` (cleanest — `md` becomes single-column like mobile), or (b) add `object-[50%_0%]` is already fine but widen the column at md (`md:w-[62%] lg:w-[52%]`) and/or set `object-position` to keep the trio centered. Recommended: **hide illustration below `lg` (1024)**, show it only `lg:block`, and let `md` render the left column full-width. This also removes HERO-3.

### 🟡 HERO-2 — Deliberate 52% + 56% column overlap relies entirely on the fade _(measured)_
Left text col is `md:w-[52%]`, illustration is `w-[56%]` → they sum to 108%, so the text's right edge sits **inside** the illustration box (overlap: 92px @1920, 63px @768, 49px @1024 _(measured)_). It looks fine today only because of the left gradient fade. At `md` (768) the overlap zone tightens and the faded students edge close to the paragraph.
**Root cause:** intentional overlap for the bleed effect; brittle at small `md`. File: `Hero.tsx:88` + `:136`.
**Fix:** folded into HERO-1 (illustration `lg:` only). If keeping `md`, drop to `md:w-[50%]` text + `w-[50%]` image.

---

## 1. 🔴 Global — Horizontal overflow on mobile (violates CLAUDE.md "375px" hard rule)

### 🔴 NAV-1 — Navbar overflows ~80px at ≤420px on **every** authed page _(measured)_
At 375px _(measured)_: header children render logo(48) → search(177) → action-cluster(174) with the cluster's right edge at **x=455 in a 375 viewport → 80px horizontal scroll** on `/home`, `/spaces/*`, `/discussions/*`.
**Root cause:** the search `<button>` (`components/layout/Navbar.tsx:99-110`) is `flex w-full max-w-[420px]` with computed `flex: 0 1 auto` but **no `min-width:0`**. A flex item's default `min-width:auto` floors it at its content size ("🔍 Search Campus Thread…"), so it refuses to truncate; combined with `shrink-0` logo + `shrink-0` 174px action cluster + `gap-4` (×2) + `px-6` (48), the min content width ≈455px > 375.
**Fix (precise):**
1. `Navbar.tsx:99` add `min-w-0` to the search button.
2. `Navbar.tsx:104` the inner `<span>` already has `flex-1 truncate`; add `min-w-0` there too so truncation actually engages.
3. `Navbar.tsx:87` tighten mobile chrome: `px-6 gap-4` → `px-3 gap-2 sm:px-6 sm:gap-4`.
4. Optional but recommended: below `sm`, collapse the search to an icon-only button (the text + `Ctrl K` kbd are already `sm:`-gated in spirit) to guarantee headroom.

### 🟠 NAV-2 — Below-fold entrance transform widens the page 6px at 375px _(measured)_
Even the **landing** page has `scrollWidth 381 vs clientWidth 375` at 375px _(measured)_. Offenders: the two `WhyNotWhatsapp` comparison cards, sitting off-screen at their `initial` framer state (`x:+30`) which translates a full-width card 30px past the right edge while it waits for `inView`.
**Root cause:** `components/landing/WhyNotWhatsapp.tsx` section (`:42 <section className="px-6 py-14 md:px-10">`) has **no `overflow-x` clip**, and its cards animate on the **x-axis** (`cardLeft x:-30`, `cardRight x:+30`) while below the fold.
**Fix:** add `overflow-hidden` to the WhyNotWhatsapp `<section>` (`:42`). Audit any other x-axis entrance sections the same way (Hero already has `overflow-hidden`; Spaces/Topics use y-axis so they're safe).

---

## 2. 🟠 Accessibility — WCAG AA contrast (systemic, measured against real theme values)

Computed with sRGB relative luminance. AA needs **4.5** (normal text), **3.0** (large ≥18px / UI).

| Token / pair | Ratio | Verdict | Where it's used |
|---|---|---|---|
| `--text-primary #F0F2FA` on page/surface | 17.2 / 15.6 | ✅ AAA | headings/body |
| `--text-secondary #9EA3B8` on page/card | 7.7 / 6.96 | ✅ AA/AAA | labels, subtitles |
| **`--text-muted #6B7190` on page** | **4.02** | 🟠 **FAIL** | see below |
| **`--text-muted` on surface/card #161929** | **3.64** | 🟠 **FAIL** | " |
| **`--text-muted` on elevated / panel** | **3.5 / 3.21** | 🟠 **FAIL** | dropdowns, inputs |
| **`--danger #DC3545` on page / card** | **4.25 / 3.85** | 🟠 **FAIL** | badges, "Log out" |
| **white on `--accent #4D8EF5`** | **3.23** | 🟠 **FAIL** | unread pills |
| white on `--accent-fill #1D4ED8` | 6.7 | ✅ AA | primary buttons |
| `--success` / `--warning` on page | 7.5 / 6.0 | ✅ | RSVP/status |

### 🟠 A11Y-1 — `--text-muted` fails AA everywhere and is used **153×** _(measured count)_
It's the color for **post body previews** (`PostCard.tsx:54`, `EventCard.tsx:64`, all space cards — 11px), meta rows, empty-state descriptions (`EmptyState.tsx:15`), sidebar labels, form hints. All 11–13px → all fail 4.5.
**Root cause:** `--text-muted:#6B7190` (`app/globals.css:28`) sits at ~3.2–4.0 on the dark surfaces.
**Fix (single source):** raise to **≥ `#868CAB`** (≈4.5 on `#161929`) — or, more conservatively, **stop using `--text-muted` for reading text**: swap body-preview/description usages to `--text-secondary` (which passes at 6.96) and keep `--text-muted` only for non-essential 1-word labels. Cheapest high-impact move: bump the variable value in `globals.css:28`; it cascades to all 153 sites at once.

### 🟠 A11Y-2 — `--danger` fails on cards; white-on-accent fails on pills
- `DC3545` at 3.85 on cards: `Navbar.tsx:234` "Log out", danger badges. **Fix:** brighten danger to ~`#F26571` for text/small use, or only use it behind large icons.
- White on solid `--accent #4D8EF5` (3.23): unread count pills `LeftSidebar.tsx:42`, `NavBadge` uses `--danger` bg (also low). **Fix:** use `--accent-fill` (#1D4ED8 → 6.7) as the pill background instead of `--accent`.

### 🟠 A11Y-3 — 58 uses of sub-11px text violate the project's own 11px floor _(measured count)_
CLAUDE.md §4 mandates "minimum 11px." `grep` finds **58** `text-[9px]`/`text-[10px]` occurrences: `LeftSidebar.tsx:94` (9px "Current View"), section headers (`:124,:142` 10px), `Navbar` nav badges (9px), `RightSidebar` labels (10px, `:30,:48,:69,:79,:91,:94`), `kbd` (10px). At 9–10px on failing-contrast muted, these are the least legible elements in the app.
**Fix:** raise the smallest tier to 11px; reserve 10px only for count badges on solid fills.

---

## 3. 🟠 Layout consistency

### 🟠 LAYOUT-1 — Home feed has no max-width; space/discussion pages do _(measured)_
`components/feed/Feed.tsx:23` renders `px-4 py-4` with **no `max-w` / `mx-auto`**, so on `/home` the post cards stretch the full `flex-1` main column (~1010px at 1440 _(measured)_). Meanwhile `app/(main)/spaces/[space]/page.tsx:59` and `discussions/[topic]` constrain to `max-w-[720px] mx-auto`. Result: identical `PostCard`s render ~720px wide on a space page and ~1010px wide on home — inconsistent line length, home feels unbalanced with the right sidebar.
**Fix:** wrap Feed's content in `mx-auto w-full max-w-[720px]` (mirror the space page), or move the constraint to `app/(main)/layout.tsx` `<main>`.

### 🟡 LAYOUT-2 — Login "Back to landing" is bottom-pinned, floating far from the card
`app/(auth)/login/page.tsx:86` uses `absolute bottom-6` while the card is vertically centered → on a 1440-tall screen there's a large void between them _(measured screenshot)_. Acceptable but reads as disconnected.
**Fix:** either place the link directly under the card (in flow, `mt-6`) or keep absolute but it's low priority.

---

## 4. 🟡 Theme-variable hygiene

### 🟡 THEME-1 — Hardcoded `emerald-500` violates "blue-only accent" rule
`components/layout/RightSidebar.tsx:88-89` — the "Live Pulse" ping dot uses `bg-emerald-500` (raw Tailwind palette). CLAUDE.md §4 forbids non-theme colors.
**Fix:** `bg-emerald-500` → `bg-[var(--success)]` (both the ping and solid dot).

### 🟡 THEME-2 — Hex literals duplicate theme variables (drift risk)
`#161929` (= `--bg-surface`) appears as a raw literal in `SpacesSection.tsx:147`, `TopicsSection.tsx:88`, `WhyNotWhatsapp.tsx:59`; `#0C0E17` (= `--bg-page`) in `Hero.tsx:83` and the fade gradients. These are correct values but bypass the single source of truth — if the theme shifts, landing drifts.
**Fix:** replace with `bg-[var(--bg-surface)]` / `var(--bg-page)`. (The multi-color space-badge hexes `#7C3AED` etc. are intentional per design and should **stay** as literals — they are not theme tokens.)

---

## 5. 🟡 Animation consistency

### 🟡 ANIM-1 — Hover-lift depth differs between landing and app cards
Landing `SpacesSection.tsx:144` / `TopicsSection.tsx:86` use `whileHover={{ y:-4 }}` + border-glow shadow; in-app `PostCard.tsx:37` and all space cards use `whileHover={{ y:-2 }}` + border-color only. Two different "card hover" languages.
**Fix:** pick one (recommend `y:-3` + subtle border-color for app cards; keep glow for marketing) and document it.

### 🟡 ANIM-2 — Space-page cards don't get the feed's staggered entrance
`components/feed/Feed.tsx:35-44` wraps each `PostCard` in a `motion.div` with `y:10 → 0` stagger. `app/(main)/spaces/[space]/page.tsx:75` renders cards **bare** (no entrance). Same card type, different arrival behavior between /home and /spaces.
**Fix:** extract a shared `<CardListItem index>` motion wrapper (or a `<StaggeredList>`) and use it in both Feed and SpacePage.

### 🟡 ANIM-3 — Two separate count-up implementations
`components/landing/CountUp.tsx` and the inline count-up in `components/landing/StatsBar.tsx:55-62` both hand-roll framer `animate()`. Consolidate StatsBar onto `CountUp` (DRY; already installed).

---

## 6. 🟡 Tech-stack fit

- **NATIVE-SELECT:** `app/(main)/settings/page.tsx:205` uses a native `<select>`; its option list renders in OS chrome (light bg on Windows) — off-theme. shadcn/ui `Select` is available → themed dropdown. 🟡
- **Double focus ring:** global `:focus-visible { outline: 2px solid accent }` (`globals.css:82`) **plus** per-input `focus:border-[var(--accent)]` (settings inputs) can double up. Confirm they compose intentionally; consider `focus-visible:ring` via shadcn tokens. 🟡
- **Magic offset `52px`** repeated across `LeftSidebar.tsx:92`, `RightSidebar.tsx:28`, `Hero.tsx:83` (`100vh-60px`), middleware-independent. Extract a `--nav-h` CSS var to keep sticky math consistent (note Hero currently uses `-60px`, sidebars use `-52px` — a 8px inconsistency that is intentional slack but undocumented). 🟡

---

## 7. Confirmed-good (so we don't regress them)
- No horizontal overflow at **≥768** on any audited page _(measured)_.
- Hero centering + `object-fit`/`object-position` correct and un-overridden _(measured)_.
- `Inter` font loads and applies (`bodyFamily: "Inter, system-ui…"`, `fonts.check` true) _(measured)_.
- All space cards + PostCard consistently use framer-motion (`motion:1` each).
- Theme-var discipline is strong: only **2** raw palette-color usages in the whole app.
- Global focus-visible ring present.

---

## 8. Prioritized Implementation Plan (highest impact → lowest)

> Each step is precise enough to implement without re-investigating. Do them in order; steps 1–3 are the "reported broken" and hard-rule violations.

1. **🔴 NAV-1 — kill mobile navbar overflow.** `Navbar.tsx`: add `min-w-0` to search button (`:99`) and its inner `<span>` (`:104`); change header (`:87`) `px-6 gap-4` → `px-3 gap-2 sm:px-6 sm:gap-4`. Verify `scrollWidth == clientWidth` at 375. *(fixes 80px scroll on all authed pages)*

2. **🔴 NAV-2 — kill 6px page scroll.** `WhyNotWhatsapp.tsx:42`: add `overflow-hidden` to the `<section>`. Re-check landing `scrollWidth` at 375.

3. **🟠 HERO-1/2 — fix tablet crop + overlap in one move.** `Hero.tsx`: change illustration column (`:88`) from `md:block w-[56%]` to **`lg:block w-1/2`** (hidden below lg), and left column (`:136`) `md:w-[52%]` → `lg:w-1/2` with the two-column row switching at `lg:` (`md:flex-row` → `lg:flex-row`). Net: `md` renders single-column (like mobile, no crop), `lg+` shows the full uncropped illustration at 50/50.

4. **🟠 A11Y-1 — global readability.** `globals.css:28`: raise `--text-muted` to `#868CAB` (≥4.5 on cards). Then downgrade the worst offenders individually: `PostCard.tsx:54`, `EventCard.tsx:64` (+ other space cards' body preview), `EmptyState.tsx:15` → use `--text-secondary`. *(one variable edit + ~6 targeted swaps)*

5. **🟠 A11Y-3 — enforce 11px floor.** Bump the 58 `text-[9px]/[10px]` sites to `text-[11px]`, except count badges on solid fills. Start with `LeftSidebar.tsx:94,124,142`, `RightSidebar.tsx:30,48,69,79,91,94`, `Navbar` badge.

6. **🟠 A11Y-2 — status/pill contrast.** Brighten `--danger` usage for text (or restrict to large/icon); switch unread pill bg `LeftSidebar.tsx:42` from `--accent` to `--accent-fill`.

7. **🟠 LAYOUT-1 — unify feed width.** `Feed.tsx:23`: wrap list in `mx-auto w-full max-w-[720px]` to match space/discussion pages.

8. **🟡 THEME-1/2 — variable hygiene.** `RightSidebar.tsx:88-89` emerald → `var(--success)`; replace `#161929`/`#0C0E17` literals in landing with `var(--bg-surface)`/`var(--bg-page)` (keep the intentional badge hexes).

9. **🟡 ANIM-2/3 — consistency.** Extract a shared staggered motion list wrapper; use in `Feed.tsx` + `SpacePage`. Point `StatsBar` at `CountUp.tsx`.

10. **🟡 ANIM-1, NATIVE-SELECT, LAYOUT-2, focus-ring, `--nav-h`.** Normalize hover-lift to one value; swap settings `<select>` to shadcn `Select`; move login link in-flow; extract `--nav-h` var (and reconcile the 52 vs 60 slack).

**Definition of done:** `scrollWidth == clientWidth` at 375/768/1024/1440/1920 on landing + all authed pages; every reading-text/background pair ≥ 4.5 (UI/large ≥ 3.0); no `text-[9/10px]` on body text; zero raw palette colors; hero illustration uncropped at lg+ and cleanly hidden below it; identical card entrance/hover across home and space pages.
