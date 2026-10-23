export type RecipeLinkKind = 'url' | 'pbe' | 'text';

/**
 * Classifies a recipe's `link` field: an actual URL, "PBE" (play by ear / no recipe), or plain
 * text (e.g. a cookbook reference). No link recorded defaults to "PBE" — an unlinked recipe is
 * assumed to be one you just play by ear, so blank and the literal "PBE" mean the same thing.
 */
export function classifyRecipeLink(link: string | undefined): RecipeLinkKind {
  const trimmed = (link ?? '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'pbe') return 'pbe';
  if (/^https?:\/\//i.test(trimmed)) return 'url';
  return 'text';
}
