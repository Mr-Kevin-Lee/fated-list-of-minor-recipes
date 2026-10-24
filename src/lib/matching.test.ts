import { describe, expect, it } from 'vitest';
import { matchRecipe, matchRecipes, normalizeIngredient } from './matching';
import type { MatchSettings, Recipe } from '../types';

function makeRecipe(ingredients: string[]): Recipe {
  return { id: '1', name: 'Test Recipe', seasons: [], ingredients };
}

const totalSettings: MatchSettings = { mode: 'total', totalThreshold: 2, percentageThreshold: 25 };
const percentageSettings: MatchSettings = {
  mode: 'percentage',
  totalThreshold: 2,
  percentageThreshold: 50,
};

describe('normalizeIngredient', () => {
  it('should_lowercase_and_trim', () => {
    expect(normalizeIngredient(' Tomato ')).toBe('tomato');
  });

  it('should_strip_trailing_s', () => {
    expect(normalizeIngredient('onions')).toBe('onion');
  });

  it('should_not_strip_trailing_double_s', () => {
    expect(normalizeIngredient('glass')).toBe('glass');
  });

  it('should_convert_ies_suffix_to_y', () => {
    expect(normalizeIngredient('berries')).toBe('berry');
  });

  it('should_drop_es_after_ches', () => {
    expect(normalizeIngredient('dishes')).toBe('dish');
  });

  it('should_drop_es_after_xes', () => {
    expect(normalizeIngredient('boxes')).toBe('box');
  });

  it('should_drop_es_after_oes', () => {
    expect(normalizeIngredient('potatoes')).toBe('potato');
  });

  it('should_leave_non_plural_words_unchanged', () => {
    expect(normalizeIngredient('rice')).toBe('rice');
  });
});

describe('matchRecipe', () => {
  it('should_be_makeable_when_all_ingredients_present', () => {
    const recipe = makeRecipe(['tomato', 'onion']);
    const result = matchRecipe(recipe, ['tomatoes', 'onions'], totalSettings);
    expect(result.status).toBe('makeable');
  });

  it('should_report_no_missing_ingredients_when_makeable', () => {
    const recipe = makeRecipe(['tomato']);
    const result = matchRecipe(recipe, ['tomato'], totalSettings);
    expect(result.missingIngredients).toEqual([]);
  });

  it('should_be_almost_when_missing_count_is_within_total_threshold', () => {
    const recipe = makeRecipe(['tomato', 'onion', 'garlic', 'salt']);
    const result = matchRecipe(recipe, ['tomato', 'onion'], totalSettings);
    expect(result.status).toBe('almost');
  });

  it('should_be_missing_when_missing_count_exceeds_total_threshold', () => {
    const recipe = makeRecipe(['tomato', 'onion', 'garlic', 'salt', 'pepper']);
    const result = matchRecipe(recipe, [], totalSettings);
    expect(result.status).toBe('missing');
  });

  it('should_exclude_staples_from_missing_ingredients', () => {
    const recipe = makeRecipe(['tomato', 'salt']);
    const result = matchRecipe(recipe, ['tomato'], totalSettings, ['salt']);
    expect(result.status).toBe('makeable');
  });

  it('should_use_percentage_threshold_when_mode_is_percentage', () => {
    const recipe = makeRecipe(['tomato', 'onion', 'garlic', 'salt']);
    const result = matchRecipe(recipe, ['tomato', 'onion'], percentageSettings);
    expect(result.status).toBe('almost');
  });

  it('should_be_missing_when_percentage_threshold_exceeded', () => {
    const recipe = makeRecipe(['tomato', 'onion', 'garlic', 'salt']);
    const result = matchRecipe(recipe, [], percentageSettings);
    expect(result.status).toBe('missing');
  });
});

describe('matchRecipes', () => {
  it('should_match_every_recipe_in_the_list', () => {
    const recipes = [makeRecipe(['tomato']), makeRecipe(['onion'])];
    const results = matchRecipes(recipes, ['tomato', 'onion'], totalSettings);
    expect(results).toHaveLength(2);
  });

  it('should_preserve_recipe_order', () => {
    const recipes = [makeRecipe(['tomato']), makeRecipe(['onion'])];
    const results = matchRecipes(recipes, [], totalSettings);
    expect(results.map((r) => r.recipe)).toEqual(recipes);
  });
});
