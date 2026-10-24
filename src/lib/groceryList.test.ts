import { describe, expect, it } from 'vitest';
import {
  addIngredientsForRecipe,
  checkOffItem,
  getGroceryList,
  removeRecipeFromGroceryList,
} from './groceryList';
import type { Recipe } from '../types';

function makeRecipe(id: string, ingredients: string[]): Recipe {
  return { id, name: id, seasons: [], ingredients };
}

describe('groceryList', () => {
  it('should_return_an_empty_list_when_nothing_stored', async () => {
    expect(await getGroceryList()).toEqual([]);
  });

  it('should_add_ingredients_missing_from_the_pantry', async () => {
    const list = await addIngredientsForRecipe(makeRecipe('r1', ['onion', 'garlic']), ['onion']);
    expect(list.map((i) => i.name)).toEqual(['garlic']);
  });

  it('should_skip_staples', async () => {
    const list = await addIngredientsForRecipe(makeRecipe('r1', ['salt', 'garlic']), [], ['salt']);
    expect(list.map((i) => i.name)).toEqual(['garlic']);
  });

  it('should_tag_new_items_with_the_recipe_id', async () => {
    const list = await addIngredientsForRecipe(makeRecipe('r1', ['garlic']), []);
    expect(list[0].recipeIds).toEqual(['r1']);
  });

  it('should_merge_the_same_ingredient_from_another_recipe', async () => {
    await addIngredientsForRecipe(makeRecipe('r1', ['tomato']), []);
    const list = await addIngredientsForRecipe(makeRecipe('r2', ['Tomatoes']), []);
    expect(list).toHaveLength(1);
    expect(list[0].recipeIds).toEqual(['r1', 'r2']);
  });

  it('should_not_duplicate_a_recipe_tag_when_added_twice', async () => {
    await addIngredientsForRecipe(makeRecipe('r1', ['tomato']), []);
    const list = await addIngredientsForRecipe(makeRecipe('r1', ['tomato']), []);
    expect(list[0].recipeIds).toEqual(['r1']);
  });

  it('should_drop_a_recipe_tag_but_keep_items_other_recipes_need', async () => {
    await addIngredientsForRecipe(makeRecipe('r1', ['tomato']), []);
    await addIngredientsForRecipe(makeRecipe('r2', ['tomato']), []);
    const list = await removeRecipeFromGroceryList('r1');
    expect(list[0].recipeIds).toEqual(['r2']);
  });

  it('should_remove_items_left_with_no_recipe_tags', async () => {
    await addIngredientsForRecipe(makeRecipe('r1', ['tomato']), []);
    expect(await removeRecipeFromGroceryList('r1')).toEqual([]);
  });

  it('should_remove_a_checked_off_item_and_return_its_name', async () => {
    const [item] = await addIngredientsForRecipe(makeRecipe('r1', ['tomato']), []);
    expect(await checkOffItem(item.id)).toEqual({ name: 'tomato' });
    expect(await getGroceryList()).toEqual([]);
  });

  it('should_return_null_when_checking_off_an_unknown_item', async () => {
    expect(await checkOffItem('nope')).toBeNull();
  });
});
