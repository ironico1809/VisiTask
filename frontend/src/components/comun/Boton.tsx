import React from 'react';
import { cn } from '../../utils/cn.js';

export interface PropiedadesBoton extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro' | 'borde' | 'fantasma' | 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  tamano?: 'sm' | 'md' | 'lg';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primario' | 'secundario' | 'peligro' | 'borde' | 'fantasma' | 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  estaCargando?: boolean;
  isLoading?: boolean;
}

export const Boton: React.FC<PropiedadesBoton> = ({
  children,
  className,
  variante = 'primario',
  variant,
  tamano = 'md',
  size,
  estaCargando = false,
  isLoading,
  disabled,
  ...restoProps
}) => {
  const varianteFinal = variant || variante;
  const tamanoFinal = size || tamano;
  const cargando = isLoading !== undefined ? isLoading : estaCargando;

  const estilosBase =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantes = {
    primario:
      'bg-[#0B1020] text-[#C6F432] hover:bg-[#16203d] active:scale-[0.985] focus:ring-2 focus:ring-[#C6F432] focus:ring-offset-2 font-semibold shadow-xs transition-all',
    primary:
      'bg-[#0B1020] text-[#C6F432] hover:bg-[#16203d] active:scale-[0.985] focus:ring-2 focus:ring-[#C6F432] focus:ring-offset-2 font-semibold shadow-xs transition-all',
    secundario: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-400',
    peligro: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-xs',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-xs',
    borde:
      'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 focus:ring-2 focus:ring-[#0B1020]',
    outline:
      'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 hover:border-slate-400 focus:ring-2 focus:ring-[#0B1020]',
    fantasma: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
  };

  const tamanos = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={cn(estilosBase, variantes[varianteFinal as keyof typeof variantes], tamanos[tamanoFinal], className)}
      disabled={disabled || cargando}
      {...restoProps}
    >
      {cargando ? (
        <span className="flex items-center space-x-2">
          <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export const Button = Boton;
