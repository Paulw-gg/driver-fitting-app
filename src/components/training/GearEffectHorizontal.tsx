import { useState } from 'react';

type HoveredPanel = 'toe' | 'heel' | null;

function ClubheadPanel({
  side,
  hovered,
  setHovered,
}: {
  side: 'toe' | 'heel';
  hovered: HoveredPanel;
  setHovered: (v: HoveredPanel) => void;
}) {
  const isToe = side === 'toe';
  const impactX = isToe ? 210 : 58;
  const impactY = 65;
  const cogX = 134;
  const cogY = 78;
  const impactColor = isToe ? '#7C3AED' : '#EC4899';
  const label = isToe ? 'Toe-Treffer' : 'Heel-Treffer';
  const spinLabel = isToe ? 'Draw / Hook' : 'Fade / Slice';
  const spinColor = isToe ? '#185FA5' : '#E24B4A';
  const markerId = isToe ? 'geh-t' : 'geh-h';

  // Spin axis: left tilt for draw (toe), right tilt for fade (heel)
  // axis angle from vertical: toe=-12° (left), heel=+12° (right)
  const tiltRad = (isToe ? -12 : 12) * (Math.PI / 180);
  const axisR = 38;
  const ax1 = 134 + axisR * Math.sin(tiltRad);
  const ay1 = 200 - axisR * Math.cos(tiltRad);
  const ax2 = 134 - axisR * Math.sin(tiltRad);
  const ay2 = 200 + axisR * Math.cos(tiltRad);

  // Rotation arc: CW for toe (head rotates right), CCW for heel
  // Arc from top (cogX, cogY-32) to right/left
  const arcEnd = isToe
    ? { x: cogX + 32, y: cogY }
    : { x: cogX - 32, y: cogY };
  const arcSweep = isToe ? 1 : 0;

  const tooltipText = isToe
    ? ['Schlägerkopf dreht rechts', '→ Ball dreht links (Draw/Hook)', '→ Spin-Achse -8° bis -15°']
    : ['Schlägerkopf dreht links', '→ Ball dreht rechts (Fade/Slice)', '→ Spin-Achse +8° bis +15°'];

  // Flight curve: toe curves left, heel curves right
  const flightPath = isToe
    ? 'M 128 232 C 108 252 88 256 72 248'
    : 'M 140 232 C 158 252 176 256 192 248';
  const flightLabel = isToe ? '← Draw' : 'Fade →';
  const flightLabelX = isToe ? 68 : 158;

  return (
    <div className="flex-1 min-w-0">
      <svg viewBox="0 0 268 285" width="100%" className="rounded-xl border border-gray-200 overflow-visible"
        style={{ background: isToe ? '#F5F3FF' : '#FFF0F5' }}>
        <defs>
          <marker id={`${markerId}-red`} viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id={`${markerId}-col`} viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke={spinColor} strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id={`${markerId}-green`} viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* Title */}
        <text x="134" y="20" textAnchor="middle" fontFamily="inherit" fontSize="12"
          fontWeight="700" fill="#374151">{label}</text>

        {/* Shaft */}
        <line x1="50" y1="78" x2="24" y2="50" stroke="#9CA3AF" strokeWidth="4" strokeLinecap="round"/>

        {/* Clubhead face */}
        <rect x="45" y="38" width="175" height="80" rx="12"
          fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="1.5"/>

        {/* Heel label */}
        <text x="60" y="130" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#9CA3AF">Heel</text>
        {/* Toe label */}
        <text x="210" y="130" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#9CA3AF">Toe</text>

        {/* CoG symbol */}
        <circle cx={cogX} cy={cogY} r="9" fill="none" stroke="#D97706" strokeWidth="2"/>
        <line x1={cogX - 6} y1={cogY} x2={cogX + 6} y2={cogY} stroke="#D97706" strokeWidth="1.5"/>
        <line x1={cogX} y1={cogY - 6} x2={cogX} y2={cogY + 6} stroke="#D97706" strokeWidth="1.5"/>
        <text x={cogX} y="100" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#D97706">CoG</text>

        {/* Impact point */}
        <circle cx={impactX} cy={impactY} r="13" fill={impactColor} opacity="0.85"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHovered(side)}
          onMouseLeave={() => setHovered(null)}/>
        <text x={impactX} y={isToe ? 50 : 50} textAnchor="middle" fontFamily="inherit"
          fontSize="8" fontWeight="600" fill={impactColor}>
          {isToe ? 'Toe' : 'Heel'}
        </text>

        {/* Tooltip on hover */}
        {hovered === side && (
          <g>
            <rect x="10" y="6" width="248" height="62" rx="7"
              fill="white" stroke={impactColor} strokeWidth="1.2" opacity="0.97"/>
            {tooltipText.map((line, i) => (
              <text key={i} x="18" y={22 + i * 15} fontFamily="inherit" fontSize="9" fill="#374151">
                {line}
              </text>
            ))}
          </g>
        )}

        {/* Rotation arc arrow */}
        <path
          d={`M ${cogX} ${cogY - 32} A 32 32 0 0 ${arcSweep} ${arcEnd.x} ${arcEnd.y}`}
          fill="none" stroke="#EF4444" strokeWidth="2.5"
          markerEnd={`url(#${markerId}-red)`}/>
        <text x={isToe ? 170 : 58} y={isToe ? 52 : 52}
          textAnchor={isToe ? 'start' : 'end'}
          fontFamily="inherit" fontSize="8" fill="#EF4444">
          {isToe ? 'dreht →' : '← dreht'}
        </text>

        {/* Connector line (dotted, face to ball) */}
        <line x1="134" y1="118" x2="134" y2="162" stroke="#D1D5DB"
          strokeWidth="1" strokeDasharray="3 3"/>

        {/* Ball */}
        <circle cx="134" cy="197" r="24" fill="#FFFBEB" stroke="#D1D5DB" strokeWidth="1.5"/>

        {/* Spin axis through ball */}
        <line x1={ax1} y1={ay1} x2={ax2} y2={ay2}
          stroke={spinColor} strokeWidth="2.5" strokeDasharray="5 3"
          markerStart={`url(#${markerId}-col)`}
          markerEnd={`url(#${markerId}-col)`}/>

        {/* Axis angle label */}
        <text x={isToe ? 96 : 148} y="192" fontFamily="inherit" fontSize="9"
          fill={spinColor} fontWeight="600">
          {isToe ? '-12°' : '+12°'}
        </text>

        {/* Spin label */}
        <text x="134" y="233" textAnchor="middle" fontFamily="inherit"
          fontSize="10" fontWeight="700" fill={spinColor}>{spinLabel}</text>

        {/* Flight arrow */}
        <path d={flightPath} fill="none" stroke="#1D9E75" strokeWidth="2"
          markerEnd={`url(#${markerId}-green)`}/>
        <text x={flightLabelX} y="268" textAnchor="middle" fontFamily="inherit"
          fontSize="9" fontWeight="600" fill="#1D9E75">{flightLabel}</text>
      </svg>
    </div>
  );
}

function GearMetaphor() {
  return (
    <div className="mt-6">
      <style>{`
        @keyframes geh-big { to { transform: rotate(360deg); } }
        @keyframes geh-small { to { transform: rotate(-360deg); } }
      `}</style>
      <svg viewBox="0 0 420 190" width="100%" className="rounded-xl border border-gray-200 bg-gray-50">
        {/* Large gear (clubface) at (118, 95) */}
        <g transform="translate(118 95)">
          <g style={{
            animation: 'geh-big 6s linear infinite',
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}>
            <circle r="55" fill="#D1D5DB" stroke="#9CA3AF" strokeWidth="1.5"/>
            {Array.from({ length: 12 }, (_, i) => (
              <rect key={i} x="-5" y="-70" width="10" height="13" rx="2"
                fill="#9CA3AF" transform={`rotate(${(i / 12) * 360})`}/>
            ))}
            <circle r="18" fill="#9CA3AF"/>
            <text textAnchor="middle" y="-5" fontFamily="inherit" fontSize="9" fill="white">Schläger-</text>
            <text textAnchor="middle" y="8" fontFamily="inherit" fontSize="9" fill="white">fläche</text>
          </g>
        </g>

        {/* Small gear (ball) at (238, 95) — 118+55+10+55 = touching at outer radius: 118+62=180, 238-33=205 — adjust */}
        {/* Large outer: 55+13=68, small outer: 28+8=36. Center dist = 118 + 68 + 36 = 222. So small center at 222 */}
        <g transform="translate(224 95)">
          <g style={{
            animation: 'geh-small 3.3s linear infinite',
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}>
            <circle r="28" fill="#FEF9C3" stroke="#9CA3AF" strokeWidth="1.5"/>
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={i} x="-4" y="-36" width="8" height="9" rx="1.5"
                fill="#9CA3AF" transform={`rotate(${(i / 8) * 360})`}/>
            ))}
            <circle r="9" fill="#9CA3AF"/>
            <text textAnchor="middle" y="5" fontFamily="inherit" fontSize="8" fill="white">Ball</text>
          </g>
        </g>

        {/* Direction arrows */}
        <text x="118" y="172" textAnchor="middle" fontFamily="inherit" fontSize="10" fill="#6B7280">→ im Uhrzeigersinn</text>
        <text x="224" y="172" textAnchor="middle" fontFamily="inherit" fontSize="10" fill="#6B7280">← gegenläufig</text>

        {/* Caption */}
        <text x="210" y="188" textAnchor="middle" fontFamily="inherit" fontSize="10"
          fontWeight="500" fill="#374151">
          Fläche und Ball greifen ineinander — wie zwei Zahnräder
        </text>
      </svg>
    </div>
  );
}

export default function GearEffectHorizontal() {
  const [hovered, setHovered] = useState<HoveredPanel>(null);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <ClubheadPanel side="toe" hovered={hovered} setHovered={setHovered} />
        <ClubheadPanel side="heel" hovered={hovered} setHovered={setHovered} />
      </div>
      <p className="text-xs text-gray-400 text-center mb-4">Hover über den farbigen Trefferpunkt für Details</p>
      <GearMetaphor />
    </div>
  );
}
