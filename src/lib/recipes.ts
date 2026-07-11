import { store, KEYS } from './db';
import type { Recipe, Season } from '../types';

export async function getRecipes(): Promise<Recipe[]> {
  const recipes = await store.getItem<Recipe[]>(KEYS.recipes);
  return recipes ?? [];
}

export async function saveRecipe(recipe: Omit<Recipe, 'id'> & { id?: string }): Promise<Recipe> {
  const recipes = await getRecipes();
  if (recipe.id) {
    const index = recipes.findIndex((r) => r.id === recipe.id);
    if (index === -1) throw new Error(`Recipe not found: ${recipe.id}`);
    const updated: Recipe = { ...recipes[index], ...recipe, id: recipe.id };
    recipes[index] = updated;
    await store.setItem(KEYS.recipes, recipes);
    return updated;
  }
  const created: Recipe = { ...recipe, id: crypto.randomUUID() };
  recipes.push(created);
  await store.setItem(KEYS.recipes, recipes);
  return created;
}

export async function deleteRecipe(id: string): Promise<void> {
  const recipes = await getRecipes();
  await store.setItem(KEYS.recipes, recipes.filter((r) => r.id !== id));
}

export function ingredientNamesFromRecipes(recipes: Recipe[]): string[] {
  const seen = new Map<string, string>();
  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      const key = ingredient.trim().toLowerCase();
      if (key && !seen.has(key)) seen.set(key, ingredient.trim());
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

export function recipesInSeason(recipes: Recipe[], season: Season | 'all'): Recipe[] {
  if (season === 'all') return recipes;
  return recipes.filter((r) => r.season === season || r.season === 'any');
}
