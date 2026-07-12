import { useState, type FormEvent } from 'react';
import type { Recipe, Season } from '../types';
import { SEASONS } from '../types';
import { titleCase } from '../lib/textCase';
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
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? '');
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? '');
  const [link, setLink] = useState(initial?.link ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0) return;
    onSave({
      id: initial?.id,
      name: titleCase(name),
      season,
      ingredients,
      cuisine: cuisine.trim() || undefined,
      difficulty: difficulty.trim() || undefined,
      link: link.trim() || undefined,
    });
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

      <label>
        Cuisine <span className="optional-tag">(optional)</span>
        <input
          type="text"
          value={cuisine}
          onChange={(e) => setCuisine(e.target.value)}
          placeholder="e.g. Italian"
        />
      </label>

      <label>
        Difficulty <span className="optional-tag">(optional)</span>
        <input
          type="text"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          placeholder="e.g. Easy"
        />
      </label>

      <label>
        Link <span className="optional-tag">(optional)</span>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://…"
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
