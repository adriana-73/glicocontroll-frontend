import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, Plus } from 'lucide-react';
import type { AnaliseGlicemia } from '@/types';

const STYLES: Record<
  string,
  { bg: string; border: string; iconBg: string; text: string; Icon: typeof AlertTriangle }
> = {
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    iconBg: 'bg-amber-100',
    text: 'text-amber-700',
    Icon: TrendingDown,
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-100',
    text: 'text-emerald-700',
    Icon: CheckCircle2,
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    iconBg: 'bg-orange-100',
    text: 'text-orange-700',
    Icon: TrendingUp,
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-300',
    iconBg: 'bg-red-100',
    text: 'text-red-700',
    Icon: AlertTriangle,
  },
};

export default function RecommendationCard({
  analise,
  onNew,
}: {
  analise: AnaliseGlicemia;
  onNew: () => void;
}) {
  const s = STYLES[analise.cor];
  const Icon = s.Icon;

  return (
    <div
      className={`rounded-2xl border-2 ${s.border} ${s.bg} p-6 animate-[fadeIn_0.4s_ease]`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${s.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${s.text}`} />
        </div>
        <div className="flex-1">
          <h3 className={`text-lg font-bold ${s.text}`}>{analise.titulo}</h3>
          <p className="text-slate-700 mt-2 leading-relaxed">{analise.recomendacao}</p>
        </div>
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition shadow-sm"
        >
          <Plus className="w-5 h-5" /> Nova Medição
        </button>
      </div>
    </div>
  );
}
