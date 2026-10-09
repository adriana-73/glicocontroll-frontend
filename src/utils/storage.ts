import type { PatientProfile } from '@/types';
import { supabase } from '@/lib/supabase';

const PROFILE_ID = '00000000-0000-0000-0000-000000000001';

const DEFAULT_PROFILE: PatientProfile = {
  nome: '',
  email: '',
  idade: '',
  peso: '',
  altura: '',
  medicamentos: '',
};

type DbProfile = {
  id: string;
  nome: string;
  email: string;
  idade: string;
  peso: string;
  altura: string;
  medicamentos: string;
};

function mapProfile(row: DbProfile): PatientProfile {
  return {
    nome: row.nome ?? '',
    email: row.email ?? '',
    idade: row.idade ?? '',
    peso: row.peso ?? '',
    altura: row.altura ?? '',
    medicamentos: row.medicamentos ?? '',
  };
}

export async function loadProfile(): Promise<PatientProfile> {
  const { data, error } = await supabase
    .from('patient_profile')
    .select('id, nome, email, idade, peso, altura, medicamentos')
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
      email: profile.email,
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
