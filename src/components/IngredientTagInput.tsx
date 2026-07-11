import { useId, useState } from 'react';

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
    const value = draft.trim();
    if (!value) return;
    if (!items.some((item) => item.toLowerCase() === value.toLowerCase())) {
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
