import { SimulationParameters, MODEL_CALIBRATION } from '@/src/constants';
import { cn } from '@/src/lib/utils';

interface ControlPanelProps {
  params: SimulationParameters;
  setParams: (params: SimulationParameters) => void;
}

export function ControlPanel({ params, setParams }: ControlPanelProps) {
  const { TAX_MULTIPLIER, WEEKS_PER_MONTH } = MODEL_CALIBRATION;

  const formatBR = (val: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  const handleCurrencyChange = (input: string, field: 'avgTicket' | 'avgSalary') => {
    const cleanValue = input.replace(/\D/g, '');
    const numberValue = parseInt(cleanValue) / 100;
    setParams({ ...params, [field]: isNaN(numberValue) ? 0 : numberValue });
  };

  const taxMult = TAX_MULTIPLIER[params.taxRegime];
  const monthlyCostUnit = params.avgSalary * taxMult;
  // Cₕ no cenário ATUAL (44h) e no FUTURO (targetHours)
  const costPerHourCurrent = monthlyCostUnit / (params.currentHours * WEEKS_PER_MONTH);
  const costPerHourTarget = params.targetHours > 0
    ? monthlyCostUnit / (params.targetHours * WEEKS_PER_MONTH)
    : 0;
  const hourCostDelta = costPerHourCurrent > 0
    ? ((costPerHourTarget - costPerHourCurrent) / costPerHourCurrent) * 100
    : 0;

  return (
    <div className="flex flex-col gap-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
          Perfil da Unidade
        </h2>
      </div>

      <div className="space-y-5">
        {/* Equipe */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-4">
            Dados da Unidade
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Equipe Atual</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={params.employeeCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) setParams({ ...params, employeeCount: Math.min(200, Math.max(1, val)) });
                  }}
                  className="w-12 bg-transparent border-b border-slate-200 text-xs font-black text-indigo-600 text-center focus:outline-none focus:border-indigo-500 py-1 tabular-nums"
                />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Pessoas</span>
              </div>
            </div>
            <input
              type="range" min="1" max="100" step="1"
              value={params.employeeCount}
              onChange={(e) => setParams({ ...params, employeeCount: parseInt(e.target.value) })}
              className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="text-[11px] font-black text-slate-700 uppercase tracking-tight">Meta de Jornada</label>
            <div className="flex gap-2">
              {[44, 40, 36].map((h) => (
                <button
                  key={h}
                  onClick={() => setParams({ ...params, targetHours: h })}
                  className={cn(
                    "flex-1 py-3 text-xs rounded-xl transition-all border touch-manipulation min-h-[44px] tabular-nums",
                    params.targetHours === h
                      ? "bg-indigo-600 border-indigo-700 font-black text-white shadow-lg shadow-indigo-100"
                      : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 font-bold active:bg-slate-50"
                  )}
                >
                  {h}h
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
              Ticket Médio (Faturamento)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={formatBR(params.avgTicket)}
                onChange={(e) => handleCurrencyChange(e.target.value, 'avgTicket')}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-right min-h-[48px] tabular-nums transition-all"
              />
            </div>
          </div>

          {/* Regime */}
          <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                Regime Tributário
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-inner">
                <button
                  onClick={() => setParams({ ...params, taxRegime: 'simples' })}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black rounded-lg transition-all min-h-[32px] uppercase tracking-wider",
                    params.taxRegime === 'simples' ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Simples
                </button>
                <button
                  onClick={() => setParams({ ...params, taxRegime: 'real' })}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black rounded-lg transition-all min-h-[32px] uppercase tracking-wider",
                    params.taxRegime === 'real' ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Lucro Real
                </button>
              </div>
            </div>

            {/* Salário */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                  Salário Base p/ Mês
                </label>
                <span className="text-[10px] text-slate-400 font-bold italic">Base 2026</span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">R$</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatBR(params.avgSalary)}
                  onChange={(e) => handleCurrencyChange(e.target.value, 'avgSalary')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm font-black text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-right min-h-[48px] tabular-nums transition-all"
                />
              </div>
            </div>

            {/* Margem */}
            <div className="space-y-3 pt-4 border-t border-dashed border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">
                  Margem de Venda
                </label>
                <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 italic">
                  {Math.round(params.grossMargin * 100)}% real
                </span>
              </div>
              <input
                type="range" min="5" max="95" step="1"
                value={params.grossMargin * 100}
                onChange={(e) => setParams({ ...params, grossMargin: parseInt(e.target.value) / 100 })}
                className="w-full accent-indigo-600 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* CARD ESCURO DE CUSTO — agora com COMPARATIVO Cₕ */}
            <div className="bg-slate-900 rounded-xl p-4 sm:p-5 text-white relative overflow-hidden group">
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start gap-3 flex-wrap">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-0.5">
                      Custo Real (1 p/ Mês)
                    </h4>
                    <div className="text-xl sm:text-2xl font-black tabular-nums">
                      R$ {formatBR(monthlyCostUnit)}
                    </div>
                  </div>
                  <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded text-indigo-300">
                    {params.taxRegime === 'simples' ? '~1,35×' : '~1,50×'}
                  </span>
                </div>

                {/* Custo da Hora COMPARATIVO */}
                <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                    Custo da Hora (Cₕ)
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">
                        Hoje ({params.currentHours}h)
                      </div>
                      <div className="text-sm font-black text-slate-300 tabular-nums">
                        R$ {formatBR(costPerHourCurrent)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">
                        Meta ({params.targetHours}h)
                      </div>
                      <div className="text-sm font-black text-emerald-400 tabular-nums">
                        R$ {formatBR(costPerHourTarget)}
                      </div>
                    </div>
                  </div>
                  {hourCostDelta !== 0 && (
                    <div className={cn(
                      "text-[10px] font-bold mt-1 pt-2 border-t border-white/5",
                      hourCostDelta > 0 ? "text-rose-400" : "text-emerald-400"
                    )}>
                      {hourCostDelta > 0 ? '↑' : '↓'} {Math.abs(hourCostDelta).toFixed(1)}% por hora
                      {hourCostDelta > 0 && ' — Efeito Baumol visível'}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      Total Equipe ({params.employeeCount})
                    </span>
                    <span className="text-xs sm:text-sm font-black text-white tabular-nums">
                      R$ {formatBR(monthlyCostUnit * params.employeeCount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] uppercase font-bold text-slate-500 mb-1">
                      Principais Encargos
                    </span>
                    <span className="text-[10px] text-slate-400 italic">
                      {params.taxRegime === 'simples'
                        ? 'FGTS, 13º, Férias'
                        : '+ INSS, Sist S, Ed.'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
