import { useMemo, useState } from 'react';
import type { Recipe, RecipeSort } from '../types';
import { sortRecipes } from '../lib/recipes';
import RecipeForm from './RecipeForm';
import ImportCsv from './ImportCsv';

interface RecipesTabProps {
  recipes: Recipe[];
  ingredientSuggestions: string[];
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
  onImport: (recipes: Omit<Recipe, 'id'>[]) => void;
}

export default function RecipesTab({
  recipes,
  ingredientSuggestions,
  onSave,
  onDelete,
  onImport,
}: RecipesTabProps) {
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null);
  const [sort, setSort] = useState<RecipeSort>('name');

  const sortedRecipes = useMemo(() => sortRecipes(recipes, sort), [recipes, sort]);

  if (editing) {
    return (
      <RecipeForm
        initial={editing === 'new' ? undefined : editing}
        ingredientSuggestions={ingredientSuggestions}
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

      <ImportCsv onImport={onImport} />

      {recipes.length > 0 && (
        <label>
          Sort by
          <select value={sort} onChange={(e) => setSort(e.target.value as RecipeSort)}>
            <option value="name">Name</option>
            <option value="recent">Recently used</option>
            <option value="least-recent">Least recently used</option>
          </select>
        </label>
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
                  <a href={recipe.link} target="_blank" rel="noreferrer">
                    View recipe ↗
                  </a>
                </div>
              )}
            </div>
            <div className="recipe-list-actions">
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
