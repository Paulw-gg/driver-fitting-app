import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Info } from 'lucide-react';
import {
  recommendShaft,
  mphToKmh,
  kmhToMph,
  getFlexLabel,
  type Tempo,
  type ShaftOption,
} from '../lib/shaftRecommendation';

// ── Tag colour coding ────────────────────────────────────────────────────────

const BLUE_TAGS = ['hoch-launch', 'mittel-hoch-launch', 'ultra-leicht', 'leicht', 'HL-Build', 'Senior', 'hoch'];
const AMBER_TAGS = ['low-spin', 'low-launch', 'very-low-spin', 'Tour-Pro'];
const GREEN_TAGS = ['counter-balanced', 'smooth', 'vielseitig', 'moderate Tempo'];

function tagCls(tag: string): string {
  if (BLUE_TAGS.some(t => tag.includes(t))) return 'bg-blue-100 text-blue-700';
  if (AMBER_TAGS.some(t => tag.includes(t))) return 'bg-amber-100 text-amber-700';
  if (GREEN_TAGS.some(t => tag.includes(t))) return 'bg-green-100 text-green-700';
  return 'bg-gray-100 text-gray-600';
}

// ── Flex badge colour ────────────────────────────────────────────────────────

function flexCls(flex: string): string {
  if (flex === 'L' || flex === 'A') return 'bg-blue-50 text-blue-600 border-blue-200';
  if (flex === 'R') return 'bg-green-50 text-green-700 border-green-200';
  if (flex === 'S') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-red-50 text-red-700 border-red-200'; // X
}

// ── Shaft card ───────────────────────────────────────────────────────────────

function ShaftCard({ shaft, primary }: { shaft: ShaftOption; primary: boolean }) {
  return (
    <div className={`rounded-xl border p-4 bg-white ${primary ? 'border-[#185FA5]' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="text-xs text-gray-400 font-medium">{shaft.brand}</div>
        {primary && (
          <span className="text-xs bg-[#185FA5] text-white px-2 py-0.5 rounded-full font-medium">
            Empfohlen
          </span>
        )}
      </div>
      <div className="font-bold text-gray-900 mb-2">{shaft.name}</div>

      {/* Tags: flex options */}
      <div className="flex flex-wrap gap-1 mb-2">
        {shaft.flexOptions.map(f => (
          <span key={f}
            className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${flexCls(f)}`}>
            {getFlexLabel(f).split(' ')[0]}
          </span>
        ))}
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
          {shaft.weightG}g
        </span>
      </div>

      {/* Feature tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {shaft.tags.map(t => (
          <span key={t} className={`text-xs px-2 py-0.5 rounded-full ${tagCls(t)}`}>{t}</span>
        ))}
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">{shaft.description}</p>

      <div className="mt-2 flex gap-3 text-xs text-gray-400">
        <span>Kick-Point: <strong className="text-gray-600">{shaft.kickPoint}</strong></span>
        <span>Torque: <strong className="text-gray-600">{shaft.torqueDeg}°</strong></span>
      </div>
    </div>
  );
}

// ── Metric card ──────────────────────────────────────────────────────────────

function MetricPill({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-xl font-bold text-[#185FA5]">{value}</div>
      {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── Tempo cards ──────────────────────────────────────────────────────────────

const TEMPO_OPTIONS: { id: Tempo; label: string; desc: string }[] = [
  { id: 'slow',   label: 'Langsam',  desc: 'Flüssig, kontrolliert, langer Rhythmus' },
  { id: 'medium', label: 'Mittel',   desc: 'Ausgeglichen, gleichmäßig' },
  { id: 'fast',   label: 'Schnell',  desc: 'Aggressiv, explosiver Übergang' },
];

// ── Main page ────────────────────────────────────────────────────────────────

export default function ShaftFitting() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initSpeed = Math.max(60, Math.min(130, parseInt(searchParams.get('speed') || '95')));
  const initTempo = (['slow', 'medium', 'fast'].includes(searchParams.get('tempo') ?? '')
    ? searchParams.get('tempo')
    : 'medium') as Tempo;

  const [speedMph, setSpeedMph] = useState(initSpeed);
  const [unit, setUnit] = useState<'mph' | 'kmh'>('mph');
  const [tempo, setTempo] = useState<Tempo>(initTempo);

  // The value shown / entered in the current unit
  const displaySpeed = unit === 'mph' ? speedMph : mphToKmh(speedMph);
  const minDisplay   = unit === 'mph' ? 60  : mphToKmh(60);
  const maxDisplay   = unit === 'mph' ? 130 : mphToKmh(130);

  function handleSpeedChange(raw: number) {
    const mph = unit === 'mph' ? raw : kmhToMph(raw);
    setSpeedMph(Math.max(60, Math.min(130, Math.round(mph))));
  }

  function switchUnit(newUnit: 'mph' | 'kmh') {
    setUnit(newUnit);
  }

  const result = recommendShaft(speedMph, tempo);

  const launchLabels: Record<string, string> = {
    'hoch': 'Hoch', 'mittel-hoch': 'Mittel-Hoch', 'mittel': 'Mittel',
    'niedrig-mittel': 'Niedrig-Mittel', 'niedrig': 'Niedrig',
  };

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Schaftberatung</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Flex- und Gewichtsempfehlung nach PING Co-Pilot Methodik
          </p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[340px_1fr] lg:gap-6 lg:items-start">

        {/* ── Left: Inputs ── */}
        <div className="space-y-4 mb-6 lg:mb-0">

          {/* Club Speed */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800 text-sm">Club Speed</h2>
              {/* Unit toggle */}
              <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
                {(['mph', 'kmh'] as const).map(u => (
                  <button key={u}
                    onClick={() => switchUnit(u)}
                    className={`px-3 py-1.5 font-medium transition-colors ${
                      unit === u ? 'bg-[#185FA5] text-white' : 'text-gray-500 hover:bg-gray-50'
                    }`}>
                    {u === 'mph' ? 'mph' : 'km/h'}
                  </button>
                ))}
              </div>
            </div>

            {/* Number display + input */}
            <div className="flex items-center gap-3 mb-3">
              <input
                type="number"
                value={displaySpeed}
                min={minDisplay}
                max={maxDisplay}
                onChange={e => handleSpeedChange(Number(e.target.value))}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-lg font-bold
                  text-[#185FA5] text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <span className="text-sm text-gray-500">{unit === 'mph' ? 'mph' : 'km/h'}</span>
              <span className="text-xs text-gray-400 ml-auto">
                ({unit === 'mph' ? mphToKmh(speedMph) : speedMph} {unit === 'mph' ? 'km/h' : 'mph'})
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min={minDisplay}
              max={maxDisplay}
              step={1}
              value={displaySpeed}
              onChange={e => handleSpeedChange(Number(e.target.value))}
              className="w-full accent-[#185FA5] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{minDisplay}</span>
              <span>{maxDisplay} {unit === 'mph' ? 'mph' : 'km/h'}</span>
            </div>
          </div>

          {/* Tempo */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-3">Schwungtempo</h2>
            <div className="flex flex-col gap-2">
              {TEMPO_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setTempo(opt.id)}
                  className={`w-full text-left rounded-lg border px-4 py-3 transition-all ${
                    tempo === opt.id
                      ? 'border-[#185FA5] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-400 bg-white'
                  }`}
                >
                  <div className={`font-semibold text-sm ${tempo === opt.id ? 'text-[#185FA5]' : 'text-gray-800'}`}>
                    {opt.label}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Results ── */}
        <div className="space-y-4">

          {/* Block 1: Metric cards */}
          <div className="grid grid-cols-3 gap-3">
            <MetricPill label="Flex" value={result.recommendedFlex} sub={result.flexLabel.split(' ')[0]} />
            <MetricPill label="Gewicht" value={result.weightRange} />
            <MetricPill label="Launch" value={launchLabels[result.launchProfile] ?? result.launchProfile} />
          </div>

          {/* Tempo adjustment note */}
          {result.tempoAdjustmentApplied && (
            <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50
              border border-blue-200 rounded-lg px-3 py-2">
              <Info size={13} className="flex-shrink-0" />
              Tempo-Korrektur angewendet: {result.tempoAdjustmentDirection === 'stiffer' ? 'eine Stufe steifer' : 'eine Stufe weicher'} als Speed-Basiswert
            </div>
          )}

          {/* Block 2: Primary shafts */}
          {result.primaryShafts.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#185FA5] text-white text-xs font-bold flex items-center justify-center">1</span>
                Primäre Empfehlungen
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.primaryShafts.map(s => (
                  <ShaftCard key={s.id} shaft={s} primary />
                ))}
              </div>
            </div>
          )}

          {/* Block 3: Alternatives */}
          {result.alternativeShafts.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-400 text-white text-xs font-bold flex items-center justify-center">2</span>
                Alternative Schäfte
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {result.alternativeShafts.map(s => (
                  <ShaftCard key={s.id} shaft={s} primary={false} />
                ))}
              </div>
            </div>
          )}

          {/* Block 4: Explanation */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm
            text-gray-700 leading-relaxed">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Begründung
            </div>
            {result.explanation}
          </div>

          {/* Block 5: Warnings */}
          {result.warnings.length > 0 && (
            <div className="space-y-2">
              {result.warnings.map((w, i) => (
                <div key={i}
                  className="flex items-start gap-2 bg-amber-50 border border-amber-200
                    rounded-xl px-4 py-3 text-sm text-amber-800">
                  <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                  {w}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
