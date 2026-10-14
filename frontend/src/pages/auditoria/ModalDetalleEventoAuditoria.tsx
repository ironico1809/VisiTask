import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Fingerprint,
  Calendar,
  User,
  Globe,
  Copy,
  Check,
  Database,
  Lock,
} from 'lucide-react';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import type { RegistroAuditoria } from '../../types/auditoria.tipos.js';

interface ModalDetalleEventoAuditoriaProps {
  evento: RegistroAuditoria | null;
  abierto: boolean;
  alCerrar: () => void;
}

export const ModalDetalleEventoAuditoria: React.FC<ModalDetalleEventoAuditoriaProps> = ({
  evento,
  abierto,
  alCerrar,
}) => {
  const [copiado, setCopiado] = useState(false);

  if (!abierto || !evento) return null;

  const copiarHash = () => {
    navigator.clipboard.writeText(evento.hashIntegridad);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const getVarianteSeveridad = (nivel: string) => {
    switch (nivel) {
      case 'CRITICO':
        return 'peligro';
      case 'SEGURIDAD':
        return 'marca';
      case 'ADVERTENCIA':
        return 'advertencia';
      default:
        return 'info';
    }
  };

  const humanizarAccion = (accion: string): string => {
    const diccionario: Record<string, string> = {
      ACCESO_EXPEDIENTE_SST: 'Acceso a Expediente SST',
      MODIFICACION_POLITICA_RULA: 'Modificación de Política RULA',
      BLOQUEO_INTENTO_EXAMEN: 'Bloqueo en Examen Supervisado',
      DESESTIMAR_FALSO_POSITIVO_INCIDENTE: 'Desestimación de Falso Positivo',
      CONFIRMAR_INFRACCION_INCIDENTE: 'Confirmación de Infracción',
      DISPARAR_PREGUNTA_CONTROL: 'Disparo de Pregunta de Control',
      REACCION_PREGUNTA_CONTROL_REGISTRADA: 'Respuesta a Pregunta de Control',
      INCIDENTE_ANOMALIA_ENTREVISTA_DETECTADA: 'Anomalía en Pregunta de Control',
      LOGIN_EXITOSO: 'Inicio de Sesión Exitoso',
      LOGIN_FALLIDO: 'Intento de Acceso Fallido',
      CREAR_PREGUNTA_CONTROL: 'Creación de Pregunta Institucional',
    };
    if (diccionario[accion]) return diccionario[accion];
    return accion
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getVarianteCategoria = (cat: string) => {
    switch (cat) {
      case 'MODIFICACION_POLITICA':
        return 'advertencia';
      case 'ACCESO_DATOS':
        return 'marca';
      case 'AUTENTICACION_SEGURIDAD':
        return 'peligro';
      default:
        return 'info';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm anim-fade">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabecera del Modal */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C6F432] text-[#0B1020] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-['Bricolage_Grotesque']">
                  Inspección de Registro Inmutable
                </h3>
                <span className="font-mono text-xs text-[#C6F432] bg-[#0B1020] px-2 py-0.5 rounded-md border border-[#C6F432]/30">
                  {evento.id}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Auditoría técnica en PostgreSQL • Registro append-only WORM
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          {/* Etiquetas Clave */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Categoría
              </span>
              <Insignia variante={getVarianteCategoria(evento.categoria)}>
                {evento.categoria.replace('_', ' ')}
              </Insignia>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Severidad
              </span>
              <Insignia variante={getVarianteSeveridad(evento.nivel)}>
                {evento.nivel}
              </Insignia>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <Globe className="w-3 h-3 text-slate-400" /> IP Origen
              </span>
              <span className="font-mono font-semibold text-slate-900 block truncate">
                {evento.ipAddress || '127.0.0.1'}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" /> Fecha y Hora
              </span>
              <span className="font-mono text-slate-900 block truncate">
                {new Date(evento.createdAt).toLocaleTimeString('es-ES', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* Información del Usuario y Entidad */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-900">
                  {evento.nombreUsuario || 'Usuario Sistema'}
                </span>
                <span className="text-slate-400 font-mono">
                  ({evento.correoUsuario || 'sistema@visitask.ai'})
                </span>
              </div>
              <span className="font-mono px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                {evento.rolUsuario || 'SISTEMA'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Acción Ejecutada:</span>
                <span className="font-bold text-slate-900 block text-xs">
                  {humanizarAccion(evento.action)}
                </span>
                <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                  {evento.action}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Entidad Afectada:</span>
                <span className="font-mono font-bold text-slate-900">
                  {evento.entity} {evento.entityId ? `(#${evento.entityId})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Detalles JSON del Snapshot */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                Snapshot Técnico Inmutable (Payload JSON)
              </span>
              <span className="text-[10px] font-mono text-slate-400">PostgreSQL JSONB</span>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-56">
              {JSON.stringify(evento.details || {}, null, 2)}
            </pre>
          </div>

          {/* Hash Criptográfico SHA-256 de Inmutabilidad */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4 text-emerald-700" />
                Firma Criptográfica SHA-256 de No-Repudio
              </span>
              <button
                onClick={copiarHash}
                className="px-2.5 py-1 rounded-lg bg-emerald-200 hover:bg-emerald-300 text-emerald-950 font-bold flex items-center gap-1 text-[10px] transition-colors cursor-pointer"
              >
                {copiado ? <Check className="w-3 h-3 text-emerald-800" /> : <Copy className="w-3 h-3" />}
                <span>{copiado ? '¡Copiado!' : 'Copiar Hash'}</span>
              </button>
            </div>
            <p className="font-mono text-[11px] text-emerald-950 break-all select-all bg-emerald-100/70 p-2 rounded-xl mt-1.5">
              {evento.hashIntegridad}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-800">
              <Lock className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>
                Garantía inmutable: Cualquier alteración en PostgreSQL romperá esta firma y alertará al auditor.
              </span>
            </div>
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Boton variante="secundario" onClick={alCerrar}>
            Cerrar Inspección
          </Boton>
        </div>
      </div>
    </div>
  );
};
