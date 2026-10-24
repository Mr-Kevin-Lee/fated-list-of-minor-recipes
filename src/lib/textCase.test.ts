import { describe, expect, it } from 'vitest';
import { titleCase } from './textCase';

describe('titleCase', () => {
  it('should_capitalize_the_first_letter_of_each_word', () => {
    expect(titleCase('tomato basil salad')).toBe('Tomato Basil Salad');
  });

  it('should_lowercase_the_rest_of_each_word', () => {
    expect(titleCase('TOMATO BASIL')).toBe('Tomato Basil');
  });

  it('should_capitalize_after_a_hyphen', () => {
    expect(titleCase('stir-fry noodles')).toBe('Stir-Fry Noodles');
  });

  it('should_trim_surrounding_whitespace', () => {
    expect(titleCase('  pasta salad  ')).toBe('Pasta Salad');
  });
});
