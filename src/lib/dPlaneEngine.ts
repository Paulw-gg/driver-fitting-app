/**
 * D-Plane Analyse Engine
 * Physikalische Grundlagen:
 * - Face Angle bestimmt ~80% der Startrichtung (D-Plane Theorie, TrackMan)
 * - Face-to-Path (= Face - Path) bestimmt die Spin-Achse → Kurve
 * - Gear Effect (Trefferzone) addiert sich zur Spin-Achse
 * - Spin-Achse gesamt ≈ (Face-to-Path × 0.75) + GearEffectOffset
 */

import type { DPlaneAnalysis, ImpactZone } from '../types';

// Gear Effect Offsets pro Trefferzone (empirische Werte, Grad Spin-Achse)
const GEAR_EFFECT_OFFSET: Record<ImpactZone, number> = {
  'sweetspot':  0,
  'hoch-mitte': 0,    // Vertikaler Gear Effect — keine horizontale Spin-Achsen-Wirkung
  'tief':       0,    // Vertikaler Gear Effect — keine horizontale Spin-Achsen-Wirkung
  'heel':      +10,   // Heel-Treffer: Spin-Achse kippt nach rechts (Fade/Slice-Richtung)
  'toe':       -10,   // Toe-Treffer: Spin-Achse kippt nach links (Draw/Hook-Richtung)
};

// Kategorisierung Club Path
function categorisePath(deg: number): DPlaneAnalysis['pathCategory'] {
  if (deg <= -8)  return 'stark-out-to-in';
  if (deg <= -3)  return 'leicht-out-to-in';
  if (deg <= +3)  return 'neutral';
  if (deg <= +8)  return 'leicht-in-to-out';
  return 'stark-in-to-out';
}

// Kategorisierung Face Angle
function categoriseFace(deg: number): DPlaneAnalysis['faceCategory'] {
  if (deg >= +8)  return 'stark-offen';
  if (deg >= +3)  return 'leicht-offen';
  if (deg >= -3)  return 'square';
  if (deg >= -8)  return 'leicht-geschlossen';
  return 'stark-geschlossen';
}

// Ballflugform aus Startrichtung + Kurve bestimmen
function classifyFlightShape(
  startDir: number,
  spinAxis: number
): DPlaneAnalysis['flightShape'] {
  const startsLeft  = startDir < -2;
  const startsRight = startDir > +2;
  const curvesLeft  = spinAxis < -4;
  const curvesRight = spinAxis > +4;

  if (startsLeft  && curvesLeft)  return 'pull-hook';
  if (startsLeft  && curvesRight) return 'fade';     // Pull-Fade
  if (startsRight && curvesRight) return 'push-slice';
  if (startsRight && curvesLeft)  return 'draw';     // Push-Draw
  if (!startsLeft && !startsRight && curvesLeft)  return 'hook';
  if (!startsLeft && !startsRight && curvesRight) return 'slice';
  if (startsRight && !curvesLeft && !curvesRight) return 'push';
  if (startsLeft  && !curvesLeft && !curvesRight) return 'straight'; // Straight Pull
  return 'straight';
}

// Primäre Ursache des Ballflugproblems identifizieren
function identifyPrimaryCause(
  faceToPath: number,
  gearEffect: number,
  _spinAxis: number
): DPlaneAnalysis['primaryCause'] {
  const faceToPathContrib = Math.abs(faceToPath * 0.75);
  const gearContrib       = Math.abs(gearEffect);

  if (gearContrib > 8 && gearContrib > faceToPathContrib) return 'geareffect';
  if (faceToPathContrib > 6 && gearContrib < 4)           return 'face';
  if (Math.abs(faceToPath) < 3 && gearContrib < 4)        return 'path';
  return 'kombiniert';
}

export function analyseDPlane(
  clubPathDeg: number,
  faceAngleDeg: number,
  spinAxisMeasured: number,
  impactZone: ImpactZone
): DPlaneAnalysis {
  const faceToPath         = Math.round((faceAngleDeg - clubPathDeg) * 10) / 10;
  const startDirection     = Math.round(faceAngleDeg * 0.80 * 10) / 10;
  const gearEffectOffset   = GEAR_EFFECT_OFFSET[impactZone];
  const spinAxisFromDPlane = Math.round((faceToPath * 0.75 + gearEffectOffset) * 10) / 10;
  const spinAxisDelta      = Math.round((spinAxisMeasured - spinAxisFromDPlane) * 10) / 10;

  const pathCategory  = categorisePath(clubPathDeg);
  const faceCategory  = categoriseFace(faceAngleDeg);
  const primaryCause  = identifyPrimaryCause(faceToPath, gearEffectOffset, spinAxisMeasured);
  const flightShape   = classifyFlightShape(startDirection, spinAxisMeasured);

  // Korrekturbedarf für neutralen Ballflug (Spin-Achse 0°, Start gerade)
  // Ziel-Face-to-Path für neutrale Spin-Achse = 0°
  // spinAxis = faceToPath * 0.75 + gearEffect → 0 = faceToPath * 0.75 + gear
  // → faceToPath_target = -gearEffect / 0.75
  const targetFaceToPath = -gearEffectOffset / 0.75;

  // Face-Korrektur: Face schließen bis Face-to-Path = targetFaceToPath, bei konstantem Path
  const faceCorrectionNeeded = Math.round(
    (faceAngleDeg - (clubPathDeg + targetFaceToPath)) * 10
  ) / 10;

  // Path-Korrektur: Path anpassen bis Face-to-Path = targetFaceToPath, bei konstanter Face
  const pathCorrectionNeeded = Math.round(
    (clubPathDeg - (faceAngleDeg - targetFaceToPath)) * 10
  ) / 10;

  return {
    clubPathDeg,
    faceAngleDeg,
    spinAxisDeg: spinAxisMeasured,
    impactZone,
    faceToPath,
    startDirection,
    gearEffectOffset,
    spinAxisFromDPlane,
    spinAxisDelta,
    pathCategory,
    faceCategory,
    primaryCause,
    flightShape,
    pathCorrectionNeeded,
    faceCorrectionNeeded,
  };
}

// ─── Empfehlungstexte (D-Plane basiert) ──────────────────────────────────────

export function buildFlightShapeLabel(shape: DPlaneAnalysis['flightShape']): string {
  const labels: Record<DPlaneAnalysis['flightShape'], string> = {
    'pull-hook':  'Pull-Hook (links gestartet, zieht weiter links)',
    'hook':       'Hook (gerade gestartet, zieht stark links)',
    'draw':       'Draw / Push-Draw (rechts gestartet, zieht zurück)',
    'straight':   'Gerade / Straight Pull',
    'fade':       'Fade / Pull-Fade (links gestartet, zieht rechts)',
    'slice':      'Slice (gerade gestartet, zieht stark rechts)',
    'push-slice': 'Push-Slice (rechts gestartet, zieht weiter rechts)',
    'push':       'Push (rechts gestartet, gerader Flug)',
  };
  return labels[shape];
}
