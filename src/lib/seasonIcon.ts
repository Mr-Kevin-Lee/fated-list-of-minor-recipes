import type { ConcreteSeason } from '../types';

const SEASON_ICONS: Record<ConcreteSeason, string> = {
  spring: 'ti-flower',
  summer: 'ti-sun',
  fall: 'ti-leaf',
  winter: 'ti-snowflake',
};

export function seasonIcon(season: ConcreteSeason): string {
  return SEASON_ICONS[season];
}

/** Icons shown for a recipe with no seasons checked ("any season") — summer + winter stand in for the full range. */
export const ANY_SEASON_ICONS = [SEASON_ICONS.summer, SEASON_ICONS.winter];
