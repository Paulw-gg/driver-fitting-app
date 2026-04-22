import { useState } from 'react';

type Zone = 'hoch' | 'mitte' | 'tief';

const PANEL_INFO: Record<Zone, {
  label: string;
  sublabel: string;
  bg: string;
  border: string;
  labelBg: string;
  labelText: string;
  detail: string;
  impactY: number;
  tiltDir: 'forward' | 'none' | 'back';
  launchAngle: number;
}> = {
  hoch: {
    label: 'Launch ↑ höher · Spin ↓ weniger · Distanz ↑ optimal',
    sublabel: 'Hoch-Mitte (über CoG)',
    bg: '#F0FDF4',
    border: '#86EFAC',
    labelBg: '#DCFCE7',
    labelText: '#166534',
    detail: 'Typischer Effekt: +1–2° Launch, -400 bis -800 RPM Spin gegenüber Sweetspot. Das tiefe CoG moderner Driver verstärkt diesen positiven Effekt.',
    impactY: 58,
    tiltDir: 'forward',
    launchAngle: 22,
  },
  mitte: {
    label: 'Launch optimal · Spin optimal · Sweetspot',
    sublabel: 'Sweetspot (auf CoG-Höhe)',
    bg: '#F9FAFB',
    border: '#D1D5DB',
    labelBg: '#F3F4F6',
    labelText: '#374151',
    detail: 'Maximale Energieübertragung. Smash Factor am höchsten. Ziel jedes Schwungs.',
    impactY: 82,
    tiltDir: 'none',
    launchAngle: 14,
  },
  tief: {
    label: 'Launch ↓ niedriger · Spin ↑ mehr · Distanz ↓ Verlust',
    sublabel: 'Tief (unter CoG)',
    bg: '#FFF7ED',
    border: '#FCA5A5',
    labelBg: '#FEE2E2',
    labelText: '#991B1B',
    detail: 'Typischer Effekt: -2° Launch, +500–800 RPM Spin. Häufigste Ursache für kurze, hohe Drives mit wenig Rolle.',
    impactY: 108,
    tiltDir: 'back',
    launchAngle: 7,
  },
};

function VerticalPanel({ zone, active, onClick }: {
  zone: Zone;
  active: boolean;
  onClick: () => void;
}) {
  const info = PANEL_INFO[zone];

  // Clubhead side-view path (simplified driver silhouette)
  // Face on left, sole at bottom, back curves to right, crown at top
  const faceX = 68;
  const headPath = `M ${faceX} 38 C ${faceX} 36 ${faceX + 12} 32 ${faceX + 40} 30
    C ${faceX + 90} 28 ${faceX + 120} 40 ${faceX + 120} 65
    C ${faceX + 120} 90 ${faceX + 110} 115 ${faceX + 60} 122
    C ${faceX + 20} 126 ${faceX} 120 ${faceX} 118 Z`;

  // CoG position: low-back = deep inside, low
  const cogX = faceX + 85;
  const cogY = 100;

  // Impact point on face
  const impactX = faceX - 1;
  const impactY = info.impactY;

  // Head tilt arrow
  const tiltArrow = () => {
    if (info.tiltDir === 'forward') {
      // CW: top of head moves forward (left in side view)
      return (
        <path d={`M ${faceX + 55} 32 A 28 28 0 0 0 ${faceX + 28} 52`}
          fill="none" stroke="#EF4444" strokeWidth="2.5"
          markerEnd="url(#gv-red)"/>
      );
    }
    if (info.tiltDir === 'back') {
      // CCW: top of head moves backward (right in side view)
      return (
        <path d={`M ${faceX + 28} 52 A 28 28 0 0 0 ${faceX + 55} 32`}
          fill="none" stroke="#EF4444" strokeWidth="2.5"
          markerEnd="url(#gv-red)"/>
      );
    }
    return null;
  };

  // Ball below the face
  const ballX = 50;
  const ballY = 175;
  const ballR = 18;

  // Launch angle arrow from ball
  const launchRad = info.launchAngle * (Math.PI / 180);
  const arrowLen = 45;
  const arrowEndX = ballX - arrowLen * Math.cos(launchRad);
  const arrowEndY = ballY - arrowLen * Math.sin(launchRad);

  return (
    <div
      className="flex-1 min-w-0 cursor-pointer select-none rounded-xl overflow-hidden"
      style={{
        border: `${active ? 2 : 1.5}px solid ${active ? info.border : info.border}`,
        background: info.bg,
        transition: 'all 0.2s',
        opacity: 1,
      }}
      onClick={onClick}
    >
      <svg viewBox="0 0 220 240" width="100%">
        <defs>
          <marker id="gv-red" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="gv-blue" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#185FA5" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id="gv-green" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* Panel title */}
        <text x="110" y="18" textAnchor="middle" fontFamily="inherit"
          fontSize="10" fontWeight="700" fill="#374151">{info.sublabel}</text>

        {/* Shaft (angled, coming from top-left) */}
        <line x1="68" y1="75" x2="44" y2="30"
          stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>

        {/* Club head silhouette */}
        <path d={headPath} fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5"/>

        {/* CoG symbol (amber, tief-hinten) */}
        <circle cx={cogX} cy={cogY} r="7" fill="none" stroke="#D97706" strokeWidth="1.8"/>
        <line x1={cogX - 5} y1={cogY} x2={cogX + 5} y2={cogY} stroke="#D97706" strokeWidth="1.5"/>
        <line x1={cogX} y1={cogY - 5} x2={cogX} y2={cogY + 5} stroke="#D97706" strokeWidth="1.5"/>

        {/* CoG label */}
        <text x={cogX + 12} y={cogY + 4} fontFamily="inherit" fontSize="7" fill="#D97706">CoG</text>

        {/* Impact point on face */}
        <circle cx={impactX} cy={impactY} r="8" fill={zone === 'hoch' ? '#185FA5' : zone === 'mitte' ? '#1D9E75' : '#D97706'}
          opacity="0.9"/>
        <text x={impactX + 10} y={impactY + 4} fontFamily="inherit" fontSize="7.5"
          fill={zone === 'hoch' ? '#185FA5' : zone === 'mitte' ? '#1D9E75' : '#D97706'}>
          {zone === 'hoch' ? '↑ hoch' : zone === 'mitte' ? '● sweet' : '↓ tief'}
        </text>

        {/* Head tilt arrow */}
        {tiltArrow()}
        {info.tiltDir !== 'none' && (
          <text x={faceX + 70} y="38" fontFamily="inherit" fontSize="7.5" fill="#EF4444">
            {info.tiltDir === 'forward' ? 'kippt vor' : 'kippt zurück'}
          </text>
        )}

        {/* Ball */}
        <circle cx={ballX} cy={ballY} r={ballR} fill="#FFFBEB" stroke="#D1D5DB" strokeWidth="1.5"/>

        {/* Launch angle arrow */}
        <path d={`M ${ballX} ${ballY - ballR} L ${arrowEndX} ${arrowEndY}`}
          fill="none" stroke="#1D9E75" strokeWidth="2.5"
          markerEnd="url(#gv-green)"/>

        {/* Spin intensity bar (right of ball) */}
        <text x="80" y={ballY + 4} fontFamily="inherit" fontSize="8" fill="#6B7280">Spin:</text>
        {zone === 'hoch' && (
          <>
            <rect x="102" y={ballY - 6} width="38" height="12" rx="3" fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1"/>
            <text x="121" y={ballY + 4} textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#166534" fontWeight="600">↓ wenig</text>
          </>
        )}
        {zone === 'mitte' && (
          <>
            <rect x="102" y={ballY - 6} width="38" height="12" rx="3" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1"/>
            <text x="121" y={ballY + 4} textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#374151" fontWeight="600">optimal</text>
          </>
        )}
        {zone === 'tief' && (
          <>
            <rect x="102" y={ballY - 6} width="38" height="12" rx="3" fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1"/>
            <text x="121" y={ballY + 4} textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#991B1B" fontWeight="600">↑ viel</text>
          </>
        )}

        {/* Launch angle label */}
        <text x="50" y={ballY + 32} textAnchor="middle" fontFamily="inherit"
          fontSize="8" fill="#1D9E75">{info.launchAngle}°</text>

        {/* Click hint */}
        <text x="110" y="234" textAnchor="middle" fontFamily="inherit"
          fontSize="8" fill="#9CA3AF">Klicken für Details</text>
      </svg>

      {/* Label box */}
      <div className="px-3 pb-3">
        <div className="rounded-lg px-3 py-2 text-xs font-semibold text-center"
          style={{ background: info.labelBg, color: info.labelText }}>
          {info.label}
        </div>
      </div>
    </div>
  );
}

export default function GearEffectVertical() {
  const [active, setActive] = useState<Zone | null>(null);

  const handleClick = (zone: Zone) => {
    setActive(prev => prev === zone ? null : zone);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        {(['hoch', 'mitte', 'tief'] as Zone[]).map(zone => (
          <VerticalPanel
            key={zone}
            zone={zone}
            active={active === zone}
            onClick={() => handleClick(zone)}
          />
        ))}
      </div>
      {active && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 leading-relaxed transition-all">
          <span className="font-semibold">{PANEL_INFO[active].sublabel}:</span>{' '}
          {PANEL_INFO[active].detail}
        </div>
      )}
      {!active && (
        <p className="text-xs text-gray-400 text-center mt-2">Panel anklicken für mehr Details</p>
      )}
    </div>
  );
}
