import { describe, expect, it } from 'vitest';
import { ANY_SEASON_ICONS, seasonIcon } from './seasonIcon';

describe('seasonIcon', () => {
  it('should_return_the_flower_icon_for_spring', () => {
    expect(seasonIcon('spring')).toBe('ti-flower');
  });

  it('should_return_the_sun_icon_for_summer', () => {
    expect(seasonIcon('summer')).toBe('ti-sun');
  });

  it('should_return_the_leaf_icon_for_fall', () => {
    expect(seasonIcon('fall')).toBe('ti-leaf');
  });

  it('should_return_the_snowflake_icon_for_winter', () => {
    expect(seasonIcon('winter')).toBe('ti-snowflake');
  });
});

describe('ANY_SEASON_ICONS', () => {
  it('should_be_the_sun_and_snowflake_icons', () => {
    expect(ANY_SEASON_ICONS).toEqual(['ti-sun', 'ti-snowflake']);
  });
});
