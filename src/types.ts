export type Momento = 'jejum' | 'pre-refeicao' | 'pos-refeicao' | 'aleatorio';

export interface PatientProfile {
  nome: string;
  idade: string;
  peso: string;
  altura: string;
  medicamentos: string;
}

export interface GlicemiaRecord {
  id: string;
  valor: number;
  momento: Momento;
  horario: string;
  data: string;
}

export interface AnaliseGlicemia {
  categoria: 'baixa' | 'normal' | 'alta' | 'muito_alta';
  titulo: string;
  cor: string;
  recomendacao: string;
  critica: boolean;
}

export const MOMENTOS: { value: Momento; label: string }[] = [
  { value: 'jejum', label: 'Jejum' },
  { value: 'pre-refeicao', label: 'Pré-refeição' },
  { value: 'pos-refeicao', label: 'Pós-refeição' },
  { value: 'aleatorio', label: 'Aleatório' },
];
