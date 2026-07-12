import type { MatchSettings, Recipe, RecipeMatch } from '../types';

/**
 * Lowercase/trim + singularize, so "tomato" matches "tomatoes" and "avocado" matches "avocados".
 * Also used directly as the canonical stored/displayed form for ingredient names (Decision #9) —
 * not just a comparison key — so results need to look like real words, not just be consistent.
 * Handles common regular pluralization (-ies→-y, -xes/-ches/-shes/-zes/-ses→drop -es, -oes→drop -es,
 * else drop trailing -s unless -ss). Deliberately simple otherwise (Decisions #3) — no synonym list,
 * and irregular plurals like "leaves"/"knives" aren't special-cased.
 */
export function normalizeIngredient(name: string): string {
  const s = name.trim().toLowerCase();
  if (s.endsWith('ies') && s.length > 3) return s.slice(0, -3) + 'y';
  if (/(?:ches|shes|xes|zes|ses)$/.test(s)) return s.slice(0, -2);
  if (s.endsWith('oes')) return s.slice(0, -2);
  if (s.endsWith('s') && !s.endsWith('ss')) return s.slice(0, -1);
  return s;
}

function almostThreshold(settings: MatchSettings, totalIngredients: number): number {
  if (settings.mode === 'total') return settings.totalThreshold;
  return Math.max(1, Math.ceil((settings.percentageThreshold / 100) * totalIngredients));
}

/** Ingredients on the staples list are excluded from matching entirely (Decision #4). */
function nonStapleIngredients(recipe: Recipe, staples: string[]): string[] {
  const stapleSet = new Set(staples.map(normalizeIngredient));
  return recipe.ingredients.filter((ingredient) => !stapleSet.has(normalizeIngredient(ingredient)));
}

export function matchRecipe(
  recipe: Recipe,
  haulItems: string[],
  settings: MatchSettings,
  staples: string[] = [],
): RecipeMatch {
  const haulSet = new Set(haulItems.map(normalizeIngredient));
  const ingredients = nonStapleIngredients(recipe, staples);
  const missingIngredients = ingredients.filter(
    (ingredient) => !haulSet.has(normalizeIngredient(ingredient)),
  );

  if (missingIngredients.length === 0) {
    return { recipe, status: 'makeable', missingIngredients: [] };
  }

  const threshold = almostThreshold(settings, ingredients.length);
  const status = missingIngredients.length <= threshold ? 'almost' : 'missing';
  return { recipe, status, missingIngredients };
}

export function matchRecipes(
  recipes: Recipe[],
  haulItems: string[],
  settings: MatchSettings,
  staples: string[] = [],
): RecipeMatch[] {
  return recipes.map((recipe) => matchRecipe(recipe, haulItems, settings, staples));
}
