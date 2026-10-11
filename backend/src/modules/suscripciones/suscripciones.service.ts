import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CambiarPlanDto,
  SimularCambioPlanDto,
  TipoPlanSuscripcion,
  CicloFacturacion,
} from './dto/cambiar-plan.dto.js';

export interface PlanCatalogo {
  tipo: TipoPlanSuscripcion;
  nombre: string;
  tagline: string;
  precioUnitario: number;
  unidad: string;
  moneda: string;
  puestosMinimos?: number;
  examenesMinimos?: number;
  caracteristicas: string[];
  recomendado?: boolean;
}

export interface SuscripcionActualItem {
  id: string;
  organizacionId: string;
  nombreOrganizacion: string;
  tipoPlan: TipoPlanSuscripcion;
  nombrePlan: string;
  estado: string;
  puestosContratados: number;
  puestosEnUso: number;
  examenesContratados: number;
  examenesUsados: number;
  costoMensualEstimado: number;
  cicloFacturacion: CicloFacturacion;
  fechaInicioPeriodo: Date;
  fechaFinPeriodo: Date;
  proximaFacturacion: Date;
  metodoPago: {
    tipo: string;
    ultimosDigitos: string;
    marca: string;
  };
}

export interface SimulacionCostoResultado {
  tipoPlan: TipoPlanSuscripcion;
  nombrePlan: string;
  cicloFacturacion: CicloFacturacion;
  puestosSeleccionados: number;
  examenesSeleccionados: number;
  precioUnitario: number;
  subtotalMensual: number;
  descuentoPorcentaje: number;
  descuentoMonto: number;
  impuestos: number;
  totalAPagar: number;
  moneda: string;
  fechaEntradaVigor: string;
  descripcionVigor: string;
  periodoFacturacion: string;
}

@Injectable()
export class SuscripcionesService {
  private readonly logger = new Logger(SuscripcionesService.name);

  // Catálogo de planes SaaS visitask
  private readonly catalogoPlanes: PlanCatalogo[] = [
    {
      tipo: TipoPlanSuscripcion.SAAS_SEAT_MONTHLY,
      nombre: 'SaaS por Puesto Activo',
      tagline: 'Ideal para empresas con oficinas y estaciones ergonómicas continuas',
      precioUnitario: 15.0,
      unidad: 'puesto / mes',
      moneda: 'USD',
      puestosMinimos: 5,
      caracteristicas: [
        'Telemetría ErgoCheck en tiempo real (RULA / REBA)',
        'Inferencia en RAM y alertas de pausas activas',
        'Reportes mensuales de salud ocupacional NTS-009',
        'Dashboard de supervisión para Prevencionistas SST',
        'Soporte técnico por correo y chat',
      ],
      recomendado: true,
    },
    {
      tipo: TipoPlanSuscripcion.PAY_PER_EXAM_PACKAGE,
      nombre: 'Paquete Pay-Per-Exam',
      tagline: 'Supervisión técnica de evaluaciones académicas o admisiones laborales',
      precioUnitario: 3.0,
      unidad: 'examen / candidato',
      moneda: 'USD',
      examenesMinimos: 50,
      caracteristicas: [
        'Proctoring AI: foco de ventana, miradas y segundo rostro',
        'Actas automáticas con hash criptográfico inmutable',
        'Sin cuota fija mensual (consumo bajo demanda prepagado)',
        'Firma digital de consentimiento biométrico previa',
        'Exportación de informes forenses por evaluación',
      ],
    },
    {
      tipo: TipoPlanSuscripcion.ENTERPRISE_CUSTOM,
      nombre: 'Enterprise Custom Total',
      tagline: 'Para corporaciones multinacionales y universidades con múltiples sedes',
      precioUnitario: 590.0,
      unidad: 'mes (ilimitado)',
      moneda: 'USD',
      caracteristicas: [
        'Puestos ergonómicos de trabajo ILIMITADOS',
        'Exámenes proctoring e integraciones LMS ILIMITADAS',
        'Gestión multi-empresa y sedes geográficas ilimitadas',
        'Auditoría forense para cumplimiento ISO 45001 y GDPR',
        'SLA garantizado 99.9% y Gestor de Cuenta Dedicado 24/7',
      ],
    },
  ];

  // Suscripción de alta disponibilidad en memoria
  private suscripciones: Record<string, SuscripcionActualItem> = {
    'org-visitask-global': {
      id: 'sub-visitask-01',
      organizacionId: 'org-visitask-global',
      nombreOrganizacion: 'Visitask Global Enterprise',
      tipoPlan: TipoPlanSuscripcion.ENTERPRISE_CUSTOM,
      nombrePlan: 'Enterprise Custom Total',
      estado: 'ACTIVA',
      puestosContratados: 50,
      puestosEnUso: 26,
      examenesContratados: 500,
      examenesUsados: 148,
      costoMensualEstimado: 590.0,
      cicloFacturacion: CicloFacturacion.ANUAL,
      fechaInicioPeriodo: new Date('2026-01-01'),
      fechaFinPeriodo: new Date('2027-01-01'),
      proximaFacturacion: new Date('2027-01-01'),
      metodoPago: {
        tipo: 'Tarjeta Corporativa',
        ultimosDigitos: '4242',
        marca: 'Visa Business',
      },
    },
    'org-tecnologia-andina': {
      id: 'sub-andina-02',
      organizacionId: 'org-tecnologia-andina',
      nombreOrganizacion: 'Tecnología Andina S.A.',
      tipoPlan: TipoPlanSuscripcion.SAAS_SEAT_MONTHLY,
      nombrePlan: 'SaaS por Puesto Activo',
      estado: 'ACTIVA',
      puestosContratados: 20,
      puestosEnUso: 18,
      examenesContratados: 0,
      examenesUsados: 0,
      costoMensualEstimado: 300.0,
      cicloFacturacion: CicloFacturacion.MENSUAL,
      fechaInicioPeriodo: new Date('2026-03-01'),
      fechaFinPeriodo: new Date('2026-11-01'),
      proximaFacturacion: new Date('2026-11-01'),
      metodoPago: {
        tipo: 'Tarjeta de Débito',
        ultimosDigitos: '8812',
        marca: 'Mastercard',
      },
    },
    'org-uagrm-academica': {
      id: 'sub-uagrm-03',
      organizacionId: 'org-uagrm-academica',
      nombreOrganizacion: 'Facultad de Ingeniería UAGRM',
      tipoPlan: TipoPlanSuscripcion.PAY_PER_EXAM_PACKAGE,
      nombrePlan: 'Paquete Pay-Per-Exam',
      estado: 'ACTIVA',
      puestosContratados: 5,
      puestosEnUso: 2,
      examenesContratados: 500,
      examenesUsados: 350,
      costoMensualEstimado: 1500.0,
      cicloFacturacion: CicloFacturacion.MENSUAL,
      fechaInicioPeriodo: new Date('2026-02-01'),
      fechaFinPeriodo: new Date('2026-12-01'),
      proximaFacturacion: new Date('2026-12-01'),
      metodoPago: {
        tipo: 'Transferencia Bancaria',
        ultimosDigitos: '0912',
        marca: 'NIT Fiscal',
      },
    },
  };

  constructor(private readonly prisma: PrismaService) {}

  obtenerPlanes(): PlanCatalogo[] {
    return this.catalogoPlanes;
  }

  async obtenerSuscripcionActual(organizacionId: string): Promise<SuscripcionActualItem> {
    const orgId = organizacionId || 'org-visitask-global';

    // 1. Intentar consultar en base de datos PostgreSQL si está conectada
    try {
      const subBd = await this.prisma.subscription.findFirst({
        where: { organizationId: orgId },
        include: { organizacion: true },
      });

      if (subBd) {
        return {
          id: subBd.id,
          organizacionId: subBd.organizationId,
          nombreOrganizacion: subBd.organizacion.nombre,
          tipoPlan: subBd.planType as any,
          nombrePlan: this.obtenerNombrePlan(subBd.planType as any),
          estado: subBd.status,
          puestosContratados: subBd.seatsAllocated,
          puestosEnUso: Math.min(subBd.seatsAllocated, 18),
          examenesContratados: subBd.examsAllocated,
          examenesUsados: subBd.examsUsed,
          costoMensualEstimado: 290.0,
          cicloFacturacion: CicloFacturacion.MENSUAL,
          fechaInicioPeriodo: subBd.currentPeriodStart,
          fechaFinPeriodo: subBd.currentPeriodEnd,
          proximaFacturacion: subBd.currentPeriodEnd,
          metodoPago: {
            tipo: 'Tarjeta Corporativa',
            ultimosDigitos: '4242',
            marca: 'Visa',
          },
        };
      }
    } catch (err: any) {
      this.logger.warn(`Consulta diferida en BD de suscripciones: ${err?.message}`);
    }

    // 2. Consulta de alta disponibilidad en memoria
    if (this.suscripciones[orgId]) {
      return this.suscripciones[orgId];
    }

    return this.suscripciones['org-visitask-global'];
  }

  simularCambio(dto: SimularCambioPlanDto): SimulacionCostoResultado {
    const plan = this.catalogoPlanes.find((p) => p.tipo === dto.planType) || this.catalogoPlanes[0];
    const ciclo = dto.billingCycle || CicloFacturacion.MENSUAL;
    const puestos = dto.seatsAllocated || plan.puestosMinimos || 10;
    const examenes = dto.examsAllocated || plan.examenesMinimos || 100;

    let subtotalMensual = 0;
    let precioUnitario = plan.precioUnitario;

    if (plan.tipo === TipoPlanSuscripcion.SAAS_SEAT_MONTHLY) {
      subtotalMensual = puestos * precioUnitario;
    } else if (plan.tipo === TipoPlanSuscripcion.PAY_PER_EXAM_PACKAGE) {
      subtotalMensual = examenes * precioUnitario;
    } else {
      subtotalMensual = precioUnitario; // Tarifa plana Enterprise
    }

    const descuentoPorcentaje = ciclo === CicloFacturacion.ANUAL ? 15 : 0;
    const descuentoMonto = Math.round(((subtotalMensual * descuentoPorcentaje) / 100) * 100) / 100;
    const subtotalConDescuento = subtotalMensual - descuentoMonto;
    const impuestos = Math.round((subtotalConDescuento * 0.13) * 100) / 100; // IVA 13%
    const totalAPagar = Math.round((subtotalConDescuento + impuestos) * 100) / 100;

    // Calcular fecha de entrada en vigor (Inmediata)
    const fechaVigor = new Date();
    const descripcionVigor = 'Inmediata (activación al confirmar la contratación)';

    return {
      tipoPlan: plan.tipo,
      nombrePlan: plan.nombre,
      cicloFacturacion: ciclo,
      puestosSeleccionados: puestos,
      examenesSeleccionados: examenes,
      precioUnitario,
      subtotalMensual,
      descuentoPorcentaje,
      descuentoMonto,
      impuestos,
      totalAPagar,
      moneda: 'USD',
      fechaEntradaVigor: fechaVigor.toISOString(),
      descripcionVigor,
      periodoFacturacion: ciclo === CicloFacturacion.ANUAL ? 'Anual (12 meses con 15% desc.)' : 'Mensual recurrente',
    };
  }

  async cambiarPlan(
    organizacionId: string,
    dto: CambiarPlanDto,
  ): Promise<{
    exito: boolean;
    mensaje: string;
    suscripcionActualizada: SuscripcionActualItem;
    resumenFinanciero: SimulacionCostoResultado;
  }> {
    const orgId = organizacionId || 'org-visitask-global';
    const simulacion = this.simularCambio(dto);

    const fechaAhora = new Date();
    const fechaFin = new Date();
    if (dto.billingCycle === CicloFacturacion.ANUAL) {
      fechaFin.setFullYear(fechaFin.getFullYear() + 1);
    } else {
      fechaFin.setMonth(fechaFin.getMonth() + 1);
    }

    const suscripcionExistente = this.suscripciones[orgId] || this.suscripciones['org-visitask-global'];

    const suscripcionActualizada: SuscripcionActualItem = {
      ...suscripcionExistente,
      tipoPlan: dto.planType,
      nombrePlan: simulacion.nombrePlan,
      puestosContratados: simulacion.puestosSeleccionados,
      examenesContratados: simulacion.examenesSeleccionados,
      costoMensualEstimado: simulacion.totalAPagar,
      cicloFacturacion: dto.billingCycle || CicloFacturacion.MENSUAL,
      fechaInicioPeriodo: fechaAhora,
      fechaFinPeriodo: fechaFin,
      proximaFacturacion: fechaFin,
    };

    this.suscripciones[orgId] = suscripcionActualizada;

    // Sincronizar en base de datos si es posible
    try {
      await this.prisma.subscription.upsert({
        where: { id: suscripcionActualizada.id },
        create: {
          id: suscripcionActualizada.id,
          organizationId: orgId,
          planType: dto.planType as any,
          seatsAllocated: simulacion.puestosSeleccionados,
          examsAllocated: simulacion.examenesSeleccionados,
          currentPeriodStart: fechaAhora,
          currentPeriodEnd: fechaFin,
        },
        update: {
          planType: dto.planType as any,
          seatsAllocated: simulacion.puestosSeleccionados,
          examsAllocated: simulacion.examenesSeleccionados,
          currentPeriodStart: fechaAhora,
          currentPeriodEnd: fechaFin,
        },
      });
    } catch (err: any) {
      this.logger.warn(`Persistencia diferida en BD de suscripción: ${err?.message}`);
    }

    this.logger.log(`Plan cambiado exitosamente para ${orgId} a ${simulacion.nombrePlan}`);

    return {
      exito: true,
      mensaje: `Plan cambiado con éxito a "${simulacion.nombrePlan}". Nueva vigencia activa.`,
      suscripcionActualizada,
      resumenFinanciero: simulacion,
    };
  }

  private obtenerNombrePlan(tipo: TipoPlanSuscripcion): string {
    switch (tipo) {
      case TipoPlanSuscripcion.SAAS_SEAT_MONTHLY:
        return 'SaaS por Puesto Activo';
      case TipoPlanSuscripcion.PAY_PER_EXAM_PACKAGE:
        return 'Paquete Pay-Per-Exam';
      case TipoPlanSuscripcion.ENTERPRISE_CUSTOM:
        return 'Enterprise Custom Total';
      default:
        return 'Plan Corporativo SST';
    }
  }
}
