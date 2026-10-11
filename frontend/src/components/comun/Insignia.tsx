import React from 'react';
import { cn } from '../../utils/cn.js';

export interface PropiedadesInsignia {
  children: React.ReactNode;
  variante?: 'exito' | 'advertencia' | 'peligro' | 'informacion' | 'neutral' | 'marca' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  variant?: 'exito' | 'advertencia' | 'peligro' | 'informacion' | 'neutral' | 'marca' | 'success' | 'warning' | 'danger' | 'info' | 'brand';
  className?: string;
}

export const Insignia: React.FC<PropiedadesInsignia> = ({
  children,
  variante = 'neutral',
  variant,
  className,
}) => {
  const varianteFinal = variant || variante;

  const variantes = {
    marca: 'bg-[#C6F432]/20 text-[#173004] border-[#C6F432]/60 font-semibold',
    brand: 'bg-[#C6F432]/20 text-[#173004] border-[#C6F432]/60 font-semibold',
    exito: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    advertencia: 'bg-amber-50 text-amber-800 border-amber-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    peligro: 'bg-rose-50 text-rose-700 border-rose-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    informacion: 'bg-blue-50 text-blue-700 border-blue-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variantes[varianteFinal as keyof typeof variantes] || variantes.neutral,
        className,
      )}
    >
      {children}
    </span>
  );
};

export const Badge = Insignia;
