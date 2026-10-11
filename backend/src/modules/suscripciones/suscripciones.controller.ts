import { Controller, Get, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { SuscripcionesService } from './suscripciones.service.js';
import { CambiarPlanDto, SimularCambioPlanDto } from './dto/cambiar-plan.dto.js';

function extraerOrganizacionIdDeCabecera(authHeader?: string): string {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return 'org-visitask-global';
  const token = authHeader.split(' ')[1];
  try {
    const base64Payload = token.split('.')[1];
    const payloadStr = Buffer.from(base64Payload, 'base64').toString('utf8');
    const json = JSON.parse(payloadStr);
    return json?.organizationId || json?.organizacionId || 'org-visitask-global';
  } catch {
    return 'org-visitask-global';
  }
}

@Controller('suscripciones')
export class SuscripcionesController {
  constructor(private readonly suscripcionesService: SuscripcionesService) {}

  @Get('planes')
  obtenerPlanes() {
    return this.suscripcionesService.obtenerPlanes();
  }

  @Get('actual')
  async obtenerActual(@Headers('authorization') authHeader?: string) {
    const organizacionId = extraerOrganizacionIdDeCabecera(authHeader);
    return this.suscripcionesService.obtenerSuscripcionActual(organizacionId);
  }

  @Post('simular')
  @HttpCode(HttpStatus.OK)
  simularCambio(@Body() dto: SimularCambioPlanDto) {
    return this.suscripcionesService.simularCambio(dto);
  }

  @Post('cambiar-plan')
  @HttpCode(HttpStatus.OK)
  async cambiarPlan(
    @Headers('authorization') authHeader: string | undefined,
    @Body() dto: CambiarPlanDto,
  ) {
    const organizacionId = extraerOrganizacionIdDeCabecera(authHeader);
    return this.suscripcionesService.cambiarPlan(organizacionId, dto);
  }
}
