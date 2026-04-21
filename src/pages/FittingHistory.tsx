import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Session {
  id: string;
  created_at: string;
  customer_id: string | null;
  fitter_name: string;
  current_driver_model: string;
  club_speed_mph: number;
  ball_speed_mph: number;
  launch_angle_deg: number;
  backspin_rpm: number;
  smash_factor: number;
  launch_status: string;
  spin_status: string;
  customers?: { name: string } | null;
}

function statusColor(s: string) {
  return s === 'optimal' ? 'text-green-600' : s === 'low' ? 'text-amber-500' : 'text-red-500';
}
function statusLabel(s: string) {
  return s === 'optimal' ? 'Optimal' : s === 'low' ? 'Zu niedrig' : 'Zu hoch';
}

export default function FittingHistory() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('fitting_sessions')
          .select('*, customers(name)')
          .order('created_at', { ascending: false })
          .limit(50);
        setSessions((data as Session[]) ?? []);
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Fitting-Historie</h1>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Lade Sessions…</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="mb-3">Noch keine Fitting-Sessions gespeichert.</p>
          <button onClick={() => navigate('/fitting/new')}
            className="text-blue-600 underline text-sm">Erstes Fitting starten</button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sessions.map(s => (
            <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="font-semibold text-gray-900">{s.customers?.name ?? '—'}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={12} />
                  {new Date(s.created_at).toLocaleDateString('de-DE')}
                </div>
              </div>
              <div className="text-sm text-gray-500 mb-3">{s.current_driver_model || '—'} · Fitter: {s.fitter_name || '—'}</div>
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
                  <div className={`font-semibold ${statusColor(s.launch_status)}`}>{statusLabel(s.launch_status)}</div>
                  <div className="text-gray-400">Launch</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className={`font-semibold ${statusColor(s.spin_status)}`}>{statusLabel(s.spin_status)}</div>
                  <div className="text-gray-400">Spin</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
