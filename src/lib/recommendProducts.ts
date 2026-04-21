import type { AnalysisResult, DriverProduct, CustomerGoal } from '../types';

export function recommendProducts(
  analysis: AnalysisResult,
  goals: CustomerGoal[],
  availableProducts: DriverProduct[]
): DriverProduct[] {
  return availableProducts
    .filter(p => p.availableInShop)
    .filter(p => {
      if (analysis.cogVertical === 'low-forward' && p.cogType !== 'low-forward') return false;
      if (analysis.cogVertical === 'very-low' && p.moiRating === 'average') return false;
      if (analysis.cogHorizontal === 'heel-bias' && !p.drawBias && !p.weightAdjustable) return false;
      if (analysis.cogHorizontal === 'toe-bias' && p.drawBias) return false;
      if (analysis.spinStatus === 'high' && !p.lowSpin && p.cogType !== 'low-forward') return false;
      return true;
    })
    .sort((a, b) => {
      // Prioritize: goal-alignment, then lowSpin if needed, then highMoi
      let scoreA = 0, scoreB = 0;
      if (goals.includes('distance')) {
        if (a.highMoi) scoreA += 1;
        if (b.highMoi) scoreB += 1;
      }
      if (goals.includes('direction')) {
        if (a.drawBias && analysis.cogHorizontal === 'heel-bias') scoreA += 2;
        if (b.drawBias && analysis.cogHorizontal === 'heel-bias') scoreB += 2;
      }
      return scoreB - scoreA;
    })
    .slice(0, 4);
}

export const FALLBACK_PRODUCTS: DriverProduct[] = [
  { id: '1', brand: 'TaylorMade', model: 'Qi10', loftOptions: ['9','10.5','12'], cogType: 'low-back', drawBias: false, lowSpin: false, highMoi: true, weightAdjustable: true, weightOptions: ['heel','neutral','toe'], moiRating: 'high', availableInShop: true },
  { id: '2', brand: 'TaylorMade', model: 'Qi10 LS', loftOptions: ['8','9','10.5'], cogType: 'low-forward', drawBias: false, lowSpin: true, highMoi: false, weightAdjustable: true, weightOptions: ['front','back'], moiRating: 'above-average', availableInShop: true },
  { id: '3', brand: 'Callaway', model: 'Paradym', loftOptions: ['9','10.5','12'], cogType: 'low-back', drawBias: false, lowSpin: false, highMoi: true, weightAdjustable: true, weightOptions: ['heel','neutral','toe'], moiRating: 'high', availableInShop: true },
  { id: '4', brand: 'Ping', model: 'G440 Max', loftOptions: ['9','10.5','12'], cogType: 'low-back', drawBias: false, lowSpin: false, highMoi: true, weightAdjustable: true, weightOptions: ['draw','neutral','fade'], moiRating: 'high', availableInShop: true },
  { id: '5', brand: 'Ping', model: 'G440 LST', loftOptions: ['9','10.5'], cogType: 'low-forward', drawBias: false, lowSpin: true, highMoi: false, weightAdjustable: true, weightOptions: ['neutral','fade'], moiRating: 'above-average', availableInShop: true },
  { id: '6', brand: 'Titleist', model: 'TSR2', loftOptions: ['8','9','10','11'], cogType: 'low-back', drawBias: false, lowSpin: false, highMoi: true, weightAdjustable: true, weightOptions: ['neutral','draw'], moiRating: 'high', availableInShop: true },
];
