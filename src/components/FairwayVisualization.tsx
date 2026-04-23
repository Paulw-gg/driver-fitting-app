interface SetupProps {
  carryM: number;
  deviationM: number;
  label: string;
  color: string;
}

interface Props {
  setupA: SetupProps;
  setupB: SetupProps;
  holeLengthM: number;
}

export function FairwayVisualization({ setupA, setupB, holeLengthM }: Props) {
  const SVG_W = 500;
  const SVG_H = 320;

  const scaleY = (distanceM: number) =>
    SVG_H - 40 - (distanceM / holeLengthM) * (SVG_H - 80);

  const fairwayWidthPx = 120;
  const centerX = SVG_W / 2;
  const mPerPx = 28 / fairwayWidthPx;

  const radiusA = Math.round(setupA.deviationM / mPerPx);
  const radiusB = Math.round(setupB.deviationM / mPerPx);

  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ maxHeight: '320px', display: 'block' }}>
      {/* Rough background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H} fill="#4A7A35" />

      {/* Fairway */}
      <rect
        x={centerX - fairwayWidthPx / 2}
        y={20}
        width={fairwayWidthPx}
        height={SVG_H - 60}
        fill="#5E9E3E"
        rx={4}
      />

      {/* Distance markers */}
      {[100, 150, 200, 250, 300].map(dist => {
        if (dist > holeLengthM) return null;
        const y = scaleY(dist);
        return (
          <g key={dist}>
            <line
              x1={centerX - fairwayWidthPx / 2 - 10} y1={y}
              x2={centerX + fairwayWidthPx / 2 + 10} y2={y}
              stroke="rgba(255,255,255,0.3)" strokeWidth={0.5} strokeDasharray="3 3"
            />
            <text x={centerX - fairwayWidthPx / 2 - 14} y={y + 4}
              fontSize={9} fill="rgba(255,255,255,0.5)" textAnchor="end">
              {dist}m
            </text>
          </g>
        );
      })}

      {/* Green */}
      <ellipse cx={centerX} cy={28} rx={35} ry={16} fill="#3A8A2A" stroke="#2E6E20" strokeWidth={1} />
      <text x={centerX} y={32} textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.7)">Green</text>

      {/* Tee box */}
      <rect x={centerX - 18} y={SVG_H - 38} width={36} height={20} fill="#7ABF55" rx={3} />
      <text x={centerX} y={SVG_H - 24} textAnchor="middle" fontSize={8} fill="white">Tee</text>

      {/* Setup A */}
      {(() => {
        const y = scaleY(setupA.carryM);
        const ox = centerX - 18;
        return (
          <g>
            <circle cx={ox} cy={y} r={radiusA} fill={`${setupA.color}30`}
              stroke={setupA.color} strokeWidth={1.5} strokeDasharray="4 2" />
            <circle cx={ox} cy={y} r={5} fill={setupA.color} />
            <rect x={ox - 20} y={y - 26} width={40} height={18} rx={4} fill={setupA.color} />
            <text x={ox} y={y - 14} textAnchor="middle" fontSize={9} fill="white" fontWeight={600}>
              {setupA.label}
            </text>
            <text x={ox} y={y + 18} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.8)">
              {Math.round(setupA.carryM)}m
            </text>
          </g>
        );
      })()}

      {/* Setup B */}
      {(() => {
        const y = scaleY(setupB.carryM);
        const ox = centerX + 18;
        return (
          <g>
            <circle cx={ox} cy={y} r={radiusB} fill={`${setupB.color}30`}
              stroke={setupB.color} strokeWidth={1.5} strokeDasharray="4 2" />
            <circle cx={ox} cy={y} r={5} fill={setupB.color} />
            <rect x={ox - 20} y={y - 26} width={40} height={18} rx={4} fill={setupB.color} />
            <text x={ox} y={y - 14} textAnchor="middle" fontSize={9} fill="white" fontWeight={600}>
              {setupB.label}
            </text>
            <text x={ox} y={y + 18} textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.8)">
              {Math.round(setupB.carryM)}m
            </text>
          </g>
        );
      })()}

      {/* OB labels */}
      <text x={8} y={SVG_H / 2} fontSize={8} fill="rgba(255,255,255,0.4)"
        transform={`rotate(-90, 8, ${SVG_H / 2})`} textAnchor="middle">
        OUT OF BOUNDS
      </text>
      <text x={SVG_W - 8} y={SVG_H / 2} fontSize={8} fill="rgba(255,255,255,0.4)"
        transform={`rotate(90, ${SVG_W - 8}, ${SVG_H / 2})`} textAnchor="middle">
        OUT OF BOUNDS
      </text>

      {/* Legend */}
      <g transform={`translate(${centerX - 80}, ${SVG_H - 10})`}>
        <circle cx={8} cy={0} r={5} fill={setupA.color} />
        <text x={16} y={4} fontSize={9} fill="white">
          {setupA.label}: {Math.round(setupA.carryM)}m ±{Math.round(setupA.deviationM)}m
        </text>
      </g>
      <g transform={`translate(${centerX + 10}, ${SVG_H - 10})`}>
        <circle cx={8} cy={0} r={5} fill={setupB.color} />
        <text x={16} y={4} fontSize={9} fill="white">
          {setupB.label}: {Math.round(setupB.carryM)}m ±{Math.round(setupB.deviationM)}m
        </text>
      </g>
    </svg>
  );
}
