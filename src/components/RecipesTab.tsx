import { useMemo, useState } from 'react';
import type { Recipe, RecipeSort, Season } from '../types';
import { SEASONS } from '../types';
import {
  cuisinesFromRecipes,
  difficultiesFromRecipes,
  recipesInSeason,
  sortRecipes,
} from '../lib/recipes';
import { classifyRecipeLink } from '../lib/recipeLink';
import RecipeForm from './RecipeForm';
import ImportCsv from './ImportCsv';

interface RecipesTabProps {
  recipes: Recipe[];
  ingredientSuggestions: string[];
  menuRecipeIds: Set<string>;
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
  onImport: (recipes: Omit<Recipe, 'id'>[]) => void;
  onAddToMenu: (recipeId: string) => void;
}

export default function RecipesTab({
  recipes,
  ingredientSuggestions,
  menuRecipeIds,
  onSave,
  onDelete,
  onImport,
  onAddToMenu,
}: RecipesTabProps) {
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null);
  const [sort, setSort] = useState<RecipeSort>('name');
  const [seasonFilter, setSeasonFilter] = useState<Season | 'all'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');

  const cuisineSuggestions = useMemo(() => cuisinesFromRecipes(recipes), [recipes]);
  const difficultyOptions = useMemo(() => difficultiesFromRecipes(recipes), [recipes]);
  const cuisineOptions = cuisineSuggestions;

  const filteredRecipes = useMemo(() => {
    let result = recipesInSeason(recipes, seasonFilter);
    if (difficultyFilter !== 'all') {
      result = result.filter(
        (r) => (r.difficulty ?? '').trim().toLowerCase() === difficultyFilter,
      );
    }
    if (cuisineFilter !== 'all') {
      result = result.filter((r) => (r.cuisine ?? '').trim().toLowerCase() === cuisineFilter);
    }
    return result;
  }, [recipes, seasonFilter, difficultyFilter, cuisineFilter]);

  const sortedRecipes = useMemo(() => sortRecipes(filteredRecipes, sort), [filteredRecipes, sort]);

  if (editing) {
    return (
      <RecipeForm
        initial={editing === 'new' ? undefined : editing}
        ingredientSuggestions={ingredientSuggestions}
        cuisineSuggestions={cuisineSuggestions}
        onSave={(recipe) => {
          onSave(recipe);
          setEditing(null);
        }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="recipes-tab">
      <button type="button" onClick={() => setEditing('new')}>
        + Add recipe
      </button>

      <ImportCsv
        onImport={onImport}
        ingredientVocabulary={ingredientSuggestions}
        cuisineVocabulary={cuisineSuggestions}
      />

      {recipes.length > 0 && (
        <div className="recipe-filters">
          <label>
            Sort by
            <select value={sort} onChange={(e) => setSort(e.target.value as RecipeSort)}>
              <option value="name">Name</option>
              <option value="recent">Recently used</option>
              <option value="least-recent">Least recently used</option>
            </select>
          </label>

          <label>
            Season
            <select
              value={seasonFilter}
              onChange={(e) => setSeasonFilter(e.target.value as Season | 'all')}
            >
              <option value="all">All seasons</option>
              {SEASONS.filter((s) => s !== 'any').map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Difficulty
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="all">All difficulties</option>
              {difficultyOptions.map((d) => (
                <option key={d} value={d.toLowerCase()}>
                  {d}
                </option>
              ))}
            </select>
          </label>

          <label>
            Cuisine
            <select value={cuisineFilter} onChange={(e) => setCuisineFilter(e.target.value)}>
              <option value="all">All cuisines</option>
              {cuisineOptions.map((c) => (
                <option key={c} value={c.toLowerCase()}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {recipes.length > 0 && sortedRecipes.length === 0 && (
        <p className="empty-state">No recipes match these filters.</p>
      )}

      {recipes.length === 0 && <p className="empty-state">No recipes yet.</p>}

      <ul className="recipe-list">
        {sortedRecipes.map((recipe) => (
          <li key={recipe.id} className="recipe-list-item">
            <div>
              <strong>{recipe.name}</strong>
              <span className="recipe-season"> · {recipe.season}</span>
              {recipe.cuisine && <span className="recipe-season"> · {recipe.cuisine}</span>}
              {recipe.difficulty && <span className="recipe-season"> · {recipe.difficulty}</span>}
              {sort !== 'name' && (
                <div className="recipe-last-made">
                  {recipe.lastMadeAt
                    ? `Last made ${new Date(recipe.lastMadeAt).toLocaleDateString()}`
                    : 'Never made'}
                </div>
              )}
              <div className="recipe-ingredients">{recipe.ingredients.join(', ')}</div>
              {recipe.link && (
                <div className="recipe-link">
                  {(() => {
                    const kind = classifyRecipeLink(recipe.link);
                    if (kind === 'pbe') return <span>No-Recipe Recipe</span>;
                    if (kind === 'url')
                      return (
                        <a href={recipe.link} target="_blank" rel="noreferrer">
                          View recipe ↗
                        </a>
                      );
                    return <span>{recipe.link}</span>;
                  })()}
                </div>
              )}
            </div>
            <div className="recipe-list-actions">
              {menuRecipeIds.has(recipe.id) ? (
                <button type="button" className="secondary" disabled>
                  On Menu ✓
                </button>
              ) : (
                <button type="button" onClick={() => onAddToMenu(recipe.id)}>
                  + Add to Menu
                </button>
              )}
              <button type="button" onClick={() => setEditing(recipe)}>
                Edit
              </button>
              <button type="button" className="secondary" onClick={() => onDelete(recipe.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
