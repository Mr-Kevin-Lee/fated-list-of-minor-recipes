import { store, KEYS } from './db';

const DEFAULT_STAPLES = ['salt', 'pepper', 'oil', 'water'];

export async function getStaples(): Promise<string[]> {
  const staples = await store.getItem<string[]>(KEYS.staples);
  return staples ?? DEFAULT_STAPLES;
}

export async function saveStaples(items: string[]): Promise<string[]> {
  await store.setItem(KEYS.staples, items);
  return items;
}
