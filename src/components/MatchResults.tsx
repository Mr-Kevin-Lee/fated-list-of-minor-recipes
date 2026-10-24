import type { RecipeMatch } from '../types';

interface MatchResultsProps {
  matches: RecipeMatch[];
  menuRecipeIds: Set<string>;
  onAddToMenu: (recipeId: string) => void;
}

const SECTIONS: { status: RecipeMatch['status']; label: string; icon: string }[] = [
  { status: 'makeable', label: 'Makeable', icon: 'ti-check' },
  { status: 'almost', label: 'Almost makeable', icon: 'ti-hourglass' },
  { status: 'missing', label: 'Missing', icon: 'ti-alert-circle' },
];

export default function MatchResults({ matches, menuRecipeIds, onAddToMenu }: MatchResultsProps) {
  return (
    <div className="match-results">
      {SECTIONS.map(({ status, label, icon }) => {
        const group = matches.filter((m) => m.status === status);
        return (
          <section key={status} className={`match-section match-section--${status}`}>
            <h3>
              <i className={`ti ${icon}`} aria-hidden="true" />
              {label} <span className="match-count">({group.length})</span>
            </h3>
            {group.length === 0 && <p className="empty-state">None</p>}
            <ul>
              {group.map((match) => (
                <li key={match.recipe.id}>
                  <div>
                    <strong>{match.recipe.name}</strong>
                    {match.missingIngredients.length > 0 && (
                      <div className="missing-ingredients">
                        Missing: {match.missingIngredients.join(', ')}
                      </div>
                    )}
                  </div>
                  {menuRecipeIds.has(match.recipe.id) ? (
                    <button type="button" className="secondary" disabled>
                      <i className="ti ti-check" aria-hidden="true" />
                      On Menu
                    </button>
                  ) : (
                    <button type="button" onClick={() => onAddToMenu(match.recipe.id)}>
                      <i className="ti ti-calendar-plus" aria-hidden="true" />
                      Add to Menu
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
