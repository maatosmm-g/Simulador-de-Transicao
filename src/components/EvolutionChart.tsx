import { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { EVOLUTION_YEARS } from '@/src/constants';

interface EvolutionChartProps {
  currentCapacity: number;   // Capacidade de referência (44h ou estado inicial)
  futureCapacity: number;    // Capacidade degradada pura (Sem mitigações)
  mitigatedCapacity: number; // Capacidade líquida final (Com mitigações ativas)
}

export function EvolutionChart({ currentCapacity, futureCapacity, mitigatedCapacity }: EvolutionChartProps) {
  
  // Computação do dataset multi-anual perfeitamente sincronizada
  const data = useMemo(() => {
    const totalYears = 2031 - 2024;

    return EVOLUTION_YEARS.map(year => {
      const progress = (year - 2024) / totalYears;
      
      // Curva de compressão acelerada (Fator de aceleração em 1.5x conforme sua regra de negócio)
      const reductionFactor = Math.min(1, progress * 1.5);
      
      // Cálculo exato mantendo a coerência com o motor central do simulador
      const capacityWithReduction = currentCapacity - (currentCapacity - futureCapacity) * reductionFactor;
      
      // A curva de mitigação acompanha o progresso de maturação das tecnologias adotadas
      const capacityWithMitigation = capacityWithReduction + (mitigatedCapacity - futureCapacity) * progress;

      return {
        year,
        'Cenário Base (Sem Ações)': Math.max(0, Math.round(capacityWithReduction)),
        'Capacidade Projetada': Math.max(0, Math.round(capacityWithMitigation)),
      };
    });
  }, [currentCapacity, futureCapacity, mitigatedCapacity]);

  return (
    <div className="h-full w-full min-h-[300px] bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
      {/* Cabeçalho e Legenda Sincronizados */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Evolução da Capacidade Operacional
          </h3>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
            Projeção de Longo Prazo (2024 - 2031)
          </span>
        </div>
        
        <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-indigo-600 rounded-full" /> 
            Projetada (Com Tech)
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-slate-300 rounded-full" /> 
            Cenário Puro
          </span>
        </div>
      </div>

      {/* Área do Gráfico */}
      <div className="flex-1 w-full text-[10px] font-bold">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            {/* Grid de fundo discreto para apoio visual */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            
            <XAxis 
              dataKey="year" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              dy={10}
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              tickFormatter={(val) => val.toLocaleString('pt-BR')}
            />
            
            <Tooltip 
              contentStyle={{ 
                borderRadius: '12px', 
                border: 'none', 
                backgroundColor: '#0f172a',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', 
                fontSize: '11px',
                color: '#fff',
                fontWeight: 600
              }}
              labelStyle={{ fontWeight: 900, color: '#94a3b8', marginBottom: '4px' }}
              itemStyle={{ paddingVertical: '2px' }}
            />
            
            {/* Área Inferior: Cenário Puro Decrescente */}
            <Area 
              type="monotone" 
              dataKey="Cenário Base (Sem Ações)" 
              stroke="#cbd5e1" 
              strokeWidth={2}
              fill="#f8fafc" 
              fillOpacity={1}
              activeDot={{ r: 4 }}
            />
            
            {/* Área Superior: Capacidade Recuperada via Ferramentas */}
            <Area 
              type="monotone" 
              dataKey="Capacidade Projetada" 
              stroke="#4f46e5" 
              strokeWidth={3}
              fill="none"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
