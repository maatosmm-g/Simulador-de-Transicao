import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, TrendingUp } from 'lucide-react';
import { SimulationParameters, MitigationStrategy, MODEL_CALIBRATION } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface ScenarioTimelineProps {
  params: SimulationParameters;
  strategies: MitigationStrategy[];
  lastValidHours: number;
  currentHoursSelection: number;
}

export function ScenarioTimeline({ params, strategies, lastValidHours, currentHoursSelection }: ScenarioTimelineProps) {
  const { INTENSITY_ABSORPTION } = MODEL_CALIBRATION;

  // Lista sequencial estática para guiar a progressão visual
  const SEQ = useMemo(() => [44, 40, 39, 38, 37, 36], []);

  const timelineData = useMemo(() => {
    const boost = strategies.reduce((acc, s) => acc + (s.active ? s.productivityBoost : 0), 0);

    // Encontra até onde o usuário já avançou na meta de transição
    // Usamos lastValidHours ou currentHoursSelection para travar o progresso na última etapa segura
    const limitIndex = SEQ.indexOf(currentHoursSelection);
    const visibleScenarios = limitIndex !== -1 ? SEQ.slice(0, limitIndex + 1) : [44];

    return visibleScenarios.map(hours => {
      // 1. Sincronização Matemática Perfeita com o Motor do App.tsx
      const baselineH = params.employeeCount * 44;
      const futureH = params.employeeCount * hours;
      const mitigatedH = futureH * (1 + boost);
      
      // Cálculo exato da retenção (%) idêntico ao do App.tsx
      const capacityRetention = baselineH > 0 ? (mitigatedH / baselineH) * 100 : 100;
      
      // O Déficit Real é o complemento da capacidade que foi retida/salva
      const deficitPercent = Math.max(0, 100 - capacityRetention);

      // 2. Cálculo do ajuste necessário de esforço comercial por hora ativa
      const rawIncrease = hours > 0 ? ((44 / hours) - 1) * 100 : 0;
      const remainingIncrease = hours > 0 ? (((44 / hours) / (1 + boost)) - 1) * 100 : 0;
      
      let label = "Equilíbrio Base";
      let color = "text-slate-400 border-slate-200 bg-slate-50";
      let bgColor = "bg-slate-400";
      
      if (hours === 44) {
        label = "Equilíbrio Base";
        color = "text-slate-400 border-slate-200 bg-slate-50";
        bgColor = "bg-slate-400";
      } else if (hours === 40) {
        label = "Leve Pressão";
        color = "text-emerald-500 border-emerald-100 bg-emerald-50";
        bgColor = "bg-emerald-500";
      } else if (hours === 39) {
        label = "Déficit Moderado";
        color = "text-amber-500 border-amber-100 bg-amber-50";
        bgColor = "bg-amber-500";
      } else {
        label = "Operação Crítica";
        color = "text-rose-500 border-rose-100 bg-rose-50";
        bgColor = "bg-rose-500";
      }

      return {
        hours,
        deficit: Math.round(deficitPercent),
        rawIncrease: Math.round(rawIncrease),
        remainingIncrease: Math.max(0, Math.round(remainingIncrease)),
        label,
        color,
        bgColor
      };
    });
  }, [SEQ, params.employeeCount, strategies, currentHoursSelection]);

  // Parâmetros do minichart (Sparkline)
  const chartWidth = 200;
  const chartHeight = 40;
  
  const points = useMemo(() => {
    if (timelineData.length <= 1) return "0,20 200,20"; // Linha reta estável se só houver 44h ativa
    const maxDeficit = Math.max(...timelineData.map(d => d.deficit), 1);
    
    return timelineData.map((d, i) => {
      const x = (i / (timelineData.length - 1)) * chartWidth;
      const y = chartHeight - (d.deficit / maxDeficit) * chartHeight;
      return `${x},${y}`;
    }).join(' ');
  }, [timelineData]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Timeline Gradativo de Transição</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
              Etapas reveladas de acordo com a meta de jornada selecionada
            </p>
          </div>
        </div>
        
        {/* Sparkline Dinâmico */}
        <div className="hidden sm:block">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {timelineData.length > 1 && (
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                d={`M ${points}`}
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {timelineData.map((d, i) => {
              const maxDeficit = Math.max(...timelineData.map(t => t.deficit), 1);
              const x = timelineData.length > 1 ? (i / (timelineData.length - 1)) * chartWidth : 0;
              const y = chartHeight - (d.deficit / maxDeficit) * chartHeight;
              const isSelected = d.hours === currentHoursSelection;

              return (
                <circle
                  key={d.hours}
                  cx={x}
                  cy={y}
                  r={isSelected ? "5" : "3.5"}
                  className={cn(
                    "fill-white stroke-2 transition-all duration-300",
                    isSelected ? "stroke-indigo-600 fill-indigo-50 shadow-sm" : "stroke-slate-300"
                  )}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Tabela Progressiva */}
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-3 px-5 sm:px-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jornada</th>
              <th className="pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status Operacional</th>
              <th className="pb-3 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Déficit Real</th>
              <th className="pb-3 px-5 sm:px-0 text-[10px] font-black text-indigo-500 uppercase tracking-widest text-right">Meta de Esforço / Hora</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {timelineData.map((d) => {
              const isSelected = d.hours === currentHoursSelection;

              return (
                <motion.tr 
                  layout
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={d.hours} 
                  className={cn(
                    "group transition-colors duration-200",
                    isSelected ? "bg-indigo-50/60 font-medium" : "hover:bg-slate-50/50"
                  )}
                >
                  <td className="py-3 px-5 sm:px-0">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full transition-transform", d.bgColor, isSelected && "scale-125 animate-pulse")} />
                      <span className={cn(
                        "text-xs tabular-nums font-bold",
                        isSelected ? "text-indigo-600 font-black scale-105" : "text-slate-600"
                      )}>
                        {d.hours}h
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm",
                      d.color
                    )}>
                      {d.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={cn(
                      "text-xs font-black tabular-nums",
                      d.deficit > 0 ? "text-rose-500" : "text-emerald-500"
                    )}>
                      {d.deficit === 0 ? "0%" : `-${d.deficit}%`}
                    </span>
                  </td>
                  <td className="py-3 px-5 sm:px-0 text-right">
                    <div className="flex flex-col items-end">
                      <span className={cn(
                        "text-xs font-black tabular-nums",
                        d.remainingIncrease > 0 ? "text-indigo-600" : "text-emerald-600"
                      )}>
                        {d.remainingIncrease === 0 ? "✓ 0% (Compensado!)" : `+${d.remainingIncrease}%`}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">
                        Sem Tech: +{d.rawIncrease}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
        <TrendingUp size={14} className="text-slate-400" />
        <p className="text-[10px] text-slate-500 font-medium leading-tight">
          Visualização em cascata ativada. Novas faixas de impacto surgem dinamicamente conforme o avanço do cronograma de transição.
        </p>
      </div>
    </div>
  );
}