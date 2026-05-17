import { MitigationStrategy } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface MitigationChecklistProps {
  strategies: MitigationStrategy[];
  toggleStrategy: (id: string) => void;
}

export function MitigationChecklist({ strategies, toggleStrategy }: MitigationChecklistProps) {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
        Ações de Mitigação
      </h3>
      <div className="space-y-2.5">
        {strategies.map((s) => (
          <label
            key={s.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border min-h-[56px] touch-manipulation",
              s.active
                ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                : "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 active:bg-slate-200"
            )}
            onClick={() => toggleStrategy(s.id)}
          >
            <input
              type="checkbox"
              readOnly
              checked={s.active}
              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 flex-shrink-0"
            />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-bold leading-tight">{s.name}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">
                +{(s.productivityBoost * 100).toFixed(0)}% produtividade
                {s.costPerEmployee > 0 && ` · ${fmt.format(s.costPerEmployee)}/colab.`}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
