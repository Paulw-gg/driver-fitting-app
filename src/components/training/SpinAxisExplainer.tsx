import { useState } from 'react';

function axisColor(deg: number): string {
  if (deg < -2) return '#185FA5';
  if (deg > 2) return '#E24B4A';
  return '#888780';
}

function axisLabel(deg: number): string {
  if (deg <= -8) return 'Starker Hook';
  if (deg <= -3) return 'Leichter Draw';
  if (deg <= 2) return 'Neutral / Gerade';
  if (deg <= 7) return 'Leichte Fade';
  return 'Starker Slice';
}

function flightDescription(deg: number): string {
  if (deg <= -8) return 'wird stark nach links (Hook) ziehen';
  if (deg <= -3) return 'wird leicht nach links (Draw) ziehen';
  if (deg <= 2) return 'fliegt gerade';
  if (deg <= 7) return 'wird leicht nach rechts (Fade) ziehen';
  return 'wird stark nach rechts (Slice) ziehen';
}

interface StaticBallProps {
  tiltDeg: number;
  flightDir: 'straight' | 'left' | 'right';
  label: string;
}

function StaticBallPanel({ tiltDeg, flightDir, label }: StaticBallProps) {
  const cx = 80;
  const cy = 80;
  const r = 32;
  const color = axisColor(tiltDeg);
  const tiltRad = tiltDeg * (Math.PI / 180);
  const axisLen = 50;

  const ax1x = cx + axisLen * Math.sin(tiltRad);
  const ax1y = cy - axisLen * Math.cos(tiltRad);
  const ax2x = cx - axisLen * Math.sin(tiltRad);
  const ax2y = cy + axisLen * Math.cos(tiltRad);

  const id = `sa-${tiltDeg < 0 ? 'n' : 'p'}${Math.abs(tiltDeg)}`;

  return (
    <div className="flex-1 min-w-0">
      <svg viewBox="0 0 160 210" width="100%" className="rounded-xl border border-gray-200 bg-white">
        <defs>
          <marker id={`${id}-col`} viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
          <marker id={`${id}-grn`} viewBox="0 0 10 10" refX="8" refY="5"
            markerWidth="5" markerHeight="5" orient="auto">
            <path d="M2 2L8 5L2 8" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
          </marker>
        </defs>

        {/* Ball */}
        <circle cx={cx} cy={cy} r={r} fill="#FFFBEB" stroke="#D1D5DB" strokeWidth="1.5"/>

        {/* Backspin arcs */}
        <path d={`M ${cx - 14} ${cy - r + 6} A 14 14 0 0 0 ${cx + 14} ${cy - r + 6}`}
          fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d={`M ${cx - 14} ${cy + r - 6} A 14 14 0 0 1 ${cx + 14} ${cy + r - 6}`}
          fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 2"/>

        {/* Spin axis */}
        <line x1={ax1x} y1={ax1y} x2={ax2x} y2={ax2y}
          stroke={color} strokeWidth="2.5" strokeDasharray="5 3"
          markerStart={`url(#${id}-col)`}
          markerEnd={`url(#${id}-col)`}/>

        {/* Tilt angle text */}
        <text
          x={cx + (tiltDeg > 0 ? 10 : tiltDeg < 0 ? -10 : 10)}
          y={cy + 4}
          textAnchor={tiltDeg < 0 ? 'end' : 'start'}
          fontFamily="inherit" fontSize="9" fontWeight="700" fill={color}>
          {tiltDeg > 0 ? `+${tiltDeg}°` : tiltDeg === 0 ? '0°' : `${tiltDeg}°`}
        </text>

        {/* Flight path */}
        {flightDir === 'straight' && (
          <path d="M 80 150 L 80 178" fill="none" stroke="#1D9E75" strokeWidth="2.5"
            markerEnd={`url(#${id}-grn)`}/>
        )}
        {flightDir === 'left' && (
          <path d="M 80 148 C 74 162 62 172 52 180"
            fill="none" stroke={color} strokeWidth="2.5" markerEnd={`url(#${id}-col)`}/>
        )}
        {flightDir === 'right' && (
          <path d="M 80 148 C 86 162 98 172 108 180"
            fill="none" stroke={color} strokeWidth="2.5" markerEnd={`url(#${id}-col)`}/>
        )}

        {/* Label */}
        <text x="80" y="198" textAnchor="middle" fontFamily="inherit"
          fontSize="8.5" fontWeight="600" fill={color}>
          {label.split(' · ')[0]}
        </text>
        {label.split(' · ')[1] && (
          <text x="80" y="208" textAnchor="middle" fontFamily="inherit"
            fontSize="8" fill={color}>
            {label.split(' · ')[1]}
          </text>
        )}
      </svg>
    </div>
  );
}

export default function SpinAxisExplainer() {
  const [sliderDeg, setSliderDeg] = useState(0);
  const color = axisColor(sliderDeg);

  const ballCx = 80;
  const ballCy = 80;
  const ballR = 52;
  const tiltRad = sliderDeg * (Math.PI / 180);
  const axisLen = 68;

  const ax1x = ballCx + axisLen * Math.sin(tiltRad);
  const ax1y = ballCy - axisLen * Math.cos(tiltRad);
  const ax2x = ballCx - axisLen * Math.sin(tiltRad);
  const ax2y = ballCy + axisLen * Math.cos(tiltRad);

  return (
    <div>
      {/* Static balls grid */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <StaticBallPanel tiltDeg={0} flightDir="straight" label="Neutrale Achse · Gerader Flug" />
        <StaticBallPanel tiltDeg={-10} flightDir="left" label="Achse links · Draw/Hook" />
        <StaticBallPanel tiltDeg={10} flightDir="right" label="Achse rechts · Fade/Slice" />
      </div>

      {/* Interactive slider */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm">Interaktiver Spin-Achsen-Simulator</h3>
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          {/* SVG ball */}
          <div className="w-48 flex-shrink-0">
            <svg viewBox="0 0 160 165" width="100%">
              <defs>
                <marker id="sa-live-col" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M2 2L8 5L2 8" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
                </marker>
                <marker id="sa-live-grn" viewBox="0 0 10 10" refX="8" refY="5"
                  markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M2 2L8 5L2 8" fill="none" stroke="#1D9E75" strokeWidth="1.5" strokeLinecap="round"/>
                </marker>
              </defs>

              {/* Ball */}
              <circle cx={ballCx} cy={ballCy} r={ballR} fill="#FFFBEB" stroke="#E5E7EB" strokeWidth="2"/>

              {/* Backspin arcs */}
              <path d={`M ${ballCx - 18} ${ballCy - ballR + 8} A 18 18 0 0 0 ${ballCx + 18} ${ballCy - ballR + 8}`}
                fill="none" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="4 3"/>
              <path d={`M ${ballCx - 18} ${ballCy + ballR - 8} A 18 18 0 0 1 ${ballCx + 18} ${ballCy + ballR - 8}`}
                fill="none" stroke="#D1D5DB" strokeWidth="2" strokeDasharray="4 3"/>

              {/* Axis */}
              <line x1={ax1x} y1={ax1y} x2={ax2x} y2={ax2y}
                stroke={color} strokeWidth="3" strokeDasharray="6 4"
                markerStart="url(#sa-live-col)"
                markerEnd="url(#sa-live-col)"
                style={{ transition: 'all 0.05s' }}/>

              {/* Flight hint arrow */}
              {Math.abs(sliderDeg) <= 2 ? (
                <path d="M 80 142 L 80 160" fill="none" stroke="#1D9E75" strokeWidth="2.5"
                  markerEnd="url(#sa-live-grn)"/>
              ) : (
                <path
                  d={`M 80 142 C ${80 + sliderDeg * 0.8} 150 ${80 + sliderDeg * 1.4} 157 ${80 + sliderDeg * 1.8} 160`}
                  fill="none" stroke={color} strokeWidth="2.5" markerEnd="url(#sa-live-col)"/>
              )}
            </svg>
          </div>

          {/* Info panel */}
          <div className="flex-1 min-w-0">
            <div className="text-3xl font-bold mb-1" style={{ color }}>
              {sliderDeg > 0 ? `+${sliderDeg}°` : `${sliderDeg}°`}
            </div>
            <div className="text-lg font-semibold mb-3" style={{ color }}>
              {axisLabel(sliderDeg)}
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Achse bei <strong>{sliderDeg > 0 ? `+${sliderDeg}` : sliderDeg}°</strong>: Der Ball {flightDescription(sliderDeg)}.
            </div>

            {/* Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-[#185FA5] w-12 text-right">Hook</span>
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 right-0 flex items-center pointer-events-none">
                  <div className="h-2 w-full rounded-full"
                    style={{ background: 'linear-gradient(to right, #185FA5, #888780, #E24B4A)' }}/>
                </div>
                <input
                  type="range" min={-20} max={20} step={1} value={sliderDeg}
                  onChange={e => setSliderDeg(Number(e.target.value))}
                  className="relative w-full h-2 appearance-none bg-transparent cursor-pointer"
                  style={{ zIndex: 1 }}
                />
              </div>
              <span className="text-xs font-medium text-[#E24B4A] w-12">Slice</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-12">
              <span>-20°</span>
              <span>0°</span>
              <span>+20°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
