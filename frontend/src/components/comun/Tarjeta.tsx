import React from 'react';
import { cn } from '../../utils/cn.js';

export interface PropiedadesTarjeta {
  children: React.ReactNode;
  className?: string;
  titulo?: string;
  subtitulo?: string;
  accion?: React.ReactNode;

  // Compatibilidad
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Tarjeta: React.FC<PropiedadesTarjeta> = ({
  children,
  className,
  titulo,
  subtitulo,
  accion,
  title,
  subtitle,
  action,
}) => {
  const tituloFinal = titulo || title;
  const subtituloFinal = subtitulo || subtitle;
  const accionFinal = accion || action;

  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-sm p-6', className)}>
      {(tituloFinal || subtituloFinal || accionFinal) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            {tituloFinal && <h3 className="text-base font-semibold text-slate-900">{tituloFinal}</h3>}
            {subtituloFinal && <p className="text-xs text-slate-500 mt-0.5">{subtituloFinal}</p>}
          </div>
          {accionFinal && <div>{accionFinal}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export const Card = Tarjeta;
