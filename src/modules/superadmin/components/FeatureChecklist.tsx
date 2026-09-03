import type { FeatureCode } from '../types';
import { FEATURE_CATALOG } from '../data/catalog';

export default function FeatureChecklist({
  value,
  onChange,
}: {
  value: FeatureCode[];
  onChange: (next: FeatureCode[]) => void;
}) {
  const groups = [
    { id: 'core', title: 'Core' },
    { id: 'calling', title: 'Calling' },
    { id: 'field', title: 'Field' },
  ] as const;

  const toggle = (code: FeatureCode, dependsOn: FeatureCode[]) => {
    const on = value.includes(code);
    if (on) {
      const blocked = new Set<FeatureCode>([code]);
      FEATURE_CATALOG.forEach((f) => {
        if (f.dependsOn.some((d) => blocked.has(d))) blocked.add(f.code);
      });
      onChange(value.filter((c) => !blocked.has(c)));
      return;
    }
    const missing = dependsOn.filter((d) => !value.includes(d));
    onChange([...value, ...missing, code]);
  };

  return (
    <div className="sa-feature-groups">
      {groups.map((group) => (
        <div key={group.id} className="sa-feature-group">
          <h4>{group.title}</h4>
          {FEATURE_CATALOG.filter((f) => f.group === group.id).map((f) => (
            <label key={f.code} className={`sa-check ${value.includes(f.code) ? 'on' : ''}`}>
              <input
                type="checkbox"
                checked={value.includes(f.code)}
                onChange={() => toggle(f.code, f.dependsOn)}
              />
              <span>
                <strong>{f.label}</strong>
                <small>{f.hint}</small>
              </span>
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}
