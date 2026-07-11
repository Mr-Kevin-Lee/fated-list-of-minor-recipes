import { useMemo } from 'react';
import type { MatchSettings, Pantry, Recipe, Season } from '../types';
import { SEASONS } from '../types';
import { recipesInSeason } from '../lib/recipes';
import { matchRecipes } from '../lib/matching';
import IngredientTagInput from './IngredientTagInput';
import MatchResults from './MatchResults';
import SettingsPanel from './SettingsPanel';

interface PantryTabProps {
  recipes: Recipe[];
  pantry: Pantry;
  onPantryChange: (items: string[]) => void;
  seasonFilter: Season | 'all';
  onSeasonFilterChange: (season: Season | 'all') => void;
  settings: MatchSettings;
  onSettingsChange: (settings: MatchSettings) => void;
  ingredientSuggestions: string[];
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
}: PantryTabProps) {
  const filteredRecipes = useMemo(
    () => recipesInSeason(recipes, seasonFilter),
    [recipes, seasonFilter],
  );

  const matches = useMemo(
    () => matchRecipes(filteredRecipes, pantry.items, settings),
    [filteredRecipes, pantry.items, settings],
  );

  return (
    <div className="pantry-tab">
      <label>
        Pantry
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

      {recipes.length === 0 ? (
        <p className="empty-state">Add some recipes first, then come back here.</p>
      ) : (
        <MatchResults matches={matches} />
      )}
    </div>
  );
}
