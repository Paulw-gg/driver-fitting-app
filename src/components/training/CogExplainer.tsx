import { useState } from 'react';

type CogPos = 'low-back' | 'low-forward' | 'heel' | 'toe';

const COG_POSITIONS: {
  id: CogPos;
  cx: number;
  cy: number;
  color: string;
  label: string;
  info: string;
}[] = [
  {
    id: 'low-back',
    cx: 175,
    cy: 195,
    color: '#1D9E75',
    label: 'Low-Back CoG · Standard modern',
    info: '↑ Launch · ↓ Spin · ↑ MOI · Höhere Verzeihlichkeit',
  },
  {
    id: 'low-forward',
    cx: 90,
    cy: 195,
    color: '#185FA5',
    label: 'Low-Forward CoG · Low-Spin',
    info: '↓ Spin · Mehr Workability · Tour-Spieler',
  },
  {
    id: 'heel',
    cx: 78,
    cy: 150,
    color: '#EC4899',
    label: 'Heel-Bias · Draw',
    info: 'Draw-Spin durch Gear Effect · Slice-Kompensation',
  },
  {
    id: 'toe',
    cx: 210,
    cy: 150,
    color: '#7C3AED',
    label: 'Toe-Bias · Fade',
    info: 'Fade-Spin · Für Hook-Tendenz',
  },
];

export default function CogExplainer() {
  const [active, setActive] = useState<CogPos | null>(null);

  const activePos = COG_POSITIONS.find(p => p.id === active);

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 mb-3">
          Klicke auf eine CoG-Position für mehr Details
        </p>
        <svg viewBox="0 0 290 270" width="100%">
          <defs>
            <marker id="cog-arr" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5" orient="auto">
              <path d="M2 2L8 5L2 8" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </marker>
          </defs>

          {/* Driver head top-down view */}
          {/* Schlagfläche (rechts in Draufsicht) */}
          {/* Hosel oben-links */}

          {/* Main head shape: large rounded form */}
          <path
            d="M 62 60 C 62 40 90 30 145 28 C 200 26 240 40 245 80
               C 248 110 240 175 220 215 C 200 240 170 248 140 248
               C 110 248 80 240 68 215 C 55 190 55 150 62 60 Z"
            fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>

          {/* Schlagfläche (oben = vorne in top view) */}
          <path d="M 62 60 C 90 55 200 55 245 80"
            fill="none" stroke="#6B7280" strokeWidth="3" strokeLinecap="round"/>

          {/* Hosel */}
          <ellipse cx="72" cy="72" rx="14" ry="10" fill="#9CA3AF" opacity="0.6"/>
          <text x="72" y="76" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#6B7280">Hosel</text>

          {/* Face label */}
          <text x="154" y="52" textAnchor="middle" fontFamily="inherit"
            fontSize="9" fill="#6B7280" fontWeight="600">← Schlagfläche →</text>

          {/* Heel / Toe labels */}
          <text x="62" y="170" textAnchor="middle" fontFamily="inherit" fontSize="9" fill="#9CA3AF">Heel</text>
          <text x="248" y="170" textAnchor="middle" fontFamily="inherit" fontSize="9" fill="#9CA3AF">Toe</text>

          {/* CoG dots */}
          {COG_POSITIONS.map(pos => (
            <g key={pos.id} style={{ cursor: 'pointer' }}
              onClick={() => setActive(prev => prev === pos.id ? null : pos.id)}>
              <circle
                cx={pos.cx} cy={pos.cy} r={active === pos.id ? 14 : 11}
                fill={pos.color} opacity={active && active !== pos.id ? 0.3 : 0.9}
                style={{ transition: 'all 0.2s' }}/>
              {/* Cross symbol */}
              <line x1={pos.cx - 5} y1={pos.cy} x2={pos.cx + 5} y2={pos.cy}
                stroke="white" strokeWidth="1.5"/>
              <line x1={pos.cx} y1={pos.cy - 5} x2={pos.cx} y2={pos.cy + 5}
                stroke="white" strokeWidth="1.5"/>
            </g>
          ))}

          {/* Active label */}
          {activePos && (
            <text x="154" y="262" textAnchor="middle" fontFamily="inherit"
              fontSize="9" fontWeight="600" fill={activePos.color}>
              {activePos.label}
            </text>
          )}
        </svg>
      </div>

      {/* Info cards below */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {COG_POSITIONS.map(pos => (
          <div
            key={pos.id}
            onClick={() => setActive(prev => prev === pos.id ? null : pos.id)}
            className="rounded-xl border p-3 cursor-pointer transition-all"
            style={{
              borderColor: active === pos.id ? pos.color : '#E5E7EB',
              background: active === pos.id ? `${pos.color}14` : 'white',
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: pos.color }}/>
              <span className="text-xs font-semibold text-gray-800">{pos.label}</span>
            </div>
            <div className="text-xs text-gray-600">{pos.info}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
