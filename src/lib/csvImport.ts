import Papa from 'papaparse';
import type { Recipe, Season } from '../types';
import { SEASONS } from '../types';
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

const SEASON_ALIASES: Record<string, Season> = {
  spring: 'spring',
  summer: 'summer',
  fall: 'fall',
  autumn: 'fall',
  winter: 'winter',
  any: 'any',
  all: 'any',
  'all seasons': 'any',
  '': 'any',
};

const DIFFICULTY_CANONICAL = ['Easy', 'Medium', 'Hard'];

function normalizeSeason(value: string | undefined): { season: Season; recognized: boolean } {
  const key = (value ?? '').trim().toLowerCase();
  const match = SEASON_ALIASES[key] ?? (SEASONS.includes(key as Season) ? (key as Season) : undefined);
  if (match) return { season: match, recognized: true };
  return { season: 'any', recognized: key === '' };
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
  unrecognizedSeasonRows: string[];
  corrections: string[];
}

export function mapRowsToRecipes(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
  vocabulary: ImportVocabulary = { ingredients: [], cuisines: [] },
): ImportResult {
  const recipes: Omit<Recipe, 'id'>[] = [];
  const unrecognizedSeasonRows: string[] = [];
  const corrections: string[] = [];

  // Grows as we go, so later rows in the same file benefit from spellings fixed in earlier rows too.
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
        const normalized = normalizeIngredient(raw);
        if (!normalized) return '';
        const corrected = closestMatch(normalized, ingredientVocab);
        if (corrected && corrected !== normalized) {
          corrections.push(`"${normalized}" → "${corrected}" (${name})`);
        }
        const final = corrected ?? normalized;
        if (!ingredientVocab.includes(final)) ingredientVocab.push(final);
        return final;
      })
      .filter((s) => {
        if (!s || seenIngredients.has(s)) return false;
        seenIngredients.add(s);
        return true;
      });
    if (ingredients.length === 0) continue;

    const { season, recognized } = normalizeSeason(mapping.season ? row[mapping.season] : undefined);
    if (mapping.season && !recognized) unrecognizedSeasonRows.push(name);

    let cuisine = optionalField(row, mapping.cuisine);
    if (cuisine) {
      const titled = titleCase(cuisine);
      const corrected = closestMatch(titled, cuisineVocab);
      if (corrected && corrected !== titled) {
        corrections.push(`"${titled}" → "${corrected}" cuisine (${name})`);
      }
      cuisine = corrected ?? titled;
      if (!cuisineVocab.includes(cuisine)) cuisineVocab.push(cuisine);
    }

    const rawDifficulty = optionalField(row, mapping.difficulty);
    const difficulty = rawDifficulty ? canonicalizeDifficulty(rawDifficulty) : undefined;

    recipes.push({
      name,
      ingredients,
      season,
      cuisine,
      difficulty,
      link: optionalField(row, mapping.link),
    });
  }

  return { recipes, unrecognizedSeasonRows, corrections };
}
