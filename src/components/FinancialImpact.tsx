import { motion } from 'motion/react';
import { TrendingDown, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { MODEL_CALIBRATION } from '@/src/constants';

interface FinancialImpactProps {
  lostClientsWeekly: number;
  avgTicket: number;
  monthlyHiringCost: number;       // custo de 1 colaborador
  totalHiringCost?: number;        // custo de TODAS as contratações necessárias
  mitigationMonthlyCost?: number;  // soma das mitigações ativas (mês)
  fteNeeded?: number;              // nº inteiro de contratações
  currentHours: number;
  targetHours: number;
  grossMargin?: number;
}

export function FinancialImpact({
  lostClientsWeekly,
  avgTicket,
  monthlyHiringCost,
  totalHiringCost,
  mitigationMonthlyCost = 0,
  fteNeeded = 1,
  currentHours,
  targetHours,
  grossMargin = 0.40,
}: FinancialImpactProps) {
  const isReduction = targetHours < currentHours;
  const safeLostClients = Math.max(0, lostClientsWeekly || 0);
  const safeAvgTicket = Math.max(0, avgTicket || 0);
  const safeUnitHiring = Math.max(0, monthlyHiringCost || 0);
  const safeTotalHiring = totalHiringCost ?? (safeUnitHiring * Math.max(1, fteNeeded));

  const { WEEKS_PER_MONTH, HIRE_SAFETY_MARGIN } = MODEL_CALIBRATION;

  // Perda de faturamento bruto
  const weeklyLoss = safeLostClients * safeAvgTicket;
  const monthlyLoss = weeklyLoss * WEEKS_PER_MONTH;

  // Perda de margem de contribuição (o que realmente importa)
  const monthlyProfitLoss = monthlyLoss * grossMargin;

  // Custo total da decisão = contratar + mitigações já ativas
  const totalDecisionCost = safeTotalHiring + mitigationMonthlyCost;

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

  // Viável SE a margem de contribuição perdida cobre o custo total com 20% de folga
  const shouldHire = monthlyProfitLoss > (totalDecisionCost * HIRE_SAFETY_MARGIN);
  const coversBareMinimum = monthlyProfitLoss > totalDecisionCost;

  if (!isReduction) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 sm:p-6 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <h4 className="text-base sm:text-lg font-black text-white mb-5 flex items-center gap-3 uppercase tracking-tight">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle2 size={20} />
          </span>
          Equilíbrio Operacional Mantido
        </h4>
        <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white/5 rounded-xl border border-white/10 text-center">
          <div className="bg-emerald-500 text-slate-900 rounded-full p-3 mb-4">
            <CheckCircle2 size={36} />
          </div>
          <h5 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight mb-2">
            Capacidade Adequada
          </h5>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Sua jornada atual de <span className="text-white font-bold">{currentHours}h</span> está dimensionada para a demanda.
            Não há déficit de atendimento identificado.
          </p>
        </div>
      </motion.div>
    );
  }

  if (safeLostClients <= 0 && mitigationMonthlyCost === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 sm:p-6 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

      <h4 className="text-base sm:text-lg font-black text-white mb-5 flex items-center gap-3 uppercase tracking-tight">
        <span className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
          <TrendingDown size={20} />
        </span>
        Impacto Direto no seu Caixa
      </h4>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

        {/* Coluna 1: Perda */}
        <div className="bg-white/5 rounded-xl p-5 sm:p-6 border border-white/10 hover:border-rose-500/30 transition-colors flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-rose-400">
              <TrendingDown size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                Perda Projetada
              </span>
            </div>

            <div className="flex items-baseline gap-3 sm:gap-4 mb-4 flex-wrap">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tabular-nums">
                {currencyFormatter.format(weeklyLoss)}
              </div>
              <div className="text-xs text-slate-500 font-medium italic">por semana</div>
            </div>

            <div className="flex flex-col gap-3 py-4 sm:py-5 border-y border-white/5">
              <div className="flex items-center gap-4">
                <div className="text-2xl sm:text-3xl font-black text-white tabular-nums">
                  {safeLostClients}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-indigo-500/30 pb-0.5 mb-0.5">
                    Vendas Perdidas
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    Equivalente por semana
                  </span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-slate-500 italic">
                * Ticket médio: {currencyFormatter.format(safeAvgTicket)}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-tighter">
                Faturamento Perdido/mês
              </span>
              <span className="text-white font-black tabular-nums">
                {currencyFormatter.format(monthlyLoss)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs gap-2">
              <span className="text-slate-400 font-bold uppercase tracking-tighter">
                Margem de Contribuição/mês
              </span>
              <span className="text-rose-400 font-black tabular-nums">
                {currencyFormatter.format(monthlyProfitLoss)}
              </span>
            </div>
          </div>
        </div>

        {/* Coluna 2: Decisão */}
        <div className="bg-white/5 rounded-xl p-5 sm:p-6 border border-white/10 hover:border-emerald-500/30 transition-colors flex flex-col">
          <div className="flex items-center gap-2 mb-5 text-indigo-400">
            <AlertCircle size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
              Análise de Viabilidade
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Margem em Risco
              </span>
              <span className="text-sm font-black text-rose-400 tabular-nums">
                {currencyFormatter.format(monthlyProfitLoss)}
              </span>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                Contratar {fteNeeded}×
              </span>
              <span className="text-sm font-black text-white tabular-nums">
                {currencyFormatter.format(safeTotalHiring)}
              </span>
            </div>
            {mitigationMonthlyCost > 0 && (
              <>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Mitigações Ativas
                  </span>
                  <span className="text-sm font-black text-amber-400 tabular-nums">
                    {currencyFormatter.format(mitigationMonthlyCost)}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Custo Total
                  </span>
                  <span className="text-sm font-black text-white tabular-nums">
                    {currencyFormatter.format(totalDecisionCost)}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className={`flex-1 p-5 sm:p-6 rounded-2xl text-center border-2 shadow-inner flex flex-col items-center justify-center ${
            shouldHire
              ? 'bg-emerald-500/5 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-500/5 border-rose-500/40 text-rose-400'
          }`}>
            <div className="flex justify-center mb-3">
              {shouldHire
                ? <div className="bg-emerald-500 text-slate-900 rounded-full p-2.5 shadow-lg shadow-emerald-500/20"><CheckCircle2 size={28} /></div>
                : <div className="bg-rose-500 text-white rounded-full p-2.5 shadow-lg shadow-rose-500/20"><XCircle size={28} /></div>
              }
            </div>

            <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">
              Recomendação Final
            </div>

            <div className="text-lg sm:text-xl font-black leading-none mb-3 uppercase tracking-tighter">
              {shouldHire ? 'Viável Contratar' : 'Revisar Operação'}
            </div>

            <p className="text-[11px] font-medium leading-relaxed max-w-[260px] mx-auto text-slate-300">
              {shouldHire
                ? `A margem recuperada cobre o custo total (${currencyFormatter.format(totalDecisionCost)}) com folga superior a 20%.`
                : coversBareMinimum
                  ? `A margem cobre o custo bruto (${currencyFormatter.format(totalDecisionCost)}), mas sem folga de segurança suficiente.`
                  : `O custo total (${currencyFormatter.format(totalDecisionCost)}) excede a margem recuperada. Avalie reduzir mitigações ou ajustar metas.`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${shouldHire ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <p className="text-[11px] font-bold text-slate-400">
            Margem de contribuição: <span className="text-white">{Math.round(grossMargin * 100)}%</span>
          </p>
        </div>
        <div className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
          Efeito Baumol
        </div>
      </div>
    </motion.div>
  );
}
