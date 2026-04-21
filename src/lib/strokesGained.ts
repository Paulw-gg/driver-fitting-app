type Lie = 'fairway' | 'rough' | 'ob';
type HcpLevel = 0 | 5 | 10 | 15 | 25;

const HCP_FACTOR: Record<HcpLevel, number> = {
   0: 1.00,
   5: 1.08,
  10: 1.16,
  15: 1.26,
  25: 1.42
};

const FAIRWAY_HALF_WIDTH = 14;
const OB_DISTANCE = 45;

function expectedStrokes(distanceM: number, lie: Lie, hcp: HcpLevel): number {
  const base = lie === 'fairway' ? 1.8 + (distanceM / 100) * 0.72
             : lie === 'rough'   ? 1.95 + (distanceM / 100) * 0.78
             :                     2.0 + (distanceM / 100) * 0.72 + 2.0;
  return base * HCP_FACTOR[hcp];
}

function normCDF(x: number, mu: number, sigma: number): number {
  const z = (x - mu) / (sigma * Math.SQRT2);
  const t = 1 / (1 + 0.3275911 * Math.abs(z));
  const erf = 1 - (0.254829592*t - 0.284496736*(t**2) + 1.421413741*(t**3)
                  - 1.453152027*(t**4) + 1.061405429*(t**5)) * Math.exp(-(z**2));
  return 0.5 * (1 + (z >= 0 ? erf : -erf));
}

function lieProbabilities(deviationM: number) {
  const sigma = Math.max(0.5, deviationM);
  const pFW = normCDF(FAIRWAY_HALF_WIDTH, 0, sigma) - normCDF(-FAIRWAY_HALF_WIDTH, 0, sigma);
  const pOB = 1 - normCDF(OB_DISTANCE, 0, sigma) + normCDF(-OB_DISTANCE, 0, sigma);
  return {
    fairway: Math.max(0, pFW),
    rough:   Math.max(0, 1 - pFW - pOB),
    ob:      Math.max(0, pOB)
  };
}

export interface SGSetup {
  carryDistanceM: number;
  deviationM: number;
  holeLengthM: number;
  hcp: HcpLevel;
}

export interface SGResult {
  sg: number;
  expectedEnd: number;
  restDistanceM: number;
  probFairway: number;
  probRough: number;
  probOB: number;
  baselineTee: number;
}

export function computeSG(setup: SGSetup): SGResult {
  const rest = Math.max(10, setup.holeLengthM - setup.carryDistanceM);
  const probs = lieProbabilities(setup.deviationM);
  const esFW = expectedStrokes(rest, 'fairway', setup.hcp);
  const esR  = expectedStrokes(rest, 'rough',   setup.hcp);
  const esOB = expectedStrokes(rest, 'ob',      setup.hcp);
  const expectedEnd = probs.fairway * esFW + probs.rough * esR + probs.ob * esOB;
  const baselineTee = expectedStrokes(setup.holeLengthM, 'fairway', setup.hcp);
  return {
    sg:            Math.round((baselineTee - expectedEnd - 1) * 1000) / 1000,
    expectedEnd:   Math.round(expectedEnd * 100) / 100,
    restDistanceM: Math.round(rest),
    probFairway:   probs.fairway,
    probRough:     probs.rough,
    probOB:        probs.ob,
    baselineTee
  };
}

export type { HcpLevel };
