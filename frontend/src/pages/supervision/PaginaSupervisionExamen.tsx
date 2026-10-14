import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Maximize2,
  ExternalLink,
  Clock,
  Eye,
  Smartphone,
  History,
  CheckCircle2,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import {
  servicioSupervision,
  type MetricasSupervision,
  type SesionSupervisionDetalle,
  type EventoLineaTiempo,
  type RespuestaAuditoriaIncidente,
} from '../../services/servicioSupervision.js';
import { ModalAuditarIncidente } from './ModalAuditarIncidente.js';
import { PanelPreguntasControlEntrevista } from './PanelPreguntasControlEntrevista.js';

export const PaginaSupervisionExamen: React.FC = () => {
  useTituloPagina('Supervisión de Evaluación');

  // Pestaña activa: Línea de Tiempo vs Preguntas de Control (Interview) vs Monitoreo
  const [pestañaActiva, setPestañaActiva] = useState<
    'linea-tiempo' | 'entrevista' | 'monitoreo'
  >('linea-tiempo');

  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);
  const [metricas, setMetricas] = useState<MetricasSupervision>({
    conteoDesviosFoco: 0,
    alertasMiradaBaja: 1,
    bloqueosPortapapeles: 2,
    tiempoRestante: '42:15',
    indiceIntegridad: 94,
    totalIncidentes: 1,
    sesionId: 'ses-supervision-01',
    urlExamen: 'https://docs.google.com/forms/d/e/exam-uagrm-2026/viewform',
  });
  const [mensajeNotificacion, setMensajeNotificacion] = useState<string | null>(null);

  // Estados de la Línea de Tiempo y Auditoría
  const [detalleSesion, setDetalleSesion] = useState<SesionSupervisionDetalle | null>(null);
  const [cargandoLineaTiempo, setCargandoLineaTiempo] = useState<boolean>(true);
  const [filtroTipo, setFiltroTipo] = useState<
    'TODOS' | 'INCIDENTES' | 'ENTREVISTA' | 'TELEMETRIA' | 'BIOMETRIA'
  >('TODOS');
  const [eventoParaAuditar, setEventoParaAuditar] = useState<EventoLineaTiempo | null>(null);
  const [modalAuditarAbierto, setModalAuditarAbierto] = useState<boolean>(false);

  // Cargar estado inicial y línea de tiempo desde PostgreSQL
  const recargarLineaTiempo = async () => {
    setCargandoLineaTiempo(true);
    try {
      const data = await servicioSupervision.obtenerLineaTiempo(metricas.sesionId);
      if (data) {
        setDetalleSesion(data);
        setMetricas((prev) => ({
          ...prev,
          indiceIntegridad: data.indiceIntegridad,
          totalIncidentes: data.resumenIncidentes.total,
        }));
      }
    } finally {
      setCargandoLineaTiempo(false);
    }
  };

  useEffect(() => {
    servicioSupervision.obtenerMetricas().then((res) => {
      if (res) setMetricas(res);
    }).catch(() => {});

    recargarLineaTiempo();
  }, []);

  // Detector de visibilidad de pestaña y bloqueo de atajos en cliente conectado a PostgreSQL
  useEffect(() => {
    const alCambiarVisibilidad = async () => {
      if (document.hidden) {
        setMetricas((prev) => ({
          ...prev,
          conteoDesviosFoco: prev.conteoDesviosFoco + 1,
          indiceIntegridad: Math.max(70, prev.indiceIntegridad - 2),
        }));

        await servicioSupervision.registrarTelemetria({
          type: 'WINDOW_BLUR',
          details: 'Pérdida de foco de pestaña (Page Visibility API)',
          supervisionSessionId: metricas.sesionId,
        });

        setMensajeNotificacion('Desvío registrado en PostgreSQL: Se detectó cambio o desenfoque de pestaña.');
        recargarLineaTiempo();
      }
    };

    const alCopiarPegar = async (e: ClipboardEvent) => {
      e.preventDefault();
      setMetricas((prev) => ({
        ...prev,
        bloqueosPortapapeles: prev.bloqueosPortapapeles + 1,
      }));

      await servicioSupervision.registrarTelemetria({
        type: 'CLIPBOARD_PASTE_BLOCKED',
        details: 'Intento de copiar o pegar bloqueado por el sandbox de supervisión',
        supervisionSessionId: metricas.sesionId,
      });

      setMensajeNotificacion('Acción restringida: Portapapeles bloqueado en entorno de evaluación.');
      recargarLineaTiempo();
    };

    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    document.addEventListener('copy', alCopiarPegar);
    document.addEventListener('paste', alCopiarPegar);

    return () => {
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      document.removeEventListener('copy', alCopiarPegar);
      document.removeEventListener('paste', alCopiarPegar);
    };
  }, [metricas.sesionId]);

  const alternarPantallaCompleta = async () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setEsPantallaCompleta(true));
    } else {
      document.exitFullscreen().then(async () => {
        setEsPantallaCompleta(false);
        await servicioSupervision.registrarTelemetria({
          type: 'FULLSCREEN_EXIT',
          details: 'El postulante salió voluntariamente del modo pantalla completa',
          supervisionSessionId: metricas.sesionId,
        });
        recargarLineaTiempo();
      });
    }
  };

  const simularDesvioMiradaBaja = async () => {
    setMetricas((prev) => ({
      ...prev,
      alertasMiradaBaja: prev.alertasMiradaBaja + 1,
      totalIncidentes: prev.totalIncidentes + 1,
      indiceIntegridad: Math.max(65, prev.indiceIntegridad - 8),
    }));

    await servicioSupervision.registrarMirada({
      pitch: -32.4,
      yaw: 14.2,
      roll: 2.1,
      irisOffsetX: 0.12,
      irisOffsetY: -0.45,
      isSuspectedLapPhone: true,
      durationSeconds: 4.5,
      supervisionSessionId: metricas.sesionId,
    });

    setMensajeNotificacion(
      'Incidente de seguridad registrado en PostgreSQL: Desvío persistente hacia dispositivo en plano inferior.',
    );
    recargarLineaTiempo();
  };

  const abrirAuditoriaIncidente = (ev: EventoLineaTiempo) => {
    setEventoParaAuditar(ev);
    setModalAuditarAbierto(true);
  };

  const manejarAuditoriaExitosa = (respuesta: RespuestaAuditoriaIncidente) => {
    setMensajeNotificacion(respuesta.mensaje);
    recargarLineaTiempo();
  };

  // Filtrado de eventos en la línea de tiempo
  const eventosFiltrados = (detalleSesion?.lineaTiempo || []).filter((ev) => {
    if (filtroTipo === 'TODOS') return true;
    if (filtroTipo === 'INCIDENTES') return ev.tipo === 'INCIDENTE';
    if (filtroTipo === 'ENTREVISTA') return ev.tipo === 'ENTREVISTA';
    if (filtroTipo === 'TELEMETRIA') return ev.tipo === 'TELEMETRIA';
    if (filtroTipo === 'BIOMETRIA') return ev.tipo === 'MIRADA' || ev.tipo === 'ROSTRO';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Selector de Pestañas de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setPestañaActiva('linea-tiempo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              pestañaActiva === 'linea-tiempo'
                ? 'bg-[#0B1020] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5 text-[#C6F432]" />
            <span>Línea de Tiempo y Auditoría</span>
            {detalleSesion?.resumenIncidentes.pendientes ? (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                {detalleSesion.resumenIncidentes.pendientes}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setPestañaActiva('entrevista')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              pestañaActiva === 'entrevista'
                ? 'bg-[#0B1020] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#C6F432]" />
            <span>Preguntas de Control (Entrevista)</span>
          </button>

          <button
            type="button"
            onClick={() => setPestañaActiva('monitoreo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              pestañaActiva === 'monitoreo'
                ? 'bg-[#0B1020] text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#C6F432]" />
            <span>Monitoreo y Sandbox en Vivo</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span>PostgreSQL Live Sync</span>
        </div>
      </div>

      {/* Banner de Notificación */}
      {mensajeNotificacion && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-300 text-emerald-950 rounded-2xl flex items-center justify-between text-xs animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{mensajeNotificacion}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeNotificacion(null)}
            className="text-emerald-800 hover:text-emerald-950 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 1: LÍNEA DE TIEMPO Y AUDITORÍA MANUAL
          ======================================================== */}
      {pestañaActiva === 'linea-tiempo' && (
        <div className="space-y-6">
          {/* Tarjeta de Encabezado de la Sesión Auditada */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Información del Postulante y Examen */}
              <div className="flex items-center gap-4">
                <img
                  src={
                    detalleSesion?.postulante.fotoUrl ||
                    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces'
                  }
                  alt={detalleSesion?.postulante.nombre || 'Postulante'}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-['Bricolage_Grotesque']">
                      {detalleSesion?.postulante.nombre || 'Ana María Suárez'}
                    </h3>
                    <Insignia variante="marca" className="text-[10px] py-0 px-2 font-mono">
                      {detalleSesion?.evaluacion.codigoAcceso || 'UAGRM-2026-ING'}
                    </Insignia>
                  </div>
                  <p className="text-xs text-slate-300">
                    {detalleSesion?.evaluacion.titulo || 'Evaluación Técnica de Selección de Software e Ingeniería'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Sesión ID: {detalleSesion?.id || 'ses-supervision-01'} • Duración transcurrida: {detalleSesion?.duracionMinutosTranscurridos || 45} min
                  </p>
                </div>
              </div>

              {/* Score de Integridad y Resumen de Incidentes */}
              <div className="flex flex-wrap items-center gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
                <div className="text-center pr-4 border-r border-slate-700">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Índice Integridad
                  </span>
                  <span
                    className={`text-2xl font-black font-['Bricolage_Grotesque'] ${
                      (detalleSesion?.indiceIntegridad || 94) >= 85
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {detalleSesion?.indiceIntegridad || 94}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Pendientes</span>
                    <span className="text-sm font-bold text-amber-400">
                      {detalleSesion?.resumenIncidentes.pendientes ?? 1}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Confirmados</span>
                    <span className="text-sm font-bold text-rose-400">
                      {detalleSesion?.resumenIncidentes.confirmados ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">Falsos Pos.</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {detalleSesion?.resumenIncidentes.falsosPositivos ?? 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráfico Visual de Línea de Tiempo (Timeline Bar) */}
          <Tarjeta
            titulo="Cronología Gráfica de la Sesión"
            subtitulo="Distribución temporal de eventos de telemetría, biometría ocular e incidentes reportados"
            accion={
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                {(['TODOS', 'INCIDENTES', 'ENTREVISTA', 'TELEMETRIA', 'BIOMETRIA'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFiltroTipo(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      filtroTipo === t
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t === 'TODOS'
                      ? 'Todos'
                      : t === 'INCIDENTES'
                      ? 'Incidentes'
                      : t === 'ENTREVISTA'
                      ? 'Preguntas Control'
                      : t === 'TELEMETRIA'
                      ? 'Telemetría'
                      : 'Biometría'}
                  </button>
                ))}
              </div>
            }
          >
            {/* Barra Gráfica de Tiempo (0 a 45 minutos) */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 mb-6">
              <div className="flex justify-between text-[11px] font-mono text-slate-400 font-semibold px-1">
                <span>00:00 (Inicio)</span>
                <span>15:00</span>
                <span>30:00</span>
                <span>45:00 (Actual)</span>
              </div>

              {/* Riel temporal interactivo */}
              <div className="relative h-6 bg-slate-200 rounded-full w-full overflow-hidden flex items-center">
                <div
                  className="h-full bg-slate-300/80 rounded-full"
                  style={{ width: '100%' }}
                />

                {/* Marcadores de eventos en el riel */}
                {(detalleSesion?.lineaTiempo || []).map((ev) => {
                  const posPorcentaje = Math.min(
                    96,
                    Math.max(2, (ev.tiempoRelativoMinutos / 45) * 100),
                  );
                  return (
                    <button
                      key={ev.id}
                      type="button"
                      onClick={() => ev.tipo === 'INCIDENTE' && abrirAuditoriaIncidente(ev)}
                      title={`${ev.minutoSegundo} - ${ev.titulo}`}
                      className="absolute -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white shadow-md transition-transform hover:scale-150 cursor-pointer"
                      style={{
                        left: `${posPorcentaje}%`,
                        backgroundColor: ev.color,
                      }}
                    />
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>Incidente Crítico</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    <span>Pregunta de Control</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
                    <span>Pérdida de Foco</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                    <span>Portapapeles</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                    <span>Rostro / Biometría</span>
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Haz clic en un incidente para abrir su dictamen técnico
                </span>
              </div>
            </div>

            {/* Lista Cronológica de Eventos Auditables */}
            {cargandoLineaTiempo ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-[#0B1020]" />
                <span>Cargando eventos cronológicos de PostgreSQL...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {eventosFiltrados.map((ev) => (
                  <div
                    key={ev.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      ev.tipo === 'INCIDENTE'
                        ? ev.estadoIncidente === 'CONFIRMED_VIOLATION'
                          ? 'bg-rose-50/70 border-rose-200'
                          : ev.estadoIncidente === 'DISMISSED_FALSE_POSITIVE'
                          ? 'bg-emerald-50/70 border-emerald-200'
                          : 'bg-amber-50/80 border-amber-200 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Lado Izquierdo: Minuto y Datos del Evento */}
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 text-white shadow-xs"
                          style={{ backgroundColor: ev.color }}
                        >
                          {ev.minutoSegundo}
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{ev.titulo}</span>
                            <Insignia
                              variante={
                                ev.severidad === 'CRITICA' || ev.severidad === 'ALTA'
                                  ? 'peligro'
                                  : ev.severidad === 'MEDIA'
                                  ? 'advertencia'
                                  : 'informacion'
                              }
                              className="text-[10px] py-0 px-2"
                            >
                              {ev.tipo} • {ev.severidad}
                            </Insignia>

                            {ev.estadoIncidente && (
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                  ev.estadoIncidente === 'CONFIRMED_VIOLATION'
                                    ? 'bg-rose-600 text-white'
                                    : ev.estadoIncidente === 'DISMISSED_FALSE_POSITIVE'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-500 text-slate-950 animate-pulse'
                                }`}
                              >
                                {ev.estadoIncidente === 'CONFIRMED_VIOLATION'
                                  ? 'Infracción Confirmada'
                                  : ev.estadoIncidente === 'DISMISSED_FALSE_POSITIVE'
                                  ? 'Falso Positivo Desestimado'
                                  : 'Pendiente de Auditoría'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{ev.descripcion}</p>

                          {/* Justificación del Evaluador si ya fue auditado */}
                          {ev.justificacion && (
                            <div className="p-2.5 bg-white/80 rounded-xl border border-slate-200 text-[11px] text-slate-700 mt-2 space-y-0.5">
                              <span className="font-bold text-slate-900 block">
                                Dictamen firmado por {ev.revisadoPor || 'Evaluador SST'}:
                              </span>
                              <p className="italic text-slate-600 leading-normal">{ev.justificacion}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Lado Derecho: Acciones de Auditoría Manual */}
                      <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                        {ev.tipo === 'INCIDENTE' ? (
                          <Boton
                            tamano="sm"
                            variante={ev.estadoIncidente === 'FLAGGED_AUTOMATIC' ? 'primario' : 'borde'}
                            onClick={() => abrirAuditoriaIncidente(ev)}
                            className="text-xs gap-1.5 cursor-pointer shadow-xs"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>
                              {ev.estadoIncidente === 'FLAGGED_AUTOMATIC'
                                ? 'Auditar Incidente'
                                : 'Modificar Dictamen'}
                            </span>
                          </Boton>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Date(ev.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Tarjeta>
        </div>
      )}

      {/* ========================================================
          PESTAÑA 2: PREGUNTAS DE CONTROL (MODO ENTREVISTA)
          ======================================================== */}
      {pestañaActiva === 'entrevista' && (
        <PanelPreguntasControlEntrevista
          sesionId={detalleSesion?.id || metricas.sesionId}
          alRegistrarEvento={recargarLineaTiempo}
        />
      )}

      {/* ========================================================
          PESTAÑA 3: MONITOREO Y EVALUACIÓN EN VIVO (SANDBOX)
          ======================================================== */}
      {pestañaActiva === 'monitoreo' && (
        <div className="space-y-6">
          {/* Banner Superior: Modo Supervisado Activo */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0B1020] border border-slate-700 text-[#C6F432] flex items-center justify-center font-bold">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">Sesión Supervisada de Evaluación</h3>
                  <Insignia variante="marca" className="text-[10px] py-0 px-2">
                    Conectado a PostgreSQL
                  </Insignia>
                </div>
                <p className="text-xs text-slate-400">
                  Evaluación Técnica de Selección — Integración Agnóstica con Formulario Externo
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>
                  Tiempo Restante: <strong>{metricas.tiempoRestante}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={simularDesvioMiradaBaja}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Simular desvío hacia teléfono y registrar incidente en PostgreSQL"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Simular Mirada Baja</span>
              </button>

              <Boton
                tamano="sm"
                variante="borde"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs gap-1.5 cursor-pointer"
                onClick={alternarPantallaCompleta}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>{esPantallaCompleta ? 'Salir de Pantalla Completa' : 'Activar Pantalla Completa'}</span>
              </Boton>
            </div>
          </div>

          {/* Franja de Contadores de Telemetría */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Tarjeta className="p-4 flex items-center justify-between border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Pérdidas de Foco (Blur/Alt+Tab)</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{metricas.conteoDesviosFoco} Eventos</h4>
              </div>
              <Insignia variante={metricas.conteoDesviosFoco > 0 ? 'advertencia' : 'exito'}>
                {metricas.conteoDesviosFoco > 0 ? 'Alerta Registrada' : 'Sin Desvíos'}
              </Insignia>
            </Tarjeta>

            <Tarjeta className="p-4 flex items-center justify-between border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Sospecha de Dispositivo Externo</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{metricas.alertasMiradaBaja} Incidente</h4>
              </div>
              <Insignia variante="peligro">Mirada Baja Detectada</Insignia>
            </Tarjeta>

            <Tarjeta className="p-4 flex items-center justify-between border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Bloqueo de Portapapeles</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{metricas.bloqueosPortapapeles} Bloqueos</h4>
              </div>
              <Insignia variante="exito">Copiar/Pegar Inhabilitado</Insignia>
            </Tarjeta>

            <Tarjeta className="p-4 flex items-center justify-between border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Índice de Integridad</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{metricas.indiceIntegridad}%</h4>
              </div>
              <Insignia variante={metricas.indiceIntegridad >= 85 ? 'exito' : 'advertencia'}>
                {metricas.indiceIntegridad >= 85 ? 'Confiable' : 'Revisión Manual'}
              </Insignia>
            </Tarjeta>
          </div>

          {/* Sandbox Agnóstico de Examen Externo */}
          <Tarjeta
            titulo="Formulario de Evaluación de Terceros"
            subtitulo="Entorno de examen desplegado dentro del marco de supervisión con telemetría activa en PostgreSQL"
            className="p-0 overflow-hidden"
          >
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-mono">
                URL: {metricas.urlExamen}
              </span>
              <Insignia variante="marca" className="gap-1">
                <Eye className="w-3 h-3" />
                <span>Telemetría de Navegación Conectada</span>
              </Insignia>
            </div>

            <div className="h-[480px] w-full bg-slate-100 flex flex-col items-center justify-center p-8 text-center border-t border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0B1020] mb-4 border border-slate-200">
                <ExternalLink className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Visor de Examen Externo Integrado</h4>
              <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                Aquí se proyecta de forma transparente el formulario o examen de Google Forms / LMS mientras los
                detectores locales de desvío ocular y teclas prohibidas auditan en segundo plano y persisten
                los eventos en PostgreSQL.
              </p>
              <Boton tamano="sm" variante="primario" className="text-xs cursor-pointer">
                Comenzar Llenado de Examen
              </Boton>
            </div>
          </Tarjeta>
        </div>
      )}

      {/* Modal de Auditoría Manual de Incidentes */}
      <ModalAuditarIncidente
        abierto={modalAuditarAbierto}
        alCerrar={() => setModalAuditarAbierto(false)}
        evento={eventoParaAuditar}
        alGuardarExitoso={manejarAuditoriaExitosa}
      />
    </div>
  );
};
