import { describe, expect, it } from 'vitest';
import {
  addRecipeToMenu,
  clearMenu,
  getMenu,
  removeRecipeFromMenu,
  setRecipeStatus,
} from './menu';

describe('menu', () => {
  it('should_return_empty_menu_when_nothing_stored', async () => {
    expect(await getMenu()).toEqual([]);
  });

  it('should_add_a_recipe_as_planned_with_no_carryover', async () => {
    const menu = await addRecipeToMenu('r1');
    expect(menu).toEqual([{ recipeId: 'r1', status: 'planned', carryoverIngredients: [] }]);
  });

  it('should_not_add_the_same_recipe_twice', async () => {
    await addRecipeToMenu('r1');
    expect(await addRecipeToMenu('r1')).toHaveLength(1);
  });

  it('should_persist_added_recipes', async () => {
    await addRecipeToMenu('r1');
    expect(await getMenu()).toHaveLength(1);
  });

  it('should_remove_only_the_given_recipe', async () => {
    await addRecipeToMenu('r1');
    await addRecipeToMenu('r2');
    const menu = await removeRecipeFromMenu('r1');
    expect(menu.map((e) => e.recipeId)).toEqual(['r2']);
  });

  it('should_set_status_and_carryover_on_the_matching_entry', async () => {
    await addRecipeToMenu('r1');
    const menu = await setRecipeStatus('r1', 'skipped', ['onion']);
    expect(menu[0]).toEqual({ recipeId: 'r1', status: 'skipped', carryoverIngredients: ['onion'] });
  });

  it('should_leave_other_entries_untouched_when_setting_status', async () => {
    await addRecipeToMenu('r1');
    await addRecipeToMenu('r2');
    const menu = await setRecipeStatus('r1', 'cooked');
    expect(menu[1].status).toBe('planned');
  });

  it('should_default_carryover_to_empty_when_setting_status', async () => {
    await addRecipeToMenu('r1');
    const menu = await setRecipeStatus('r1', 'cooked');
    expect(menu[0].carryoverIngredients).toEqual([]);
  });

  it('should_empty_the_menu_when_cleared', async () => {
    await addRecipeToMenu('r1');
    expect(await clearMenu()).toEqual([]);
  });
});
