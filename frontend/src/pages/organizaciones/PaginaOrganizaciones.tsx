import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Users,
  Activity,
  Edit2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { servicioOrganizaciones } from '../../services/servicioOrganizaciones.js';
import type {
  Organizacion,
  CrearOrganizacionEntrada,
  ActualizarOrganizacionEntrada,
} from '../../types/organizacion.tipos.js';
import { ModalOrganizacion } from './ModalOrganizacion.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import './organizaciones.css';

export const PaginaOrganizaciones: React.FC = () => {
  useTituloPagina('Organizaciones');
  const navigate = useNavigate();

  const [organizaciones, setOrganizaciones] = useState<Organizacion[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroPlan, setFiltroPlan] = useState<string>('TODOS');

  // Estado del modal
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [organizacionAEditar, setOrganizacionAEditar] = useState<Organizacion | null>(null);

  // Notificaciones
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  useEffect(() => {
    cargarOrganizaciones();
  }, []);

  const cargarOrganizaciones = async () => {
    try {
      setCargando(true);
      const lista = await servicioOrganizaciones.listar();
      setOrganizaciones(lista);
    } catch (err: any) {
      setMensajeError('No se pudo conectar con el servidor. Mostrando datos locales.');
    } finally {
      setCargando(false);
    }
  };

  const manejarGuardarOrganizacion = async (
    datos: CrearOrganizacionEntrada | ActualizarOrganizacionEntrada,
  ) => {
    try {
      if (organizacionAEditar) {
        const actualizada = await servicioOrganizaciones.actualizar(
          organizacionAEditar.id,
          datos,
        );
        setOrganizaciones((prev) =>
          prev.map((o) => (o.id === actualizada.id ? actualizada : o)),
        );
        setMensajeExito(`Organización "${actualizada.nombre}" actualizada con éxito.`);
      } else {
        const nueva = await servicioOrganizaciones.crear(datos as CrearOrganizacionEntrada);
        setOrganizaciones((prev) => [nueva, ...prev]);
        setMensajeExito(`Organización "${nueva.nombre}" registrada exitosamente.`);
      }
      setTimeout(() => setMensajeExito(null), 4000);
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Error al guardar la organización.');
    }
  };

  const alternarEstadoActivo = async (org: Organizacion) => {
    try {
      const nuevoEstado = !org.activo;
      const actualizada = await servicioOrganizaciones.actualizar(org.id, {
        activo: nuevoEstado,
      });
      setOrganizaciones((prev) =>
        prev.map((o) => (o.id === actualizada.id ? actualizada : o)),
      );
      setMensajeExito(
        `Estado de "${org.nombre}" cambiado a ${nuevoEstado ? 'Activo' : 'Inactivo'}.`,
      );
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err: any) {
      setMensajeError('Error al cambiar el estado de la organización.');
    }
  };

  // Filtrado reactivo
  const organizacionesFiltradas = organizaciones.filter((org) => {
    const coincideTexto =
      org.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (org.identificacionFiscal &&
        org.identificacionFiscal.toLowerCase().includes(busqueda.toLowerCase()));
    const coincidePlan = filtroPlan === 'TODOS' || org.plan === filtroPlan;
    return coincideTexto && coincidePlan;
  });

  // Métricas calculadas para los KPIs
  const totalOrganizacionesActivas = organizaciones.filter((o) => o.activo).length;
  const totalPuestosActivos = organizaciones.reduce((acc, o) => acc + (o.puestosActivos || 0), 0);
  const totalColaboradores = organizaciones.reduce((acc, o) => acc + (o.totalColaboradores || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-['Bricolage_Grotesque']">
            Administrar Organizaciones
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestión multiempresa, sedes operativas, puestos de trabajo ergonómicos y licencias SST
          </p>
        </div>

        <button
          onClick={() => {
            setOrganizacionAEditar(null);
            setModalAbierto(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B1020] text-[#C6F432] rounded-xl text-xs font-bold hover:bg-[#152248] transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Organización</span>
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

      {/* Tarjetas de Métricas KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-800">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Empresas Activas
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-['Bricolage_Grotesque']">
                {totalOrganizacionesActivas}
              </span>
              <span className="text-xs text-slate-400">/ {organizaciones.length} registradas</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#0B1020] rounded-xl text-[#C6F432]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Puestos Monitoreados
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-['Bricolage_Grotesque']">
                {totalPuestosActivos}
              </span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">ErgoCheck En vivo</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-slate-100 rounded-xl text-slate-800">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Colaboradores SST
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-['Bricolage_Grotesque']">
                {totalColaboradores}
              </span>
              <span className="text-xs text-slate-400">Personal vinculado</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Cobertura Legal SST
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-['Bricolage_Grotesque']">
                100%
              </span>
              <span className="text-xs text-emerald-600 font-semibold font-mono">Norma NTS-009</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o NIT..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40 focus:border-[#0B1020]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Plan SST:</span>
          <select
            value={filtroPlan}
            onChange={(e) => setFiltroPlan(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#C6F432]/40"
          >
            <option value="TODOS">Todos los planes</option>
            <option value="Enterprise SST Total">Enterprise SST Total</option>
            <option value="Corporativo SST">Corporativo SST</option>
            <option value="Proctoring & Exámenes">Proctoring & Exámenes</option>
          </select>
        </div>
      </div>

      {/* Tabla de Organizaciones */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-6 h-6 border-2 border-slate-300 border-t-[#0B1020] rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Cargando organizaciones...</p>
          </div>
        ) : organizacionesFiltradas.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Building className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-semibold text-slate-700">No se encontraron organizaciones</p>
            <p className="text-xs text-slate-400">
              Prueba modificando tus términos de búsqueda o agrega una nueva organización.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="tabla-organizaciones">
              <thead>
                <tr>
                  <th>Empresa / Organización</th>
                  <th>Identificación Fiscal</th>
                  <th>Plan SST</th>
                  <th>Puestos Ergonómicos</th>
                  <th>Colaboradores</th>
                  <th>Estado</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {organizacionesFiltradas.map((org) => {
                  const esEnterprise = org.plan.includes('Enterprise');
                  const esProctoring = org.plan.includes('Proctoring');

                  return (
                    <tr key={org.id}>
                      {/* Logo y Nombre */}
                      <td>
                        <div className="flex items-center gap-3">
                          {org.logoUrl ? (
                            <img
                              src={org.logoUrl}
                              alt={org.nombre}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-slate-900 text-[#C6F432] flex items-center justify-center font-bold text-xs">
                              {org.nombre.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">
                              {org.nombre}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                              slug: {org.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* NIT */}
                      <td>
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                          {org.identificacionFiscal || 'S/N Registrado'}
                        </span>
                      </td>

                      {/* Plan */}
                      <td>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            esEnterprise
                              ? 'bg-[#0B1020] text-[#C6F432]'
                              : esProctoring
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {org.plan}
                        </span>
                      </td>

                      {/* Puestos Activos */}
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono text-xs">
                            {org.puestosActivos}
                          </span>
                          <span className="text-[11px] text-slate-400">puestos</span>
                        </div>
                      </td>

                      {/* Colaboradores */}
                      <td>
                        <span className="font-mono text-xs font-semibold text-slate-700">
                          {org.totalColaboradores}
                        </span>
                      </td>

                      {/* Estado con switch toggle */}
                      <td>
                        <button
                          onClick={() => alternarEstadoActivo(org)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                            org.activo
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title="Hacer clic para cambiar estado"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              org.activo ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          <span>{org.activo ? 'Activa' : 'Inactiva'}</span>
                        </button>
                      </td>

                      {/* Acciones */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setOrganizacionAEditar(org);
                              setModalAbierto(true);
                            }}
                            title="Editar organización"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => navigate(`/usuarios?org=${org.id}`)}
                            title="Ver usuarios de esta organización"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
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

      {/* Modal de Crear / Editar Organización */}
      <ModalOrganizacion
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        alGuardar={manejarGuardarOrganizacion}
        organizacionAEditar={organizacionAEditar}
      />
    </div>
  );
};
