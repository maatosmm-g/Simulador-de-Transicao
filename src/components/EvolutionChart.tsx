import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { EVOLUTION_YEARS } from '@/src/constants';

interface EvolutionChartProps {
  currentCapacity: number;
  futureCapacity: number;
  mitigatedCapacity: number;
}

export function EvolutionChart({ currentCapacity, futureCapacity, mitigatedCapacity }: EvolutionChartProps) {
  const data = EVOLUTION_YEARS.map(year => {
    // Linear transition assumption for demonstration
    const progress = (year - 2024) / (2031 - 2024);
    const capacityWithReduction = currentCapacity - (currentCapacity - futureCapacity) * Math.min(1, progress * 1.5); // Faster reduction
    const capacityWithMitigation = capacityWithReduction + (mitigatedCapacity - futureCapacity) * progress;

    return {
      year,
      'Capacidade Bruta': Math.round(capacityWithReduction),
      'Com Mitigação': Math.round(capacityWithMitigation),
    };
  });

  return (
    <div className="h-full w-full min-h-[300px] bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Evolução da Capacidade (2024-2031)</h3>
        <div className="flex gap-4 text-[10px] font-bold">
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-indigo-600 rounded-full"></div> Projetado</span>
          <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-300 rounded-full"></div> Cenário Base</span>
        </div>
      </div>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
            />
            <Area 
              type="monotone" 
              dataKey="Capacidade Bruta" 
              stroke="#cbd5e1" 
              strokeWidth={2}
              fill="#f1f5f9" 
              fillOpacity={1}
            />
            <Area 
              type="monotone" 
              dataKey="Com Mitigação" 
              stroke="#4f46e5" 
              strokeWidth={3}
              fill="none"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
