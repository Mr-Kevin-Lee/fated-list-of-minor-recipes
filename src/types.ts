export type Season = 'spring' | 'summer' | 'fall' | 'winter' | 'any';

export const SEASONS: Season[] = ['spring', 'summer', 'fall', 'winter', 'any'];

/** A recipe's `seasons` field only ever holds concrete seasons — "any" is represented by an empty array, not a value in it. */
export type ConcreteSeason = Exclude<Season, 'any'>;

export const CONCRETE_SEASONS: ConcreteSeason[] = ['spring', 'summer', 'fall', 'winter'];

export interface Recipe {
  id: string;
  name: string;
  /** Which seasons this recipe fits. Empty array = any season (a recipe can belong to several, not just one). */
  seasons: ConcreteSeason[];
  ingredients: string[];
  cuisine?: string;
  difficulty?: string;
  link?: string;
  /** ISO timestamp set when the recipe is marked "cooked" on the Weekly Menu. */
  lastMadeAt?: string;
}

export type RecipeSort = 'name' | 'recent' | 'least-recent';

export interface Pantry {
  updatedAt: string;
  items: string[];
}

export type MatchMode = 'total' | 'percentage';

export interface MatchSettings {
  mode: MatchMode;
  totalThreshold: number;
  percentageThreshold: number;
}

export type MatchStatus = 'makeable' | 'almost' | 'missing';

export interface RecipeMatch {
  recipe: Recipe;
  status: MatchStatus;
  missingIngredients: string[];
}

export type MenuRecipeStatus = 'planned' | 'cooked' | 'skipped';

export interface MenuEntry {
  recipeId: string;
  status: MenuRecipeStatus;
  /** Ingredients chosen to carry over into the Pantry on "Start New Week", set when status becomes 'skipped'. */
  carryoverIngredients: string[];
}

export interface GroceryListItem {
  id: string;
  name: string;
  recipeIds: string[];
}
