/** Classic edit-distance (insertions/deletions/substitutions) between two strings. */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prevRow = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const currentRow = [i];
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow.push(
        Math.min(
          currentRow[j - 1] + 1, // insertion
          prevRow[j] + 1, // deletion
          prevRow[j - 1] + cost, // substitution
        ),
      );
    }
    prevRow = currentRow;
  }
  return prevRow[b.length];
}

/**
 * Finds a close (likely-typo) match for `value` in `vocabulary`, comparing case-insensitively.
 * Returns the vocabulary entry's own spelling/casing if within the distance threshold, so
 * typos get corrected to match how the word is already spelled elsewhere in the app.
 * Returns undefined if `value` already exactly matches something in vocabulary (no correction
 * needed) or if nothing is close enough (likely a genuinely new word, not a typo).
 */
export function closestMatch(value: string, vocabulary: string[]): string | undefined {
  const lowerValue = value.trim().toLowerCase();
  if (!lowerValue) return undefined;

  let best: string | undefined;
  let bestDistance = Infinity;

  for (const candidate of vocabulary) {
    const lowerCandidate = candidate.trim().toLowerCase();
    if (lowerCandidate === lowerValue) return undefined; // already an exact match, nothing to correct

    const distance = levenshteinDistance(lowerValue, lowerCandidate);
    // Stricter threshold for short words, since a distance of 2 on a 3-letter word is basically a different word.
    const threshold = lowerValue.length <= 4 ? 1 : 2;
    if (distance <= threshold && distance < bestDistance) {
      bestDistance = distance;
      best = candidate;
    }
  }

  return best;
}
