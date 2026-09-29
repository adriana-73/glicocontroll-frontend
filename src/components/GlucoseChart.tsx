import { BarChart3 } from 'lucide-react';
import type { GlicemiaRecord } from '@/types';
import { analisarGlicemia } from '@/utils/glicemia';

const BAR_COLORS: Record<string, string> = {
  amber: '#f59e0b',
  emerald: '#10b981',
  orange: '#f97316',
  red: '#ef4444',
};

const CHART_HEIGHT = 240;
const CHART_PADDING = { top: 24, right: 16, bottom: 44, left: 44 };
const MAX_VALUE = 350;
const MIN_VALUE = 0;
const NORMAL_MIN = 70;
const NORMAL_MAX = 140;

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function GlucoseChart({ records }: { records: GlicemiaRecord[] }) {
  const chartRecords = [...records].slice(0, 12).reverse();
  const count = chartRecords.length;

  const plotW = 600 - CHART_PADDING.left - CHART_PADDING.right;
  const plotH = CHART_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
  const slotW = plotW / count;
  const barW = Math.min(slotW * 0.62, 36);

  function yForValue(v: number): number {
    const clamped = Math.max(MIN_VALUE, Math.min(MAX_VALUE, v));
    return CHART_PADDING.top + plotH - (clamped / MAX_VALUE) * plotH;
  }

  const yTicks = [0, 70, 140, 210, 280, 350];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">Evolução dos Níveis de Glicemia</h3>
          <p className="text-xs text-slate-500">
            {count <= 1 ? 'Última medição' : `Últimas ${count} medições`} · mg/dL
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 600 ${CHART_HEIGHT}`}
          className="w-full"
          style={{ minWidth: count > 6 ? 520 : 300 }}
          role="img"
          aria-label="Gráfico de barras da evolução da glicemia"
        >
          {/* Y-axis grid lines + labels */}
          {yTicks.map((tick) => {
            const y = yForValue(tick);
            return (
              <g key={tick}>
                <line
                  x1={CHART_PADDING.left}
                  y1={y}
                  x2={600 - CHART_PADDING.right}
                  y2={y}
                  stroke="#f1f5f9"
                  strokeWidth={1}
                />
                <text
                  x={CHART_PADDING.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400"
                  style={{ fontSize: 11 }}
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Normal range band (70–140) */}
          <rect
            x={CHART_PADDING.left}
            y={yForValue(NORMAL_MAX)}
            width={plotW}
            height={yForValue(NORMAL_MIN) - yForValue(NORMAL_MAX)}
            fill="#10b981"
            fillOpacity={0.06}
          />
          <line
            x1={CHART_PADDING.left}
            y1={yForValue(NORMAL_MAX)}
            x2={600 - CHART_PADDING.right}
            y2={yForValue(NORMAL_MAX)}
            stroke="#10b981"
            strokeWidth={1}
            strokeDasharray="4 3"
            strokeOpacity={0.4}
          />
          <line
            x1={CHART_PADDING.left}
            y1={yForValue(NORMAL_MIN)}
            x2={600 - CHART_PADDING.right}
            y2={yForValue(NORMAL_MIN)}
            stroke="#f59e0b"
            strokeWidth={1}
            strokeDasharray="4 3"
            strokeOpacity={0.4}
          />

          {/* Bars */}
          {chartRecords.map((r, i) => {
            const a = analisarGlicemia(r.valor);
            const color = BAR_COLORS[a.cor] ?? '#64748b';
            const barX = CHART_PADDING.left + slotW * i + (slotW - barW) / 2;
            const barY = yForValue(r.valor);
            const barH = CHART_PADDING.top + plotH - barY;
            const labelX = CHART_PADDING.left + slotW * i + slotW / 2;

            return (
              <g key={r.id}>
                <rect
                  x={barX}
                  y={barY}
                  width={barW}
                  height={Math.max(barH, 2)}
                  rx={4}
                  fill={color}
                  opacity={0.85}
                >
                  <title>{`${r.valor} mg/dL — ${formatShortDate(r.data)} ${r.horario}`}</title>
                </rect>
                <text
                  x={labelX}
                  y={barY - 6}
                  textAnchor="middle"
                  className="fill-slate-600"
                  style={{ fontSize: 11, fontWeight: 600 }}
                >
                  {r.valor}
                </text>
                <text
                  x={labelX}
                  y={CHART_HEIGHT - CHART_PADDING.bottom + 16}
                  textAnchor="middle"
                  className="fill-slate-400"
                  style={{ fontSize: 10 }}
                >
                  {formatShortDate(r.data)}
                </text>
                <text
                  x={labelX}
                  y={CHART_HEIGHT - CHART_PADDING.bottom + 28}
                  textAnchor="middle"
                  className="fill-slate-300"
                  style={{ fontSize: 9 }}
                >
                  {r.horario}
                </text>
              </g>
            );
          })}

          {/* X-axis baseline */}
          <line
            x1={CHART_PADDING.left}
            y1={CHART_PADDING.top + plotH}
            x2={600 - CHART_PADDING.right}
            y2={CHART_PADDING.top + plotH}
            stroke="#e2e8f0"
            strokeWidth={1.5}
          />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-slate-100">
        <LegendItem color="#10b981" label="Normal" />
        <LegendItem color="#f59e0b" label="Baixa" />
        <LegendItem color="#f97316" label="Alta" />
        <LegendItem color="#ef4444" label="Muito alta" />
        <span className="ml-auto text-xs text-slate-400">
          Faixa normal: 70–140 mg/dL
        </span>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
