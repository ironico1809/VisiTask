import React, { useState } from 'react';
import { X, ShieldPlus, Database, AlertCircle } from 'lucide-react';
import { Boton } from '../../components/comun/Boton.js';
import { servicioAuditoria } from '../../services/servicioAuditoria.js';
import type {
  CategoriaAuditoria,
  NivelSeveridadAuditoria,
  RegistroAuditoria,
} from '../../types/auditoria.tipos.js';

interface ModalRegistrarEventoAuditoriaProps {
  abierto: boolean;
  alCerrar: () => void;
  alRegistrarExitoso?: (nuevoRegistro: RegistroAuditoria) => void;
}

export const ModalRegistrarEventoAuditoria: React.FC<ModalRegistrarEventoAuditoriaProps> = ({
  abierto,
  alCerrar,
  alRegistrarExitoso,
}) => {
  const [categoria, setCategoria] = useState<CategoriaAuditoria>('MODIFICACION_POLITICA');
  const [accion, setAccion] = useState('ACTUALIZACION_POLITICA_RULA_MANUAL');
  const [entidad, setEntidad] = useState('ConfiguracionAlerta');
  const [entityId, setEntityId] = useState('cfg-rula-2026');
  const [nivel, setNivel] = useState<NivelSeveridadAuditoria>('ADVERTENCIA');
  const [motivo, setMotivo] = useState('Prueba de inserción inmutable de auditoría técnica');
  const [ipAddress, setIpAddress] = useState('192.168.1.105');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!abierto) return null;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accion.trim() || !entidad.trim()) {
      setError('Por favor completa la acción y la entidad afectada.');
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const nuevo = await servicioAuditoria.registrarEvento({
        accion: accion.trim().toUpperCase().replace(/\s+/g, '_'),
        categoria,
        entidad: entidad.trim(),
        entityId: entityId.trim() || undefined,
        nivel,
        motivo: motivo.trim(),
        ipAddress: ipAddress.trim() || '127.0.0.1',
        detalles: {
          motivo,
          fechaPruebaUtc: new Date().toISOString(),
          origenPrueba: 'Modal de Simulación de Auditoría visitask',
          entorno: 'Producción / PostgreSQL WORM',
        },
      });

      if (alRegistrarExitoso) {
        alRegistrarExitoso(nuevo);
      }
      alCerrar();
    } catch (err: any) {
      setError(err?.message || 'Error al persistir el registro inmutable');
    } finally {
      setCargando(false);
    }
  };

  const aplicarPlantilla = (tipo: 'politica' | 'acceso' | 'seguridad') => {
    if (tipo === 'politica') {
      setCategoria('MODIFICACION_POLITICA');
      setAccion('MODIFICACION_PARAMETRO_RULA_CRITICO');
      setEntidad('PoliticaErgonomia');
      setEntityId('pol-rula-iso11226');
      setNivel('ADVERTENCIA');
      setMotivo('Ajuste de tolerancia de flexión de cuello de 20° a 15°');
    } else if (tipo === 'acceso') {
      setCategoria('ACCESO_DATOS');
      setAccion('DESCARGA_HISTORIAL_TELEMETRIA_SST');
      setEntidad('ExpedienteErgonomico');
      setEntityId('exp-sst-3341');
      setNivel('INFO');
      setMotivo('Auditoría anual de riesgos musculoesqueléticos departamento TI');
    } else {
      setCategoria('AUTENTICACION_SEGURIDAD');
      setAccion('DETECCION_ANOMALIA_IP_SIMULTANEA');
      setEntidad('SesionUsuario');
      setEntityId('ses-usr-901');
      setNivel('CRITICO');
      setMotivo('Doble inicio de sesión desde rangos geográficos incompatibles');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm anim-fade">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C6F432] text-[#0B1020] flex items-center justify-center">
              <ShieldPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Bricolage_Grotesque']">
                Registrar Evento de Auditoría
              </h3>
              <p className="text-xs text-slate-400">
                Inserción inmutable directa en la bitácora PostgreSQL
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

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Plantillas Rápidas */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
              Cargar Plantilla de Prueba Rápida:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => aplicarPlantilla('politica')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
              >
                Política RULA
              </button>
              <button
                type="button"
                onClick={() => aplicarPlantilla('acceso')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
              >
                Acceso SST
              </button>
              <button
                type="button"
                onClick={() => aplicarPlantilla('seguridad')}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-[11px] transition-colors cursor-pointer"
              >
                Alerta Seguridad
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaAuditoria)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#C6F432] focus:outline-none"
              >
                <option value="MODIFICACION_POLITICA">Modificación Política</option>
                <option value="ACCESO_DATOS">Acceso a Datos</option>
                <option value="AUTENTICACION_SEGURIDAD">Autenticación / Seguridad</option>
                <option value="EVENTO_SISTEMA">Evento del Sistema</option>
                <option value="INTEGRIDAD_SESION">Integridad de Sesión</option>
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Nivel de Severidad</label>
              <select
                value={nivel}
                onChange={(e) => setNivel(e.target.value as NivelSeveridadAuditoria)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-[#C6F432] focus:outline-none"
              >
                <option value="INFO">INFO</option>
                <option value="ADVERTENCIA">ADVERTENCIA</option>
                <option value="CRITICO">CRÍTICO</option>
                <option value="SEGURIDAD">SEGURIDAD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-700 font-bold block mb-1">Acción Ejecutada</label>
            <input
              type="text"
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              placeholder="Ej. MODIFICACION_UMBRAL_RULA"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#C6F432] focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Entidad Afectada</label>
              <input
                type="text"
                value={entidad}
                onChange={(e) => setEntidad(e.target.value)}
                placeholder="Ej. ConfiguracionAlerta"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#C6F432] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">ID Entidad (Opcional)</label>
              <input
                type="text"
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="Ej. cfg-001"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#C6F432] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Dirección IP</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="192.168.1.105"
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-[#C6F432] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-slate-700 font-bold block mb-1">Motivo / Justificación</label>
              <input
                type="text"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Razón técnica o legal..."
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#C6F432] focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2">
            <Database className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>
              Este registro se firmará criptográficamente con SHA-256 de forma inmutable y no podrá ser editado ni borrado.
            </span>
          </div>

          {/* Botones */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <Boton type="button" variante="secundario" onClick={alCerrar} disabled={cargando}>
              Cancelar
            </Boton>
            <Boton type="submit" variante="primario" disabled={cargando}>
              {cargando ? 'Persistiendo...' : 'Firmar y Registrar en Bitácora'}
            </Boton>
          </div>
        </form>
      </div>
    </div>
  );
};
