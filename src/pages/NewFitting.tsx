import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import FaceZonePicker from '../components/FaceZonePicker';
import SpinAxisSlider from '../components/SpinAxisSlider';
import { runAnalysis } from '../lib/analysisEngine';
import type {
  FittingInputs, ImpactZone, WeightSetting, MonitorType,
  CustomerGoal, SwingTempo, PlayerProfile,
} from '../types';

const GOAL_CONFIG: Record<CustomerGoal, { label: string; icon: string; desc: string }> = {
  distance:    { label: 'Mehr Länge',         icon: '📏', desc: 'Maximale Distanz' },
  direction:   { label: 'Richtungskontrolle', icon: '🎯', desc: 'Mehr Fairways treffen' },
  shotshaping: { label: 'Shot-Shaping',       icon: '🔄', desc: 'Draw/Fade spielen' },
  trajectory:  { label: 'Flughöhe',           icon: '📈', desc: 'Höher oder flacher' },
};

const DEFAULT_GOALS: CustomerGoal[] = ['distance', 'direction', 'shotshaping', 'trajectory'];

function SortableGoalItem({ goal, rank }: { goal: CustomerGoal; rank: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: goal });
  const cfg = GOAL_CONFIG[goal];
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border mb-1.5 select-none ${
        rank === 0
          ? 'bg-[#EEF4F0] border-[#1E4D2B]'
          : 'bg-white border-[#C5D5C9]'
      }`}
      {...attributes}
      {...listeners}
    >
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
        style={{ backgroundColor: rank === 0 ? '#1E4D2B' : rank === 1 ? '#C9A84C' : '#8A9E8E' }}
      >
        {rank + 1}
      </div>
      <span className="text-base leading-none">{cfg.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800">{cfg.label}</div>
        <div className="text-xs text-gray-400">{cfg.desc}</div>
      </div>
      <span className="text-gray-300 text-sm">⠿</span>
    </div>
  );
}

const WEIGHT_OPTIONS: { value: WeightSetting; label: string }[] = [
  { value: 'draw',    label: 'Draw / Heel' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'fade',    label: 'Fade / Toe' },
  { value: 'front',   label: 'Front' },
  { value: 'back',    label: 'Back' },
];

const HOSEL_OPTIONS = ['Neutral', '+0.5°', '+1°', '-0.5°', '-1°', 'Draw', 'Fade'];

const TEMPO_OPTIONS: { id: SwingTempo; label: string; desc: string }[] = [
  { id: 'slow',   label: 'Langsam',  desc: 'Flüssig, langer Rhythmus' },
  { id: 'medium', label: 'Mittel',   desc: 'Ausgeglichen' },
  { id: 'fast',   label: 'Schnell',  desc: 'Explosiver Übergang' },
];

const defaultInputs: FittingInputs = {
  customerName: '',
  handicap: null,
  fitterName: '',
  currentDriverModel: '',
  currentLoft: 10.5,
  shaftWeightG: 60,
  weightSetting: 'neutral',
  hoselSetting: 'Neutral',
  clubSpeedMph: 95,
  ballSpeedMph: 140,
  launchAngleDeg: 12,
  aoaDeg: -2,
  backspinRpm: 2800,
  spinAxisDeg: 0,
  monitorType: 'radar',
  impactZone: 'sweetspot',
  customerGoals: DEFAULT_GOALS,
  tempo: 'medium',
  clubPathDeg: null,
  faceAngleDeg: null,
  playerProfile: 'equipment-maxer',
};

interface SectionProps { title: string; children: React.ReactNode; }
function Section({ title, children }: SectionProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface FieldProps { label: string; children: React.ReactNode; hint?: string; optional?: boolean; }
function Field({ label, children, hint, optional }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
        {label}
        {optional && (
          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
            optional
          </span>
        )}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
  );
}

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-colors';
const selectCls = inputCls;

export default function NewFitting() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState<FittingInputs>(defaultInputs);
  const [liveSF, setLiveSF] = useState<number>(0);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (inputs.clubSpeedMph > 0) {
      setLiveSF(Math.round((inputs.ballSpeedMph / inputs.clubSpeedMph) * 1000) / 1000);
    }
  }, [inputs.ballSpeedMph, inputs.clubSpeedMph]);

  function set<K extends keyof FittingInputs>(key: K, value: FittingInputs[K]) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function handleGoalDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setInputs(prev => ({
      ...prev,
      customerGoals: arrayMove(
        prev.customerGoals,
        prev.customerGoals.indexOf(active.id as CustomerGoal),
        prev.customerGoals.indexOf(over.id as CustomerGoal)
      ),
    }));
  }

  function handleSubmit() {
    const result = runAnalysis(inputs);
    navigate('/fitting/result', { state: { inputs, result } });
  }

  const smashColor = liveSF >= 1.48 ? '#1D9E75' : liveSF >= 1.44 ? '#BA7517' : '#E24B4A';

  // Live Face-to-Path Berechnung
  const liveFtp = inputs.clubPathDeg !== null && inputs.faceAngleDeg !== null
    ? Math.round((inputs.faceAngleDeg - inputs.clubPathDeg) * 10) / 10
    : null;
  const ftpLabel = liveFtp === null ? null
    : liveFtp > 3  ? '→ Fade/Slice-Tendenz'
    : liveFtp < -3 ? '→ Draw/Hook-Tendenz'
    : '→ Neutral';
  const ftpWarn = liveFtp !== null && Math.abs(liveFtp) > 5;

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 lg:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Neues Fitting</h1>
        <p className="text-gray-500 text-sm mt-1">Alle Pflichtfelder ausfüllen, dann Analyse starten.</p>
      </div>

      {/* Desktop: 2-column grid. Mobile/tablet: single column. */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

        {/* Left column: Schläger + Trefferzone */}
        <div>
          <Section title="1 · Kunde & Schläger">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Kundenname">
                <input className={inputCls} value={inputs.customerName}
                  onChange={e => set('customerName', e.target.value)} placeholder="Max Mustermann" />
              </Field>
              <Field label="Handicap">
                <input className={inputCls} type="number" step="0.1" value={inputs.handicap ?? ''}
                  onChange={e => set('handicap', e.target.value ? parseFloat(e.target.value) : null)}
                  placeholder="z.B. 18.0" />
              </Field>
              <Field label="Fitter">
                <input className={inputCls} value={inputs.fitterName}
                  onChange={e => set('fitterName', e.target.value)} placeholder="Fitter-Name" />
              </Field>
              <Field label="Aktuelles Driver-Modell">
                <input className={inputCls} value={inputs.currentDriverModel}
                  onChange={e => set('currentDriverModel', e.target.value)} placeholder="z.B. TaylorMade Qi10" />
              </Field>
              <Field label="Statisches Loft (°)">
                <input className={inputCls} type="number" step="0.5" value={inputs.currentLoft}
                  onChange={e => set('currentLoft', parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Schaftgewicht (g)">
                <input className={inputCls} type="number" value={inputs.shaftWeightG}
                  onChange={e => set('shaftWeightG', parseInt(e.target.value) || 0)} />
              </Field>
              <Field label="Schwungtempo">
                <div className="flex gap-1.5">
                  {TEMPO_OPTIONS.map(opt => (
                    <button
                      key={opt.id} type="button"
                      onClick={() => set('tempo', opt.id)}
                      title={opt.desc}
                      className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${
                        inputs.tempo === opt.id
                          ? 'bg-[#185FA5] text-white border-[#185FA5]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Gewichtseinstellung">
                <select className={selectCls} value={inputs.weightSetting}
                  onChange={e => set('weightSetting', e.target.value as WeightSetting)}>
                  {WEIGHT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </Field>
              <Field label="Hosel-Setting">
                <select className={selectCls} value={inputs.hoselSetting}
                  onChange={e => set('hoselSetting', e.target.value)}>
                  {HOSEL_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>
          </Section>

          <Section title="3 · Trefferzone">
            <FaceZonePicker value={inputs.impactZone} onZoneSelect={z => set('impactZone', z as ImpactZone)} />
          </Section>
        </div>

        {/* Right column: Messwerte + D-Plane + Ziele + Spielerprofil + Button */}
        <div>
          <Section title="2 · Messwerte (Durchschnitte)">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Monitor-Typ</label>
              <div className="flex gap-2">
                {(['radar', 'camera'] as MonitorType[]).map(t => (
                  <button
                    key={t} type="button"
                    onClick={() => set('monitorType', t)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      inputs.monitorType === t
                        ? 'bg-[#185FA5] text-white border-[#185FA5]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {t === 'radar' ? 'Radar (Trackman, GC3…)' : 'Kamera (Foresight, GC Quad…)'}
                  </button>
                ))}
              </div>
              {inputs.monitorType === 'camera' && (
                <p className="text-xs text-amber-600 mt-1.5 font-medium">
                  Kamera-Korrektur aktiv: AoA wird für PING Chart um −2° angepasst.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Club Speed (mph)">
                <input className={inputCls} type="number" step="0.5" value={inputs.clubSpeedMph}
                  onChange={e => set('clubSpeedMph', parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Ball Speed (mph)">
                <input className={inputCls} type="number" step="0.5" value={inputs.ballSpeedMph}
                  onChange={e => set('ballSpeedMph', parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Smash Factor (live)">
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50"
                  style={{ color: smashColor }}>
                  {liveSF > 0 ? liveSF.toFixed(3) : '—'}
                </div>
              </Field>
              <Field label="Launch Angle (°)">
                <input className={inputCls} type="number" step="0.5" value={inputs.launchAngleDeg}
                  onChange={e => set('launchAngleDeg', parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Angle of Attack (°)" hint="Negativ = von oben">
                <input className={inputCls} type="number" step="0.5" value={inputs.aoaDeg}
                  onChange={e => set('aoaDeg', parseFloat(e.target.value) || 0)} />
              </Field>
              <Field label="Backspin (RPM)">
                <input className={inputCls} type="number" step="50" value={inputs.backspinRpm}
                  onChange={e => set('backspinRpm', parseInt(e.target.value) || 0)} />
              </Field>
            </div>

            <div className="mt-4">
              <Field label="Spin-Achse (°)">
                <SpinAxisSlider value={inputs.spinAxisDeg} onChange={v => set('spinAxisDeg', v)} />
              </Field>
            </div>

            {/* Club Path + Face Angle (optional) */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wide">
                D-Plane — optional, aktiviert erweiterte Analyse
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Club Path (°)" optional hint="In-to-Out = positiv · Out-to-In = negativ">
                  <input
                    className={inputCls}
                    type="number"
                    step="0.5"
                    min="-20"
                    max="20"
                    placeholder="z.B. −4"
                    value={inputs.clubPathDeg ?? ''}
                    onChange={e => set('clubPathDeg', e.target.value === '' ? null : parseFloat(e.target.value))}
                  />
                </Field>
                <Field label="Face Angle (°)" optional hint="Open = positiv · Closed = negativ">
                  <input
                    className={inputCls}
                    type="number"
                    step="0.5"
                    min="-15"
                    max="15"
                    placeholder="z.B. +3"
                    value={inputs.faceAngleDeg ?? ''}
                    onChange={e => set('faceAngleDeg', e.target.value === '' ? null : parseFloat(e.target.value))}
                  />
                </Field>
              </div>

              {/* Live Face-to-Path Anzeige */}
              {liveFtp !== null && (
                <div className={`mt-3 flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm ${
                  ftpWarn
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}>
                  <span className="text-gray-500 text-xs font-medium">Face-to-Path</span>
                  <span className={`font-bold text-base ${ftpWarn ? 'text-amber-600' : 'text-[#185FA5]'}`}>
                    {liveFtp > 0 ? '+' : ''}{liveFtp}°
                  </span>
                  <span className={`text-xs ml-auto ${ftpWarn ? 'text-amber-600' : 'text-gray-500'}`}>
                    {ftpLabel}
                  </span>
                </div>
              )}
            </div>
          </Section>

          <Section title="4 · Kundenziele">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleGoalDragEnd}
            >
              <SortableContext items={inputs.customerGoals} strategy={verticalListSortingStrategy}>
                {inputs.customerGoals.map((goal, index) => (
                  <SortableGoalItem key={goal} goal={goal} rank={index} />
                ))}
              </SortableContext>
            </DndContext>
            <p className="text-xs text-gray-400 mt-1">Ziel 1 hat höchste Priorität. Per Drag & Drop umsortieren.</p>
          </Section>

          {/* Section 5: Spielerprofil */}
          <Section title="5 · Spielerprofil — Wie soll die Empfehlung ausgerichtet sein?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(
                [
                  {
                    id: 'tech-optimizer' as PlayerProfile,
                    icon: '🎯',
                    title: 'Technik-Optimierer',
                    desc: 'Der Spieler arbeitet aktiv an seiner Technik. Equipment überbrückt kurzfristig — Empfehlungen berücksichtigen, was sich durch Technik verbessern wird.',
                    tags: ['Technik-Tipps', 'Korrekturbedarf in Grad', 'Übergangs-Equipment'],
                  },
                  {
                    id: 'equipment-maxer' as PlayerProfile,
                    icon: '🔧',
                    title: 'Equipment-Maximierer',
                    desc: 'Der Spieler spielt so wie er spielt — kein aktives Training geplant. Schläger wird maximal auf den aktuellen Schwung zugeschnitten.',
                    tags: ['Maximale Kompensation', 'Draw-Bias / Fade-Bias', 'Hohes MOI'],
                  },
                ] as const
              ).map(opt => {
                const active = inputs.playerProfile === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => set('playerProfile', opt.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      active
                        ? 'border-[#185FA5] bg-blue-50 ring-1 ring-[#185FA5]'
                        : 'border-gray-200 bg-white hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2">{opt.icon}</div>
                    <div className={`font-semibold text-sm mb-1.5 ${active ? 'text-[#185FA5]' : 'text-gray-900'}`}>
                      {opt.title}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-2">{opt.desc}</p>
                    <div className="flex flex-wrap gap-1">
                      {opt.tags.map(tag => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${
                          active ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <button
            onClick={handleSubmit}
            className="w-full bg-[#185FA5] hover:bg-blue-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors text-base"
          >
            <Zap size={18} />
            Analyse starten
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
