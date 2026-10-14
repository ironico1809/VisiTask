import { ConsultarAuditoriaDto } from './consultar-auditoria.dto.js';

export type FormatoExportacionAuditoria = 'csv' | 'json';

export class ExportarAuditoriaDto extends ConsultarAuditoriaDto {
  formato: FormatoExportacionAuditoria = 'csv';
}
