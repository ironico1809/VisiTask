import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import type { UsuarioDetalle } from '../../types/usuario.tipos.js';

interface PropiedadesModalRolRbac {
  abierto: boolean;
  usuario: UsuarioDetalle | null;
  alCerrar: () => void;
  alCambiarRol: (idUsuario: string, nuevoRol: string) => Promise<void>;
}

interface DefinicionRol {
  rol: string;
  etiqueta: string;
  descripcion: string;
  permisos: string[];
  nivel: 'Critico' | 'Empresarial' | 'Operativo' | 'Basico';
}

const ROLES_DISPONIBLES: DefinicionRol[] = [
  {
    rol: 'SUPER_ADMINISTRADOR',
    etiqueta: 'Superadministrador Global',
    descripcion: 'Control absoluto del ecosistema multi-empresa, auditoría y seguridad.',
    permisos: ['Crear y editar organizaciones', 'Gestión global de identidades y roles', 'Acceso a toda la telemetría ErgoCheck', 'Configuración de planes y facturación'],
    nivel: 'Critico',
  },
  {
    rol: 'ADMIN_ORGANIZACION',
    etiqueta: 'Administrador de Organización',
    descripcion: 'Gestión completa de su empresa, colaboradores y configuración SST.',
    permisos: ['Administrar colaboradores de su empresa', 'Asignar puestos ergonómicos activos', 'Generar reportes SST institucionales', 'Configurar pausas activas'],
    nivel: 'Empresarial',
  },
  {
    rol: 'SUPERVISOR',
    etiqueta: 'Supervisor de Ergonomía',
    descripcion: 'Monitoreo en vivo de posturas de trabajo y alertas preventivas.',
    permisos: ['Visualizar tablero de posturas en vivo', 'Recibir alertas de fatiga o mala postura', 'Exportar métricas de salud laboral', 'Coordinar pausas ergonómicas'],
    nivel: 'Operativo',
  },
  {
    rol: 'EVALUADOR',
    etiqueta: 'Evaluador de Proctoring',
    descripcion: 'Supervisión técnica de sesiones de evaluación y exámenes.',
    permisos: ['Monitoreo de candidatos en vivo', 'Revisión de alertas de integridad académica', 'Generación de actas de supervisión', 'Validación de consentimientos'],
    nivel: 'Operativo',
  },
  {
    rol: 'EMPLEADO',
    etiqueta: 'Empleado / Colaborador',
    descripcion: 'Monitoreo ergonómico personal en su estación de trabajo.',
    permisos: ['Acceso a su monitor postural privado', 'Notificaciones de pausas activas', 'Historial personal de ergonomía'],
    nivel: 'Basico',
  },
  {
    rol: 'POSTULANTE',
    etiqueta: 'Postulante / Candidato',
    descripcion: 'Entorno de examen supervisado con consentimiento biométrico.',
    permisos: ['Acceso restringido a su sesión de prueba', 'Firma de consentimiento digital'],
    nivel: 'Basico',
  },
];

export const ModalRolRbac: React.FC<PropiedadesModalRolRbac> = ({
  abierto,
  usuario,
  alCerrar,
  alCambiarRol,
}) => {
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('EMPLEADO');
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuario) {
      setRolSeleccionado(usuario.rol);
    }
    setError(null);
  }, [usuario, abierto]);

  if (!abierto || !usuario) return null;

  const esManuela = usuario.correo === 'manuela@gmail.com';

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (esManuela && rolSeleccionado !== 'SUPER_ADMINISTRADOR') {
      setError('No es posible degradar el rol de la cuenta Superadministrador raíz.');
      return;
    }

    try {
      setGuardando(true);
      setError(null);
      await alCambiarRol(usuario.id, rolSeleccionado);
      alCerrar();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el rol RBAC.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-superposicion">
      <div className="modal-contenedor max-w-xl">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B1020] text-[#C6F432] rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                Asignación de Rol RBAC
              </h3>
              <p className="text-xs text-slate-500">
                Ajuste granular de privilegios para {usuario.nombre} {usuario.apellido}
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
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                Usuario Seleccionado
              </span>
              <p className="text-sm font-bold text-slate-900">
                {usuario.nombre} {usuario.apellido} ({usuario.correo})
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white border border-slate-200 text-slate-700">
              Rol actual: {usuario.rol}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Seleccionar Nuevo Nivel de Rol RBAC
            </label>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {ROLES_DISPONIBLES.map((item) => {
                const seleccionado = rolSeleccionado === item.rol;
                return (
                  <div
                    key={item.rol}
                    onClick={() => setRolSeleccionado(item.rol)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      seleccionado
                        ? 'border-[#0B1020] bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            item.rol === 'SUPER_ADMINISTRADOR'
                              ? 'bg-[#C6F432]'
                              : seleccionado
                              ? 'bg-[#C6F432]'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-bold text-xs">{item.etiqueta}</span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            seleccionado
                              ? 'bg-white/10 text-[#C6F432]'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.rol}
                        </span>
                      </div>
                      {seleccionado && <CheckCircle2 className="w-4 h-4 text-[#C6F432]" />}
                    </div>

                    <p
                      className={`text-xs mt-1.5 ${
                        seleccionado ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {item.descripcion}
                    </p>

                    {seleccionado && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 grid grid-cols-2 gap-1.5 text-[11px] text-slate-200">
                        {item.permisos.map((p, idx) => (
                          <div key={idx} className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-[#C6F432] flex-shrink-0" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
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
              disabled={guardando}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0B1020] text-[#C6F432] hover:bg-[#16203d] transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              {guardando ? 'Actualizando...' : 'Confirmar Cambio de Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
