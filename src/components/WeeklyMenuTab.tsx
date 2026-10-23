import { useState } from 'react';
import type { MenuEntry, Recipe } from '../types';

interface WeeklyMenuTabProps {
  recipes: Recipe[];
  menu: MenuEntry[];
  onAddRecipe: (recipeId: string) => void;
  onRemoveRecipe: (recipeId: string) => void;
  onMarkCooked: (recipeId: string) => void;
  onConfirmSkip: (recipeId: string, carryoverIngredients: string[]) => void;
  onAddIngredientsToGroceryList: (recipe: Recipe) => void;
  onStartNewWeek: () => void;
}

export default function WeeklyMenuTab({
  recipes,
  menu,
  onAddRecipe,
  onRemoveRecipe,
  onMarkCooked,
  onConfirmSkip,
  onAddIngredientsToGroceryList,
  onStartNewWeek,
}: WeeklyMenuTabProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [skippingRecipeId, setSkippingRecipeId] = useState<string | null>(null);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());

  const recipeById = new Map(recipes.map((r) => [r.id, r]));
  const menuRecipeIds = new Set(menu.map((e) => e.recipeId));
  const availableToAdd = recipes.filter((r) => !menuRecipeIds.has(r.id));

  function startSkip(recipe: Recipe) {
    setSkippingRecipeId(recipe.id);
    setCheckedIngredients(new Set(recipe.ingredients));
  }

  function toggleIngredient(ingredient: string) {
    setCheckedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) next.delete(ingredient);
      else next.add(ingredient);
      return next;
    });
  }

  function confirmSkip() {
    if (!skippingRecipeId) return;
    onConfirmSkip(skippingRecipeId, Array.from(checkedIngredients));
    setSkippingRecipeId(null);
  }

  function handleStartNewWeek() {
    if (window.confirm('Start a new week? This clears the Pantry (except carried-over items from skipped recipes) and empties the Weekly Menu.')) {
      onStartNewWeek();
    }
  }

  return (
    <div className="weekly-menu-tab">
      <button type="button" onClick={() => setShowPicker((v) => !v)}>
        <i className="ti ti-plus" aria-hidden="true" />
        Add to Menu
      </button>

      {showPicker && (
        <ul className="menu-picker">
          {availableToAdd.length === 0 && <p className="empty-state">All recipes are on the menu.</p>}
          {availableToAdd.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  onAddRecipe(recipe.id);
                  setShowPicker(false);
                }}
              >
                {recipe.name}
              </button>
            </li>
          ))}
        </ul>
      )}

      {menu.length === 0 && <p className="empty-state">No recipes on the menu yet.</p>}

      <ul className="menu-list">
        {menu.map((entry) => {
          const recipe = recipeById.get(entry.recipeId);
          if (!recipe) return null;
          return (
            <li key={entry.recipeId} className="menu-list-item">
              <div className="menu-item-header">
                <strong>{recipe.name}</strong>
                <span className={`menu-status menu-status--${entry.status}`}>{entry.status}</span>
              </div>

              <div className="recipe-ingredients">{recipe.ingredients.join(', ')}</div>

              <div className="menu-item-actions">
                <button type="button" onClick={() => onAddIngredientsToGroceryList(recipe)}>
                  <i className="ti ti-shopping-cart-plus" aria-hidden="true" />
                  Add to grocery list
                </button>
                <button type="button" className="secondary" onClick={() => onMarkCooked(entry.recipeId)}>
                  <i className="ti ti-tools-kitchen-2" aria-hidden="true" />
                  Mark cooked
                </button>
                <button type="button" className="secondary" onClick={() => startSkip(recipe)}>
                  <i className="ti ti-player-skip-forward" aria-hidden="true" />
                  Mark skipped
                </button>
                <button type="button" className="secondary" onClick={() => onRemoveRecipe(entry.recipeId)}>
                  <i className="ti ti-x" aria-hidden="true" />
                  Remove
                </button>
              </div>

              {skippingRecipeId === entry.recipeId && (
                <div className="skip-checklist">
                  <p>Which of these do you still have?</p>
                  {recipe.ingredients.map((ingredient) => (
                    <label key={ingredient} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={checkedIngredients.has(ingredient)}
                        onChange={() => toggleIngredient(ingredient)}
                      />
                      {ingredient}
                    </label>
                  ))}
                  <div className="form-actions">
                    <button type="button" onClick={confirmSkip}>
                      <i className="ti ti-check" aria-hidden="true" />
                      Confirm skip
                    </button>
                    <button type="button" className="secondary" onClick={() => setSkippingRecipeId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <button type="button" className="danger" onClick={handleStartNewWeek}>
        <i className="ti ti-refresh" aria-hidden="true" />
        Start New Week
      </button>
    </div>
  );
}
