import { Target, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { SimulationParameters, MitigationStrategy, MODEL_CALIBRATION } from '@/src/constants';

interface SalesTargetCardProps {
  params: SimulationParameters;
  strategies: MitigationStrategy[];
  isLocked: boolean;
}

export function SalesTargetCard({ params, strategies, isLocked }: SalesTargetCardProps) {
  const { WEEKS_PER_MONTH } = MODEL_CALIBRATION;

  const fmtBR = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  // Amortecimento para cenários bloqueados por salto de etapa
  const effectiveTargetHours = isLocked ? 44 : params.targetHours;

  // Variáveis de cálculo semanal perfeitamente alinhadas ao motor central
  const baselineHours = params.employeeCount * params.currentHours;
  const currentTargetHours = params.employeeCount * effectiveTargetHours;

  const baselineSalesWeekly = baselineHours * params.avgProductivity * params.avgTicket * params.commercialEfficiency;
  const baselineSalesMonthly = baselineSalesWeekly * WEEKS_PER_MONTH; // Alinhado com as 4.3333 semanas reais

  // Densidade de vendas necessária por hora ativa para sustentar o faturamento base
  const baselineSalesPerHour = baselineHours > 0 ? baselineSalesWeekly / baselineHours : 0;
  const targetSalesPerHour = currentTargetHours > 0 ? baselineSalesWeekly / currentTargetHours : 0;
  
  // Aumento bruto de esforço comercial sem mitigações
  const percentageIncrease = effectiveTargetHours > 0 ? ((params.currentHours / effectiveTargetHours) - 1) * 100 : 0;

  // Ganho de produtividade das mitigações ativas
  const boost = strategies.reduce((acc, s) => acc + (s.active ? s.productivityBoost : 0), 0);
  const boostPercent = boost * 100;

  // Esforço comercial líquido ainda necessário (Após mitigações)
  const remainingSalesIncreasePercent = Math.max(
    0,
    ((targetSalesPerHour / (1 + boost)) - baselineSalesPerHour) / baselineSalesPerHour * 100
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 transition-all duration-300 relative overflow-hidden flex flex-col",
        isLocked ? "opacity-70 bg-slate-50" : ""
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={cn(
          "p-2 rounded-xl text-white shadow-sm",
          isLocked ? "bg-slate-400" : "bg-gradient-to-tr from-emerald-500 to-teal-500"
        )}>
          <Target size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Meta de Vendas por Escala</h3>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cenário: {effectiveTargetHours}h de jornada</p>
        </div>
      </div>

      {isLocked ? (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
            BLOQUEADO POR INTER-TRAVAMENTO
          </span>
          <p className="text-[11px] text-slate-400 font-medium">
            Siga a sequência gradual para analisar o faturamento projetado.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Faturamento Geral de Equilíbrio */}
          <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl flex justify-between items-center">
            <div>
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Faturamento mensal de equilíbrio
              </span>
              <span className="text-lg sm:text-xl font-black text-slate-800 tabular-nums">
                {fmtBR(baselineSalesMonthly)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Meta semanal
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-600 tabular-nums">
                {fmtBR(baselineSalesWeekly)}
              </span>
            </div>
          </div>

          {/* Exigência de Eficiência por Hora-Equipe */}
          <div className="space-y-3">
            <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Exigência de Eficiência Comercial (p/ Hora-Equipe):
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Sob Jornada {params.currentHours}h 
                </span>
                <span className="text-sm font-black text-slate-600 tabular-nums">
                  {fmtBR(baselineSalesPerHour)} <span className="text-[9px] font-medium text-slate-400">/ h</span>
                </span>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg">
                <span className="block text-[8px] font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Meta Real p/ {effectiveTargetHours}h
                </span>
                <span className="text-sm font-black text-emerald-700 tabular-nums">
                  {fmtBR(targetSalesPerHour)} <span className="text-[9px] font-medium text-emerald-500">/ h</span>
                </span>
              </div>
            </div>

            {/* Banners Informativos de Esforço */}
            <div className="space-y-2 mt-2">
              {percentageIncrease > 0 ? (
                <div className="flex flex-col gap-2 p-3 bg-indigo-50 border border-indigo-100/55 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <TrendingUp size={14} className="flex-shrink-0 animate-pulse text-indigo-500" />
                    <span className="font-black uppercase text-[10px] tracking-wider">Ajuste de Esforço Comercial</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-indigo-950 font-medium">
                    A compressão do tempo de jornada exige que sua equipe capture <span className="text-indigo-700 font-extrabold">+{percentageIncrease.toFixed(1)}%</span> mais vendas por hora trabalhada para compensar a redução de horas do expediente.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 bg-slate-50 border border-slate-100 p-3 rounded-xl text-[10px]">
                  <span>Cenário de referência ideal ({params.currentHours}h). Nenhuma compressão de tempo detectada.</span>
                </div>
              )}

              {/* Banner de Mitigações Ativas */}
              {percentageIncrease > 0 && (
                <div className="flex flex-col gap-2 p-3 bg-emerald-50 border border-emerald-100/50 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Zap size={13} className="text-emerald-500 animate-bounce" />
                    <span className="font-black uppercase text-[10px] tracking-wider">Impacto das Mitigações Selecionadas</span>
                  </div>
                  <div className="text-[10px] leading-relaxed text-emerald-900 font-medium space-y-1">
                    <div className="flex justify-between">
                      <span>Eficiência extra via tecnologia selecionada:</span>
                      <span className="font-extrabold text-emerald-700">+{boostPercent.toFixed(1)}% / hora</span>
                    </div>
                    <div className="flex justify-between border-t border-emerald-100/60 pt-1 mt-1 font-bold">
                      <span>Esforço líquido ainda necessário da equipe:</span>
                      <span className={cn(
                        "font-black",
                        remainingSalesIncreasePercent > 0 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {remainingSalesIncreasePercent === 0 
                          ? "✓ 0% - Compensado totalmente!" 
                          : `+${remainingSalesIncreasePercent.toFixed(1)}%`
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
