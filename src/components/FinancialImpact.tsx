import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Coins, HeartCrack, Activity } from 'lucide-react';

interface FinancialImpactProps {
  lostClientsWeekly: number;       // Agora herda o valor já mensalizado pelo App.tsx
  lostClientsWeeklyRaw?: number;    // Agora herda o valor Puro já mensalizado pelo App.tsx
  avgTicket: number;
  monthlyHiringCost: number;       // Custo unitário de 1 colaborador com encargos
  totalHiringCost?: number;        // Custo total de contratações necessárias (FTE)
  mitigationMonthlyCost?: number;  // Soma das mitigações ativas (mês)
  fteNeeded?: number;              // Número de contratações arredondado
  currentHours: number;
  targetHours: number;
  grossMargin?: number;
  totalBoost?: number;             
  totalClientsLost?: number;
}

export function FinancialImpact({
  lostClientsWeekly,
  lostClientsWeeklyRaw,
  avgTicket,
  mitigationMonthlyCost = 0,
  currentHours,
  targetHours,
  grossMargin = 0.40,
}: FinancialImpactProps) {

  // Como o App.tsx já envia os dados consolidados no mês, garantimos segurança contra valores nulos
  const safeLostClientsMitigated = Math.max(0, lostClientsWeekly || 0);
  const safeLostClientsRaw = Math.max(0, lostClientsWeeklyRaw ?? safeLostClientsMitigated);
  const safeAvgTicket = Math.max(0, avgTicket || 0);
  const custoAdicional = Math.max(0, mitigationMonthlyCost || 0);

  // 1. Pilar de Perda Pura (Sem nenhuma ação)
  const monthlyLossRaw = safeLostClientsRaw * safeAvgTicket;
  const monthlyProfitLossRaw = monthlyLossRaw * grossMargin;
  const vendasPerdidasCenarioPuro = safeLostClientsRaw;

  // 2. Pilar de Mitigação (Sincronização Direta com o Motor Central)
  // O número de vendas salvas é a diferença matemática exata entre o cenário bruto e o mitigado
  const vendasEvitadasMes = Math.max(0, vendasPerdidasCenarioPuro - safeLostClientsMitigated);
  const margemRecuperada = vendasEvitadasMes * safeAvgTicket * grossMargin;

  // 3. Pilar Líquido (O que ainda sobra de perda real na operação)
  const vendasPerdidas = safeLostClientsMitigated;

  // CARD 1: Determinação do Veredito de Viabilidade
  let statusVeredito = "REVISAR OPERAÇÃO";
  let statusColor = "text-rose-400 border-rose-500/20 bg-rose-500/[0.04]";
  let statusBadge = "bg-rose-500/20 text-rose-400";
  let StatusIcon = XCircle;

  // O cenário é considerado viável se a margem que a tecnologia salvou paga o custo fixo dela
  if (margemRecuperada > custoAdicional) {
    statusVeredito = "VIÁVEL";
    statusColor = "text-emerald-400 border-emerald-500/20 bg-emerald-500/[0.04] animate-pulse";
    statusBadge = "bg-emerald-500/20 text-emerald-400";
    StatusIcon = CheckCircle2;
  } else if (vendasPerdidas === 0 && custoAdicional === 0) {
    statusVeredito = "ESTÁVEL (CENÁRIO BASE)";
    statusColor = "text-indigo-400 border-indigo-500/20 bg-indigo-500/[0.04]";
    statusBadge = "bg-indigo-500/20 text-indigo-400";
    StatusIcon = CheckCircle2;
  }

  // CARD 2: Texto de Recomendação Estratégica
  let descricaoRecomendacao = "Prejudicial. O faturamento recuperado não compensa os custos extras das ações ativas. Avalie reduzir mitigações ou ajustar o horário de porta aberta.";
  if (margemRecuperada > custoAdicional) {
    descricaoRecomendacao = "Opção Recomendada: SEGUIR COM TECNOLOGIA. O faturamento recuperado supera os custos das ferramentas ativas, protegendo o caixa e trazendo eficiência operacional.";
  } else if (vendasPerdidas === 0 && custoAdicional === 0) {
    descricaoRecomendacao = "Cenário de referência ideal. Nenhuma compressão de tempo ou déficit operacional detectado.";
  }

  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

  return (
    <motion.div
      id="direct-cash-impact-card"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-5 sm:p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      <h4 className="text-xs font-black text-white mb-6 flex items-center gap-3 uppercase tracking-[0.14em]">
        <span className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
          <Coins size={14} />
        </span>
        Impacto Direto no seu Caixa (Margem Projetada)
      </h4>

      {/* Grid contendo os 3 pilares visuais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        {/* Pilar 1: Perda Máxima sem Ações */}
        <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-rose-400">
              <HeartCrack size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Margem em Risco Bruta
              </span>
            </div>
            
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">
              Ausência total de ferramentas:
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 tracking-tight mt-2 mb-3 tabular-nums">
              -{currencyFormatter.format(monthlyProfitLossRaw)}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Impacto financeiro máximo direto no lucro do caixa caso as horas operacionais sejam cortadas sem mitigações.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1 text-[10px] font-bold text-slate-500 uppercase">
            <div className="flex justify-between">
              <span>Faturamento Total:</span>
              <span className="text-slate-300 tabular-nums">{currencyFormatter.format(monthlyLossRaw)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vendas Perdidas / mês:</span>
              <span className="text-slate-300 tabular-nums">{Math.round(vendasPerdidasCenarioPuro)} vendas</span>
            </div>
          </div>
        </div>

        {/* Pilar 2: Custo das Mitigações */}
        <div className="bg-white/[0.02] rounded-xl p-5 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3 text-indigo-400">
              <Activity size={13} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Custo Adicional (Tecnologias)
              </span>
            </div>

            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">
              Investimento em otimização:
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2 mb-3 tabular-nums">
              {currencyFormatter.format(custoAdicional)}
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              Gasto total fixo mensal com as ações de mitigação selecionadas para a equipe.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-1 text-[10px] font-bold text-slate-500 uppercase">
            <div className="flex justify-between">
              <span>Margem Recuperada:</span>
              <span className="text-emerald-400 tabular-nums">+{currencyFormatter.format(margemRecuperada)}</span>
            </div>
            <div className="flex justify-between">
              <span>Vendas Evitadas / mês:</span>
              <span className="text-slate-300 tabular-nums">
                {Math.round(vendasEvitadasMes)} vendas
              </span>
            </div>
          </div>
        </div>

        {/* Pilar 3: Diagnóstico de Viabilidade */}
        <div className={`p-5 rounded-xl border flex flex-col justify-between ${statusColor}`}>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <StatusIcon size={14} />
              <span className="text-[10px] font-black uppercase tracking-wider">
                Veredito Operacional
              </span>
            </div>

            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide leading-none">
              Diagnóstico Final do Caixa:
            </span>
            <div className="text-xl sm:text-2xl font-black tracking-tight mt-2 mb-3 uppercase">
              {statusVeredito}
            </div>

            <p className="text-[11px] text-zinc-100 leading-relaxed font-medium">
              {descricaoRecomendacao}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Vendas Perdidas Restantes:</span>
            <span className={vendasPerdidas > 0 ? "text-rose-400 tabular-nums animate-pulse" : "text-emerald-400 font-extrabold"}>
              {vendasPerdidas > 0 ? `${Math.round(vendasPerdidas)} / mês` : "Nenhuma (0)"}
            </span>
          </div>
        </div>

      </div>

      {/* Detalhes informativos inferiores */}
      <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${statusVeredito === "VIÁVEL" ? 'bg-emerald-500' : statusVeredito === "ESTÁVEL (CENÁRIO BASE)" ? 'bg-indigo-400' : 'bg-rose-500'}`} />
          <span>Fórmula de análise parametrizada com o Efeito Baumol</span>
        </div>
        <div className="text-slate-400">
          Cenário: {currentHours}h ➜ {targetHours}h
        </div>
      </div>
    </motion.div>
  );
}
