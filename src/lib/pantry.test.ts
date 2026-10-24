import { describe, expect, it } from 'vitest';
import { addToPantry, getPantry, savePantry, startNewWeek } from './pantry';

describe('pantry', () => {
  it('should_return_an_empty_pantry_when_nothing_stored', async () => {
    expect((await getPantry()).items).toEqual([]);
  });

  it('should_save_and_reload_items', async () => {
    await savePantry(['onion']);
    expect((await getPantry()).items).toEqual(['onion']);
  });

  it('should_stamp_updatedAt_when_saving', async () => {
    const pantry = await savePantry(['onion']);
    expect(Number.isNaN(Date.parse(pantry.updatedAt))).toBe(false);
  });

  it('should_append_new_items', async () => {
    await savePantry(['onion']);
    expect((await addToPantry(['garlic'])).items).toEqual(['onion', 'garlic']);
  });

  it('should_skip_items_already_present_by_normalized_name', async () => {
    await savePantry(['tomato']);
    expect((await addToPantry(['Tomatoes'])).items).toEqual(['tomato']);
  });

  it('should_replace_the_pantry_with_carryover_items_on_new_week', async () => {
    await savePantry(['onion', 'garlic']);
    expect((await startNewWeek(['garlic'])).items).toEqual(['garlic']);
  });
});
