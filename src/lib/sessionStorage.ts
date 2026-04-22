import { supabase } from './supabaseClient';
import type { FittingInputs, AnalysisResult, RankedProduct } from '../types';

export async function saveFittingSession(
  inputs: FittingInputs,
  result: AnalysisResult,
  recommendations: RankedProduct[]
): Promise<string | null> {
  // 1. Upsert customer by name (simple lookup for MVP)
  let customerId: string | null = null;
  try {
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('name', inputs.customerName)
      .maybeSingle();

    if (existing) {
      customerId = existing.id as string;
    } else {
      const { data: created } = await supabase
        .from('customers')
        .insert({ name: inputs.customerName, handicap: inputs.handicap })
        .select('id')
        .single();
      customerId = created?.id ?? null;
    }
  } catch { /* non-fatal */ }

  // 2. Insert fitting session (without recommended_product_id)
  const { data: session, error } = await supabase
    .from('fitting_sessions')
    .insert({
      customer_id:          customerId,
      fitter_name:          inputs.fitterName,
      current_driver_model: inputs.currentDriverModel,
      current_loft:         inputs.currentLoft,
      shaft_weight_g:       inputs.shaftWeightG,
      weight_setting:       inputs.weightSetting,
      hosel_setting:        inputs.hoselSetting,
      club_speed_mph:       inputs.clubSpeedMph,
      ball_speed_mph:       inputs.ballSpeedMph,
      launch_angle_deg:     inputs.launchAngleDeg,
      aoa_deg:              inputs.aoaDeg,
      backspin_rpm:         inputs.backspinRpm,
      spin_axis_deg:        inputs.spinAxisDeg,
      monitor_type:         inputs.monitorType,
      impact_zone:          inputs.impactZone,
      customer_goals:       inputs.customerGoals,
      tempo:                inputs.tempo,
      smash_factor:         result.smashFactor,
      spin_loft_deg:        result.spinLoftDeg,
      optimal_launch_deg:   result.optimalLaunchDeg,
      optimal_spin_rpm:     result.optimalSpinRpm,
      launch_status:        result.launchStatus,
      spin_status:          result.spinStatus,
      recommended_cog_vertical:   result.cogVertical,
      recommended_cog_horizontal: result.cogHorizontal,
      recommended_loft:           result.recommendedLoft,
      recommendation_notes:       result.diagnosisText,
    })
    .select('id')
    .single();

  if (error || !session) return null;
  const sessionId = session.id as string;

  // 3. Insert ranked recommendations into fitting_recommendations
  if (recommendations.length > 0) {
    await supabase.from('fitting_recommendations').insert(
      recommendations.map(p => ({
        fitting_session_id: sessionId,
        product_id:         p.id,
        rank:               p.rank,
      }))
    );
  }

  return sessionId;
}
