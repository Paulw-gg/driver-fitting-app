import type { AnalysisResult, DriverProduct, CustomerGoal, RankedProduct } from '../types';

// Hard filter: product must not contradict the required CoG / spin profile.
function passesHardFilter(p: DriverProduct, analysis: AnalysisResult): boolean {
  // CoG vertical
  if (analysis.cogVertical === 'low-forward' && p.cogType !== 'low-forward') return false;
  if (analysis.cogVertical === 'very-low' && p.moiRating === 'average') return false;
  // CoG horizontal
  if (analysis.cogHorizontal === 'heel-bias' && !p.drawBias && !p.weightAdjustable) return false;
  if (analysis.cogHorizontal === 'toe-bias' && p.drawBias) return false;
  // Spin
  if (analysis.spinStatus === 'high' && !p.lowSpin && p.cogType !== 'low-forward') return false;
  return true;
}

// Soft score: higher = better fit. Weights are additive.
function score(p: DriverProduct, analysis: AnalysisResult, goals: CustomerGoal[]): number {
  let s = 0;

  // CoG vertical exact match
  if (analysis.cogVertical === 'low-forward' && p.cogType === 'low-forward') s += 30;
  if (analysis.cogVertical === 'very-low'    && p.highMoi)                   s += 20;
  if (analysis.cogVertical === 'low-back'    && p.cogType === 'low-back')    s += 20;

  // Spin correction
  if (analysis.spinStatus === 'high' && p.lowSpin)  s += 25;
  if (analysis.spinStatus === 'low'  && p.highMoi)  s += 15;

  // CoG horizontal match
  if (analysis.cogHorizontal === 'heel-bias' && p.drawBias)          s += 20;
  if (analysis.cogHorizontal === 'heel-bias' && p.weightAdjustable)  s += 10;
  if (analysis.cogHorizontal === 'toe-bias'  && p.weightAdjustable)  s += 10;
  if (analysis.cogHorizontal === 'neutral'   && !p.drawBias)         s += 5;

  // MOI rating
  if (p.moiRating === 'high')          s += 10;
  if (p.moiRating === 'above-average') s += 5;

  // Weight adjustability bonus (always useful)
  if (p.weightAdjustable) s += 5;

  // Goal alignment
  if (goals.includes('distance')    && p.highMoi)           s += 10;
  if (goals.includes('distance')    && p.lowSpin && analysis.spinStatus === 'high') s += 8;
  if (goals.includes('direction')   && p.drawBias && analysis.cogHorizontal === 'heel-bias') s += 15;
  if (goals.includes('shotshaping') && p.weightAdjustable)  s += 12;
  if (goals.includes('trajectory')  && p.weightAdjustable)  s += 8;

  return s;
}

export function recommendProducts(
  analysis: AnalysisResult,
  goals: CustomerGoal[],
  availableProducts: DriverProduct[]
): RankedProduct[] {
  return availableProducts
    .filter(p => p.availableInShop)
    .filter(p => passesHardFilter(p, analysis))
    .map(p => ({ ...p, score: score(p, analysis, goals), rank: 0 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((p, i) => ({ ...p, rank: i + 1 }));
}

export const FALLBACK_PRODUCTS: DriverProduct[] = [
  { id: '1', brand: 'TaylorMade', model: 'Qi10',      loftOptions: ['9','10.5','12'],   cogType: 'low-back',    drawBias: false, lowSpin: false, highMoi: true,  weightAdjustable: true,  weightOptions: ['heel','neutral','toe'], moiRating: 'high',          availableInShop: true },
  { id: '2', brand: 'TaylorMade', model: 'Qi10 Max',  loftOptions: ['9','10.5','12'],   cogType: 'low-back',    drawBias: true,  lowSpin: false, highMoi: true,  weightAdjustable: true,  weightOptions: ['draw','neutral'],       moiRating: 'high',          availableInShop: true },
  { id: '3', brand: 'TaylorMade', model: 'Qi10 LS',   loftOptions: ['8','9','10.5'],    cogType: 'low-forward', drawBias: false, lowSpin: true,  highMoi: false, weightAdjustable: true,  weightOptions: ['front','back'],         moiRating: 'above-average', availableInShop: true },
  { id: '4', brand: 'Callaway',   model: 'Paradym',   loftOptions: ['9','10.5','12'],   cogType: 'low-back',    drawBias: false, lowSpin: false, highMoi: true,  weightAdjustable: true,  weightOptions: ['heel','neutral','toe'], moiRating: 'high',          availableInShop: true },
  { id: '5', brand: 'Callaway',   model: 'Paradym X', loftOptions: ['9','10.5','12'],   cogType: 'low-back',    drawBias: true,  lowSpin: false, highMoi: true,  weightAdjustable: false, weightOptions: [],                       moiRating: 'high',          availableInShop: true },
  { id: '6', brand: 'Ping',       model: 'G440 Max',  loftOptions: ['9','10.5','12'],   cogType: 'low-back',    drawBias: false, lowSpin: false, highMoi: true,  weightAdjustable: true,  weightOptions: ['draw','neutral','fade'],moiRating: 'high',          availableInShop: true },
  { id: '7', brand: 'Ping',       model: 'G440 LST',  loftOptions: ['9','10.5'],        cogType: 'low-forward', drawBias: false, lowSpin: true,  highMoi: false, weightAdjustable: true,  weightOptions: ['neutral','fade'],       moiRating: 'above-average', availableInShop: true },
  { id: '8', brand: 'Titleist',   model: 'TSR2',      loftOptions: ['8','9','10','11'], cogType: 'low-back',    drawBias: false, lowSpin: false, highMoi: true,  weightAdjustable: true,  weightOptions: ['neutral','draw'],       moiRating: 'high',          availableInShop: true },
  { id: '9', brand: 'Titleist',   model: 'TSR4',      loftOptions: ['8','9','10'],      cogType: 'low-forward', drawBias: false, lowSpin: true,  highMoi: false, weightAdjustable: true,  weightOptions: ['front','back'],         moiRating: 'average',       availableInShop: true },
];
