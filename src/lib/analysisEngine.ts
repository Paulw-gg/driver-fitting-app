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

  // Spin zu hoch
  if (ref.spin_status === 'high') {
    recs.push({
      priority: 'primary',
      category: 'spin',
      title: 'Spin reduzieren',
      description: `Spin ist ${Math.abs(ref.spin_delta_rpm)} RPM über dem Zielbereich. Empfehlung: Driver mit forward-CoG (Low-Spin-Kopf), Loft reduzieren um 0,5–1°, Shaft mit weniger Kick-Point prüfen.`,
      icon: '🔻'
    });
  }

  // Spin zu niedrig
  if (ref.spin_status === 'low') {
    recs.push({
      priority: 'primary',
      category: 'spin',
      title: 'Spin erhöhen',
      description: `Spin ist ${Math.abs(ref.spin_delta_rpm)} RPM unter dem Zielbereich. Empfehlung: Loft um 0,5–1° erhöhen, Driver mit back-CoG wählen, Tee leicht höher setzen.`,
      icon: '🔺'
    });
  }

  // Launch zu niedrig
  if (ref.launch_status === 'low') {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Abflugwinkel erhöhen',
      description: `Abflugwinkel ist ${Math.abs(ref.launch_delta_deg)}° zu niedrig. Loft erhöhen, Tee höher setzen (positiver AoA), Back-CoG-Driver fördert höheren Launch.`,
      icon: '↗️'
    });
  }

  // Launch zu hoch
  if (ref.launch_status === 'high') {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Abflugwinkel senken',
      description: `Abflugwinkel ist ${Math.abs(ref.launch_delta_deg)}° zu hoch. Loft reduzieren, Forward-CoG-Driver für flacheres Abflugverhalten prüfen.`,
      icon: '↘️'
    });
  }

  // AoA zu steil negativ
  if (inputs.aoaDeg < -2) {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Angle of Attack verbessern',
      description: `AoA von ${inputs.aoaDeg}° ist zu steil von oben. Tee höher setzen, Ball weiter vorne in der Stance positionieren, um flacher oder leicht positiv zu treffen.`,
      icon: '⛳'
    });
  }

  // Smash Factor
  if (smashFactor < 1.44) {
    recs.push({
      priority: 'primary',
      category: 'distance',
      title: 'Trefferpunkt optimieren',
      description: `Smash Factor von ${smashFactor} deutet auf Off-Center-Treffer hin. Treffer systematisch mittig trainieren. High-MOI-Driver reduziert Distanzverlust bei Fehltrefffern.`,
      icon: '🎯'
    });
  }

  // Trefferzone Heel
  if (inputs.impactZone === 'heel') {
    recs.push({
      priority: 'primary',
      category: 'direction',
      title: 'Heel-Treffer korrigieren',
      description: 'Heel-Treffer erzeugen Slice-Spin durch Gear Effect. Draw-Bias-Driver oder Gewicht auf Heel-Seite verringert diesen Effekt. Standposition und Schwungbahn prüfen.',
      icon: '⬅️'
    });
  }

  // Trefferzone Toe
  if (inputs.impactZone === 'toe') {
    recs.push({
      priority: 'primary',
      category: 'direction',
      title: 'Toe-Treffer korrigieren',
      description: 'Toe-Treffer erzeugen Hook-Spin durch Gear Effect. Neutrale Gewichtsposition oder forward-CoG verhindert übermäßigen Draw. Standposition und Schlägerlänge prüfen.',
      icon: '➡️'
    });
  }

  // Trefferzone hoch-mitte (positiv!)
  if (inputs.impactZone === 'hoch-mitte') {
    recs.push({
      priority: 'secondary',
      category: 'launch',
      title: 'Hohes Sweetspot-Treffen – Vorteil',
      description: 'Treffer im oberen Bereich der Schlagfläche erzeugen durch den vertikalen Gear Effect höheren Launch und weniger Spin – ideal für mehr Distanz. Tee-Höhe beibehalten.',
      icon: '⬆️'
    });
  }

  // Trefferzone tief
  if (inputs.impactZone === 'tief') {
    recs.push({
      priority: 'primary',
      category: 'launch',
      title: 'Tief-Treffer korrigieren',
      description: 'Treffer im unteren Bereich erzeugen weniger Launch und mehr Spin. Tee höher stellen, Ball weiter vorne in der Stance. Driver mit tiefem CoG (very-low) empfohlen.',
      icon: '⬇️'
    });
  }

  // Starker Slice
  if (inputs.spinAxisDeg > 8) {
    recs.push({
      priority: 'primary',
      category: 'direction',
      title: 'Slice-Tendenz reduzieren',
      description: `Spin-Achse von +${inputs.spinAxisDeg}° zeigt starken Slice. Draw-Bias-Driver oder Gewicht auf Heel-Seite empfohlen. Griffhaltung und In-to-Out-Schwungbahn trainieren.`,
      icon: '🔄'
    });
  }

  // Starker Hook
  if (inputs.spinAxisDeg < -8) {
    recs.push({
      priority: 'primary',
      category: 'direction',
      title: 'Hook-Tendenz reduzieren',
      description: `Spin-Achse von ${inputs.spinAxisDeg}° zeigt starken Hook. Neutrale oder Fade-Gewichtseinstellung, forward-CoG für weniger Draw-Bias. Out-to-In-Schwungbahn prüfen.`,
      icon: '🔄'
    });
  }

  // CoG Empfehlung als Ausrüstungshinweis
  if (cogV === 'low-forward') {
    recs.push({
      priority: 'secondary',
      category: 'equipment',
      title: 'Low-Forward-CoG Driver empfohlen',
      description: 'Ein Driver mit forward-platziertem Schwerpunkt (LS-Modelle) reduziert Spin und fördert flacheres, penetranteres Ballflugebild – ideal für schnelle Schläger.',
      icon: '🏌️'
    });
  } else if (cogV === 'low-back') {
    recs.push({
      priority: 'secondary',
      category: 'equipment',
      title: 'Low-Back-CoG Driver empfohlen',
      description: 'Ein Driver mit nach hinten versetztem Schwerpunkt erhöht MOI, fördert höheren Launch und ist fehlerverzeihender bei Off-Center-Treffern.',
      icon: '🏌️'
    });
  }

  // Kundenziele
  if (inputs.customerGoals.includes('distance') && smashFactor >= 1.48 && ref.spin_status === 'optimal' && ref.launch_status === 'optimal') {
    recs.push({
      priority: 'secondary',
      category: 'distance',
      title: 'Optimale Distanzparameter erreicht',
      description: 'Launch, Spin und Smash Factor liegen im optimalen Bereich. Weitere Distanzgewinne durch Schaftoptimierung (Gewicht, Flex, Profil) möglich.',
      icon: '✅'
    });
  }

  if (inputs.customerGoals.includes('shotshaping')) {
    recs.push({
      priority: 'secondary',
      category: 'equipment',
      title: 'Shot-Shaping: Verstellbarer Driver',
      description: 'Für Shot-Shaping-Ambitionen: Driver mit verstellbarem Gewicht (Draw/Fade-Einstellung) und einstellbarem Hosel für maximale Anpassbarkeit empfohlen.',
      icon: '🎨'
    });
  }

  return recs;
}

function buildDiagnosisText(
  inputs: FittingInputs,
  ref: ReturnType<typeof analyse>,
  smashFactor: number
): string {
  const parts: string[] = [];

  parts.push(`${inputs.customerName} trifft den Driver mit ${inputs.clubSpeedMph} mph Schlägerkopfgeschwindigkeit und erzeugt ${inputs.ballSpeedMph} mph Ballgeschwindigkeit (Smash Factor: ${smashFactor}).`);

  const launchDesc = ref.launch_status === 'optimal'
    ? `Der Abflugwinkel von ${inputs.launchAngleDeg}° liegt im optimalen Bereich (Ziel: ${ref.optimal_launch_deg}°)`
    : ref.launch_status === 'low'
      ? `Der Abflugwinkel von ${inputs.launchAngleDeg}° ist zu niedrig (Ziel: ${ref.optimal_launch_deg}°, Δ ${ref.launch_delta_deg}°)`
      : `Der Abflugwinkel von ${inputs.launchAngleDeg}° ist zu hoch (Ziel: ${ref.optimal_launch_deg}°, Δ +${ref.launch_delta_deg}°)`;
  parts.push(launchDesc + '.');

  const spinDesc = ref.spin_status === 'optimal'
    ? `Der Backspin von ${inputs.backspinRpm} RPM liegt im optimalen Bereich (Ziel: ${ref.optimal_spin_rpm} RPM)`
    : ref.spin_status === 'low'
      ? `Der Backspin von ${inputs.backspinRpm} RPM ist zu niedrig (Ziel: ${ref.optimal_spin_rpm} RPM, Δ ${ref.spin_delta_rpm} RPM)`
      : `Der Backspin von ${inputs.backspinRpm} RPM ist zu hoch (Ziel: ${ref.optimal_spin_rpm} RPM, +${ref.spin_delta_rpm} RPM)`;
  parts.push(spinDesc + '.');

  if (inputs.spinAxisDeg > 5) {
    parts.push(`Die Spin-Achse von +${inputs.spinAxisDeg}° deutet auf eine Fade/Slice-Tendenz hin.`);
  } else if (inputs.spinAxisDeg < -5) {
    parts.push(`Die Spin-Achse von ${inputs.spinAxisDeg}° deutet auf eine Draw/Hook-Tendenz hin.`);
  } else {
    parts.push('Die Spin-Achse ist weitgehend gerade – gutes Richtungsverhalten.');
  }

  const zoneLabels: Record<string, string> = {
    sweetspot: 'im Sweetspot', 'hoch-mitte': 'im oberen Mittelbereich', tief: 'im unteren Bereich',
    heel: 'an der Ferse', toe: 'an der Spitze'
  };
  parts.push(`Trefferzone: ${zoneLabels[inputs.impactZone] ?? inputs.impactZone}.`);

  return parts.join(' ');
}
