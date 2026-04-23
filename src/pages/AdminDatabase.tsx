import { useState, useEffect, useRef } from 'react';
import { Lock, Database, ChevronDown, ChevronUp, Plus, Pencil, Trash2, Save, X, Check } from 'lucide-react';
import {
  verifyDbPin, updateDbPin,
  fetchAllDrivers, upsertDriver, deleteDriver,
  fetchAllShafts, upsertShaft, deleteShaft,
} from '../lib/database';
import type { ShaftProductRow } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

type DriverRow = Record<string, unknown>;

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        value ? 'bg-[#185FA5]' : 'bg-gray-300'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        value ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value.join(', '));
  return (
    <input
      type="text"
      value={raw}
      placeholder={placeholder ?? 'kommagetrennt'}
      onChange={e => {
        setRaw(e.target.value);
        onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean));
      }}
      className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
    />
  );
}

function FlexCheckboxes({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const ALL = ['L', 'A', 'R', 'S', 'X'];
  return (
    <div className="flex gap-2">
      {ALL.map(f => (
        <label key={f} className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={value.includes(f)}
            onChange={e => {
              if (e.target.checked) onChange([...value, f]);
              else onChange(value.filter(x => x !== f));
            }}
            className="accent-[#185FA5]"
          />
          <span className="text-sm font-medium">{f}</span>
        </label>
      ))}
    </div>
  );
}

function TempoCheckboxes({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const OPTIONS = [
    { id: 'slow', label: 'Langsam' },
    { id: 'medium', label: 'Mittel' },
    { id: 'fast', label: 'Schnell' },
  ];
  return (
    <div className="flex gap-3">
      {OPTIONS.map(o => (
        <label key={o.id} className="flex items-center gap-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={value.includes(o.id)}
            onChange={e => {
              if (e.target.checked) onChange([...value, o.id]);
              else onChange(value.filter(x => x !== o.id));
            }}
            className="accent-[#185FA5]"
          />
          <span className="text-sm">{o.label}</span>
        </label>
      ))}
    </div>
  );
}

// ── PIN screen ────────────────────────────────────────────────────────────────

function PinScreen({ onSuccess }: { onSuccess: () => void }) {
  const [digits, setDigits] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  async function submit(pin: string) {
    setLoading(true);
    setError('');
    const ok = await verifyDbPin(pin);
    if (ok) {
      sessionStorage.setItem('db_pin_verified', 'true');
      onSuccess();
    } else {
      setError('Falscher Code. Bitte erneut versuchen.');
      setDigits(['', '', '', '']);
      refs[0].current?.focus();
    }
    setLoading(false);
  }

  function handleChange(idx: number, val: string) {
    const v = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    if (v && idx < 3) refs[idx + 1].current?.focus();
    if (v && idx === 3) {
      const pin = [...next.slice(0, 3), v].join('');
      if (pin.length === 4) submit(pin);
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F6] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-sm text-center">
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock size={26} className="text-[#185FA5]" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Datenbankzugang</h1>
        <p className="text-sm text-gray-500 mb-6">Bitte 4-stelligen Code eingeben</p>

        <div className="flex justify-center gap-3 mb-4">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={refs[i]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-xl
                focus:outline-none focus:border-[#185FA5] transition-colors"
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}
        {loading && (
          <p className="text-sm text-gray-400">Prüfen…</p>
        )}
      </div>
    </div>
  );
}

// ── DriverTable ───────────────────────────────────────────────────────────────

const EMPTY_DRIVER: DriverRow = {
  brand: '', model: '', loft_options: [], cog_type: 'low-back',
  draw_bias: false, low_spin: false, high_moi: false,
  weight_adjustable: false, weight_options: [], moi_rating: 'average',
  available_in_shop: true, notes: '',
};

function DriverForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: DriverRow;
  onSave: (d: DriverRow) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [d, setD] = useState<DriverRow>({ ...initial });
  const set = (k: string, v: unknown) => setD(p => ({ ...p, [k]: v }));

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Marke</label>
          <input value={d.brand as string} onChange={e => set('brand', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Modell</label>
          <input value={d.model as string} onChange={e => set('model', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Loft-Optionen</label>
          <TagsInput value={d.loft_options as string[]} onChange={v => set('loft_options', v)} placeholder="z.B. 9, 10.5, 12" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">CoG-Typ</label>
          <select value={d.cog_type as string} onChange={e => set('cog_type', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="low-back">Low-Back</option>
            <option value="low-forward">Low-Forward</option>
            <option value="adjustable">Adjustable</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">MOI-Rating</label>
          <select value={d.moi_rating as string} onChange={e => set('moi_rating', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="high">Hoch</option>
            <option value="above-average">Überdurchschnittlich</option>
            <option value="average">Durchschnittlich</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Gewichts-Optionen</label>
          <TagsInput value={d.weight_options as string[]} onChange={v => set('weight_options', v)} placeholder="z.B. front, back, neutral" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {[
          { k: 'draw_bias', label: 'Draw-Bias' },
          { k: 'low_spin', label: 'Low-Spin' },
          { k: 'high_moi', label: 'High-MOI' },
          { k: 'weight_adjustable', label: 'Gewicht einstellbar' },
          { k: 'available_in_shop', label: 'Im Shop' },
        ].map(({ k, label }) => (
          <div key={k} className="flex items-center gap-2">
            <Toggle value={d[k] as boolean} onChange={v => set(k, v)} />
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Notizen</label>
        <textarea value={d.notes as string} onChange={e => set('notes', e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel}
          className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
          <X size={14} /> Abbrechen
        </button>
        <button onClick={() => onSave(d)} disabled={isSaving}
          className="px-4 py-1.5 text-sm bg-[#185FA5] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50">
          <Save size={14} /> {isSaving ? 'Speichern…' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}

function DriverTable() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  async function load() {
    setIsLoading(true);
    try {
      setDrivers(await fetchAllDrivers());
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(d: DriverRow) {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await upsertDriver(d);
      await load();
      setEditingId(null);
      setShowAddForm(false);
    } catch {
      setErrorMsg('Fehler beim Speichern. Bitte erneut versuchen.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Driver wirklich löschen?')) return;
    setIsDeleting(id);
    setErrorMsg('');
    try {
      await deleteDriver(id);
      await load();
    } catch {
      setErrorMsg('Fehler beim Löschen.');
    } finally {
      setIsDeleting(null);
    }
  }

  if (isLoading) return <div className="text-sm text-gray-400 py-8 text-center">Laden…</div>;

  return (
    <div>
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-3">{errorMsg}</div>
      )}

      {/* Add form */}
      {showAddForm && (
        <DriverForm
          initial={{ ...EMPTY_DRIVER }}
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
          isSaving={isSaving}
        />
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="px-3 py-2 text-left">Marke</th>
              <th className="px-3 py-2 text-left">Modell</th>
              <th className="px-3 py-2 text-left">Loft</th>
              <th className="px-3 py-2 text-left">CoG</th>
              <th className="px-3 py-2 text-center">Draw</th>
              <th className="px-3 py-2 text-center">Low-Spin</th>
              <th className="px-3 py-2 text-center">High-MOI</th>
              <th className="px-3 py-2 text-center">Im Shop</th>
              <th className="px-3 py-2 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(dr => (
              editingId === (dr.id as string) ? (
                <tr key={dr.id as string}>
                  <td colSpan={9} className="p-0">
                    <DriverForm
                      initial={dr}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                      isSaving={isSaving}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={dr.id as string} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{dr.brand as string}</td>
                  <td className="px-3 py-2">{dr.model as string}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">
                    {(dr.loft_options as string[]).join(', ')}
                  </td>
                  <td className="px-3 py-2 text-xs">{dr.cog_type as string}</td>
                  <td className="px-3 py-2 text-center">
                    {dr.draw_bias ? <Check size={14} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {dr.low_spin ? <Check size={14} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {dr.high_moi ? <Check size={14} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {dr.available_in_shop ? <Check size={14} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditingId(dr.id as string)}
                        className="p-1.5 text-gray-400 hover:text-[#185FA5] hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(dr.id as string)}
                        disabled={isDeleting === (dr.id as string)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => { setShowAddForm(true); setEditingId(null); }}
        className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-[#185FA5] border border-[#185FA5]
          rounded-xl hover:bg-blue-50 transition-colors"
      >
        <Plus size={16} /> Neuen Driver hinzufügen
      </button>
    </div>
  );
}

// ── ShaftTable ────────────────────────────────────────────────────────────────

const EMPTY_SHAFT: Partial<ShaftProductRow> = {
  brand: '', name: '', weight_g: 60, flex_options: ['R', 'S'],
  torque_deg: 3.5, kick_point: 'mittel', launch_profile: 'mittel',
  spin_profile: 'mittel', tempo_match: ['medium'],
  speed_range_min: 85, speed_range_max: 115,
  tags: [], description: '', is_primary: false, available: true,
  cpm_l: null, cpm_a: null, cpm_r: null, cpm_s: null, cpm_x: null,
};

function ShaftForm({
  initial,
  onSave,
  onCancel,
  isSaving,
}: {
  initial: Partial<ShaftProductRow>;
  onSave: (s: Partial<ShaftProductRow>) => void;
  onCancel: () => void;
  isSaving: boolean;
}) {
  const [s, setS] = useState<Partial<ShaftProductRow>>({ ...initial });
  const set = (k: keyof ShaftProductRow, v: unknown) =>
    setS(p => ({ ...p, [k]: v }));

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Marke</label>
          <input value={s.brand ?? ''} onChange={e => set('brand', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Name</label>
          <input value={s.name ?? ''} onChange={e => set('name', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Gewicht (g)</label>
          <input type="number" min={40} max={100} value={s.weight_g ?? 60}
            onChange={e => set('weight_g', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        {([
          ['L', 'cpm_l', 'CPM Ladies'],
          ['A', 'cpm_a', 'CPM Senior (A)'],
          ['R', 'cpm_r', 'CPM Regular'],
          ['S', 'cpm_s', 'CPM Stiff'],
          ['X', 'cpm_x', 'CPM X-Stiff'],
        ] as [string, keyof ShaftProductRow, string][])
          .filter(([flex]) => (s.flex_options ?? []).includes(flex))
          .map(([, key, label]) => (
            <div key={key}>
              <label className="text-xs text-gray-500 mb-1 block">{label}</label>
              <input
                type="number" min={150} max={400} step={1}
                value={(s[key] as number | null) ?? ''}
                placeholder="—"
                onChange={e => set(key, e.target.value === '' ? null : Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          ))
        }
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Torque (°)</label>
          <input type="number" min={1} max={8} step={0.1} value={s.torque_deg ?? 3.5}
            onChange={e => set('torque_deg', Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Kick-Point</label>
          <select value={s.kick_point ?? 'mittel'} onChange={e => set('kick_point', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="niedrig">Niedrig</option>
            <option value="mittel-niedrig">Mittel-Niedrig</option>
            <option value="mittel">Mittel</option>
            <option value="mittel-hoch">Mittel-Hoch</option>
            <option value="hoch">Hoch</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Launch-Profil</label>
          <select value={s.launch_profile ?? 'mittel'} onChange={e => set('launch_profile', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="hoch">Hoch</option>
            <option value="mittel-hoch">Mittel-Hoch</option>
            <option value="mittel">Mittel</option>
            <option value="niedrig-mittel">Niedrig-Mittel</option>
            <option value="niedrig">Niedrig</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Spin-Profil</label>
          <select value={s.spin_profile ?? 'mittel'} onChange={e => set('spin_profile', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300">
            <option value="hoch">Hoch</option>
            <option value="mittel-hoch">Mittel-Hoch</option>
            <option value="mittel">Mittel</option>
            <option value="niedrig">Niedrig</option>
            <option value="sehr-niedrig">Sehr-Niedrig</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Speed-Bereich (mph)</label>
          <div className="flex gap-2 items-center">
            <input type="number" min={50} max={130} value={s.speed_range_min ?? 85}
              onChange={e => set('speed_range_min', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
            <span className="text-gray-400 text-sm">–</span>
            <input type="number" min={50} max={140} value={s.speed_range_max ?? 115}
              onChange={e => set('speed_range_max', Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Flex-Optionen</label>
        <FlexCheckboxes
          value={s.flex_options ?? []}
          onChange={v => set('flex_options', v)}
        />
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Tempo-Match</label>
        <TempoCheckboxes
          value={s.tempo_match ?? []}
          onChange={v => set('tempo_match', v)}
        />
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Tags</label>
        <TagsInput value={s.tags ?? []} onChange={v => set('tags', v)} />
      </div>

      <div className="mb-3">
        <label className="text-xs text-gray-500 mb-1 block">Beschreibung</label>
        <textarea value={s.description ?? ''} onChange={e => set('description', e.target.value)} rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
      </div>

      <div className="flex gap-4 mb-3">
        <div className="flex items-center gap-2">
          <Toggle value={s.is_primary ?? false} onChange={v => set('is_primary', v)} />
          <span className="text-xs text-gray-600">Primär</span>
        </div>
        <div className="flex items-center gap-2">
          <Toggle value={s.available ?? true} onChange={v => set('available', v)} />
          <span className="text-xs text-gray-600">Verfügbar</span>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onCancel}
          className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
          <X size={14} /> Abbrechen
        </button>
        <button onClick={() => onSave(s)} disabled={isSaving}
          className="px-4 py-1.5 text-sm bg-[#185FA5] text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 disabled:opacity-50">
          <Save size={14} /> {isSaving ? 'Speichern…' : 'Speichern'}
        </button>
      </div>
    </div>
  );
}

function ShaftTable() {
  const [shafts, setShafts] = useState<ShaftProductRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  async function load() {
    setIsLoading(true);
    setLoadError(null);
    try {
      const rows = await fetchAllShafts();
      console.log('fetchAllShafts Ergebnis:', rows.length, 'Einträge');
      setShafts(rows);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('ShaftTable load Fehler:', err);
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(s: Partial<ShaftProductRow>) {
    setIsSaving(true);
    setErrorMsg('');
    try {
      await upsertShaft(s);
      await load();
      setEditingId(null);
      setShowAddForm(false);
    } catch {
      setErrorMsg('Fehler beim Speichern. Bitte erneut versuchen.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Schaft wirklich löschen?')) return;
    setIsDeleting(id);
    setErrorMsg('');
    try {
      await deleteShaft(id);
      await load();
    } catch {
      setErrorMsg('Fehler beim Löschen.');
    } finally {
      setIsDeleting(null);
    }
  }

  if (isLoading) return <div className="text-sm text-gray-400 py-8 text-center">Laden…</div>;

  if (loadError) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
      <p className="text-sm font-semibold text-red-700 mb-1">Fehler beim Laden der Schäfte</p>
      <p className="text-xs text-red-600 font-mono break-all">{loadError}</p>
      <p className="text-xs text-red-500 mt-2">Supabase-Tabellenname prüfen: <code>shaft_products</code></p>
      <button onClick={load} className="mt-3 text-xs text-[#185FA5] underline">Erneut versuchen</button>
    </div>
  );

  return (
    <div>
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-3">{errorMsg}</div>
      )}

      {showAddForm && (
        <ShaftForm
          initial={{ ...EMPTY_SHAFT }}
          onSave={handleSave}
          onCancel={() => setShowAddForm(false)}
          isSaving={isSaving}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
              <th className="px-3 py-2 text-left">Marke</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-center">Gew.</th>
              <th className="px-3 py-2 text-left">Flex</th>
              <th className="px-3 py-2 text-left">Launch</th>
              <th className="px-3 py-2 text-left">Spin</th>
              <th className="px-3 py-2 text-left">CPM</th>
              <th className="px-3 py-2 text-center">Primär</th>
              <th className="px-3 py-2 text-center">Verfügbar</th>
              <th className="px-3 py-2 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {shafts.map(sh => (
              editingId === sh.id ? (
                <tr key={sh.id}>
                  <td colSpan={10} className="p-0">
                    <ShaftForm
                      initial={sh}
                      onSave={handleSave}
                      onCancel={() => setEditingId(null)}
                      isSaving={isSaving}
                    />
                  </td>
                </tr>
              ) : (
                <tr key={sh.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{sh.brand}</td>
                  <td className="px-3 py-2">{sh.name}</td>
                  <td className="px-3 py-2 text-center text-xs text-gray-500">{sh.weight_g}g</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{sh.flex_options.join(', ')}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{sh.launch_profile}</td>
                  <td className="px-3 py-2 text-xs text-gray-500">{sh.spin_profile}</td>
                  <td className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
                    {([
                      ['L', sh.cpm_l],
                      ['A', sh.cpm_a],
                      ['R', sh.cpm_r],
                      ['S', sh.cpm_s],
                      ['X', sh.cpm_x],
                    ] as [string, number | null][])
                      .filter(([, v]) => v !== null && v !== undefined)
                      .map(([f, v]) => `${f}: ${v}`)
                      .join(' · ') || <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {sh.is_primary ? <Check size={14} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {sh.available ? <Check size={14} className="text-green-500 mx-auto" /> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditingId(sh.id)}
                        className="p-1.5 text-gray-400 hover:text-[#185FA5] hover:bg-blue-50 rounded-lg transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(sh.id)}
                        disabled={isDeleting === sh.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => { setShowAddForm(true); setEditingId(null); }}
        className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-[#185FA5] border border-[#185FA5]
          rounded-xl hover:bg-blue-50 transition-colors"
      >
        <Plus size={16} /> Neuen Schaft hinzufügen
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminDatabase() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('db_pin_verified') === 'true'
  );
  const [activeTab, setActiveTab] = useState<'driver' | 'schaefte'>('driver');
  const [driverCount, setDriverCount] = useState<number | null>(null);
  const [shaftCount, setShaftCount] = useState<number | null>(null);
  const [newPin, setNewPin] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAllDrivers().then(d => setDriverCount(d.length)).catch(e => console.error('driverCount Fehler:', e));
    fetchAllShafts().then(s => setShaftCount(s.length)).catch(e => console.error('shaftCount Fehler:', e));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <PinScreen onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Database size={20} className="text-[#185FA5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Datenbank</h1>
            <p className="text-sm text-gray-500">Driver und Schäfte verwalten</p>
          </div>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('db_pin_verified');
            setIsAuthenticated(false);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 border border-gray-200
            rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
        >
          <Lock size={13} /> Abmelden
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'driver' as const, label: `Driver${driverCount !== null ? ` (${driverCount})` : ''}` },
          { id: 'schaefte' as const, label: `Schäfte${shaftCount !== null ? ` (${shaftCount})` : ''}` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-[#185FA5] text-[#185FA5]'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'driver'   && <DriverTable />}
      {activeTab === 'schaefte' && <ShaftTable />}

      {/* Einstellungen */}
      <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden">
        <button
          onClick={() => setSettingsOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Einstellungen
          {settingsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {settingsOpen && (
          <div className="px-4 py-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 mb-3">Zugangscode ändern</h3>
            <div className="flex gap-2 max-w-xs">
              <input
                type="password"
                placeholder="Neuer 4-stelliger Code"
                maxLength={4}
                value={newPin}
                onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={async () => {
                  if (newPin.length !== 4) return;
                  await updateDbPin(newPin);
                  alert('Code wurde geändert.');
                  setNewPin('');
                }}
                disabled={newPin.length !== 4}
                className="px-4 py-1.5 text-sm bg-[#185FA5] text-white rounded-lg hover:bg-blue-700
                  transition-colors disabled:opacity-40"
              >
                Speichern
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Nur Ziffern, genau 4-stellig.</p>
          </div>
        )}
      </div>
    </div>
  );
}
