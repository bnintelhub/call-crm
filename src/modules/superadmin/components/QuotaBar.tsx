import { quotaPct } from './format';

interface QuotaBarProps {
  label?: string;
  used: number;
  max: number;
  suffix?: string;
  compact?: boolean;
  showPercent?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
  if (num >= 10000) return `${(num / 1000).toFixed(0)}k`;
  return num.toLocaleString('en-IN');
}

export default function QuotaBar({
  label,
  used,
  max,
  suffix = '',
  compact = false,
  showPercent = true,
}: QuotaBarProps) {
  const pct = quotaPct(used, max);
  const toneClass = pct >= 95 ? 'danger' : pct >= 80 ? 'warning' : 'normal';

  const barColor =
    pct >= 95
      ? 'linear-gradient(90deg, #ef4444, #dc2626)'
      : pct >= 80
      ? 'linear-gradient(90deg, #f59e0b, #ea580c)'
      : 'linear-gradient(90deg, #10b981, #059669)';

  if (compact) {
    return (
      <div className="sa-quota-compact-wrap">
        <div className="sa-quota-compact-header">
          <span className="sa-quota-compact-val">
            {formatNumber(used)} / {formatNumber(max)}{suffix}
          </span>
          <span className={`sa-quota-compact-pct ${toneClass}`}>
            {pct}%
          </span>
        </div>
        <div className="sa-quota-track">
          <div
            className="sa-quota-bar-fill"
            style={{
              width: `${Math.min(100, pct)}%`,
              background: barColor,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`sa-quota-box ${toneClass}`}>
      {label && (
        <div className="sa-quota-header-row">
          <span className="sa-quota-title">{label}</span>
          <div className="sa-quota-value-group">
            <span className="sa-quota-numbers">
              {used.toLocaleString('en-IN')} / {max.toLocaleString('en-IN')}{suffix}
            </span>
            {showPercent && (
              <span className={`sa-quota-pill-badge ${toneClass}`}>
                {pct >= 95 ? '⚠️ Over 95%' : pct >= 80 ? '⚡ 80%+' : ''} {pct}%
              </span>
            )}
          </div>
        </div>
      )}
      <div className="sa-quota-track">
        <div
          className="sa-quota-bar-fill"
          style={{
            width: `${Math.min(100, pct)}%`,
            background: barColor,
          }}
        />
      </div>
    </div>
  );
}
