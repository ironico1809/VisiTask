import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Headers,
  Ip,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  SupervisionService,
  MetricasSupervision,
  SesionSupervisionDetalle,
} from './supervision.service.js';
import { RegistrarTelemetriaDto } from './dto/registrar-telemetria.dto.js';
import { RegistrarMiradaDto } from './dto/registrar-mirada.dto.js';
import { AuditarIncidenteDto } from './dto/auditar-incidente.dto.js';
import {
  DispararPreguntaControlDto,
  CrearPreguntaControlDto,
} from './dto/disparar-pregunta-control.dto.js';
import { RegistrarReaccionEntrevistaDto } from './dto/registrar-reaccion-entrevista.dto.js';

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

@Controller('supervision')
export class SupervisionController {
  constructor(private readonly supervisionService: SupervisionService) {}

  @Get('sesiones')
  async listarSesiones() {
    return this.supervisionService.listarSesiones();
  }

  @Get('sesion-activa')
  async obtenerSesionActiva(@Headers('authorization') authHeader?: string) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.obtenerSesionActiva(usuarioId);
  }

  @Get('linea-tiempo')
  async obtenerLineaTiempoPorDefecto(): Promise<SesionSupervisionDetalle> {
    return this.supervisionService.obtenerDetalleSesionConLineaTiempo();
  }

  @Get('sesiones/:id/linea-tiempo')
  async obtenerLineaTiempoSesion(
    @Param('id') id: string,
  ): Promise<SesionSupervisionDetalle> {
    return this.supervisionService.obtenerDetalleSesionConLineaTiempo(id);
  }

  @Get('metricas')
  async obtenerMetricas(@Headers('authorization') authHeader?: string): Promise<MetricasSupervision> {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.obtenerMetricas(usuarioId);
  }

  @Get('incidentes')
  async listarIncidentes(@Headers('authorization') authHeader?: string) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.listarIncidentes(usuarioId);
  }

  @Patch('incidentes/:id/auditar')
  async auditarIncidente(
    @Param('id') id: string,
    @Body() dto: AuditarIncidenteDto,
    @Headers('authorization') authHeader?: string,
    @Ip() ip?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.auditarIncidente(id, dto, usuarioId, ip);
  }

  @Post('telemetria')
  @HttpCode(HttpStatus.OK)
  async registrarTelemetria(
    @Body() dto: RegistrarTelemetriaDto,
    @Headers('authorization') authHeader?: string,
    @Ip() ip?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.registrarTelemetria(dto, usuarioId, ip);
  }

  @Post('mirada')
  @HttpCode(HttpStatus.OK)
  async registrarMirada(
    @Body() dto: RegistrarMiradaDto,
    @Headers('authorization') authHeader?: string,
    @Ip() ip?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.registrarMirada(dto, usuarioId, ip);
  }

  @Get('preguntas-control')
  async listarPreguntasControl(@Query('assessmentId') assessmentId?: string) {
    return this.supervisionService.listarPreguntasControl(assessmentId);
  }

  @Post('preguntas-control')
  async crearPreguntaControl(
    @Body() dto: CrearPreguntaControlDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.crearPreguntaControl(dto, usuarioId);
  }

  @Post('preguntas-control/disparar')
  @HttpCode(HttpStatus.OK)
  async dispararPreguntaControl(
    @Body() dto: DispararPreguntaControlDto,
    @Headers('authorization') authHeader?: string,
    @Ip() ip?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.dispararPreguntaControl(dto, usuarioId, ip);
  }

  @Post('preguntas-control/reaccion')
  @HttpCode(HttpStatus.OK)
  async registrarReaccionEntrevista(
    @Body() dto: RegistrarReaccionEntrevistaDto,
    @Headers('authorization') authHeader?: string,
    @Ip() ip?: string,
  ) {
    const usuarioId = extraerUsuarioDeCabecera(authHeader);
    return this.supervisionService.registrarReaccionEntrevista(dto, usuarioId, ip);
  }

  @Get('sesiones/:id/reacciones')
  async listarReaccionesSesion(@Param('id') id: string) {
    return this.supervisionService.listarReaccionesSesion(id);
  }
}
