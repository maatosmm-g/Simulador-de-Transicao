/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Users, TrendingDown, TrendingUp, Zap } from 'lucide-react';

import {
  INITIAL_PARAMETERS,
  MITIGATION_STRATEGIES,
  MODEL_CALIBRATION,
  SimulationParameters,
  MitigationStrategy,
} from '@/src/constants';

import { MetricCard } from '@/src/components/MetricCard';
import { OperationPanel } from '@/src/components/OperationPanel';
import { BaumolInsight } from '@/src/components/BaumolInsight';
import { ControlPanel } from '@/src/components/ControlPanel';
import { MitigationChecklist } from '@/src/components/MitigationChecklist';
import { FinancialImpact } from '@/src/components/FinancialImpact';
import { ScenarioTimeline } from '@/src/components/ScenarioTimeline';
import { InterlockingPanel } from '@/src/components/InterlockingPanel';

export default function App() {
  const [params, setParams] = useState<SimulationParameters>(() => ({
    ...INITIAL_PARAMETERS,
    targetHours: 44, // Começa na base de 44h para orientar a sequência passo a passo
  }));
  const [strategies, setStrategies] = useState<MitigationStrategy[]>(MITIGATION_STRATEGIES);

  const [lastValidHours, setLastValidHours] = useState<number>(44);
  const [currentHoursSelection, setCurrentHoursSelection] = useState<number>(44);
  const [isInterlocked, setIsInterlocked] = useState<boolean>(false);

  const SEQ = [44, 40, 39, 38, 37, 36];

  const handleTargetHoursChange = (newHours: number) => {
    const fromIdx = SEQ.indexOf(lastValidHours);
    const toIdx = SEQ.indexOf(newHours);
    
    if (fromIdx === -1 || toIdx === -1) return;

    const diff = Math.abs(fromIdx - toIdx);
    const isValidTransition = (diff === 1 || diff === SEQ.length - 1);

    setCurrentHoursSelection(newHours);

    if (isValidTransition) {
      setLastValidHours(newHours);
      setIsInterlocked(false);
      setParams(prev => ({ ...prev, targetHours: newHours }));
    } else {
      setIsInterlocked(true);
      setParams(prev => ({ ...prev, targetHours: newHours }));
    }
  };

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const results = useMemo(() => {
    const {
      INTENSITY_ABSORPTION, PEAK_HOURS_RATIO,
      ABANDONMENT_BASE, ABANDONMENT_SENSITIVITY, ABANDONMENT_CEIL,
      MAX_LOSS_RATIO, TAX_MULTIPLIER,
    } = MODEL_CALIBRATION;

    const baselineH = params.employeeCount * params.currentHours;
    const futureH = params.employeeCount * params.targetHours;
    const boost = strategies.reduce((acc, s) => acc + (s.active ? s.productivityBoost : 0), 0);

    const mitigatedH = futureH * (1 + boost);
    const deficitH = Math.max(0, baselineH - mitigatedH);
    const fteToHire = params.targetHours > 0 ? deficitH / params.targetHours : 0;

    // Atendimentos totais possíveis no cenário base
    const baselineAttendances = baselineH * params.avgProductivity;

    // Déficit efetivo após absorção por intensidade
    const effectiveDeficitH = Math.max(0, deficitH - (baselineH * INTENSITY_ABSORPTION));

    // Taxa de desistência progressiva
    const deficitPerEmployee = params.employeeCount > 0 ? effectiveDeficitH / params.employeeCount : 0;
    const abandonmentRate = Math.min(
      ABANDONMENT_CEIL,
      ABANDONMENT_BASE + (deficitPerEmployee * ABANDONMENT_SENSITIVITY)
    );

    const peakHoursLost = effectiveDeficitH * PEAK_HOURS_RATIO;
    const theoreticalLoss = peakHoursLost * params.avgProductivity;

    const realisticClientLoss = Math.min(
      theoreticalLoss * abandonmentRate,
      baselineAttendances * MAX_LOSS_RATIO
    );

    const isReduction = params.targetHours < params.currentHours;
    const clientLoss = isReduction ? Math.round(realisticClientLoss) : 0;

    const capacityRetention = baselineH > 0 ? (mitigatedH / baselineH) * 100 : 100;

    // 💰 Custo das mitigações ativas (mensal, equipe inteira)
    const activeMitigationCost = strategies.reduce(
      (acc, s) => acc + (s.active ? s.costPerEmployee * params.employeeCount : 0),
      0
    );

    // 👷 Custo unitário e total de contratação (já considerando FTE inteiro)
    const taxMultiplier = TAX_MULTIPLIER[params.taxRegime];
    const hiringUnitCost = params.avgSalary * taxMultiplier;
    const fteToHireRounded = Math.ceil(fteToHire);
    const totalHiringCost = fteToHireRounded * hiringUnitCost;

    return {
      baselineH,
      futureH,
      mitigatedH,
      deficitH: isReduction ? deficitH : 0,
      fteToHire: isReduction ? fteToHire : 0,
      fteToHireRounded: isReduction ? fteToHireRounded : 0,
      baselineAttendances,
      mitigatedAttendances: mitigatedH * params.avgProductivity,
      clientLoss,
      capacityRetention,
      totalBoost: boost * 100,
      activeMitigationCost,
      hiringUnitCost,
      totalHiringCost,
      abandonmentRate,
    };
  }, [params, strategies]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-600 selection:text-white p-3 sm:p-4 md:p-6">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
              Simulador de Transição
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium italic">
              Impacto da Jornada 44h · Análise Operacional e Estratégias de Mitigação
            </p>
          </div>

          {params.targetHours < params.currentHours && !isInterlocked ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "w-full md:w-auto rounded-xl px-4 py-2.5 flex items-center gap-3 border shadow-sm transition-colors",
                results.capacityRetention >= 98
                  ? "bg-emerald-50 border-emerald-200"
                  : results.capacityRetention >= 90
                    ? "bg-amber-50 border-amber-200"
                    : "bg-rose-50 border-rose-200"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full animate-pulse flex-shrink-0",
                results.capacityRetention >= 98
                  ? "bg-emerald-500"
                  : results.capacityRetention >= 90
                    ? "bg-amber-500"
                    : "bg-rose-500"
              )} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-wider",
                results.capacityRetention >= 98
                  ? "text-emerald-700"
                  : results.capacityRetention >= 90
                    ? "text-amber-700"
                    : "text-rose-700"
              )}>
                {results.capacityRetention >= 98
                  ? 'Impacto Mitigado'
                  : results.capacityRetention >= 90
                    ? 'Atenção Operacional'
                    : 'Cenário Crítico Identificado'}
              </span>
            </motion.div>
          ) : isInterlocked ? (
            <div className="w-full md:w-auto bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-rose-500 rounded-full flex-shrink-0 animate-ping" />
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-wider">
                Bloqueio: Salto de Etapa
              </span>
            </div>
          ) : (
            <div className="w-full md:w-auto bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-2 h-2 bg-slate-400 rounded-full flex-shrink-0" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                Cenário Base (44h)
              </span>
            </div>
          )}
        </header>

        {/* Bento Grid — Mobile-first com order */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

          {/* ANÁLISE CENTRAL — primeiro no mobile (order-1), centro no desktop */}
          <div className="order-2 md:order-2 md:col-span-6 space-y-4 md:space-y-6">
            {isInterlocked ? (
              <InterlockingPanel 
                lastValidHours={lastValidHours}
                currentHoursSelection={currentHoursSelection}
                onResume={handleTargetHoursChange}
              />
            ) : (
              <>
                <MetricCard
                  variant="hero"
                  title="Déficit Real de Atendimento"
                  value={`-${results.baselineH > 0 ? Math.round((results.deficitH / results.baselineH) * 100) : 0}%`}
                  subtitle={`A redução para ${params.targetHours}h remove ${Math.round(results.baselineH - results.futureH)} horas produtivas semanais da sua equipe sem mitigação tecnológica.`}
                  trend={`Capacidade Retida: ${results.capacityRetention.toFixed(1)}%`}
                />

                <FinancialImpact
                  lostClientsWeekly={results.clientLoss}
                  avgTicket={params.avgTicket}
                  monthlyHiringCost={results.hiringUnitCost}
                  totalHiringCost={results.totalHiringCost}
                  mitigationMonthlyCost={results.activeMitigationCost}
                  fteNeeded={results.fteToHireRounded}
                  currentHours={params.currentHours}
                  targetHours={params.targetHours}
                  grossMargin={params.grossMargin}
                />

                <OperationPanel
                  employeeCount={params.employeeCount}
                  targetHours={params.targetHours}
                />
              </>
            )}

            <ScenarioTimeline 
              params={params}
              strategies={strategies}
              lastValidHours={lastValidHours}
            />
          </div>

          {/* CONTROLES — order-1 no mobile (acima), esquerda no desktop */}
          <div className="order-1 md:order-1 md:col-span-3 flex flex-col gap-4 md:gap-6">
            <ControlPanel 
              params={params} 
              setParams={setParams} 
              lastValidHours={lastValidHours}
              isInterlocked={isInterlocked}
              currentHoursSelection={currentHoursSelection}
              onTargetHoursChange={handleTargetHoursChange}
            />
            <MitigationChecklist strategies={strategies} toggleStrategy={toggleStrategy} />
          </div>

          {/* MÉTRICAS DE DECISÃO — order-3 no mobile (final), direita no desktop */}
          <div className="order-3 md:order-3 md:col-span-3 space-y-4 md:space-y-6">
            <MetricCard
              title="Funcionários Equivalentes"
              value={`+${results.fteToHire.toFixed(1)}`}
              subtitle={`Para manter o nível de serviço. Arredondado: ${results.fteToHireRounded} contratações.`}
              trend="Cálculo baseado em FTE (Full Time Equivalent), equivalente a tempo integral"
              icon={Users}
              isLocked={isInterlocked}
            />

            <MetricCard
              variant="danger"
              title="Vendas em Risco"
              value={`-${Math.round(results.clientLoss)}`}
              subtitle="Filas aumentam, atendimento menos personalizado, queda na conversão de vendas, gerente/dono volta p/ o operacional."
              trend="A estrutura permanece, mas o impacto piora"
              icon={TrendingDown}
              isLocked={isInterlocked}
            />

            <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white flex flex-col justify-center relative overflow-hidden group border border-slate-800">
              <TrendingUp className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity" size={120} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <span className="p-1.5 bg-indigo-500 text-white rounded-lg shadow-lg">
                    <Zap size={14} fill="currentColor" />
                  </span>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">
                    Ganhos de Eficiência
                  </h3>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300 font-medium italic">
                  {isInterlocked ? (
                    "Selecione o cenário correto na sequência gradual para visualizar os ganhos de eficiência."
                  ) : (
                    <>Através das mitigações selecionadas, você recupera <span className="text-white font-black underline decoration-indigo-500 decoration-2 underline-offset-4">{results.totalBoost.toFixed(0)}%</span> da capacidade perdida.</>
                  )}
                </p>
                {results.activeMitigationCost > 0 && !isInterlocked && (
                  <p className="text-[11px] text-indigo-400 mt-4 font-black tracking-widest uppercase">
                    Custo adicional: <span className="text-white">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(results.activeMitigationCost)}
                    </span>
                  </p>
                )}
              </div>
            </div>

            <BaumolInsight />
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-10 md:mt-12 pt-6 md:pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 pb-[env(safe-area-inset-bottom)]">
          <span>Modelagem de Transição Operacional v2.1</span>
          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="hover:text-slate-600 transition-colors">Relatórios</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Metodologia</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Plano de Ação</a>
          </div>
        </footer>
      </div>
    </div>
  );
}