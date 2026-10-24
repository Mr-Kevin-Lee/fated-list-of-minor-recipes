import { describe, expect, it } from 'vitest';
import {
  cuisinesFromRecipes,
  difficultiesFromRecipes,
  ingredientNamesFromRecipes,
  migrateRecipe,
  recipesInSeason,
  searchRecipes,
  sortRecipes,
} from './recipes';
import type { Recipe } from '../types';

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: overrides.id ?? '1',
    name: overrides.name ?? 'Test Recipe',
    seasons: overrides.seasons ?? [],
    ingredients: overrides.ingredients ?? [],
    ...overrides,
  };
}

describe('migrateRecipe', () => {
  it('should_return_recipe_unchanged_when_seasons_array_already_present', () => {
    const recipe = makeRecipe({ seasons: ['fall'] });
    expect(migrateRecipe(recipe)).toEqual(recipe);
  });

  it('should_convert_a_legacy_concrete_season_to_a_seasons_array', () => {
    const legacy = { ...makeRecipe(), seasons: undefined, season: 'fall' } as never;
    expect(migrateRecipe(legacy).seasons).toEqual(['fall']);
  });

  it('should_convert_a_legacy_any_season_to_an_empty_seasons_array', () => {
    const legacy = { ...makeRecipe(), seasons: undefined, season: 'any' } as never;
    expect(migrateRecipe(legacy).seasons).toEqual([]);
  });

  it('should_convert_a_missing_legacy_season_to_an_empty_seasons_array', () => {
    const legacy = { ...makeRecipe(), seasons: undefined } as never;
    expect(migrateRecipe(legacy).seasons).toEqual([]);
  });

  it('should_remove_the_legacy_season_field_after_migrating', () => {
    const legacy = { ...makeRecipe(), seasons: undefined, season: 'fall' } as never;
    expect(migrateRecipe(legacy)).not.toHaveProperty('season');
  });
});

describe('sortRecipes', () => {
  it('should_sort_by_name_alphabetically', () => {
    const recipes = [makeRecipe({ name: 'Zucchini' }), makeRecipe({ name: 'Apple' })];
    expect(sortRecipes(recipes, 'name').map((r) => r.name)).toEqual(['Apple', 'Zucchini']);
  });

  it('should_sort_recent_first_when_sort_is_recent', () => {
    const recipes = [
      makeRecipe({ name: 'Older', lastMadeAt: '2024-01-01T00:00:00Z' }),
      makeRecipe({ name: 'Newer', lastMadeAt: '2024-06-01T00:00:00Z' }),
    ];
    expect(sortRecipes(recipes, 'recent').map((r) => r.name)).toEqual(['Newer', 'Older']);
  });

  it('should_put_never_made_recipes_last_when_sort_is_recent', () => {
    const recipes = [
      makeRecipe({ name: 'NeverMade' }),
      makeRecipe({ name: 'Made', lastMadeAt: '2024-01-01T00:00:00Z' }),
    ];
    expect(sortRecipes(recipes, 'recent').map((r) => r.name)).toEqual(['Made', 'NeverMade']);
  });

  it('should_put_never_made_recipes_first_when_sort_is_least_recent', () => {
    const recipes = [
      makeRecipe({ name: 'Made', lastMadeAt: '2024-01-01T00:00:00Z' }),
      makeRecipe({ name: 'NeverMade' }),
    ];
    expect(sortRecipes(recipes, 'least-recent').map((r) => r.name)).toEqual([
      'NeverMade',
      'Made',
    ]);
  });

  it('should_sort_oldest_first_after_never_made_when_sort_is_least_recent', () => {
    const recipes = [
      makeRecipe({ name: 'Newer', lastMadeAt: '2024-06-01T00:00:00Z' }),
      makeRecipe({ name: 'Older', lastMadeAt: '2024-01-01T00:00:00Z' }),
    ];
    expect(sortRecipes(recipes, 'least-recent').map((r) => r.name)).toEqual(['Older', 'Newer']);
  });

  it('should_not_mutate_the_input_array', () => {
    const recipes = [makeRecipe({ name: 'Zucchini' }), makeRecipe({ name: 'Apple' })];
    sortRecipes(recipes, 'name');
    expect(recipes.map((r) => r.name)).toEqual(['Zucchini', 'Apple']);
  });
});

describe('ingredientNamesFromRecipes', () => {
  it('should_dedupe_ingredients_case_insensitively', () => {
    const recipes = [makeRecipe({ ingredients: ['Tomato'] }), makeRecipe({ ingredients: ['tomato'] })];
    expect(ingredientNamesFromRecipes(recipes)).toEqual(['Tomato']);
  });

  it('should_return_ingredients_sorted_alphabetically', () => {
    const recipes = [makeRecipe({ ingredients: ['onion', 'garlic'] })];
    expect(ingredientNamesFromRecipes(recipes)).toEqual(['garlic', 'onion']);
  });
});

describe('recipesInSeason', () => {
  const fallRecipe = makeRecipe({ name: 'Fall', seasons: ['fall'] });
  const anySeasonRecipe = makeRecipe({ name: 'Any', seasons: [] });
  const winterRecipe = makeRecipe({ name: 'Winter', seasons: ['winter'] });
  const recipes = [fallRecipe, anySeasonRecipe, winterRecipe];

  it('should_return_all_recipes_when_filter_is_all', () => {
    expect(recipesInSeason(recipes, 'all')).toEqual(recipes);
  });

  it('should_return_all_recipes_when_filter_is_any', () => {
    expect(recipesInSeason(recipes, 'any')).toEqual(recipes);
  });

  it('should_include_recipes_matching_the_requested_season', () => {
    expect(recipesInSeason(recipes, 'fall')).toContain(fallRecipe);
  });

  it('should_include_any_season_recipes_regardless_of_filter', () => {
    expect(recipesInSeason(recipes, 'fall')).toContain(anySeasonRecipe);
  });

  it('should_exclude_recipes_not_matching_the_requested_season', () => {
    expect(recipesInSeason(recipes, 'fall')).not.toContain(winterRecipe);
  });
});

describe('searchRecipes', () => {
  const recipes = [
    makeRecipe({ id: '1', name: 'Tomato Soup' }),
    makeRecipe({ id: '2', name: 'Pesto Pasta' }),
  ];

  it('should_return_all_recipes_when_query_is_empty', () => {
    expect(searchRecipes(recipes, '')).toEqual(recipes);
  });

  it('should_return_all_recipes_when_query_is_only_whitespace', () => {
    expect(searchRecipes(recipes, '   ')).toEqual(recipes);
  });

  it('should_match_name_substring_case_insensitively', () => {
    expect(searchRecipes(recipes, 'TOMATO').map((r) => r.id)).toEqual(['1']);
  });

  it('should_ignore_surrounding_whitespace_in_query', () => {
    expect(searchRecipes(recipes, '  pesto ').map((r) => r.id)).toEqual(['2']);
  });

  it('should_return_empty_when_nothing_matches', () => {
    expect(searchRecipes(recipes, 'zzz')).toEqual([]);
  });
});

describe('cuisinesFromRecipes', () => {
  it('should_dedupe_cuisines_case_insensitively', () => {
    const recipes = [makeRecipe({ cuisine: 'Italian' }), makeRecipe({ cuisine: 'italian' })];
    expect(cuisinesFromRecipes(recipes)).toEqual(['Italian']);
  });

  it('should_skip_recipes_without_a_cuisine', () => {
    const recipes = [makeRecipe({ cuisine: undefined }), makeRecipe({ cuisine: 'Thai' })];
    expect(cuisinesFromRecipes(recipes)).toEqual(['Thai']);
  });
});

describe('difficultiesFromRecipes', () => {
  it('should_dedupe_difficulties_case_insensitively', () => {
    const recipes = [makeRecipe({ difficulty: 'Easy' }), makeRecipe({ difficulty: 'easy' })];
    expect(difficultiesFromRecipes(recipes)).toEqual(['Easy']);
  });

  it('should_skip_recipes_without_a_difficulty', () => {
    const recipes = [makeRecipe({ difficulty: undefined }), makeRecipe({ difficulty: 'Hard' })];
    expect(difficultiesFromRecipes(recipes)).toEqual(['Hard']);
  });
});
