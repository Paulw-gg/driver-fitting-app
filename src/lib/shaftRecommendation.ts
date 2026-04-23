/**
 * Schaft-Empfehlungslogik für Driver Fitting App
 * Basis: PING Co-Pilot Methodik + PING G440 Schaftlinie
 * Inputs: Driver Clubspeed (mph) + Schwungtempo (slow / medium / fast)
 */

// ─── Typen ────────────────────────────────────────────────────────────────────

export type Tempo = 'slow' | 'medium' | 'fast';
export type FlexCode = 'L' | 'A' | 'R' | 'S' | 'X';
export type LaunchProfile = 'hoch' | 'mittel-hoch' | 'mittel' | 'niedrig-mittel' | 'niedrig';
export type SpinProfile = 'hoch' | 'mittel-hoch' | 'mittel' | 'niedrig' | 'sehr-niedrig';

export interface ShaftOption {
  id: string;
  brand: string;
  name: string;
  weightG: number;
  flexOptions: FlexCode[];
  launchProfile: LaunchProfile;
  spinProfile: SpinProfile;
  tempoMatch: Tempo[];
  speedRangeMph: [number, number];
  torqueDeg: number;
  kickPoint: 'niedrig' | 'mittel-niedrig' | 'mittel' | 'mittel-hoch' | 'hoch';
  tags: string[];
  description: string;
  isPrimary: boolean;
  cpmL?: number | null;
  cpmA?: number | null;
  cpmR?: number | null;
  cpmS?: number | null;
  cpmX?: number | null;
}

export interface ShaftRecommendationResult {
  recommendedFlex: FlexCode;
  flexLabel: string;
  weightRange: string;
  launchProfile: LaunchProfile;
  primaryShafts: ShaftOption[];
  alternativeShafts: ShaftOption[];
  explanation: string;
  warnings: string[];
  tempoAdjustmentApplied: boolean;
  tempoAdjustmentDirection: 'stiffer' | 'softer' | 'none';
  availableBrands: string[];
}

// ─── Schaftdatenbank (PING G440 Schaftlinie + Aftermarket) ───────────────────

export const SHAFT_DATABASE: ShaftOption[] = [
  // ── PING ──
  {
    id: 'alta-quick-45',
    brand: 'PING',
    name: 'Alta Quick 45',
    weightG: 45,
    flexOptions: ['L', 'A'],
    launchProfile: 'hoch',
    spinProfile: 'mittel-hoch',
    tempoMatch: ['slow', 'medium'],
    speedRangeMph: [55, 82],
    torqueDeg: 5.5,
    kickPoint: 'niedrig',
    tags: ['ultra-leicht', 'hoch-launch', 'HL-Build', 'Senior'],
    description: 'Ultraleichter Schaft für den G440 High-Launch-Build. Für sehr langsame Schwünge konzipiert — maximiert Kopfgeschwindigkeit durch geringes Gesamtgewicht.',
    isPrimary: true,
  },
  {
    id: 'alta-cb-blue-55',
    brand: 'PING',
    name: 'Alta CB Blue 55',
    weightG: 55,
    flexOptions: ['A', 'R', 'S'],
    launchProfile: 'mittel-hoch',
    spinProfile: 'mittel',
    tempoMatch: ['slow', 'medium'],
    speedRangeMph: [72, 100],
    torqueDeg: 4.2,
    kickPoint: 'mittel-niedrig',
    tags: ['leicht', 'mittel-hoch-launch', 'counter-balanced', 'smooth'],
    description: 'Counter-balanced Design — Gewichtsschwerpunkt im Griff-Bereich für flüssige Übergänge und gleichmäßiges Timing. Ideal für Spieler mit ruhigem bis mittlerem Tempo.',
    isPrimary: true,
  },
  {
    id: 'alta-cb-65',
    brand: 'PING',
    name: 'Alta CB 65',
    weightG: 65,
    flexOptions: ['R', 'S', 'X'],
    launchProfile: 'mittel',
    spinProfile: 'mittel',
    tempoMatch: ['slow', 'medium'],
    speedRangeMph: [85, 108],
    torqueDeg: 3.5,
    kickPoint: 'mittel',
    tags: ['mittel-schwer', 'mittel-launch', 'vielseitig'],
    description: 'Vielseitiger Allrounder im mittleren Gewichtsbereich. Identische Torque-Werte über alle Flex-Stufen für konsistentes Ballflug-Verhalten.',
    isPrimary: false,
  },
  {
    id: 'tour-20-chrome-65',
    brand: 'PING',
    name: 'Tour 2.0 Chrome 65',
    weightG: 65,
    flexOptions: ['S', 'X'],
    launchProfile: 'mittel',
    spinProfile: 'niedrig',
    tempoMatch: ['medium', 'fast'],
    speedRangeMph: [95, 120],
    torqueDeg: 2.8,
    kickPoint: 'mittel-hoch',
    tags: ['low-spin', 'kontrolliert', 'Tour-Qualität', 'stabil'],
    description: 'Mittlerer Launch mit niedrigem Spin und präziser Kontrolle. Niedriger Torque-Wert stabilisiert die Fläche bei schnellen und aggressiven Schwüngen.',
    isPrimary: true,
  },
  {
    id: 'tour-20-black-65',
    brand: 'PING',
    name: 'Tour 2.0 Black 65',
    weightG: 65,
    flexOptions: ['S', 'X'],
    launchProfile: 'niedrig-mittel',
    spinProfile: 'niedrig',
    tempoMatch: ['fast'],
    speedRangeMph: [100, 125],
    torqueDeg: 2.5,
    kickPoint: 'hoch',
    tags: ['low-launch', 'low-spin', 'aggressiv', 'Tour'],
    description: 'Niedrigerer Launch und Spin als der Chrome — für Spieler mit hoher Geschwindigkeit und aggressivem Tempo die Spin reduzieren wollen.',
    isPrimary: false,
  },
  {
    id: 'tour-20-75',
    brand: 'PING',
    name: 'Tour 2.0 75',
    weightG: 75,
    flexOptions: ['S', 'X'],
    launchProfile: 'niedrig',
    spinProfile: 'sehr-niedrig',
    tempoMatch: ['fast'],
    speedRangeMph: [105, 130],
    torqueDeg: 2.3,
    kickPoint: 'hoch',
    tags: ['schwer', 'low-launch', 'very-low-spin', 'Tour-Pro'],
    description: 'Schwerster PING Serienschaft — maximale Stabilität für Spieler mit sehr hohem Tempo und Clubspeed über 105 mph.',
    isPrimary: false,
  },

  // ── Project X ──
  {
    id: 'denali-red',
    brand: 'Project X',
    name: 'Denali Red',
    weightG: 55,
    flexOptions: ['R', 'S'],
    launchProfile: 'hoch',
    spinProfile: 'mittel-hoch',
    tempoMatch: ['medium', 'fast'],
    speedRangeMph: [85, 110],
    torqueDeg: 4.0,
    kickPoint: 'niedrig',
    tags: ['hoch-launch', 'mittel-spin', 'counter-balanced', 'moderate Tempo'],
    description: 'Counter-balanced, hoher Launch — gut geeignet für Spieler mit moderatem bis schnellem Tempo die trotz höherer Geschwindigkeit mehr Höhe wollen.',
    isPrimary: false,
  },
  {
    id: 'hzrdus-smoke-black-rdx-60',
    brand: 'Project X',
    name: 'HZRDUS Smoke Black RDX 60',
    weightG: 60,
    flexOptions: ['S', 'X'],
    launchProfile: 'niedrig',
    spinProfile: 'sehr-niedrig',
    tempoMatch: ['fast'],
    speedRangeMph: [100, 130],
    torqueDeg: 2.2,
    kickPoint: 'hoch',
    tags: ['low-launch', 'very-low-spin', 'ultra-stabil', 'aggressiv'],
    description: 'Einer der steifsten und stabilsten Aftermarket-Schäfte. Minimaler Torque und hoher Kick-Point für maximale Kontrolle bei sehr aggressivem Schwungtempo.',
    isPrimary: false,
  },
  {
    id: 'hzrdus-smoke-yellow-hdp-60',
    brand: 'Project X',
    name: 'HZRDUS Smoke Yellow HDP 60',
    weightG: 60,
    flexOptions: ['R', 'S'],
    launchProfile: 'mittel-hoch',
    spinProfile: 'mittel',
    tempoMatch: ['medium'],
    speedRangeMph: [88, 112],
    torqueDeg: 3.5,
    kickPoint: 'mittel',
    tags: ['mittel-hoch-launch', 'mittel-spin', 'ausgewogen'],
    description: 'Ausgewogenes Profil in der HZRDUS-Linie. Höherer Launch als der Black — für Spieler die mit mittlerem Tempo und mittlerer Geschwindigkeit mehr Höhe brauchen.',
    isPrimary: false,
  },

  // ── Mitsubishi ──
  {
    id: 'tensei-1k-black',
    brand: 'Mitsubishi',
    name: 'Tensei 1K Black',
    weightG: 60,
    flexOptions: ['S', 'X'],
    launchProfile: 'niedrig',
    spinProfile: 'niedrig',
    tempoMatch: ['fast'],
    speedRangeMph: [105, 130],
    torqueDeg: 2.0,
    kickPoint: 'hoch',
    tags: ['low-launch', 'low-spin', 'ultra-low-torque', 'aggressive Tempo'],
    description: 'Extrem niedriger Torque-Wert (2.0°) — verhindert Flächen-Rotation bei sehr aggressivem Tempo und hohem Clubspeed. Für die schnellsten Schwünge.',
    isPrimary: false,
  },
  {
    id: 'tensei-ck-orange-60',
    brand: 'Mitsubishi',
    name: 'Tensei CK Orange 60',
    weightG: 60,
    flexOptions: ['R', 'S'],
    launchProfile: 'hoch',
    spinProfile: 'mittel-hoch',
    tempoMatch: ['medium', 'fast'],
    speedRangeMph: [85, 110],
    torqueDeg: 3.8,
    kickPoint: 'niedrig',
    tags: ['hoch-launch', 'counter-balanced', 'aggressive Tempo'],
    description: 'Counter-balanced mit aktivem Tip-Bereich — produziert hohen Launch auch bei aggressivem Tempo. Für Spieler die mit schnellem Übergang mehr Höhe suchen.',
    isPrimary: false,
  },
  {
    id: 'kuro-kage-silver-60',
    brand: 'Mitsubishi',
    name: 'Kuro Kage Silver 60',
    weightG: 60,
    flexOptions: ['R', 'S', 'X'],
    launchProfile: 'mittel',
    spinProfile: 'mittel',
    tempoMatch: ['slow', 'medium'],
    speedRangeMph: [85, 115],
    torqueDeg: 3.6,
    kickPoint: 'mittel',
    tags: ['mittel-launch', 'smooth', 'vielseitig'],
    description: 'Gleichmäßiges Profil mit sanftem Feeling. Gut für Spieler die stabiles Ballflugbild und konsistente Distanzen priorisieren.',
    isPrimary: false,
  },

  // ── Fujikura ──
  {
    id: 'ventus-red-5',
    brand: 'Fujikura',
    name: 'Ventus Red 5',
    weightG: 50,
    flexOptions: ['R', 'S'],
    launchProfile: 'hoch',
    spinProfile: 'mittel-hoch',
    tempoMatch: ['slow', 'medium'],
    speedRangeMph: [75, 100],
    torqueDeg: 4.5,
    kickPoint: 'niedrig',
    tags: ['hoch-launch', 'leicht', 'smooth'],
    description: 'Leichter Ventus für moderate Schwunggeschwindigkeiten. Hoher Launch durch niedrigen Kick-Point — für Spieler die mehr Höhe suchen.',
    isPrimary: false,
  },
  {
    id: 'ventus-blue-6',
    brand: 'Fujikura',
    name: 'Ventus Blue 6',
    weightG: 60,
    flexOptions: ['R', 'S', 'X'],
    launchProfile: 'mittel',
    spinProfile: 'mittel',
    tempoMatch: ['medium', 'fast'],
    speedRangeMph: [90, 120],
    torqueDeg: 3.4,
    kickPoint: 'mittel',
    tags: ['mittel-launch', 'mittel-spin', 'vielseitig', 'Tour-beliebt'],
    description: 'Einer der meistgespielten Tour-Schäfte. Ausgewogenes Profil mit mittlerem Launch und Spin — funktioniert für viele Schwungtypen.',
    isPrimary: false,
  },
  {
    id: 'ventus-black-6',
    brand: 'Fujikura',
    name: 'Ventus Black 6',
    weightG: 60,
    flexOptions: ['S', 'X'],
    launchProfile: 'niedrig-mittel',
    spinProfile: 'niedrig',
    tempoMatch: ['fast'],
    speedRangeMph: [100, 130],
    torqueDeg: 2.6,
    kickPoint: 'hoch',
    tags: ['low-spin', 'low-launch', 'Tour-Pro', 'aggressiv'],
    description: 'Low-Launch, Low-Spin — für Spieler mit sehr aggressivem Tempo und hohem Clubspeed. Einer der steifsten Ventus-Varianten.',
    isPrimary: false,
  },

  // ── Graphite Design ──
  {
    id: 'tour-ad-iz-6',
    brand: 'Graphite Design',
    name: 'Tour AD IZ 6',
    weightG: 60,
    flexOptions: ['R', 'S', 'X'],
    launchProfile: 'mittel-hoch',
    spinProfile: 'mittel',
    tempoMatch: ['slow', 'medium'],
    speedRangeMph: [85, 115],
    torqueDeg: 3.2,
    kickPoint: 'mittel-niedrig',
    tags: ['mittel-hoch-launch', 'smooth', 'Tour-beliebt'],
    description: 'Sehr beliebter Tour-Schaft mit weichem Feeling und mittlerem bis hohem Launch. Besonders geeignet für Spieler mit ruhigem Timing.',
    isPrimary: false,
  },
  {
    id: 'tour-ad-di-6',
    brand: 'Graphite Design',
    name: 'Tour AD DI 6',
    weightG: 60,
    flexOptions: ['S', 'X'],
    launchProfile: 'niedrig-mittel',
    spinProfile: 'niedrig',
    tempoMatch: ['medium', 'fast'],
    speedRangeMph: [95, 125],
    torqueDeg: 2.9,
    kickPoint: 'hoch',
    tags: ['low-spin', 'kontrolliert', 'Tour'],
    description: 'Stabiler Tour-Schaft mit niedrigem Spin und kontrolliertem Ball-Flug. Für Spieler die auf Genauigkeit statt Distanz setzen.',
    isPrimary: false,
  },

  // ── Aldila ──
  {
    id: 'rogue-silver-125-msi-60',
    brand: 'Aldila',
    name: 'Rogue Silver 125 MSI 60',
    weightG: 60,
    flexOptions: ['R', 'S', 'X'],
    launchProfile: 'mittel',
    spinProfile: 'niedrig',
    tempoMatch: ['medium', 'fast'],
    speedRangeMph: [90, 120],
    torqueDeg: 3.1,
    kickPoint: 'mittel-hoch',
    tags: ['low-spin', 'mittel-launch', 'stabil'],
    description: 'Beliebter Aftermarket-Schaft mit niedrigem Spin und mittlerem Launch. Gutes Verhältnis aus Stabilität und Feeling.',
    isPrimary: false,
  },
  {
    id: 'nv-2kxv-blue-55',
    brand: 'Aldila',
    name: 'NV 2KXV Blue 55',
    weightG: 55,
    flexOptions: ['R', 'S'],
    launchProfile: 'mittel-hoch',
    spinProfile: 'mittel',
    tempoMatch: ['slow', 'medium'],
    speedRangeMph: [80, 105],
    torqueDeg: 4.0,
    kickPoint: 'mittel-niedrig',
    tags: ['leicht', 'mittel-hoch-launch', 'smooth'],
    description: 'Leichter Aldila-Schaft für moderate Geschwindigkeiten. Gutes Timing durch mittleren Kick-Point und ausgewogenes Profil.',
    isPrimary: false,
  },
];

// Fallback-Export für Offline-Betrieb
export { SHAFT_DATABASE as SHAFT_DATABASE_FALLBACK };

// ─── rowToShaftOption ─────────────────────────────────────────────────────────

import type { ShaftProductRow } from '../types';

export function rowToShaftOption(row: ShaftProductRow): ShaftOption {
  return {
    id:            row.id,
    brand:         row.brand,
    name:          row.name,
    weightG:       row.weight_g,
    flexOptions:   row.flex_options as FlexCode[],
    torqueDeg:     row.torque_deg ?? 3.5,
    kickPoint:     (row.kick_point ?? 'mittel') as ShaftOption['kickPoint'],
    launchProfile: row.launch_profile as LaunchProfile,
    spinProfile:   row.spin_profile as SpinProfile,
    tempoMatch:    row.tempo_match as Tempo[],
    speedRangeMph: [row.speed_range_min, row.speed_range_max],
    tags:          row.tags,
    description:   row.description ?? '',
    isPrimary:     row.is_primary,
    cpmL:          row.cpm_l,
    cpmA:          row.cpm_a,
    cpmR:          row.cpm_r,
    cpmS:          row.cpm_s,
    cpmX:          row.cpm_x,
  };
}

// ─── Alle Marken ──────────────────────────────────────────────────────────────

export function getAllBrands(externalShafts?: ShaftOption[]): string[] {
  const source = externalShafts && externalShafts.length > 0
    ? externalShafts
    : SHAFT_DATABASE;
  return [...new Set(source.map(s => s.brand))].sort();
}

// ─── Flex-Logik ────────────────────────────────────────────────────────────────

const FLEX_ORDER: FlexCode[] = ['L', 'A', 'R', 'S', 'X'];

function getBaseFlexFromSpeed(speedMph: number): FlexCode {
  if (speedMph < 72)  return 'L';
  if (speedMph < 82)  return 'A';
  if (speedMph < 95)  return 'R';
  if (speedMph < 110) return 'S';
  return 'X';
}

function applyTempoCorrection(baseFlex: FlexCode, tempo: Tempo): {
  correctedFlex: FlexCode;
  applied: boolean;
  direction: 'stiffer' | 'softer' | 'none';
} {
  const idx = FLEX_ORDER.indexOf(baseFlex);
  if (tempo === 'fast') {
    const newIdx = Math.min(4, idx + 1);
    return {
      correctedFlex: FLEX_ORDER[newIdx],
      applied: newIdx !== idx,
      direction: newIdx !== idx ? 'stiffer' : 'none',
    };
  }
  if (tempo === 'slow') {
    const newIdx = Math.max(0, idx - 1);
    return {
      correctedFlex: FLEX_ORDER[newIdx],
      applied: newIdx !== idx,
      direction: newIdx !== idx ? 'softer' : 'none',
    };
  }
  return { correctedFlex: baseFlex, applied: false, direction: 'none' };
}

// ─── Gewichts-Empfehlung ──────────────────────────────────────────────────────

function getWeightRange(speedMph: number, tempo: Tempo): string {
  if (speedMph < 75)  return tempo === 'fast' ? '45–55g' : '40–50g';
  if (speedMph < 90)  return tempo === 'fast' ? '55–65g' : '45–60g';
  if (speedMph < 105) return tempo === 'fast' ? '65–75g' : '55–65g';
  return tempo === 'fast' ? '70–80g' : '65–75g';
}

// ─── Launch-Profil ────────────────────────────────────────────────────────────

function getLaunchProfile(speedMph: number, tempo: Tempo): LaunchProfile {
  if (speedMph < 80)  return 'hoch';
  if (speedMph < 95)  return tempo === 'fast' ? 'mittel' : 'mittel-hoch';
  if (speedMph < 110) return tempo === 'fast' ? 'niedrig-mittel' : 'mittel';
  return 'niedrig';
}

// ─── Schaft-Matching ──────────────────────────────────────────────────────────

function matchShafts(
  speedMph: number,
  tempo: Tempo,
  flex: FlexCode,
  allowedBrands?: string[],
  database: ShaftOption[] = SHAFT_DATABASE
): { primary: ShaftOption[]; alternatives: ShaftOption[] } {
  const fi = FLEX_ORDER.indexOf(flex);
  const SPEED_TOLERANCE = 12;

  const scored = database
    .filter(s => {
      const speedOk =
        speedMph >= s.speedRangeMph[0] - SPEED_TOLERANCE &&
        speedMph <= s.speedRangeMph[1] + SPEED_TOLERANCE;
      const tempoOk = s.tempoMatch.includes(tempo) || s.tempoMatch.includes('medium');
      const flexOk  = s.flexOptions.some(f => Math.abs(FLEX_ORDER.indexOf(f) - fi) <= 1);
      const brandOk = !allowedBrands || allowedBrands.length === 0
                      || allowedBrands.includes(s.brand);
      return speedOk && tempoOk && flexOk && brandOk;
    })
    .sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      const aMid = (a.speedRangeMph[0] + a.speedRangeMph[1]) / 2;
      const bMid = (b.speedRangeMph[0] + b.speedRangeMph[1]) / 2;
      return Math.abs(aMid - speedMph) - Math.abs(bMid - speedMph);
    });

  return {
    primary:      scored.filter(s => s.isPrimary).slice(0, 2),
    alternatives: scored.filter(s => !s.isPrimary).slice(0, 3),
  };
}

// ─── Erklärungstext ──────────────────────────────────────────────────────────

function buildExplanation(
  speedMph: number,
  tempo: Tempo,
  flex: FlexCode,
  tempoApplied: boolean,
  tempoDirection: 'stiffer' | 'softer' | 'none'
): string {
  const tempoLabel = { slow: 'langsamen, flüssigen', medium: 'gleichmäßigen', fast: 'aggressiven, explosiven' }[tempo];
  const parts: string[] = [];

  parts.push(
    `Bei ${speedMph} mph Clubspeed und ${tempoLabel} Schwungtempo ist ${getFlexLabel(flex)} der optimale Ausgangspunkt.`
  );

  if (tempoApplied && tempoDirection === 'stiffer') {
    parts.push(
      `Das schnelle Tempo wurde berücksichtigt: ein aggressiver Übergang belastet den Schaft stärker als die reine Geschwindigkeit zeigt — daher eine Stufe steifer als der Speed-Basiswert.`
    );
  }
  if (tempoApplied && tempoDirection === 'softer') {
    parts.push(
      `Das ruhige Tempo wurde berücksichtigt: ein flüssiger, kontrollierter Rhythmus belastet den Schaft weniger — eine Stufe weicher ermöglicht besseres Timing und mehr Energieübertragung.`
    );
  }

  if (speedMph < 80) {
    parts.push(
      `Gewicht-Empfehlung: 40–55g. Leichtere Schäfte sind entscheidend um Kopfgeschwindigkeit zu generieren — ultraleichte Modelle (40–50g) maximieren die Kopfgeschwindigkeit besonders effektiv.`
    );
  } else if (speedMph >= 105) {
    parts.push(
      `Gewicht-Empfehlung: 65–80g. Schwerere Schäfte stabilisieren den Kopf beim Übergang und verhindern instabiles Schlagen bei hohem Tempo und hoher Geschwindigkeit.`
    );
  } else {
    parts.push(
      `Gewicht-Empfehlung: ${getWeightRange(speedMph, tempo)}. Im mittleren Bereich hat das Gewicht direkten Einfluss auf das Timing — immer am Trackman testen.`
    );
  }

  parts.push(
    `Hinweis: Flex-Labels sind nicht standardisiert — ein "Stiff" von PING kann anders spielen als ein "Stiff" von Fujikura. CPM-Messung beim Fitter gibt den genauen Vergleichswert.`
  );

  return parts.join(' ');
}

// ─── Warnungen ────────────────────────────────────────────────────────────────

function buildWarnings(speedMph: number, tempo: Tempo, flex: FlexCode): string[] {
  const warns: string[] = [];

  if (tempo === 'fast' && speedMph < 88) {
    warns.push(
      'Schnelles Tempo bei niedrigem Clubspeed: nicht zu steif wählen. Aggressiver Übergang bei geringer Geschwindigkeit kann zu einer instabilen Fläche führen — unbedingt am Monitor testen.'
    );
  }
  if (tempo === 'slow' && speedMph > 108) {
    warns.push(
      'Hoher Clubspeed mit ruhigem Tempo: typisch für technisch versierte Spieler mit viel Körpereinsatz. Flex kann eine Stufe weicher ausfallen als erwartet — immer am Launch Monitor verifizieren.'
    );
  }
  if (flex === 'X' && tempo !== 'fast') {
    warns.push(
      'X-Stiff bei nicht-aggressivem Tempo: Risiko eines zu steifen Schaftes — niedrigerer Launch und möglicher Distanzverlust. Vergleich mit Stiff-Flex empfohlen.'
    );
  }
  if (speedMph < 70 && tempo === 'fast') {
    warns.push(
      'Sehr niedrige Clubspeed mit schnellem Tempo: ungewöhnliche Kombination — Schwungtechnik überprüfen. Möglicherweise liegt ein Messfehler vor.'
    );
  }

  return warns;
}

// ─── Flex-Label ───────────────────────────────────────────────────────────────

export function getFlexLabel(flex: FlexCode): string {
  const labels: Record<FlexCode, string> = {
    L: 'Ladies (L)',
    A: 'Senior / Amateur (A)',
    R: 'Regular (R)',
    S: 'Stiff (S)',
    X: 'X-Stiff (X)',
  };
  return labels[flex];
}

// ─── Haupt-Funktion ───────────────────────────────────────────────────────────

/**
 * @param clubSpeedMph  Driver Clubspeed in mph (vom Launch Monitor)
 * @param tempo         Schwungtempo: 'slow' | 'medium' | 'fast'
 * @param allowedBrands Wenn angegeben, nur Schäfte dieser Marken zeigen ([] = alle)
 * @param externalShafts Aus Supabase geladene Schäfte (überschreibt SHAFT_DATABASE)
 */
export function recommendShaft(
  clubSpeedMph: number,
  tempo: Tempo,
  allowedBrands?: string[],
  externalShafts?: ShaftOption[]
): ShaftRecommendationResult {
  const database      = externalShafts && externalShafts.length > 0
    ? externalShafts
    : SHAFT_DATABASE;
  const baseFlex      = getBaseFlexFromSpeed(clubSpeedMph);
  const { correctedFlex, applied, direction } = applyTempoCorrection(baseFlex, tempo);
  const weightRange   = getWeightRange(clubSpeedMph, tempo);
  const launchProfile = getLaunchProfile(clubSpeedMph, tempo);
  const { primary, alternatives } = matchShafts(clubSpeedMph, tempo, correctedFlex, allowedBrands, database);
  const explanation   = buildExplanation(clubSpeedMph, tempo, correctedFlex, applied, direction);
  const warnings      = buildWarnings(clubSpeedMph, tempo, correctedFlex);

  return {
    recommendedFlex:           correctedFlex,
    flexLabel:                 getFlexLabel(correctedFlex),
    weightRange,
    launchProfile,
    primaryShafts:             primary,
    alternativeShafts:         alternatives,
    explanation,
    warnings,
    tempoAdjustmentApplied:    applied,
    tempoAdjustmentDirection:  direction,
    availableBrands:           getAllBrands(database),
  };
}

// ─── Hilfsfunktionen: Einheiten ───────────────────────────────────────────────

export function mphToKmh(mph: number): number {
  return Math.round(mph * 1.60934);
}

export function kmhToMph(kmh: number): number {
  return Math.round(kmh / 1.60934);
}
