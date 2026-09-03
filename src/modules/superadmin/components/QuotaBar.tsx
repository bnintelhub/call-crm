import { quotaPct } from './format';

export default function QuotaBar({
  label,
  used,
  max,
  suffix = '',
}: {
  label: string;
  used: number;
  max: number;
  suffix?: string;
}) {
  const pct = quotaPct(used, max);
  const tone = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'ok';

  return (
    <div className="sa-quota">
      <div className="sa-quota-row">
        <span>{label}</span>
        <strong>
          {used.toLocaleString('en-IN')} / {max.toLocaleString('en-IN')}{suffix}
          <em>{pct}%</em>
        </strong>
      </div>
      <div className="sa-quota-track">
        <i className={tone} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
