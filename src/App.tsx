import { useState } from 'react';
import { Activity, User, History, HeartPulse } from 'lucide-react';
import ProfileTab from '@/components/ProfileTab';
import GlucoseTab from '@/components/GlucoseTab';
import HistoryTab from '@/components/HistoryTab';

type Tab = 'glicemia' | 'perfil' | 'historico';

const TABS: { id: Tab; label: string; Icon: typeof Activity }[] = [
  { id: 'glicemia', label: 'Glicemia', Icon: Activity },
  { id: 'historico', label: 'Histórico', Icon: History },
  { id: 'perfil', label: 'Perfil', Icon: User },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('glicemia');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center">
            <HeartPulse className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">GlicoControl</h1>
            <p className="text-xs text-slate-500">Controle diário da glicemia</p>
          </div>
        </div>

        {/* Desktop tabs */}
        <nav className="max-w-3xl mx-auto px-4 hidden sm:flex gap-1">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition ${
                tab === id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 pb-24 sm:pb-6">
        {tab === 'glicemia' && <GlucoseTab />}
        {tab === 'perfil' && <ProfileTab />}
        {tab === 'historico' && <HistoryTab />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40">
        <div className="flex">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition ${
                tab === id ? 'text-teal-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer disclaimer */}
      <footer className="hidden sm:block text-center py-4 text-xs text-slate-400 border-t border-slate-200">
        GlicoControl é uma ferramenta de apoio e não substitui a orientação médica.
      </footer>
    </div>
  );
}
