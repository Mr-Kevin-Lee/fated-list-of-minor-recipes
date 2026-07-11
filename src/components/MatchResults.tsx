import type { RecipeMatch } from '../types';

interface MatchResultsProps {
  matches: RecipeMatch[];
}

const SECTIONS: { status: RecipeMatch['status']; label: string }[] = [
  { status: 'makeable', label: 'Makeable' },
  { status: 'almost', label: 'Almost makeable' },
  { status: 'missing', label: 'Missing' },
];

export default function MatchResults({ matches }: MatchResultsProps) {
  return (
    <div className="match-results">
      {SECTIONS.map(({ status, label }) => {
        const group = matches.filter((m) => m.status === status);
        return (
          <section key={status} className={`match-section match-section--${status}`}>
            <h3>
              {label} <span className="match-count">({group.length})</span>
            </h3>
            {group.length === 0 && <p className="empty-state">None</p>}
            <ul>
              {group.map((match) => (
                <li key={match.recipe.id}>
                  <strong>{match.recipe.name}</strong>
                  {match.missingIngredients.length > 0 && (
                    <div className="missing-ingredients">
                      Missing: {match.missingIngredients.join(', ')}
                    </div>
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
