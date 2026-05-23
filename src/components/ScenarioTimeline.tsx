import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Clock, TrendingUp } from 'lucide-react';
import { SimulationParameters, MitigationStrategy, MODEL_CALIBRATION } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface ScenarioTimelineProps {
  params: SimulationParameters;
  strategies: MitigationStrategy[];
  lastValidHours: number;
}

export function ScenarioTimeline({ params, strategies, lastValidHours }: ScenarioTimelineProps) {
  const { INTENSITY_ABSORPTION } = MODEL_CALIBRATION;

  // Lista estática e imutável para garantir previsibilidade e comparação visual completa
  const scenarios = useMemo(() => [44, 40, 39, 38, 37, 36], []);

  const timelineData = useMemo(() => {
    const boost = strategies.reduce((acc, s) => acc + (s.active ? s.productivityBoost : 0), 0);

    return scenarios.map(hours => {
      // 1. Aplicação rigorosa do Efeito Baumol para cálculo de perda horária real (Não-Linear)
      const rawLossFactor = hours < 44 ? Math.pow((44 - hours) / 44, INTENSITY_ABSORPTION) : 0;
      
      // O ganho de eficiência das ferramentas atenua esse fator de perda
      const mitigatedLossFactor = Math.max(0, rawLossFactor * (1 - boost));
      const deficitPercent = mitigatedLossFactor * 100;

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
  }, [scenarios, strategies, INTENSITY_ABSORPTION]);

  // Cálculo dinâmico dos pontos do SVG Sparkline baseado na matriz fixa de cenários
  const chartWidth = 200;
  const chartHeight = 40;
  
  const points = useMemo(() => {
    // Encontra o teto máximo de déficit para normalizar o eixo Y do Sparkline de forma proporcional
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
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Timeline de Cenários</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">
              Status de degradação operacional comparada
            </p>
          </div>
        </div>
        
        {/* Sparkline Micro Chart Dinâmico */}
        <div className="hidden sm:block">
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            <path
              d={`M ${points}`}
              fill="none"
              stroke="#6366f1"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {timelineData.map((d, i) => {
              const maxDeficit = Math.max(...timelineData.map(t => t.deficit), 1);
              const x = (i / (timelineData.length - 1)) * chartWidth;
              const y = chartHeight - (d.deficit / maxDeficit) * chartHeight;
              const isSelected = d.hours === lastValidHours;

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

      {/* Tabela de Cenários */}
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
              const isSelected = d.hours === lastValidHours;

              return (
                <tr 
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Insight Footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
        <TrendingUp size={14} className="text-slate-400" />
        <p className="text-[10px] text-slate-500 font-medium leading-tight">
          Déficit não-linear estruturado com amortecimento elástico via Efeito Baumol e atenuantes de eficiência ativa.
        </p>
      </div>
    </div>
  );
}