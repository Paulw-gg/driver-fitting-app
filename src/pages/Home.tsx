import { useNavigate } from 'react-router-dom';
import { Target, History, Settings, TrendingUp } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      icon: <Target size={28} className="text-blue-600" />,
      title: 'Neues Fitting starten',
      desc: 'Messwerte eingeben, PING Chart analysieren und Driver-Empfehlung erhalten.',
      action: () => navigate('/fitting/new'),
      primary: true,
    },
    {
      icon: <History size={28} className="text-gray-500" />,
      title: 'Fitting-Historie',
      desc: 'Alle vergangenen Fitting-Sessions einsehen und vergleichen.',
      action: () => navigate('/fitting/history'),
      primary: false,
    },
    {
      icon: <TrendingUp size={28} className="text-gray-500" />,
      title: 'Strokes Gained Tool',
      desc: 'Vergleiche zwei Setups anhand des Broadie Strokes Gained Modells.',
      action: () => navigate('/tools/strokes-gained'),
      primary: false,
    },
    {
      icon: <Settings size={28} className="text-gray-500" />,
      title: 'Produktdatenbank',
      desc: 'Driver-Sortiment pflegen – Modelle, Loft-Optionen und Verfügbarkeit.',
      action: () => navigate('/admin'),
      primary: false,
    },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Driver Fitting App</h1>
        <p className="text-gray-500 text-lg">Datenbasiertes Driver-Fitting mit PING Optimal Launch & Spin Chart 2022.</p>
      </div>

      <div className="grid gap-4">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={c.action}
            className={`w-full text-left rounded-xl border p-5 flex items-start gap-4 transition-all group ${
              c.primary
                ? 'bg-[#185FA5] border-[#185FA5] hover:bg-[#1452914] text-white'
                : 'bg-white border-gray-200 hover:border-gray-400 text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
              c.primary ? 'bg-white/20' : 'bg-gray-50'
            }`}>
              {c.primary
                ? <Target size={28} className="text-white" />
                : c.icon}
            </div>
            <div>
              <div className={`font-semibold text-base ${c.primary ? 'text-white' : 'text-gray-900'}`}>{c.title}</div>
              <div className={`text-sm mt-0.5 ${c.primary ? 'text-blue-100' : 'text-gray-500'}`}>{c.desc}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
