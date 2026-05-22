import { useMemo } from 'react';
import { motion } from 'motion/react';
import { AreaChart, TrendingDown, Clock } from 'lucide-react';
import { SimulationParameters, MitigationStrategy, MODEL_CALIBRATION } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface ScenarioTimelineProps {
  params: SimulationParameters;
  strategies: MitigationStrategy[];
  lastValidHours: number;
}

export function ScenarioTimeline({ params, strategies, lastValidHours }: ScenarioTimelineProps) {
  const { INTENSITY_ABSORPTION } = MODEL_CALIBRATION;

  const scenarios = [44, 40, 39, 38, 37, 36];

  const timelineData = useMemo(() => {
    const baselineH = params.employeeCount * 44;
    const boost = strategies.reduce((acc, s) => acc + (s.active ? s.productivityBoost : 0), 0);

    const currentIndex = scenarios.indexOf(lastValidHours);
    const activeScenarios = scenarios.slice(0, currentIndex + 1);

    return activeScenarios.map(hours => {
      const futureH = params.employeeCount * hours;
      const mitigatedH = futureH * (1 + boost);
      const deficitH = Math.max(0, baselineH - mitigatedH);
      const deficitPercent = baselineH > 0 ? (deficitH / baselineH) * 100 : 0;
      
      let label = "Equilíbrio";
      let color = "text-emerald-500";
      let bgColor = "bg-emerald-500";
      
      if (hours === 44) {
        label = "Equilíbrio";
        color = "text-slate-400";
        bgColor = "bg-slate-400";
      } else if (hours === 40) {
        label = "Leve Pressão";
        color = "text-emerald-500";
        bgColor = "bg-emerald-500";
      } else if (hours === 39) {
        label = "Déficit Moderado";
        color = "text-amber-500";
        bgColor = "bg-amber-500";
      } else if (hours <= 38) {
        label = "Operação Crítica";
        color = "text-rose-500";
        bgColor = "bg-rose-500";
      }

      return {
        hours,
        deficit: Math.round(deficitPercent),
        label,
        color,
        bgColor
      };
    });
  }, [params, strategies]);

  // SVG Sparkline calculation
  const chartWidth = 200;
  const chartHeight = 40;
  const points = timelineData.map((d, i) => {
    const x = timelineData.length > 1 ? (i / (timelineData.length - 1)) * chartWidth : 0;
    // Map deficit (0-30%) to height (0-chartHeight)
    const y = chartHeight - (Math.min(d.deficit, 30) / 30) * chartHeight;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Timeline de Cenários</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Status de déficit por jornada</p>
          </div>
        </div>
        
        {/* Sparkline Micro Chart */}
        <div className="hidden sm:block">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {timelineData.length > 1 && (
              <path
                d={`M ${points}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {timelineData.map((d, i) => {
              const x = timelineData.length > 1 ? (i / (timelineData.length - 1)) * chartWidth : 0;
              const y = chartHeight - (Math.min(d.deficit, 30) / 30) * chartHeight;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  className={cn("fill-white stroke-2", d.hours === lastValidHours ? "stroke-indigo-600 r-5" : "stroke-slate-300")}
                />
              );
            })}
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 px-5 sm:px-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jornada</th>
              <th className="pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="pb-3 px-5 sm:px-0 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Déficit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {timelineData.map((d) => (
              <tr 
                key={d.hours} 
                className={cn(
                  "group transition-colors",
                  d.hours === lastValidHours ? "bg-indigo-50/50" : "hover:bg-slate-50/50"
                )}
              >
                <td className="py-3 px-5 sm:px-0">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1.5 h-1.5 rounded-full", d.bgColor)} />
                    <span className={cn(
                      "text-xs tabular-nums font-black",
                      d.hours === lastValidHours ? "text-indigo-600" : "text-slate-600"
                    )}>
                      {d.hours}h
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-100 shadow-sm",
                    d.color
                  )}>
                    {d.label}
                  </span>
                </td>
                <td className="py-3 px-5 sm:px-0 text-right">
                  <span className={cn(
                    "text-xs font-black tabular-nums",
                    d.deficit > 0 ? "text-rose-500" : "text-emerald-500"
                  )}>
                    {d.deficit === 0 ? "0%" : `-${d.deficit}%`}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Insight Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
        <TrendingDown size={14} className="text-slate-400" />
        <p className="text-[10px] text-slate-500 font-medium leading-tight">
          O déficit é calculado comparando a capacidade atual (44h) vs a jornada meta com as mitigações ativas aplicadas.
        </p>
      </div>
    </div>
  );
}
