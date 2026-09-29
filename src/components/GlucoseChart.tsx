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
const THRESHOLD_BAIXA = 70;
const THRESHOLD_NORMAL = 140;
const THRESHOLD_ALTA = 180;

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

  const yTicks = [0, 70, 140, 180, 250, 350];

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

          {/* Range zone bands */}
          {/* <70 — Baixa (amber) */}
          <rect
            x={CHART_PADDING.left}
            y={yForValue(THRESHOLD_BAIXA)}
            width={plotW}
            height={CHART_PADDING.top + plotH - yForValue(THRESHOLD_BAIXA)}
            fill="#f59e0b"
            fillOpacity={0.06}
          />
          {/* 70–140 — Normal (emerald) */}
          <rect
            x={CHART_PADDING.left}
            y={yForValue(THRESHOLD_NORMAL)}
            width={plotW}
            height={yForValue(THRESHOLD_BAIXA) - yForValue(THRESHOLD_NORMAL)}
            fill="#10b981"
            fillOpacity={0.06}
          />
          {/* 140–180 — Alta (orange) */}
          <rect
            x={CHART_PADDING.left}
            y={yForValue(THRESHOLD_ALTA)}
            width={plotW}
            height={yForValue(THRESHOLD_NORMAL) - yForValue(THRESHOLD_ALTA)}
            fill="#f97316"
            fillOpacity={0.06}
          />
          {/* >180 — Muito alta (red) */}
          <rect
            x={CHART_PADDING.left}
            y={CHART_PADDING.top}
            width={plotW}
            height={yForValue(THRESHOLD_ALTA) - CHART_PADDING.top}
            fill="#ef4444"
            fillOpacity={0.06}
          />

          {/* Threshold lines */}
          {[
            { val: THRESHOLD_BAIXA, color: '#f59e0b' },
            { val: THRESHOLD_NORMAL, color: '#10b981' },
            { val: THRESHOLD_ALTA, color: '#f97316' },
          ].map(({ val, color }) => (
            <line
              key={val}
              x1={CHART_PADDING.left}
              y1={yForValue(val)}
              x2={600 - CHART_PADDING.right}
              y2={yForValue(val)}
              stroke={color}
              strokeWidth={1}
              strokeDasharray="4 3"
              strokeOpacity={0.45}
            />
          ))}

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
        <LegendItem color="#f59e0b" label="Baixa" range="<70" />
        <LegendItem color="#10b981" label="Normal" range="70–140" />
        <LegendItem color="#f97316" label="Alta" range="140–180" />
        <LegendItem color="#ef4444" label="Muito alta" range=">180" />
      </div>
    </div>
  );
}

function LegendItem({ color, label, range }: { color: string; label: string; range: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
      {label} <span className="text-slate-400">({range})</span>
    </span>
  );
}
