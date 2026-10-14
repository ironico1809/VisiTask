import React, { useState } from 'react';
import {
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  X,
  Volume2,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import type { AlertaItem } from '../../types/alerta.tipos.js';

interface BannerAlertaPosturaProps {
  alerta: AlertaItem | null;
  alCerrar: () => void;
  alIniciarPausaActiva?: () => void;
}

export const BannerAlertaPostura: React.FC<BannerAlertaPosturaProps> = ({
  alerta,
  alCerrar,
  alIniciarPausaActiva,
}) => {
  const [expandido, setExpandido] = useState(false);

  if (!alerta) return null;

  const esCritica = alerta.nivel === 'CRITICAL' || (alerta.puntajeRula && alerta.puntajeRula >= 5);

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-in slide-in-from-top-4 duration-300 shadow-2xl">
      <div
        className={`rounded-2xl border p-4 backdrop-blur-xl transition-all ${
          esCritica
            ? 'bg-rose-950/95 border-rose-500/50 text-white shadow-rose-950/50'
            : 'bg-amber-950/95 border-amber-500/50 text-white shadow-amber-950/50'
        }`}
      >
        {/* Encabezado de la Alerta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 animate-pulse ${
                esCritica ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-950'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold bg-white/10 text-white">
                  {esCritica ? 'RULA ≥ 5 Crítico' : 'Alerta de Fatiga'}
                </span>
                {alerta.puntajeRula && (
                  <span className="text-xs font-bold text-[#C6F432] font-mono">
                    Score: {alerta.puntajeRula}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold tracking-tight mt-0.5">
                {esCritica ? 'Riesgo Postural Prolongado Detectado' : 'Fatiga Muscular Acumulada'}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Descartar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensaje descriptivo */}
        <p className="text-xs text-white/90 mt-2.5 leading-relaxed">
          {alerta.mensaje}
        </p>

        {/* Insignias de canales activados (Sonoro + Push APK Móvil) */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <span className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-md">
              <Smartphone className="w-3.5 h-3.5" />
              <span>Notificación Push enviada al APK</span>
              <CheckCircle2 className="w-3 h-3 text-emerald-400 ml-0.5" />
            </span>
          </div>

          <div className="flex items-center gap-1 text-white/60">
            <Volume2 className="w-3.5 h-3.5 text-[#C6F432]" />
            <span>Alerta sonora emitida</span>
          </div>
        </div>

        {/* Detalle ergonómico expandible */}
        {expandido && (
          <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 text-[11px] space-y-1.5 animate-in fade-in duration-200">
            <p className="font-semibold text-[#C6F432] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnóstico de Telemetría Biomecánica:</span>
            </p>
            {alerta.anguloCuello && (
              <p className="text-white/80">
                • Inclinación cervical: <b className="text-rose-400">{alerta.anguloCuello}°</b> (Límite ISO: 20°)
              </p>
            )}
            {alerta.anguloTronco && (
              <p className="text-white/80">
                • Flexión de tronco: <b className="text-amber-400">{alerta.anguloTronco}°</b>
              </p>
            )}
            {alerta.tiempoSostenidoSegundos && (
              <p className="text-white/80">
                • Tiempo continuo en postura estática: <b className="text-white">{alerta.tiempoSostenidoSegundos} seg</b>
              </p>
            )}
          </div>
        )}

        {/* Acciones Rápidas */}
        <div className="mt-3 flex items-center gap-2">
          {alIniciarPausaActiva && (
            <button
              type="button"
              onClick={alIniciarPausaActiva}
              className="flex-1 py-1.5 px-3 bg-[#C6F432] hover:bg-[#b2dc2a] text-[#0B1020] text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Iniciar Pausa Activa (30s)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="py-1.5 px-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
          >
            <span>{expandido ? 'Menos' : 'Detalles'}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expandido ? 'rotate-90' : ''}`} />
          </button>

          <button
            type="button"
            onClick={alCerrar}
            className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
