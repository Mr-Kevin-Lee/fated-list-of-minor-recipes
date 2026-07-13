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
- Difficulty is a dropdown (Easy / Medium / Hard, plus a custom fallback for pre-existing non-standard values); Cuisine is free text with autocomplete from previously-used cuisines (Decision #11).
- Link/reference is classified and displayed as a clickable URL, "No-Recipe Recipe" (for the literal value "PBE"), or plain text otherwise, e.g. a cookbook citation (Decision #10).
- No recipe steps/instructions in this version.
- **Bulk import from CSV**: recipes can be imported from a CSV file (e.g. exported from Google Sheets) — the user uploads a file, maps its columns to name/ingredients/season/cuisine/difficulty/link (name and ingredients required, the rest optional), and the app creates recipes from the rows locally in the browser. No network calls or Google account access involved, consistent with the local-only architecture (Decision #6).
- **Sort**: the recipe list can be sorted by Name, Recently used, or Least recently used (Decision #7). Recently/least-recently-used ordering is driven by a `lastMadeAt` timestamp, set whenever a recipe is marked "cooked" on the Weekly Menu (see v2 requirement 8). Recipes never marked cooked sort as "never made" — first under Least recently used, last under Recently used.
- **Filter**: the recipe list can also be filtered by Season, Difficulty, and Cuisine simultaneously (all combine with AND), each populated only with values actually in use across existing recipes (Decision #13). A recipe tagged "Any" season still shows under every season filter, consistent with the Pantry tab's season filter (requirement 4).
- **Spell-check/normalization on entry and import**: ingredient names are checked against the app's existing ingredient vocabulary (and, during CSV import, against other ingredients in the same batch) and corrected to match an existing close spelling — e.g. "onoin" → "onion" — wherever ingredients are entered (Pantry, recipe ingredients, staples) or imported. Cuisine gets the same treatment against previously-used cuisines, plus Title Case. Difficulty is canonicalized case-insensitively against Easy/Medium/Hard on import. CSV import reports what it corrected in its result summary (Decision #14).

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
- **Import a recipe from a URL** (name, ingredients, and link auto-filled) — parked, not scoped yet. Blocked on a real decision about how to fetch the page's content given browser CORS restrictions (arbitrary recipe sites don't allow cross-origin reads), since that fetch strategy is the actual hard part — parsing is straightforward once the HTML is in hand (most recipe sites embed schema.org `Recipe` JSON-LD with `name` and `recipeIngredient` already structured). Options considered: paste-HTML instead of URL (fully local, no network call, but manual); direct `fetch()` (zero dependencies, but fails on most real sites); a public CORS proxy (works broadly, but routes the URL through a third party and adds an external dependency). Revisit when there's an actual recipe URL to import and a clearer sense of which tradeoff matters most in practice.

Also see **v2: Weekly Menu & Grocery List** below — a scoped-out design for the recipe→grocery direction, which is now planned as the next milestone rather than just a loose idea.

## Decisions (resolved)

1. **Ingredient granularity — presence-only.** No quantities/units tracked in v1. Matching answers "do I have this ingredient at all," not "do I have enough of it." Simplest to build, and quantity sufficiency is a much smaller problem than most users hit in practice (you either have basil or you don't).
2. **"Almost makeable" threshold — user-toggleable between "total missing" and "percentage."** Rather than picking one, both modes are supported and the user switches between them (with an underlying number: N for total missing, P% for percentage), defaulting to total missing. Fixed count is simpler to reason about at a glance ("missing 2 things"); percentage scales better across recipes of very different sizes. Since reasonable people disagree on which is more intuitive, it's a toggle instead of a forced choice.
3. **Ingredient name normalization — lowercase/trim/singularize, no synonym list.** Matching (and, per Decision #9, the stored/displayed ingredient text itself) lowercases, trims, and singularizes: "tomato" matches "tomatoes," "avocado" matches "avocados," "berry" matches "berries." Handles common regular pluralization (-ies→-y, -xes/-ches/-shes/-zes/-ses→drop -es, -oes→drop -es, else drop trailing -s unless -ss) but not irregular plurals like "leaves"/"knives" — a full synonym/alias list or real pluralization engine is deferred, since it requires ongoing curation for a benefit that's hard to justify before real usage shows which mismatches actually matter.
4. **Pantry staples — implemented as a user-editable exclusion list, defaulting to a small preset.** Originally deferred for v1 ("every ingredient counts normally, including salt/oil/water"), later built once phantom "missing: salt"-type results were worth addressing. Defaults to salt/pepper/oil/water (editable) rather than starting empty, since these are near-universal and starting with a sensible preset avoids the tedium of the user having to think of and add every obvious staple themselves before the feature is useful.
5. **Quantity contention — not modeled, presence-based only.** If two recipes each want the same 2 tomatoes, both can independently show as "makeable." This is a deliberate simplification: the app is answering "which recipes could I make," not "which recipes could I make simultaneously from this exact Pantry," and resolving contention would require quantities (see Decision #1), which are explicitly out of scope for v1.
6. **Recipe fields for CSV import — keep cuisine, difficulty, and link; drop everything else.** Importing from an existing Google Sheets recipe collection surfaced extra columns (type of dish, cuisine, difficulty, left-overs, link/reference). Type of dish and left-overs are dropped (not useful to this app's purpose). Cuisine and difficulty are kept as optional stored fields even though nothing currently filters/sorts by them, since dropping data during import is one-way — cheap to keep now, costly to have discarded if wanted later. Link/reference is kept and rendered as a clickable link in the recipe list, since pointing back to the original recipe (steps, photos, etc.) directly addresses the "no recipe steps" limitation without violating Decision-to-not-track-steps. Import itself is CSV-based (not a live Google Sheets API connection) with user-driven column mapping, since a live API connection would require OAuth/network calls that conflict with the local-only architecture (see Technical Approach).
7. **Sort control lives in the Recipes tab only**, not also in Pantry match results. Keeps the feature to one place rather than duplicating sort logic/UI across two components; the Recipes tab is the natural home since it's the full-catalog browsing view.
8. **Capitalization is normalized automatically, differently for recipe names vs. ingredients.** Recipe names are Title Cased on save (e.g. "shepherd's pie with gravy" → "Shepherd's Pie With Gravy"); ingredient names are lowercased at the point of entry, in the one shared tag-input component used for Pantry, recipe ingredients, and staples alike. Ingredients are lowercased rather than Title Cased because ingredient lists read more naturally that way (a recipe card listing "Tomatoes, Basil, Mozzarella" reads oddly compared to "tomatoes, basil, mozzarella"), and it keeps them visually distinct from recipe titles.
9. **Ingredient singularization applies to the stored/displayed text, not just matching.** `normalizeIngredient()` (Decision #3) is reused directly as the canonical stored form — typing "avocados" once and "avocado" another time now always stores/displays as "avocado," in the same shared tag-input component from Decision #8. This is a deliberate merge of two previously-separate concerns (a comparison key vs. a display string) into one function, since keeping them separate risked the comparison key and the displayed text quietly disagreeing.
10. **Recipe link field is classified into three display modes: URL, "PBE," or plain text.** A recipe's `link` field can hold an actual URL (rendered as a clickable "View recipe ↗"), the literal value "PBE" (rendered as "No-Recipe Recipe" — shorthand for "play by ear," i.e. no fixed recipe exists), or anything else, e.g. a cookbook name/page reference (rendered as plain, non-clickable text). This avoids turning a cookbook citation into a broken-looking link, and gives "no real recipe, I just wing it" its own honest label instead of a dead link.
11. **Difficulty is a constrained dropdown (Easy/Medium/Hard); Cuisine stays free text with autocomplete.** Difficulty has a small, closed set of meaningful values, so a dropdown prevents drift ("easy" vs. "Easy" vs. "simple"). If an existing recipe has a difficulty value outside the three options (e.g. from CSV import), the dropdown adds it as an extra "(custom)" option rather than silently discarding it on edit. Cuisine is left as free text with a datalist of previously-used cuisines for convenience, since cuisines are open-ended in a way difficulty isn't — a fixed dropdown would inevitably be missing something.
12. **Weekly Menu's "add" button is labeled "+ Add to Menu," distinct from the Recipes tab's "+ Add recipe."** Both tabs had a button reading "+ Add recipe" that did unrelated things (create a brand-new recipe vs. add an existing recipe to this week's menu) — confusing at a glance. Renaming the Weekly Menu one was chosen over renaming the Recipes tab one, since "+ Add recipe" more naturally describes recipe creation.
13. **Recipes tab filters (Season, Difficulty, Cuisine) combine with AND, and only ever list values actually in use.** All three filters can be applied simultaneously (e.g. Winter + Hard + American). Each filter's options are derived from the current recipe set rather than a fixed list, so there's never an empty/dead option to pick (no "Thai" showing up in the Cuisine filter until some recipe actually uses it). A recipe with no cuisine/difficulty set is simply excluded whenever that filter is active, same as any non-matching value.
14. **Spell-check corrects against the app's own vocabulary (edit-distance based), not a dictionary.** Ingredient and cuisine typos are caught by comparing against names already used elsewhere in the app — not a bundled or external word list, which would conflict with the local-only architecture and add real size/maintenance cost for uncertain benefit. Correction uses Levenshtein distance with a threshold scaled to word length (distance ≤ 1 for words of 4 letters or fewer, ≤ 2 otherwise, to avoid false positives like "soy" matching "say"). This means a genuinely new ingredient/cuisine typed for the first time is never "corrected" to something wrong — there's nothing to wrongly match against yet — but it also means a typo's *first* appearance in the app can't be caught, only its second and later ones. Applied uniformly at the same entry points as Decisions #8/#9 (the shared tag-input component) plus CSV import, so the behavior is identical whether typed manually or imported.
15. **Hosting: GitHub Pages via GitHub Actions, chosen over Vercel/Netlify.** All three were viable per the original Technical Approach; GitHub Pages was picked specifically to avoid creating a new account on another service, since it only needs the GitHub account already in use for this repo. Deploys automatically on push to `main` via `.github/workflows/deploy.yml` (build + `actions/deploy-pages`), rather than a manual `gh-pages` branch push, so there's no separate deploy step to remember. Requires the GitHub repo to be named `fated-list-of-minor-recipes` specifically, since Vite's `base` path is hardcoded to match (`/fated-list-of-minor-recipes/`) — GitHub Pages project sites are served at `https://<user>.github.io/<repo-name>/`, not the domain root. The `base` is applied only for production builds (`command === 'build'`), not the dev server, so local development is unaffected. (The repo name was settled on `fated-list-of-minor-recipes` because a remote by that name already existed — a `fated-list` repo was also briefly created via `gh repo create` before this was caught, and can be deleted or left unused.)

## Technical Approach

**Decision: local-only, no backend, for v1.** Single user (you), phone-first usage at/after the farmer's market.

- **App type**: Progressive Web App (PWA) — installable to phone home screen, works offline once loaded.
- **Frontend**: responsive web app (React + Vite, or plain HTML/JS) — no native app / app store involved.
- **Storage**: browser-based (IndexedDB, e.g. via `localForage`). No server, no database to run, no accounts.
- **Hosting**: GitHub Pages (Decision #15), deployed automatically via GitHub Actions on every push to `main`, so it's reachable from the phone anywhere, not just home wifi.
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
   - Recipes can be added to the menu from **either** the Weekly Menu tab's own picker **or** directly from the Recipes tab (Decision: v2 #7) — the Recipes tab shows "+ Add to Menu" per recipe, flipping to a disabled "On Menu ✓" once added, so it's clear at a glance which recipes are already menu'd without switching tabs.
   - Each menu entry displays that recipe's ingredient list (not just its name), so you don't need to flip back to the Recipes tab to see what a menu'd recipe needs (Decision: v2 #7).

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
7. **Adding a recipe to the Weekly Menu, and seeing its ingredients once added, both happen without leaving the Recipes tab context.** Originally, the only way onto the menu was a picker inside the Weekly Menu tab, and menu entries showed only a recipe's name — meaning deciding what to menu required mentally cross-referencing the Recipes tab's ingredient lists from memory. Both flows now surface in both places: a "+ Add to Menu" action per recipe row in the Recipes tab (flipping to a disabled "On Menu ✓" once added, so it's obvious what's already planned without checking the Weekly Menu tab), and each Weekly Menu entry now shows its ingredient list inline. This is purely surfacing existing data in more places, not a new data model or interaction.

## Out of Scope (v1)

- Recipe steps/instructions.
- Multi-week pantry/inventory tracking (carrying over unused groceries) — **superseded for v2**: see "v2: Weekly Menu & Grocery List" above, which adds an explicit "Start New Week" clear with selective carryover from skipped recipes.
- Shopping list generation (working backward from a chosen recipe to a list of what to buy) — **superseded for v2**: see "v2: Weekly Menu & Grocery List" above.
- Nutrition info, meal planning/calendar, multi-user support.
