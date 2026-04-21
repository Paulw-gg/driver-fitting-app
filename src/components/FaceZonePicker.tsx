import type { ImpactZone } from '../types';

interface Props {
  value: ImpactZone;
  onZoneSelect: (zone: ImpactZone) => void;
}

const ZONES: { id: ImpactZone; label: string; color: string; hoverColor: string; x: number; y: number; w: number; h: number }[] = [
  { id: 'hoch-mitte', label: 'Hoch-Mitte', color: '#DBEAFE', hoverColor: '#93C5FD', x: 90,  y: 30,  w: 120, h: 55 },
  { id: 'sweetspot',  label: 'Sweetspot',  color: '#DCFCE7', hoverColor: '#86EFAC', x: 90,  y: 90,  w: 120, h: 60 },
  { id: 'tief',       label: 'Tief',       color: '#FEF3C7', hoverColor: '#FCD34D', x: 90,  y: 155, w: 120, h: 50 },
  { id: 'heel',       label: 'Heel',       color: '#FCE7F3', hoverColor: '#F9A8D4', x: 20,  y: 70,  w: 65,  h: 110 },
  { id: 'toe',        label: 'Toe',        color: '#EDE9FE', hoverColor: '#C4B5FD', x: 215, y: 70,  w: 65,  h: 110 },
];

const ZONE_COLORS: Record<ImpactZone, string> = {
  'hoch-mitte': '#3B82F6',
  sweetspot:    '#22C55E',
  tief:         '#F59E0B',
  heel:         '#EC4899',
  toe:          '#8B5CF6',
};

export default function FaceZonePicker({ value, onZoneSelect }: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="flex-shrink-0">
        <svg width="300" height="220" viewBox="0 0 300 220" className="border border-gray-200 rounded-xl bg-white">
          {/* Driver face outline */}
          <rect x="15" y="15" width="270" height="190" rx="18" ry="18"
            fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="2" />

          {/* Zones */}
          {ZONES.map(zone => (
            <g key={zone.id} onClick={() => onZoneSelect(zone.id)} style={{ cursor: 'pointer' }}>
              <rect
                x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                rx="6" ry="6"
                fill={value === zone.id ? ZONE_COLORS[zone.id] : zone.color}
                stroke={value === zone.id ? ZONE_COLORS[zone.id] : '#E5E7EB'}
                strokeWidth={value === zone.id ? 2 : 1}
                opacity={0.85}
              />
              <text
                x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 4}
                textAnchor="middle" fontSize="11" fontWeight={value === zone.id ? '700' : '500'}
                fill={value === zone.id ? '#fff' : '#374151'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {zone.label}
              </text>
            </g>
          ))}

          {/* Impact dot marker */}
          {(() => {
            const z = ZONES.find(z => z.id === value);
            if (!z) return null;
            return (
              <circle
                cx={z.x + z.w / 2} cy={z.y + z.h / 2}
                r="6" fill="#fff" stroke={ZONE_COLORS[value]} strokeWidth="2.5"
              />
            );
          })()}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        {ZONES.map(zone => (
          <button
            key={zone.id}
            type="button"
            onClick={() => onZoneSelect(zone.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
              value === zone.id
                ? 'border-current text-white'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
            }`}
            style={value === zone.id ? { backgroundColor: ZONE_COLORS[zone.id], borderColor: ZONE_COLORS[zone.id] } : {}}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: ZONE_COLORS[zone.id] }}
            />
            {zone.label}
          </button>
        ))}
      </div>
    </div>
  );
}
