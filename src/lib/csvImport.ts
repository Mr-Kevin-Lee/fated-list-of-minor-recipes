import Papa from 'papaparse';
import type { ConcreteSeason, Recipe } from '../types';
import { CONCRETE_SEASONS } from '../types';
import { titleCase } from './textCase';
import { normalizeIngredient } from './matching';
import { closestMatch } from './spellcheck';

export interface ParsedCsv {
  headers: string[];
  rows: Record<string, string>[];
}

export function parseCsv(fileText: string): ParsedCsv {
  const result = Papa.parse<Record<string, string>>(fileText, {
    header: true,
    skipEmptyLines: true,
  });
  return {
    headers: result.meta.fields ?? [],
    rows: result.data,
  };
}

/** Required: name, ingredients. Optional (empty string = not mapped): season, cuisine, difficulty, link. */
export interface ColumnMapping {
  name: string;
  ingredients: string;
  season: string;
  cuisine: string;
  difficulty: string;
  link: string;
}

/** Existing app vocabulary used to spell-check imported ingredients/cuisines against. */
export interface ImportVocabulary {
  ingredients: string[];
  cuisines: string[];
}

const SEASON_ALIASES: Record<string, ConcreteSeason> = {
  spring: 'spring',
  summer: 'summer',
  fall: 'fall',
  autumn: 'fall',
  winter: 'winter',
};

const ANY_SEASON_TOKENS = new Set(['any', 'all', 'all seasons', '']);

const DIFFICULTY_CANONICAL = ['Easy', 'Medium', 'Hard'];

/**
 * Parses a cell that may list multiple seasons (comma/semicolon/slash-separated), e.g.
 * "Spring, Fall". A recipe can belong to several seasons at once — an empty result means "any
 * season", same as if any token in the cell was literally "any"/"all" (which takes precedence
 * over specific seasons listed alongside it, since it's a superset of them).
 */
function parseSeasons(value: string | undefined): { seasons: ConcreteSeason[]; unrecognized: string[] } {
  const trimmed = (value ?? '').trim();
  if (!trimmed) return { seasons: [], unrecognized: [] };

  const tokens = trimmed.split(/[,/;]+/).map((t) => t.trim()).filter(Boolean);
  const seasons = new Set<ConcreteSeason>();
  const unrecognized: string[] = [];
  let any = false;

  for (const token of tokens) {
    const key = token.toLowerCase();
    if (ANY_SEASON_TOKENS.has(key)) {
      any = true;
      continue;
    }
    const alias = SEASON_ALIASES[key];
    if (alias) {
      seasons.add(alias);
    } else if (CONCRETE_SEASONS.includes(key as ConcreteSeason)) {
      seasons.add(key as ConcreteSeason);
    } else {
      unrecognized.push(token);
    }
  }

  if (any) return { seasons: [], unrecognized };
  return { seasons: Array.from(seasons), unrecognized };
}

/** Matches a free-text difficulty value to Easy/Medium/Hard case-insensitively; leaves anything else as-is (custom). */
function canonicalizeDifficulty(value: string): string {
  const match = DIFFICULTY_CANONICAL.find((d) => d.toLowerCase() === value.trim().toLowerCase());
  return match ?? value.trim();
}

function optionalField(row: Record<string, string>, column: string): string | undefined {
  if (!column) return undefined;
  const value = row[column]?.trim();
  return value || undefined;
}

export interface ImportResult {
  recipes: Omit<Recipe, 'id'>[];
  unrecognizedSeasonTokens: string[];
  /** Near-duplicate spellings spotted during import — flagged for you to check, never auto-changed. */
  possibleTypos: string[];
}

export function mapRowsToRecipes(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  vocabulary: ImportVocabulary = { ingredients: [], cuisines: [] },
): ImportResult {
  const recipes: Omit<Recipe, 'id'>[] = [];
  const unrecognizedSeasonTokens: string[] = [];
  const possibleTypos: string[] = [];

  // Grows as we go, purely so later rows can be flagged against spellings seen earlier in this
  // same file too — never used to rewrite anything, only to spot and report likely near-duplicates.
  const ingredientVocab = [...vocabulary.ingredients];
  const cuisineVocab = [...vocabulary.cuisines];

  for (const row of rows) {
    const rawName = (row[mapping.name] ?? '').trim();
    if (!rawName) continue;
    const name = titleCase(rawName);

    const seenIngredients = new Set<string>();
    const ingredients = (row[mapping.ingredients] ?? '')
      .split(',')
      .map((raw) => {
        const value = normalizeIngredient(raw);
        if (!value) return '';
        const similar = closestMatch(value, ingredientVocab);
        if (similar) {
          possibleTypos.push(`"${value}" looks similar to existing "${similar}" (${name})`);
        }
        if (!ingredientVocab.includes(value)) ingredientVocab.push(value);
        return value;
      })
      .filter((s) => {
        if (!s || seenIngredients.has(s)) return false;
        seenIngredients.add(s);
        return true;
      });

    const { seasons, unrecognized: unrecognizedSeasons } = parseSeasons(
      mapping.season ? row[mapping.season] : undefined,
    );
    for (const token of unrecognizedSeasons) {
      unrecognizedSeasonTokens.push(`"${token}" (${name})`);
    }

    const rawCuisine = optionalField(row, mapping.cuisine);
    let cuisine: string | undefined;
    if (rawCuisine) {
      cuisine = titleCase(rawCuisine);
      const similar = closestMatch(cuisine, cuisineVocab);
      if (similar) {
        possibleTypos.push(`"${cuisine}" cuisine looks similar to existing "${similar}" (${name})`);
      }
      if (!cuisineVocab.includes(cuisine)) cuisineVocab.push(cuisine);
    }

    const rawDifficulty = optionalField(row, mapping.difficulty);
    const difficulty = rawDifficulty ? canonicalizeDifficulty(rawDifficulty) : undefined;

    recipes.push({
      name,
      ingredients,
      seasons,
      cuisine,
      difficulty,
      link: optionalField(row, mapping.link),
    });
  }

  return { recipes, unrecognizedSeasonTokens, possibleTypos };
}
