import type { EquipmentRec } from '../types';

const CATEGORY_ICON: Record<EquipmentRec['category'], string> = {
  cog: '⚙️',
  loft: '📐',
  weight: '🏋️',
  shaft: '🪵',
  'face-angle': '🎯',
  moi: '🔩',
};

interface Props {
  rec: EquipmentRec;
  index: number;
}

export default function RecommendationCard({ rec, index }: Props) {
  const isPrimary = rec.priority === 'primary';
  const icon = CATEGORY_ICON[rec.category];

  return (
    <div
      className={`rounded-xl p-4 border flex gap-3 ${
        isPrimary
          ? 'bg-blue-50 border-blue-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isPrimary ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg leading-none">{icon}</span>
          <span className={`font-semibold text-sm ${isPrimary ? 'text-blue-900' : 'text-gray-800'}`}>
            {rec.title}
          </span>
          <span
            className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
              isPrimary ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {isPrimary ? 'Primär' : 'Sekundär'}
          </span>
        </div>
        <p className={`text-sm leading-relaxed ${isPrimary ? 'text-blue-800' : 'text-gray-600'}`}>
          {rec.description}
        </p>
      </div>
    </div>
  );
}
