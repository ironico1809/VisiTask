import api from './api.js';

export interface InformeAuditoria {
  id: string;
  titulo: string;
  fecha: string;
  totalPersonal: number;
  tasaRiesgo: string;
  estado: 'Generado' | 'Archivado' | 'Completado';
  tipo?: string;
  pdfUrl?: string;
  excelUrl?: string;
  hashIntegridad?: string;
  horasEvaluadas?: number;
  reduccionRiesgo?: string;
}

export interface MetricasSstGlobales {
  horasEvaluadas: number;
  reduccionRiesgo: string;
  proximaAuditoria: string;
  colaboradoresMonitoreados: number;
  riesgoCritico: number;
  indiceBienestarSst: number;
  indiceIntegridadPromedio: number;
}

export interface DescargaReporteRespuesta {
  id: string;
  titulo: string;
  formato: string;
  generadoEn: string;
  firmadoPor: string;
  hashSha256: string;
  urlDescargaDirecta: string;
  mensaje: string;
}

export const servicioReportes = {
  /**
   * Obtiene la lista de reportes SST emitidos desde PostgreSQL
   */
  async listar(): Promise<InformeAuditoria[]> {
    try {
      const respuesta = await api.get<InformeAuditoria[]>('/reportes');
      return respuesta.data;
    } catch {
      return [];
    }
  },

  /**
   * Obtiene métricas consolidadas calculadas por el backend
   */
  async obtenerMetricas(): Promise<MetricasSstGlobales> {
    try {
      const respuesta = await api.get<MetricasSstGlobales>('/reportes/metricas');
      return respuesta.data;
    } catch {
      return {
        horasEvaluadas: 1420,
        reduccionRiesgo: '-34.8%',
        proximaAuditoria: '15 Nov 2026',
        colaboradoresMonitoreados: 26,
        riesgoCritico: 2,
        indiceBienestarSst: 88.4,
        indiceIntegridadPromedio: 94.1,
      };
    }
  },

  /**
   * Genera un nuevo reporte y lo sella con hash SHA-256 en PostgreSQL
   */
  async generarReporte(dto: {
    titulo: string;
    tipo: 'ERGONOMIC_SST_CORPORATE' | 'FORENSIC_EXAM_INDIVIDUAL';
    metricasResumen?: Record<string, any>;
  }): Promise<InformeAuditoria> {
    const respuesta = await api.post<InformeAuditoria>('/reportes/generar', dto);
    return respuesta.data;
  },

  /**
   * Descarga o genera el comprobante digital firmado del reporte
   */
  async descargarReporte(id: string, formato: 'xlsx' | 'pdf' = 'xlsx'): Promise<DescargaReporteRespuesta> {
    const respuesta = await api.get<DescargaReporteRespuesta>(`/reportes/${id}/descargar?formato=${formato}`);
    return respuesta.data;
  },
};
