import React, { useState, useEffect } from 'react';
import { X, Building2, Shield, Image, Hash } from 'lucide-react';
import type {
  Organizacion,
  CrearOrganizacionEntrada,
  ActualizarOrganizacionEntrada,
} from '../../types/organizacion.tipos.js';

interface PropiedadesModalOrganizacion {
  abierto: boolean;
  alCerrar: () => void;
  alGuardar: (datos: CrearOrganizacionEntrada | ActualizarOrganizacionEntrada) => Promise<void>;
  organizacionAEditar?: Organizacion | null;
}

export const ModalOrganizacion: React.FC<PropiedadesModalOrganizacion> = ({
  abierto,
  alCerrar,
  alGuardar,
  organizacionAEditar,
}) => {
  const [nombre, setNombre] = useState<string>('');
  const [identificacionFiscal, setIdentificacionFiscal] = useState<string>('');
  const [plan, setPlan] = useState<string>('Enterprise SST Total');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (organizacionAEditar) {
      setNombre(organizacionAEditar.nombre);
      setIdentificacionFiscal(organizacionAEditar.identificacionFiscal || '');
      setPlan(organizacionAEditar.plan || 'Enterprise SST Total');
      setLogoUrl(organizacionAEditar.logoUrl || '');
    } else {
      setNombre('');
      setIdentificacionFiscal('');
      setPlan('Enterprise SST Total');
      setLogoUrl('');
    }
    setError(null);
  }, [organizacionAEditar, abierto]);

  if (!abierto) return null;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('El nombre de la organización es obligatorio.');
      return;
    }

    try {
      setCargando(true);
      setError(null);
      await alGuardar({
        nombre: nombre.trim(),
        identificacionFiscal: identificacionFiscal.trim(),
        plan,
        logoUrl: logoUrl.trim(),
      });
      alCerrar();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la organización.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-superposicion">
      <div className="modal-contenedor">
        {/* Encabezado del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B1020] text-[#C6F432] rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                {organizacionAEditar ? 'Editar Organización' : 'Registrar Nueva Organización'}
              </h3>
              <p className="text-xs text-slate-500">
                Gestión multiempresa para licencias ErgoCheck SST
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={manejarEnvio} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la Empresa u Organización *
            </label>
            <div className="relative">
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Tecnología Andina S.A."
                className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
                required
              />
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Identificación Fiscal (NIT / RUC / CIF)
            </label>
            <div className="relative">
              <input
                type="text"
                value={identificacionFiscal}
                onChange={(e) => setIdentificacionFiscal(e.target.value)}
                placeholder="Ej. NIT 1029384756"
                className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
              />
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Plan SST Asignado
            </label>
            <div className="relative">
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
              >
                <option value="Enterprise SST Total">Enterprise SST Total (Ilimitado + Telemetría AI)</option>
                <option value="Corporativo SST">Corporativo SST (Hasta 50 puestos activos)</option>
                <option value="Starter SST">Starter SST (Puesto de trabajo esencial)</option>
                <option value="Proctoring & Exámenes">Proctoring & Exámenes (Supervisión Académica)</option>
              </select>
              <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              URL del Logotipo Corporativo (Opcional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://ejemplo.com/logo.png"
                className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
              />
              <Image className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={alCerrar}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0B1020] text-[#C6F432] hover:bg-[#16203d] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {cargando ? 'Guardando...' : organizacionAEditar ? 'Guardar Cambios' : 'Registrar Empresa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
