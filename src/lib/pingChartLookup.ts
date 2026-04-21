export interface PingDataPoint {
  aoa_deg: number;
  launch_deg: number;
  spin_rpm: number;
}

export interface PingSpeedRow {
  ball_speed_mph: number;
  ball_speed_kmh: number;
  aoa: PingDataPoint[];
}

export interface LookupResult {
  optimal_launch_deg: number;
  optimal_spin_rpm: number;
  launch_min: number;
  launch_max: number;
  spin_min: number;
  spin_max: number;
}

export interface AnalysisResult extends LookupResult {
  launch_delta_deg: number;
  spin_delta_rpm: number;
  launch_status: 'optimal' | 'low' | 'high';
  spin_status: 'optimal' | 'low' | 'high';
}

const PING_DATA: PingSpeedRow[] = [
  { ball_speed_mph: 80, ball_speed_kmh: 129, aoa: [
    { aoa_deg: -10, launch_deg: 17.9, spin_rpm: 1800 },
    { aoa_deg:  -8, launch_deg: 18.2, spin_rpm: 1800 }
  ]},
  { ball_speed_mph: 90, ball_speed_kmh: 145, aoa: [
    { aoa_deg: -10, launch_deg: 16.4, spin_rpm: 1950 },
    { aoa_deg:  -8, launch_deg: 16.8, spin_rpm: 1950 },
    { aoa_deg:  -6, launch_deg: 17.3, spin_rpm: 1950 },
    { aoa_deg:  -4, launch_deg: 17.9, spin_rpm: 2000 },
    { aoa_deg:  -2, launch_deg: 18.5, spin_rpm: 2000 },
    { aoa_deg:   0, launch_deg: 19.2, spin_rpm: 2000 },
    { aoa_deg:   2, launch_deg: 19.9, spin_rpm: 2000 },
    { aoa_deg:   4, launch_deg: 20.7, spin_rpm: 1950 }
  ]},
  { ball_speed_mph: 100, ball_speed_kmh: 161, aoa: [
    { aoa_deg: -10, launch_deg: 14.8, spin_rpm: 2050 },
    { aoa_deg:  -8, launch_deg: 15.3, spin_rpm: 2100 },
    { aoa_deg:  -6, launch_deg: 15.9, spin_rpm: 2100 },
    { aoa_deg:  -4, launch_deg: 16.4, spin_rpm: 2150 },
    { aoa_deg:  -2, launch_deg: 17.2, spin_rpm: 2150 },
    { aoa_deg:   0, launch_deg: 17.9, spin_rpm: 2150 },
    { aoa_deg:   2, launch_deg: 18.7, spin_rpm: 2150 },
    { aoa_deg:   4, launch_deg: 19.5, spin_rpm: 2100 }
  ]},
  { ball_speed_mph: 110, ball_speed_kmh: 177, aoa: [
    { aoa_deg: -10, launch_deg: 13.3, spin_rpm: 2200 },
    { aoa_deg:  -8, launch_deg: 13.9, spin_rpm: 2250 },
    { aoa_deg:  -6, launch_deg: 14.4, spin_rpm: 2300 },
    { aoa_deg:  -4, launch_deg: 15.1, spin_rpm: 2300 },
    { aoa_deg:  -2, launch_deg: 15.8, spin_rpm: 2300 },
    { aoa_deg:   0, launch_deg: 16.6, spin_rpm: 2300 },
    { aoa_deg:   2, launch_deg: 17.4, spin_rpm: 2300 },
    { aoa_deg:   4, launch_deg: 18.2, spin_rpm: 2250 }
  ]},
  { ball_speed_mph: 120, ball_speed_kmh: 193, aoa: [
    { aoa_deg: -10, launch_deg: 11.9, spin_rpm: 2400 },
    { aoa_deg:  -8, launch_deg: 12.4, spin_rpm: 2400 },
    { aoa_deg:  -6, launch_deg: 13.0, spin_rpm: 2400 },
    { aoa_deg:  -4, launch_deg: 13.7, spin_rpm: 2450 },
    { aoa_deg:  -2, launch_deg: 14.5, spin_rpm: 2450 },
    { aoa_deg:   0, launch_deg: 15.3, spin_rpm: 2450 },
    { aoa_deg:   2, launch_deg: 16.2, spin_rpm: 2450 },
    { aoa_deg:   4, launch_deg: 17.1, spin_rpm: 2400 }
  ]},
  { ball_speed_mph: 130, ball_speed_kmh: 209, aoa: [
    { aoa_deg: -10, launch_deg: 10.4, spin_rpm: 2550 },
    { aoa_deg:  -8, launch_deg: 11.0, spin_rpm: 2550 },
    { aoa_deg:  -6, launch_deg: 11.7, spin_rpm: 2600 },
    { aoa_deg:  -4, launch_deg: 12.4, spin_rpm: 2600 },
    { aoa_deg:  -2, launch_deg: 13.2, spin_rpm: 2600 },
    { aoa_deg:   0, launch_deg: 14.1, spin_rpm: 2600 },
    { aoa_deg:   2, launch_deg: 15.0, spin_rpm: 2600 },
    { aoa_deg:   4, launch_deg: 15.9, spin_rpm: 2550 }
  ]},
  { ball_speed_mph: 140, ball_speed_kmh: 225, aoa: [
    { aoa_deg: -10, launch_deg:  9.0, spin_rpm: 2700 },
    { aoa_deg:  -8, launch_deg:  9.6, spin_rpm: 2750 },
    { aoa_deg:  -6, launch_deg: 10.3, spin_rpm: 2750 },
    { aoa_deg:  -4, launch_deg: 11.1, spin_rpm: 2750 },
    { aoa_deg:  -2, launch_deg: 12.0, spin_rpm: 2800 },
    { aoa_deg:   0, launch_deg: 12.8, spin_rpm: 2750 },
    { aoa_deg:   2, launch_deg: 13.8, spin_rpm: 2750 },
    { aoa_deg:   4, launch_deg: 14.9, spin_rpm: 2700 }
  ]},
  { ball_speed_mph: 150, ball_speed_kmh: 241, aoa: [
    { aoa_deg: -10, launch_deg:  7.5, spin_rpm: 2850 },
    { aoa_deg:  -8, launch_deg:  8.2, spin_rpm: 2900 },
    { aoa_deg:  -6, launch_deg:  9.0, spin_rpm: 2950 },
    { aoa_deg:  -4, launch_deg:  9.8, spin_rpm: 2950 },
    { aoa_deg:  -2, launch_deg: 10.7, spin_rpm: 2950 },
    { aoa_deg:   0, launch_deg: 11.7, spin_rpm: 2950 },
    { aoa_deg:   2, launch_deg: 12.7, spin_rpm: 2900 },
    { aoa_deg:   4, launch_deg: 13.9, spin_rpm: 2850 }
  ]},
  { ball_speed_mph: 160, ball_speed_kmh: 257, aoa: [
    { aoa_deg: -10, launch_deg:  6.2, spin_rpm: 3050 },
    { aoa_deg:  -8, launch_deg:  6.9, spin_rpm: 3100 },
    { aoa_deg:  -6, launch_deg:  7.7, spin_rpm: 3100 },
    { aoa_deg:  -4, launch_deg:  8.6, spin_rpm: 3150 },
    { aoa_deg:  -2, launch_deg:  9.5, spin_rpm: 3150 },
    { aoa_deg:   0, launch_deg: 10.6, spin_rpm: 3150 },
    { aoa_deg:   2, launch_deg: 11.6, spin_rpm: 3100 },
    { aoa_deg:   4, launch_deg: 12.7, spin_rpm: 3000 }
  ]},
  { ball_speed_mph: 170, ball_speed_kmh: 274, aoa: [
    { aoa_deg: -10, launch_deg:  4.9, spin_rpm: 3250 },
    { aoa_deg:  -8, launch_deg:  5.7, spin_rpm: 3300 },
    { aoa_deg:  -6, launch_deg:  6.5, spin_rpm: 3300 },
    { aoa_deg:  -4, launch_deg:  7.4, spin_rpm: 3350 },
    { aoa_deg:  -2, launch_deg:  8.3, spin_rpm: 3300 },
    { aoa_deg:   0, launch_deg:  9.4, spin_rpm: 3300 },
    { aoa_deg:   2, launch_deg: 10.6, spin_rpm: 3250 },
    { aoa_deg:   4, launch_deg: 11.8, spin_rpm: 3200 }
  ]},
  { ball_speed_mph: 180, ball_speed_kmh: 290, aoa: [
    { aoa_deg: -10, launch_deg:  3.6, spin_rpm: 3450 },
    { aoa_deg:  -8, launch_deg:  4.3, spin_rpm: 3500 },
    { aoa_deg:  -6, launch_deg:  5.2, spin_rpm: 3500 },
    { aoa_deg:  -4, launch_deg:  6.2, spin_rpm: 3500 },
    { aoa_deg:  -2, launch_deg:  7.3, spin_rpm: 3550 },
    { aoa_deg:   0, launch_deg:  8.4, spin_rpm: 3500 },
    { aoa_deg:   2, launch_deg:  9.6, spin_rpm: 3450 },
    { aoa_deg:   4, launch_deg: 10.9, spin_rpm: 3400 }
  ]},
  { ball_speed_mph: 190, ball_speed_kmh: 306, aoa: [
    { aoa_deg:  -8, launch_deg:  2.5, spin_rpm: 3500 },
    { aoa_deg:  -6, launch_deg:  3.0, spin_rpm: 3500 },
    { aoa_deg:  -4, launch_deg:  3.6, spin_rpm: 3200 },
    { aoa_deg:  -2, launch_deg:  4.2, spin_rpm: 3250 },
    { aoa_deg:   0, launch_deg:  4.9, spin_rpm: 3000 },
    { aoa_deg:   2, launch_deg:  5.5, spin_rpm: 3000 },
    { aoa_deg:   4, launch_deg:  6.4, spin_rpm: 2850 },
    { aoa_deg:   6, launch_deg:  7.0, spin_rpm: 2850 },
    { aoa_deg:   8, launch_deg:  7.9, spin_rpm: 2650 },
    { aoa_deg:  10, launch_deg:  8.4, spin_rpm: 2700 }
  ]},
  { ball_speed_mph: 200, ball_speed_kmh: 322, aoa: [
    { aoa_deg:  -4, launch_deg: 11.9, spin_rpm: 3250 },
    { aoa_deg:  -2, launch_deg: 12.7, spin_rpm: 3050 },
    { aoa_deg:   0, launch_deg: 13.8, spin_rpm: 2800 },
    { aoa_deg:   2, launch_deg: 12.9, spin_rpm: 3100 },
    { aoa_deg:   4, launch_deg: 13.9, spin_rpm: 2950 },
    { aoa_deg:   6, launch_deg: 14.5, spin_rpm: 2650 },
    { aoa_deg:   8, launch_deg: 13.9, spin_rpm: 2950 },
    { aoa_deg:  10, launch_deg: 15.0, spin_rpm: 2800 }
  ]}
];

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

function interpolateAoA(row: PingSpeedRow, aoa: number) {
  const pts = row.aoa;
  const aoas = pts.map(p => p.aoa_deg);
  const aoaClamped = clamp(aoa, Math.min(...aoas), Math.max(...aoas));
  const lo = Math.max(...aoas.filter(a => a <= aoaClamped));
  const hi = Math.min(...aoas.filter(a => a >= aoaClamped));
  const p1 = pts.find(p => p.aoa_deg === lo)!;
  const p2 = pts.find(p => p.aoa_deg === hi)!;
  if (lo === hi) return { launch_deg: p1.launch_deg, spin_rpm: p1.spin_rpm };
  const t = (aoaClamped - lo) / (hi - lo);
  return {
    launch_deg: Math.round(lerp(p1.launch_deg, p2.launch_deg, t) * 100) / 100,
    spin_rpm:   Math.round(lerp(p1.spin_rpm, p2.spin_rpm, t))
  };
}

export function lookup(ballSpeedMph: number, aoaDeg: number): LookupResult {
  const speeds = PING_DATA.map(r => r.ball_speed_mph);
  const bsClamped = clamp(ballSpeedMph, Math.min(...speeds), Math.max(...speeds));
  const loSpeed = Math.max(...speeds.filter(s => s <= bsClamped));
  const hiSpeed = Math.min(...speeds.filter(s => s >= bsClamped));
  const rowLo = PING_DATA.find(r => r.ball_speed_mph === loSpeed)!;
  const rowHi = PING_DATA.find(r => r.ball_speed_mph === hiSpeed)!;
  const resLo = interpolateAoA(rowLo, aoaDeg);
  const resHi = interpolateAoA(rowHi, aoaDeg);
  const t = loSpeed === hiSpeed ? 0 : (bsClamped - loSpeed) / (hiSpeed - loSpeed);
  const optimal_launch_deg = Math.round(lerp(resLo.launch_deg, resHi.launch_deg, t) * 10) / 10;
  const optimal_spin_rpm   = Math.round(lerp(resLo.spin_rpm, resHi.spin_rpm, t));
  return {
    optimal_launch_deg,
    optimal_spin_rpm,
    launch_min: Math.round((optimal_launch_deg - 1.0) * 10) / 10,
    launch_max: Math.round((optimal_launch_deg + 1.0) * 10) / 10,
    spin_min:   optimal_spin_rpm - 300,
    spin_max:   optimal_spin_rpm + 300
  };
}

export function analyse(
  ballSpeedMph: number,
  aoaDeg: number,
  actualLaunch: number,
  actualSpin: number
): AnalysisResult {
  const ref = lookup(ballSpeedMph, aoaDeg);
  return {
    ...ref,
    launch_delta_deg: Math.round((actualLaunch - ref.optimal_launch_deg) * 10) / 10,
    spin_delta_rpm:   Math.round(actualSpin - ref.optimal_spin_rpm),
    launch_status: actualLaunch < ref.launch_min ? 'low' : actualLaunch > ref.launch_max ? 'high' : 'optimal',
    spin_status:   actualSpin < ref.spin_min ? 'low' : actualSpin > ref.spin_max ? 'high' : 'optimal'
  };
}
