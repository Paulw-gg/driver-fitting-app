import { useNavigate } from 'react-router-dom';
import { Target, History, Settings, TrendingUp, BookOpen, Gauge } from 'lucide-react';

const CARDS = [
  {
    icon: Target,
    title: 'Neues Fitting starten',
    desc: 'Messwerte eingeben, PING Chart analysieren und Driver-Empfehlung erhalten.',
    to: '/fitting/new',
    primary: true,
  },
  {
    icon: History,
    title: 'Fitting-Historie',
    desc: 'Alle vergangenen Fitting-Sessions einsehen und vergleichen.',
    to: '/fitting/history',
    primary: false,
  },
  {
    icon: Gauge,
    title: 'Schaftberatung',
    desc: 'Flex und Schaft-Gewicht anhand von Schlägerkopfgeschwindigkeit und Tempo bestimmen.',
    to: '/shaft-fitting',
    primary: false,
  },
  {
    icon: BookOpen,
    title: 'Training & Wissen',
    desc: 'Gear Effect, Spin-Achse, CoG und MOI interaktiv erklärt.',
    to: '/training',
    primary: false,
  },
  {
    icon: TrendingUp,
    title: 'Strokes Gained Tool',
    desc: 'Vergleiche zwei Setups anhand des Broadie Strokes Gained Modells.',
    to: '/tools/strokes-gained',
    primary: false,
  },
  {
    icon: Settings,
    title: 'Produktdatenbank',
    desc: 'Driver-Sortiment pflegen – Modelle, Loft-Optionen und Verfügbarkeit.',
    to: '/admin',
    primary: false,
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-2xl lg:max-w-3xl mx-auto px-4 lg:px-6 py-10 lg:py-12">
      <div className="mb-8 lg:mb-10">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Driver Fitting App</h1>
        <p className="text-gray-500 lg:text-lg">
          Datenbasiertes Driver-Fitting mit PING Optimal Launch &amp; Spin Chart 2022.
        </p>
      </div>

      {/* 1 col on mobile, 2 col on lg+ */}
      <div className="grid gap-4 lg:grid-cols-2">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.to}
              onClick={() => navigate(c.to)}
              className={`w-full text-left rounded-xl border p-5 flex items-start gap-4 transition-all ${
                c.primary
                  ? 'bg-[#185FA5] border-[#185FA5] hover:bg-blue-700 text-white'
                  : 'bg-white border-gray-200 hover:border-gray-400 text-gray-900'
              }`}
            >
              <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                c.primary ? 'bg-white/20' : 'bg-gray-50'
              }`}>
                <Icon size={26} className={c.primary ? 'text-white' : 'text-gray-500'} />
              </div>
              <div>
                <div className={`font-semibold text-base ${c.primary ? 'text-white' : 'text-gray-900'}`}>
                  {c.title}
                </div>
                <div className={`text-sm mt-0.5 ${c.primary ? 'text-blue-100' : 'text-gray-500'}`}>
                  {c.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
