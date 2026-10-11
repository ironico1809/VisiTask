import React, { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Lock, Building, Briefcase, Shield, Image } from 'lucide-react';
import type {
  UsuarioDetalle,
  CrearUsuarioEntrada,
} from '../../types/usuario.tipos.js';
import type { Organizacion } from '../../types/organizacion.tipos.js';

interface PropiedadesModalUsuario {
  abierto: boolean;
  alCerrar: () => void;
  alGuardar: (datos: CrearUsuarioEntrada, idEdicion?: string) => Promise<void>;
  usuarioAEditar?: UsuarioDetalle | null;
  organizaciones: Organizacion[];
}

export const ModalUsuario: React.FC<PropiedadesModalUsuario> = ({
  abierto,
  alCerrar,
  alGuardar,
  usuarioAEditar,
  organizaciones,
}) => {
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [clave, setClave] = useState<string>('');
  const [rol, setRol] = useState<string>('EMPLEADO');
  const [organizacionId, setOrganizacionId] = useState<string>('');
  const [departamento, setDepartamento] = useState<string>('Operaciones');
  const [fotoUrl, setFotoUrl] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (usuarioAEditar) {
      setNombre(usuarioAEditar.nombre);
      setApellido(usuarioAEditar.apellido);
      setCorreo(usuarioAEditar.correo);
      setClave('');
      setRol(usuarioAEditar.rol);
      setOrganizacionId(usuarioAEditar.organizacionId || (organizaciones[0]?.id || ''));
      setDepartamento(usuarioAEditar.departamento || 'Operaciones');
      setFotoUrl(usuarioAEditar.fotoUrl || '');
    } else {
      setNombre('');
      setApellido('');
      setCorreo('');
      setClave('12345');
      setRol('EMPLEADO');
      setOrganizacionId(organizaciones[0]?.id || '');
      setDepartamento('Operaciones SST');
      setFotoUrl('');
    }
    setError(null);
  }, [usuarioAEditar, abierto, organizaciones]);

  if (!abierto) return null;

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim() || !correo.trim()) {
      setError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!usuarioAEditar && (!clave || clave.length < 5)) {
      setError('La contraseña inicial debe tener al menos 5 caracteres.');
      return;
    }

    try {
      setCargando(true);
      setError(null);

      const orgSeleccionada = organizaciones.find((o) => o.id === organizacionId);

      await alGuardar(
        {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          correo: correo.trim().toLowerCase(),
          ...(clave && { clave: clave.trim() }),
          rol,
          organizacionId,
          nombreOrganizacion: orgSeleccionada?.nombre || 'Visitask Global Enterprise',
          departamento: departamento.trim(),
          ...(fotoUrl.trim() && { fotoUrl: fotoUrl.trim() }),
        },
        usuarioAEditar?.id,
      );

      alCerrar();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el usuario.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="modal-superposicion">
      <div className="modal-contenedor max-w-lg">
        {/* Encabezado */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#0B1020] text-[#C6F432] rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                {usuarioAEditar ? 'Editar Usuario' : 'Registrar Nuevo Usuario'}
              </h3>
              <p className="text-xs text-slate-500">
                Alta en el directorio institucional con credenciales y permisos RBAC
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
        <form onSubmit={manejarEnvio} className="p-6 space-y-3.5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej. Pérez"
                className="w-full h-10 px-3 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Electrónico *
            </label>
            <div className="relative">
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={!!usuarioAEditar}
                placeholder="ejemplo@visitask.com"
                className={`w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020] ${
                  usuarioAEditar ? 'bg-slate-100 cursor-not-allowed text-slate-500' : ''
                }`}
                required
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {usuarioAEditar ? 'Nueva Contraseña (dejar en blanco para conservar)' : 'Contraseña Inicial *'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={clave}
                onChange={(e) => setClave(e.target.value)}
                placeholder={usuarioAEditar ? '••••••••' : 'Mínimo 5 caracteres'}
                className="w-full h-10 px-3 pl-9 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
                required={!usuarioAEditar}
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rol de Acceso (RBAC) *
              </label>
              <div className="relative">
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full h-10 px-3 pl-8 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40"
                >
                  <option value="SUPER_ADMINISTRADOR">SUPER_ADMINISTRADOR</option>
                  <option value="ADMIN_ORGANIZACION">ADMIN_ORGANIZACION</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="EVALUADOR">EVALUADOR</option>
                  <option value="EMPLEADO">EMPLEADO</option>
                  <option value="POSTULANTE">POSTULANTE</option>
                </select>
                <Shield className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Organización Asignada
              </label>
              <div className="relative">
                <select
                  value={organizacionId}
                  onChange={(e) => setOrganizacionId(e.target.value)}
                  className="w-full h-10 px-3 pl-8 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40"
                >
                  {organizaciones.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.nombre}
                    </option>
                  ))}
                </select>
                <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Departamento
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={departamento}
                  onChange={(e) => setDepartamento(e.target.value)}
                  placeholder="Ej. Operaciones SST"
                  className="w-full h-10 px-3 pl-8 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40"
                />
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Foto de Perfil (URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={fotoUrl}
                  onChange={(e) => setFotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-10 px-3 pl-8 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40"
                />
                <Image className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
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
              {cargando ? 'Guardando...' : usuarioAEditar ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
