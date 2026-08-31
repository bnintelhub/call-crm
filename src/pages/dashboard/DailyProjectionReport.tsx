import { useEffect, useState } from 'react';
import {
  AlertTriangle, Calendar, CheckCircle, Clock, FileText, IndianRupee,
  Loader2, PhoneCall, RefreshCw, Save, Target, TrendingUp, Users
} from 'lucide-react';
import { projectionApi } from '../../services/api';
import { toast } from '../../components/ui/Toast';

type Props = {
  userId?: string;
  date?: string;
  editable?: boolean;
  compact?: boolean;
};

const emptyForm = {
  plannedCalls: '',
  targetAmount: '',
  notes: '',
  actualCalls: '',
  achievedAmount: '',
  eodNotes: ''
};

export default function DailyProjectionReport({ userId, date, editable = false, compact = false }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);

  const loadReport = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await projectionApi.report({ ...(userId ? { userId } : {}), ...(date ? { date } : {}) });
      setReport(data);
      const p = data.projection || {};
      setForm({
        plannedCalls: p.plannedCalls || '',
        targetAmount: p.targetAmount || '',
        notes: p.notes || '',
        actualCalls: p.actualCalls || '',
        achievedAmount: p.achievedAmount || '',
        eodNotes: p.eodNotes || ''
      });
    } catch (err: any) {
      toast.error(err.message || 'Failed to load daily report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [userId, date]);

  const save = async (mode: 'plan' | 'eod') => {
    try {
      setSaving(true);
      const res = await projectionApi.save({
        plannedCalls: Number(form.plannedCalls) || 0,
        targetAmount: Number(form.targetAmount) || 0,
        notes: form.notes,
        actualCalls: Number(form.actualCalls) || 0,
        achievedAmount: Number(form.achievedAmount) || 0,
        eodNotes: form.eodNotes
      });
      setReport((prev: any) => ({ ...prev, projection: res.projection }));
      toast.success(mode === 'plan' ? 'Morning plan saved' : 'EOD report updated');
      loadReport(true);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save report');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => {
    const val = Number(n) || 0;
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  if (loading) {
    return <div className="page-loading" style={{ minHeight: compact ? 180 : 300 }}><Loader2 size={28} className="spin-icon" /></div>;
  }

  if (!report) return null;

  const m = report.metrics || {};
  const plannedCalls = Number(form.plannedCalls) || 0;
  const targetAmount = Number(form.targetAmount) || 0;
  const actualCalls = Number(form.actualCalls) || m.totalCalls || 0;
  const achievedAmount = Number(form.achievedAmount) || m.todayPaymentBrought || 0;
  const callProgress = plannedCalls > 0 ? Math.min(100, Math.round((actualCalls / plannedCalls) * 100)) : 0;
  const collectionProgress = targetAmount > 0 ? Math.min(100, Math.round((achievedAmount / targetAmount) * 100)) : 0;

  return (
    <div className={`daily-report ${compact ? 'compact' : ''}`}>
      <div className="daily-report-head">
        <div>
          <h3><Target size={18} /> Daily Projection & EOD Report</h3>
          <p>
            <Calendar size={13} /> {new Date(report.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            {report.user && <span> · <Users size={13} /> {report.user.name}</span>}
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => loadReport(true)}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      <div className="daily-score-grid">
        <ScoreCard icon={<PhoneCall size={18} />} label="Calls" value={`${actualCalls}/${plannedCalls || 0}`} sub={`${callProgress}% target`} tone="info" />
        <ScoreCard icon={<IndianRupee size={18} />} label="Collection" value={fmt(achievedAmount)} sub={`${collectionProgress}% target`} tone="success" />
        <ScoreCard icon={<CheckCircle size={18} />} label="Connected" value={m.connectedCalls || 0} sub={`${m.connectRate || 0}% connect`} tone="primary" />
        <ScoreCard icon={<TrendingUp size={18} />} label="PTP" value={m.ptpCount || 0} sub={fmt(m.ptpAmount || 0)} tone="warning" />
      </div>

      <div className="daily-report-grid">
        <div className="daily-panel">
          <div className="daily-panel-title"><Target size={16} /> Morning Plan</div>
          <div className="daily-form-grid">
            <Field label="Target Calls" value={form.plannedCalls} disabled={!editable} onChange={(v: string) => setForm({ ...form, plannedCalls: v })} type="number" />
            <Field label="Target Collection" value={form.targetAmount} disabled={!editable} onChange={(v: string) => setForm({ ...form, targetAmount: v })} type="number" />
          </div>
          <Field label="Strategy / Focus" value={form.notes} disabled={!editable} onChange={(v: string) => setForm({ ...form, notes: v })} textarea />
          {editable && (
            <button className="btn btn-primary w-full" onClick={() => save('plan')} disabled={saving}>
              {saving ? <Loader2 size={15} className="spin-icon" /> : <Save size={15} />} Save Morning Plan
            </button>
          )}
        </div>

        <div className="daily-panel">
          <div className="daily-panel-title"><Clock size={16} /> End Of Day</div>
          <div className="daily-form-grid">
            <Field label="Actual Calls" value={form.actualCalls} placeholder={String(m.totalCalls || 0)} disabled={!editable} onChange={(v: string) => setForm({ ...form, actualCalls: v })} type="number" />
            <Field label="Collected Amount" value={form.achievedAmount} placeholder={String(m.todayPaymentBrought || 0)} disabled={!editable} onChange={(v: string) => setForm({ ...form, achievedAmount: v })} type="number" />
          </div>
          <Field label="EOD Notes / Reason" value={form.eodNotes} disabled={!editable} onChange={(v: string) => setForm({ ...form, eodNotes: v })} textarea />
          {editable && (
            <button className="btn btn-success w-full" onClick={() => save('eod')} disabled={saving}>
              {saving ? <Loader2 size={15} className="spin-icon" /> : <FileText size={15} />} Update EOD
            </button>
          )}
        </div>
      </div>

      <div className="daily-live-grid">
        <MiniMetric label="Assigned Due" value={fmt(m.totalDueAmount)} />
        <MiniMetric label="Payment Brought Today" value={fmt(m.todayPaymentBrought)} good />
        <MiniMetric label="Remaining Balance" value={fmt(m.totalRemainingAmount)} danger />
        <MiniMetric label="Recovery %" value={`${m.recoveryPercent || 0}%`} />
        <MiniMetric label="Active Allocations" value={m.activeAllocations || 0} />
        <MiniMetric label="Completed" value={m.completedAllocations || 0} good />
      </div>

      <div className="daily-progress-row">
        <Progress label="Call Target" pct={callProgress} />
        <Progress label="Collection Target" pct={collectionProgress} />
      </div>

      {!compact && (
        <div className="daily-panel">
          <div className="daily-panel-title"><PhoneCall size={16} /> Recent Calls</div>
          {report.recentCalls?.length ? (
            <div className="daily-call-list">
              {report.recentCalls.map((c: any, i: number) => (
                <div className="daily-call-row" key={i}>
                  <div>
                    <strong>{c.borrowerName}</strong>
                    <span>{c.loanNumber} · {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div>
                    <span className={`badge ${c.disposition === 'CONNECTED' ? 'badge-success' : 'badge-warning'}`}>{c.subDisposition || c.disposition}</span>
                    <small>{fmt(c.remainingAmount)}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="daily-empty"><AlertTriangle size={20} /> No calls logged for this date.</div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreCard({ icon, label, value, sub, tone }: any) {
  return <div className={`daily-score ${tone}`}><div>{icon}</div><strong>{value}</strong><span>{label}</span><small>{sub}</small></div>;
}

function Field({ label, value, onChange, disabled, textarea, type = 'text', placeholder }: any) {
  return (
    <label className="daily-field">
      <span>{label}</span>
      {textarea ? (
        <textarea value={value} disabled={disabled} placeholder={placeholder} onChange={e => onChange(e.target.value)} rows={3} />
      ) : (
        <input type={type} value={value} disabled={disabled} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      )}
    </label>
  );
}

function MiniMetric({ label, value, good, danger }: any) {
  return <div className="daily-mini"><span>{label}</span><strong className={good ? 'text-success' : danger ? 'text-danger' : ''}>{value}</strong></div>;
}

function Progress({ label, pct }: { label: string; pct: number }) {
  return <div className="daily-progress"><div><span>{label}</span><strong>{pct}%</strong></div><div><i style={{ width: `${pct}%` }} /></div></div>;
}
