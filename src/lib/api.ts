import type { GlicemiaRecord, Momento } from '@/types';

const BASE_URL = import.meta.env.VITE_API_URL;

export const USER_ID = '00000000-0000-0000-0000-000000000001';

type ApiMeasurement = {
  id: string;
  userId: string;
  value: number;
  measurementDateTime: string;
};

type ApiAverage = {
  media: number;
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

export async function fetchMeasurements(): Promise<GlicemiaRecord[]> {
  const res = await fetch(`${BASE_URL}/measurements/user/${USER_ID}`);
  if (!res.ok) throw new Error(`Falha ao carregar medições (${res.status})`);
  const data = await res.json();
  const rows: ApiMeasurement[] = Array.isArray(data) ? data : [];
  return rows.map(mapMeasurement);
}

export async function createMeasurement(valor: number, data: string): Promise<GlicemiaRecord[]> {
  const res = await fetch(`${BASE_URL}/measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: USER_ID,
      value: valor,
      measurementDateTime: data,
    }),
  });
  if (!res.ok) throw new Error(`Falha ao registrar medição (${res.status})`);
  return fetchMeasurements();
}

export async function fetchAverage(): Promise<number | null> {
  const res = await fetch(`${BASE_URL}/measurements/user/${USER_ID}/media`);
  if (!res.ok) return null;
  const data: ApiAverage | number = await res.json();
  if (typeof data === 'number') return data;
  if (data && typeof data.media === 'number') return data.media;
  return null;
}
