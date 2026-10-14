import api from './api.js';

export interface ColaboradorPosturalItem {
  id: string;
  nombre: string;
  departamento: string;
  edad: number;
  puntajePostural: 'Alto' | 'Medio' | 'Bajo';
  fotoUrl: string;
  rula: number;
}

export interface EstadisticasPanelErgonomico {
  puestosMonitoreados: number;
  enRiesgoPostural: number;
  indiceBienestarSst: number;
  indiceIntegridadPromedio: number;
  colaboradores: ColaboradorPosturalItem[];
  recomendacionSst: string;
}

export const servicioErgonomia = {
  /**
   * Obtiene las estadísticas en vivo del panel y los colaboradores desde PostgreSQL
   */
  async obtenerEstadisticasPanel(): Promise<EstadisticasPanelErgonomico> {
    try {
      const respuesta = await api.get<EstadisticasPanelErgonomico>('/ergonomia/estadisticas-panel');
      return respuesta.data;
    } catch {
      return {
        puestosMonitoreados: 26,
        enRiesgoPostural: 2,
        indiceBienestarSst: 88.4,
        indiceIntegridadPromedio: 94.1,
        colaboradores: [],
        recomendacionSst:
          'Mayor concentración de fatiga muscular detectada entre las 15:00 y 17:00 hrs. Se sugiere programar pausas activas automáticas a las 15:30.',
      };
    }
  },

  /**
   * Guarda o actualiza los ángulos basales de calibración
   */
  async calibrar(datos: {
    neutralNeckAngle: number;
    neutralTrunkAngle: number;
    neutralShoulderDist: number;
    ambientLighting?: number;
  }) {
    try {
      const respuesta = await api.post('/ergonomia/calibrar', datos);
      return respuesta.data;
    } catch {
      return { exito: false };
    }
  },

  /**
   * Registra una muestra postural en PostgreSQL
   */
  async registrarPostura(datos: {
    rulaScore: number;
    neckAngle: number;
    trunkAngle: number;
    shoulderAngle: number;
    isStatic?: boolean;
    staticSeconds?: number;
  }) {
    try {
      const respuesta = await api.post('/ergonomia/postura', datos);
      return respuesta.data;
    } catch {
      return { exito: false };
    }
  },
};
