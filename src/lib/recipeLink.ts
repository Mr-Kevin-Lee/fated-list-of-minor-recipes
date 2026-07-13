export type RecipeLinkKind = 'url' | 'pbe' | 'text';

/** Classifies a recipe's `link` field: an actual URL, "PBE" (play by ear / no recipe), or plain text (e.g. a cookbook reference). */
export function classifyRecipeLink(link: string): RecipeLinkKind {
  const trimmed = link.trim();
  if (trimmed.toLowerCase() === 'pbe') return 'pbe';
  if (/^https?:\/\//i.test(trimmed)) return 'url';
  return 'text';
}
