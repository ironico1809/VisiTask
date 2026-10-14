import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Database,
  Lock,
  Eye,
  Sliders,
  ShieldAlert,
  Plus,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  LayoutList,
  Table as TableIcon,
  X,
  FileSpreadsheet,
  FileCode,
} from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { servicioAuditoria } from '../../services/servicioAuditoria.js';
import { ModalDetalleEventoAuditoria } from './ModalDetalleEventoAuditoria.js';
import { ModalRegistrarEventoAuditoria } from './ModalRegistrarEventoAuditoria.js';
import type {
  RegistroAuditoria,
  CategoriaAuditoria,
  NivelSeveridadAuditoria,
  FiltrosAuditoria,
  MetricasAuditoria,
  ResultadoVerificacionIntegridad,
} from '../../types/auditoria.tipos.js';

export const PaginaBitacoraAuditoria: React.FC = () => {
  useTituloPagina('Bitácora de Auditoría y Seguridad | visitask');

  // Estados de datos
  const [registros, setRegistros] = useState<RegistroAuditoria[]>([]);
  const [metricas, setMetricas] = useState<MetricasAuditoria | null>(null);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);

  // Modo de visualización: Tabla limpia vs Tarjetas de actividad
  const [modoVista, setModoVista] = useState<'tabla' | 'tarjetas'>('tabla');

  // Estados de modales
  const [eventoSeleccionado, setEventoSeleccionado] = useState<RegistroAuditoria | null>(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [modalRegistrarAbierto, setModalRegistrarAbierto] = useState(false);

  // Verificación de integridad
  const [verificandoIntegridad, setVerificandoIntegridad] = useState(false);
  const [resultadoIntegridad, setResultadoIntegridad] = useState<ResultadoVerificacionIntegridad | null>(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaAuditoria>('TODOS');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<NivelSeveridadAuditoria | 'TODOS'>('TODOS');
  const [rangoFecha, setRangoFecha] = useState<'HOY' | '7_DIAS' | '30_DIAS' | 'TODO'>('TODO');

  const [errorConexion, setErrorConexion] = useState<string | null>(null);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setErrorConexion(null);
    try {
      const filtros: FiltrosAuditoria = {
        buscar: busqueda.trim() || undefined,
        categoria: categoriaSeleccionada,
        nivel: nivelSeleccionado,
        fechaRango: rangoFecha,
        pagina: paginaActual,
        limite: 20,
      };

      const [resConsulta, resMetricas] = await Promise.all([
        servicioAuditoria.consultar(filtros),
        servicioAuditoria.obtenerMetricas(),
      ]);

      setRegistros(resConsulta.registros);
      setTotalRegistros(resConsulta.total);
      setTotalPaginas(resConsulta.totalPaginas);
      setMetricas(resMetricas);
    } catch (error: any) {
      console.error('Error cargando bitácora de auditoría:', error);
      setErrorConexion(
        error?.response?.data?.message ||
          error?.message ||
          'No se pudo conectar con el servidor de auditoría en PostgreSQL.',
      );
    } finally {
      setCargando(false);
    }
  }, [busqueda, categoriaSeleccionada, nivelSeleccionado, rangoFecha, paginaActual]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const ejecutarVerificacionIntegridad = async () => {
    setVerificandoIntegridad(true);
    try {
      const res = await servicioAuditoria.verificarIntegridad();
      setResultadoIntegridad(res);
    } catch (error) {
      console.error('Error verificando integridad:', error);
    } finally {
      setVerificandoIntegridad(false);
    }
  };

  const exportarCsv = async () => {
    await servicioAuditoria.descargarCsv({
      buscar: busqueda,
      categoria: categoriaSeleccionada,
      nivel: nivelSeleccionado,
      fechaRango: rangoFecha,
    });
  };

  const exportarJson = async () => {
    await servicioAuditoria.descargarJson({
      buscar: busqueda,
      categoria: categoriaSeleccionada,
      nivel: nivelSeleccionado,
      fechaRango: rangoFecha,
    });
  };

  // Humanizar títulos técnicos para evitar saturación de códigos en mayúsculas
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
      MODIFICAR_UMBRAL_FATIGA: 'Actualización de Umbral de Fatiga',
      CONSULTA_REPORTE_FORENSE: 'Descarga de Informe Forense',
    };
    if (diccionario[accion]) return diccionario[accion];
    return accion
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Insignias minimalistas de severidad
  const renderInsigniaSeveridad = (nivel: string) => {
    switch (nivel) {
      case 'CRITICO':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            Crítico
          </span>
        );
      case 'SEGURIDAD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            Seguridad
          </span>
        );
      case 'ADVERTENCIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Advertencia
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            Info
          </span>
        );
    }
  };

  // Etiqueta concisa de categoría
  const getTextoCategoria = (cat: string) => {
    const mapa: Record<string, string> = {
      MODIFICACION_POLITICA: 'Políticas',
      ACCESO_DATOS: 'Datos',
      AUTENTICACION_SEGURIDAD: 'Seguridad',
      INTEGRIDAD_SESION: 'Sesión',
      EVENTO_SISTEMA: 'Sistema',
    };
    return mapa[cat] || cat.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Cabecera Principal Limpia y Despejada */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 font-['Bricolage_Grotesque'] tracking-tight">
            Bitácora de Auditoría
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Trazabilidad inmutable de eventos, accesos y modificaciones registrada en PostgreSQL.
          </p>
        </div>

        {/* Acciones Superiores Agrupadas */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Botón de Integridad Criptográfica */}
          <button
            type="button"
            onClick={ejecutarVerificacionIntegridad}
            disabled={verificandoIntegridad}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            title="Verificar firma criptográfica SHA-256 de los registros"
          >
            <Lock className={`w-3.5 h-3.5 text-emerald-600 ${verificandoIntegridad ? 'animate-spin' : ''}`} />
            <span>{verificandoIntegridad ? 'Verificando...' : 'Verificar SHA-256'}</span>
          </button>

          {/* Grupo de Exportación Compacto */}
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={exportarCsv}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Descargar datos en formato CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>
            <span className="w-px bg-slate-200 my-1" />
            <button
              type="button"
              onClick={exportarJson}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Descargar copia forense en formato JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-600" />
              <span>JSON</span>
            </button>
          </div>

          {/* Botón Primario: Registrar Evento */}
          <Boton
            variante="primario"
            tamano="sm"
            onClick={() => setModalRegistrarAbierto(true)}
            className="text-xs gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar</span>
          </Boton>
        </div>
      </div>

      {/* Alerta de Error de Conexión */}
      {errorConexion && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorConexion}</span>
          </div>
          <button
            type="button"
            onClick={() => cargarDatos()}
            className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}

      {/* Banner de Verificación de Integridad */}
      {resultadoIntegridad && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
            resultadoIntegridad.valido
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : 'bg-rose-50/80 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">{resultadoIntegridad.mensaje}</p>
              <span className="text-[11px] text-emerald-700 font-mono">
                {resultadoIntegridad.totalVerificados} registros auditados • Hash de lote: {resultadoIntegridad.hashRaizLote.slice(0, 16)}...
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setResultadoIntegridad(null)}
            className="text-slate-400 hover:text-slate-700 font-bold text-xs cursor-pointer p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Métricas Resumidas (Sleek & Clean) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Eventos
            </span>
            <span className="text-2xl font-black text-slate-900 font-['Bricolage_Grotesque'] block mt-0.5">
              {metricas?.totalRegistros ?? totalRegistros}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium inline-block mt-0.5">
              PostgreSQL Append-Only
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
            <Database className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Accesos a Datos
            </span>
            <span className="text-2xl font-black text-slate-900 font-['Bricolage_Grotesque'] block mt-0.5">
              {metricas?.totalAccesosDatos ?? 0}
            </span>
            <span className="text-[10px] text-blue-600 font-medium inline-block mt-0.5">
              Lecturas y telemetría
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Políticas y Reglas
            </span>
            <span className="text-2xl font-black text-slate-900 font-['Bricolage_Grotesque'] block mt-0.5">
              {metricas?.totalModificacionesPoliticas ?? 0}
            </span>
            <span className="text-[10px] text-amber-600 font-medium inline-block mt-0.5">
              Modificaciones
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Eventos Críticos
            </span>
            <span className="text-2xl font-black text-rose-600 font-['Bricolage_Grotesque'] block mt-0.5">
              {metricas?.totalEventosCriticos ?? 0}
            </span>
            <span className="text-[10px] text-rose-600 font-medium inline-block mt-0.5">
              Seguridad e infracciones
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Herramientas Unificada */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Lado Izquierdo: Buscador y Selectores Rápidos */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Buscador */}
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPaginaActual(1);
              }}
              placeholder="Buscar evento, usuario o IP..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0B1020]/20 focus:outline-none bg-slate-50 text-slate-800"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => {
                  setBusqueda('');
                  setPaginaActual(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Selector de Categoría */}
          <select
            value={categoriaSeleccionada}
            onChange={(e) => {
              setCategoriaSeleccionada(e.target.value as CategoriaAuditoria);
              setPaginaActual(1);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="TODOS">Categoría: Todas</option>
            <option value="MODIFICACION_POLITICA">Modificación Políticas</option>
            <option value="ACCESO_DATOS">Acceso a Datos</option>
            <option value="AUTENTICACION_SEGURIDAD">Autenticación / Seguridad</option>
            <option value="INTEGRIDAD_SESION">Integridad de Sesión</option>
            <option value="EVENTO_SISTEMA">Eventos del Sistema</option>
          </select>

          {/* Selector de Severidad */}
          <select
            value={nivelSeleccionado}
            onChange={(e) => {
              setNivelSeleccionado(e.target.value as NivelSeveridadAuditoria | 'TODOS');
              setPaginaActual(1);
            }}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="TODOS">Severidad: Todas</option>
            <option value="INFO">Información</option>
            <option value="ADVERTENCIA">Advertencia</option>
            <option value="CRITICO">Crítico</option>
            <option value="SEGURIDAD">Seguridad</option>
          </select>
        </div>

        {/* Lado Derecho: Rango de Fecha, Alternador de Vista y Refrescar */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          {/* Segmentos de Rango de Fecha */}
          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-medium">
            {(['TODOS', 'HOY', '7_DIAS', '30_DIAS'] as const).map((rango) => (
              <button
                key={rango}
                type="button"
                onClick={() => {
                  setRangoFecha(rango === 'TODOS' ? 'TODO' : rango);
                  setPaginaActual(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  (rango === 'TODOS' && rangoFecha === 'TODO') || rangoFecha === rango
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {rango === 'TODOS'
                  ? 'Todo'
                  : rango === 'HOY'
                  ? 'Hoy'
                  : rango === '7_DIAS'
                  ? '7d'
                  : '30d'}
              </button>
            ))}
          </div>

          {/* Alternador de Vista (Tabla vs Tarjetas) */}
          <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-white">
            <button
              type="button"
              onClick={() => setModoVista('tabla')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                modoVista === 'tabla'
                  ? 'bg-[#0B1020] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vista de Tabla"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setModoVista('tarjetas')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                modoVista === 'tarjetas'
                  ? 'bg-[#0B1020] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Vista de Tarjetas / Feed"
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refrescar */}
          <button
            type="button"
            onClick={() => cargarDatos()}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refrescar registros"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${cargando ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Contenedor Principal de Registros */}
      <Tarjeta className="overflow-hidden border-slate-200/80 p-0 shadow-2xs">
        {/* Barra superior de conteo */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">
              {totalRegistros} {totalRegistros === 1 ? 'evento registrado' : 'eventos registrados'}
            </span>
            <span className="text-slate-300">•</span>
            <span>Página {paginaActual} de {totalPaginas || 1}</span>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            WORM Activo
          </span>
        </div>

        {cargando ? (
          <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-[#0B1020]" />
            <span>Consultando registros de auditoría en PostgreSQL...</span>
          </div>
        ) : registros.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-1">
            <Database className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-medium text-slate-600">No se encontraron eventos coincidentes.</p>
            <p className="text-[11px]">Modifique los filtros o los términos de búsqueda.</p>
          </div>
        ) : modoVista === 'tabla' ? (
          /* ========================================================
             VISTA 1: TABLA COMPACTA Y REORGANIZADA (SIN CARGA VISUAL)
             ======================================================== */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/90 text-[11px] uppercase tracking-wider font-bold text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Evento / Acción</th>
                  <th className="py-3 px-4">Categoría</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Entidad</th>
                  <th className="py-3 px-4">Severidad</th>
                  <th className="py-3 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registros.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setEventoSeleccionado(item);
                      setModalDetalleAbierto(true);
                    }}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  >
                    {/* Fecha y Hora Limpias */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-mono text-slate-800 font-semibold block text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>

                    {/* Título Humanizado de la Acción */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block text-xs">
                        {humanizarAccion(item.action)}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[220px]">
                        {item.action}
                      </span>
                    </td>

                    {/* Categoría Concisa */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700">
                        {getTextoCategoria(item.categoria)}
                      </span>
                    </td>

                    {/* Usuario con Avatar Sutil */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-[#C6F432] flex items-center justify-center font-bold text-[9px] flex-shrink-0">
                          {(item.nombreUsuario || 'S')[0]}
                        </div>
                        <span className="font-medium text-slate-800 truncate max-w-[120px]">
                          {item.nombreUsuario || 'Sistema'}
                        </span>
                      </div>
                    </td>

                    {/* Entidad Afectada */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                      {item.entity}
                    </td>

                    {/* Severidad con Indicador Visual */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderInsigniaSeveridad(item.nivel)}
                    </td>

                    {/* Botón de Inspección */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEventoSeleccionado(item);
                          setModalDetalleAbierto(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ========================================================
             VISTA 2: TARJETAS DE ACTIVIDAD (FEED MENOS SOBRECARGADO)
             ======================================================== */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {registros.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setEventoSeleccionado(item);
                  setModalDetalleAbierto(true);
                }}
                className="p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer space-y-2 group shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block group-hover:text-slate-950">
                      {humanizarAccion(item.action)}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400 block truncate">
                      {item.entity} • {item.action}
                    </span>
                  </div>
                  {renderInsigniaSeveridad(item.nivel)}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-[#C6F432] flex items-center justify-center font-bold text-[8px] flex-shrink-0">
                      {(item.nombreUsuario || 'S')[0]}
                    </div>
                    <span className="truncate">{item.nombreUsuario || 'Sistema'}</span>
                  </div>

                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                    })}{' '}
                    •{' '}
                    {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación Limpia */}
        {totalPaginas > 1 && (
          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
            <span className="text-[11px] text-slate-400">
              Página {paginaActual} de {totalPaginas}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                disabled={paginaActual <= 1}
                className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                disabled={paginaActual >= totalPaginas}
                className="p-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </Tarjeta>

      {/* Pie de Página Discreto de Integridad */}
      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
        <Lock className="w-3.5 h-3.5 text-emerald-600" />
        <span>Garantía de Integridad: Registros inmutables protegidos con SHA-256 en PostgreSQL (audit_logs)</span>
      </div>

      {/* Modal de Detalle */}
      <ModalDetalleEventoAuditoria
        evento={eventoSeleccionado}
        abierto={modalDetalleAbierto}
        alCerrar={() => {
          setModalDetalleAbierto(false);
          setEventoSeleccionado(null);
        }}
      />

      {/* Modal para Registrar Evento */}
      <ModalRegistrarEventoAuditoria
        abierto={modalRegistrarAbierto}
        alCerrar={() => setModalRegistrarAbierto(false)}
        alRegistrarExitoso={() => {
          cargarDatos();
        }}
      />
    </div>
  );
};
