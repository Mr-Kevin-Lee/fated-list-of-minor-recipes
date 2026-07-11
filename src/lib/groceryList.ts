import { store, KEYS } from './db';
import type { GroceryListItem, Recipe } from '../types';
import { normalizeIngredient } from './matching';

export async function getGroceryList(): Promise<GroceryListItem[]> {
  const list = await store.getItem<GroceryListItem[]>(KEYS.groceryList);
  return list ?? [];
}

async function saveGroceryList(list: GroceryListItem[]): Promise<GroceryListItem[]> {
  await store.setItem(KEYS.groceryList, list);
  return list;
}

/** Adds a recipe's missing ingredients (not already in the Pantry) to the Grocery List, merging with existing entries. */
export async function addIngredientsForRecipe(
  recipe: Recipe,
  pantryItems: string[],
): Promise<GroceryListItem[]> {
  const list = await getGroceryList();
  const pantrySet = new Set(pantryItems.map(normalizeIngredient));
  const missing = recipe.ingredients.filter((ing) => !pantrySet.has(normalizeIngredient(ing)));

  const next = [...list];
  for (const ingredient of missing) {
    const key = normalizeIngredient(ingredient);
    const existing = next.find((item) => normalizeIngredient(item.name) === key);
    if (existing) {
      if (!existing.recipeIds.includes(recipe.id)) existing.recipeIds.push(recipe.id);
    } else {
      next.push({ id: crypto.randomUUID(), name: ingredient, recipeIds: [recipe.id] });
    }
  }
  return saveGroceryList(next);
}

/** Drops a recipe's tag from Grocery List entries, removing entries left with no recipe tags. */
export async function removeRecipeFromGroceryList(recipeId: string): Promise<GroceryListItem[]> {
  const list = await getGroceryList();
  const next = list
    .map((item) => ({ ...item, recipeIds: item.recipeIds.filter((id) => id !== recipeId) }))
    .filter((item) => item.recipeIds.length > 0);
  return saveGroceryList(next);
}

/** Marks an item bought: removes it from the Grocery List. Returns its name so the caller can add it to the Pantry. */
export async function checkOffItem(itemId: string): Promise<{ name: string } | null> {
  const list = await getGroceryList();
  const item = list.find((i) => i.id === itemId);
  if (!item) return null;
  await saveGroceryList(list.filter((i) => i.id !== itemId));
  return { name: item.name };
}
