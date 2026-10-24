import { describe, expect, it } from 'vitest';
import { getMatchSettings, saveMatchSettings } from './settings';

describe('match settings', () => {
  it('should_return_defaults_when_nothing_stored', async () => {
    expect(await getMatchSettings()).toEqual({
      mode: 'total',
      totalThreshold: 2,
      percentageThreshold: 25,
    });
  });

  it('should_return_saved_settings', async () => {
    const custom = { mode: 'percentage', totalThreshold: 5, percentageThreshold: 40 } as const;
    await saveMatchSettings(custom);
    expect(await getMatchSettings()).toEqual(custom);
  });
});
