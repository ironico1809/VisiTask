import { api } from './api.js';
import type {
  RegistroAuditoria,
  FiltrosAuditoria,
  MetricasAuditoria,
  ResultadoVerificacionIntegridad,
  RespuestaConsultaAuditoria,
  CrearRegistroAuditoriaPeticion,
} from '../types/auditoria.tipos.js';

export const servicioAuditoria = {
  /**
   * Consulta registros paginados e inmutables directamente desde el backend PostgreSQL
   */
  async consultar(filtros: FiltrosAuditoria): Promise<RespuestaConsultaAuditoria> {
    const params: Record<string, string> = {};

    if (filtros.buscar) params.buscar = filtros.buscar;
    if (filtros.categoria && filtros.categoria !== 'TODOS') params.categoria = filtros.categoria;
    if (filtros.accion) params.accion = filtros.accion;
    if (filtros.entidad) params.entidad = filtros.entidad;
    if (filtros.nivel && filtros.nivel !== 'TODOS') params.nivel = filtros.nivel;
    if (filtros.fechaInicio) params.fechaInicio = filtros.fechaInicio;
    if (filtros.fechaFin) params.fechaFin = filtros.fechaFin;
    if (filtros.limite) params.limite = String(filtros.limite);
    if (filtros.pagina) params.pagina = String(filtros.pagina);

    // Si viene rango rápido, calcular fechas para el backend
    if (filtros.fechaRango && filtros.fechaRango !== 'TODO' && !filtros.fechaInicio) {
      const ahora = new Date();
      let dias = 1;
      if (filtros.fechaRango === '7_DIAS') dias = 7;
      if (filtros.fechaRango === '30_DIAS') dias = 30;
      const fechaDesde = new Date(ahora.getTime() - dias * 24 * 60 * 60 * 1000);
      params.fechaInicio = fechaDesde.toISOString();
    }

    const respuesta = await api.get<RespuestaConsultaAuditoria>('/auditoria', { params });
    return respuesta.data;
  },

  /**
   * Obtiene métricas agregadas directamente desde el backend PostgreSQL
   */
  async obtenerMetricas(): Promise<MetricasAuditoria> {
    const respuesta = await api.get<MetricasAuditoria>('/auditoria/metricas');
    return respuesta.data;
  },

  /**
   * Ejecuta verificación criptográfica SHA-256 en el backend PostgreSQL
   */
  async verificarIntegridad(): Promise<ResultadoVerificacionIntegridad> {
    const respuesta = await api.get<ResultadoVerificacionIntegridad>('/auditoria/verificar-integridad');
    return respuesta.data;
  },

  /**
   * Registra un nuevo evento inmutable en PostgreSQL a través del backend
   */
  async registrarEvento(peticion: CrearRegistroAuditoriaPeticion): Promise<RegistroAuditoria> {
    const respuesta = await api.post<RegistroAuditoria>('/auditoria', peticion);
    return respuesta.data;
  },

  /**
   * Descarga la bitácora de auditoría en formato CSV directamente del backend
   */
  async descargarCsv(filtros: FiltrosAuditoria): Promise<void> {
    const params = new URLSearchParams();
    if (filtros.buscar) params.append('buscar', filtros.buscar);
    if (filtros.categoria && filtros.categoria !== 'TODOS') params.append('categoria', filtros.categoria);
    if (filtros.nivel && filtros.nivel !== 'TODOS') params.append('nivel', filtros.nivel);
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);

    const respuesta = await api.get(`/auditoria/exportar/csv?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([respuesta.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `bitacora-auditoria-visitask-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Descarga el paquete forense firmado en JSON directamente del backend
   */
  async descargarJson(filtros: FiltrosAuditoria): Promise<void> {
    const params = new URLSearchParams();
    if (filtros.buscar) params.append('buscar', filtros.buscar);
    if (filtros.categoria && filtros.categoria !== 'TODOS') params.append('categoria', filtros.categoria);
    if (filtros.nivel && filtros.nivel !== 'TODOS') params.append('nivel', filtros.nivel);

    const respuesta = await api.get(`/auditoria/exportar/json?${params.toString()}`, {
      responseType: 'blob',
    });

    const blob = new Blob([respuesta.data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `bitacora-auditoria-forense-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.URL.revokeObjectURL(url);
  },
};
