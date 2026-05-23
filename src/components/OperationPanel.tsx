import { Clock, Store, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface OperationPanelProps {
  employeeCount: number;
  targetHours: number;
}

export function OperationPanel({ employeeCount, targetHours }: OperationPanelProps) {
  // Dados fixos do cenário base conforme solicitado
  const openDays = 6;
  const hoursPerDay = 9;
  const storeOpenHours = openDays * hoursPerDay; // 54h
  
  const currentTotalStaffHours = employeeCount * 44;
  const projectedTotalStaffHours = employeeCount * targetHours;

  const currentCoverage = currentTotalStaffHours / storeOpenHours;
  const projectedCoverage = projectedTotalStaffHours / storeOpenHours;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 flex flex-col">
      <div className="flex flex-col mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-sm">
            <Store size={18} />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Equação Operacional</h3>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 self-start px-2 py-1 rounded-lg border border-slate-100">
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Cobertura de Piso</p>
          <span className="w-1 h-1 rounded-full bg-slate-300" />
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">
            Ref: 10h às 19h (9h líq.)
          </span>
        </div>
      </div>

      {/* Banner Central de Insight */}
      <div className="mb-5 flex items-start gap-2.5 p-3 sm:p-4 bg-amber-50/50 rounded-xl border border-amber-100">
        <Info size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-[10px] sm:text-[11px] leading-relaxed text-amber-900 font-medium">
          {targetHours === 44 
            ? `Densidade de ${currentCoverage.toFixed(1)} pessoas/hora é o ideal para as 54h de porta aberta.`
            : `A redução para ${targetHours}h diminui a densidade para ${projectedCoverage.toFixed(1)} pessoas/hora, criando gargalos no atendimento.`
          }
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Cenário HOJE */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden group flex flex-col gap-4">
          <div className="absolute -right-2 -top-2 p-3 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Clock size={40} />
          </div>
          
          <div>
            <h4 className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">Cenário Atual</h4>
            <div className="text-2xl font-black text-slate-900 leading-none tabular-nums">54 Horas</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Porta aberta / semana</div>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex flex-col gap-2">
            <div className="flex justify-between items-end">
              <div>
                <div className="text-xl font-black text-slate-600 tabular-nums">
                  {currentCoverage.toFixed(1)}
                </div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic leading-none mt-1">Colab./hora</div>
              </div>
              <div className="text-[8px] font-black text-slate-300 uppercase">
                {openDays}D × {hoursPerDay}H
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-normal mt-1 border-t border-slate-100 pt-1.5 italic">
              ⚠ Se a jornada for reduzida, este número tende a ser menor.
            </p>
          </div>
        </div>

        {/* Cenário PROJETADO */}
        <div className="p-4 rounded-xl bg-indigo-600 text-white border border-indigo-700 shadow-lg shadow-indigo-100/50 relative overflow-hidden group flex flex-col gap-4">
          <div className="absolute -right-2 -top-2 p-3 opacity-20">
            <ArrowRight size={40} />
          </div>

          <div>
            <h4 className="text-[8px] font-black uppercase tracking-widest text-indigo-200 mb-2">Projetado ({targetHours}h)</h4>
            <div className="text-2xl font-black leading-none tabular-nums">
              {projectedTotalStaffHours}h
            </div>
            <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-tighter">Capacidade da equipe</div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-between items-end gap-2">
            <div className="min-w-0">
              <div className="text-xl font-black tabular-nums">
                {projectedCoverage.toFixed(1)}
              </div>
              <div className="text-[9px] font-bold text-indigo-100 uppercase tracking-tighter italic leading-none mt-1">Colab./hora</div>
            </div>
            <div className={cn(
              "text-[8px] font-black px-1.5 py-0.5 rounded border leading-none mb-0.5",
              projectedCoverage < currentCoverage 
                ? "bg-rose-500 border-rose-400 text-white" 
                : "bg-emerald-500 border-emerald-400 text-white"
            )}>
              {projectedCoverage < currentCoverage 
                ? `-${(((currentCoverage - projectedCoverage) / currentCoverage) * 100).toFixed(0)}%`
                : 'OK'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
