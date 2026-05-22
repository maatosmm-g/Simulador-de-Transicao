import { motion } from 'motion/react';
import { ShieldAlert, RefreshCw, ArrowRightLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface InterlockingPanelProps {
  lastValidHours: number;
  currentHoursSelection: number;
  onResume: (hours: number) => void;
}

export function InterlockingPanel({ lastValidHours, currentHoursSelection, onResume }: InterlockingPanelProps) {
  const SEQ = [44, 40, 39, 38, 37, 36];
  const lastValidIndex = SEQ.indexOf(lastValidHours);
  
  // Calculate allowed next steps
  const nextIdx = (lastValidIndex + 1) % SEQ.length;
  const prevIdx = (lastValidIndex - 1 + SEQ.length) % SEQ.length;
  const allowedHours = [SEQ[nextIdx], SEQ[prevIdx]];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 sm:p-8 bg-slate-900 border border-rose-500/30 rounded-2xl shadow-xl overflow-hidden relative text-white flex flex-col gap-6"
    >
      {/* Visual background ambient glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Alert */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/20 animate-pulse">
          <ShieldAlert size={28} />
        </div>
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider mb-1">
            Sistema de Inter-travamento Ativo
          </h3>
          <p className="text-[11px] text-slate-400 font-medium uppercase tracking-[0.05em]">
            Análise Operacional Bloqueada temporariamente
          </p>
        </div>
      </div>

      {/* Description Context */}
      <p className="text-xs sm:text-xs text-slate-300 leading-relaxed font-medium bg-white/5 p-4 rounded-xl border border-white/5">
        Para manter um planejamento coerente e sem distorções de faturamento e escala, a análise de redução de jornada exige que você siga a sequência passo a passo. 
        Você tentou pular diretamente para <span className="text-rose-400 font-bold underline">{currentHoursSelection}h</span> saindo de <span className="text-indigo-400 font-bold">{lastValidHours}h</span>.
      </p>

      {/* Interactive Visual Stepper Sequencer */}
      <div className="py-2.5">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">
          Fluxo de Escala Inteligente:
        </h4>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative">
          {SEQ.map((h, idx) => {
            const isValidated = idx <= lastValidIndex && lastValidIndex !== 5; 
            const isLastValid = h === lastValidHours;
            const isClickTarget = h === currentHoursSelection;
            const isNextAllowed = allowedHours.includes(h);

            return (
              <div key={h} className="flex-1 flex flex-row sm:flex-col items-center gap-3 relative">
                {/* Stepper Node Bubble */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10 font-bold",
                    isLastValid
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/10"
                      : isClickTarget
                        ? "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30 font-black animate-bounce sm:animate-none"
                        : isNextAllowed
                          ? "bg-slate-800 border-indigo-400 text-indigo-300 pulse-glow cursor-pointer hover:bg-slate-750"
                          : "bg-slate-800 border-slate-700 text-slate-500"
                  )}
                  onClick={() => isNextAllowed && onResume(h)}
                >
                  <span className="text-xs tabular-nums">{h}h</span>
                </div>

                {/* Node descriptor details */}
                <div className="flex-1 sm:text-center text-xs">
                  <div className="font-extrabold text-[10px] uppercase tracking-tighter">
                    {h === 44 && "Hoje (44h)"}
                    {h === 40 && "Passo 2"}
                    {h === 39 && "Passo 3"}
                    {h === 38 && "Passo 4"}
                    {h === 37 && "Passo 5"}
                    {h === 36 && "Passo 6 (36h)"}
                  </div>
                  <div className={cn(
                    "text-[9px] font-bold uppercase tracking-wider mt-0.5",
                    isLastValid ? "text-indigo-400" : isClickTarget ? "text-rose-400" : isNextAllowed ? "text-indigo-300" : "text-slate-500"
                  )}>
                    {isLastValid && "✓ Último Valido"}
                    {isClickTarget && "⚠ Salto Detectado"}
                    {isNextAllowed && "🔓 Próximo Permitido"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Quick Recovery Actions */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">
          Ações Recomendadas para Desbloqueio:
        </span>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Quick Action 1: Return to Last Valid state */}
          <button
            onClick={() => onResume(lastValidHours)}
            className="flex items-center justify-between p-3.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 rounded-xl transition-all duration-200 group text-left"
          >
            <div>
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">
                Opção Recomendada
              </span>
              <span className="text-xs font-black text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Restaurar Cenário Válido ({lastValidHours}h)
              </span>
            </div>
            <RefreshCw size={16} className="text-indigo-400 group-hover:rotate-180 transition-transform duration-500" />
          </button>

          {/* Quick Action 2: Go to closest allowed transitioning state */}
          {allowedHours.map((hours, index) => (
            <button
              key={hours}
              onClick={() => onResume(hours)}
              className="flex items-center justify-between p-3.5 bg-indigo-950/40 hover:bg-indigo-900/40 border border-indigo-500/30 hover:border-indigo-500/50 rounded-xl transition-all duration-200 group text-left"
            >
              <div>
                <span className="block text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">
                  Seguir Sequência gradual
                </span>
                <span className="text-xs font-black text-white">
                  Ir para {hours}h
                </span>
              </div>
              <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
