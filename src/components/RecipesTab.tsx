import { useState } from 'react';
import type { Recipe } from '../types';
import RecipeForm from './RecipeForm';

interface RecipesTabProps {
  recipes: Recipe[];
  ingredientSuggestions: string[];
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
}

export default function RecipesTab({
  recipes,
  ingredientSuggestions,
  onSave,
  onDelete,
}: RecipesTabProps) {
  const [editing, setEditing] = useState<Recipe | 'new' | null>(null);

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

      {recipes.length === 0 && <p className="empty-state">No recipes yet.</p>}

      <ul className="recipe-list">
        {recipes.map((recipe) => (
          <li key={recipe.id} className="recipe-list-item">
            <div>
              <strong>{recipe.name}</strong>
              <span className="recipe-season"> · {recipe.season}</span>
              <div className="recipe-ingredients">{recipe.ingredients.join(', ')}</div>
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
