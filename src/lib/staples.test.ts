import { describe, expect, it } from 'vitest';
import { getStaples, saveStaples } from './staples';

describe('staples', () => {
  it('should_return_default_staples_when_nothing_stored', async () => {
    expect(await getStaples()).toEqual(['salt', 'pepper', 'oil', 'water']);
  });

  it('should_return_saved_staples', async () => {
    await saveStaples(['flour']);
    expect(await getStaples()).toEqual(['flour']);
  });

  it('should_keep_an_explicitly_emptied_list_instead_of_restoring_defaults', async () => {
    await saveStaples([]);
    expect(await getStaples()).toEqual([]);
  });
});
