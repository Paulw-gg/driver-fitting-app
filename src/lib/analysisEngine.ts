import { analyse } from './pingChartLookup';
import type { FittingInputs, AnalysisResult, Recommendation } from '../types';

export function runAnalysis(inputs: FittingInputs): AnalysisResult {
  const aoaForLookup = inputs.monitorType === 'camera'
    ? inputs.aoaDeg - 2
    : inputs.aoaDeg;

  const ref = analyse(inputs.ballSpeedMph, aoaForLookup, inputs.launchAngleDeg, inputs.backspinRpm);

  const smashFactor = Math.round((inputs.ballSpeedMph / inputs.clubSpeedMph) * 1000) / 1000;
  const dynLoftDeg  = Math.round((inputs.launchAngleDeg + inputs.aoaDeg * 0.65) * 10) / 10;
  const spinLoftDeg = Math.round((dynLoftDeg - inputs.aoaDeg) * 10) / 10;
  const smashFactorStatus = smashFactor >= 1.48 ? 'optimal' : 'low';

  let cogVertical: 'low-back' | 'low-forward' | 'very-low' = 'low-back';
  if (inputs.backspinRpm > 3200 || ref.spin_status === 'high') cogVertical = 'low-forward';
  if (inputs.impactZone === 'tief' || inputs.backspinRpm < 1800) cogVertical = 'very-low';

  let cogHorizontal: 'neutral' | 'heel-bias' | 'toe-bias' = 'neutral';
  if (inputs.spinAxisDeg > 6 || inputs.impactZone === 'heel') cogHorizontal = 'heel-bias';
  if (inputs.spinAxisDeg < -6 || inputs.impactZone === 'toe') cogHorizontal = 'toe-bias';

  const targetSpinLoft = ref.optimal_launch_deg - aoaForLookup;
  const recommendedLoft = Math.round((targetSpinLoft + aoaForLookup * 0.35) * 2) / 2;

  const recommendations = buildRecommendations(inputs, ref, smashFactor, cogHorizontal, cogVertical);
  const diagnosisText = buildDiagnosisText(inputs, ref, smashFactor);

  return {
    smashFactor,
    spinLoftDeg,
    dynLoftDeg,
    optimalLaunchDeg: ref.optimal_launch_deg,
    optimalSpinRpm:   ref.optimal_spin_rpm,
    launchMin:        ref.launch_min,
    launchMax:        ref.launch_max,
    spinMin:          ref.spin_min,
    spinMax:          ref.spin_max,
    launchDeltaDeg:   ref.launch_delta_deg,
    spinDeltaRpm:     ref.spin_delta_rpm,
    launchStatus:     ref.launch_status,
    spinStatus:       ref.spin_status,
    smashFactorStatus,
    diagnosisText,
    recommendations,
    cogVertical,
    cogHorizontal,
    recommendedLoft: Math.max(7, Math.min(16, recommendedLoft)),
    recommendedWeightSetting: cogHorizontal === 'heel-bias' ? 'draw' : cogHorizontal === 'toe-bias' ? 'fade' : 'neutral'
  };
}

function buildRecommendations(
  inputs: FittingInputs,
  ref: ReturnType<typeof analyse>,
  smashFactor: number,
  _cogH: 'neutral' | 'heel-bias' | 'toe-bias',
  cogV: 'low-back' | 'low-forward' | 'very-low'
): Recommendation[] {
  const recs: Recommendation[] = [];
  const heelWeightActive = inputs.weightSetting === 'heel' || inputs.weightSetting === 'draw';

  // ── Trefferzone ────────────────────────────────────────────────────────────

  if (inputs.impactZone === 'sweetspot') {
    recs.push({
      priority: 'secondary',
      category: 'distance',
      title: 'Optimale Trefferzone',
      description: 'Treffer konsistent im Sweetspot – maximale Energieübertragung und minimaler Spin-Verlust durch Gear Effect. Kein Handlungsbedarf, aktuelle Setup-Position beibehalten.',
      icon: '✅'
    });
  }

  if (inputs.impactZone === 'hoch-mitte') {
    recs.push({
      priority: 'secondary',
      category: 'launch',
      title: 'Vertikaler Gear Effect – positiver Befund',
      description: 'Treffer im oberen Flächenbereich aktivieren den vertikalen Gear Effect: Die Schlagfläche kippt nach hinten (toe-up), was zu höherem Launch und spürbar weniger Backspin führt. Dieser Effekt ist erwünscht und distanzfördernd. Tee-Höhe unbedingt beibehalten.',
      icon: '⬆️'
    });
  }

  if (inputs.impactZone === 'tief') {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Tief-Treffer – Tee höher, AoA verbessern',
      description: `Treffer im unteren Flächenbereich erzeugen durch den vertikalen Gear Effect weniger Launch und deutlich mehr Backspin (aktuell ${inputs.backspinRpm} RPM). Maßnahmen: Tee um ca. 5–10 mm höher stellen, Ball eine Ballbreite weiter vorne in der Stance positionieren, um einen positiven AoA zu fördern. Ausrüstung: Driver mit sehr tiefem CoG (Very-Low-CG) kompensiert diesen Effekt konstruktiv.`,
      icon: '⬇️'
    });
  }

  if (inputs.impactZone === 'heel') {
    // Gear Effect Overlay: Heel-Setting verstärkt den Hook-Effekt
    if (heelWeightActive) {
      recs.push({
        priority: 'primary',
        category: 'direction',
        title: '⚠️ Gear Effect Overlay – verstärkter Hook',
        description: `Heel-Treffer erzeugen durch den horizontalen Gear Effect bereits Draw/Hook-Spin (Fläche dreht toe-up). Die aktuelle Gewichtseinstellung "${inputs.weightSetting}" verschiebt den Schwerpunkt zusätzlich zur Ferse – beide Effekte addieren sich zu einem deutlich verstärkten Hook. Dringend empfohlen: Gewicht auf "Neutral" oder "Fade" stellen und Standposition korrigieren.`,
        icon: '⚠️'
      });
    } else {
      recs.push({
        priority: 'primary',
        category: 'direction',
        title: 'Heel-Treffer – Draw/Hook durch Gear Effect',
        description: 'Beim Heel-Treffer dreht sich die Schlagfläche im Moment des Auftreffens toe-up (horizontaler Gear Effect). Das erzeugt einen Draw- bis Hook-Drall auf den Ball. Empfehlung: Standposition prüfen (Ball ggf. zu nah am Körper), Draw-Bias-Driver oder Heel-Gewicht kompensiert – bewusst einsetzen, da die Richtung bereits nach links tendiert.',
        icon: '⬅️'
      });
    }
  }

  if (inputs.impactZone === 'toe') {
    // Gear Effect Overlay: Heel-Setting hebt sich mit Toe-Treffer auf
    if (heelWeightActive) {
      recs.push({
        priority: 'secondary',
        category: 'direction',
        title: 'Gear Effect Overlay – Effekte heben sich auf',
        description: `Toe-Treffer erzeugen normalerweise Fade/Slice-Spin durch den Gear Effect (Fläche dreht heel-up). Die aktuelle Gewichtseinstellung "${inputs.weightSetting}" wirkt diesem Effekt entgegen – die Einflüsse neutralisieren sich weitgehend. Das Ergebnis ist zufällig gerade, keine stabile Lösung. Empfehlung: Trefferzone in die Mitte korrigieren (Abstand zum Ball prüfen).`,
        icon: 'ℹ️'
      });
    } else {
      recs.push({
        priority: 'primary',
        category: 'direction',
        title: 'Toe-Treffer – Fade/Slice durch Gear Effect',
        description: 'Beim Toe-Treffer dreht sich die Schlagfläche heel-up (horizontaler Gear Effect) und erzeugt Fade- bis Slice-Spin. Empfehlung: Abstand zum Ball und Schlägerlänge prüfen. Ausrüstung: Neutrale oder Forward-CoG-Einstellung statt Draw-Bias. Fade-Gewichtseinstellung kann den Effekt weiter verstärken – vermeiden.',
        icon: '➡️'
      });
    }
  }

  // ── Spin-Achse ─────────────────────────────────────────────────────────────

  if (inputs.spinAxisDeg > 8) {
    recs.push({
      priority: 'primary',
      category: 'direction',
      title: 'Starke Slice-Tendenz',
      description: `Spin-Achse von +${inputs.spinAxisDeg}° zeigt eine ausgeprägte Slice-Rotation. Ausrüstung: Draw-Bias-Driver oder Gewicht auf der Heel-Seite (CoG verschiebt sich zur Ferse, öffnet die Fläche weniger). Schwungtechnik: In-to-Out-Schwungbahn trainieren, Griffhaltung verstärken (neutraler bis leicht starker Griff).`,
      icon: '🔄'
    });
  } else if (inputs.spinAxisDeg < -8) {
    recs.push({
      priority: 'primary',
      category: 'direction',
      title: 'Starke Hook-Tendenz',
      description: `Spin-Achse von ${inputs.spinAxisDeg}° zeigt eine ausgeprägte Hook-Rotation. Ausrüstung: Fade-Gewichtseinstellung oder Forward-CoG-Driver (weniger Draw-Bias). Alternativ: Toe-Gewicht reduziert den Gear-Effect-Draw. Schwungtechnik: Out-to-In-Schwungbahn und schwächeren Griff prüfen.`,
      icon: '🔄'
    });
  }

  // ── Angle of Attack ────────────────────────────────────────────────────────

  if (inputs.aoaDeg < -2) {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Angle of Attack zu steil',
      description: `AoA von ${inputs.aoaDeg}° bedeutet einen sehr steilen Abwärtstreffer. Das kostet Launch und erhöht den Spin. Maßnahmen: Tee höher stellen (ca. 5 mm), Ball eine Ballbreite weiter vorne in der Stance (linke Ferse), Hüfte bewusst früher öffnen. Ziel: AoA zwischen −1° und +2°.`,
      icon: '📐'
    });
  }

  // ── Spin (hoch / niedrig) ──────────────────────────────────────────────────

  if (ref.spin_status === 'high') {
    recs.push({
      priority: 'primary',
      category: 'spin',
      title: 'Backspin zu hoch – Distanzverlust',
      description: `Backspin von ${inputs.backspinRpm} RPM liegt ${ref.spin_delta_rpm} RPM über dem Zielwert (${ref.optimal_spin_rpm} RPM). Zu viel Spin kostet Distanz durch erhöhten Luftwiderstand und Ballonflug. Ausrüstung: Driver mit Forward-CoG (LS-Kopf), Loft um 0,5–1° reduzieren. Schaftoptimierung: niedrigerer Kick-Point verringert Spin.`,
      icon: '🔻'
    });
  }

  if (ref.spin_status === 'low') {
    recs.push({
      priority: 'primary',
      category: 'spin',
      title: 'Backspin zu niedrig – Flugbahn instabil',
      description: `Backspin von ${inputs.backspinRpm} RPM liegt ${Math.abs(ref.spin_delta_rpm)} RPM unter dem Zielwert (${ref.optimal_spin_rpm} RPM). Zu wenig Spin führt zu einer instabilen Flugbahn ("knuckle ball") und frühem Abfallen. Ausrüstung: Driver mit Back-CoG, Loft um 0,5–1° erhöhen. Tee leicht höher setzen.`,
      icon: '🔺'
    });
  }

  // ── Launch (hoch / niedrig) ────────────────────────────────────────────────

  if (ref.launch_status === 'low') {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Abflugwinkel zu niedrig',
      description: `Launch von ${inputs.launchAngleDeg}° liegt ${Math.abs(ref.launch_delta_deg)}° unter dem Zielwert (${ref.optimal_launch_deg}°). Der Ball startet zu flach und landet mit zu viel Restgeschwindigkeit – Carry-Distanz geht verloren. Loft erhöhen, Tee höher setzen, AoA verbessern. Back-CoG-Driver unterstützt höheren Launch.`,
      icon: '↗️'
    });
  }

  if (ref.launch_status === 'high') {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Abflugwinkel zu hoch',
      description: `Launch von ${inputs.launchAngleDeg}° liegt ${Math.abs(ref.launch_delta_deg)}° über dem Zielwert (${ref.optimal_launch_deg}°). Der Ball steigt zu steil und verliert Windresistenz sowie Roll-Distanz. Loft reduzieren, Forward-CoG-Driver für flacheres Abflugprofil prüfen.`,
      icon: '↘️'
    });
  }

  // ── Smash Factor ───────────────────────────────────────────────────────────

  if (smashFactor < 1.44) {
    recs.push({
      priority: 'primary',
      category: 'distance',
      title: 'Smash Factor – Trefferpunkt optimieren',
      description: `Smash Factor von ${smashFactor} (Ziel: ≥ 1.48) zeigt deutliche Energieverluste durch Off-Center-Kontakt. Jeder Zentimeter vom Sweetspot entfernt kostet Ballgeschwindigkeit. Empfehlung: Konsistenz des Treffpunkts trainieren (Klebeband-Test). High-MOI-Driver reduziert die Strafe bei Fehltreffen konstruktiv.`,
      icon: '🎯'
    });
  } else if (smashFactor >= 1.44 && smashFactor < 1.48) {
    recs.push({
      priority: 'secondary',
      category: 'distance',
      title: 'Smash Factor – leicht verbesserungsfähig',
      description: `Smash Factor von ${smashFactor} ist solide, aber noch nicht optimal (Ziel: ≥ 1.48). Geringfügige Trefferpunktverbesserung würde ca. ${Math.round((1.48 - smashFactor) * inputs.clubSpeedMph)} mph Ballgeschwindigkeit freisetzen.`,
      icon: '🎯'
    });
  }

  // ── CoG-Empfehlung ─────────────────────────────────────────────────────────

  if (cogV === 'low-forward') {
    recs.push({
      priority: 'secondary',
      category: 'equipment',
      title: 'Low-Forward-CoG Driver empfohlen',
      description: 'Ein Driver mit nach vorne versetztem Schwerpunkt (LS-Modelle wie Qi10 LS, G440 LST, TSR4) senkt den Spin konstruktiv und erzeugt ein penetranteres, windstabiles Flugebild – ideal für schnelle Schläger mit zu viel Spin.',
      icon: '🏌️'
    });
  } else if (cogV === 'very-low') {
    recs.push({
      priority: 'secondary',
      category: 'equipment',
      title: 'Very-Low-CoG Driver empfohlen',
      description: 'Ein Driver mit maximal tiefem Schwerpunkt (z.B. Cobra Darkspeed, Callaway Paradym X) erhöht Launch und MOI gleichzeitig – optimal bei Tief-Treffern oder zu niedrigem Spin.',
      icon: '🏌️'
    });
  } else {
    recs.push({
      priority: 'secondary',
      category: 'equipment',
      title: 'Low-Back-CoG Driver empfohlen',
      description: 'Ein Driver mit nach hinten versetztem Schwerpunkt (Max-Modelle wie Qi10, G440 Max) maximiert MOI, fördert höheren Launch und ist fehlerverzeihender bei Off-Center-Treffern – ideal für dieses Spielerprofil.',
      icon: '🏌️'
    });
  }

  // ── Kundenziele ────────────────────────────────────────────────────────────

  if (inputs.customerGoals.includes('distance') && smashFactor >= 1.48 && ref.spin_status === 'optimal' && ref.launch_status === 'optimal') {
    recs.push({
      priority: 'secondary',
      category: 'distance',
      title: 'Distanz-Parameter optimal',
      description: 'Launch, Spin und Smash Factor liegen alle im optimalen Bereich. Das aktuelle Setup ist für maximale Distanz optimal konfiguriert. Weitere Gains nur noch durch Schaftoptimierung (Gewicht, Flex, Profil) oder Technikverbesserung erreichbar.',
      icon: '✅'
    });
  }

  if (inputs.customerGoals.includes('shotshaping')) {
    recs.push({
      priority: 'secondary',
      category: 'equipment',
      title: 'Shot-Shaping: Verstellbarer Driver',
      description: 'Für Shot-Shaping: Driver mit verstellbarem Gewichtssystem (Draw/Fade-Position) und einstellbarem Hosel (±1° Loft/Lie) ermöglicht gezielte Ballfluganpassung je nach Platzsituation. Empfehlung: TaylorMade Qi10, Titleist TSR3 oder Ping G440 Max.',
      icon: '🎨'
    });
  }

  if (inputs.customerGoals.includes('trajectory')) {
    recs.push({
      priority: 'secondary',
      category: 'launch',
      title: 'Flughöhe: Hosel-Einstellung nutzen',
      description: 'Für mehr Kontrolle über die Flughöhe: Hosel-Einstellung "+" erhöht effektives Loft um 0,5–1° (höherer Launch), "-" senkt es entsprechend. Diese Einstellung verändert auch die Lie-Winkel leicht – nach Anpassung Ballflug neu messen.',
      icon: '📏'
    });
  }

  return recs;
}

function buildDiagnosisText(
  inputs: FittingInputs,
  ref: ReturnType<typeof analyse>,
  smashFactor: number
): string {
  const name = inputs.customerName || 'Der Spieler';
  const parts: string[] = [];

  // 1. Geschwindigkeitsprofil
  const sfQuality = smashFactor >= 1.48 ? 'sehr effizienter' : smashFactor >= 1.44 ? 'solider' : 'unterdurchschnittlicher';
  parts.push(
    `${name} schwingt mit ${inputs.clubSpeedMph} mph und erzeugt ${inputs.ballSpeedMph} mph Ballgeschwindigkeit – ${sfQuality} Smash Factor von ${smashFactor}.`
  );

  // 2. AoA-Kontext
  const aoaDesc = inputs.aoaDeg > 0
    ? `ein positiver AoA von +${inputs.aoaDeg}° (aufwärts)`
    : inputs.aoaDeg === 0
      ? 'ein neutraler AoA von 0°'
      : `ein negativer AoA von ${inputs.aoaDeg}° (abwärts)`;
  parts.push(`Der Anstellwinkel beträgt ${aoaDesc}.`);

  // 3. Launch
  const launchSign = ref.launch_delta_deg > 0 ? '+' : '';
  const launchDesc = ref.launch_status === 'optimal'
    ? `Der Abflugwinkel von ${inputs.launchAngleDeg}° ist optimal (Ziel: ${ref.optimal_launch_deg}°).`
    : ref.launch_status === 'low'
      ? `Der Abflugwinkel von ${inputs.launchAngleDeg}° ist ${Math.abs(ref.launch_delta_deg)}° zu niedrig (Ziel: ${ref.optimal_launch_deg}°).`
      : `Der Abflugwinkel von ${inputs.launchAngleDeg}° ist ${Math.abs(ref.launch_delta_deg)}° zu hoch (Ziel: ${ref.optimal_launch_deg}°, Δ ${launchSign}${ref.launch_delta_deg}°).`;
  parts.push(launchDesc);

  // 4. Spin
  const spinSign = ref.spin_delta_rpm > 0 ? '+' : '';
  const spinDesc = ref.spin_status === 'optimal'
    ? `Der Backspin von ${inputs.backspinRpm} RPM liegt im Zielbereich (${ref.spin_min}–${ref.spin_max} RPM).`
    : ref.spin_status === 'low'
      ? `Der Backspin von ${inputs.backspinRpm} RPM ist zu niedrig – ${Math.abs(ref.spin_delta_rpm)} RPM unter dem Ziel (${ref.optimal_spin_rpm} RPM).`
      : `Der Backspin von ${inputs.backspinRpm} RPM ist zu hoch – ${spinSign}${ref.spin_delta_rpm} RPM über dem Ziel (${ref.optimal_spin_rpm} RPM).`;
  parts.push(spinDesc);

  // 5. Spin-Achse
  if (inputs.spinAxisDeg > 8) {
    parts.push(`Die Spin-Achse von +${inputs.spinAxisDeg}° zeigt eine starke Slice-Rotation – erhebliche Richtungsabweichung nach rechts.`);
  } else if (inputs.spinAxisDeg > 3) {
    parts.push(`Die Spin-Achse von +${inputs.spinAxisDeg}° deutet auf eine leichte Fade/Slice-Tendenz hin.`);
  } else if (inputs.spinAxisDeg < -8) {
    parts.push(`Die Spin-Achse von ${inputs.spinAxisDeg}° zeigt eine starke Hook-Rotation – erhebliche Richtungsabweichung nach links.`);
  } else if (inputs.spinAxisDeg < -3) {
    parts.push(`Die Spin-Achse von ${inputs.spinAxisDeg}° deutet auf eine leichte Draw/Hook-Tendenz hin.`);
  } else {
    parts.push('Die Spin-Achse ist nahezu gerade – gutes Richtungsverhalten.');
  }

  // 6. Trefferzone + Gear-Effect-Erklärung
  const zoneEffects: Record<string, string> = {
    sweetspot:    'Treffer im Sweetspot – optimale Energieübertragung, kein nennenswerter Gear Effect.',
    'hoch-mitte': 'Treffer im oberen Bereich aktivieren den vertikalen Gear Effect positiv: mehr Launch, weniger Spin.',
    tief:         'Treffer im unteren Bereich kehren den vertikalen Gear Effect um: weniger Launch, mehr Spin.',
    heel:         'Heel-Treffer erzeugen durch den horizontalen Gear Effect Draw/Hook-Spin (Fläche dreht toe-up).',
    toe:          'Toe-Treffer erzeugen durch den horizontalen Gear Effect Fade/Slice-Spin (Fläche dreht heel-up).',
  };
  parts.push(zoneEffects[inputs.impactZone]);

  // 7. Gear-Effect-Overlay-Warnung
  const heelWeightActive = inputs.weightSetting === 'heel' || inputs.weightSetting === 'draw';
  if (heelWeightActive && inputs.impactZone === 'heel') {
    parts.push('Achtung: Die Heel-Gewichtseinstellung verstärkt den Gear-Effect-Hook – beide Effekte addieren sich.');
  } else if (heelWeightActive && inputs.impactZone === 'toe') {
    parts.push('Hinweis: Die Heel-Gewichtseinstellung neutralisiert den Gear-Effect-Fade vom Toe-Treffer – zufällig gerade, keine stabile Lösung.');
  }

  return parts.join(' ');
}
