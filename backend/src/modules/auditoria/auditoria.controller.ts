import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  HttpStatus,
  Ip,
  Headers,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuditoriaService } from './auditoria.service.js';
import { ConsultarAuditoriaDto } from './dto/consultar-auditoria.dto.js';
import { CrearRegistroAuditoriaDto } from './dto/crear-registro-auditoria.dto.js';

@Controller('auditoria')
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  /**
   * Consulta registros paginados e inmutables de auditoría técnica y seguridad
   * GET /auditoria
   */
  @Get()
  async consultar(@Query() query: ConsultarAuditoriaDto) {
    return this.auditoriaService.consultar(query);
  }

  /**
   * Obtiene métricas agregadas de seguridad y distribución de eventos
   * GET /auditoria/metricas
   */
  @Get('metricas')
  async obtenerMetricas() {
    return this.auditoriaService.obtenerMetricas();
  }

  /**
   * Verifica la integridad criptográfica de la bitácora completa
   * GET /auditoria/verificar-integridad
   */
  @Get('verificar-integridad')
  async verificarIntegridad() {
    return this.auditoriaService.verificarIntegridad();
  }

  /**
   * Registra un nuevo evento inmutable en la bitácora
   * POST /auditoria
   */
  @Post()
  async registrarEvento(
    @Body() dto: CrearRegistroAuditoriaDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    const ipReal = dto.ipAddress || ip || '127.0.0.1';
    const detallesEnriquecidos = {
      ...dto.detalles,
      userAgent: userAgent || 'Navegador Web visitask',
    };
    return this.auditoriaService.registrarEvento({
      ...dto,
      ipAddress: ipReal,
      detalles: detallesEnriquecidos,
    });
  }

  /**
   * Exporta la bitácora de auditoría a CSV
   * GET /auditoria/exportar/csv
   */
  @Get('exportar/csv')
  async exportarCsv(@Query() query: ConsultarAuditoriaDto, @Res() res: Response) {
    const csvContent = await this.auditoriaService.exportarCsv(query);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bitacora-auditoria-visitask-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(HttpStatus.OK).send(csvContent);
  }

  /**
   * Exporta la bitácora de auditoría a JSON estructurado con sello forense
   * GET /auditoria/exportar/json
   */
  @Get('exportar/json')
  async exportarJson(@Query() query: ConsultarAuditoriaDto, @Res() res: Response) {
    const jsonContent = await this.auditoriaService.exportarJson(query);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bitacora-auditoria-forense-${timestamp}.json`;

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(HttpStatus.OK).send(jsonContent);
  }
}
