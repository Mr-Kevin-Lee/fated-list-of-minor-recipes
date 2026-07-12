/** Capitalizes the first letter of each word (after start/space/hyphen) — for recipe names. */
export function titleCase(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/(^|[\s-])\p{L}/gu, (match) => match.toUpperCase());
}

// Ingredient names are canonicalized via normalizeIngredient() in lib/matching.ts — it already
// lowercases, trims, and singularizes, and is reused directly (not duplicated here) since that
// function's output now doubles as the stored/displayed ingredient text, not just a match key.
