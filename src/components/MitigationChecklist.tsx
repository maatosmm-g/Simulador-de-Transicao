import { MitigationStrategy } from '@/src/constants';
import { cn } from '@/src/lib/utils';
import { Zap, TrendingUp, Sparkles } from 'lucide-react';

interface MitigationChecklistProps {
  strategies: MitigationStrategy[];
  toggleStrategy: (id: string) => void;
  totalBoost: number;
  activeMitigationCost: number;
  isInterlocked: boolean;
}

export function MitigationChecklist({
  strategies,
  toggleStrategy,
  totalBoost,
  activeMitigationCost,
  isInterlocked,
}: MitigationChecklistProps) {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
          Ações de Mitigação
        </h3>
        <p className="text-[10px] text-slate-400 font-medium">Habilite softwares para otimizar o tempo de atendimento da equipe</p>
      </div>

      <div className="space-y-2">
        {strategies.map((s) => (
          <label
            key={s.id}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border min-h-[52px] touch-manipulation",
              s.active
                ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
            )}
            onClick={() => toggleStrategy(s.id)}
          >
            <input
              type="checkbox"
              readOnly
              checked={s.active}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[11px] font-bold leading-tight">{s.name}</span>
              <span className="text-[9px] text-slate-500 mt-0.5">
                +{(s.productivityBoost * 100).toFixed(0)}% produtividade
                {s.costPerEmployee > 0 && ` · ${fmt.format(s.costPerEmployee)}/colab.`}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* INTEGRADO: Ganhos de Eficiência acumulados em tempo real */}
      <div className="mt-2 pt-4 border-t border-slate-200/60">
        <div className="bg-slate-900 rounded-xl p-4 text-white relative overflow-hidden group">
          <TrendingUp className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity" size={80} />
          
          <div className="relative z-10 space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-indigo-500 text-white rounded-md shadow-sm">
                <Zap size={12} fill="currentColor" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-wider text-indigo-300">
                Ganhos de Eficiência
              </span>
            </div>

            {isInterlocked ? (
              <p className="text-[10px] leading-relaxed text-slate-400 font-medium italic">
                Siga a sequência para calcular os ganhos.
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] leading-relaxed text-slate-300 font-semibold">
                  Você recuperou <span className="text-white font-black underline decoration-indigo-500 decoration-2 underline-offset-2">{totalBoost.toFixed(0)}%</span> da capacidade perdida usando as tecnologias ativas.
                </p>

                {activeMitigationCost > 0 ? (
                  <div className="flex items-center justify-between text-[10px] text-indigo-300 font-bold uppercase pt-2 border-t border-white/5">
                    <span>Custo Adicional:</span>
                    <span className="text-white">{fmt.format(activeMitigationCost)}/mês</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[9px] text-zinc-400 font-medium italic pt-2 border-t border-white/5">
                    <Sparkles size={10} className="text-indigo-400" />
                    <span>Nenhum custo adicional ativo</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

