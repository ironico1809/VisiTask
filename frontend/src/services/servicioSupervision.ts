import api from './api.js';

export interface MetricasSupervision {
  conteoDesviosFoco: number;
  alertasMiradaBaja: number;
  bloqueosPortapapeles: number;
  tiempoRestante: string;
  indiceIntegridad: number;
  totalIncidentes: number;
  sesionId: string;
  urlExamen: string;
}

export interface IncidenteSupervision {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'FLAGGED_AUTOMATIC' | 'CONFIRMED_VIOLATION' | 'DISMISSED_FALSE_POSITIVE';
  correlatedRule: string;
  timestamp: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  evidenceSummary?: Record<string, any>;
}

export interface EventoLineaTiempo {
  id: string;
  timestamp: string;
  minutoSegundo: string;
  tiempoRelativoMinutos: number;
  tipo: 'TELEMETRIA' | 'MIRADA' | 'ROSTRO' | 'INCIDENTE' | 'ENTREVISTA';
  subtipo: string;
  titulo: string;
  descripcion: string;
  severidad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
  icono: string;
  color: string;
  evidencia?: Record<string, any>;
  incidenteId?: string;
  estadoIncidente?: 'FLAGGED_AUTOMATIC' | 'CONFIRMED_VIOLATION' | 'DISMISSED_FALSE_POSITIVE';
  revisadoPor?: string;
  revisadoEn?: string;
  justificacion?: string;
}

export interface PreguntaControl {
  id: string;
  assessmentId: string;
  questionText: string;
  orderIndex: number;
  createdAt?: string;
}

export interface ReaccionEntrevista {
  id: string;
  supervisionSessionId: string;
  questionId: string;
  stimulusTimestamp: string;
  reactionLatencyMs: number;
  facialTensionDelta: number;
  smileIncongruityScore: number;
  surpriseScore: number;
  cognitiveStressScore: number;
  question?: PreguntaControl;
}

export interface RespuestaDisparoPregunta {
  exito: boolean;
  mensaje: string;
  sesionId: string;
  questionId: string;
  questionText: string;
  duracionVentanaSegundos: number;
  timestamp: string;
}

export interface RespuestaRegistroReaccion {
  exito: boolean;
  mensaje: string;
  reaccion: ReaccionEntrevista;
  esAnomalo: boolean;
  incidente?: IncidenteSupervision | null;
}

export interface SesionSupervisionDetalle {
  id: string;
  postulante: {
    id: string;
    nombre: string;
    correo: string;
    fotoUrl?: string;
  };
  evaluacion: {
    id: string;
    titulo: string;
    codigoAcceso: string;
    duracionMinutos: number;
  };
  estado: string;
  inicio: string;
  fin?: string;
  duracionMinutosTranscurridos: number;
  indiceIntegridad: number;
  resumenIncidentes: {
    total: number;
    pendientes: number;
    confirmados: number;
    falsosPositivos: number;
  };
  lineaTiempo: EventoLineaTiempo[];
}

export interface RespuestaAuditoriaIncidente {
  exito: boolean;
  mensaje: string;
  incidente: {
    id: string;
    status: string;
    reviewedAt: string;
    justificacion: string;
    evaluador: string;
  };
}

export const servicioSupervision = {
  /**
   * Obtiene la sesión supervisada activa
   */
  async obtenerSesionActiva() {
    try {
      const respuesta = await api.get('/supervision/sesion-activa');
      return respuesta.data;
    } catch {
      return null;
    }
  },

  /**
   * Lista sesiones registradas para auditoría
   */
  async listarSesiones() {
    try {
      const respuesta = await api.get('/supervision/sesiones');
      return respuesta.data;
    } catch {
      return [];
    }
  },

  /**
   * Obtiene la cronología gráfica completa (línea de tiempo) de una sesión
   */
  async obtenerLineaTiempo(sesionId?: string): Promise<SesionSupervisionDetalle> {
    const url = sesionId ? `/supervision/sesiones/${sesionId}/linea-tiempo` : '/supervision/linea-tiempo';
    const respuesta = await api.get<SesionSupervisionDetalle>(url);
    return respuesta.data;
  },

  /**
   * Audita manualmente un incidente: validar o desestimar (falso positivo)
   */
  async auditarIncidente(
    incidenteId: string,
    datos: {
      estado: 'CONFIRMED_VIOLATION' | 'DISMISSED_FALSE_POSITIVE';
      justificacion: string;
      notasEvaluador?: string;
    },
  ): Promise<RespuestaAuditoriaIncidente> {
    const respuesta = await api.patch<RespuestaAuditoriaIncidente>(
      `/supervision/incidentes/${incidenteId}/auditar`,
      datos,
    );
    return respuesta.data;
  },

  /**
   * Obtiene métricas en vivo de la supervisión
   */
  async obtenerMetricas(): Promise<MetricasSupervision> {
    try {
      const respuesta = await api.get<MetricasSupervision>('/supervision/metricas');
      return respuesta.data;
    } catch {
      return {
        conteoDesviosFoco: 0,
        alertasMiradaBaja: 1,
        bloqueosPortapapeles: 2,
        tiempoRestante: '42:15',
        indiceIntegridad: 94,
        totalIncidentes: 1,
        sesionId: 'ses-supervision-01',
        urlExamen: 'https://docs.google.com/forms/d/e/exam-uagrm-2026/viewform',
      };
    }
  },

  /**
   * Registra un evento de telemetría en PostgreSQL (desenfoque, tecla, portapapeles)
   */
  async registrarTelemetria(datos: {
    type: string;
    details?: string;
    supervisionSessionId?: string;
  }) {
    try {
      const respuesta = await api.post('/supervision/telemetria', datos);
      return respuesta.data;
    } catch {
      return { exito: false };
    }
  },

  /**
   * Registra un evento biométrico de desvío ocular
   */
  async registrarMirada(datos: {
    pitch: number;
    yaw: number;
    roll: number;
    irisOffsetX: number;
    irisOffsetY: number;
    isSuspectedLapPhone?: boolean;
    durationSeconds?: number;
    supervisionSessionId?: string;
  }) {
    try {
      const respuesta = await api.post('/supervision/mirada', datos);
      return respuesta.data;
    } catch {
      return { exito: false };
    }
  },

  /**
   * Lista los incidentes de supervisión
   */
  async listarIncidentes(): Promise<IncidenteSupervision[]> {
    try {
      const respuesta = await api.get<IncidenteSupervision[]>('/supervision/incidentes');
      return respuesta.data;
    } catch {
      return [];
    }
  },

  /**
   * Obtiene la lista de preguntas de control institucional (Interview Mode)
   */
  async listarPreguntasControl(assessmentId?: string): Promise<PreguntaControl[]> {
    try {
      const url = assessmentId
        ? `/supervision/preguntas-control?assessmentId=${assessmentId}`
        : '/supervision/preguntas-control';
      const respuesta = await api.get<PreguntaControl[]>(url);
      return respuesta.data;
    } catch {
      return [
        {
          id: 'ques-01',
          assessmentId: 'asm-01',
          questionText: '¿Podría explicar brevemente la lógica de la última función que implementó?',
          orderIndex: 1,
        },
        {
          id: 'ques-02',
          assessmentId: 'asm-01',
          questionText: '¿Está consultando alguna fuente externa o dispositivo fuera de pantalla en este momento?',
          orderIndex: 2,
        },
        {
          id: 'ques-03',
          assessmentId: 'asm-01',
          questionText: '¿Cuál es la complejidad temporal asintótica del algoritmo que seleccionó?',
          orderIndex: 3,
        },
        {
          id: 'ques-04',
          assessmentId: 'asm-01',
          questionText: 'Mire fijamente a la cámara durante 5 segundos y confirme que comprende las reglas de integridad.',
          orderIndex: 4,
        },
      ];
    }
  },

  /**
   * Dispara una pregunta de control para abrir la ventana focalizada de telemetría biométrica
   */
  async dispararPreguntaControl(datos: {
    questionId?: string;
    questionText?: string;
    supervisionSessionId?: string;
    duracionVentanaSegundos?: number;
  }): Promise<RespuestaDisparoPregunta> {
    const respuesta = await api.post<RespuestaDisparoPregunta>(
      '/supervision/preguntas-control/disparar',
      datos,
    );
    return respuesta.data;
  },

  /**
   * Registra la reacción biométrica inmediata capturada durante la ventana de la pregunta de control
   */
  async registrarReaccionEntrevista(datos: {
    questionId: string;
    supervisionSessionId: string;
    reactionLatencyMs: number;
    facialTensionDelta: number;
    smileIncongruityScore: number;
    surpriseScore: number;
    cognitiveStressScore: number;
    stimulusTimestamp?: string;
  }): Promise<RespuestaRegistroReaccion> {
    const respuesta = await api.post<RespuestaRegistroReaccion>(
      '/supervision/preguntas-control/reaccion',
      datos,
    );
    return respuesta.data;
  },

  /**
   * Obtiene el histórico de reacciones a preguntas de control de una sesión
   */
  async listarReaccionesSesion(sesionId: string): Promise<ReaccionEntrevista[]> {
    try {
      const respuesta = await api.get<ReaccionEntrevista[]>(
        `/supervision/sesiones/${sesionId}/reacciones`,
      );
      return respuesta.data;
    } catch {
      return [];
    }
  },
};
