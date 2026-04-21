import { useState } from 'react';
import { computeSG, type HcpLevel } from '../lib/strokesGained';

const HCP_OPTIONS: { value: HcpLevel; label: string }[] = [
  { value: 0,  label: 'Tour Pro' },
  { value: 5,  label: 'HCP 0–5' },
  { value: 10, label: 'HCP 6–10' },
  { value: 15, label: 'HCP 11–18' },
  { value: 25, label: 'HCP 19–28' },
];

interface SetupState {
  carryDistanceM: number;
  deviationM: number;
  holeLengthM: number;
}

interface Props {
  initialA?: Partial<SetupState>;
  initialHcp?: HcpLevel;
}

function pct(v: number) { return `${(v * 100).toFixed(1)}%`; }
function fmtSG(v: number) {
  const sign = v > 0 ? '+' : '';
  return `${sign}${v.toFixed(3)}`;
}

export default function StrokesGainedTool({ initialA, initialHcp }: Props) {
  const [hcp, setHcp] = useState<HcpLevel>(initialHcp ?? 15);
  const [a, setA] = useState<SetupState>({ carryDistanceM: 220, deviationM: 20, holeLengthM: 380, ...initialA });
  const [b, setB] = useState<SetupState>({ carryDistanceM: 240, deviationM: 18, holeLengthM: 380 });

  const resA = computeSG({ ...a, hcp });
  const resB = computeSG({ ...b, hcp });
  const delta = Math.round((resB.sg - resA.sg) * 1000) / 1000;
  const betterIsB = resB.sg > resA.sg;

  const NumberInput = ({ label, value, onChange, min, max, step = 1 }: {
    label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number;
  }) => (
    <div>
      <label className="block text-xs text-gray-500 mb-1 font-medium">{label}</label>
      <input
        type="number" value={value} min={min} max={max} step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
      />
    </div>
  );

  const SetupPanel = ({ title, state, setState, result, highlight }: {
    title: string; state: SetupState; setState: (s: SetupState) => void;
    result: ReturnType<typeof computeSG>; highlight: boolean;
  }) => (
    <div className={`rounded-xl border p-4 ${highlight ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}`}>
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid gap-3 mb-4">
        <NumberInput label="Carry-Distanz (m)" value={state.carryDistanceM}
          onChange={v => setState({ ...state, carryDistanceM: v })} min={100} max={350} />
        <NumberInput label="Seitl. Abweichung / Streuung (m)" value={state.deviationM}
          onChange={v => setState({ ...state, deviationM: v })} min={1} max={60} />
        <NumberInput label="Loch-Länge (m)" value={state.holeLengthM}
          onChange={v => setState({ ...state, holeLengthM: v })} min={200} max={600} />
      </div>
      <div className={`rounded-lg p-3 ${highlight ? 'bg-green-100' : 'bg-gray-50'}`}>
        <div className="text-2xl font-bold text-gray-900 mb-1">SG: {fmtSG(result.sg)}</div>
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-green-700">{pct(result.probFairway)}</div>
            <div>Fairway</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-yellow-600">{pct(result.probRough)}</div>
            <div>Rough</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">{pct(result.probOB)}</div>
            <div>OB</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Rest: {result.restDistanceM} m · Erw. Schläge: {result.expectedEnd.toFixed(2)}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Handicap-Stufe</label>
        <div className="flex flex-wrap gap-2">
          {HCP_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setHcp(opt.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                hcp === opt.value
                  ? 'bg-[#185FA5] text-white border-[#185FA5]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <SetupPanel title="Setup A (Aktuell)" state={a} setState={setA} result={resA} highlight={!betterIsB} />
        <SetupPanel title="Setup B (Neu)" state={b} setState={setB} result={resB} highlight={betterIsB} />
      </div>

      <div className={`rounded-xl border p-4 text-center ${betterIsB ? 'border-green-300 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <div className="text-lg font-bold text-gray-900 mb-1">
          Delta: {fmtSG(delta)} Schläge pro Runde
        </div>
        <p className="text-sm text-gray-600">
          {betterIsB
            ? `Setup B erzeugt ${Math.abs(delta).toFixed(3)} mehr Strokes Gained pro Loch als Setup A — über 18 Löcher: ${(Math.abs(delta) * 18).toFixed(2)} Schläge Vorteil.`
            : delta === 0
              ? 'Beide Setups sind gleichwertig.'
              : `Setup A ist ${Math.abs(delta).toFixed(3)} SG besser als Setup B.`
          }
        </p>
      </div>
    </div>
  );
}
