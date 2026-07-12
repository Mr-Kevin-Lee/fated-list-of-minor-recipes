import Papa from 'papaparse';
import type { Recipe, Season } from '../types';
import { SEASONS } from '../types';
import { titleCase } from './textCase';
import { normalizeIngredient } from './matching';

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

function normalizeSeason(value: string | undefined): { season: Season; recognized: boolean } {
  const key = (value ?? '').trim().toLowerCase();
  const match = SEASON_ALIASES[key] ?? (SEASONS.includes(key as Season) ? (key as Season) : undefined);
  if (match) return { season: match, recognized: true };
  return { season: 'any', recognized: key === '' };
}

function optionalField(row: Record<string, string>, column: string): string | undefined {
  if (!column) return undefined;
  const value = row[column]?.trim();
  return value || undefined;
}

export interface ImportResult {
  recipes: Omit<Recipe, 'id'>[];
  unrecognizedSeasonRows: string[];
}

export function mapRowsToRecipes(rows: Record<string, string>[], mapping: ColumnMapping): ImportResult {
  const recipes: Omit<Recipe, 'id'>[] = [];
  const unrecognizedSeasonRows: string[] = [];

  for (const row of rows) {
    const rawName = (row[mapping.name] ?? '').trim();
    if (!rawName) continue;
    const name = titleCase(rawName);

    const seenIngredients = new Set<string>();
    const ingredients = (row[mapping.ingredients] ?? '')
      .split(',')
      .map((s) => normalizeIngredient(s))
      .filter((s) => {
        if (!s || seenIngredients.has(s)) return false;
        seenIngredients.add(s);
        return true;
      });
    if (ingredients.length === 0) continue;

    const { season, recognized } = normalizeSeason(mapping.season ? row[mapping.season] : undefined);
    if (mapping.season && !recognized) unrecognizedSeasonRows.push(name);

    recipes.push({
      name,
      ingredients,
      season,
      cuisine: optionalField(row, mapping.cuisine),
      difficulty: optionalField(row, mapping.difficulty),
      link: optionalField(row, mapping.link),
    });
  }

  return { recipes, unrecognizedSeasonRows };
}
