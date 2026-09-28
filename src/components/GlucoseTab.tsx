import { useState, useEffect } from 'react';
import { Plus, Activity, Droplet, CheckCircle2, Loader2 } from 'lucide-react';
import type { GlicemiaRecord, Momento, AnaliseGlicemia } from '@/types';
import { MOMENTOS } from '@/types';
import { analisarGlicemia } from '@/utils/glicemia';
import { loadRecords, addRecord } from '@/utils/storage';
import RecommendationCard from '@/components/RecommendationCard';
import CriticalAlertModal from '@/components/CriticalAlertModal';

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function GlucoseTab() {
  const [records, setRecords] = useState<GlicemiaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [valor, setValor] = useState('');
  const [momento, setMomento] = useState<Momento>('jejum');
  const [horario, setHorario] = useState(nowTime());
  const [analise, setAnalise] = useState<AnaliseGlicemia | null>(null);
  const [showCritical, setShowCritical] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadRecords().then((r) => {
      setRecords(r);
      setLoading(false);
    });
  }, []);

  const latest = records[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const v = parseInt(valor, 10);
    if (!v || v < 10 || v > 600) return;

    setSaving(true);
    try {
      const updated = await addRecord({
        valor: v,
        momento,
        horario,
        data: new Date().toISOString(),
      });
      setRecords(updated);
      const a = analisarGlicemia(v);
      setAnalise(a);

      if (a.critica) {
        setShowCritical(true);
      }

      setValor('');
      setShowForm(false);
      setHorario(nowTime());
    } catch {
      alert('Erro ao salvar medição. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  function openForm() {
    setAnalise(null);
    setShowForm(true);
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Latest reading summary */}
      {latest && !showForm && !analise && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Última medição</p>
              <p className="text-3xl font-bold text-slate-800">
                {latest.valor} <span className="text-lg font-normal text-slate-400">mg/dL</span>
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {MOMENTOS.find((m) => m.value === latest.momento)?.label} · {latest.horario}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center">
              <Droplet className="w-7 h-7 text-teal-500" />
            </div>
          </div>
        </div>
      )}

      {/* Register button / form */}
      {!showForm && !analise && (
        <button
          onClick={openForm}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-teal-600 text-white font-semibold rounded-2xl hover:bg-teal-700 transition shadow-md shadow-teal-200"
        >
          <Plus className="w-5 h-5" /> Registrar Nova Glicemia
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5 animate-[fadeIn_0.3s_ease]"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nova Medição</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Valor da glicemia (mg/dL)
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 120"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition text-lg"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Momento</label>
              <select
                value={momento}
                onChange={(e) => setMomento(e.target.value as Momento)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition bg-white"
              >
                {MOMENTOS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Horário</label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition shadow-sm disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              {saving ? 'Salvando...' : 'Salvar Medição'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              disabled={saving}
              className="px-5 py-2.5 text-slate-600 font-medium rounded-xl hover:bg-slate-100 transition disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Recommendation card */}
      {analise && !showForm && (
        <RecommendationCard analise={analise} onNew={openForm} />
      )}

      {/* Critical modal */}
      {showCritical && analise && (
        <CriticalAlertModal
          analise={analise}
          valor={latest?.valor ?? 0}
          onClose={() => setShowCritical(false)}
        />
      )}
    </div>
  );
}
