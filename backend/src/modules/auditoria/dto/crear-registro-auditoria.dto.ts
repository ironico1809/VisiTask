import { CategoriaAuditoriaEnum, NivelSeveridadEnum } from './consultar-auditoria.dto.js';

export class CrearRegistroAuditoriaDto {
  accion?: string;
  action?: string;
  categoria?: CategoriaAuditoriaEnum;
  entidad?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  nombreUsuario?: string;
  correoUsuario?: string;
  rolUsuario?: string;
  ipAddress?: string;
  nivel?: NivelSeveridadEnum = NivelSeveridadEnum.INFO;
  detalles?: Record<string, any>;
  details?: Record<string, any>;
  motivo?: string;
}
