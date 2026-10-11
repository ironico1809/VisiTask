import React from 'react';
import { cn } from '../../utils/cn.js';

export interface PropiedadesCampoTexto extends React.InputHTMLAttributes<HTMLInputElement> {
  etiqueta?: string;
  label?: string;
  error?: string;
  textoAyuda?: string;
  helperText?: string;
}

export const CampoTexto: React.FC<PropiedadesCampoTexto> = ({
  etiqueta,
  label,
  error,
  textoAyuda,
  helperText,
  className,
  id,
  ...restoProps
}) => {
  const etiquetaFinal = etiqueta || label;
  const textoAyudaFinal = textoAyuda || helperText;
  const idCampo = id || restoProps.name;

  return (
    <div className="w-full">
      {etiquetaFinal && (
        <label htmlFor={idCampo} className="block text-xs font-semibold text-slate-700 mb-1">
          {etiquetaFinal}
        </label>
      )}
      <input
        id={idCampo}
        className={cn(
          'w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2',
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
            : 'border-slate-300 focus:border-[#0B1020] focus:ring-[#C6F432]/30',
          className,
        )}
        {...restoProps}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {textoAyudaFinal && !error && <p className="text-xs text-slate-500 mt-1">{textoAyudaFinal}</p>}
    </div>
  );
};

export const Input = CampoTexto;
