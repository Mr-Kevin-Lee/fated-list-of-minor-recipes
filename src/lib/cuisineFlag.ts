const CUISINE_FLAGS: Record<string, string> = {
  american: '🇺🇸',
  mexican: '🇲🇽',
  chinese: '🇨🇳',
  taiwanese: '🇹🇼',
  japanese: '🇯🇵',
  korean: '🇰🇷',
  thai: '🇹🇭',
  vietnamese: '🇻🇳',
  indian: '🇮🇳',
  italian: '🇮🇹',
  french: '🇫🇷',
  spanish: '🇪🇸',
  greek: '🇬🇷',
  turkish: '🇹🇷',
  lebanese: '🇱🇧',
  moroccan: '🇲🇦',
  ethiopian: '🇪🇹',
  peruvian: '🇵🇪',
  brazilian: '🇧🇷',
  jamaican: '🇯🇲',
  german: '🇩🇪',
  british: '🇬🇧',
  irish: '🇮🇪',
  filipino: '🇵🇭',
  indonesian: '🇮🇩',
  malaysian: '🇲🇾',
  portuguese: '🇵🇹',
  russian: '🇷🇺',
  polish: '🇵🇱',
  swedish: '🇸🇪',
  israeli: '🇮🇱',
  egyptian: '🇪🇬',
  cuban: '🇨🇺',
  argentinian: '🇦🇷',
  colombian: '🇨🇴',
};

/** Looks up a flag emoji for a cuisine name, matching on any word in it (e.g. "Mexican American" → 🇲🇽). Returns null if nothing matches, so callers can fall back to a generic icon. */
export function cuisineFlag(cuisine: string): string | null {
  const words = cuisine.toLowerCase().split(/\s+/);
  for (const word of words) {
    const flag = CUISINE_FLAGS[word];
    if (flag) return flag;
  }
  return null;
}
