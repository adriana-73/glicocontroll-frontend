import { supabase } from '@/lib/supabase';
import type { GlicemiaRecord, Momento, PatientProfile } from '@/types';

const USER_ID_KEY = 'glicocontrol_user_id';
const PROFILE_ID = '00000000-0000-0000-0000-000000000001';

type DbProfile = {
  id: string;
  nome: string;
  email: string;
  idade: string;
  peso: string;
  altura: string;
  medicamentos: string;
};

type DbMeasurement = {
  id: string;
  valor: number;
  momento: string;
  horario: string;
  data: string;
};

function toProfile(row: DbProfile): PatientProfile {
  return {
    nome: row.nome ?? '',
    email: row.email ?? '',
    idade: row.idade ?? '',
    peso: row.peso ?? '',
    altura: row.altura ?? '',
    medicamentos: row.medicamentos ?? '',
  };
}

function toRecord(row: DbMeasurement): GlicemiaRecord {
  return {
    id: row.id,
    valor: row.valor,
    momento: row.momento as Momento,
    horario: row.horario,
    data: row.data,
  };
}

export function getUserId(): string | null {
  return localStorage.getItem(USER_ID_KEY);
}

export function setUserId(id: string): void {
  localStorage.setItem(USER_ID_KEY, id);
}

export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
}

export async function fetchProfile(): Promise<{ id: string | null; profile: PatientProfile }> {
  const { data, error } = await supabase
    .from('patient_profile')
    .select('*')
    .eq('id', PROFILE_ID)
    .maybeSingle();

  if (error) return { id: null, profile: emptyProfile() };
  if (!data) return { id: null, profile: emptyProfile() };

  return { id: data.id, profile: toProfile(data as DbProfile) };
}

export async function saveProfile(profile: PatientProfile): Promise<string> {
  const payload = {
    id: PROFILE_ID,
    nome: profile.nome.trim(),
    email: profile.email.trim(),
    idade: profile.idade.trim(),
    peso: profile.peso.trim(),
    altura: profile.altura.trim(),
    medicamentos: profile.medicamentos.trim(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('patient_profile')
    .upsert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message || 'Falha ao salvar perfil.');

  const id = (data as DbProfile).id;
  setUserId(id);
  return id;
}

function emptyProfile(): PatientProfile {
  return {
    nome: '',
    email: '',
    idade: '',
    peso: '',
    altura: '',
    medicamentos: '',
  };
}

export async function fetchMeasurements(): Promise<GlicemiaRecord[]> {
  const { data, error } = await supabase
    .from('glicemia_records')
    .select('*')
    .order('data', { ascending: false });

  if (error) throw new Error(error.message || 'Falha ao carregar medições.');
  return (data as DbMeasurement[]).map(toRecord);
}

export async function createMeasurement(valor: number, data: string): Promise<GlicemiaRecord[]> {
  const dt = new Date(data);
  const horario = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  const h = dt.getHours();
  let momento: Momento = 'aleatorio';
  if (h < 8) momento = 'jejum';
  else if (h < 12) momento = 'pre-refeicao';
  else if (h < 16) momento = 'pos-refeicao';

  const { error: insertError } = await supabase.from('glicemia_records').insert({
    valor,
    momento,
    horario,
    data,
  });

  if (insertError) throw new Error(insertError.message || 'Falha ao registrar medição.');

  return fetchMeasurements();
}

export async function fetchAverage(): Promise<number | null> {
  const { data, error } = await supabase
    .from('glicemia_records')
    .select('valor');

  if (error || !data || data.length === 0) return null;

  const values = data.map((r: { valor: number }) => r.valor);
  return values.reduce((sum: number, v: number) => sum + v, 0) / values.length;
}

export async function fetchUserName(): Promise<string> {
  const { profile } = await fetchProfile();
  return profile.nome || 'Paciente';
}
