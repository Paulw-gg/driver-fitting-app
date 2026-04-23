import type { ImpactZone } from '../types';

interface Props {
  value: ImpactZone;
  onZoneSelect: (zone: ImpactZone) => void;
}

interface ZoneConfig {
  id: ImpactZone;
  row: number;
  col: number;
  label: string;
  color: string;
  desc: string;
}

const ZONES: ZoneConfig[] = [
  { id: 'hoch-heel',  row: 0, col: 0, label: 'Hoch Heel',  color: '#9B6B8A', desc: 'Hoch + Heel' },
  { id: 'hoch-mitte', row: 0, col: 1, label: 'Hoch Mitte', color: '#185FA5', desc: 'Über CoG, zentral' },
  { id: 'hoch-toe',   row: 0, col: 2, label: 'Hoch Toe',   color: '#6B5E9B', desc: 'Hoch + Toe' },
  { id: 'heel',       row: 1, col: 0, label: 'Heel',        color: '#993556', desc: 'Hosel-Seite' },
  { id: 'sweetspot',  row: 1, col: 1, label: 'Sweetspot',   color: '#1D9E75', desc: 'Optimale Mitte' },
  { id: 'toe',        row: 1, col: 2, label: 'Toe',         color: '#534AB7', desc: 'Schlägerspitze' },
  { id: 'tief-heel',  row: 2, col: 0, label: 'Tief Heel',   color: '#B05A3A', desc: 'Tief + Heel' },
  { id: 'tief',       row: 2, col: 1, label: 'Tief',        color: '#BA7517', desc: 'Unter CoG' },
  { id: 'tief-toe',   row: 2, col: 2, label: 'Tief Toe',    color: '#7B4FB0', desc: 'Tief + Toe' },
];

const ZONE_MAP = Object.fromEntries(ZONES.map(z => [z.id, z])) as Record<ImpactZone, ZoneConfig>;

// SVG grid constants
const PAD = 16;
const CELL_W = 80;
const CELL_H = 58;
const GAP = 4;
const SVG_W = PAD * 2 + CELL_W * 3 + GAP * 2;
const SVG_H = PAD * 2 + CELL_H * 3 + GAP * 2;

function cellX(col: number) { return PAD + col * (CELL_W + GAP); }
function cellY(row: number) { return PAD + row * (CELL_H + GAP); }

export default function FaceZonePicker({ value, onZoneSelect }: Props) {
  const selected = ZONE_MAP[value];

  return (
    <div>
      {/* SVG grid */}
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="rounded-xl border border-gray-200 bg-white block"
        style={{ maxWidth: '100%' }}
      >
        {/* Driver face outline */}
        <rect
          x={PAD - 6} y={PAD - 6}
          width={CELL_W * 3 + GAP * 2 + 12}
          height={CELL_H * 3 + GAP * 2 + 12}
          rx={12} ry={12}
          fill="#F9FAFB" stroke="#D1D5DB" strokeWidth={1.5}
        />

        {ZONES.map(zone => {
          const x = cellX(zone.col);
          const y = cellY(zone.row);
          const isSelected = value === zone.id;
          return (
            <g key={zone.id} onClick={() => onZoneSelect(zone.id)} style={{ cursor: 'pointer' }}>
              <rect
                x={x} y={y} width={CELL_W} height={CELL_H}
                rx={6} ry={6}
                fill={isSelected ? zone.color : `${zone.color}22`}
                stroke={isSelected ? zone.color : '#E5E7EB'}
                strokeWidth={isSelected ? 2.5 : 1}
              />
              <text
                x={x + CELL_W / 2}
                y={y + CELL_H / 2 - 4}
                textAnchor="middle"
                fontSize={10}
                fontWeight={isSelected ? '700' : '500'}
                fill={isSelected ? '#fff' : '#374151'}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {zone.label.split(' ')[0]}
              </text>
              {zone.label.includes(' ') && (
                <text
                  x={x + CELL_W / 2}
                  y={y + CELL_H / 2 + 8}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={isSelected ? '700' : '500'}
                  fill={isSelected ? '#fff' : '#374151'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {zone.label.split(' ')[1]}
                </text>
              )}
            </g>
          );
        })}

        {/* CoG cross in sweetspot */}
        {(() => {
          const cx = cellX(1) + CELL_W / 2;
          const cy = cellY(1) + CELL_H / 2;
          const s = 6;
          return (
            <g style={{ pointerEvents: 'none' }}>
              <line x1={cx - s} y1={cy} x2={cx + s} y2={cy} stroke="#1D9E75" strokeWidth={1.5} opacity={0.5} />
              <line x1={cx} y1={cy - s} x2={cx} y2={cy + s} stroke="#1D9E75" strokeWidth={1.5} opacity={0.5} />
            </g>
          );
        })()}

        {/* Selected indicator dot */}
        {selected && (
          <circle
            cx={cellX(selected.col) + CELL_W / 2}
            cy={cellY(selected.row) + CELL_H - 10}
            r={3.5}
            fill="#fff"
            stroke={selected.color}
            strokeWidth={2}
            style={{ pointerEvents: 'none' }}
          />
        )}
      </svg>

      {/* Compact legend grid */}
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {ZONES.map(zone => (
          <button
            key={zone.id}
            type="button"
            onClick={() => onZoneSelect(zone.id)}
            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              value === zone.id
                ? 'text-white border-transparent'
                : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'
            }`}
            style={value === zone.id ? { backgroundColor: zone.color, borderColor: zone.color } : {}}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: zone.color }}
            />
            <span className="truncate">{zone.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
