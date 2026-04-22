import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Zap } from 'lucide-react';
import FaceZonePicker from '../components/FaceZonePicker';
import SpinAxisSlider from '../components/SpinAxisSlider';
import { runAnalysis } from '../lib/analysisEngine';
import type { FittingInputs, ImpactZone, WeightSetting, MonitorType, CustomerGoal, SwingTempo } from '../types';

const GOAL_OPTIONS: { id: CustomerGoal; label: string }[] = [
  { id: 'distance',    label: 'Mehr Länge' },
  { id: 'direction',   label: 'Richtungskontrolle' },
  { id: 'shotshaping', label: 'Shot-Shaping' },
  { id: 'trajectory',  label: 'Flughöhe' },
];

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
  customerGoals: [],
  tempo: 'medium',
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

interface FieldProps { label: string; children: React.ReactNode; hint?: string; }
function Field({ label, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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

  useEffect(() => {
    if (inputs.clubSpeedMph > 0) {
      setLiveSF(Math.round((inputs.ballSpeedMph / inputs.clubSpeedMph) * 1000) / 1000);
    }
  }, [inputs.ballSpeedMph, inputs.clubSpeedMph]);

  function set<K extends keyof FittingInputs>(key: K, value: FittingInputs[K]) {
    setInputs(prev => ({ ...prev, [key]: value }));
  }

  function toggleGoal(goal: CustomerGoal) {
    setInputs(prev => ({
      ...prev,
      customerGoals: prev.customerGoals.includes(goal)
        ? prev.customerGoals.filter(g => g !== goal)
        : [...prev.customerGoals, goal]
    }));
  }

  function handleSubmit() {
    const result = runAnalysis(inputs);
    navigate('/fitting/result', { state: { inputs, result } });
  }

  const smashColor = liveSF >= 1.48 ? '#1D9E75' : liveSF >= 1.44 ? '#BA7517' : '#E24B4A';

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 lg:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Neues Fitting</h1>
        <p className="text-gray-500 text-sm mt-1">Alle Felder ausfüllen, dann Analyse starten.</p>
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
                      key={opt.id}
                      type="button"
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

        {/* Right column: Messwerte + Ziele + Button */}
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
                <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold bg-gray-50" style={{ color: smashColor }}>
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
          </Section>

          <Section title="4 · Kundenziele">
            <div className="flex flex-wrap gap-3">
              {GOAL_OPTIONS.map(g => (
                <button
                  key={g.id} type="button"
                  onClick={() => toggleGoal(g.id)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                    inputs.customerGoals.includes(g.id)
                      ? 'bg-[#185FA5] text-white border-[#185FA5]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {g.label}
                </button>
              ))}
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
