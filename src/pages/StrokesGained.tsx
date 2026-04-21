import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import StrokesGainedTool from '../components/StrokesGainedTool';

export default function StrokesGained() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Strokes Gained Tool</h1>
          <p className="text-xs text-gray-400">Broadie-Modell (PGA Tour Baseline, 2004–2012)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          Vergleiche zwei Driver-Setups anhand des Strokes Gained Modells von Mark Broadie.
          Gib Carry-Distanz, seitliche Streuung und Loch-Länge ein — das Modell berechnet die
          erwarteten Schläge bis zum Einlochen und den SG-Wert gegenüber der Baseline.
        </p>
        <div className="grid grid-cols-3 gap-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-3 mb-4">
          <div><span className="font-semibold text-gray-700">Fairway:</span> ±14 m von Mitte</div>
          <div><span className="font-semibold text-gray-700">OB:</span> &gt; ±45 m von Mitte</div>
          <div><span className="font-semibold text-gray-700">Rough:</span> Dazwischen</div>
        </div>
        <StrokesGainedTool />
      </div>
    </div>
  );
}
