import { describe, expect, it } from 'vitest';
import { classifyRecipeLink } from './recipeLink';

describe('classifyRecipeLink', () => {
  it('should_classify_undefined_as_pbe', () => {
    expect(classifyRecipeLink(undefined)).toBe('pbe');
  });

  it('should_classify_empty_string_as_pbe', () => {
    expect(classifyRecipeLink('   ')).toBe('pbe');
  });

  it('should_classify_the_literal_pbe_case_insensitively', () => {
    expect(classifyRecipeLink('pbe')).toBe('pbe');
  });

  it('should_classify_an_https_url_as_url', () => {
    expect(classifyRecipeLink('https://example.com/recipe')).toBe('url');
  });

  it('should_classify_an_http_url_as_url', () => {
    expect(classifyRecipeLink('http://example.com/recipe')).toBe('url');
  });

  it('should_classify_plain_text_as_text', () => {
    expect(classifyRecipeLink('Thug Kitchen - 165')).toBe('text');
  });
});
