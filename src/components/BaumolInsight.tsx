import { Activity } from 'lucide-react';
import { motion } from 'motion/react';

export function BaumolInsight() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl relative overflow-hidden group transition-all hover:shadow-md"
    >
      <div className="absolute -right-8 -bottom-8 p-3 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
        <Activity size={100} className="text-amber-500" />
      </div>

      <div className="relative z-10">
        {/* Header no mesmo padrão do VisualManagementCard */}
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-amber-500" strokeWidth={2.5} />
            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
              Nota Estratégica
            </h4>
          </div>
          <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
            Mal de Baumol
          </span>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
          Como seu serviço é presencial, a produtividade não cresce na mesma velocidade dos salários. 
          A redução de jornada sem tecnologia é um aumento direto de custo de <span className="font-bold text-rose-500 underline decoration-rose-200 underline-offset-4">~11% por hora</span> trabalhada. 
          Sem inovação, você pagará mais por cada minuto de trabalho humano.
        </p>
      </div>
    </motion.div>
  );
}

