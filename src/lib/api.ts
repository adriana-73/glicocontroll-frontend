import type { GlicemiaRecord, Momento, PatientProfile } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL;
const PROFILE_URL = 'http://localhost:8080/api/users';
const USER_ID_KEY = 'glicocontrol_user_id';

type ApiMeasurement = {
  id: string;
  userId: string;
  value: number;
  measurementDateTime: string;
};

type ApiAverage = {
  media: number;
};

type ApiProfile = {
  id: string;
  nome: string;
  email: string;
  idade: string;
  peso: string;
  altura: string;
  medicamentos: string;
};

function mapMeasurement(row: ApiMeasurement): GlicemiaRecord {
  const dt = new Date(row.measurementDateTime);
  const horario = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
  const h = dt.getHours();
  let momento: Momento = 'aleatorio';
  if (h < 8) momento = 'jejum';
  else if (h < 12) momento = 'pre-refeicao';
  else if (h < 16) momento = 'pos-refeicao';
  return {
    id: row.id,
    valor: row.value,
    momento,
    horario,
    data: row.measurementDateTime,
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
  const res = await fetch(PROFILE_URL);
  if (!res.ok) return { id: null, profile: emptyProfile() };
  const data = (await res.json()) as Partial<ApiProfile>;
  return {
    id: data.id ?? null,
    profile: {
      nome: data.nome ?? '',
      email: data.email ?? '',
      idade: data.idade ?? '',
      peso: data.peso ?? '',
      altura: data.altura ?? '',
      medicamentos: data.medicamentos ?? '',
    },
  };
}

export async function saveProfile(profile: PatientProfile): Promise<string> {
  const res = await fetch(PROFILE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.message ?? body?.error ?? '';
    } catch {
      detail = `HTTP ${res.status}`;
    }
    throw new Error(detail);
  }
  const data = (await res.json()) as Partial<ApiProfile>;
  const id = data.id;
  if (!id) throw new Error('A API não retornou um ID de usuário.');
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
  const userId = getUserId();
  if (!userId) return [];
  const res = await fetch(`${BASE_URL}/measurements/user/${userId}`);
  if (!res.ok) throw new Error(`Falha ao carregar medições (${res.status})`);
  const data = await res.json();
  const rows: ApiMeasurement[] = Array.isArray(data) ? data : [];
  return rows.map(mapMeasurement);
}

export async function createMeasurement(valor: number, data: string): Promise<GlicemiaRecord[]> {
  const userId = getUserId();
  if (!userId) throw new Error('Nenhum usuário cadastrado. Salve seu perfil primeiro.');
  const res = await fetch(`${BASE_URL}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      value: valor,
      measurementDateTime: data,
    }),
  });
  if (!res.ok) throw new Error(`Falha ao registrar medição (${res.status})`);
  return fetchMeasurements();
}

export async function fetchAverage(): Promise<number | null> {
  const userId = getUserId();
  if (!userId) return null;
  const res = await fetch(`${BASE_URL}/measurements/user/${userId}/media`);
  if (!res.ok) return null;
  const data: ApiAverage | number = await res.json();
  if (typeof data === 'number') return data;
  if (data && typeof data.media === 'number') return data.media;
  return null;
}

export async function fetchUserName(): Promise<string> {
  const { profile } = await fetchProfile();
  return profile.nome;
}
