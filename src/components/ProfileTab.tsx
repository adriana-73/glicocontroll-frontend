import { useState, useEffect } from 'react';
import { User, Save, CheckCircle2, Pill, Loader2, Mail, AlertCircle } from 'lucide-react';
import type { PatientProfile } from '@/types';
import { loadProfile, saveProfile } from '@/utils/storage';

const EMPTY: PatientProfile = {
  nome: '',
  email: '',
  idade: '',
  peso: '',
  altura: '',
  medicamentos: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfileTab() {
  const [form, setForm] = useState<PatientProfile>(EMPTY);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    loadProfile().then((p) => {
      setForm(p);
      setLoading(false);
    });
  }, []);

  function update<K extends keyof PatientProfile>(key: K, value: PatientProfile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
    setErrorMsg('');
  }

  const emailInvalid = emailTouched && form.email.length > 0 && !EMAIL_RE.test(form.email);
  const emailMissing = emailTouched && form.email.trim() === '';
  const showEmailError = emailInvalid || emailMissing;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setEmailTouched(true);

    if (form.email.trim() === '') {
      setErrorMsg('O campo e-mail é obrigatório.');
      return;
    }
    if (!EMAIL_RE.test(form.email)) {
      setErrorMsg('Por favor, informe um e-mail válido (ex: nome@exemplo.com).');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      await saveProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: unknown }).message)
          : '';
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already') || msg.toLowerCase().includes('existe')) {
        setErrorMsg('Este e-mail já está cadastrado. Use outro endereço de e-mail.');
      } else if (msg) {
        setErrorMsg(`Erro ao salvar perfil: ${msg}`);
      } else {
        setErrorMsg('Erro ao salvar perfil. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  }

  const imc = (() => {
    const peso = parseFloat(form.peso);
    const alturaCm = parseFloat(form.altura);
    if (!peso || !alturaCm) return null;
    const alturaM = alturaCm / 100;
    return (peso / (alturaM * alturaM)).toFixed(1);
  })();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center">
          <User className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Perfil do Paciente</h2>
          <p className="text-sm text-slate-500">Mantenha seus dados atualizados para melhores orientações</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nome completo</label>
          <input
            type="text"
            value={form.nome}
            onChange={(e) => update('nome', e.target.value)}
            placeholder="Seu nome"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> E-mail <span className="text-rose-500">*</span>
            </span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            onBlur={() => setEmailTouched(true)}
            placeholder="nome@exemplo.com"
            className={`w-full px-4 py-2.5 rounded-xl border outline-none transition ${
              showEmailError
                ? 'border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-200'
                : 'border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200'
            }`}
          />
          {showEmailError && (
            <p className="mt-1 text-sm text-rose-600">
              {emailMissing ? 'O e-mail é obrigatório.' : 'Formato de e-mail inválido.'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Idade</label>
            <input
              type="number"
              value={form.idade}
              onChange={(e) => update('idade', e.target.value)}
              placeholder="anos"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Peso (kg)</label>
            <input
              type="number"
              value={form.peso}
              onChange={(e) => update('peso', e.target.value)}
              placeholder="kg"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Altura (cm)</label>
            <input
              type="number"
              value={form.altura}
              onChange={(e) => update('altura', e.target.value)}
              placeholder="cm"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition"
            />
          </div>
        </div>

        {imc && (
          <div className="bg-teal-50 rounded-xl px-4 py-3 flex items-center gap-2">
            <span className="text-sm text-teal-700">
              Seu IMC é <strong>{imc}</strong>
            </span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            <span className="inline-flex items-center gap-1.5">
              <Pill className="w-4 h-4" /> Medicações em uso
            </span>
          </label>
          <textarea
            value={form.medicamentos}
            onChange={(e) => update('medicamentos', e.target.value)}
            placeholder="Ex: Insulina, Metformina, Glibenclamida..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition resize-none"
          />
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 animate-[fadeIn_0.3s_ease]">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{errorMsg}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white font-medium rounded-xl hover:bg-teal-700 transition shadow-sm disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium animate-[fadeIn_0.3s_ease]">
              <CheckCircle2 className="w-5 h-5" /> Perfil salvo com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
