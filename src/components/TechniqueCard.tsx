import type { TechniqueRec } from '../types';
import { ArrowRight } from 'lucide-react';

export default function TechniqueCard({ rec }: { rec: TechniqueRec }) {
  const isPrimary = rec.priority === 'primary';
  const pct = rec.improvementDeg > 0
    ? Math.min(100, Math.round((rec.improvementDeg / (rec.improvementDeg + 5)) * 100))
    : 0;

  return (
    <div className={`rounded-xl border p-4 mb-3 ${isPrimary ? 'border-[#185FA5] bg-blue-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          isPrimary ? 'bg-[#185FA5] text-white' : 'bg-gray-100 text-gray-500'
        }`}>
          {isPrimary ? 'Priorität' : 'Sekundär'}
        </span>
        {rec.improvementDeg > 0 && (
          <span className="text-xs text-gray-400">{rec.improvementDeg.toFixed(1)}° Korrekturbedarf</span>
        )}
      </div>

      <h3 className={`font-semibold text-sm mb-1 ${isPrimary ? 'text-[#185FA5]' : 'text-gray-900'}`}>
        {rec.title}
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed mb-3">{rec.description}</p>

      {/* Aktuell → Ziel */}
      <div className="flex items-center gap-2 text-xs mb-2">
        <span className="bg-red-50 border border-red-200 text-red-700 px-2 py-1 rounded-lg font-medium">
          {rec.currentValue}
        </span>
        <ArrowRight size={12} className="text-gray-400 flex-shrink-0" />
        <span className="bg-green-50 border border-green-200 text-green-700 px-2 py-1 rounded-lg font-medium">
          {rec.targetValue}
        </span>
      </div>

      {/* Fortschrittsbalken — nur wenn Grad-Wert vorhanden */}
      {pct > 0 && (
        <div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#185FA5] rounded-full"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}% bis Ziel</p>
        </div>
      )}
    </div>
  );
}
