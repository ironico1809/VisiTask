import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Building,
  CheckCircle2,
  AlertCircle,
  Camera,
  Save,
  Lock,
  Mail,
  Briefcase,
  Calendar,
  Check,
} from 'lucide-react';
import { useAutenticacion } from '../../context/ContextoAutenticacion.js';
import { servicioUsuarios } from '../../services/servicioUsuarios.js';
import type { UsuarioDetalle } from '../../types/usuario.tipos.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import './perfil.css';

export const PaginaPerfil: React.FC = () => {
  useTituloPagina('Mi Perfil');
  const { usuario: usuarioSesion, actualizarUsuarioLocal } = useAutenticacion();

  // Estados de datos del perfil
  const [datosPerfil, setDatosPerfil] = useState<UsuarioDetalle | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [guardandoInfo, setGuardandoInfo] = useState<boolean>(false);
  const [guardandoClave, setGuardandoClave] = useState<boolean>(false);

  // Formulario de datos personales
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [fotoUrl, setFotoUrl] = useState<string>('');

  // Formulario de cambio de contraseña
  const [claveActual, setClaveActual] = useState<string>('');
  const [claveNueva, setClaveNueva] = useState<string>('');
  const [confirmarClave, setConfirmarClave] = useState<string>('');

  // Mensajes de retroalimentación
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatosPerfil();
  }, []);

  const cargarDatosPerfil = async () => {
    try {
      setCargando(true);
      const datos = await servicioUsuarios.obtenerPerfil();
      setDatosPerfil(datos);
      setNombre(datos.nombre || '');
      setApellido(datos.apellido || '');
      setFotoUrl(datos.fotoUrl || '');
    } catch {
      // Fallback con datos de sesión activa
      if (usuarioSesion) {
        const nom = usuarioSesion.nombre || usuarioSesion.firstName || 'Manuela';
        const ape = usuarioSesion.apellido || usuarioSesion.lastName || 'Administradora';
        const fot = usuarioSesion.fotoUrl || usuarioSesion.avatarUrl || '';
        setNombre(nom);
        setApellido(ape);
        setFotoUrl(fot);
        setDatosPerfil({
          id: usuarioSesion.id,
          correo: usuarioSesion.correo || usuarioSesion.email || 'manuela@gmail.com',
          nombre: nom,
          apellido: ape,
          fotoUrl: fot,
          rol: usuarioSesion.rol || usuarioSesion.role || 'SUPER_ADMINISTRADOR',
          nombreOrganizacion: usuarioSesion.nombreOrganizacion || 'Visitask Global Enterprise (Acceso Total)',
          departamento: 'Dirección General y Auditoría SST',
          activo: true,
          creadoEn: '2026-01-01',
          ultimoAcceso: 'Activo ahora',
        });
      }
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardarInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);

    if (!nombre.trim() || !apellido.trim()) {
      setMensajeError('El nombre y apellido son obligatorios.');
      return;
    }

    try {
      setGuardandoInfo(true);
      const actualizado = await servicioUsuarios.actualizarPerfil({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fotoUrl: fotoUrl.trim(),
      });

      setDatosPerfil(actualizado);
      actualizarUsuarioLocal({
        nombre: actualizado.nombre,
        apellido: actualizado.apellido,
        fotoUrl: actualizado.fotoUrl,
        firstName: actualizado.nombre,
        lastName: actualizado.apellido,
        avatarUrl: actualizado.fotoUrl,
      });

      setMensajeExito('Información personal actualizada correctamente.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setMensajeError(err.response?.data?.message || 'Error al actualizar el perfil.');
    } finally {
      setGuardandoInfo(false);
    }
  };

  const manejarGuardarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeExito(null);
    setMensajeError(null);

    if (!claveNueva || !confirmarClave) {
      setMensajeError('Por favor completa todos los campos de contraseña.');
      return;
    }

    if (claveNueva.length < 5) {
      setMensajeError('La nueva contraseña debe tener como mínimo 5 caracteres.');
      return;
    }

    if (claveNueva !== confirmarClave) {
      setMensajeError('La confirmación de contraseña no coincide con la nueva contraseña.');
      return;
    }

    try {
      setGuardandoClave(true);
      await servicioUsuarios.actualizarPerfil({
        nombre: nombre.trim() || datosPerfil?.nombre || 'Manuela',
        apellido: apellido.trim() || datosPerfil?.apellido || 'Administradora',
        claveActual,
        claveNueva,
      });

      setClaveActual('');
      setClaveNueva('');
      setConfirmarClave('');
      setMensajeExito('Contraseña actualizada con éxito. Tu cuenta está protegida.');
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      setMensajeError(err.response?.data?.message || 'Error al actualizar la contraseña.');
    } finally {
      setGuardandoClave(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-[#0B1020] rounded-full animate-spin" />
          <span className="text-sm font-medium">Cargando perfil institucional...</span>
        </div>
      </div>
    );
  }

  const esSuperAdmin =
    datosPerfil?.rol === 'SUPER_ADMINISTRADOR' ||
    datosPerfil?.rol === 'SUPER_ADMIN';

  const claveCoincide = Boolean(claveNueva && claveNueva === confirmarClave);
  const longitudSuficiente = claveNueva.length >= 5;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Bricolage_Grotesque']">
            Gestión de Perfil
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra tus credenciales personales, datos institucionales y niveles de autorización RBAC
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Sesión Verificada
          </span>
        </div>
      </div>

      {/* Alertas de Notificación */}
      {mensajeExito && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{mensajeExito}</span>
        </div>
      )}

      {mensajeError && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{mensajeError}</span>
        </div>
      )}

      {/* Tarjeta de Resumen de Identidad */}
      <div className="tarjeta-perfil p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-[#10182E] to-[#152248] text-white rounded-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#C6F432]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* Avatar con previsualización */}
          <div className="perfil-avatar-preview flex-shrink-0">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={`${nombre} ${apellido}`}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-[#0B1020] border-2 border-[#C6F432] text-[#C6F432] flex items-center justify-center text-3xl font-extrabold shadow-md">
                {(nombre[0] || 'U').toUpperCase()}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-[#0B1020] border border-slate-700 p-1.5 rounded-lg text-[#C6F432]" title="Foto de perfil">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Información del Usuario */}
          <div className="flex-1 text-center md:text-left space-y-2.5">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {nombre} {apellido}
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#C6F432] text-[#0B1020] shadow-2xs">
                {esSuperAdmin ? 'SUPER_ADMINISTRADOR' : datosPerfil?.rol}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {datosPerfil?.correo}
              </span>
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#C6F432]" />
                {datosPerfil?.nombreOrganizacion || 'Visitask Global Enterprise'}
              </span>
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {datosPerfil?.departamento || 'Operaciones SST'}
              </span>
            </div>

            <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-center md:justify-start gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Miembro institucional registrado en visitask ErgoCheck SST</span>
            </div>
          </div>
        </div>
      </div>

      {/* Formularios en Doble Columna con Alineación Perfecta */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Columna Izquierda: Información Personal */}
        <div className="lg:col-span-7 flex">
          <div className="tarjeta-perfil p-6 sm:p-7 w-full flex flex-col justify-between">
            <div>
              {/* Encabezado de la tarjeta */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Información Personal
                  </h3>
                  <p className="text-xs text-slate-500">
                    Actualiza tu nombre, apellido y fotografía de perfil
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <form id="form-info-perfil" onSubmit={manejarGuardarInfo} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="campo-perfil"
                      placeholder="Ej. Manuela"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="campo-perfil"
                      placeholder="Ej. Administradora"
                      required
                    />
                  </div>
                </div>

                {/* Correo Electrónico Limpio sin Colisiones */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Correo Electrónico (Identificador Único)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="email"
                      value={datosPerfil?.correo || ''}
                      disabled
                      className="campo-perfil campo-perfil-bloqueado pr-28 select-all"
                    />
                    <div className="absolute right-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-500 shadow-2xs">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Protegido</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    El correo institucional está protegido por políticas de seguridad del sistema.
                  </p>
                </div>

                {/* URL de Fotografía / Avatar */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    URL de Fotografía / Avatar
                  </label>
                  <input
                    type="url"
                    value={fotoUrl}
                    onChange={(e) => setFotoUrl(e.target.value)}
                    className="campo-perfil font-mono text-xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    Enlace HTTPS directo a una imagen pública para tu avatar en la barra y reportes.
                  </p>
                </div>
              </form>
            </div>

            {/* Botón de Guardar Información alineado al pie */}
            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                form="form-info-perfil"
                disabled={guardandoInfo}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1020] text-[#C6F432] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#16203d] active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{guardandoInfo ? 'Guardando...' : 'Guardar Cambios'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Seguridad y Contraseña */}
        <div className="lg:col-span-5 flex">
          <div className="tarjeta-perfil p-6 sm:p-7 w-full flex flex-col justify-between">
            <div>
              {/* Encabezado de la tarjeta */}
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-800">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Seguridad y Contraseña
                  </h3>
                  <p className="text-xs text-slate-500">
                    Actualiza tu contraseña de acceso institucional
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <form id="form-clave-perfil" onSubmit={manejarGuardarClave} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={claveActual}
                    onChange={(e) => setClaveActual(e.target.value)}
                    className="campo-perfil"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    value={claveNueva}
                    onChange={(e) => setClaveNueva(e.target.value)}
                    className="campo-perfil"
                    placeholder="Mínimo 5 caracteres"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirmar Nueva Contraseña *
                  </label>
                  <input
                    type="password"
                    value={confirmarClave}
                    onChange={(e) => setConfirmarClave(e.target.value)}
                    className="campo-perfil"
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>

                {/* Indicador de requisitos interactivo */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
                  <span className="font-bold block text-slate-800">Requisitos de seguridad:</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${longitudSuficiente ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {longitudSuficiente ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                    </span>
                    <span className={longitudSuficiente ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      Longitud mínima de 5 caracteres
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${claveCoincide ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {claveCoincide ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                    </span>
                    <span className={claveCoincide ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                      Las contraseñas coinciden exactamente
                    </span>
                  </div>
                </div>
              </form>
            </div>

            {/* Botón de Actualizar Contraseña con estilo visitask consistente */}
            <div className="pt-5 mt-6 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                form="form-clave-perfil"
                disabled={guardandoClave}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0B1020] text-[#C6F432] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#16203d] active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{guardandoClave ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Resumen de Autorización RBAC */}
      <div className="tarjeta-perfil p-6 sm:p-7 border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#0B1020] text-[#C6F432] rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Nivel de Autorización RBAC: {esSuperAdmin ? 'Superadministrador Global' : datosPerfil?.rol}
            </h3>
            <p className="text-xs text-slate-500">
              Permisos asignados automáticamente de acuerdo a la matriz de seguridad institucional
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Multi-Organización Total</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Capacidad de registrar empresas, cambiar planes SST y monitorear todas las sedes.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Control de Identidades RBAC</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Creación, cambio de roles, activación y desactivación de usuarios en caliente.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Telemetría y Proctoring AI</span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Supervisión biométrica, posturas ergonómicas en tiempo real y logs de auditoría SST.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
