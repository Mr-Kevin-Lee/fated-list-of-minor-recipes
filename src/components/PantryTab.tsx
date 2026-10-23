import { useMemo } from 'react';
import type { MatchSettings, Pantry, Recipe, Season } from '../types';
import { SEASONS } from '../types';
import { recipesInSeason } from '../lib/recipes';
import { matchRecipes } from '../lib/matching';
import IngredientTagInput from './IngredientTagInput';
import MatchResults from './MatchResults';
import SettingsPanel from './SettingsPanel';
import StaplesPanel from './StaplesPanel';

interface PantryTabProps {
  recipes: Recipe[];
  pantry: Pantry;
  onPantryChange: (items: string[]) => void;
  seasonFilter: Season | 'all';
  onSeasonFilterChange: (season: Season | 'all') => void;
  settings: MatchSettings;
  onSettingsChange: (settings: MatchSettings) => void;
  ingredientSuggestions: string[];
  staples: string[];
  onStaplesChange: (staples: string[]) => void;
}

export default function PantryTab({
  recipes,
  pantry,
  onPantryChange,
  seasonFilter,
  onSeasonFilterChange,
  settings,
  onSettingsChange,
  ingredientSuggestions,
  staples,
  onStaplesChange,
}: PantryTabProps) {
  const filteredRecipes = useMemo(
    () => recipesInSeason(recipes, seasonFilter),
    [recipes, seasonFilter],
  );

  const matches = useMemo(
    () => matchRecipes(filteredRecipes, pantry.items, settings, staples),
    [filteredRecipes, pantry.items, settings, staples],
  );

  return (
    <div className="pantry-tab">
      <label>
        <i className="ti ti-basket" aria-hidden="true" /> Pantry
        <IngredientTagInput
          items={pantry.items}
          onChange={onPantryChange}
          suggestions={ingredientSuggestions}
          placeholder="Add what you have…"
        />
      </label>

      <label>
        Season
        <select
          value={seasonFilter}
          onChange={(e) => onSeasonFilterChange(e.target.value as Season | 'all')}
        >
          <option value="all">All seasons</option>
          {SEASONS.filter((s) => s !== 'any').map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <SettingsPanel settings={settings} onChange={onSettingsChange} />

      <StaplesPanel
        staples={staples}
        onChange={onStaplesChange}
        ingredientSuggestions={ingredientSuggestions}
      />

      {recipes.length === 0 ? (
        <p className="empty-state">Add some recipes first, then come back here.</p>
      ) : (
        <MatchResults matches={matches} />
      )}
    </div>
  );
}
