# Fated List of Minor Recipes — Spec

## Problem

After a farmer's market trip, it's hard to know what to cook with what you bought. This app flips the usual "pick a recipe, then shop" flow: you tell it what you bought, and it tells you what recipes are within reach — fully makeable, almost makeable (missing a few things), or not close — so produce can be bought first, without a recipe already in mind.

## App Structure

The app is organized around three lists, plus the recipe catalog they all read from:

- **Recipes**: the full catalog of every recipe you've entered (v1).
- **Pantry**: what you currently have on hand (v1). Cleared via an explicit "Start New Week" action (v2) — with the exception of ingredients you've chosen to carry over from skipped recipes (v2).
- **Grocery List**: what you still need to buy (v2), each item tagged with the recipe(s) that need it.
- **Weekly Menu**: which recipes from the catalog you're planning to cook right now (v2), independent of whether they're currently makeable.

v1 covers Recipes + Pantry + matching. v2 (see below) adds Grocery List + Weekly Menu, and the ability to go recipe → grocery list, not just pantry → recipe.

## Core Concepts

- **Recipe**: a name, a season tag (or "any season"), a list of ingredients, and optional cuisine, difficulty, and link/reference fields (Resolved — see Decisions #6). No steps/instructions for now.
- **Ingredient**: identified by name only — presence/absence, not quantity. A recipe lists "flour," not "2 cups flour." (Resolved — see Decisions #1.)
- **Pantry**: the list of groceries you currently have on hand. In v1, this just accumulates with no reset (v1 has no weekly-clear mechanism at all, since that's tied to the skip-carryover concept — see v2's "Start New Week").

## Functional Requirements

### 1. Recipe management
- Add, edit, and delete recipes.
- Each recipe has: name, season (Spring / Summer / Fall / Winter / Any), a list of ingredients (names only — no quantities/units), and optional cuisine, difficulty, and link/reference fields (Decision #6).
- No recipe steps/instructions in this version.
- **Bulk import from CSV**: recipes can be imported from a CSV file (e.g. exported from Google Sheets) — the user uploads a file, maps its columns to name/ingredients/season/cuisine/difficulty/link (name and ingredients required, the rest optional), and the app creates recipes from the rows locally in the browser. No network calls or Google account access involved, consistent with the local-only architecture (Decision #6).
- **Sort**: the recipe list can be sorted by Name, Recently used, or Least recently used (Decision #7). Recently/least-recently-used ordering is driven by a `lastMadeAt` timestamp, set whenever a recipe is marked "cooked" on the Weekly Menu (see v2 requirement 8). Recipes never marked cooked sort as "never made" — first under Least recently used, last under Recently used.

### 2. Pantry entry
- User enters what's currently on hand (a simple list of ingredient names), typically right after a grocery trip.
- Entries just accumulate in the Pantry in v1 — add what you bought, remove what you've used up. (v2 adds an explicit "Start New Week" clearing action, tied to the Weekly Menu — see below.)
- Autocomplete suggestions while typing, sourced from the set of ingredient names already used across existing recipes (see Feature: Autocomplete below).

### 3. Recipe matching
Given the current Pantry contents, classify every recipe (optionally filtered by season, see #4) into one of three buckets:
- **Makeable**: every ingredient in the recipe is present in the Pantry.
- **Almost makeable**: missing count > 0 and missing count is within a user-configurable threshold. The threshold has two modes, toggled by the user (see Decisions #2):
  - **Total missing** (default): missing count ≤ N, where N is a small fixed number (e.g. 2), settable by the user.
  - **Percentage**: missing count ≤ `max(1, ceil(P% × total ingredients))`, where P is settable by the user (e.g. 25%).
- **Missing / not close**: everything else.

For "almost makeable" and "missing" recipes, show which specific ingredients are missing.

Ingredient name matching (Pantry vs. recipe ingredient) uses simple normalization: lowercase, trim whitespace, strip trailing "s"/"es" for basic plural handling. No synonym/alias list in v1. (Resolved — see Decisions #3.)

Quantity contention (two recipes both wanting the same 2 tomatoes when only 2 were bought) is not modeled — matching is purely presence-based. (Resolved — see Decisions #5.)

**Pantry staples** are excluded from matching entirely: a user-editable list (managed from the Pantry tab, defaulting to salt/pepper/oil/water) of ingredients assumed always on hand. Any recipe ingredient matching a staple (same normalization as above) is dropped before computing missing ingredients *and* before computing the "almost makeable" percentage denominator — so a staple never appears as missing, and doesn't inflate a recipe's ingredient count for threshold purposes. Staples are also excluded when adding a recipe's ingredients to the Grocery List (v2 requirement 6), since something always on hand shouldn't show up as something to buy. (Resolved — see Decisions #4, updated from its original "skipped for v1" state.)

### 4. Season filter
- Recipes can be filtered by season (Spring / Summer / Fall / Winter / Any).
- Season filter applies on top of the matching view — e.g. "show me what's makeable this week, in season."
- A recipe tagged "Any" season shows up regardless of the selected season filter.

## Non-Functional / UX Notes

- Primary workflow: open app → enter Pantry contents → see Makeable / Almost / Missing lists → optionally filter by season.
- Should be fast to enter groceries (hence autocomplete requirement).
- Ingredient name matching should be case-insensitive and tolerant of minor formatting differences (e.g. "Tomato" vs "tomatoes") — see Decisions #3 on normalization strategy.

## Future Features (not in this version, but design should not preclude them)

- **Random recipe picker** — pick a random recipe, optionally scoped to current filters (e.g. random from "Makeable this week" or random from "in season").
- **Ingredient autocomplete based on existing recipe ingredients** (pulled forward into v1 above, since it's needed for a smooth core workflow — flagged here because it was originally listed as a future feature).

Also see **v2: Weekly Menu & Grocery List** below — a scoped-out design for the recipe→grocery direction, which is now planned as the next milestone rather than just a loose idea.

## Decisions (resolved)

1. **Ingredient granularity — presence-only.** No quantities/units tracked in v1. Matching answers "do I have this ingredient at all," not "do I have enough of it." Simplest to build, and quantity sufficiency is a much smaller problem than most users hit in practice (you either have basil or you don't).
2. **"Almost makeable" threshold — user-toggleable between "total missing" and "percentage."** Rather than picking one, both modes are supported and the user switches between them (with an underlying number: N for total missing, P% for percentage), defaulting to total missing. Fixed count is simpler to reason about at a glance ("missing 2 things"); percentage scales better across recipes of very different sizes. Since reasonable people disagree on which is more intuitive, it's a toggle instead of a forced choice.
3. **Ingredient name normalization — lowercase/trim/basic pluralization, no synonym list.** Matching lowercases, trims whitespace, and strips a trailing "s"/"es" so "tomato" matches "tomatoes." A full synonym/alias list (e.g. "scallion" = "green onion") is deferred — it requires ongoing manual curation for a benefit that's hard to justify before real usage shows which mismatches actually matter. Users can just enter ingredients consistently with how they wrote the recipe as a workaround.
4. **Pantry staples — implemented as a user-editable exclusion list, defaulting to a small preset.** Originally deferred for v1 ("every ingredient counts normally, including salt/oil/water"), later built once phantom "missing: salt"-type results were worth addressing. Defaults to salt/pepper/oil/water (editable) rather than starting empty, since these are near-universal and starting with a sensible preset avoids the tedium of the user having to think of and add every obvious staple themselves before the feature is useful.
5. **Quantity contention — not modeled, presence-based only.** If two recipes each want the same 2 tomatoes, both can independently show as "makeable." This is a deliberate simplification: the app is answering "which recipes could I make," not "which recipes could I make simultaneously from this exact Pantry," and resolving contention would require quantities (see Decision #1), which are explicitly out of scope for v1.
6. **Recipe fields for CSV import — keep cuisine, difficulty, and link; drop everything else.** Importing from an existing Google Sheets recipe collection surfaced extra columns (type of dish, cuisine, difficulty, left-overs, link/reference). Type of dish and left-overs are dropped (not useful to this app's purpose). Cuisine and difficulty are kept as optional stored fields even though nothing currently filters/sorts by them, since dropping data during import is one-way — cheap to keep now, costly to have discarded if wanted later. Link/reference is kept and rendered as a clickable link in the recipe list, since pointing back to the original recipe (steps, photos, etc.) directly addresses the "no recipe steps" limitation without violating Decision-to-not-track-steps. Import itself is CSV-based (not a live Google Sheets API connection) with user-driven column mapping, since a live API connection would require OAuth/network calls that conflict with the local-only architecture (see Technical Approach).
7. **Sort control lives in the Recipes tab only**, not also in Pantry match results. Keeps the feature to one place rather than duplicating sort logic/UI across two components; the Recipes tab is the natural home since it's the full-catalog browsing view.
8. **Capitalization is normalized automatically, differently for recipe names vs. ingredients.** Recipe names are Title Cased on save (e.g. "shepherd's pie with gravy" → "Shepherd's Pie With Gravy"); ingredient names are lowercased at the point of entry, in the one shared tag-input component used for Pantry, recipe ingredients, and staples alike. This is purely a display/storage consistency fix — matching already normalized casing internally for comparison (Decision #3), so this doesn't change any matching behavior. Ingredients are lowercased rather than Title Cased because ingredient lists read more naturally that way (a recipe card listing "Tomatoes, Basil, Mozzarella" reads oddly compared to "tomatoes, basil, mozzarella"), and it keeps them visually distinct from recipe titles.

## Technical Approach

**Decision: local-only, no backend, for v1.** Single user (you), phone-first usage at/after the farmer's market.

- **App type**: Progressive Web App (PWA) — installable to phone home screen, works offline once loaded.
- **Frontend**: responsive web app (React + Vite, or plain HTML/JS) — no native app / app store involved.
- **Storage**: browser-based (IndexedDB, e.g. via `localForage`). No server, no database to run, no accounts.
- **Hosting**: deployed as a static site (e.g. Vercel/Netlify/GitHub Pages free tier) so it's reachable from the phone anywhere, not just home wifi.
- **Data access seam**: all reads/writes go through a small set of functions (`getRecipes()`, `getPantry()`/`savePantry()`, `getMenu()`/`addRecipeToMenu()`/`setRecipeStatus()`, `getGroceryList()`/`addIngredientsForRecipe()`/`checkOffItem()`, etc.) rather than scattering storage calls through the UI. This is the one deliberate abstraction in v1 — it keeps a future migration to a shared backend from requiring a UI rewrite.

**Why local-only**: matches actual current usage (just one person) and avoids the ops burden of running/maintaining a backend for a single user.

**Known tradeoff**: browser storage is tied to one device/browser — no automatic backup, and it can be lost if the browser is reinstalled or data is cleared.

**What this does *not* solve for later**: household/shared use (see Future Features) is a genuine second build when it happens, not an incremental upgrade. The recipe/ingredient schema, matching logic, and UI carry over; a real backend, database, household identity, and multi-user conflict handling (e.g. two people editing the same Pantry) all still need to be built from scratch at that point, plus a one-time migration of existing local data into the shared store. This is a deliberate, informed tradeoff — not designing for it now keeps v1 simple, and the data-access seam above limits how much rework it causes later.

## v2: Weekly Menu & Grocery List

Scoped as the next milestone after v1 (not part of v1 itself). Adds the recipe → grocery direction alongside v1's existing pantry → recipe flow.

### Core Concepts (additions)

- **Weekly Menu**: a set of recipes you're planning to cook, picked from your full recipe catalog — independent of current makeable/almost/missing status. You can menu a recipe you're missing everything for; that's the point (you're about to go buy for it).
- **Grocery List**: ingredients needed for menu recipes that aren't already in the Pantry, each item showing which recipe(s) requested it. Checking an item off as bought removes it from the Grocery List and adds it to the Pantry in one action.
- **Cooked / Skipped status**: a status per menu recipe (unset / cooked / skipped). Marking cooked updates a "last made" timestamp (feeds the "recently used" sort, requirement 1) and has no effect on the Pantry. Marking **skipped** prompts a carryover choice (see below) — this is the one place cooked/skipped status *does* touch the Pantry.
- **Carryover selection**: when you mark a recipe skipped, you're immediately shown its ingredient list as a checklist (default: all checked) and choose which ones you still actually have. Checked ingredients are flagged to survive the next "Start New Week" clear; unchecked ones are not protected.
- **Start New Week**: an explicit, user-triggered action (not calendar/date-based — there's still no meal planning/calendar system, per Out of Scope) that clears the Pantry down to just the carryover-flagged ingredients from any recipes skipped that cycle, and resets the Weekly Menu to empty.

### Functional Requirements (v2)

5. **Weekly Menu management**
   - Add/remove any recipe to/from the menu, regardless of its current match status.
   - Recipes stay on the menu until removed by the user, or until "Start New Week" clears the whole menu (requirement 9 below).

6. **Recipe → Grocery List**
   - Adding a recipe to the menu offers "add ingredients to grocery list."
   - Only ingredients **not already in the Pantry** are added (Decision: v2 #1).
   - If an ingredient is already on the Grocery List (matched via the same normalization as recipe matching, Decisions #3) from a different recipe, merge into one entry tagged with both recipes rather than creating a duplicate.
   - Removing a recipe from the menu drops its tag from any shared Grocery List entries; an entry with no remaining recipe tags (and not yet bought) is removed.

7. **Grocery List → Pantry**
   - Checking off a Grocery List item marks it bought: it's removed from the Grocery List and added to the Pantry (Decision: v2 #2) — one action, no re-entry.

8. **Cooked / Skipped tracking**
   - Each menu recipe can be marked cooked, skipped, or left unset, independent of the menu itself (Decision: v2 #3).
   - Marking **cooked**: sets the recipe's `lastMadeAt` timestamp (feeds the "recently used" sort, requirement 1); does not modify the Pantry.
   - Marking **skipped**: immediately prompts a per-ingredient checklist for that recipe (default: all checked, Decision v2 #6). Checked ingredients are flagged as carryover, meaning they survive the next "Start New Week" clear (requirement 9).

9. **Start New Week**
   - An explicit action the user triggers whenever they're ready (Decision: v2 #4) — not automatic or date-based.
   - Clears the Pantry entirely, except ingredients flagged as carryover from recipes marked skipped since the last "Start New Week" (Decision: v2 #5).
   - Clears the Weekly Menu back to empty, ready for new selections.
   - Does **not** touch the Grocery List — items still unbought remain to-buy regardless of the week boundary, since the Grocery List isn't a weekly concept.

### Decisions (v2, resolved)

1. **Grocery List shows only missing ingredients**, not the full recipe ingredient list. The point is "what do I need to buy," not a complete recipe checklist.
2. **Checking off a Grocery List item auto-adds it to the Pantry.** One action instead of a separate re-entry step, since re-typing what you just bought would be redundant friction.
3. **Weekly Menu and cooked/skipped are separate concepts.** The menu is the plan ("I'm cooking this"); cooked/skipped is the outcome, set independently. Keeping them separate avoids conflating "planned" with "done," and avoids forcing a status onto every recipe the moment it's menu'd.
4. **Pantry clearing is an explicit "Start New Week" action, not automatic/calendar-based.** You control the timing (e.g. right after a market trip) instead of the app inferring "a week has passed" via dates, which would require a calendar system — explicitly out of scope. This action also resets the Weekly Menu, since a fresh week means a fresh cooking plan.
5. **Carryover choice happens at skip-time, not batched at Start New Week.** When you mark a recipe skipped, you pick which of its ingredients you still have right then, while it's fresh in your mind — rather than asking you to recall it later across possibly several skipped recipes in one end-of-cycle review.
6. **Carryover is selective per-ingredient, defaulting to all-checked.** Skipping a recipe usually means you still have everything for it, so the checklist starts fully checked; you uncheck anything you've since used elsewhere or run out of. More accurate than all-or-nothing, without requiring quantity tracking (still presence-only, per Decision #1).

## Out of Scope (v1)

- Recipe steps/instructions.
- Multi-week pantry/inventory tracking (carrying over unused groceries) — **superseded for v2**: see "v2: Weekly Menu & Grocery List" above, which adds an explicit "Start New Week" clear with selective carryover from skipped recipes.
- Shopping list generation (working backward from a chosen recipe to a list of what to buy) — **superseded for v2**: see "v2: Weekly Menu & Grocery List" above.
- Nutrition info, meal planning/calendar, multi-user support.
