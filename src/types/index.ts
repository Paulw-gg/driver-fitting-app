export type ImpactZone = 'sweetspot' | 'hoch-mitte' | 'tief' | 'heel' | 'toe';
export type WeightSetting = 'heel' | 'neutral' | 'toe' | 'draw' | 'fade' | 'front' | 'back';
export type MonitorType = 'radar' | 'camera';
export type LaunchStatus = 'optimal' | 'low' | 'high';
export type CustomerGoal = 'distance' | 'direction' | 'shotshaping' | 'trajectory';
export type SwingTempo = 'slow' | 'medium' | 'fast';

export interface FittingInputs {
  customerName: string;
  handicap: number | null;
  fitterName: string;
  currentDriverModel: string;
  currentLoft: number;
  shaftWeightG: number;
  weightSetting: WeightSetting;
  hoselSetting: string;
  clubSpeedMph: number;
  ballSpeedMph: number;
  launchAngleDeg: number;
  aoaDeg: number;
  backspinRpm: number;
  spinAxisDeg: number;
  monitorType: MonitorType;
  impactZone: ImpactZone;
  customerGoals: CustomerGoal[];
  tempo: SwingTempo;
}

export interface AnalysisResult {
  smashFactor: number;
  spinLoftDeg: number;
  dynLoftDeg: number;
  optimalLaunchDeg: number;
  optimalSpinRpm: number;
  launchMin: number;
  launchMax: number;
  spinMin: number;
  spinMax: number;
  launchDeltaDeg: number;
  spinDeltaRpm: number;
  launchStatus: LaunchStatus;
  spinStatus: LaunchStatus;
  smashFactorStatus: LaunchStatus;
  diagnosisText: string;
  recommendations: Recommendation[];
  cogVertical: 'low-back' | 'low-forward' | 'very-low';
  cogHorizontal: 'neutral' | 'heel-bias' | 'toe-bias';
  recommendedLoft: number;
  recommendedWeightSetting: WeightSetting;
}

export interface Recommendation {
  priority: 'primary' | 'secondary';
  category: 'spin' | 'launch' | 'direction' | 'distance' | 'equipment';
  title: string;
  description: string;
  icon: string;
}

export interface DriverProduct {
  id: string;
  brand: string;
  model: string;
  loftOptions: string[];
  cogType: 'low-back' | 'low-forward' | 'adjustable';
  drawBias: boolean;
  lowSpin: boolean;
  highMoi: boolean;
  weightAdjustable: boolean;
  weightOptions: string[];
  moiRating: string;
  availableInShop: boolean;
  notes?: string;
}

export interface RankedProduct extends DriverProduct {
  rank: number;    // 1 = best match
  score: number;   // raw score for debugging / display
}
