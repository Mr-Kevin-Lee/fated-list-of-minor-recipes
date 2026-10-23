const DIFFICULTY_STARS: Record<string, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/** Maps Easy/Medium/Hard to a star count (1-3). Returns null for a custom difficulty value, so callers can fall back to a generic icon. */
export function difficultyStars(difficulty: string): number | null {
  return DIFFICULTY_STARS[difficulty.trim().toLowerCase()] ?? null;
}
