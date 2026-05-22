import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'danger' | 'success' | 'warning' | 'hero';
  className?: string;
  isLocked?: boolean;
}

export function MetricCard({ title, value, subtitle, trend, icon: Icon, variant = 'default', className, isLocked = false }: MetricCardProps) {
  const variants = {
    default: 'bg-white border-slate-200 text-slate-900 shadow-sm',
    danger: 'bg-white border-slate-200 text-rose-600 shadow-sm',
    success: 'bg-white border-slate-200 text-emerald-600 shadow-sm',
    warning: 'bg-white border-slate-200 text-amber-600 shadow-sm',
    hero: 'bg-indigo-900 border-indigo-800 text-white shadow-md',
  };

  const titleColors = {
    default: 'text-slate-400', danger: 'text-slate-400', success: 'text-slate-400',
    warning: 'text-slate-400', hero: 'text-indigo-200',
  };

  const subtitleColors = {
    default: 'text-slate-500', danger: 'text-slate-500', success: 'text-slate-500',
    warning: 'text-slate-500', hero: 'text-indigo-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-5 sm:p-6 rounded-2xl border flex flex-col relative overflow-hidden transition-all duration-300', 
        isLocked ? 'bg-slate-50 border-slate-200 opacity-75' : variants[variant], 
        className
      )}
    >
      {variant === 'hero' && !isLocked && (
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-800 rounded-full opacity-30 blur-3xl" />
      )}

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className={cn('text-[10px] font-bold uppercase tracking-widest', isLocked ? 'text-slate-400' : titleColors[variant])}>
            {title}
          </span>
          {isLocked ? (
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 animate-pulse">
              BLOQUEADO
            </span>
          ) : (
            Icon && <Icon size={16} className="opacity-30 flex-shrink-0" />
          )}
        </div>

        <div className={cn(
          'text-3xl sm:text-4xl font-black tracking-tight mt-1 tabular-nums transition-all filter duration-300',
          isLocked ? 'blur-[3px] select-none text-slate-300' : (variant === 'danger' ? 'text-rose-600' : '')
        )}>
          {isLocked ? 'R$ 999.999' : value}
        </div>

        {subtitle && (
          <div className={cn('text-xs mt-2 font-medium leading-relaxed transition-colors', isLocked ? 'text-slate-400' : subtitleColors[variant])}>
            {isLocked ? '⚠️ Resolva o inter-travamento para habilitar os dados.' : subtitle}
          </div>
        )}

        {trend && (
          <div className={cn(
            'text-[10px] mt-auto pt-3 sm:pt-4 font-bold uppercase tracking-tighter transition-colors',
            isLocked ? 'text-slate-300' : (variant === 'hero' ? 'text-indigo-300' : 'text-slate-400')
          )}>
            {isLocked ? 'REQUER SEQUÊNCIA' : trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}
