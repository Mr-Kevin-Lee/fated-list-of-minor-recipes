import { store, KEYS } from './db';
import type { MenuEntry, MenuRecipeStatus } from '../types';

export async function getMenu(): Promise<MenuEntry[]> {
  const menu = await store.getItem<MenuEntry[]>(KEYS.weeklyMenu);
  return menu ?? [];
}

async function saveMenu(menu: MenuEntry[]): Promise<MenuEntry[]> {
  await store.setItem(KEYS.weeklyMenu, menu);
  return menu;
}

export async function addRecipeToMenu(recipeId: string): Promise<MenuEntry[]> {
  const menu = await getMenu();
  if (menu.some((entry) => entry.recipeId === recipeId)) return menu;
  return saveMenu([...menu, { recipeId, status: 'planned', carryoverIngredients: [] }]);
}

export async function removeRecipeFromMenu(recipeId: string): Promise<MenuEntry[]> {
  const menu = await getMenu();
  return saveMenu(menu.filter((entry) => entry.recipeId !== recipeId));
}

export async function setRecipeStatus(
  recipeId: string,
  status: MenuRecipeStatus,
  carryoverIngredients: string[] = [],
): Promise<MenuEntry[]> {
  const menu = await getMenu();
  return saveMenu(
    menu.map((entry) =>
      entry.recipeId === recipeId ? { ...entry, status, carryoverIngredients } : entry,
    ),
  );
}

export async function clearMenu(): Promise<MenuEntry[]> {
  return saveMenu([]);
}
