import type { MatchSettings } from '../types';

interface SettingsPanelProps {
  settings: MatchSettings;
  onChange: (settings: MatchSettings) => void;
}

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  return (
    <details className="settings-panel">
      <summary>
        <i className="ti ti-adjustments" aria-hidden="true" /> "Almost makeable" threshold
      </summary>
      <div className="settings-body">
        <label className="radio-label">
          <input
            type="radio"
            name="match-mode"
            checked={settings.mode === 'total'}
            onChange={() => onChange({ ...settings, mode: 'total' })}
          />
          Total missing: at most{' '}
          <input
            type="number"
            min={1}
            className="inline-number"
            value={settings.totalThreshold}
            onChange={(e) =>
              onChange({ ...settings, mode: 'total', totalThreshold: Number(e.target.value) })
            }
          />{' '}
          ingredient(s)
        </label>

        <label className="radio-label">
          <input
            type="radio"
            name="match-mode"
            checked={settings.mode === 'percentage'}
            onChange={() => onChange({ ...settings, mode: 'percentage' })}
          />
          Percentage: at most{' '}
          <input
            type="number"
            min={1}
            max={100}
            className="inline-number"
            value={settings.percentageThreshold}
            onChange={(e) =>
              onChange({
                ...settings,
                mode: 'percentage',
                percentageThreshold: Number(e.target.value),
              })
            }
          />
          % of ingredients missing
        </label>
      </div>
    </details>
  );
}
