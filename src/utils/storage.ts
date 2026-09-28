import type { PatientProfile, GlicemiaRecord } from '@/types';
import { supabase } from '@/lib/supabase';

const PROFILE_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_PROFILE: PatientProfile = {
  nome: '',
  idade: '',
  peso: '',
  altura: '',
  medicamentos: '',
};

type DbProfile = {
  id: string;
  nome: string;
  idade: string;
  peso: string;
  altura: string;
  medicamentos: string;
};

type DbGlicemia = {
  id: string;
  valor: number;
  momento: string;
  horario: string;
  data: string;
};

function mapProfile(row: DbProfile): PatientProfile {
  return {
    nome: row.nome ?? '',
    idade: row.idade ?? '',
    peso: row.peso ?? '',
    altura: row.altura ?? '',
    medicamentos: row.medicamentos ?? '',
  };
}

function mapRecord(row: DbGlicemia): GlicemiaRecord {
  return {
    id: row.id,
    valor: row.valor,
    momento: row.momento as GlicemiaRecord['momento'],
    horario: row.horario,
    data: row.data,
  };
}

export async function loadProfile(): Promise<PatientProfile> {
  const { data, error } = await supabase
    .from('patient_profile')
    .select('id, nome, idade, peso, altura, medicamentos')
    .eq('id', PROFILE_ID)
    .maybeSingle();

  if (error) {
    console.error('Erro ao carregar perfil:', error.message);
    return DEFAULT_PROFILE;
  }

  return data ? mapProfile(data as DbProfile) : DEFAULT_PROFILE;
}

export async function saveProfile(profile: PatientProfile): Promise<void> {
  const { error } = await supabase
    .from('patient_profile')
    .upsert({
      id: PROFILE_ID,
      nome: profile.nome,
      idade: profile.idade,
      peso: profile.peso,
      altura: profile.altura,
      medicamentos: profile.medicamentos,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Erro ao salvar perfil:', error.message);
    throw error;
  }
}

export async function loadRecords(): Promise<GlicemiaRecord[]> {
  const { data, error } = await supabase
    .from('glicemia_records')
    .select('id, valor, momento, horario, data')
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao carregar registros:', error.message);
    return [];
  }

  return (data as DbGlicemia[]).map(mapRecord);
}

export async function addRecord(record: Omit<GlicemiaRecord, 'id'>): Promise<GlicemiaRecord[]> {
  const { error } = await supabase.from('glicemia_records').insert({
    valor: record.valor,
    momento: record.momento,
    horario: record.horario,
    data: record.data,
  });

  if (error) {
    console.error('Erro ao adicionar registro:', error.message);
    throw error;
  }

  return loadRecords();
}

export async function deleteRecord(id: string): Promise<GlicemiaRecord[]> {
  const { error } = await supabase.from('glicemia_records').delete().eq('id', id);

  if (error) {
    console.error('Erro ao excluir registro:', error.message);
    throw error;
  }

  return loadRecords();
}

export async function clearAllRecords(): Promise<void> {
  const { error } = await supabase.from('glicemia_records').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  if (error) {
    console.error('Erro ao limpar registros:', error.message);
    throw error;
  }
}
