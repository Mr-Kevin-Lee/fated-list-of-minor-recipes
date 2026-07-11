# Recipe & Grocery Planner — Spec

## Problem

After a farmer's market trip, it's hard to know what to cook with what you bought. This app flips the usual "pick a recipe, then shop" flow: you tell it what you bought, and it tells you what recipes are within reach — fully makeable, almost makeable (missing a few things), or not close — so produce can be bought first, without a recipe already in mind.

## Core Concepts

- **Recipe**: a name, a season tag (or "any season"), and a list of ingredients. No steps/instructions for now.
- **Ingredient**: identified by name only — presence/absence, not quantity. A recipe lists "flour," not "2 cups flour." (Resolved — see Decisions #1.)
- **Pantry/Haul**: the list of groceries entered for the current week. Represents what's on hand right now, not a running inventory across weeks.

## Functional Requirements

### 1. Recipe management
- Add, edit, and delete recipes.
- Each recipe has: name, season (Spring / Summer / Fall / Winter / Any), and a list of ingredients (names only — no quantities/units).
- No recipe steps/instructions in this version.

### 2. Weekly grocery entry
- User enters the list of groceries bought for the week (a simple list of ingredient names, one trip at a time).
- Entering a new week's list replaces the previous week's list (this is "what I have now," not a cumulative pantry).
- Autocomplete suggestions while typing, sourced from the set of ingredient names already used across existing recipes (see Feature: Autocomplete below).

### 3. Recipe matching
Given the current week's grocery list, classify every recipe (optionally filtered by season, see #4) into one of three buckets:
- **Makeable**: every ingredient in the recipe is present in the grocery list.
- **Almost makeable**: missing count > 0 and missing count is within a user-configurable threshold. The threshold has two modes, toggled by the user (see Decisions #2):
  - **Total missing** (default): missing count ≤ N, where N is a small fixed number (e.g. 2), settable by the user.
  - **Percentage**: missing count ≤ `max(1, ceil(P% × total ingredients))`, where P is settable by the user (e.g. 25%).
- **Missing / not close**: everything else.

For "almost makeable" and "missing" recipes, show which specific ingredients are missing.

Ingredient name matching (grocery entry vs. recipe ingredient) uses simple normalization: lowercase, trim whitespace, strip trailing "s"/"es" for basic plural handling. No synonym/alias list in v1. (Resolved — see Decisions #3.)

Quantity contention (two recipes both wanting the same 2 tomatoes when only 2 were bought) is not modeled — matching is purely presence-based. (Resolved — see Decisions #5.)

### 4. Season filter
- Recipes can be filtered by season (Spring / Summer / Fall / Winter / Any).
- Season filter applies on top of the matching view — e.g. "show me what's makeable this week, in season."
- A recipe tagged "Any" season shows up regardless of the selected season filter.

## Non-Functional / UX Notes

- Primary workflow: open app → enter this week's haul → see Makeable / Almost / Missing lists → optionally filter by season.
- Should be fast to enter groceries (hence autocomplete requirement).
- Ingredient name matching should be case-insensitive and tolerant of minor formatting differences (e.g. "Tomato" vs "tomatoes") — see Open Questions on normalization strategy.

## Future Features (not in this version, but design should not preclude them)

- **Sort by recently used / least recently used recipe** — implies recipes need a "last made" timestamp, updated when a user marks a recipe as made/cooked. This requires adding some notion of "I cooked this" as an action, even though recipe steps aren't tracked.
- **Random recipe picker** — pick a random recipe, optionally scoped to current filters (e.g. random from "Makeable this week" or random from "in season").
- **Ingredient autocomplete based on existing recipe ingredients** (pulled forward into v1 above, since it's needed for a smooth core workflow — flagged here because it was originally listed as a future feature).

## Decisions (resolved)

1. **Ingredient granularity — presence-only.** No quantities/units tracked in v1. Matching answers "do I have this ingredient at all," not "do I have enough of it." Simplest to build, and quantity sufficiency is a much smaller problem than most users hit in practice (you either have basil or you don't).
2. **"Almost makeable" threshold — user-toggleable between "total missing" and "percentage."** Rather than picking one, both modes are supported and the user switches between them (with an underlying number: N for total missing, P% for percentage), defaulting to total missing. Fixed count is simpler to reason about at a glance ("missing 2 things"); percentage scales better across recipes of very different sizes. Since reasonable people disagree on which is more intuitive, it's a toggle instead of a forced choice.
3. **Ingredient name normalization — lowercase/trim/basic pluralization, no synonym list.** Matching lowercases, trims whitespace, and strips a trailing "s"/"es" so "tomato" matches "tomatoes." A full synonym/alias list (e.g. "scallion" = "green onion") is deferred — it requires ongoing manual curation for a benefit that's hard to justify before real usage shows which mismatches actually matter. Users can just enter ingredients consistently with how they wrote the recipe as a workaround.
4. **Pantry staples — skipped for v1.** No staples/exclusion list for now. Every ingredient a recipe lists (including salt, oil, water, etc.) counts normally in matching — if a recipe needs it and it's not in the week's grocery list, it shows as missing. This trades some matching accuracy for a smaller v1 scope; revisit if phantom "missing: salt"-type results prove annoying in practice.
5. **Quantity contention — not modeled, presence-based only.** If two recipes each want the same 2 tomatoes, both can independently show as "makeable." This is a deliberate simplification: the app is answering "which recipes could I make," not "which recipes could I make simultaneously from this exact haul," and resolving contention would require quantities (see Decision #1), which are explicitly out of scope for v1.

## Technical Approach

**Decision: local-only, no backend, for v1.** Single user (you), phone-first usage at/after the farmer's market.

- **App type**: Progressive Web App (PWA) — installable to phone home screen, works offline once loaded.
- **Frontend**: responsive web app (React + Vite, or plain HTML/JS) — no native app / app store involved.
- **Storage**: browser-based (IndexedDB, e.g. via `localForage`). No server, no database to run, no accounts.
- **Hosting**: deployed as a static site (e.g. Vercel/Netlify/GitHub Pages free tier) so it's reachable from the phone anywhere, not just home wifi.
- **Data access seam**: all reads/writes go through a small set of functions (`getRecipes()`, `saveWeeklyHaul()`, etc.) rather than scattering storage calls through the UI. This is the one deliberate abstraction in v1 — it keeps a future migration to a shared backend from requiring a UI rewrite.

**Why local-only**: matches actual current usage (just one person) and avoids the ops burden of running/maintaining a backend for a single user.

**Known tradeoff**: browser storage is tied to one device/browser — no automatic backup, and it can be lost if the browser is reinstalled or data is cleared.

**What this does *not* solve for later**: household/shared use (see Future Features) is a genuine second build when it happens, not an incremental upgrade. The recipe/ingredient schema, matching logic, and UI carry over; a real backend, database, household identity, and multi-user conflict handling (e.g. two people editing the same week's haul) all still need to be built from scratch at that point, plus a one-time migration of existing local data into the shared store. This is a deliberate, informed tradeoff — not designing for it now keeps v1 simple, and the data-access seam above limits how much rework it causes later.

## Out of Scope (v1)

- Recipe steps/instructions.
- Multi-week pantry/inventory tracking (carrying over unused groceries).
- Shopping list generation (working backward from a chosen recipe to a list of what to buy) — this app is explicitly the reverse workflow.
- Nutrition info, meal planning/calendar, multi-user support.
- Pantry staples (salt/oil/water-type exclusion list) — deferred, see Decisions #4.
