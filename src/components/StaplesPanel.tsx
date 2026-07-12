import IngredientTagInput from './IngredientTagInput';

interface StaplesPanelProps {
  staples: string[];
  onChange: (staples: string[]) => void;
}

export default function StaplesPanel({ staples, onChange }: StaplesPanelProps) {
  return (
    <details className="settings-panel">
      <summary>Pantry staples ({staples.length})</summary>
      <div className="settings-body">
        <p className="empty-state">
          Staples are always assumed on hand — they're excluded from matching and grocery lists
          entirely, so they never show up as "missing."
        </p>
        <IngredientTagInput items={staples} onChange={onChange} placeholder="Add a staple…" suggestions={[]} />
      </div>
    </details>
  );
}
