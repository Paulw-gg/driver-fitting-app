interface Props {
  value: number;
  onChange: (v: number) => void;
}

export default function SpinAxisSlider({ value, onChange }: Props) {
  const clampedPct = ((value + 20) / 40) * 100;
  const color = value > 0 ? '#E24B4A' : value < 0 ? '#185FA5' : '#6B7280';
  const label = value > 0
    ? `+${value}° (Fade/Slice)`
    : value < 0
      ? `${value}° (Draw/Hook)`
      : '0° (Gerade)';

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
        <span className="text-blue-600">← Hook / Draw</span>
        <span className="text-red-500">Fade / Slice →</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={-20}
          max={20}
          step={0.5}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #185FA5 0%, #185FA5 ${clampedPct}%, #E24B4A ${clampedPct}%, #E24B4A 100%)`
          }}
        />
        {/* Center mark */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-gray-400 rounded" style={{ pointerEvents: 'none' }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>−20°</span>
        <span className="font-semibold text-sm" style={{ color }}>{label}</span>
        <span>+20°</span>
      </div>
    </div>
  );
}
