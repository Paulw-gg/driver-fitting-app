import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User, Calendar, Search, ChevronRight,
  CheckCircle, AlertCircle, XCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Session {
  id: string;
  created_at: string;
  fitter_name: string;
  current_driver_model: string;
  current_loft: number;
  shaft_weight_g: number;
  weight_setting: string;
  hosel_setting: string;
  club_speed_mph: number;
  ball_speed_mph: number;
  launch_angle_deg: number;
  aoa_deg: number;
  backspin_rpm: number;
  spin_axis_deg: number;
  monitor_type: string;
  impact_zone: string;
  customer_goals: string[];
  tempo: string;
  smash_factor: number;
  spin_loft_deg: number;
  optimal_launch_deg: number;
  optimal_spin_rpm: number;
  launch_status: string;
  spin_status: string;
  recommended_cog_vertical: string;
  recommended_cog_horizontal: string;
  recommended_loft: number;
  recommendation_notes: string;
  customers?: { name: string } | null;
  fitting_recommendations?: {
    rank: number;
    driver_products: {
      brand: string;
      model: string;
      loft_options: string[];
      low_spin: boolean;
      draw_bias: boolean;
      high_moi: boolean;
      weight_adjustable: boolean;
      notes?: string;
    } | null;
  }[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function statusColor(s: string) {
  return s === 'optimal' ? 'text-green-600' : s === 'low' ? 'text-amber-500' : 'text-red-500';
}
function statusLabel(s: string) {
  return s === 'optimal' ? 'Optimal' : s === 'low' ? 'Zu niedrig' : 'Zu hoch';
}
function StatusIcon({ s }: { s: string }) {
  if (s === 'optimal') return <CheckCircle size={14} className="text-green-600" />;
  if (s === 'low' || s === 'high') return <AlertCircle size={14} className="text-amber-500" />;
  return <XCircle size={14} className="text-red-500" />;
}

const COG_V_LABELS: Record<string, string> = {
  'low-back':    'Low-Back (hoch MOI, mehr Launch)',
  'low-forward': 'Low-Forward (weniger Spin, flacher)',
  'very-low':    'Very Low (max. Launch, tiefes CoG)',
};
const COG_H_LABELS: Record<string, string> = {
  neutral:     'Neutral',
  'heel-bias': 'Heel-Bias (Draw-Effekt)',
  'toe-bias':  'Toe-Bias (Fade-Effekt)',
};
const BADGE_STYLES: Record<string, string> = {
  'Low-Spin':    'bg-blue-100 text-blue-700',
  'Draw-Bias':   'bg-purple-100 text-purple-700',
  'High-MOI':    'bg-green-100 text-green-700',
  'Verstellbar': 'bg-amber-100 text-amber-700',
};

// ── Detail view ───────────────────────────────────────────────────────────────

function SessionDetail({ session, onBack }: { session: Session; onBack: () => void }) {
  const recs = (session.fitting_recommendations ?? [])
    .filter(r => r.driver_products)
    .sort((a, b) => a.rank - b.rank);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">
            {session.customers?.name ?? '—'}
          </h1>
          <p className="text-sm text-gray-400">
            {new Date(session.created_at).toLocaleDateString('de-DE', {
              day: '2-digit', month: '2-digit', year: 'numeric',
            })}
            {' · '}Fitter: {session.fitter_name || '—'}
          </p>
        </div>
      </div>

      {/* Swing-Metriken */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>📊</span> Ist-Analyse
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Club Speed', value: `${session.club_speed_mph} mph` },
            { label: 'Ball Speed', value: `${session.ball_speed_mph} mph` },
            { label: 'Smash Factor', value: session.smash_factor?.toFixed(3) ?? '—' },
            { label: 'Spin Loft', value: `${session.spin_loft_deg}°` },
            { label: 'Launch', value: `${session.launch_angle_deg}°` },
            { label: 'Backspin', value: `${session.backspin_rpm.toLocaleString('de')} rpm` },
            { label: 'AoA', value: `${session.aoa_deg}°` },
            { label: 'Spin-Achse', value: `${session.spin_axis_deg}°` },
          ].map(m => (
            <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-400">{m.label}</div>
              <div className="font-semibold text-gray-900 text-sm">{m.value}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1">Launch-Status</div>
            <div className={`flex items-center gap-1 font-semibold ${statusColor(session.launch_status)}`}>
              <StatusIcon s={session.launch_status} />
              {statusLabel(session.launch_status)}
            </div>
            <div className="text-gray-400 mt-0.5">Optimal: {session.optimal_launch_deg}°</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-medium text-gray-700 mb-1">Spin-Status</div>
            <div className={`flex items-center gap-1 font-semibold ${statusColor(session.spin_status)}`}>
              <StatusIcon s={session.spin_status} />
              {statusLabel(session.spin_status)}
            </div>
            <div className="text-gray-400 mt-0.5">Optimal: {session.optimal_spin_rpm.toLocaleString('de')} rpm</div>
          </div>
        </div>

        {session.recommendation_notes && (
          <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-800 leading-relaxed">
            {session.recommendation_notes}
          </div>
        )}
      </div>

      {/* Aktuelles Setup */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>🏌️</span> Aktuelles Setup
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { label: 'Driver-Modell', value: session.current_driver_model || '—' },
            { label: 'Loft', value: `${session.current_loft}°` },
            { label: 'Schaft-Gewicht', value: `${session.shaft_weight_g} g` },
            { label: 'Gewichtseinst.', value: session.weight_setting },
            { label: 'Hosel', value: session.hosel_setting },
            { label: 'Monitor', value: session.monitor_type },
            { label: 'Impact Zone', value: session.impact_zone },
            { label: 'Tempo', value: session.tempo },
          ].map(m => (
            <div key={m.label} className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500">{m.label}</span>
              <span className="font-medium text-gray-900 capitalize">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CoG-Empfehlung */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span>⚙️</span> CoG & Ausstattungsempfehlung
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">CoG vertikal</div>
            <div className="font-semibold text-gray-900">
              {COG_V_LABELS[session.recommended_cog_vertical] ?? session.recommended_cog_vertical}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">CoG horizontal</div>
            <div className="font-semibold text-gray-900">
              {COG_H_LABELS[session.recommended_cog_horizontal] ?? session.recommended_cog_horizontal}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Empf. Loft</div>
            <div className="font-bold text-[#185FA5]">{session.recommended_loft}°</div>
          </div>
        </div>
      </div>

      {/* Empfohlene Produkte */}
      {recs.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <span>🏌️</span> Empfohlene Driver
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {recs.map(r => {
              const p = r.driver_products!;
              const badges = [
                p.low_spin && 'Low-Spin',
                p.draw_bias && 'Draw-Bias',
                p.high_moi && 'High-MOI',
                p.weight_adjustable && 'Verstellbar',
              ].filter(Boolean) as string[];
              return (
                <div key={r.rank} className="rounded-xl border border-gray-200 p-3 relative">
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs font-bold flex items-center justify-center">
                    {r.rank}
                  </span>
                  <div className="font-bold text-gray-900 pr-6 text-sm">{p.brand}</div>
                  <div className="text-gray-500 text-xs mb-1">{p.model}</div>
                  <div className="text-xs text-gray-400 mb-2">
                    Loft: {p.loft_options.join(' / ')}°
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {badges.map(b => (
                      <span key={b} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${BADGE_STYLES[b] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────

export default function FittingHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Session | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('fitting_sessions')
          .select(`
            *,
            customers(name),
            fitting_recommendations(
              rank,
              driver_products(brand, model, loft_options, low_spin, draw_bias, high_moi, weight_adjustable, notes)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100);
        setSessions((data as Session[]) ?? []);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = sessions.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (s.customers?.name ?? '').toLowerCase().includes(q) ||
      (s.fitter_name ?? '').toLowerCase().includes(q) ||
      (s.current_driver_model ?? '').toLowerCase().includes(q)
    );
  });

  if (selected) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <SessionDetail session={selected} onBack={() => setSelected(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">Fitting-Historie</h1>
        {!loading && sessions.length > 0 && (
          <span className="text-xs text-gray-400">{sessions.length} Sessions</span>
        )}
      </div>

      {/* Suchfeld */}
      {sessions.length > 0 && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Kunde, Fitter oder Driver suchen…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm
              focus:outline-none focus:ring-2 focus:ring-[#185FA5]/30 focus:border-[#185FA5]
              placeholder:text-gray-400"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 text-sm">Lade Sessions…</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-3 text-sm">Noch keine Fitting-Sessions gespeichert.</p>
          <button onClick={() => navigate('/fitting/new')}
            className="text-blue-600 underline text-sm">Erstes Fitting starten</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 text-sm">
          Keine Sessions gefunden für „{search}".
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="w-full text-left bg-white rounded-xl border border-gray-200
                hover:border-gray-300 hover:shadow-sm transition-all p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-gray-400 flex-shrink-0" />
                  <span className="font-semibold text-gray-900">{s.customers?.name ?? '—'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={11} />
                    {new Date(s.created_at).toLocaleDateString('de-DE')}
                  </div>
                  <ChevronRight size={15} className="text-gray-300" />
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">
                {s.current_driver_model || '—'} · Fitter: {s.fitter_name || '—'}
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="font-semibold text-gray-900">{s.club_speed_mph}</div>
                  <div className="text-gray-400">mph CS</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="font-semibold text-gray-900">{s.smash_factor?.toFixed(3) ?? '—'}</div>
                  <div className="text-gray-400">SF</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className={`font-semibold ${statusColor(s.launch_status)}`}>
                    {statusLabel(s.launch_status)}
                  </div>
                  <div className="text-gray-400">Launch</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className={`font-semibold ${statusColor(s.spin_status)}`}>
                    {statusLabel(s.spin_status)}
                  </div>
                  <div className="text-gray-400">Spin</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
