import { Sparkles, Activity, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

export function BaumolInsight() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-amber-50/50 border border-amber-100 p-5 sm:p-6 rounded-2xl relative overflow-hidden h-full group transition-all hover:bg-amber-50"
    >
      <div className="absolute -right-8 -bottom-8 p-3 opacity-[0.05] group-hover:opacity-[0.10] transition-opacity">
        <Activity size={100} />
      </div>

      <div className="relative z-10">
        <h4 className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          <Activity size={12} strokeWidth={3} />
          Nota Estratégica
        </h4>
        <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
          <strong className="block mb-2 text-[13px] font-black text-amber-900 uppercase tracking-tight">Mal de Baumol</strong> 
          Como seu serviço é presencial, a produtividade não cresce na mesma velocidade dos salários. 
          A redução de jornada sem tecnologia é um aumento direto de custo de <span className="font-black text-amber-700 underline decoration-amber-300 underline-offset-4">~11% por hora</span> trabalhada. 
          Você está pagando significativamente mais cada minuto de serviço humano.
        </p>
      </div>
    </motion.div>
  );
}
