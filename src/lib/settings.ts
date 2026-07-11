import { store, KEYS } from './db';
import type { MatchSettings } from '../types';

const DEFAULT_SETTINGS: MatchSettings = {
  mode: 'total',
  totalThreshold: 2,
  percentageThreshold: 25,
};

export async function getMatchSettings(): Promise<MatchSettings> {
  const settings = await store.getItem<MatchSettings>(KEYS.matchSettings);
  return settings ?? DEFAULT_SETTINGS;
}

export async function saveMatchSettings(settings: MatchSettings): Promise<void> {
  await store.setItem(KEYS.matchSettings, settings);
}
