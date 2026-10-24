import { describe, expect, it } from 'vitest';
import { cuisineFlag } from './cuisineFlag';

describe('cuisineFlag', () => {
  it('should_return_the_flag_for_a_known_cuisine', () => {
    expect(cuisineFlag('Japanese')).toBe('🇯🇵');
  });

  it('should_match_case_insensitively', () => {
    expect(cuisineFlag('japanese')).toBe('🇯🇵');
  });

  it('should_match_on_any_word_in_a_compound_cuisine_name', () => {
    expect(cuisineFlag('Mexican American')).toBe('🇲🇽');
  });

  it('should_return_null_for_an_unmapped_cuisine', () => {
    expect(cuisineFlag('Atlantean')).toBeNull();
  });
});
