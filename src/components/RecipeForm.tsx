import { useId, useState, type FormEvent } from 'react';
import type { ConcreteSeason, Recipe } from '../types';
import { CONCRETE_SEASONS } from '../types';
import { titleCase } from '../lib/textCase';
import { seasonIcon } from '../lib/seasonIcon';
import IngredientTagInput from './IngredientTagInput';

const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard'];

interface RecipeFormProps {
  initial?: Recipe;
  ingredientSuggestions: string[];
  cuisineSuggestions: string[];
  onSave: (recipe: Omit<Recipe, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export default function RecipeForm({
  initial,
  ingredientSuggestions,
  cuisineSuggestions,
  onSave,
  onCancel,
}: RecipeFormProps) {
  const cuisineListId = useId();
  const [name, setName] = useState(initial?.name ?? '');
  const [seasons, setSeasons] = useState<ConcreteSeason[]>(initial?.seasons ?? []);
  const [ingredients, setIngredients] = useState<string[]>(initial?.ingredients ?? []);
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? '');
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? '');
  const [link, setLink] = useState(initial?.link ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || ingredients.length === 0) return;
    // Title-case only — never silently override the typed spelling against a fuzzy guess.
    // Existing cuisines are still suggested via the datalist below; the user chooses.
    const cuisineValue = cuisine.trim() ? titleCase(cuisine) : undefined;
    onSave({
      id: initial?.id,
      name: titleCase(name),
      seasons,
      ingredients,
      cuisine: cuisineValue,
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
        Seasons <span className="optional-tag">(none checked = any season)</span>
        <div className="season-checkboxes">
          {CONCRETE_SEASONS.map((s) => (
            <label key={s} className="checkbox-label">
              <input
                type="checkbox"
                checked={seasons.includes(s)}
                onChange={() =>
                  setSeasons((prev) =>
                    prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
                  )
                }
              />
              <i className={`ti ${seasonIcon(s)}`} aria-hidden="true" />
              {s[0].toUpperCase() + s.slice(1)}
            </label>
          ))}
        </div>
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
          list={cuisineListId}
        />
        <datalist id={cuisineListId}>
          {cuisineSuggestions.map((c) => (
            <option value={c} key={c} />
          ))}
        </datalist>
      </label>

      <label>
        Difficulty <span className="optional-tag">(optional)</span>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">— none —</option>
          {DIFFICULTY_OPTIONS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
          {difficulty && !DIFFICULTY_OPTIONS.includes(difficulty) && (
            <option value={difficulty}>{difficulty} (custom)</option>
          )}
        </select>
      </label>

      <label>
        Link <span className="optional-tag">(blank = play it by ear)</span>
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://… or a cookbook name"
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
