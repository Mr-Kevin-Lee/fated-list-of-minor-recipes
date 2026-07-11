import type { MatchSettings, Recipe, RecipeMatch } from '../types';

/**
 * Lowercase/trim/strip a trailing "s" or "es" so "tomato" matches "tomatoes".
 * Deliberately simple (Decisions #3) — no synonym list in v1.
 */
export function normalizeIngredient(name: string): string {
  let s = name.trim().toLowerCase();
  if (s.endsWith('es')) s = s.slice(0, -2);
  else if (s.endsWith('s')) s = s.slice(0, -1);
  return s;
}

function almostThreshold(settings: MatchSettings, totalIngredients: number): number {
  if (settings.mode === 'total') return settings.totalThreshold;
  return Math.max(1, Math.ceil((settings.percentageThreshold / 100) * totalIngredients));
}

export function matchRecipe(
  recipe: Recipe,
  haulItems: string[],
  settings: MatchSettings,
): RecipeMatch {
  const haulSet = new Set(haulItems.map(normalizeIngredient));
  const missingIngredients = recipe.ingredients.filter(
    (ingredient) => !haulSet.has(normalizeIngredient(ingredient)),
  );

  if (missingIngredients.length === 0) {
    return { recipe, status: 'makeable', missingIngredients: [] };
  }

  const threshold = almostThreshold(settings, recipe.ingredients.length);
  const status = missingIngredients.length <= threshold ? 'almost' : 'missing';
  return { recipe, status, missingIngredients };
}

export function matchRecipes(
  recipes: Recipe[],
  haulItems: string[],
  settings: MatchSettings,
): RecipeMatch[] {
  return recipes.map((recipe) => matchRecipe(recipe, haulItems, settings));
}
