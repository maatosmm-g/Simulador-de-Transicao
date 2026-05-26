/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { Users, TrendingDown, DollarSign } from 'lucide-react';

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
import { VisualManagementCard } from '@/src/components/VisualManagementCard';
import { ControlPanel } from '@/src/components/ControlPanel';
import { MitigationChecklist } from '@/src/components/MitigationChecklist';
import { FinancialImpact } from '@/src/components/FinancialImpact';
import { ScenarioTimeline } from '@/src/components/ScenarioTimeline';
import { InterlockingPanel } from '@/src/components/InterlockingPanel';
import { SalesTargetCard } from '@/src/components/SalesTargetCard';

export default function App() {
  const [params, setParams] = useState<SimulationParameters>(() => {
    try {
      const saved = localStorage.getItem('sim_44h_params');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.employeeCount === 'number') {
          return {
            ...INITIAL_PARAMETERS,
            ...parsed,
          };
        }
      }
    } catch (e) {
      console.error('Falha ao ler parâmetros do localStorage', e);
    }
    return {
      ...INITIAL_PARAMETERS,
      targetHours: 44, // Começa na base de 44h para orientar a sequência passo a passo
    };
  });

  const [strategies, setStrategies] = useState<MitigationStrategy[]>(() => {
    try {
      const saved = localStorage.getItem('sim_44h_strategies');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === MITIGATION_STRATEGIES.length) {
          // Mantém as definições originais (metadados) e sincroniza apenas se estavam ativas
          return MITIGATION_STRATEGIES.map(st => {
            const found = parsed.find((s: any) => s.id === st.id);
            return {
              ...st,
              active: found ? !!found.active : st.active,
            };
          });
        }
      }
    } catch (e) {
      console.error('Falha ao ler estratégias do localStorage', e);
    }
    return MITIGATION_STRATEGIES;
  });

  const [lastValidHours, setLastValidHours] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sim_44h_last_valid_hours');
      if (saved) {
        const parsed = parseInt(saved);
        if ([44, 42, 40, 39, 38, 37, 36].includes(parsed)) return parsed;
      }
    } catch (e) {}
    return params.targetHours ?? 44;
  });

  const [currentHoursSelection, setCurrentHoursSelection] = useState<number>(params.targetHours ?? 44);
  const [isInterlocked, setIsInterlocked] = useState<boolean>(false);

  // Efeitos para persistência
  useEffect(() => {
    try {
      localStorage.setItem('sim_44h_params', JSON.stringify(params));
    } catch (e) {
      console.error('Erro ao gravar params no localStorage', e);
    }
  }, [params]);

  useEffect(() => {
    try {
      localStorage.setItem('sim_44h_strategies', JSON.stringify(strategies));
    } catch (e) {
      console.error('Erro ao gravar estratégias no localStorage', e);
    }
  }, [strategies]);

  useEffect(() => {
    try {
      localStorage.setItem('sim_44h_last_valid_hours', lastValidHours.toString());
    } catch (e) {}
  }, [lastValidHours]);

  const SEQ = [44, 42, 40, 39, 38, 37, 36];

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

  const toggleStrategy = (id: MitigationStrategy['id']) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleReset = () => {
    try {
      localStorage.removeItem('sim_44h_params');
      localStorage.removeItem('sim_44h_strategies');
      localStorage.removeItem('sim_44h_last_valid_hours');
    } catch (e) {}
    setParams({
      ...INITIAL_PARAMETERS,
      targetHours: 44,
    });
    setStrategies(MITIGATION_STRATEGIES.map(s => ({ ...s, active: false })));
    setLastValidHours(44);
    setCurrentHoursSelection(44);
    setIsInterlocked(false);
  };

  const results = useMemo(() => {
    const {
      INTENSITY_ABSORPTION, PEAK_HOURS_RATIO,
      ABANDONMENT_BASE, ABANDONMENT_SENSITIVITY, ABANDONMENT_CEIL,
      MAX_LOSS_RATIO, TAX_MULTIPLIER, WEEKS_PER_MONTH,
    } = MODEL_CALIBRATION;

    // Se estiver bloqueado por salto de etapa, forçamos os resultados operacionais a refletirem a última zona segura
    const effectiveTargetHours = isInterlocked ? lastValidHours : params.targetHours;

    const baselineH = params.employeeCount * params.currentHours;
    const futureH = params.employeeCount * effectiveTargetHours;
    const boost = strategies.reduce((acc, s) => acc + (s.active ? s.productivityBoost : 0), 0);

    const mitigatedH = futureH * (1 + boost);
    const deficitH = Math.max(0, baselineH - mitigatedH);
    const fteToHire = effectiveTargetHours > 0 ? deficitH / effectiveTargetHours : 0;

    // Atendimentos totais possíveis no cenário base (Semanal)
    const baselineAttendances = baselineH * params.avgProductivity;

    // Déficit efetivo após absorção por intensidade
    const effectiveDeficitH = Math.max(0, deficitH - (baselineH * INTENSITY_ABSORPTION));

    // Taxa de desistência progressiva ajustada pelo Baumol Elástico
    const deficitPerEmployee = params.employeeCount > 0 ? effectiveDeficitH / params.employeeCount : 0;
    const abandonmentRate = Math.min(
      ABANDONMENT_CEIL,
      ABANDONMENT_BASE + (deficitPerEmployee * ABANDONMENT_SENSITIVITY)
    );

    const peakHoursLost = effectiveDeficitH * PEAK_HOURS_RATIO;
    const theoreticalLoss = peakHoursLost * params.avgProductivity;

    const realisticClientLossWeekly = Math.min(
      theoreticalLoss * abandonmentRate,
      baselineAttendances * MAX_LOSS_RATIO
    );

    const isReduction = effectiveTargetHours < params.currentHours;
    
    // Converte a perda semanal de clientes diretamente para a base mensal exigida pelas interfaces
    const clientLoss = isReduction ? Math.round(realisticClientLossWeekly * WEEKS_PER_MONTH) : 0;

    // --- Cálculo RAW (Sem mitigações) convertido para base mensal ---
    const deficitHRaw = isReduction ? Math.max(0, baselineH - futureH) : 0;
    const effectiveDeficitHRaw = Math.max(0, deficitHRaw - (baselineH * INTENSITY_ABSORPTION));
    const deficitPerEmployeeRaw = params.employeeCount > 0 ? effectiveDeficitHRaw / params.employeeCount : 0;
    const abandonmentRateRaw = Math.min(
      ABANDONMENT_CEIL,
      ABANDONMENT_BASE + (deficitPerEmployeeRaw * ABANDONMENT_SENSITIVITY)
    );
    const peakHoursLostRaw = effectiveDeficitHRaw * PEAK_HOURS_RATIO;
    const theoreticalLossRaw = peakHoursLostRaw * params.avgProductivity;
    const realisticClientLossRawWeekly = Math.min(
      theoreticalLossRaw * abandonmentRateRaw,
      baselineAttendances * MAX_LOSS_RATIO
    );
    const clientLossRaw = isReduction ? Math.round(realisticClientLossRawWeekly * WEEKS_PER_MONTH) : 0;

    const capacityRetention = baselineH > 0 ? (mitigatedH / baselineH) * 100 : 100;

    // 💰 Custo das mitigações ativas (mensal, equipe inteira)
    const activeMitigationCost = strategies.reduce(
      (acc, s) => acc + (s.active ? s.costPerEmployee * params.employeeCount : 0),
      0
    );

    // 👷 Custo unitário e total de contratação (FTE)
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
      clientLossRaw,
      capacityRetention,
      totalBoost: boost * 100,
      activeMitigationCost,
      hiringUnitCost,
      totalHiringCost,
      abandonmentRate,
    };
  }, [params, strategies, isInterlocked, lastValidHours]);

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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">

          {/* ANÁLISE CENTRAL */}
          <div className="order-2 md:order-2 md:col-span-6 space-y-4 md:space-y-6">
            {isInterlocked ? (
              <div className="space-y-4 md:space-y-6">
                <InterlockingPanel 
                  lastValidHours={lastValidHours}
                  currentHoursSelection={currentHoursSelection}
                  onResume={handleTargetHoursChange}
                />
                <SalesTargetCard 
                  params={params}
                  strategies={strategies}
                  isLocked={true}
                />
              </div>
            ) : (
              <>
                <MetricCard
                  variant="hero"
                  title="Déficit Real de Atendimento"
                  value={`-${results.baselineH > 0 ? Math.round((results.deficitH / results.baselineH) * 100) : 0}%`}
                  subtitle={`A redução para ${params.targetHours}h remove ${Math.round(results.baselineH - results.futureH)} horas produtivas semanais da sua equipe sem mitigação tecnológica.`}
                  trend={`Capacidade Retida: ${results.capacityRetention.toFixed(1)}%`}
                />

                <VisualManagementCard 
                  targetHours={params.targetHours}
                  isInterlocked={isInterlocked}
                  lastValidHours={lastValidHours}
                  totalBoost={results.totalBoost}
                  employeeCount={params.employeeCount}
                  clientLoss={results.clientLoss}
                  capacityRetention={results.capacityRetention}
                />

                <OperationPanel
                  employeeCount={params.employeeCount}
                  targetHours={params.targetHours}
                />

                <SalesTargetCard 
                  params={params}
                  strategies={strategies}
                  isLocked={false}
                />
              </>
            )}

            <BaumolInsight />

            <ScenarioTimeline 
              params={params}
              strategies={strategies}
              lastValidHours={lastValidHours}
              currentHoursSelection={currentHoursSelection}
            />
          </div>

          {/* CONTROLES */}
          <div className="order-1 md:order-1 md:col-span-3 flex flex-col gap-4 md:gap-6">
            <ControlPanel 
              params={params} 
              setParams={setParams} 
              lastValidHours={lastValidHours}
              isInterlocked={isInterlocked}
              currentHoursSelection={currentHoursSelection}
              onTargetHoursChange={handleTargetHoursChange}
              onReset={handleReset}
            />
            <MitigationChecklist 
              strategies={strategies} 
              toggleStrategy={toggleStrategy} 
              totalBoost={results.totalBoost}
              activeMitigationCost={results.activeMitigationCost}
              isInterlocked={isInterlocked}
            />
          </div>

          {/* MÉTRICAS DE DECISÃO */}
          <div className="order-3 md:order-3 md:col-span-3 space-y-4 md:space-y-6">
            <MetricCard
              title="Funcionários Equivalentes"
              value={`+${results.fteToHire.toFixed(1)}`}
              subtitle={`Para manter o nível de serviço. Arredondado: ${results.fteToHireRounded} contratações.`}
              trend="Cálculo baseado em FTE (Full Time Equivalent)"
              icon={Users}
              isLocked={isInterlocked}
            />

            <MetricCard
              title="Custo de Contratação p/ Funcionários Equivalentes"
              value={`R$ ${Math.round(results.totalHiringCost).toLocaleString('pt-BR')}`}
              subtitle={results.fteToHireRounded > 0 
                ? `Custo mensal adicional estimado para ${results.fteToHireRounded} novas contratações, com salário de R$ ${params.avgSalary.toLocaleString('pt-BR')} e encargos estaduais/federais (+${params.taxRegime === 'simples' ? '35%' : '60%'}).`
                : `Nenhuma contratação necessária para compensar o déficit atual.`
              }
              trend={`Custo unitário com encargos: R$ ${Math.round(results.hiringUnitCost).toLocaleString('pt-BR')}/mês`}
              icon={DollarSign}
              isLocked={isInterlocked}
            />

            <MetricCard
              variant="danger"
              title="Vendas em Risco"
              value={`-${Math.round(results.clientLoss)}`}
              subtitle="Filas aumentam, compressão de tempo de atendimento e degradação da conversão de vendas mensais."
              trend="A estrutura permanece, mas a perda é real"
              icon={TrendingDown}
              isLocked={isInterlocked}
            />

            <FinancialImpact
              lostClientsWeekly={results.clientLoss}
              lostClientsWeeklyRaw={results.clientLossRaw}
              avgTicket={params.avgTicket}
              monthlyHiringCost={results.hiringUnitCost}
              totalHiringCost={results.totalHiringCost}
              mitigationMonthlyCost={results.activeMitigationCost}
              fteNeeded={results.fteToHireRounded}
              currentHours={params.currentHours}
              targetHours={params.targetHours}
              grossMargin={params.grossMargin}
              totalBoost={results.totalBoost}
              totalClientsLost={results.clientLoss}
              isCompact={true}
            />
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