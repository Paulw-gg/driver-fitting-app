import { useState } from 'react';

type WeightPos = 'heel' | 'neutral' | 'toe';

const INFO: Record<WeightPos, { text: string; flightDesc: string; color: string }> = {
  heel: {
    text: 'CoG Richtung Heel → Draw-Bias · Zentraler Treffer erzeugt jetzt leichten Linksspin durch Gear Effect. Ideal für Slice-Spieler.',
    flightDesc: '← leichter Draw',
    color: '#EC4899',
  },
  neutral: {
    text: 'CoG neutral · Kein Bias · Symmetrischer Gear Effect bei zentralem Treffer.',
    flightDesc: '↑ gerade',
    color: '#1D9E75',
  },
  toe: {
    text: 'CoG Richtung Toe → Fade-Bias · Zentraler Treffer erzeugt leichten Rechtsspin. Reduziert Hook-Tendenz.',
    flightDesc: 'leichter Fade →',
    color: '#7C3AED',
  },
};

// Weight position on rail: heel=0.15, neutral=0.5, toe=0.85 (fraction of rail width)
const WEIGHT_X: Record<WeightPos, number> = { heel: 0.15, neutral: 0.5, toe: 0.85 };

// CoG offset from center (in SVG units)
const COG_OFFSET: Record<WeightPos, number> = { heel: -22, neutral: 0, toe: 22 };

export default function CogWeightInteractive() {
  const [pos, setPos] = useState<WeightPos>('neutral');

  const info = INFO[pos];

  // SVG dimensions: viewBox 320 230
  // Head shape top-down, centered
  // Rail from heel to toe at y=155 (mid-head)
  // Weight circle slides along rail
  const heelX = 62;
  const toeX = 258;
  const railY = 155;
  const railWidth = toeX - heelX;
  const weightX = heelX + WEIGHT_X[pos] * railWidth;

  // CoG symbol
  const cogBaseX = 160;
  const cogX = cogBaseX + COG_OFFSET[pos];
  const cogY = 145;

  // Flight arrow (right side of SVG)
  const flightBaseX = 295;
  const flightBaseY = 125;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* SVG */}
      <svg viewBox="0 0 340 240" width="100%">
        <defs>
          <marker id="cogw-green" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="cogw-col" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke={info.color} strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* Driver head top-down */}
        <path
          d="M 55 55 C 55 35 80 25 135 23 C 185 21 225 35 230 65
             C 233 90 226 158 210 190 C 194 215 168 222 140 222
             C 112 222 88 215 74 190 C 60 168 55 120 55 55 Z"
          fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5"/>

        {/* Face */}
        <path d="M 55 55 C 80 50 195 50 230 65"
          fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round"/>

        {/* Hosel */}
        <ellipse cx="65" cy="65" rx="12" ry="8" fill="#D1D5DB"/>

        {/* Rail (weight track) */}
        <rect x={heelX} y={railY - 3} width={railWidth} height="6" rx="3" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1"/>
        <text x={heelX} y={railY + 18} textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#9CA3AF">Heel</text>
        <text x={toeX} y={railY + 18} textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#9CA3AF">Toe</text>

        {/* Weight circle */}
        <circle cx={weightX} cy={railY} r="12"
          fill="#F59E0B" stroke="#D97706" strokeWidth="2"
          style={{ transition: 'cx 0.35s cubic-bezier(0.4,0,0.2,1)' }}/>
        <text x={weightX} y={railY + 4} textAnchor="middle" fontFamily="inherit"
          fontSize="7.5" fontWeight="700" fill="#78350F">W</text>

        {/* CoG symbol */}
        <circle cx={cogX} cy={cogY} r="10" fill="none" stroke="#D97706" strokeWidth="2"
          style={{ transition: 'cx 0.35s cubic-bezier(0.4,0,0.2,1)' }}/>
        <line x1={cogX - 6} y1={cogY} x2={cogX + 6} y2={cogY}
          stroke="#D97706" strokeWidth="1.5"/>
        <line x1={cogX} y1={cogY - 6} x2={cogX} y2={cogY + 6}
          stroke="#D97706" strokeWidth="1.5"/>
        <text x={cogX} y={cogY - 14} textAnchor="middle" fontFamily="inherit" fontSize="7.5" fill="#D97706">CoG</text>

        {/* Ball flight symbol (right side) */}
        <circle cx={flightBaseX} cy={flightBaseY} r="14" fill="#FFFBEB" stroke="#E5E7EB" strokeWidth="1.5"/>
        <text x={flightBaseX} y={flightBaseY + 4} textAnchor="middle" fontFamily="inherit"
          fontSize="8" fill="#374151">Ball</text>

        {/* Flight arrow */}
        {pos === 'neutral' ? (
          <path d={`M ${flightBaseX} ${flightBaseY - 14} L ${flightBaseX} ${flightBaseY - 36}`}
            fill="none" stroke="#1D9E75" strokeWidth="2.5" markerEnd="url(#cogw-green)"
            style={{ transition: 'all 0.3s' }}/>
        ) : pos === 'heel' ? (
          <path d={`M ${flightBaseX - 4} ${flightBaseY - 13} C ${flightBaseX - 10} ${flightBaseY - 25} ${flightBaseX - 18} ${flightBaseY - 33} ${flightBaseX - 22} ${flightBaseY - 38}`}
            fill="none" stroke={info.color} strokeWidth="2.5" markerEnd="url(#cogw-col)"
            style={{ transition: 'all 0.3s' }}/>
        ) : (
          <path d={`M ${flightBaseX + 4} ${flightBaseY - 13} C ${flightBaseX + 10} ${flightBaseY - 25} ${flightBaseX + 18} ${flightBaseY - 33} ${flightBaseX + 22} ${flightBaseY - 38}`}
            fill="none" stroke={info.color} strokeWidth="2.5" markerEnd="url(#cogw-col)"
            style={{ transition: 'all 0.3s' }}/>
        )}

        <text x={flightBaseX} y={flightBaseY + 28} textAnchor="middle" fontFamily="inherit"
          fontSize="8" fontWeight="600" fill={info.color}
          style={{ transition: 'fill 0.3s' }}>
          {info.flightDesc}
        </text>
      </svg>

      {/* Buttons */}
      <div className="flex gap-2 mt-3">
        {(['heel', 'neutral', 'toe'] as WeightPos[]).map(p => (
          <button
            key={p}
            onClick={() => setPos(p)}
            className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
              pos === p
                ? 'bg-[#185FA5] text-white border-[#185FA5]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {p === 'heel' ? '← Heel' : p === 'neutral' ? 'Neutral' : 'Toe →'}
          </button>
        ))}
      </div>

      {/* Info text */}
      <div className="mt-3 rounded-lg p-3 text-sm leading-relaxed transition-all"
        style={{ background: `${info.color}14`, color: '#374151', borderLeft: `3px solid ${info.color}` }}>
        {info.text}
      </div>
    </div>
  );
}
