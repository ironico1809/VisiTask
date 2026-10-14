import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import {
  servicioSupervision,
  type EventoLineaTiempo,
  type RespuestaAuditoriaIncidente,
} from '../../services/servicioSupervision.js';

interface ModalAuditarIncidenteProps {
  abierto: boolean;
  alCerrar: () => void;
  evento: EventoLineaTiempo | null;
  alGuardarExitoso: (respuesta: RespuestaAuditoriaIncidente) => void;
}

export const ModalAuditarIncidente: React.FC<ModalAuditarIncidenteProps> = ({
  abierto,
  alCerrar,
  evento,
  alGuardarExitoso,
}) => {
  const [veredicto, setVeredicto] = useState<'CONFIRMED_VIOLATION' | 'DISMISSED_FALSE_POSITIVE'>(
    evento?.estadoIncidente === 'CONFIRMED_VIOLATION'
      ? 'CONFIRMED_VIOLATION'
      : 'DISMISSED_FALSE_POSITIVE',
  );
  const [justificacion, setJustificacion] = useState<string>(
    evento?.justificacion || '',
  );
  const [notasEvaluador, setNotasEvaluador] = useState<string>('');
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!abierto || !evento) return null;

  const incidenteId = evento.incidenteId || evento.id.replace('ev-inc-', '');

  const manejarGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!justificacion.trim()) {
      setError('Debes ingresar una justificación técnica para sustentar el veredicto en la bitácora.');
      return;
    }

    setGuardando(true);
    setError(null);

    try {
      const resp = await servicioSupervision.auditarIncidente(incidenteId, {
        estado: veredicto,
        justificacion: justificacion.trim(),
        notasEvaluador: notasEvaluador.trim() || undefined,
      });

      alGuardarExitoso(resp);
      alCerrar();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al guardar la auditoría del incidente.');
    } finally {
      setGuardando(false);
    }
  };

  const probabilidad = evento.evidencia?.probabilidadTelefono
    ? `${Math.round(evento.evidencia.probabilidadTelefono * 100)}%`
    : '85%';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Cabecera del Modal */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-xs ${
                evento.severidad === 'CRITICA' || evento.severidad === 'ALTA'
                  ? 'bg-rose-600'
                  : 'bg-amber-500 text-slate-950'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Minuto {evento.minutoSegundo}
                </span>
                <Insignia
                  variante={
                    evento.severidad === 'CRITICA' || evento.severidad === 'ALTA'
                      ? 'peligro'
                      : 'advertencia'
                  }
                  className="text-[10px] py-0 px-2"
                >
                  Severidad {evento.severidad}
                </Insignia>
              </div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque'] mt-0.5">
                Auditar Incidente de Supervisión
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Resumen del Incidente y Evidencia Biométrica */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Regla Correlacionada
            </span>
            <p className="text-xs font-bold text-slate-900 mt-0.5">{evento.subtipo}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{evento.descripcion}</p>
          </div>

          {/* Grilla de Evidencia Detectada por la IA */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-mono">Probabilidad IA</span>
              <span className="text-xs font-bold text-rose-600">{probabilidad}</span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-mono">Duración</span>
              <span className="text-xs font-bold text-slate-900 font-mono">
                {evento.evidencia?.duracionSegundos || 4.8} seg
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 block font-mono">Ángulo Pitch</span>
              <span className="text-xs font-bold text-amber-600 font-mono">
                {evento.evidencia?.anguloPitch || -28.4}°
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de Evaluación / Veredicto Técnico */}
        <form onSubmit={manejarGuardar} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-2">
              Seleccionar Dictamen del Evaluador:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opción 1: Confirmar Infracción */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  veredicto === 'CONFIRMED_VIOLATION'
                    ? 'border-rose-600 bg-rose-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="veredicto"
                  value="CONFIRMED_VIOLATION"
                  checked={veredicto === 'CONFIRMED_VIOLATION'}
                  onChange={() => setVeredicto('CONFIRMED_VIOLATION')}
                  className="mt-1 accent-rose-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span className="text-xs font-bold text-rose-950">Confirmar Infracción</span>
                  </div>
                  <p className="text-[11px] text-rose-800/80 leading-normal mt-1">
                    Se valida como violación real a las normas del examen. Se mantiene penalización en el índice de integridad.
                  </p>
                </div>
              </label>

              {/* Opción 2: Marcar como Falso Positivo */}
              <label
                className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition-all ${
                  veredicto === 'DISMISSED_FALSE_POSITIVE'
                    ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="veredicto"
                  value="DISMISSED_FALSE_POSITIVE"
                  checked={veredicto === 'DISMISSED_FALSE_POSITIVE'}
                  onChange={() => setVeredicto('DISMISSED_FALSE_POSITIVE')}
                  className="mt-1 accent-emerald-600 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-950">Desestimar Falso Positivo</span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 leading-normal mt-1">
                    El desvío se considera justificado (ej. hoja borrador o parpadeo). El score de integridad se restablece.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Justificación Técnica Obligatoria */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Justificación Técnica del Dictamen <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Describe detalladamente el motivo de la confirmación o desestimación (quedará registrado con firma inmutable)..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6F432]/60 focus:border-[#0B1020] transition-all"
            />
          </div>

          {/* Notas Adicionales del Evaluador */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Notas Internas de Auditoría (Opcional)
            </label>
            <input
              type="text"
              value={notasEvaluador}
              onChange={(e) => setNotasEvaluador(e.target.value)}
              placeholder="Observaciones para el comité académico o gerencia SST..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C6F432]/60 focus:border-[#0B1020] transition-all"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Boton
              type="button"
              variante="borde"
              tamano="sm"
              onClick={alCerrar}
              disabled={guardando}
              className="text-xs cursor-pointer"
            >
              Cancelar
            </Boton>

            <Boton
              type="submit"
              variante="primario"
              tamano="sm"
              disabled={guardando}
              className="text-xs gap-1.5 cursor-pointer shadow-xs"
            >
              {guardando ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando en PostgreSQL...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Firmar y Registrar Veredicto</span>
                </>
              )}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
};
