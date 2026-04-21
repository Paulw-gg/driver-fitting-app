import type { LaunchStatus } from '../types';

interface Props {
  label: string;
  value: string;
  unit?: string;
  target?: string;
  status: LaunchStatus;
  delta?: string;
  sublabel?: string;
}

const STATUS_STYLES: Record<LaunchStatus, { bg: string; border: string; badge: string; text: string; dot: string }> = {
  optimal: {
    bg: '#F0FDF4', border: '#BBF7D0',
    badge: '#DCFCE7', text: '#166534', dot: '#22C55E'
  },
  low: {
    bg: '#FFFBEB', border: '#FDE68A',
    badge: '#FEF3C7', text: '#92400E', dot: '#F59E0B'
  },
  high: {
    bg: '#FEF2F2', border: '#FECACA',
    badge: '#FEE2E2', text: '#991B1B', dot: '#EF4444'
  },
};

const STATUS_LABELS: Record<LaunchStatus, string> = {
  optimal: 'Optimal',
  low: 'Zu niedrig',
  high: 'Zu hoch',
};

export default function MetricCard({ label, value, unit, target, status, delta, sublabel }: Props) {
  const s = STATUS_STYLES[status];
  return (
    <div
      className="rounded-xl p-4 border"
      style={{ backgroundColor: s.bg, borderColor: s.border }}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <span
          className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: s.badge, color: s.text }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
          {STATUS_LABELS[status]}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      {(target || delta) && (
        <div className="mt-2 pt-2 border-t border-gray-200 flex gap-3 text-xs text-gray-500">
          {target && <span>Ziel: <span className="font-medium text-gray-700">{target}</span></span>}
          {delta && <span>Δ: <span className="font-medium" style={{ color: s.text }}>{delta}</span></span>}
        </div>
      )}
    </div>
  );
}
