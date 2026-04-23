import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle, AlertCircle, XCircle, ChevronRight } from 'lucide-react';
import { recommendShaft, getFlexLabel } from '../lib/shaftRecommendation';
import { buildFlightShapeLabel } from '../lib/dPlaneEngine';
import { getShaftLengthRecommendation } from '../lib/analysisEngine';
import MetricCard from '../components/MetricCard';
import RecommendationCard from '../components/RecommendationCard';
import TechniqueCard from '../components/TechniqueCard';
import StrokesGainedTool from '../components/StrokesGainedTool';
import type { FittingInputs, AnalysisResult, DriverProduct, RankedProduct } from '../types';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { recommendProducts, FALLBACK_PRODUCTS } from '../lib/recommendProducts';
import { saveFittingSession } from '../lib/sessionStorage';
import { generatePDF } from '../lib/pdfReport';

const COG_V_LABELS: Record<string, string> = {
  'low-back':    'Low-Back (hoch MOI, mehr Launch)',
  'low-forward': 'Low-Forward (weniger Spin, flacher)',
  'very-low':    'Very Low (max. Launch, tiefes CoG)',
};
const COG_H_LABELS: Record<string, string> = {
  neutral:     'Neutral',
  'heel-bias': 'Heel-Bias (Draw-Effekt)',
  'toe-bias':  'Toe-Bias (Fade-Effekt)',
};

const BADGE_STYLES: Record<string, string> = {
  'Low-Spin':    'bg-blue-100 text-blue-700',
  'Draw-Bias':   'bg-purple-100 text-purple-700',
  'High-MOI':    'bg-green-100 text-green-700',
  'Verstellbar': 'bg-amber-100 text-amber-700',
};

function StatusIcon({ status }: { status: string }) {
  if (status === 'optimal') return <CheckCircle size={16} className="text-green-600" />;
  if (status === 'low' || status === 'high') return <AlertCircle size={16} className="text-amber-500" />;
  return <XCircle size={16} className="text-red-500" />;
}

function ProductCard({ p }: { p: RankedProduct }) {
  const badges = [
    p.lowSpin && 'Low-Spin',
    p.drawBias && 'Draw-Bias',
    p.highMoi && 'High-MOI',
    p.weightAdjustable && 'Verstellbar',
  ].filter(Boolean) as string[];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 relative">
      <span className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#185FA5] text-white text-xs font-bold flex items-center justify-center">
        {p.rank}
      </span>
      <div className="font-bold text-gray-900 pr-8">{p.brand}</div>
      <div className="text-gray-600 text-sm mb-2">{p.model}</div>
      <div className="text-xs text-gray-400 mb-3">Loft: {p.loftOptions.join(' / ')}°</div>
      <div className="flex flex-wrap gap-1">
        {badges.map(b => (
          <span key={b} className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_STYLES[b] ?? 'bg-gray-100 text-gray-600'}`}>
            {b}
          </span>
        ))}
      </div>
      {p.notes && <p className="text-xs text-gray-400 mt-2">{p.notes}</p>}
    </div>
  );
}

export default function FittingResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { inputs: FittingInputs; result: AnalysisResult } | null;
  const [products, setProducts] = useState<DriverProduct[]>([]);
  const savedRef = useRef(false);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error } = await supabase.from('driver_products').select('*').eq('available_in_shop', true);
        if (error || !data) throw error;
        const mapped: DriverProduct[] = data.map((r: Record<string, unknown>) => ({
          id: r.id as string, brand: r.brand as string, model: r.model as string,
          loftOptions: r.loft_options as string[], cogType: r.cog_type as DriverProduct['cogType'],
          drawBias: r.draw_bias as boolean, lowSpin: r.low_spin as boolean,
          highMoi: r.high_moi as boolean, weightAdjustable: r.weight_adjustable as boolean,
          weightOptions: r.weight_options as string[], moiRating: r.moi_rating as string,
          availableInShop: r.available_in_shop as boolean, notes: r.notes as string | undefined,
        }));
        setProducts(mapped);
      } catch {
        setProducts(FALLBACK_PRODUCTS);
      }
    }
    loadProducts();
  }, []);

  // Save session + recommendations once products are resolved
  useEffect(() => {
    if (!state || savedRef.current || products.length === 0) return;
    savedRef.current = true;
    const ranked = recommendProducts(state.result, state.inputs.customerGoals, products);
    saveFittingSession(state.inputs, state.result, ranked);
  }, [state, products]);

  if (!state) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">
          Kein Fitting gefunden.{' '}
          <button onClick={() => navigate('/fitting/new')} className="text-blue-600 underline">
            Neues Fitting starten.
          </button>
        </p>
      </div>
    );
  }

  const { inputs, result } = state;
  const pool = products.length > 0 ? products : FALLBACK_PRODUCTS;
  const recommended = recommendProducts(result, inputs.customerGoals, pool);
  const showSG = inputs.customerGoals.includes('distance') || inputs.customerGoals.includes('direction');

  const hcp = inputs.handicap;
  const hcpLevel = hcp !== null && hcp <= 5 ? 5 : hcp !== null && hcp <= 10 ? 10 : hcp !== null && hcp <= 18 ? 15 : 25;

  return (
    <div className="max-w-2xl lg:max-w-5xl mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Fitting-Ergebnis</h1>
          <p className="text-sm text-gray-500">{inputs.customerName} · {inputs.fitterName}</p>
        </div>
        <button
          onClick={() => generatePDF(inputs, result, recommended)}
          className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-3 py-2 rounded-lg transition-colors"
        >
          <Download size={16} />
          PDF
        </button>
      </div>

      {/* Desktop: 2-column. Mobile/tablet: stacked. */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">

        {/* Left column: Analyse + Empfehlungen */}
        <div>
          {/* Block 1: Ist-Analyse */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-base">📊</span> Ist-Analyse
            </h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <MetricCard
                label="Smash Factor"
                value={result.smashFactor.toFixed(3)}
                status={result.smashFactorStatus}
                target="≥ 1.48"
                sublabel={`Club: ${inputs.clubSpeedMph} mph · Ball: ${inputs.ballSpeedMph} mph`}
              />
              <MetricCard
                label="Spin Loft"
                value={`${result.spinLoftDeg}°`}
                status="optimal"
                sublabel={`Dyn. Loft: ${result.dynLoftDeg}°`}
              />
              <MetricCard
                label="Launch"
                value={`${inputs.launchAngleDeg}°`}
                status={result.launchStatus}
                target={`${result.optimalLaunchDeg}°`}
                delta={`${result.launchDeltaDeg > 0 ? '+' : ''}${result.launchDeltaDeg}°`}
              />
              <MetricCard
                label="Backspin"
                value={inputs.backspinRpm.toLocaleString('de')}
                unit="RPM"
                status={result.spinStatus}
                target={`${result.optimalSpinRpm.toLocaleString('de')} RPM`}
                delta={`${result.spinDeltaRpm > 0 ? '+' : ''}${result.spinDeltaRpm.toLocaleString('de')}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-gray-500">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">Launch-Zielbereich</div>
                <div className="text-gray-900 font-semibold">{result.launchMin}° – {result.launchMax}°</div>
                <div className="flex items-center gap-1 mt-1">
                  <StatusIcon status={result.launchStatus} />
                  <span>{result.launchStatus === 'optimal' ? 'Im Zielbereich' : result.launchStatus === 'low' ? 'Zu niedrig' : 'Zu hoch'}</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-gray-700 mb-1">Spin-Zielbereich</div>
                <div className="text-gray-900 font-semibold">{result.spinMin.toLocaleString('de')} – {result.spinMax.toLocaleString('de')} RPM</div>
                <div className="flex items-center gap-1 mt-1">
                  <StatusIcon status={result.spinStatus} />
                  <span>{result.spinStatus === 'optimal' ? 'Im Zielbereich' : result.spinStatus === 'low' ? 'Zu niedrig' : 'Zu hoch'}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 leading-relaxed">
              {result.diagnosisText}
            </div>
          </div>

          {/* Block 2a: D-Plane Diagnose (nur wenn vorhanden) */}
          {result.dPlane && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-base">✈️</span> D-Plane Analyse
              </h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <MetricCard
                  label="Club Path"
                  value={`${result.dPlane.clubPathDeg}°`}
                  status={Math.abs(result.dPlane.clubPathDeg) < 3 ? 'optimal' : 'low'}
                  sublabel={result.dPlane.pathCategory.replace(/-/g, ' ')}
                />
                <MetricCard
                  label="Face Angle"
                  value={`${result.dPlane.faceAngleDeg}°`}
                  status={Math.abs(result.dPlane.faceAngleDeg) < 2 ? 'optimal' : 'low'}
                  sublabel={result.dPlane.faceCategory.replace(/-/g, ' ')}
                />
                <MetricCard
                  label="Face-to-Path"
                  value={`${result.dPlane.faceToPath > 0 ? '+' : ''}${result.dPlane.faceToPath}°`}
                  status={Math.abs(result.dPlane.faceToPath) < 3 ? 'optimal' : 'low'}
                  sublabel={result.dPlane.faceToPath > 3 ? 'Fade/Slice-Tendenz'
                    : result.dPlane.faceToPath < -3 ? 'Draw/Hook-Tendenz' : 'Neutral'}
                />
                <MetricCard
                  label="Ballflugform"
                  value={buildFlightShapeLabel(result.dPlane.flightShape).split(' ')[0]}
                  status="optimal"
                  sublabel={`Start: ${result.dPlane.startDirection > 0 ? '+' : ''}${result.dPlane.startDirection}°`}
                />
              </div>
              {/* Plausibilitäts-Check */}
              {Math.abs(result.dPlane.spinAxisDelta) > 5 && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 text-xs text-amber-800">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Spin-Achse gemessen ({result.dPlane.spinAxisDeg}°) weicht von D-Plane-Berechnung
                    ({result.dPlane.spinAxisFromDPlane}°) um {result.dPlane.spinAxisDelta}° ab.
                    Messwerte prüfen oder Trefferzone korrigieren.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Block 2b: Equipment-Empfehlungen */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
              <span className="text-base">💡</span> Equipment-Empfehlungen
              <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                {result.playerProfile === 'equipment-maxer' ? '🔧 Maximale Anpassung' : '🎯 Überbrückung'}
              </span>
            </h2>
            <div className="flex flex-col gap-3 mt-4">
              {result.equipmentRecommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-400" />
                  <p>Alle Parameter im optimalen Bereich – kein Handlungsbedarf.</p>
                </div>
              ) : (
                result.equipmentRecommendations
                  .sort((a, b) => (a.priority === 'primary' ? -1 : 1) - (b.priority === 'primary' ? -1 : 1))
                  .map((rec, i) => <RecommendationCard key={i} rec={rec} index={i} />)
              )}
            </div>
          </div>

          {/* Block 2c: Technik-Empfehlungen (nur tech-optimizer) */}
          {result.playerProfile === 'tech-optimizer' && result.techniqueRecommendations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
                <span className="text-base">🎯</span> Technik-Empfehlungen
                <span className="ml-auto text-xs font-normal px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Langfristige Korrektur
                </span>
              </h2>
              <p className="text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2 mt-3 mb-3 leading-relaxed">
                Diese Empfehlungen setzen voraus, dass der Spieler aktiv an seiner Technik arbeitet.
                Equipment-Anpassungen überbrücken den Lernprozess.
              </p>
              {result.techniqueRecommendations.map((rec, i) => (
                <TechniqueCard key={i} rec={rec} />
              ))}
            </div>
          )}
        </div>

        {/* Right column: CoG + Produkte + SG */}
        <div>
          {/* Block 3: CoG & Equipment */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-base">⚙️</span> CoG & Ausstattungsempfehlung
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">CoG vertikal</div>
                <div className="font-bold text-gray-900 text-sm">{COG_V_LABELS[result.cogVertical]}</div>
                <div className="mt-3 flex flex-col items-center">
                  <svg width="80" height="80" viewBox="0 0 80 80">
                    <rect x="10" y="10" width="60" height="60" rx="10" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1.5" />
                    {result.cogVertical === 'low-back'    && <circle cx="25" cy="55" r="8" fill="#185FA5" />}
                    {result.cogVertical === 'low-forward' && <circle cx="55" cy="55" r="8" fill="#185FA5" />}
                    {result.cogVertical === 'very-low'    && <circle cx="40" cy="65" r="7" fill="#185FA5" />}
                    <text x="40" y="40" textAnchor="middle" fontSize="8" fill="#9CA3AF">CoG</text>
                  </svg>
                  <p className="text-xs text-gray-400 text-center mt-1">{result.cogVertical}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide">CoG horizontal</div>
                <div className="font-bold text-gray-900 text-sm">{COG_H_LABELS[result.cogHorizontal]}</div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Empf. Loft</span>
                    <span className="font-bold text-gray-900">{result.recommendedLoft}°</span>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-600">Gewichtseinst.</span>
                    <span className="font-bold text-gray-900 capitalize">{result.recommendedWeightSetting}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Block 3a.5: Schaftlängen-Empfehlung */}
          {(() => {
            const lengthRec = getShaftLengthRecommendation(
              inputs.impactZone,
              result.smashFactor,
              inputs.clubSpeedMph
            );
            if (lengthRec.priority === 'info' && lengthRec.recommendedAdjustment === 0) return null;
            return (
              <div
                className="rounded-xl border p-4 mb-4"
                style={{
                  borderColor: lengthRec.priority === 'strong' ? '#1E4D2B' : '#C9A84C',
                  backgroundColor: lengthRec.priority === 'strong' ? '#EEF4F0' : '#FDF8EC',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-gray-800">📏 Schaftlängen-Empfehlung</span>
                  {lengthRec.recommendedAdjustment !== 0 && (
                    <span className="text-xs text-white px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: '#1E4D2B' }}>
                      {lengthRec.recommendedAdjustment > 0 ? '+' : ''}{lengthRec.recommendedAdjustment}" vs. Standard
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#4A6654] leading-relaxed">{lengthRec.reason}</p>
              </div>
            );
          })()}

          {/* Block 3b: Schaftempfehlung kompakt */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-base">🏹</span> Schaftempfehlung
            </h2>
            {(() => {
              const shaft = recommendShaft(inputs.clubSpeedMph, inputs.tempo ?? 'medium');
              return (
                <>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Flex', value: shaft.recommendedFlex },
                      { label: 'Gewicht', value: shaft.weightRange },
                      { label: 'Launch', value: shaft.launchProfile },
                    ].map(m => (
                      <div key={m.label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <div className="text-xs text-gray-400">{m.label}</div>
                        <div className="font-bold text-[#185FA5] text-sm">{m.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 mb-3">
                    <strong>{getFlexLabel(shaft.recommendedFlex)}</strong>
                    {shaft.primaryShafts.length > 0 && (
                      <span className="text-gray-400">
                        {' · '}
                        {shaft.primaryShafts.map(s => `${s.brand} ${s.name}`).join(', ')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/shaft-fitting?speed=${inputs.clubSpeedMph}&tempo=${inputs.tempo ?? 'medium'}`)}
                    className="flex items-center gap-1 text-xs text-[#185FA5] font-medium
                      hover:underline transition-colors"
                  >
                    Vollständige Schaftanalyse öffnen
                    <ChevronRight size={13} />
                  </button>
                </>
              );
            })()}
          </div>

          {/* Block 4: Produkte */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-base">🏌️</span> Passende Driver aus dem Sortiment
            </h2>
            {recommended.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                Keine passenden Produkte im Sortiment. Produktdatenbank prüfen.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {recommended.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>

          {/* Block 5: Strokes Gained (optional) */}
          {showSG && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
              <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="text-base">📈</span> Strokes Gained Vergleich
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Vergleiche dein aktuelles Setup mit einer optimierten Variante. Distanz in Metern (ca. 1 mph ≈ 2,0 m Carry).
              </p>
              <StrokesGainedTool
                initialA={{ carryDistanceM: Math.round(inputs.ballSpeedMph * 2.0) }}
                initialHcp={hcpLevel as 5 | 10 | 15 | 25}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
