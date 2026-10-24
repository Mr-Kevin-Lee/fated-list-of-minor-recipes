import { describe, expect, it } from 'vitest';
import { mapRowsToRecipes, parseCsv, type ColumnMapping } from './csvImport';

const baseMapping: ColumnMapping = {
  name: 'Name',
  ingredients: 'Ingredients',
  season: 'Season',
  cuisine: 'Cuisine',
  difficulty: 'Difficulty',
  link: 'Link',
};

describe('parseCsv', () => {
  it('should_parse_headers_from_the_first_row', () => {
    const result = parseCsv('Name,Ingredients\nTomato Soup,tomato');
    expect(result.headers).toEqual(['Name', 'Ingredients']);
  });

  it('should_parse_each_data_row_into_a_record_keyed_by_header', () => {
    const result = parseCsv('Name,Ingredients\nTomato Soup,tomato');
    expect(result.rows).toEqual([{ Name: 'Tomato Soup', Ingredients: 'tomato' }]);
  });
});

describe('mapRowsToRecipes', () => {
  it('should_skip_rows_with_no_name', () => {
    const rows = [{ Name: '', Ingredients: 'tomato' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes).toHaveLength(0);
  });

  it('should_import_rows_with_no_ingredients_as_an_empty_list', () => {
    const rows = [{ Name: 'Soup', Ingredients: '' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].ingredients).toEqual([]);
  });

  it('should_title_case_the_recipe_name', () => {
    const rows = [{ Name: 'tomato soup', Ingredients: 'tomato' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].name).toBe('Tomato Soup');
  });

  it('should_normalize_and_dedupe_ingredients', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'Tomatoes, tomato, onion' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].ingredients).toEqual(['tomato', 'onion']);
  });

  it('should_parse_multiple_seasons_separated_by_commas', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Season: 'Fall, Winter' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].seasons).toEqual(['fall', 'winter']);
  });

  it('should_parse_seasons_separated_by_slashes', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Season: 'Fall/Winter' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].seasons).toEqual(['fall', 'winter']);
  });

  it('should_treat_any_as_an_empty_seasons_array', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Season: 'any' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].seasons).toEqual([]);
  });

  it('should_let_any_take_precedence_over_specific_seasons_in_the_same_cell', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Season: 'Fall, any' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].seasons).toEqual([]);
  });

  it('should_flag_unrecognized_season_tokens', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Season: 'Sring' }];
    const { unrecognizedSeasonTokens } = mapRowsToRecipes(rows, baseMapping);
    expect(unrecognizedSeasonTokens).toEqual(['"Sring" (Soup)']);
  });

  it('should_not_include_unrecognized_season_tokens_in_the_seasons_array', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Season: 'Sring' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].seasons).toEqual([]);
  });

  it('should_title_case_the_cuisine', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Cuisine: 'italian' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].cuisine).toBe('Italian');
  });

  it('should_canonicalize_difficulty_case_insensitively', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Difficulty: 'easy' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].difficulty).toBe('Easy');
  });

  it('should_pass_through_a_custom_difficulty_value_unchanged', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Difficulty: 'Weeknight' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].difficulty).toBe('Weeknight');
  });

  it('should_leave_the_link_undefined_when_blank', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Link: '' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].link).toBeUndefined();
  });

  it('should_trim_the_link_value', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Link: '  https://example.com  ' }];
    const { recipes } = mapRowsToRecipes(rows, baseMapping);
    expect(recipes[0].link).toBe('https://example.com');
  });

  it('should_flag_a_possible_ingredient_typo_without_changing_the_imported_value', () => {
    const rows = [{ Name: 'Soup', Ingredients: 'seseame oil' }];
    const { recipes, possibleTypos } = mapRowsToRecipes(rows, baseMapping, {
      ingredients: ['sesame oil'],
      cuisines: [],
    });
    expect(recipes[0].ingredients).toEqual(['seseame oil']);
    expect(possibleTypos).toEqual([
      '"seseame oil" looks similar to existing "sesame oil" (Soup)',
    ]);
  });

  it('should_leave_an_unmapped_optional_column_undefined', () => {
    const mappingWithoutLink: ColumnMapping = { ...baseMapping, link: '' };
    const rows = [{ Name: 'Soup', Ingredients: 'tomato', Link: 'https://example.com' }];
    const { recipes } = mapRowsToRecipes(rows, mappingWithoutLink);
    expect(recipes[0].link).toBeUndefined();
  });
});
