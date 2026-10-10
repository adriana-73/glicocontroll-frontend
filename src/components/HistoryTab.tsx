import { useState, useEffect } from 'react';
import { History, Droplet, Calendar, Loader2, TrendingUp } from 'lucide-react';
import type { GlicemiaRecord } from '@/types';
import { MOMENTOS } from '@/types';
import { analisarGlicemia } from '@/utils/glicemia';
import { fetchMeasurements, fetchAverage } from '@/lib/api';
import GlucoseChart from '@/components/GlucoseChart';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function valorColor(valor: number): string {
  const a = analisarGlicemia(valor);
  switch (a.cor) {
    case 'amber':
      return 'text-amber-600 bg-amber-50';
    case 'emerald':
      return 'text-emerald-600 bg-emerald-50';
    case 'orange':
      return 'text-orange-600 bg-orange-50';
    case 'red':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-slate-600 bg-slate-50';
  }
}

export default function HistoryTab() {
  const [records, setRecords] = useState<GlicemiaRecord[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchMeasurements(), fetchAverage()])
      .then(([r, avg]) => {
        setRecords(r);
        setAverage(avg);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center">
            <History className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Histórico de Medições</h2>
            <p className="text-sm text-slate-500">{records.length} registro(s)</p>
          </div>
        </div>
      </div>

      {average !== null && records.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Média glicêmica</p>
            <p className="text-2xl font-bold text-slate-800">
              {average.toFixed(1)} <span className="text-base font-normal text-slate-400">mg/dL</span>
            </p>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500">Nenhuma medição registrada ainda.</p>
          <p className="text-sm text-slate-400 mt-1">
            Vá para a aba Glicemia para registrar sua primeira medição.
          </p>
        </div>
      ) : (
        <>
        <GlucoseChart records={records} />
        <div className="space-y-3">
          {records.map((r) => {
            const a = analisarGlicemia(r.valor);
            const momentoLabel = MOMENTOS.find((m) => m.value === r.momento)?.label ?? r.momento;
            return (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 hover:shadow-md transition"
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${valorColor(r.valor)}`}>
                  <Droplet className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-800">{r.valor}</span>
                    <span className="text-sm text-slate-400">mg/dL</span>
                    {a.critica && (
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                        CRÍTICO
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {momentoLabel} · {r.horario} · {formatDate(r.data)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1 truncate">{a.titulo}</p>
                </div>

              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
