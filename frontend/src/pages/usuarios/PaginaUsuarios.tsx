import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldCheck,
  Edit2,
  CheckCircle2,
  XCircle,
  Building,
} from 'lucide-react';
import { servicioUsuarios } from '../../services/servicioUsuarios.js';
import { servicioOrganizaciones } from '../../services/servicioOrganizaciones.js';
import type { UsuarioDetalle, CrearUsuarioEntrada } from '../../types/usuario.tipos.js';
import type { Organizacion } from '../../types/organizacion.tipos.js';
import { ModalUsuario } from './ModalUsuario.js';
import { ModalRolRbac } from './ModalRolRbac.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import './usuarios.css';

export const PaginaUsuarios: React.FC = () => {
  useTituloPagina('Usuarios y Roles');
  const [parametrosBusqueda, setParametrosBusqueda] = useSearchParams();

  // Estados de datos
  const [usuarios, setUsuarios] = useState<UsuarioDetalle[]>([]);
  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  // Filtros
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroRol, setFiltroRol] = useState<string>('TODOS');
  const [filtroOrg, setFiltroOrg] = useState<string>(
    parametrosBusqueda.get('org') || 'TODAS',
  );

  // Modales
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState<boolean>(false);
  const [usuarioAEditar, setUsuarioAEditar] = useState<UsuarioDetalle | null>(null);

  const [modalRbacAbierto, setModalRbacAbierto] = useState<boolean>(false);
  const [usuarioParaRbac, setUsuarioParaRbac] = useState<UsuarioDetalle | null>(null);

  // Notificaciones
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [listaUsuarios, listaOrgs] = await Promise.all([
        servicioUsuarios.listar(),
        servicioOrganizaciones.listar(),
      ]);
      setUsuarios(listaUsuarios);
      setOrganizaciones(listaOrgs);
    } catch (err: any) {
      setMensajeError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardarUsuario = async (datos: CrearUsuarioEntrada, idEdicion?: string) => {
    try {
      if (idEdicion) {
        const actualizado = await servicioUsuarios.actualizar(idEdicion, datos);
        setUsuarios((prev) =>
          prev.map((u) => (u.id === actualizado.id ? actualizado : u)),
        );
        setMensajeExito(`Usuario ${actualizado.nombre} ${actualizado.apellido} actualizado.`);
      } else {
        const nuevo = await servicioUsuarios.crear(datos);
        setUsuarios((prev) => [nuevo, ...prev]);
        setMensajeExito(`Usuario ${nuevo.nombre} ${nuevo.apellido} registrado exitosamente.`);
      }
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al procesar la solicitud.');
    }
  };

  const manejarCambioRol = async (idUsuario: string, nuevoRol: string) => {
    try {
      const actualizado = await servicioUsuarios.cambiarRol(idUsuario, nuevoRol);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === actualizado.id ? { ...u, rol: nuevoRol } : u)),
      );
      setMensajeExito(
        `Rol de ${actualizado.nombre} actualizado a "${nuevoRol}" con éxito.`,
      );
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al modificar el rol RBAC.');
    }
  };

  const alternarEstadoActivo = async (usr: UsuarioDetalle) => {
    if (usr.correo === 'manuela@gmail.com') {
      setMensajeError('No es posible desactivar a la cuenta Superadministrador principal.');
      setTimeout(() => setMensajeError(null), 4000);
      return;
    }

    try {
      const nuevoEstado = !usr.activo;
      const actualizado = await servicioUsuarios.cambiarEstadoActivo(usr.id, nuevoEstado);
      setUsuarios((prev) =>
        prev.map((u) => (u.id === actualizado.id ? { ...u, activo: nuevoEstado } : u)),
      );
      setMensajeExito(
        `Usuario ${usr.nombre} ahora está ${nuevoEstado ? 'Activo' : 'Desactivado'}.`,
      );
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err: any) {
      setMensajeError('Error al cambiar el estado del usuario.');
    }
  };

  // Filtrado de usuarios
  const usuariosFiltrados = usuarios.filter((usr) => {
    const coincideTexto =
      usr.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      usr.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      usr.correo.toLowerCase().includes(busqueda.toLowerCase());

    const coincideRol = filtroRol === 'TODOS' || usr.rol === filtroRol;

    const coincideOrg =
      filtroOrg === 'TODAS' ||
      usr.organizacionId === filtroOrg ||
      (filtroOrg && usr.nombreOrganizacion?.toLowerCase().includes(filtroOrg.toLowerCase()));

    return coincideTexto && coincideRol && coincideOrg;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Bricolage_Grotesque']">
            Administración de Usuarios y Roles (RBAC)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión centralizada de identidades institucionales, roles granulares y accesos por empresa
          </p>
        </div>

        <button
          onClick={() => {
            setUsuarioAEditar(null);
            setModalUsuarioAbierto(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B1020] text-[#C6F432] rounded-xl text-xs font-bold hover:bg-[#152248] transition-all cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Alertas */}
      {mensajeExito && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {mensajeError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{mensajeError}</span>
        </div>
      )}

      {/* Matriz RBAC Rápida */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#0B1020]" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Niveles de Autorización RBAC en el Sistema
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Total Registrados: {usuarios.length} usuarios
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
          <div
            onClick={() => setFiltroRol(filtroRol === 'SUPER_ADMINISTRADOR' ? 'TODOS' : 'SUPER_ADMINISTRADOR')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filtroRol === 'SUPER_ADMINISTRADOR'
                ? 'border-[#0B1020] bg-slate-900 text-[#C6F432]'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-mono uppercase font-bold block">Superadmin</span>
            <span className="text-lg font-black font-['Bricolage_Grotesque']">
              {usuarios.filter((u) => u.rol === 'SUPER_ADMINISTRADOR').length}
            </span>
          </div>

          <div
            onClick={() => setFiltroRol(filtroRol === 'ADMIN_ORGANIZACION' ? 'TODOS' : 'ADMIN_ORGANIZACION')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filtroRol === 'ADMIN_ORGANIZACION'
                ? 'border-purple-600 bg-purple-900 text-purple-200'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-mono uppercase font-bold block">Admin Org</span>
            <span className="text-lg font-black font-['Bricolage_Grotesque']">
              {usuarios.filter((u) => u.rol === 'ADMIN_ORGANIZACION').length}
            </span>
          </div>

          <div
            onClick={() => setFiltroRol(filtroRol === 'SUPERVISOR' ? 'TODOS' : 'SUPERVISOR')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filtroRol === 'SUPERVISOR'
                ? 'border-sky-600 bg-sky-900 text-sky-200'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-mono uppercase font-bold block">Supervisor</span>
            <span className="text-lg font-black font-['Bricolage_Grotesque']">
              {usuarios.filter((u) => u.rol === 'SUPERVISOR').length}
            </span>
          </div>

          <div
            onClick={() => setFiltroRol(filtroRol === 'EVALUADOR' ? 'TODOS' : 'EVALUADOR')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filtroRol === 'EVALUADOR'
                ? 'border-amber-600 bg-amber-900 text-amber-200'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-mono uppercase font-bold block">Evaluador</span>
            <span className="text-lg font-black font-['Bricolage_Grotesque']">
              {usuarios.filter((u) => u.rol === 'EVALUADOR').length}
            </span>
          </div>

          <div
            onClick={() => setFiltroRol(filtroRol === 'EMPLEADO' ? 'TODOS' : 'EMPLEADO')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filtroRol === 'EMPLEADO'
                ? 'border-slate-700 bg-slate-800 text-white'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-mono uppercase font-bold block">Empleado</span>
            <span className="text-lg font-black font-['Bricolage_Grotesque']">
              {usuarios.filter((u) => u.rol === 'EMPLEADO').length}
            </span>
          </div>

          <div
            onClick={() => setFiltroRol(filtroRol === 'POSTULANTE' ? 'TODOS' : 'POSTULANTE')}
            className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
              filtroRol === 'POSTULANTE'
                ? 'border-pink-600 bg-pink-900 text-pink-200'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800'
            }`}
          >
            <span className="text-[10px] font-mono uppercase font-bold block">Postulante</span>
            <span className="text-lg font-black font-['Bricolage_Grotesque']">
              {usuarios.filter((u) => u.rol === 'POSTULANTE').length}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Selector de Rol */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Rol:</span>
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40"
            >
              <option value="TODOS">Todos los roles</option>
              <option value="SUPER_ADMINISTRADOR">Superadministrador</option>
              <option value="ADMIN_ORGANIZACION">Admin Organización</option>
              <option value="SUPERVISOR">Supervisor SST</option>
              <option value="EVALUADOR">Evaluador Proctoring</option>
              <option value="EMPLEADO">Empleado</option>
              <option value="POSTULANTE">Postulante</option>
            </select>
          </div>

          {/* Selector de Organización */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500">Organización:</span>
            <select
              value={filtroOrg}
              onChange={(e) => {
                setFiltroOrg(e.target.value);
                setParametrosBusqueda(e.target.value !== 'TODAS' ? { org: e.target.value } : {});
              }}
              className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40"
            >
              <option value="TODAS">Todas las organizaciones</option>
              {organizaciones.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.nombre}
                </option>
              ))}
            </select>
          </div>

          {(filtroRol !== 'TODOS' || filtroOrg !== 'TODAS' || busqueda) && (
            <button
              onClick={() => {
                setBusqueda('');
                setFiltroRol('TODOS');
                setFiltroOrg('TODAS');
                setParametrosBusqueda({});
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0B1020] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Cargando directorio de usuarios...</p>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron usuarios</p>
            <p className="text-xs text-slate-400">
              Prueba cambiando los filtros seleccionados o registra un nuevo usuario.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla-usuarios">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol RBAC</th>
                  <th>Empresa / Organización</th>
                  <th>Departamento</th>
                  <th>Estado</th>
                  <th>Último Acceso</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map((usr) => {
                  const esManuela = usr.correo === 'manuela@gmail.com';

                  return (
                    <tr key={usr.id}>
                      {/* Avatar y Nombre */}
                      <td>
                        <div className="flex items-center gap-3">
                          {usr.fotoUrl ? (
                            <img
                              src={usr.fotoUrl}
                              alt={`${usr.nombre} ${usr.apellido}`}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#0B1020] text-[#C6F432] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {(usr.nombre[0] || 'U').toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block leading-tight truncate">
                              {usr.nombre} {usr.apellido}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block">
                              {usr.correo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rol con Insignia RBAC */}
                      <td>
                        <button
                          onClick={() => {
                            setUsuarioParaRbac(usr);
                            setModalRbacAbierto(true);
                          }}
                          className={`insignia-rol insignia-rol-${usr.rol} hover:opacity-85 transition-opacity cursor-pointer`}
                          title="Hacer clic para cambiar rol RBAC"
                        >
                          <Shield className="w-3 h-3" />
                          <span>{usr.rol}</span>
                        </button>
                      </td>

                      {/* Organización */}
                      <td>
                        <div className="flex items-center gap-1.5 text-xs text-slate-700">
                          <Building className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span className="truncate max-w-[180px]">
                            {usr.nombreOrganizacion || 'Visitask Global'}
                          </span>
                        </div>
                      </td>

                      {/* Departamento */}
                      <td>
                        <span className="text-xs text-slate-600">
                          {usr.departamento || 'General'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td>
                        <button
                          onClick={() => alternarEstadoActivo(usr)}
                          disabled={esManuela}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            esManuela
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                              : usr.activo
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer'
                          }`}
                          title={esManuela ? 'Superadministrador raíz protegido' : 'Cambiar estado'}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              usr.activo ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{usr.activo ? 'Activo' : 'Inactivo'}</span>
                        </button>
                      </td>

                      {/* Último Acceso */}
                      <td>
                        <span className="text-xs text-slate-500 font-mono">
                          {usr.ultimoAcceso || 'Nunca'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setUsuarioParaRbac(usr);
                              setModalRbacAbierto(true);
                            }}
                            title="Ajustar rol y permisos RBAC"
                            className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setUsuarioAEditar(usr);
                              setModalUsuarioAbierto(true);
                            }}
                            title="Editar datos de usuario"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Usuario */}
      <ModalUsuario
        abierto={modalUsuarioAbierto}
        alCerrar={() => setModalUsuarioAbierto(false)}
        alGuardar={manejarGuardarUsuario}
        usuarioAEditar={usuarioAEditar}
        organizaciones={organizaciones}
      />

      {/* Modal de Asignación de Rol RBAC */}
      <ModalRolRbac
        abierto={modalRbacAbierto}
        usuario={usuarioParaRbac}
        alCerrar={() => setModalRbacAbierto(false)}
        alCambiarRol={manejarCambioRol}
      />
    </div>
  );
};
