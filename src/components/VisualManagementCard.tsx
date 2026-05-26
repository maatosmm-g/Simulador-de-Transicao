import { motion } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  ClipboardList, 
  ShieldCheck, 
  AlertTriangle, 
  Lightbulb, 
  Activity, 
  TrendingUp, 
  Lock, 
  CheckCircle,
  Clock
} from 'lucide-react';

interface VisualManagementCardProps {
  targetHours: number;
  isInterlocked: boolean;
  lastValidHours: number;
  totalBoost: number;
  employeeCount: number;
  clientLoss: number;
  capacityRetention: number;
}

export function VisualManagementCard({
  targetHours,
  isInterlocked,
  lastValidHours,
  totalBoost,
  employeeCount,
  clientLoss,
  capacityRetention
}: VisualManagementCardProps) {
  
  // Se houver interbloqueio, o estágio visível nos cálculos operacionais deve refletir a última zona segura
  const effectiveHours = isInterlocked ? lastValidHours : targetHours;

  // Definição estática do conteúdo gradativo de cada etapa da jornada
  const getStageMetadata = (hours: number) => {
    switch (hours) {
      case 44:
        return {
          stepNum: 1,
          title: "Etapa 1 de 7 · Referência Inicial",
          name: "Cenário Base de Entrada",
          statusText: "Equilíbrio",
          desc: "A operação está no regime legal padrão. Custos trabalhistas, produtividade média e capacidade de atendimento estão alinhados historicamente.",
          action: "Ideal para contratar ferramentas de automação preventiva. Isso cria uma 'poupança' de eficiência antes do piloto de redução.",
          badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
          iconColor: "text-slate-500",
          accentColor: "border-slate-200 bg-slate-50/50"
        };
      case 42:
        return {
          stepNum: 2,
          title: "Etapa 2 de 7 · PEC - Transição de 60 Dias",
          name: "Corte para 42h e Escala 5x2",
          statusText: totalBoost >= 5 ? "Estável" : "Redução",
          desc: "Primeiro marco acordado da nova legislação. A jornada semanal máxima cai para 42 horas corporativas e o repouso semanal obrigatório é ampliado para 2 dias (escala 5x2).",
          action: "Crucial planejar o revezamento operacional de forma imediata para cobrir os fins de semana vulneráveis. Introduza multitarefa na equipe de frente.",
          badgeBg: totalBoost >= 5 ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-amber-50 text-amber-700 border-amber-200",
          iconColor: totalBoost >= 5 ? "text-sky-500" : "text-amber-500",
          accentColor: totalBoost >= 5 ? "border-sky-100 bg-sky-50/20" : "border-amber-100 bg-amber-50/20"
        };
      case 40:
        return {
          stepNum: 3,
          title: "Etapa 3 de 7 · PEC - Alvo Consolidado",
          name: "Redução a 12 Meses (40h)",
          statusText: totalBoost >= 10 ? "Consolidado" : "Atenção",
          desc: "A jornada semanal é definitivamente reduzida para 40 horas mantendo o salário. Sem tecnologia de apoio, o déficit de tempo de atendimento estressa as filas e as vendas.",
          action: "Implemente ferramentas de Automação Integral no atendimento básico para blindar as metas de receita e aliviar o balcão.",
          badgeBg: totalBoost >= 10 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200",
          iconColor: totalBoost >= 10 ? "text-emerald-500" : "text-orange-500",
          accentColor: totalBoost >= 10 ? "border-emerald-100 bg-emerald-50/20" : "border-orange-100 bg-orange-50/20"
        };
      case 39:
        return {
          stepNum: 4,
          title: "Etapa 4 de 7 · Ajuste de Alta Performance",
          name: "Zona de Tolerância Espremida",
          statusText: totalBoost >= 14 ? "Adaptado" : "Alerta",
          desc: "Buscando eficiências sobressalentes abaixo da PEC (39h semanais). A resiliência geral da operação requer refinamentos rápidos para evitar novas contratações.",
          action: "Desafogue obrigações burocráticas automatizando a recepção digital de clientes e use escalas otimizadas de alta precisão.",
          badgeBg: totalBoost >= 14 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200",
          iconColor: totalBoost >= 14 ? "text-emerald-500" : "text-amber-500",
          accentColor: totalBoost >= 14 ? "border-emerald-100 bg-emerald-50/20" : "border-amber-100 bg-amber-50/20"
        };
      case 38:
        return {
          stepNum: 5,
          title: "Etapa 5 de 7 · Ajuste de Escala Avançado",
          name: "Gargalo de Atendimento Crítico",
          statusText: totalBoost >= 18 ? "Mitigado" : "Risco Elevado",
          desc: "Déficit semanal acumulado sobressalta a carga tradicional de trabalho. O Mal de Baumol se sobressai fortemente elevando o custo por minuto humano.",
          action: "Aumente o nível de flexibilização de escala e IA de retaguarda. Priorize converter cliques em visitas físicas pré-qualificadas.",
          badgeBg: totalBoost >= 18 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200",
          iconColor: totalBoost >= 18 ? "text-emerald-500" : "text-rose-500",
          accentColor: totalBoost >= 18 ? "border-emerald-100 bg-emerald-50/20" : "border-rose-100 bg-rose-50/20"
        };
      case 37:
        return {
          stepNum: 6,
          title: "Etapa 6 de 7 · Piloto de Alta Lucratividade",
          name: "Ruptura de Modelo Comercial",
          statusText: totalBoost >= 22 ? "Operável" : "Risco de Caixa",
          desc: "A jornada reduzida alcança limites agressivos de teste. Perda latente de conversão caso as escalas ou tecnologia básica percam o fôlego.",
          action: "Ajuste escala sob o modelo 5x2 otimizado com rotatividade assistida. Evite contratar sem as devidas automações de triagem ativas.",
          badgeBg: totalBoost >= 22 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200",
          iconColor: totalBoost >= 22 ? "text-emerald-500" : "text-red-500",
          accentColor: totalBoost >= 22 ? "border-emerald-100 bg-emerald-50/20" : "border-red-100 bg-red-50/20"
        };
      case 36:
      default:
        return {
          stepNum: 7,
          title: "Etapa 7 de 7 · Meta Máxima Otimizada",
          name: "Paradigma de Produção Enxuta (36h)",
          statusText: totalBoost >= 26 ? "Excelente" : "Furo Crítico de Caixa",
          desc: "Redução total extrema de -18,2% da jornada histórica tradicional. Sem ampla inovação e mitigação corporativa completa, a escala é financeiramente insustentável.",
          action: "Manter as 5 alavancas tecnológicas de mitigação operando com excelência. Audite ativamente para garantir a produtividade e reter faturamento.",
          badgeBg: totalBoost >= 26 ? "bg-indigo-50 text-indigo-700 border-indigo-200 animate-bounce" : "bg-purple-50 text-purple-700 border-purple-200",
          iconColor: totalBoost >= 26 ? "text-indigo-500" : "text-purple-500",
          accentColor: totalBoost >= 26 ? "border-indigo-100 bg-indigo-50/20" : "border-purple-100 bg-purple-50/20"
        };
    }
  };

  const meta = getStageMetadata(effectiveHours);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm overflow-hidden group transition-all hover:shadow-md relative"
    >
      {/* Background Decorações Sutis */}
      <div className="absolute -right-8 -top-8 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <ClipboardList size={120} />
      </div>

      <div className="relative z-10">
        {/* Header do Card */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardList size={16} className="text-indigo-500" />
            <h4 className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">
              Gestão de Vista: Visão Executiva
            </h4>
          </div>
          {isInterlocked ? (
            <span className="text-[9px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 flex items-center gap-1">
              <Lock size={10} strokeWidth={3} /> BLOQUEADO
            </span>
          ) : (
            <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded border tracking-wider", meta.badgeBg)}>
              {meta.statusText}
            </span>
          )}
        </div>

        {/* Alerta de Interbloqueio / Sequência Violada */}
        {isInterlocked ? (
          <div className="space-y-3">
            <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl">
              <h5 className="text-[11px] font-black text-rose-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertTriangle size={12} className="text-rose-600 flex-shrink-0" />
                Sequência de Transição Rompida
              </h5>
              <p className="text-[10px] text-rose-900/80 leading-relaxed font-medium">
                Você saltou uma ou mais etapas na meta de horas sem preparar a equipe de forma gradativa.
                Isso causaria uma paralisia operacional instantânea na organização.
              </p>
            </div>
            
            <p className="text-[10px] italic text-slate-400 font-bold uppercase tracking-wider mt-2 flex items-center gap-1">
              <Clock size={11} /> Retorne para {lastValidHours}h no controle lateral para prosseguir.
            </p>
          </div>
        ) : (
          /* Relatório de Etapa Operacional Ativa */
          <div className="space-y-4">
            {/* Título da Etapa */}
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                {meta.title}
              </span>
              <h5 className="text-sm font-black text-slate-800 uppercase tracking-tight mt-0.5 flex items-center gap-1.5">
                {meta.name}
              </h5>
            </div>

            {/* Diagnóstico da Etapa */}
            <div className="text-[11px] text-slate-600 leading-relaxed font-medium">
              {meta.desc}
            </div>

            {/* Mitigação Ativa vs Necessária */}
            <div className={cn("border p-3.5 rounded-xl transition-colors duration-200", meta.accentColor)}>
              <h6 className="text-[10px] font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck size={12} className={meta.iconColor} />
                Status de Proteção da Etapa
              </h6>
              
              <div className="grid grid-cols-2 gap-3 pt-0.5">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Capacidade Salva</div>
                  <div className="text-sm font-black text-slate-800">+{totalBoost.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Perda de Clientes</div>
                  <div className={cn(
                    "text-sm font-black",
                    clientLoss > 0 ? "text-rose-600" : "text-emerald-600"
                  )}>
                    {clientLoss > 0 ? `-${clientLoss}/mês` : 'Zero Perdas'}
                  </div>
                </div>
              </div>

              {/* Barra de Progresso de Amortecimento de Impactos */}
              <div className="mt-3">
                <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase mb-1">
                  <span>Amortecimento de Impactos</span>
                  <span>{Math.min(100, Math.round(capacityRetention))}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden">
                  <motion.div 
                    className={cn(
                      "h-full rounded-full",
                      capacityRetention >= 98
                        ? "bg-emerald-500"
                        : capacityRetention >= 90
                          ? "bg-amber-500"
                          : "bg-rose-500"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, capacityRetention)}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </div>

            {/* Guia Recomendatório (Planos de Ação) */}
            <div className="bg-indigo-50/50 border border-indigo-100 p-3.5 rounded-xl">
              <h6 className="text-[10px] font-black text-indigo-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Lightbulb size={12} strokeWidth={2.5} className="text-indigo-500" />
                Diretriz de Sobrevivência
              </h6>
              <p className="text-[11px] text-indigo-900/80 leading-relaxed font-medium">
                {meta.action}
              </p>
            </div>
          </div>
        )}

        {/* Rodapé Interno */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Activity size={10} /> Gestão Ativa
          </span>
          <span>Etapa {meta.stepNum} de 7</span>
        </div>
      </div>
    </motion.div>
  );
}
