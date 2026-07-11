import { useState, type FormEvent } from 'react';
import type { Recipe, Season } from '../types';
import { SEASONS } from '../types';
import IngredientTagInput from './IngredientTagInput';

interface RecipeFormProps {
  initial?: Recipe;
  ingredientSuggestions: string[];
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function RecipeForm({
  initial,
  ingredientSuggestions,
  onSave,
  onCancel,
}: RecipeFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [season, setSeason] = useState<Season>(initial?.season ?? 'any');
  const [ingredients, setIngredients] = useState<string[]>(initial?.ingredients ?? []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0) return;
    onSave({ id: initial?.id, name: name.trim(), season, ingredients });
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <label>
        Recipe name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Tomato Basil Salad"
          autoFocus
        />
      </label>

      <label>
        Season
        <select value={season} onChange={(e) => setSeason(e.target.value as Season)}>
          {SEASONS.map((s) => (
            <option key={s} value={s}>
              {s === 'any' ? 'Any season' : s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </label>

      <label>
        Ingredients
        <IngredientTagInput
          items={ingredients}
          onChange={setIngredients}
          suggestions={ingredientSuggestions}
        />
      </label>

      <div className="form-actions">
        <button type="submit" disabled={!name.trim() || ingredients.length === 0}>
          Save recipe
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
