import { AlertTriangle, X, Phone } from 'lucide-react';
import type { AnaliseGlicemia } from '@/types';

export default function CriticalAlertModal({
  analise,
  valor,
  onClose,
}: {
  analise: AnaliseGlicemia;
  valor: number;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-[scaleIn_0.3s_ease]">
        <div className="bg-red-600 px-6 py-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Alerta Crítico</h2>
            <p className="text-red-100 text-sm">Glicemia {valor} mg/dL</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-700 leading-relaxed">
            {analise.titulo === 'Alerta de Hipoglicemia'
              ? 'Sua glicemia está em um nível perigosamente baixo. Consuma imediatamente carboidratos de rápida absorção e procure orientação médica urgente.'
              : 'Sua glicemia está em um nível perigosamente alto. Evite qualquer ingestão de carboidratos e procure orientação médica urgente.'}
          </p>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium">
              Procure atendimento médico imediatamente ou ligue para o serviço de emergência.
            </p>
          </div>

          <button
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition shadow-sm"
            onClick={onClose}
          >
            <Phone className="w-5 h-5" /> Entendi, vou buscar ajuda
          </button>
          <button
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 text-slate-500 font-medium rounded-xl hover:bg-slate-100 transition"
            onClick={onClose}
          >
            <X className="w-5 h-5" /> Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
