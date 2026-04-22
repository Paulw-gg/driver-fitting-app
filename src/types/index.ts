export type ImpactZone = 'sweetspot' | 'hoch-mitte' | 'tief' | 'heel' | 'toe';
export type WeightSetting = 'heel' | 'neutral' | 'toe' | 'draw' | 'fade' | 'front' | 'back';
export type MonitorType = 'radar' | 'camera';
export type LaunchStatus = 'optimal' | 'low' | 'high';
export type CustomerGoal = 'distance' | 'direction' | 'shotshaping' | 'trajectory';
export type SwingTempo = 'slow' | 'medium' | 'fast';
export type PlayerProfile = 'tech-optimizer' | 'equipment-maxer';

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
  clubPathDeg: number | null;
  faceAngleDeg: number | null;
  playerProfile: PlayerProfile;
}

export interface DPlaneAnalysis {
  // Eingaben
  clubPathDeg: number;
  faceAngleDeg: number;
  spinAxisDeg: number;
  impactZone: ImpactZone;

  // Berechnungen
  faceToPath: number;
  startDirection: number;
  gearEffectOffset: number;
  spinAxisFromDPlane: number;
  spinAxisDelta: number;

  // Diagnose
  pathCategory: 'stark-out-to-in' | 'leicht-out-to-in' | 'neutral' | 'leicht-in-to-out' | 'stark-in-to-out';
  faceCategory: 'stark-offen' | 'leicht-offen' | 'square' | 'leicht-geschlossen' | 'stark-geschlossen';
  primaryCause: 'face' | 'path' | 'geareffect' | 'kombiniert';
  flightShape: 'pull-hook' | 'hook' | 'draw' | 'straight' | 'fade' | 'slice' | 'push-slice' | 'push';

  // Verbesserungspotenzial
  pathCorrectionNeeded: number;
  faceCorrectionNeeded: number;
}

export interface EquipmentRec {
  priority: 'primary' | 'secondary';
  category: 'cog' | 'loft' | 'weight' | 'shaft' | 'face-angle' | 'moi';
  title: string;
  description: string;
  profileRelevance: 'both' | 'tech-optimizer' | 'equipment-maxer';
}

export interface TechniqueRec {
  priority: 'primary' | 'secondary';
  title: string;
  description: string;
  targetValue: string;
  currentValue: string;
  improvementDeg: number;
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
  recommendations: EquipmentRec[];
  equipmentRecommendations: EquipmentRec[];
  techniqueRecommendations: TechniqueRec[];
  cogVertical: 'low-back' | 'low-forward' | 'very-low';
  cogHorizontal: 'neutral' | 'heel-bias' | 'toe-bias';
  recommendedLoft: number;
  recommendedWeightSetting: WeightSetting;
  dPlane: DPlaneAnalysis | null;
  playerProfile: PlayerProfile;
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
  rank: number;
  score: number;
}
