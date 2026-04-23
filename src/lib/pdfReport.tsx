import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import type { FittingInputs, AnalysisResult, DriverProduct, EquipmentRec } from '../types';
import { recommendShaft, getFlexLabel } from './shaftRecommendation';
import { buildFlightShapeLabel } from './dPlaneEngine';

const styles = StyleSheet.create({
  page:        { padding: 36, fontFamily: 'Helvetica', fontSize: 10, color: '#1F2937' },
  header:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 12, borderBottom: '1 solid #E5E7EB' },
  title:       { fontSize: 18, fontFamily: 'Helvetica-Bold', color: '#185FA5', marginBottom: 2 },
  subtitle:    { fontSize: 10, color: '#6B7280' },
  section:     { marginBottom: 16 },
  sectionHead: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#185FA5', marginBottom: 6, paddingBottom: 3, borderBottom: '0.5 solid #DBEAFE' },
  row:         { flexDirection: 'row', marginBottom: 3 },
  label:       { width: '45%', color: '#6B7280' },
  value:       { width: '55%', fontFamily: 'Helvetica-Bold' },
  tableHead:   { flexDirection: 'row', backgroundColor: '#F9FAFB', padding: '5 6', borderBottom: '0.5 solid #E5E7EB' },
  tableRow:    { flexDirection: 'row', padding: '4 6', borderBottom: '0.5 solid #F3F4F6' },
  col1:        { width: '30%' },
  col2:        { width: '25%', textAlign: 'center' },
  col3:        { width: '25%', textAlign: 'center' },
  col4:        { width: '20%', textAlign: 'right' },
  colHead:     { fontFamily: 'Helvetica-Bold', fontSize: 9, color: '#6B7280' },
  diagBox:     { backgroundColor: '#EFF6FF', padding: 8, borderRadius: 4, marginBottom: 12 },
  diagText:    { fontSize: 9, color: '#1E40AF', lineHeight: 1.5 },
  warnBox:     { backgroundColor: '#FFFBEB', padding: 8, borderRadius: 4, marginBottom: 8 },
  warnText:    { fontSize: 9, color: '#92400E', lineHeight: 1.5 },
  greenBox:    { backgroundColor: '#F0FDF4', padding: 8, borderRadius: 4, marginBottom: 8 },
  greenText:   { fontSize: 9, color: '#166534', lineHeight: 1.5 },
  footer:      { position: 'absolute', bottom: 24, left: 36, right: 36, textAlign: 'center', fontSize: 8, color: '#9CA3AF' },
  recRow:      { flexDirection: 'row', marginBottom: 5, paddingBottom: 5, borderBottom: '0.5 solid #F3F4F6' },
  recNum:      { width: 18, height: 18, borderRadius: 9, backgroundColor: '#185FA5', color: '#fff', textAlign: 'center', fontSize: 9, fontFamily: 'Helvetica-Bold', paddingTop: 3, marginRight: 6, flexShrink: 0 },
  recBody:     { flex: 1 },
  recTitle:    { fontFamily: 'Helvetica-Bold', fontSize: 9, marginBottom: 2 },
  recDesc:     { fontSize: 8, color: '#374151', lineHeight: 1.4 },
  techRow:     { flexDirection: 'row', marginBottom: 6, paddingBottom: 6, borderBottom: '0.5 solid #F3F4F6' },
  techLabel:   { fontSize: 8, color: '#6B7280', width: '35%' },
  techCurrent: { fontSize: 8, color: '#991B1B', fontFamily: 'Helvetica-Bold', width: '25%' },
  techTarget:  { fontSize: 8, color: '#166534', fontFamily: 'Helvetica-Bold', width: '25%' },
  techDeg:     { fontSize: 8, color: '#374151', width: '15%', textAlign: 'right' },
});

function statusText(s: string) {
  return s === 'optimal' ? 'Optimal' : s === 'low' ? 'Zu niedrig' : 'Zu hoch';
}

const CATEGORY_LABEL: Record<EquipmentRec['category'], string> = {
  cog:          'CoG',
  loft:         'Loft',
  weight:       'Gewicht',
  shaft:        'Schaft',
  'face-angle': 'Face Angle',
  moi:          'MOI',
};

function ReportDoc({ inputs, result, products }: { inputs: FittingInputs; result: AnalysisResult; products: DriverProduct[] }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Driver Fitting Report</Text>
            <Text style={styles.subtitle}>{inputs.customerName} · Fitter: {inputs.fitterName}</Text>
          </View>
          <View style={{ textAlign: 'right' }}>
            <Text style={{ fontSize: 9, color: '#6B7280' }}>
              {new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </Text>
            <Text style={{ fontSize: 8, color: '#9CA3AF', marginTop: 2 }}>
              HCP: {inputs.handicap ?? '—'} · Monitor: {inputs.monitorType}
            </Text>
          </View>
        </View>

        {/* Section 1: Eingaben */}
        <View style={styles.section}>
          <Text style={styles.sectionHead}>1 · Messwerte</Text>
          <View style={{ flexDirection: 'row', gap: 20 }}>
            <View style={{ flex: 1 }}>
              {[
                ['Club Speed', `${inputs.clubSpeedMph} mph`],
                ['Ball Speed', `${inputs.ballSpeedMph} mph`],
                ['Launch Angle', `${inputs.launchAngleDeg}°`],
                ['Angle of Attack', `${inputs.aoaDeg}°`],
              ].map(([l, v]) => (
                <View style={styles.row} key={l}>
                  <Text style={styles.label}>{l}</Text>
                  <Text style={styles.value}>{v}</Text>
                </View>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              {[
                ['Backspin', `${inputs.backspinRpm} RPM`],
                ['Spin-Achse', `${inputs.spinAxisDeg > 0 ? '+' : ''}${inputs.spinAxisDeg}°`],
                ['Trefferzone', inputs.impactZone],
                ['Aktueller Driver', inputs.currentDriverModel || '—'],
              ].map(([l, v]) => (
                <View style={styles.row} key={l}>
                  <Text style={styles.label}>{l}</Text>
                  <Text style={styles.value}>{v}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Section 1b: D-Plane Analyse (nur wenn vorhanden) */}
        {result.dPlane && (
          <View style={styles.section}>
            <Text style={styles.sectionHead}>1b · D-Plane Analyse</Text>
            <View style={styles.tableHead}>
              <Text style={[styles.col1, styles.colHead]}>Parameter</Text>
              <Text style={[styles.col2, styles.colHead]}>Wert</Text>
              <Text style={[styles.col3, styles.colHead]}>Kategorie</Text>
              <Text style={[styles.col4, styles.colHead]}>Status</Text>
            </View>
            {[
              ['Club Path', `${result.dPlane.clubPathDeg}°`, result.dPlane.pathCategory.replace(/-/g, ' '), Math.abs(result.dPlane.clubPathDeg) < 3 ? 'OK' : 'Abweichung'],
              ['Face Angle', `${result.dPlane.faceAngleDeg}°`, result.dPlane.faceCategory.replace(/-/g, ' '), Math.abs(result.dPlane.faceAngleDeg) < 2 ? 'OK' : 'Abweichung'],
              ['Face-to-Path', `${result.dPlane.faceToPath > 0 ? '+' : ''}${result.dPlane.faceToPath}°`,
                result.dPlane.faceToPath > 3 ? 'Fade/Slice' : result.dPlane.faceToPath < -3 ? 'Draw/Hook' : 'Neutral',
                Math.abs(result.dPlane.faceToPath) < 3 ? 'OK' : 'Abweichung'],
              ['Startrichtung', `${result.dPlane.startDirection > 0 ? '+' : ''}${result.dPlane.startDirection}°`, '(Face-dominiert)', ''],
            ].map(([param, val, cat, status]) => (
              <View style={styles.tableRow} key={param}>
                <Text style={styles.col1}>{param}</Text>
                <Text style={[styles.col2, { fontFamily: 'Helvetica-Bold' }]}>{val}</Text>
                <Text style={styles.col3}>{cat}</Text>
                <Text style={[styles.col4, { color: status === 'OK' ? '#166534' : status ? '#92400E' : '#6B7280', fontFamily: status ? 'Helvetica-Bold' : 'Helvetica' }]}>
                  {status}
                </Text>
              </View>
            ))}
            <View style={{ ...styles.diagBox, marginTop: 6 }}>
              <Text style={styles.diagText}>
                Ballflugform: {buildFlightShapeLabel(result.dPlane.flightShape)}
                {'\n'}Primäre Ursache: {result.dPlane.primaryCause} · Gear Effect Offset: {result.dPlane.gearEffectOffset > 0 ? '+' : ''}{result.dPlane.gearEffectOffset}°
              </Text>
            </View>
          </View>
        )}

        {/* Section 2: Ist/Soll */}
        <View style={styles.section}>
          <Text style={styles.sectionHead}>2 · Ist / Soll Vergleich</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.col1, styles.colHead]}>Parameter</Text>
            <Text style={[styles.col2, styles.colHead]}>Ist-Wert</Text>
            <Text style={[styles.col3, styles.colHead]}>Zielwert</Text>
            <Text style={[styles.col4, styles.colHead]}>Status</Text>
          </View>
          {[
            ['Launch Angle', `${inputs.launchAngleDeg}°`, `${result.launchMin}–${result.launchMax}°`, result.launchStatus],
            ['Backspin', `${inputs.backspinRpm} RPM`, `${result.spinMin}–${result.spinMax} RPM`, result.spinStatus],
            ['Smash Factor', result.smashFactor.toFixed(3), '≥ 1.48', result.smashFactorStatus],
            ['Spin Loft', `${result.spinLoftDeg}°`, '—', 'optimal'],
          ].map(([param, ist, soll, status]) => (
            <View style={styles.tableRow} key={param}>
              <Text style={styles.col1}>{param}</Text>
              <Text style={styles.col2}>{ist}</Text>
              <Text style={styles.col3}>{soll}</Text>
              <Text style={[styles.col4, { color: status === 'optimal' ? '#166534' : status === 'low' ? '#92400E' : '#991B1B', fontFamily: 'Helvetica-Bold' }]}>
                {statusText(status)}
              </Text>
            </View>
          ))}
        </View>

        {/* Diagnose */}
        <View style={styles.diagBox}>
          <Text style={styles.diagText}>{result.diagnosisText}</Text>
        </View>

        {/* Section 3: Equipment-Empfehlungen */}
        <View style={styles.section}>
          <Text style={styles.sectionHead}>3 · Equipment-Empfehlungen</Text>
          {result.equipmentRecommendations.slice(0, 6).map((rec, i) => (
            <View style={styles.recRow} key={i}>
              <Text style={styles.recNum}>{i + 1}</Text>
              <View style={styles.recBody}>
                <Text style={styles.recTitle}>[{CATEGORY_LABEL[rec.category]}] {rec.title}</Text>
                <Text style={styles.recDesc}>{rec.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Section 4: CoG */}
        <View style={styles.section}>
          <Text style={styles.sectionHead}>4 · CoG & Ausstattungsempfehlung</Text>
          {[
            ['CoG vertikal', result.cogVertical],
            ['CoG horizontal', result.cogHorizontal],
            ['Empfohlenes Loft', `${result.recommendedLoft}°`],
            ['Gewichtseinstellung', result.recommendedWeightSetting],
          ].map(([l, v]) => (
            <View style={styles.row} key={l}>
              <Text style={styles.label}>{l}</Text>
              <Text style={styles.value}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Section 4b: Spielerprofil */}
        <View style={styles.section}>
          <Text style={styles.sectionHead}>4b · Spielerprofil</Text>
          <View style={result.playerProfile === 'tech-optimizer' ? styles.greenBox : styles.diagBox}>
            <Text style={result.playerProfile === 'tech-optimizer' ? styles.greenText : styles.diagText}>
              {result.playerProfile === 'tech-optimizer'
                ? 'Technik-Optimierer: Der Spieler arbeitet aktiv an seiner Technik. Equipment überbrückt kurzfristig — Technik-Empfehlungen haben Priorität über reine Equipment-Kompensation.'
                : 'Equipment-Maximierer: Der Spieler spielt so wie er spielt. Schläger wird maximal auf den aktuellen Schwung zugeschnitten — volle Kompensation durch Equipment.'}
            </Text>
          </View>
        </View>

        {/* Section 4c: Technik-Empfehlungen (nur tech-optimizer) */}
        {result.playerProfile === 'tech-optimizer' && result.techniqueRecommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHead}>4c · Technik-Empfehlungen (langfristige Korrektur)</Text>
            <View style={styles.tableHead}>
              <Text style={[{ width: '35%' }, styles.colHead]}>Empfehlung</Text>
              <Text style={[{ width: '25%' }, styles.colHead]}>Aktuell</Text>
              <Text style={[{ width: '25%' }, styles.colHead]}>Ziel</Text>
              <Text style={[{ width: '15%', textAlign: 'right' }, styles.colHead]}>Korrektur</Text>
            </View>
            {result.techniqueRecommendations.map((rec, i) => (
              <View style={styles.techRow} key={i}>
                <Text style={styles.techLabel}>{rec.title}</Text>
                <Text style={styles.techCurrent}>{rec.currentValue}</Text>
                <Text style={styles.techTarget}>{rec.targetValue}</Text>
                <Text style={styles.techDeg}>
                  {rec.improvementDeg > 0 ? `${rec.improvementDeg.toFixed(1)}°` : '—'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Section 5: Produkte */}
        {products.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHead}>5 · Empfohlene Driver</Text>
            <View style={styles.tableHead}>
              <Text style={[styles.col1, styles.colHead]}>Marke</Text>
              <Text style={[styles.col2, styles.colHead]}>Modell</Text>
              <Text style={[styles.col3, styles.colHead]}>Loft</Text>
              <Text style={[styles.col4, styles.colHead]}>Features</Text>
            </View>
            {products.map(p => (
              <View style={styles.tableRow} key={p.id}>
                <Text style={styles.col1}>{p.brand}</Text>
                <Text style={styles.col2}>{p.model}</Text>
                <Text style={styles.col3}>{p.loftOptions.join('/')}</Text>
                <Text style={styles.col4}>
                  {[p.lowSpin && 'LS', p.drawBias && 'Draw', p.highMoi && 'MOI'].filter(Boolean).join(' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Section 6: Schaftempfehlung */}
        {(() => {
          const shaft = recommendShaft(inputs.clubSpeedMph, inputs.tempo ?? 'medium');
          const shortExplanation = shaft.explanation.split('. ').slice(0, 2).join('. ') + '.';
          return (
            <View style={styles.section}>
              <Text style={styles.sectionHead}>6 · Schaftempfehlung</Text>
              {[
                ['Empfohlener Flex', getFlexLabel(shaft.recommendedFlex)],
                ['Gewichtsbereich', shaft.weightRange],
                ['Launch-Profil', shaft.launchProfile],
              ].map(([l, v]) => (
                <View style={styles.row} key={l}>
                  <Text style={styles.label}>{l}</Text>
                  <Text style={styles.value}>{v}</Text>
                </View>
              ))}
              {shaft.primaryShafts.length > 0 && (
                <>
                  <Text style={{ fontSize: 9, color: '#6B7280', marginTop: 4, marginBottom: 3 }}>
                    Empfohlene Schäfte
                  </Text>
                  {shaft.primaryShafts.map(s => {
                    const cpmStr = (
                      [['L', s.cpmL], ['A', s.cpmA], ['R', s.cpmR], ['S', s.cpmS], ['X', s.cpmX]] as
                      [string, number | null | undefined][]
                    ).filter(([, v]) => v != null).map(([f, v]) => `${f}:${v}`).join(' ');
                    return (
                      <View style={styles.tableRow} key={s.id}>
                        <Text style={styles.col1}>{s.brand} {s.name}</Text>
                        <Text style={styles.col2}>{s.weightG}g</Text>
                        <Text style={styles.col3}>{s.flexOptions.join(' / ')}</Text>
                        <Text style={styles.col4}>{cpmStr || s.launchProfile}</Text>
                      </View>
                    );
                  })}
                </>
              )}
              <View style={{ ...styles.diagBox, marginTop: 6 }}>
                <Text style={styles.diagText}>{shortExplanation}</Text>
              </View>
            </View>
          );
        })()}

        <Text style={styles.footer}>Erstellt mit Driver Fitting App · PING Optimal Launch & Spin Chart 2022</Text>
      </Page>
    </Document>
  );
}

export async function generatePDF(inputs: FittingInputs, result: AnalysisResult, products: DriverProduct[]) {
  const blob = await pdf(<ReportDoc inputs={inputs} result={result} products={products} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitting-${inputs.customerName.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
