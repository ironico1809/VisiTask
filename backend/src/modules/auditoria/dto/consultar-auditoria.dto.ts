export enum CategoriaAuditoriaEnum {
  TODOS = 'TODOS',
  ACCESO_DATOS = 'ACCESO_DATOS',
  MODIFICACION_POLITICA = 'MODIFICACION_POLITICA',
  AUTENTICACION_SEGURIDAD = 'AUTENTICACION_SEGURIDAD',
  EVENTO_SISTEMA = 'EVENTO_SISTEMA',
  INTEGRIDAD_SESION = 'INTEGRIDAD_SESION',
}

export enum NivelSeveridadEnum {
  INFO = 'INFO',
  ADVERTENCIA = 'ADVERTENCIA',
  CRITICO = 'CRITICO',
  SEGURIDAD = 'SEGURIDAD',
}

export class ConsultarAuditoriaDto {
  buscar?: string;
  categoria?: CategoriaAuditoriaEnum;
  accion?: string;
  entidad?: string;
  usuarioId?: string;
  nivel?: NivelSeveridadEnum;
  fechaInicio?: string;
  fechaFin?: string;
  limite?: number = 50;
  pagina?: number = 1;
}
