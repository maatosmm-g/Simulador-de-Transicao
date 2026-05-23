import { motion } from 'motion/react';
import { TrendingDown, CheckCircle2, XCircle, Coins, HeartCrack, Activity } from 'lucide-react';
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

  // Perda de margem de contribuição (o que realmente some do bolso do empresário)
  const weeklyLoss = safeLostClients * safeAvgTicket;
  const monthlyLoss = weeklyLoss * WEEKS_PER_MONTH;
  const monthlyProfitLoss = monthlyLoss * grossMargin;

  // Custo total da decisão = contratar + mitigações já ativas
  const totalDecisionCost = safeTotalHiring + mitigationMonthlyCost;

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

  // Viabilidade: lucrativo se a margem de contribuição recuperada cobre o custo total com margem de segurança de 20%
  const shouldHire = monthlyProfitLoss > (totalDecisionCost * HIRE_SAFETY_MARGIN);
  const coversBareMinimum = monthlyProfitLoss > totalDecisionCost;

  if (!isReduction) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 sm:p-6 bg-slate-900 border-2 border-slate-800 rounded-2xl shadow-xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <h4 className="text-sm font-black text-white mb-5 flex items-center gap-3 uppercase tracking-tight">
          <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <CheckCircle2 size={16} />
          </span>
          Equilíbrio Operacional Mantido
        </h4>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-emerald-500 text-slate-900 rounded-full p-2.5 mb-3">
            <CheckCircle2 size={24} />
          </div>
          <h5 className="text-base font-black text-white uppercase tracking-tight mb-1">
            Capacidade Adequada
          </h5>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
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
      className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <h4 className="text-sm font-black text-white mb-6 flex items-center gap-3 uppercase tracking-tight">
        <span className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
          <Coins size={16} />
        </span>
        Impacto Direto no seu Caixa (Margem Projetada)
      </h4>

      {/* Grid containing the 3 clear visual pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Pilar 1: O que some do bolso */}
        <div className="bg-white/[0.03] rounded-xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-rose-400">
              <HeartCrack size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Lucro Líquido Perdido
              </span>
            </div>
            
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-1">
              Perda mensal de margem:
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight mt-2 mb-3 tabular-nums">
              -{currencyFormatter.format(monthlyProfitLoss)}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Vendas que deixam de acontecer convertidas em margem de caixa direta que some do seu saldo líquido final.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1 text-[10px]">
            <div className="flex justify-between font-bold text-slate-400 uppercase">
              <span>Perda Faturamento:</span>
              <span className="text-slate-200 tabular-nums">{currencyFormatter.format(monthlyLoss)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-400 uppercase">
              <span>Vendas Perdidas:</span>
              <span className="text-slate-200 tabular-nums">{Math.round(safeLostClients * WEEKS_PER_MONTH)} / mês</span>
            </div>
          </div>
        </div>

        {/* Pilar 2: Custo da Solução */}
        <div className="bg-white/[0.03] rounded-xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Activity size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Custo de Resolução
              </span>
            </div>

            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-1">
              Custo total do investimento:
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 mb-3 tabular-nums">
              {currencyFormatter.format(totalDecisionCost)}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Despesas adicionais para cobrir o buraco de horas criadas pela redução de tempo com equipe ou tecnologia.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1 text-[10px]">
            <div className="flex justify-between font-bold text-slate-400 uppercase">
              <span>Contratação ({fteNeeded}x):</span>
              <span className="text-slate-200 tabular-nums">{currencyFormatter.format(safeTotalHiring)}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-400 uppercase">
              <span>Mitigações / Tech:</span>
              <span className="text-slate-200 tabular-nums">{currencyFormatter.format(mitigationMonthlyCost)}</span>
            </div>
          </div>
        </div>

        {/* Pilar 3: Diagnóstico de Viabilidade */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${
          shouldHire
            ? 'bg-emerald-500/[0.04] border-emerald-500/20 text-emerald-400'
            : 'bg-rose-500/[0.04] border-rose-500/20 text-rose-400'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              {shouldHire ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
              <span className="text-[10px] font-black uppercase tracking-wider">
                Veredito Financeiro
              </span>
            </div>

            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none mt-1">
              Opção Recomendada:
            </span>
            <div className={`text-xl sm:text-2xl font-black tracking-tight mt-2 mb-3 uppercase ${
              shouldHire ? 'text-emerald-400 animate-pulse' : 'text-rose-400'
            }`}>
              {shouldHire ? 'Viável Contratar' : 'Revisar Operação'}
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              {shouldHire
                ? 'Lucrativo. A margem recuperada ao restabelecer o atendimento supera as novas despesas com folga segura de 20%.'
                : coversBareMinimum
                  ? 'Marginal. A margem recuperada cobre o custo bruto, mas sem folga de segurança. Recomenda-se cautela ou automação adicional.'
                  : 'Prejudicial. O faturamento recuperado não compensa os custos extras de pessoal. Foque em software ou reorganização produtiva.'
              }
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 text-[10px] text-slate-400 font-bold uppercase tracking-wider text-right italic">
            * Margem aplicada: {Math.round(grossMargin * 100)}%
          </div>
        </div>

      </div>

      {/* Bottom informational details */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${shouldHire ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          <span>Fórmula de análise automatizada parametrizada com o Efeito Baumol</span>
        </div>
        <div className="text-slate-400">
          Cenário: {currentHours}h ➜ {targetHours}h
        </div>
      </div>
    </motion.div>
  );
}
