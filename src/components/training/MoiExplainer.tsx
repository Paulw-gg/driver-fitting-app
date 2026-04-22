// MOI: Moment of Inertia explainer — 3 visual sections

const IMPACT_CARDS = [
  {
    trefferbild: 'Konsistent Sweetspot',
    moi: 'Niedrig–Mittel',
    warum: 'Mehr CoG-Kontrolle möglich, Gear Effect ist irrelevant',
    color: '#185FA5',
    icon: '🎯',
  },
  {
    trefferbild: 'Leichte Streuung',
    moi: 'Mittel–Hoch',
    warum: 'Fehler werden verziehen, Smash-Faktor bleibt stabil',
    color: '#1D9E75',
    icon: '⚖️',
  },
  {
    trefferbild: 'Starke Streuung',
    moi: 'Hoch (460cc, Perimeter)',
    warum: 'Maximale Stabilität nötig, große Köpfe dämpfen Gear Effect',
    color: '#BA7517',
    icon: '🛡️',
  },
  {
    trefferbild: 'Inkonsistent Heel/Toe',
    moi: 'Sehr Hoch',
    warum: 'Gear Effect muss aktiv gedämpft werden, Perimeter-Weighting',
    color: '#E24B4A',
    icon: '⚡',
  },
];

function MoiComparisonSvg() {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Low MOI */}
      <div className="flex-1 min-w-0">
        <svg viewBox="0 0 240 220" width="100%" className="rounded-xl border border-gray-200 bg-red-50">
          {/* Small compact head */}
          <path d="M 55 55 C 55 38 75 30 120 28 C 162 26 188 42 190 68
                   C 192 88 186 140 170 165 C 156 183 136 188 118 188
                   C 100 188 80 183 68 165 C 56 148 55 100 55 55 Z"
            fill="#FEE2E2" stroke="#FCA5A5" strokeWidth="1.5"/>

          {/* Face */}
          <path d="M 55 55 C 75 50 168 50 190 68"
            fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>

          {/* Mass concentrated in center */}
          <circle cx="122" cy="118" r="22" fill="#EF4444" opacity="0.7"/>
          <text x="122" y="122" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="white" fontWeight="600">Masse</text>
          <text x="122" y="132" textAnchor="middle" fontFamily="inherit" fontSize="7" fill="white">zentriert</text>

          {/* Off-center hit point */}
          <circle cx="165" cy="62" r="8" fill="#7C3AED" opacity="0.8"/>
          <text x="170" y="52" fontFamily="inherit" fontSize="8" fill="#7C3AED">Off-Center</text>

          {/* Strong rotation arrow */}
          <path d="M 120 35 A 48 48 0 0 1 172 80"
            fill="none" stroke="#EF4444" strokeWidth="3"
            markerEnd="url(#moi-red)"/>
          <text x="178" y="78" fontFamily="inherit" fontSize="8" fill="#EF4444" fontWeight="600">stark</text>

          {/* Ball speed bar - short */}
          <text x="30" y="198" fontFamily="inherit" fontSize="8" fill="#374151">Ballgeschw.:</text>
          <rect x="30" y="202" width="60" height="10" rx="3" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1"/>
          <rect x="30" y="202" width="28" height="10" rx="3" fill="#EF4444"/>
          <text x="96" y="211" fontFamily="inherit" fontSize="8" fill="#EF4444" fontWeight="600">↓ verloren</text>

          <defs>
            <marker id="moi-red" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5" orient="auto">
              <path d="M2 2L8 5L2 8" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
            </marker>
          </defs>

          <text x="120" y="218" textAnchor="middle" fontFamily="inherit"
            fontSize="9" fontWeight="700" fill="#991B1B">Niedriges MOI · Starkes Verdrehen</text>
        </svg>
        <p className="text-xs text-gray-500 text-center mt-1">Für fortgeschrittene Spieler mit konstantem Trefferbild</p>
      </div>

      {/* High MOI */}
      <div className="flex-1 min-w-0">
        <svg viewBox="0 0 240 220" width="100%" className="rounded-xl border border-gray-200 bg-green-50">
          <defs>
            <marker id="moi-grn" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5" orient="auto">
              <path d="M2 2L8 5L2 8" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
            </marker>
          </defs>

          {/* Larger head */}
          <path d="M 42 50 C 42 30 70 20 128 18 C 182 16 218 34 222 66
                   C 225 92 218 158 198 188 C 180 210 158 218 130 218
                   C 102 218 76 210 62 188 C 48 168 42 120 42 50 Z"
            fill="#DCFCE7" stroke="#86EFAC" strokeWidth="1.5"/>

          {/* Face */}
          <path d="M 42 50 C 70 44 196 44 222 66"
            fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"/>

          {/* Perimeter weights */}
          {[
            { x: 52, y: 100 }, { x: 52, y: 150 }, { x: 80, y: 200 },
            { x: 130, y: 210 }, { x: 185, y: 200 }, { x: 218, y: 140 },
            { x: 218, y: 90 }, { x: 185, y: 42 }, { x: 130, y: 30 }, { x: 76, y: 38 },
          ].map((pt, i) => (
            <circle key={i} cx={pt.x} cy={pt.y} r="7" fill="#1D9E75" opacity="0.7"/>
          ))}
          <text x="132" y="120" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#166534">Perimeter</text>
          <text x="132" y="131" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#166534">Weighting</text>

          {/* Off-center hit */}
          <circle cx="198" cy="58" r="8" fill="#7C3AED" opacity="0.8"/>

          {/* Small rotation arrow */}
          <path d="M 128 28 A 42 42 0 0 1 168 62"
            fill="none" stroke="#1D9E75" strokeWidth="2"
            markerEnd="url(#moi-grn)"/>
          <text x="172" y="60" fontFamily="inherit" fontSize="8" fill="#1D9E75" fontWeight="600">kaum</text>

          {/* Ball speed bar - long */}
          <text x="22" y="202" fontFamily="inherit" fontSize="8" fill="#374151">Ballgeschw.:</text>
          <rect x="22" y="206" width="80" height="10" rx="3" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1"/>
          <rect x="22" y="206" width="72" height="10" rx="3" fill="#1D9E75"/>
          <text x="108" y="215" fontFamily="inherit" fontSize="8" fill="#1D9E75" fontWeight="600">↑ erhalten</text>

          <text x="132" y="222" textAnchor="middle" fontFamily="inherit"
            fontSize="9" fontWeight="700" fill="#166534">Hohes MOI · Minimales Verdrehen</text>
        </svg>
        <p className="text-xs text-gray-500 text-center mt-1">Für alle Spieler — besonders Anfänger/Mittel</p>
      </div>
    </div>
  );
}

function MoiBarChart() {
  const moiLevels = [
    { label: 'Niedrig', spinChange: 90, speedLoss: 85 },
    { label: 'Mittel', spinChange: 60, speedLoss: 55 },
    { label: 'Hoch', spinChange: 35, speedLoss: 28 },
    { label: 'Sehr hoch', spinChange: 18, speedLoss: 12 },
  ];

  const barW = 24;
  const groupW = barW * 2 + 6;
  const groupGap = 22;
  const startX = 55;
  const maxH = 100;
  const baseY = 140;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <h4 className="text-sm font-semibold text-gray-800 mb-1">MOI vs. Gear-Effect-Stärke bei gleichem Fehltreffer</h4>
      <p className="text-xs text-gray-400 mb-3">Höheres MOI = geringere Strafe bei Fehltreffern</p>
      <svg viewBox="0 0 360 200" width="100%">
        <defs>
          <marker id="moi-axis" viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="4" markerHeight="4" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#9CA3AF" strokeWidth="1.5"/>
          </marker>
        </defs>

        {/* Y axis */}
        <line x1="48" y1="10" x2="48" y2={baseY + 5}
          stroke="#D1D5DB" strokeWidth="1" markerEnd="url(#moi-axis)"/>
        <text x="8" y="80" fontFamily="inherit" fontSize="8" fill="#9CA3AF" textAnchor="middle"
          transform="rotate(-90 8 80)">Gear Effect</text>

        {/* X axis */}
        <line x1="48" y1={baseY} x2="340" y2={baseY}
          stroke="#D1D5DB" strokeWidth="1" markerEnd="url(#moi-axis)"/>
        <text x="195" y="198" textAnchor="middle" fontFamily="inherit" fontSize="8" fill="#9CA3AF">
          MOI niedrig → hoch
        </text>

        {/* Bars */}
        {moiLevels.map((level, i) => {
          const gx = startX + i * (groupW + groupGap);
          const spinH = (level.spinChange / 100) * maxH;
          const speedH = (level.speedLoss / 100) * maxH;
          return (
            <g key={i}>
              {/* Spin change bar */}
              <rect x={gx} y={baseY - spinH} width={barW} height={spinH}
                rx="2" fill="#E24B4A" opacity="0.75"/>
              {/* Speed loss bar */}
              <rect x={gx + barW + 4} y={baseY - speedH} width={barW} height={speedH}
                rx="2" fill="#185FA5" opacity="0.65"/>
              {/* X label */}
              <text x={gx + groupW / 2} y={baseY + 14} textAnchor="middle"
                fontFamily="inherit" fontSize="8" fill="#6B7280">{level.label}</text>
            </g>
          );
        })}

        {/* Legend */}
        <rect x="55" y="10" width="10" height="8" rx="1" fill="#E24B4A" opacity="0.75"/>
        <text x="68" y="18" fontFamily="inherit" fontSize="8" fill="#374151">Spin-Achsen-Änderung</text>
        <rect x="180" y="10" width="10" height="8" rx="1" fill="#185FA5" opacity="0.65"/>
        <text x="193" y="18" fontFamily="inherit" fontSize="8" fill="#374151">Ballgeschw.-Verlust</text>
      </svg>
    </div>
  );
}

export default function MoiExplainer() {
  return (
    <div>
      <MoiComparisonSvg />
      <MoiBarChart />

      {/* Impact pattern recommendation cards */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 text-sm">Empfehlung nach Trefferbild</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {IMPACT_CARDS.map(card => (
            <div key={card.trefferbild}
              className="rounded-xl border p-4"
              style={{ borderColor: `${card.color}40`, background: `${card.color}0a` }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{card.icon}</span>
                <div>
                  <div className="font-semibold text-sm text-gray-900 mb-0.5">{card.trefferbild}</div>
                  <div className="text-xs font-medium mb-1" style={{ color: card.color }}>
                    Empf. MOI: {card.moi}
                  </div>
                  <div className="text-xs text-gray-600">{card.warum}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
