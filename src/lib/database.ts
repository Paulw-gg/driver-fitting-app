import { supabase } from './supabaseClient';
import type { ShaftProductRow } from '../types';

// ── SCHÄFTE ──────────────────────────────────────────────────────────────────

export async function fetchShafts(): Promise<ShaftProductRow[]> {
  const { data, error } = await supabase
    .from('shaft_products')
    .select('*')
    .eq('available', true)
    .order('brand')
    .order('name');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllShafts(): Promise<ShaftProductRow[]> {
  const { data, error } = await supabase
    .from('shaft_products')
    .select('*')
    .order('brand');
  if (error) {
    console.error('Supabase fetchAllShafts Fehler:', error);
    throw error;
  }
  return data ?? [];
}

export async function upsertShaft(
  shaft: Partial<ShaftProductRow> & { id?: string }
): Promise<ShaftProductRow> {
  const { data, error } = await supabase
    .from('shaft_products')
    .upsert(shaft)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteShaft(id: string): Promise<void> {
  const { error } = await supabase
    .from('shaft_products')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── DRIVER ────────────────────────────────────────────────────────────────────

export async function fetchDrivers() {
  const { data, error } = await supabase
    .from('driver_products')
    .select('*')
    .eq('available_in_shop', true)
    .order('brand')
    .order('model');
  if (error) throw error;
  return data ?? [];
}

export async function fetchAllDrivers() {
  const { data, error } = await supabase
    .from('driver_products')
    .select('*')
    .order('brand')
    .order('model');
  if (error) throw error;
  return data ?? [];
}

export async function upsertDriver(driver: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { data, error } = await supabase
    .from('driver_products')
    .upsert(driver)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteDriver(id: string): Promise<void> {
  const { error } = await supabase
    .from('driver_products')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── FITTING SESSIONS ──────────────────────────────────────────────────────────

export async function deleteFittingSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('fitting_sessions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── PIN-SCHUTZ ─────────────────────────────────────────────────────────────────

export async function verifyDbPin(inputPin: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'db_access_code')
    .single();
  if (error || !data) return false;
  return (data as { value: string }).value === inputPin;
}

export async function updateDbPin(newPin: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .update({ value: newPin, updated_at: new Date().toISOString() })
    .eq('key', 'db_access_code');
  if (error) throw error;
}
