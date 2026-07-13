import { store, KEYS } from './db';
import type { Recipe, RecipeSort, Season } from '../types';

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

/** Sets a recipe's lastMadeAt to now — called when marking a Weekly Menu recipe "cooked". */
export async function touchLastMade(id: string): Promise<Recipe | undefined> {
  const recipes = await getRecipes();
  const index = recipes.findIndex((r) => r.id === id);
  if (index === -1) return undefined;
  const updated: Recipe = { ...recipes[index], lastMadeAt: new Date().toISOString() };
  recipes[index] = updated;
  await store.setItem(KEYS.recipes, recipes);
  return updated;
}

export function sortRecipes(recipes: Recipe[], sort: RecipeSort): Recipe[] {
  const sorted = [...recipes];
  if (sort === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === 'recent') {
    // Most recently cooked first; never-cooked recipes last.
    sorted.sort((a, b) => {
      if (!a.lastMadeAt && !b.lastMadeAt) return 0;
      if (!a.lastMadeAt) return 1;
      if (!b.lastMadeAt) return -1;
      return b.lastMadeAt.localeCompare(a.lastMadeAt);
    });
  } else if (sort === 'least-recent') {
    // Never-cooked recipes first (most "overdue"), then oldest-cooked first.
    sorted.sort((a, b) => {
      if (!a.lastMadeAt && !b.lastMadeAt) return 0;
      if (!a.lastMadeAt) return -1;
      if (!b.lastMadeAt) return 1;
      return a.lastMadeAt.localeCompare(b.lastMadeAt);
    });
  }
  return sorted;
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

export function cuisinesFromRecipes(recipes: Recipe[]): string[] {
  const seen = new Map<string, string>();
  for (const recipe of recipes) {
    if (!recipe.cuisine) continue;
    const key = recipe.cuisine.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, recipe.cuisine.trim());
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}

export function difficultiesFromRecipes(recipes: Recipe[]): string[] {
  const seen = new Map<string, string>();
  for (const recipe of recipes) {
    if (!recipe.difficulty) continue;
    const key = recipe.difficulty.trim().toLowerCase();
    if (key && !seen.has(key)) seen.set(key, recipe.difficulty.trim());
  }
  return Array.from(seen.values()).sort((a, b) => a.localeCompare(b));
}
