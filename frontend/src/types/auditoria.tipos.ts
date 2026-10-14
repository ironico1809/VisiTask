export type CategoriaAuditoria =
  | 'TODOS'
  | 'ACCESO_DATOS'
  | 'MODIFICACION_POLITICA'
  | 'AUTENTICACION_SEGURIDAD'
  | 'EVENTO_SISTEMA'
  | 'INTEGRIDAD_SESION';

export type NivelSeveridadAuditoria =
  | 'INFO'
  | 'ADVERTENCIA'
  | 'CRITICO'
  | 'SEGURIDAD';

export interface RegistroAuditoria {
  id: string;
  userId?: string | null;
  nombreUsuario?: string;
  correoUsuario?: string;
  rolUsuario?: string;
  action: string;
  categoria: CategoriaAuditoria;
  entity: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
  nivel: NivelSeveridadAuditoria;
  hashIntegridad: string;
  createdAt: string;
}

export interface FiltrosAuditoria {
  buscar?: string;
  categoria?: CategoriaAuditoria;
  accion?: string;
  entidad?: string;
  nivel?: NivelSeveridadAuditoria | 'TODOS';
  fechaRango?: 'HOY' | '7_DIAS' | '30_DIAS' | 'TODO';
  fechaInicio?: string;
  fechaFin?: string;
  limite?: number;
  pagina?: number;
}

export interface MetricasAuditoria {
  totalRegistros: number;
  totalAccesosDatos: number;
  totalModificacionesPoliticas: number;
  totalEventosSeguridad: number;
  totalEventosCriticos: number;
  registrosUltimas24Horas: number;
  estadoInmutabilidad: {
    valido: boolean;
    algoritmo: string;
    totalVerificados: number;
    mensaje: string;
  };
  distribucionCategorias: Record<string, number>;
  distribucionSeveridad: Record<string, number>;
}

export interface ResultadoVerificacionIntegridad {
  valido: boolean;
  totalVerificados: number;
  mensaje: string;
  hashRaizLote: string;
}

export interface RespuestaConsultaAuditoria {
  registros: RegistroAuditoria[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface CrearRegistroAuditoriaPeticion {
  accion: string;
  categoria?: CategoriaAuditoria;
  entidad: string;
  entityId?: string;
  userId?: string;
  nombreUsuario?: string;
  correoUsuario?: string;
  rolUsuario?: string;
  ipAddress?: string;
  nivel?: NivelSeveridadAuditoria;
  detalles?: Record<string, any>;
  motivo?: string;
}
