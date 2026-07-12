import { useState } from 'react';
import type { Recipe } from '../types';
import { parseCsv, mapRowsToRecipes, type ParsedCsv, type ColumnMapping } from '../lib/csvImport';

interface ImportCsvProps {
  onImport: (recipes: Omit<Recipe, 'id'>[]) => void;
}

const NONE = '';

function guessColumn(headers: string[], keywords: string[]): string {
  const lower = headers.map((h) => h.toLowerCase());
  for (const keyword of keywords) {
    const index = lower.findIndex((h) => h.includes(keyword));
    if (index !== -1) return headers[index];
  }
  return '';
}

function guessMapping(headers: string[]): ColumnMapping {
  return {
    name: guessColumn(headers, ['recipe name', 'name']),
    ingredients: guessColumn(headers, ['ingredient']),
    season: guessColumn(headers, ['season']),
    cuisine: guessColumn(headers, ['cuisine']),
    difficulty: guessColumn(headers, ['difficulty']),
    link: guessColumn(headers, ['link', 'reference', 'url']),
  };
}

export default function ImportCsv({ onImport }: ImportCsvProps) {
  const [parsed, setParsed] = useState<ParsedCsv | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    name: '',
    ingredients: '',
    season: '',
    cuisine: '',
    difficulty: '',
    link: '',
  });
  const [result, setResult] = useState<string | null>(null);

  async function handleFile(file: File) {
    const text = await file.text();
    const csv = parseCsv(text);
    setParsed(csv);
    setResult(null);
    setMapping(guessMapping(csv.headers));
  }

  function handleImport() {
    if (!parsed) return;
    const { recipes, unrecognizedSeasonRows } = mapRowsToRecipes(parsed.rows, mapping);
    onImport(recipes);
    let message = `Imported ${recipes.length} recipe(s).`;
    if (unrecognizedSeasonRows.length > 0) {
      message += ` Unrecognized season, defaulted to "Any": ${unrecognizedSeasonRows.join(', ')}.`;
    }
    setResult(message);
    setParsed(null);
  }

  function requiredSelect(field: 'name' | 'ingredients', label: string) {
    return (
      <label>
        {label}
        <select value={mapping[field]} onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}>
          {parsed!.headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>
    );
  }

  function optionalSelect(field: 'season' | 'cuisine' | 'difficulty' | 'link', label: string) {
    return (
      <label>
        {label} <span className="optional-tag">(optional)</span>
        <select value={mapping[field]} onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}>
          <option value={NONE}>— none —</option>
          {parsed!.headers.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <details className="import-csv">
      <summary>Import recipes from CSV</summary>
      <div className="import-csv-body">
        <p className="empty-state">
          Export your Google Sheet as CSV (File → Download → Comma Separated Values), then upload
          it here. Ingredients should be comma-separated within their cell.
        </p>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />

        {parsed && (
          <div className="import-mapping">
            {requiredSelect('name', 'Name column')}
            {requiredSelect('ingredients', 'Ingredients column')}
            {optionalSelect('season', 'Season column')}
            {optionalSelect('cuisine', 'Cuisine column')}
            {optionalSelect('difficulty', 'Difficulty column')}
            {optionalSelect('link', 'Link column')}
            <p className="empty-state">{parsed.rows.length} row(s) found.</p>
            <button type="button" onClick={handleImport}>
              Import
            </button>
          </div>
        )}

        {result && <p className="empty-state">{result}</p>}
      </div>
    </details>
  );
}
