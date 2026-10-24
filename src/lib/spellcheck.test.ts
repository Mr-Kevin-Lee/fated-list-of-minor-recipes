import { describe, expect, it } from 'vitest';
import { closestMatch, levenshteinDistance } from './spellcheck';

describe('levenshteinDistance', () => {
  it('should_return_zero_for_identical_strings', () => {
    expect(levenshteinDistance('onion', 'onion')).toBe(0);
  });

  it('should_return_length_of_b_when_a_is_empty', () => {
    expect(levenshteinDistance('', 'abc')).toBe(3);
  });

  it('should_return_length_of_a_when_b_is_empty', () => {
    expect(levenshteinDistance('abc', '')).toBe(3);
  });

  it('should_count_a_single_substitution_as_distance_one', () => {
    expect(levenshteinDistance('cat', 'cot')).toBe(1);
  });

  it('should_count_a_single_insertion_as_distance_one', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
  });
});

describe('closestMatch', () => {
  it('should_return_undefined_when_value_already_exactly_matches_vocabulary', () => {
    expect(closestMatch('onion', ['Onion', 'garlic'])).toBeUndefined();
  });

  it('should_return_undefined_for_empty_value', () => {
    expect(closestMatch('  ', ['onion'])).toBeUndefined();
  });

  it('should_correct_a_typo_within_threshold_for_long_words', () => {
    expect(closestMatch('seseame oil', ['sesame oil'])).toBe('sesame oil');
  });

  it('should_not_correct_short_words_beyond_distance_one', () => {
    expect(closestMatch('ribs', ['rice'])).toBeUndefined();
  });

  it('should_return_undefined_when_nothing_is_close_enough', () => {
    expect(closestMatch('zucchini', ['onion', 'garlic'])).toBeUndefined();
  });

  it('should_pick_the_closest_candidate_when_multiple_are_within_threshold', () => {
    expect(closestMatch('tomatoo', ['tomato', 'tomatoes'])).toBe('tomato');
  });
});
