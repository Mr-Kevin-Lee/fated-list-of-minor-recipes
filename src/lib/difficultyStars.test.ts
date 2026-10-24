import { describe, expect, it } from 'vitest';
import { difficultyStars } from './difficultyStars';

describe('difficultyStars', () => {
  it('should_return_one_star_for_easy', () => {
    expect(difficultyStars('Easy')).toBe(1);
  });

  it('should_return_two_stars_for_medium', () => {
    expect(difficultyStars('Medium')).toBe(2);
  });

  it('should_return_three_stars_for_hard', () => {
    expect(difficultyStars('Hard')).toBe(3);
  });

  it('should_match_case_insensitively', () => {
    expect(difficultyStars('easy')).toBe(1);
  });

  it('should_ignore_surrounding_whitespace', () => {
    expect(difficultyStars('  Hard  ')).toBe(3);
  });

  it('should_return_null_for_a_custom_difficulty_value', () => {
    expect(difficultyStars('Weeknight')).toBeNull();
  });
});
