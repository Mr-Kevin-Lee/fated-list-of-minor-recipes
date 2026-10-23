import { useId, useState } from 'react';
import { normalizeIngredient } from '../lib/matching';

interface IngredientTagInputProps {
  items: string[];
  onChange: (items: string[]) => void;
  suggestions: string[];
  placeholder?: string;
}

export default function IngredientTagInput({
  items,
  onChange,
  suggestions,
  placeholder,
}: IngredientTagInputProps) {
  const [draft, setDraft] = useState('');
  const listId = useId();

  function addDraft() {
    // Casing/singularization only (deterministic) — never silently override what the user typed
    // against a fuzzy "closest existing spelling" guess. That guess can itself be a typo (e.g. a
    // bad CSV import), which would otherwise make it impossible to type the *correct* spelling
    // once a wrong one is already in the vocabulary. Existing spellings are still suggested via
    // the datalist below — the user chooses, nothing is forced.
    const value = normalizeIngredient(draft);
    if (!value) return;
    if (!items.some((item) => normalizeIngredient(item) === value)) {
      onChange([...items, value]);
    }
    setDraft('');
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="tag-input">
      <div className="tag-input-chips">
        {items.map((item, index) => (
          <span className="tag-chip" key={`${item}-${index}`}>
            {item}
            <button
              type="button"
              className="tag-chip-remove"
              onClick={() => removeItem(index)}
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        list={listId}
        placeholder={placeholder ?? 'Add ingredient…'}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addDraft();
          }
        }}
        onBlur={addDraft}
      />
      <datalist id={listId}>
        {suggestions.map((s) => (
          <option value={s} key={s} />
        ))}
      </datalist>
    </div>
  );
}
