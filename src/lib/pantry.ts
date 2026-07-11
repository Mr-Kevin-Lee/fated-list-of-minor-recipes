import { store, KEYS } from './db';
import type { Pantry } from '../types';
import { normalizeIngredient } from './matching';

export async function getPantry(): Promise<Pantry> {
  const pantry = await store.getItem<Pantry>(KEYS.pantry);
  return pantry ?? { updatedAt: new Date().toISOString(), items: [] };
}

export async function savePantry(items: string[]): Promise<Pantry> {
  const pantry: Pantry = { updatedAt: new Date().toISOString(), items };
  await store.setItem(KEYS.pantry, pantry);
  return pantry;
}

/** Adds items to the current Pantry, skipping ones already present (by normalized name). */
export async function addToPantry(newItems: string[]): Promise<Pantry> {
  const pantry = await getPantry();
  const existing = new Set(pantry.items.map(normalizeIngredient));
  const additions = newItems.filter((item) => !existing.has(normalizeIngredient(item)));
  return savePantry([...pantry.items, ...additions]);
}

/** Clears the Pantry down to just the given carryover items ("Start New Week"). */
export async function startNewWeek(carryoverItems: string[]): Promise<Pantry> {
  return savePantry(carryoverItems);
}
