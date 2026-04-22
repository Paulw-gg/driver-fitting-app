import { analyse } from './pingChartLookup';
import { analyseDPlane, buildFlightShapeLabel } from './dPlaneEngine';
import type {
  FittingInputs, AnalysisResult, EquipmentRec,
  TechniqueRec, DPlaneAnalysis, PlayerProfile,
} from '../types';

export function runAnalysis(inputs: FittingInputs): AnalysisResult {

  // ── 1. PING Chart Lookup ─────────────────────────────────────────────────────
  const aoaForLookup = inputs.monitorType === 'camera'
    ? inputs.aoaDeg - 2
    : inputs.aoaDeg;

  const ref = analyse(
    inputs.ballSpeedMph,
    aoaForLookup,
    inputs.launchAngleDeg,
    inputs.backspinRpm
  );

  // ── 2. Abgeleitete Basis-Werte ───────────────────────────────────────────────
  const smashFactor      = Math.round((inputs.ballSpeedMph / inputs.clubSpeedMph) * 1000) / 1000;
  const dynLoftDeg       = Math.round((inputs.launchAngleDeg + inputs.aoaDeg * 0.65) * 10) / 10;
  const spinLoftDeg      = Math.round((dynLoftDeg - inputs.aoaDeg) * 10) / 10;
  const smashFactorStatus = smashFactor >= 1.48 ? 'optimal' : 'low';

  // ── 3. D-Plane Analyse (wenn Club Path + Face Angle vorhanden) ───────────────
  let dPlane: DPlaneAnalysis | null = null;
  if (inputs.clubPathDeg !== null && inputs.faceAngleDeg !== null) {
    dPlane = analyseDPlane(
      inputs.clubPathDeg,
      inputs.faceAngleDeg,
      inputs.spinAxisDeg,
      inputs.impactZone
    );
  }

  // ── 4. CoG-Empfehlung ────────────────────────────────────────────────────────
  let cogVertical: 'low-back' | 'low-forward' | 'very-low' = 'low-back';
  if (inputs.backspinRpm > 3200 || ref.spin_status === 'high') cogVertical = 'low-forward';
  if (inputs.impactZone === 'tief' || inputs.backspinRpm < 1800) cogVertical = 'very-low';

  let cogHorizontal: 'neutral' | 'heel-bias' | 'toe-bias' = 'neutral';
  if (dPlane) {
    const spinAxis = inputs.spinAxisDeg;
    if (spinAxis > 6) cogHorizontal = 'heel-bias';
    else if (spinAxis < -6) cogHorizontal = 'toe-bias';
  } else {
    if (inputs.spinAxisDeg > 6 || inputs.impactZone === 'heel') cogHorizontal = 'heel-bias';
    if (inputs.spinAxisDeg < -6 || inputs.impactZone === 'toe') cogHorizontal = 'toe-bias';
  }

  // ── 5. Loft-Empfehlung ────────────────────────────────────────────────────────
  const targetSpinLoft  = ref.optimal_launch_deg - aoaForLookup;
  const recommendedLoft = Math.max(7, Math.min(16,
    Math.round((targetSpinLoft + aoaForLookup * 0.35) * 2) / 2
  ));

  // ── 6. Equipment-Empfehlungen (profilabhängig) ────────────────────────────────
  const equipmentRecs = buildEquipmentRecs(
    inputs, ref, dPlane, smashFactor,
    cogHorizontal, cogVertical, inputs.playerProfile
  );

  // ── 7. Technik-Empfehlungen (nur tech-optimizer) ──────────────────────────────
  const techniqueRecs = inputs.playerProfile === 'tech-optimizer' && dPlane
    ? buildTechniqueRecs(inputs, dPlane)
    : [];

  // ── 8. Diagnosetext ───────────────────────────────────────────────────────────
  const diagnosisText = buildDiagnosisText(inputs, ref, dPlane, smashFactor, inputs.playerProfile);

  return {
    smashFactor,
    spinLoftDeg,
    dynLoftDeg,
    optimalLaunchDeg:         ref.optimal_launch_deg,
    optimalSpinRpm:           ref.optimal_spin_rpm,
    launchMin:                ref.launch_min,
    launchMax:                ref.launch_max,
    spinMin:                  ref.spin_min,
    spinMax:                  ref.spin_max,
    launchDeltaDeg:           ref.launch_delta_deg,
    spinDeltaRpm:             ref.spin_delta_rpm,
    launchStatus:             ref.launch_status,
    spinStatus:               ref.spin_status,
    smashFactorStatus,
    diagnosisText,
    recommendations:          equipmentRecs,
    equipmentRecommendations: equipmentRecs,
    techniqueRecommendations: techniqueRecs,
    cogVertical,
    cogHorizontal,
    recommendedLoft,
    recommendedWeightSetting: cogHorizontal === 'heel-bias' ? 'draw'
                            : cogHorizontal === 'toe-bias'  ? 'fade'
                            : 'neutral',
    dPlane,
    playerProfile: inputs.playerProfile,
  };
}

// ─── Equipment-Empfehlungen ───────────────────────────────────────────────────

function buildEquipmentRecs(
  inputs: FittingInputs,
  ref: ReturnType<typeof analyse>,
  dPlane: DPlaneAnalysis | null,
  smashFactor: number,
  _cogH: string,
  _cogV: string,
  profile: PlayerProfile
): EquipmentRec[] {
  const recs: EquipmentRec[] = [];
  const isMaxer     = profile === 'equipment-maxer';
  const isOptimizer = profile === 'tech-optimizer';

  // ── SPIN / LAUNCH ─────────────────────────────────────────────────────────────

  if (ref.spin_status === 'high') {
    recs.push({
      priority: 'primary',
      category: 'loft',
      title: 'Spin zu hoch — Loft reduzieren',
      description: `Aktueller Spin ${inputs.backspinRpm} rpm liegt ${ref.spin_delta_rpm} rpm über dem Zielwert. `
        + (isMaxer
          ? 'Empfehlung: Loft um 0.5–1° reduzieren oder Forward-CoG-Driver (Low-Spin-Modell) testen.'
          : 'Kurzfristig: Loft reduzieren. Langfristig: AoA durch Tee-Höhe und Ballposition verbessern — das senkt Spin nachhaltig ohne Distanzverlust.'),
      profileRelevance: 'both',
    });
  }

  if (ref.spin_status === 'low') {
    recs.push({
      priority: 'primary',
      category: 'loft',
      title: 'Spin zu niedrig — Ball kippt ab',
      description: `Aktueller Spin ${inputs.backspinRpm} rpm liegt ${Math.abs(ref.spin_delta_rpm)} rpm unter dem Zielwert. `
        + 'Loft erhöhen oder Back-CoG-Driver für mehr Auftrieb. Ball fällt sonst nach dem Scheitelpunkt zu schnell ab.',
      profileRelevance: 'both',
    });
  }

  if (ref.launch_status === 'low') {
    recs.push({
      priority: 'primary',
      category: 'loft',
      title: 'Launch zu niedrig',
      description: `Launch ${inputs.launchAngleDeg}° liegt ${Math.abs(ref.launch_delta_deg)}° unter dem Zielwert. `
        + (isMaxer
          ? 'Loft erhöhen, Tee höher stellen, Back-CoG-Driver wählen.'
          : 'Tee höher + Ball weiter vorne — das verbessert AoA und Launch gleichzeitig ohne Equipment-Wechsel.'),
      profileRelevance: 'both',
    });
  }

  // ── SMASH FACTOR ──────────────────────────────────────────────────────────────

  if (smashFactor < 1.44) {
    recs.push({
      priority: 'primary',
      category: 'moi',
      title: `Smash Factor niedrig (${smashFactor.toFixed(3)})`,
      description: isMaxer
        ? 'Off-Center-Treffer kosten Ballgeschwindigkeit. Driver mit hohem MOI (460cc, Perimeter-Gewicht) minimiert Energieverlust bei Fehltreffern.'
        : 'Smash Factor verbessert sich direkt mit konstanterem Trefferbild — Fokus auf Sweetspot-Treffen. Hohes MOI puffert Fehlschläge kurzfristig.',
      profileRelevance: 'both',
    });
  }

  // ── D-PLANE BASIERTE EMPFEHLUNGEN ─────────────────────────────────────────────

  if (dPlane) {
    const { faceToPath, primaryCause, pathCategory, faceCategory: _fc,
            gearEffectOffset, spinAxisDeg, flightShape: _fs } = dPlane;

    if (primaryCause === 'face' || primaryCause === 'kombiniert') {
      if (faceToPath > 5) {
        recs.push({
          priority: 'primary',
          category: 'face-angle',
          title: 'Face zu offen relativ zum Path — Hauptursache Slice/Fade',
          description: isMaxer
            ? `Face-to-Path: +${faceToPath}°. Das ist die Hauptursache für den Rechtsspin. `
              + 'Empfehlung: Draw-Bias Driver (geschlossene Fläche ~1–1.5°) + CoG Richtung Heel. '
              + 'Zusammen reduziert das Face-to-Path effektiv um ~3–5° ohne Schwungänderung.'
            : `Face-to-Path: +${faceToPath}°. Kurzfristig: Draw-Bias Driver überbrückt das Problem. `
              + `Langfristig: Face beim Aufprall um ${Math.abs(dPlane.faceCorrectionNeeded).toFixed(1)}° schließen — `
              + 'das löst die Ursache. Equipment kann nur kompensieren, nicht korrigieren.',
          profileRelevance: 'both',
        });
      } else if (faceToPath < -5) {
        recs.push({
          priority: 'primary',
          category: 'face-angle',
          title: 'Face zu geschlossen relativ zum Path — Hauptursache Hook/Draw',
          description: isMaxer
            ? `Face-to-Path: ${faceToPath}°. Forward-CoG-Driver oder Toe-Setting reduziert Linksspin. `
              + 'Draw-Bias Driver vermeiden — würde Hook verstärken.'
            : `Face-to-Path: ${faceToPath}°. Face beim Aufprall um ${Math.abs(dPlane.faceCorrectionNeeded).toFixed(1)}° öffnen. `
              + 'Kurzfristig: Fade-Setting am Driver.',
          profileRelevance: 'both',
        });
      }
    }

    if (primaryCause === 'path' || primaryCause === 'kombiniert') {
      if (pathCategory === 'stark-out-to-in' || pathCategory === 'leicht-out-to-in') {
        recs.push({
          priority: isOptimizer ? 'primary' : 'secondary',
          category: 'cog',
          title: `Out-to-In Path (${dPlane.clubPathDeg}°) — ${isMaxer ? 'Equipment-Kompensation' : 'Technik-Priorität'}`,
          description: isMaxer
            ? 'Out-to-In Schwungweg ist die häufigste Ursache für Slice. Draw-Bias Driver + Heel-CoG kompensieren bis zu ~4–5° Path-Fehler. '
              + 'Vollständige Korrektur ist durch Equipment allein nicht möglich — realistische Erwartung setzen.'
            : `Schwungweg um ${Math.abs(dPlane.pathCorrectionNeeded).toFixed(1)}° in Richtung In-to-Out verbessern. `
              + 'Das ist die nachhaltigste Lösung — Equipment-Anpassung überbrückt den Lernprozess.',
          profileRelevance: 'both',
        });
      }

      if (pathCategory === 'stark-in-to-out' || pathCategory === 'leicht-in-to-out') {
        recs.push({
          priority: isOptimizer ? 'primary' : 'secondary',
          category: 'cog',
          title: `In-to-Out Path (+${dPlane.clubPathDeg}°) — ${isMaxer ? 'Equipment-Kompensation' : 'Technik-Priorität'}`,
          description: isMaxer
            ? 'Starker In-to-Out Path bei geschlossener Fläche → Hook-Risiko. Fade-Setting oder Forward-CoG reduziert Linksspin. '
              + 'Face-to-Path im Auge behalten: Ziel ist Face-to-Path nahe 0°.'
            : `Schwungweg um ${Math.abs(dPlane.pathCorrectionNeeded).toFixed(1)}° neutralisieren. `
              + 'In-to-Out ist oft eine Überkorrektur eines früheren Slice-Problems.',
          profileRelevance: 'both',
        });
      }
    }

    // ── GEAR EFFECT WECHSELWIRKUNG ────────────────────────────────────────────

    if (primaryCause === 'geareffect') {
      if (gearEffectOffset > 0 && spinAxisDeg > 8) {
        recs.push({
          priority: 'primary',
          category: 'moi',
          title: 'Heel-Treffer verstärkt Slice — Doppeltes Problem',
          description: 'Heel-Treffer erzeugen durch Gear Effect +8–12° Spin-Achsen-Kippung zusätzlich zur Face-to-Path-Wirkung. '
            + (isMaxer
              ? 'Hohes MOI dämpft den Gear Effect. Draw-Bias Driver kompensiert beide Effekte teilweise. Trefferpunkt-Optimierung hat höchste Priorität.'
              : 'Trefferpunkt auf Sweetspot verbessern hat hier mehr Wirkung als Equipment — Heel-Treffer verdoppeln das Problem.'),
          profileRelevance: 'both',
        });
      }

      if (gearEffectOffset > 0 && faceToPath < 0) {
        recs.push({
          priority: 'secondary',
          category: 'cog',
          title: 'Heel-Treffer + geschlossene Fläche — Teilkompensation',
          description: 'Der Heel-Gear-Effect (+Rechtsspin) und die geschlossene Face (Linksspin) heben sich teilweise auf. '
            + 'Achtung: Inkonsistente Ballflüge entstehen wenn Trefferpunkt variiert — mal Draw, mal Fade.',
          profileRelevance: 'both',
        });
      }

      if (gearEffectOffset < 0 && faceToPath > 0) {
        recs.push({
          priority: 'secondary',
          category: 'cog',
          title: 'Toe-Treffer + offene Fläche — Teilkompensation',
          description: 'Toe-Gear-Effect (-Linksspin) und offene Face (+Rechtsspin) kompensieren sich teilweise. '
            + 'Ergebnis: scheinbar gerader Schlag, aber aus falschen Gründen — inkonsistent bei variierendem Trefferpunkt.',
          profileRelevance: 'both',
        });
      }
    }

    // ── STARTRICHTUNG ─────────────────────────────────────────────────────────

    if (Math.abs(dPlane.startDirection) > 4) {
      recs.push({
        priority: 'secondary',
        category: 'face-angle',
        title: `Startrichtung: ${dPlane.startDirection > 0 ? 'rechts' : 'links'} (${Math.abs(dPlane.startDirection).toFixed(1)}°)`,
        description: `Der Ball startet ${Math.abs(dPlane.startDirection).toFixed(1)}° `
          + `${dPlane.startDirection > 0 ? 'rechts' : 'links'} — unabhängig von der Kurve. `
          + 'Das kommt vom Face Angle, nicht vom Path. '
          + (isMaxer
            ? 'Hosel-Einstellung (Face-Winkel) direkt anpassen für gerade Startrichtung.'
            : 'Face beim Aufprall squarer halten — das verbessert sofort die Startrichtung.'),
        profileRelevance: 'both',
      });
    }

  } else {
    // ── OHNE D-PLANE: bisherige Spin-Achsen-Logik ─────────────────────────────

    if (inputs.spinAxisDeg > 6 || inputs.impactZone === 'heel') {
      recs.push({
        priority: 'primary',
        category: 'cog',
        title: 'Spin-Achse rechts — Draw-Bias empfohlen',
        description: 'CoG Richtung Heel / Draw-Bias-Driver reduziert Rechtsspin. '
          + 'Für präzisere Analyse: Club Path + Face Angle eingeben.',
        profileRelevance: 'both',
      });
    }

    if (inputs.spinAxisDeg < -6 || inputs.impactZone === 'toe') {
      recs.push({
        priority: 'primary',
        category: 'cog',
        title: 'Spin-Achse links — Fade-Setting empfohlen',
        description: 'CoG Richtung Toe oder Forward-CoG reduziert Linksspin. '
          + 'Draw-Bias Driver unbedingt vermeiden.',
        profileRelevance: 'both',
      });
    }
  }

  // ── AoA ───────────────────────────────────────────────────────────────────────

  if (inputs.aoaDeg < -2) {
    recs.push({
      priority: 'secondary',
      category: 'loft',
      title: `AoA negativ (${inputs.aoaDeg}°) — Tee höher stellen`,
      description: isMaxer
        ? 'Negativer AoA erhöht Spin-Loft und kostet Distanz. Tee 5–8mm höher + Ball weiter vorne. '
          + 'Alternativ: Back-CoG-Driver kompensiert teilweise durch höheren Launch.'
        : 'Tee höher stellen und Ball weiter vorne in der Stellung — einfachste Methode um AoA zu verbessern. '
          + 'Ziel: AoA +1° bis +4°.',
      profileRelevance: 'both',
    });
  }

  // ── TREFFERZONE-SPEZIFISCH ────────────────────────────────────────────────────

  if (inputs.impactZone === 'tief') {
    recs.push({
      priority: 'secondary',
      category: 'moi',
      title: 'Tiefe Treffer — Tee höher, Low-CG Driver',
      description: isMaxer
        ? 'Tiefe Treffer: niedrigerer Launch + mehr Spin. Very-Low-CG-Driver minimiert Schaden. Tee-Höhe erhöhen.'
        : 'Tee höher stellen — das ist die direkteste Lösung für tiefe Treffer. Low-CG-Driver überbrückt den Prozess.',
      profileRelevance: 'both',
    });
  }

  if (inputs.impactZone === 'hoch-mitte') {
    recs.push({
      priority: 'secondary',
      category: 'cog',
      title: 'Hoch-Mitte — optimale Zone, beibehalten',
      description: 'Hoch-Mitte ist beim modernen Driver die beste Trefferzone: Vertical Gear Effect + tiefes CoG = höherer Launch, weniger Spin. Setup beibehalten.',
      profileRelevance: 'both',
    });
  }

  // ── AoA TIPP FÜR TECH-OPTIMIZER ──────────────────────────────────────────────

  if (isOptimizer && inputs.aoaDeg < 0) {
    recs.push({
      priority: 'secondary',
      category: 'loft',
      title: 'AoA-Verbesserung: +2° bis +4° Zielbereich',
      description: `Aktueller AoA: ${inputs.aoaDeg}°. Aufwärtiger AoA senkt Spin-Loft ohne Loftänderung. `
        + 'Umsetzung: Tee-Höhe +8mm, Ballposition eine Handbreite weiter vorne. '
        + `Erwarteter Effekt bei AoA +2°: ~${Math.round(Math.abs(inputs.aoaDeg) * 100)} RPM weniger Spin.`,
      profileRelevance: 'tech-optimizer',
    });
  }

  return recs;
}

// ─── Technik-Empfehlungen ─────────────────────────────────────────────────────

function buildTechniqueRecs(
  inputs: FittingInputs,
  dPlane: DPlaneAnalysis
): TechniqueRec[] {
  const recs: TechniqueRec[] = [];

  if (Math.abs(dPlane.clubPathDeg) > 3) {
    const direction = dPlane.clubPathDeg < 0 ? 'In-to-Out' : 'Out-to-In';
    const targetPath = dPlane.clubPathDeg < 0
      ? Math.min(0, dPlane.clubPathDeg + Math.abs(dPlane.pathCorrectionNeeded))
      : Math.max(0, dPlane.clubPathDeg - Math.abs(dPlane.pathCorrectionNeeded));

    recs.push({
      priority: 'primary',
      title: `Club Path verbessern: Richtung ${direction}`,
      description: `Aktueller Path: ${dPlane.clubPathDeg}°. Für neutrale Spin-Achse wäre ein Path von ${targetPath.toFixed(1)}° optimal bei unveränderter Face. `
        + (dPlane.clubPathDeg < 0
          ? 'Schwungweg flacher und mehr von innen — typische Übung: Foot-Back Drill, Inside-Out Gate.'
          : 'Schwungweg steiler durch den Ball — typische Übung: Towel Drill, Target-Line Focus.'),
      targetValue: `Club Path: ${targetPath.toFixed(1)}° bis 0°`,
      currentValue: `Club Path: ${dPlane.clubPathDeg}°`,
      improvementDeg: Math.abs(dPlane.pathCorrectionNeeded),
    });
  }

  if (Math.abs(dPlane.faceToPath) > 3) {
    const faceDir = dPlane.faceToPath > 0 ? 'schließen' : 'öffnen';
    recs.push({
      priority: 'primary',
      title: `Face beim Aufprall ${faceDir}`,
      description: `Face-to-Path: ${dPlane.faceToPath}°. Face ${faceDir} um ${Math.abs(dPlane.faceCorrectionNeeded).toFixed(1)}°. `
        + (dPlane.faceToPath > 0
          ? 'Stärkerer Handgelenkseinsatz (Supination/Closing), frühere Rotation im Übergang.'
          : 'Face länger offen halten, weniger Handgelenkseinsatz, später rotieren.'),
      targetValue: 'Face-to-Path: 0° bis -2° (leichter Draw)',
      currentValue: `Face-to-Path: ${dPlane.faceToPath}°`,
      improvementDeg: Math.abs(dPlane.faceCorrectionNeeded),
    });
  }

  if (inputs.aoaDeg < 0) {
    recs.push({
      priority: 'secondary',
      title: 'AoA aufwärtig machen',
      description: `Aktuell: ${inputs.aoaDeg}°. Ziel: +2° bis +4°. Praktische Methode: Tee 8mm höher + Ball eine Handbreite weiter vorne. `
        + 'Tiefpunkt des Schwungs muss hinter dem Ball liegen.',
      targetValue: 'AoA: +2° bis +4°',
      currentValue: `AoA: ${inputs.aoaDeg}°`,
      improvementDeg: Math.abs(inputs.aoaDeg) + 2,
    });
  }

  if (inputs.impactZone === 'heel' || inputs.impactZone === 'toe') {
    recs.push({
      priority: 'secondary',
      title: `Trefferpunkt von ${inputs.impactZone === 'heel' ? 'Heel' : 'Toe'} zur Mitte verbessern`,
      description: inputs.impactZone === 'heel'
        ? 'Heel-Treffer: Adressposition prüfen — Ball näher an den Körper. Typische Ursache: Hände zu weit vom Körper im Durchschwung.'
        : 'Toe-Treffer: Ball weiter vom Körper in der Adresse. Typische Ursache: Aufstehen im Durchschwung (Early Extension).',
      targetValue: 'Trefferzone: Sweetspot oder Hoch-Mitte',
      currentValue: `Trefferzone: ${inputs.impactZone}`,
      improvementDeg: 0,
    });
  }

  return recs;
}

// ─── Diagnosetext ─────────────────────────────────────────────────────────────

function buildDiagnosisText(
  inputs: FittingInputs,
  ref: ReturnType<typeof analyse>,
  dPlane: DPlaneAnalysis | null,
  smashFactor: number,
  profile: PlayerProfile
): string {
  const parts: string[] = [];

  if (dPlane) {
    parts.push(
      `Ballflugform: ${buildFlightShapeLabel(dPlane.flightShape)}. `
      + `Startrichtung: ${dPlane.startDirection > 0 ? '+' : ''}${dPlane.startDirection}° `
      + `(${dPlane.startDirection > 1 ? 'rechts' : dPlane.startDirection < -1 ? 'links' : 'gerade'}), `
      + `Face-to-Path: ${dPlane.faceToPath > 0 ? '+' : ''}${dPlane.faceToPath}°.`
    );

    const causeTexts: Record<DPlaneAnalysis['primaryCause'], string> = {
      face: `Primäre Ursache: Face Angle (${dPlane.faceAngleDeg > 0 ? 'offen' : 'geschlossen'} bei ${dPlane.faceAngleDeg}°). Die Fläche dominiert Startrichtung und Spin-Achse.`,
      path: `Primäre Ursache: Club Path (${dPlane.clubPathDeg}°, ${dPlane.pathCategory.replace(/-/g, ' ')}). Schwungweg erzeugt Spin-Achsen-Kippung.`,
      geareffect: `Primäre Ursache: Gear Effect durch ${dPlane.impactZone}-Treffer — überlagert Face-to-Path-Effekt.`,
      kombiniert: `Kombinierte Ursache: Face-to-Path (${dPlane.faceToPath}°) und Gear Effect (${dPlane.impactZone}-Treffer) wirken zusammen.`,
    };
    parts.push(causeTexts[dPlane.primaryCause]);
  }

  if (ref.spin_status !== 'optimal') {
    parts.push(
      `Spin ${ref.spin_status === 'high' ? 'zu hoch' : 'zu niedrig'}: `
      + `${inputs.backspinRpm} rpm (Ziel: ${ref.optimal_spin_rpm} ±300 rpm).`
    );
  }

  if (smashFactor < 1.44) {
    parts.push(`Smash Factor ${smashFactor.toFixed(3)} — Off-Center-Treffer kostet Ballgeschwindigkeit.`);
  }

  if (profile === 'tech-optimizer') {
    parts.push('Spielerprofil: Technik-Optimierer — Equipment überbrückt kurzfristig, Technik-Empfehlungen haben Priorität.');
  } else {
    parts.push('Spielerprofil: Equipment-Maximierer — Schläger wird maximal auf aktuellen Schwung angepasst.');
  }

  return parts.join(' ');
}
