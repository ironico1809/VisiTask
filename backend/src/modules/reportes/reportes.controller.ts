import { Controller, Get, Post, Body, Param, Query, Headers, Ip, HttpCode, HttpStatus } from '@nestjs/common';
import { ReportesService, ItemReporte, MetricasSstGlobales } from './reportes.service.js';
import { CrearReporteDto } from './dto/crear-reporte.dto.js';

function extraerUsuarioDeCabecera(authHeader?: string): string | undefined {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return undefined;
  const token = authHeader.split(' ')[1];
  try {
    const base64Payload = token.split('.')[1];
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const json = JSON.parse(payloadStr);
    return json?.sub || json?.email;
  } catch {
    return undefined;
  }
}

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get()
  async listar(): Promise<ItemReporte[]> {
    return this.reportesService.listar();
  }

  @Get('metricas')
  async obtenerMetricas(): Promise<MetricasSstGlobales> {
    return this.reportesService.obtenerMetricas();
  }

  @Post('generar')
  @HttpCode(HttpStatus.CREATED)
  async generarReporte(
    @Body() dto: CrearReporteDto,
    @Headers('authorization') authHeader?: string,
    @Ip() ip?: string,
  ): Promise<ItemReporte> {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.reportesService.generarReporte(dto, usuarioId, ip);
  }

  @Get(':id/descargar')
  async descargarReporte(
    @Param('id') id: string,
    @Query('formato') formato: string = 'xlsx',
    @Headers('authorization') authHeader?: string,
    @Ip() ip?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.reportesService.descargarReporte(id, formato, usuarioId, ip);
  }
}
