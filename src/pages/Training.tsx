import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import GearEffectHorizontal from '../components/training/GearEffectHorizontal';
import GearEffectVertical from '../components/training/GearEffectVertical';
import SpinAxisExplainer from '../components/training/SpinAxisExplainer';
import CogExplainer from '../components/training/CogExplainer';
import CogWeightInteractive from '../components/training/CogWeightInteractive';
import MoiExplainer from '../components/training/MoiExplainer';

const CHAPTERS = [
  { id: 'kapitel-1', label: '1. Gear Effect Horizontal' },
  { id: 'kapitel-2', label: '2. Gear Effect Vertikal' },
  { id: 'kapitel-3', label: '3. Spin-Achse' },
  { id: 'kapitel-4', label: '4. CoG' },
  { id: 'kapitel-5', label: '5. MOI' },
];

function ChapterHeader({ num, title }: { num: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="w-9 h-9 rounded-full bg-[#185FA5] text-white text-sm font-bold
        flex items-center justify-center flex-shrink-0">
        {num}
      </span>
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}

function MemoryBox({ text }: { text: string }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mt-6">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
        📌 Merkhilfe
      </div>
      <pre className="text-sm text-gray-700 font-mono whitespace-pre-wrap leading-relaxed">{text}</pre>
    </div>
  );
}

export default function Training() {
  const navigate = useNavigate();
  const [activeChapter, setActiveChapter] = useState('kapitel-1');

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[id^="kapitel"]'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          // Pick the one nearest to the top
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActiveChapter(topmost.target.id);
        }
      },
      { threshold: 0.15, rootMargin: '-5% 0px -55% 0px' }
    );

    sections.forEach(s => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto px-4 lg:px-6 py-8">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BookOpen size={20} className="text-[#185FA5]" />
            Schulungsmodul: Driver-Fitting Physik
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Physikalische Grundlagen für Fitter — interaktiv erklärt
          </p>
        </div>
      </div>

      {/* Sticky chapter navigation */}
      <div className="sticky top-0 md:top-12 lg:top-0 z-30 bg-[#F8F8F6]/95 backdrop-blur-sm
        border-b border-gray-200 mb-8 -mx-4 lg:-mx-6 px-4 lg:px-6 pb-0">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex gap-1 min-w-max py-2">
            {CHAPTERS.map(ch => (
              <button
                key={ch.id}
                onClick={() => scrollTo(ch.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeChapter === ch.id
                    ? 'bg-blue-50 text-[#185FA5] border border-blue-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Chapter 1 ── */}
      <section id="kapitel-1" className="mb-16 scroll-mt-24">
        <ChapterHeader num={1} title="Der Gear Effect — Horizontal (Heel & Toe)" />
        <p className="text-gray-600 leading-relaxed mb-6">
          Trifft der Ball nicht in der Mitte der Schlagfläche, dreht sich der Schlägerkopf beim
          Aufprall um sein Center of Gravity. Da Ball und Fläche wie zwei Zahnräder ineinandergreifen,
          dreht der Ball in die entgegengesetzte Richtung — das ist der Gear Effect. Bei einem
          Toe-Treffer kippt die Spin-Achse nach links (Draw/Hook). Bei einem Heel-Treffer kippt sie
          nach rechts (Fade/Slice). Die Flächen-Wölbung (Bulge) kompensiert dies teilweise, indem
          sie den Ball zunächst in die Gegenrichtung startet.
        </p>
        <GearEffectHorizontal />
        <MemoryBox text={
          'Toe-Treffer  →  Schlägerkopf dreht nach rechts  →  Ball dreht nach links  →  Draw/Hook\n' +
          'Heel-Treffer →  Schlägerkopf dreht nach links   →  Ball dreht nach rechts →  Fade/Slice\n' +
          'Bulge startet den Ball in die ENTGEGENGESETZTE Richtung, damit der Gear Effect ihn zurückbringt.'
        } />
      </section>

      {/* ── Chapter 2 ── */}
      <section id="kapitel-2" className="mb-16 scroll-mt-24">
        <ChapterHeader num={2} title="Der Gear Effect — Vertikal (über & unter CoG)" />
        <p className="text-gray-600 leading-relaxed mb-6">
          Moderne Driver haben ihr Center of Gravity tief und weit hinten im Schlägerkopf. Trifft
          der Ball oberhalb des CoG (Hoch-Mitte), kippt der Schlägerkopf nach vorne. Durch den
          Gear Effect dreht der Ball als Gegenreaktion weniger stark rückwärts — der Backspin sinkt.
          Gleichzeitig erhöht die Flächen-Wölbung (Roll) den effektiven Loft oben auf der Fläche.
          Das Ergebnis: höherer Launch + weniger Spin. Das ist die optimale Zone beim modernen Driver.
        </p>
        <GearEffectVertical />
        <MemoryBox text={
          'Modern Driver: CoG tief + hinten → Vertical Gear Effect besonders stark\n' +
          'Hoch-Mitte treffen = höherer Launch + weniger Spin = mehr Distanz\n' +
          'Tief treffen = niedrigerer Launch + mehr Spin = Distanzverlust'
        } />
      </section>

      {/* ── Chapter 3 ── */}
      <section id="kapitel-3" className="mb-16 scroll-mt-24">
        <ChapterHeader num={3} title="Die Spin-Achse" />
        <p className="text-gray-600 leading-relaxed mb-6">
          Jeder Golfball dreht sich um eine Achse. Steht diese Achse senkrecht, dreht der Ball nur
          mit Backspin — er fliegt gerade. Ist die Achse geneigt, entsteht aerodynamischer Auftrieb
          seitlich — der Ball zieht in die Richtung der Neigung. Die Spin-Achse ist NICHT ein
          separater Seitenspin. Es ist dieselbe Rotation, aber um eine geneigte Achse. Der Grad der
          Neigung bestimmt die Stärke der Kurve.
        </p>
        <SpinAxisExplainer />
        <MemoryBox text={
          'Spin-Achse 0°    = gerader Flug\n' +
          'Spin-Achse negativ = Ball zieht nach links (Draw/Hook)\n' +
          'Spin-Achse positiv = Ball zieht nach rechts (Fade/Slice)\n' +
          'Je mehr Grad, desto stärker die Kurve.\n' +
          'Faustregel: ±5° = leichte Kurve · ±10° = deutliche Kurve · ±15° = starke Kurve'
        } />
      </section>

      {/* ── Chapter 4 ── */}
      <section id="kapitel-4" className="mb-16 scroll-mt-24">
        <ChapterHeader num={4} title="Center of Gravity (CoG) — Position & Wirkung" />
        <p className="text-gray-600 leading-relaxed mb-6">
          Das Center of Gravity (CoG) ist der Schwerpunkt des Schlägerkopfes — der Punkt um den
          sich der Kopf beim Aufprall dreht. Alle Gear-Effect-Phänomene sind relativ zum CoG.
          Moderne Driver haben das CoG tief und weit hinten platziert, um den Vertical Gear Effect
          zu maximieren. Durch verstellbare Gewichte kann das CoG horizontal verschoben werden —
          Richtung Heel für Draw-Bias, Richtung Toe für Fade-Bias.
        </p>
        <CogExplainer />
        <div className="mt-6">
          <h3 className="font-semibold text-gray-800 mb-3">Interaktives Gewichts-Tool</h3>
          <CogWeightInteractive />
        </div>
        <MemoryBox text={
          'CoG tief-hinten  → mehr Launch, mehr Spin, mehr Verzeihlichkeit (Anfänger/Mittel)\n' +
          'CoG tief-vorne   → weniger Spin, mehr Kontrolle, weniger Verzeihlich (Fortgeschrittene)\n' +
          'CoG Richtung Heel → Draw-Bias (hilft gegen Slice)\n' +
          'CoG Richtung Toe  → Fade-Bias (hilft gegen Hook)\n' +
          'Wechselwirkung: Heel-CoG + Heel-Treffer = VERSTÄRKTER Hook → warnen!\n' +
          'Wechselwirkung: Heel-CoG + Toe-Treffer  = Effekte heben sich auf → neutraler Flug'
        } />
      </section>

      {/* ── Chapter 5 ── */}
      <section id="kapitel-5" className="mb-16 scroll-mt-24">
        <ChapterHeader num={5} title="Moment of Inertia (MOI) — Verzeihlichkeit" />
        <p className="text-gray-600 leading-relaxed mb-6">
          Das Moment of Inertia (MOI) beschreibt den Widerstand des Schlägerkopfes gegen Verdrehen
          beim Off-Center-Treffer. Ein hohes MOI bedeutet: Der Kopf dreht sich bei Fehltreffern
          weniger stark — der Gear Effect fällt schwächer aus, der Ballgeschwindigkeitsverlust ist
          geringer. Modernes Driver-Design maximiert das MOI durch große Köpfe (460cc), dünne
          Kronenschalen und Gewicht weit am Perimeter. Ein hohes MOI ist besonders wichtig für
          Spieler mit inkonstantem Trefferbild.
        </p>
        <MoiExplainer />
        <MemoryBox text={
          'MOI hoch  → mehr Verzeihlichkeit → für inkonstantes Trefferbild\n' +
          'MOI niedrig → mehr Workability → für Profi-Spieler mit konstantem Trefferbild\n' +
          'Faustregel: Je größer der Kopf, desto höher das MOI\n' +
          '460cc Max-Driver = höchstes MOI · Low-Spin-Driver mit kleinem Kopf = niedrigstes MOI'
        } />
      </section>
    </div>
  );
}
