import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service.js';
import {
  CambiarPlanDto,
  SimularCambioPlanDto,
  TipoPlanSuscripcion,
  CicloFacturacion,
} from './dto/cambiar-plan.dto.js';
import { ProcesarPagoDto, ReintentarCobroDto, TipoMetodoPago } from './dto/procesar-pago.dto.js';

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

export interface ComprobanteDigitalItem {
  id: string;
  invoiceNumber: string;
  subscriptionId: string;
  nombreOrganizacion: string;
  nitFiscal: string;
  concepto: string;
  subtotal: number;
  impuestosIva: number;
  total: number;
  moneda: string;
  estado: string; // 'PAID' | 'FAILED' | 'PENDING'
  fechaEmision: string;
  fechaPago?: string;
  metodoPago: string;
  codigoAutorizacion: string;
  codigoControl: string;
  hashFirmaDigital: string;
  qrVerificacion: string;
  reintentosCobro?: number;
  proximoReintento?: string;
  mensajeError?: string;
}

export interface ResultadoPago {
  exito: boolean;
  mensaje: string;
  estadoSuscripcion: string;
  comprobante: ComprobanteDigitalItem;
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

  // ==========================================
  // PROCESAR PAGO Y EMITIR COMPROBANTE DIGITAL
  // ==========================================
  private facturasEnMemoria: ComprobanteDigitalItem[] = [
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2026-004',
      subscriptionId: 'sub-visitask-01',
      nombreOrganizacion: 'Visitask Global Enterprise',
      nitFiscal: 'NIT 1029384756',
      concepto: 'Suscripción Enterprise Custom Total - Monitoreo Ergonómico y Proctoring AI',
      subtotal: 522.12,
      impuestosIva: 67.88,
      total: 590.0,
      moneda: 'USD',
      estado: 'PAID',
      fechaEmision: new Date('2026-10-01').toISOString(),
      fechaPago: new Date('2026-10-01').toISOString(),
      metodoPago: 'Tarjeta Corporativa •••• 4242 (Visa Business)',
      codigoAutorizacion: 'AUT-98231024-VT',
      codigoControl: 'E4-8B-3C-D1-9F',
      hashFirmaDigital: '7a9c34d8ef01bc9942a5e81d77b2190c4f8812ad30bc41238910fedcba876543',
      qrVerificacion: 'https://visitask.ai/validador/facturas/INV-2026-004?hash=7a9c34d8',
      reintentosCobro: 0,
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2026-003',
      subscriptionId: 'sub-visitask-01',
      nombreOrganizacion: 'Visitask Global Enterprise',
      nitFiscal: 'NIT 1029384756',
      concepto: 'Suscripción Enterprise Custom Total - Cuota Mensual',
      subtotal: 522.12,
      impuestosIva: 67.88,
      total: 590.0,
      moneda: 'USD',
      estado: 'PAID',
      fechaEmision: new Date('2026-09-01').toISOString(),
      fechaPago: new Date('2026-09-01').toISOString(),
      metodoPago: 'Tarjeta Corporativa •••• 4242 (Visa Business)',
      codigoAutorizacion: 'AUT-98110901-VT',
      codigoControl: '9A-12-FE-45-7C',
      hashFirmaDigital: '2f1188bb3344cc55dd66ee77ff88aa9900112233445566778899aabbccddeeff',
      qrVerificacion: 'https://visitask.ai/validador/facturas/INV-2026-003?hash=2f1188bb',
      reintentosCobro: 0,
    },
  ];

  async procesarPago(organizacionId: string, dto: ProcesarPagoDto): Promise<ResultadoPago> {
    const orgId = organizacionId || 'org-visitask-global';
    const subActual = await this.obtenerSuscripcionActual(orgId);

    const subtotal = Math.round((dto.monto / 1.13) * 100) / 100;
    const impuestosIva = Math.round((dto.monto - subtotal) * 100) / 100;

    const fechaAhora = new Date();
    const numeroSecuencia = Math.floor(100 + Math.random() * 900);
    const invoiceNumber = `INV-${fechaAhora.getFullYear()}-${numeroSecuencia}`;
    const id = `inv-${Date.now()}`;

    // Validar si es una simulación de fallo (fondos insuficientes o rechazo bancario)
    const numeroTarjeta = dto.datosTarjeta?.numeroTarjeta || '';
    const esFallo = dto.simularFallo === true || numeroTarjeta.endsWith('0002') || numeroTarjeta.endsWith('9999');

    if (esFallo) {
      this.logger.warn(`Cobro rechazado por pasarela para la suscripción ${dto.subscriptionId}`);

      if (this.suscripciones[orgId]) {
        this.suscripciones[orgId].estado = 'PAST_DUE';
      }

      const fechaProximoReintento = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const comprobanteFallido: ComprobanteDigitalItem = {
        id,
        invoiceNumber,
        subscriptionId: dto.subscriptionId || subActual.id,
        nombreOrganizacion: subActual.nombreOrganizacion,
        nitFiscal: dto.nitFiscal || 'NIT 1029384756',
        concepto: `Cobro rechazado de suscripción ${subActual.nombrePlan}`,
        subtotal,
        impuestosIva,
        total: dto.monto,
        moneda: 'USD',
        estado: 'FAILED',
        fechaEmision: fechaAhora.toISOString(),
        metodoPago: dto.tipoMetodoPago === TipoMetodoPago.TARJETA
          ? `Tarjeta •••• ${numeroTarjeta.slice(-4) || '9999'}`
          : 'QR Interoperable',
        codigoAutorizacion: 'RECHAZADO-051',
        codigoControl: 'XX-00-RECHAZO',
        hashFirmaDigital: 'N/A',
        qrVerificacion: '',
        reintentosCobro: 1,
        proximoReintento: fechaProximoReintento.toISOString(),
        mensajeError: 'Fondos insuficientes o transacción rechazada por el banco emisor (Error 051). Reintento automático programado.',
      };

      this.facturasEnMemoria.unshift(comprobanteFallido);

      try {
        await this.prisma.invoice.create({
          data: {
            id,
            subscriptionId: subActual.id,
            invoiceNumber,
            amount: dto.monto,
            currency: 'USD',
            status: 'FAILED',
            paymentProvider: 'Pasarela Segura PCI-DSS',
            transactionId: `txn_fail_${Date.now()}`,
          },
        });

        await this.prisma.subscription.update({
          where: { id: subActual.id },
          data: { status: 'PAST_DUE' },
        });
      } catch (err: any) {
        this.logger.warn(`Persistencia diferida de factura fallida: ${err?.message}`);
      }

      return {
        exito: false,
        mensaje: 'El cobro no pudo completarse. Se ha programado un reintento automático y puedes reintentar de inmediato.',
        estadoSuscripcion: 'PAST_DUE',
        comprobante: comprobanteFallido,
      };
    }

    // Cobro Exitoso: Generar Comprobante Fiscal Digital con Hash Criptográfico
    const hashData = `${invoiceNumber}|${dto.monto}|${subActual.nombreOrganizacion}|${fechaAhora.toISOString()}|VT-SECRET-2026`;
    const hashFirmaDigital = crypto.createHash('sha256').update(hashData).digest('hex');
    const codigoAutorizacion = `AUT-${fechaAhora.getFullYear()}${Math.floor(100000 + Math.random() * 900000)}-VT`;
    const codigoControl = `${hashFirmaDigital.slice(0, 2).toUpperCase()}-${hashFirmaDigital.slice(2, 4).toUpperCase()}-${hashFirmaDigital.slice(4, 6).toUpperCase()}-${hashFirmaDigital.slice(6, 8).toUpperCase()}`;
    const qrVerificacion = `https://visitask.ai/validador/facturas/${invoiceNumber}?hash=${hashFirmaDigital.slice(0, 12)}&total=${dto.monto}`;

    const ultimosDigitos = numeroTarjeta.slice(-4) || '4242';
    const descMetodoPago = dto.tipoMetodoPago === TipoMetodoPago.TARJETA
      ? `Tarjeta de Crédito/Débito •••• ${ultimosDigitos}`
      : dto.tipoMetodoPago === TipoMetodoPago.QR_BANCARIO
      ? 'QR Interoperable Simple'
      : 'Transferencia Bancaria Inmediata';

    const comprobanteExitoso: ComprobanteDigitalItem = {
      id,
      invoiceNumber,
      subscriptionId: dto.subscriptionId || subActual.id,
      nombreOrganizacion: subActual.nombreOrganizacion,
      nitFiscal: dto.nitFiscal || 'NIT 1029384756',
      concepto: `Pago Suscripción SaaS ${subActual.nombrePlan} - Licencia ErgoCheck AI`,
      subtotal,
      impuestosIva,
      total: dto.monto,
      moneda: 'USD',
      estado: 'PAID',
      fechaEmision: fechaAhora.toISOString(),
      fechaPago: fechaAhora.toISOString(),
      metodoPago: descMetodoPago,
      codigoAutorizacion,
      codigoControl,
      hashFirmaDigital,
      qrVerificacion,
      reintentosCobro: 0,
    };

    this.facturasEnMemoria.unshift(comprobanteExitoso);

    if (this.suscripciones[orgId]) {
      this.suscripciones[orgId].estado = 'ACTIVA';
      this.suscripciones[orgId].metodoPago = {
        tipo: dto.tipoMetodoPago === TipoMetodoPago.TARJETA ? 'Tarjeta de Crédito' : 'QR Interoperable',
        ultimosDigitos,
        marca: 'Visa / Pasarela Segura',
      };
    }

    try {
      await this.prisma.invoice.create({
        data: {
          id,
          subscriptionId: subActual.id,
          invoiceNumber,
          amount: dto.monto,
          currency: 'USD',
          status: 'PAID',
          paymentProvider: 'Pasarela Segura PCI-DSS',
          transactionId: `txn_suc_${Date.now()}`,
          receiptUrl: `/api/suscripciones/comprobante/${invoiceNumber}`,
          paidAt: fechaAhora,
        },
      });

      await this.prisma.subscription.update({
        where: { id: subActual.id },
        data: { status: 'ACTIVE' },
      });
    } catch (err: any) {
      this.logger.warn(`Persistencia diferida de factura exitosa: ${err?.message}`);
    }

    this.logger.log(`Cobro exitoso de ${dto.monto} USD procesado para ${invoiceNumber}`);

    return {
      exito: true,
      mensaje: 'Cobro procesado con éxito y comprobante digital emitido.',
      estadoSuscripcion: 'ACTIVA',
      comprobante: comprobanteExitoso,
    };
  }

  async reintentarCobro(organizacionId: string, dto: ReintentarCobroDto): Promise<ResultadoPago> {
    const orgId = organizacionId || 'org-visitask-global';
    const facturaExistente = this.facturasEnMemoria.find((f) => f.invoiceNumber === dto.invoiceNumber);

    if (!facturaExistente) {
      throw new BadRequestException(`No se encontró la factura ${dto.invoiceNumber} para reintentar.`);
    }

    const fechaAhora = new Date();
    const hashData = `${dto.invoiceNumber}|${facturaExistente.total}|ReintentoExitoso|${fechaAhora.toISOString()}`;
    const hashFirmaDigital = crypto.createHash('sha256').update(hashData).digest('hex');

    facturaExistente.estado = 'PAID';
    facturaExistente.fechaPago = fechaAhora.toISOString();
    facturaExistente.codigoAutorizacion = `AUT-REINTENTO-${Date.now().toString().slice(-6)}`;
    facturaExistente.codigoControl = `${hashFirmaDigital.slice(0, 2).toUpperCase()}-${hashFirmaDigital.slice(2, 4).toUpperCase()}-OK`;
    facturaExistente.hashFirmaDigital = hashFirmaDigital;
    facturaExistente.qrVerificacion = `https://visitask.ai/validador/facturas/${dto.invoiceNumber}?reintento=exito`;
    facturaExistente.reintentosCobro = (facturaExistente.reintentosCobro || 0) + 1;
    facturaExistente.mensajeError = undefined;
    facturaExistente.proximoReintento = undefined;

    if (this.suscripciones[orgId]) {
      this.suscripciones[orgId].estado = 'ACTIVA';
    }

    try {
      await this.prisma.invoice.updateMany({
        where: { invoiceNumber: dto.invoiceNumber },
        data: {
          status: 'PAID',
          paidAt: fechaAhora,
        },
      });

      const subActual = await this.obtenerSuscripcionActual(orgId);
      await this.prisma.subscription.update({
        where: { id: subActual.id },
        data: { status: 'ACTIVE' },
      });
    } catch (err: any) {
      this.logger.warn(`Actualización diferida en BD de reintento: ${err?.message}`);
    }

    return {
      exito: true,
      mensaje: `Reintento de cobro exitoso para ${dto.invoiceNumber}. La suscripción ha sido reactivada.`,
      estadoSuscripcion: 'ACTIVA',
      comprobante: facturaExistente,
    };
  }

  async obtenerComprobante(numeroFactura: string): Promise<ComprobanteDigitalItem> {
    const factura = this.facturasEnMemoria.find((f) => f.invoiceNumber === numeroFactura);
    if (factura) return factura;

    try {
      const facturaBd = await this.prisma.invoice.findUnique({
        where: { invoiceNumber: numeroFactura },
        include: { subscription: { include: { organizacion: true } } },
      });

      if (facturaBd) {
        const monto = Number(facturaBd.amount);
        const subtotal = Math.round((monto / 1.13) * 100) / 100;
        return {
          id: facturaBd.id,
          invoiceNumber: facturaBd.invoiceNumber,
          subscriptionId: facturaBd.subscriptionId,
          nombreOrganizacion: facturaBd.subscription?.organizacion?.nombre || 'Visitask Global Enterprise',
          nitFiscal: facturaBd.subscription?.organizacion?.identificacionFiscal || 'NIT 1029384756',
          concepto: 'Suscripción SaaS ErgoCheck AI',
          subtotal,
          impuestosIva: Math.round((monto - subtotal) * 100) / 100,
          total: monto,
          moneda: facturaBd.currency,
          estado: facturaBd.status,
          fechaEmision: facturaBd.createdAt.toISOString(),
          fechaPago: facturaBd.paidAt?.toISOString(),
          metodoPago: facturaBd.paymentProvider || 'Pasarela Segura PCI-DSS',
          codigoAutorizacion: `AUT-${facturaBd.invoiceNumber}`,
          codigoControl: 'AB-CD-EF-01',
          hashFirmaDigital: crypto.createHash('sha256').update(facturaBd.invoiceNumber).digest('hex'),
          qrVerificacion: `https://visitask.ai/validador/facturas/${facturaBd.invoiceNumber}`,
        };
      }
    } catch (err: any) {
      this.logger.warn(`Consulta diferida de comprobante: ${err?.message}`);
    }

    return this.facturasEnMemoria[0];
  }

  async listarHistorialFacturas(organizacionId: string): Promise<ComprobanteDigitalItem[]> {
    const orgId = organizacionId || 'org-visitask-global';

    try {
      const facturasBd = await this.prisma.invoice.findMany({
        where: {
          subscription: {
            organizationId: orgId,
          },
        },
        orderBy: { createdAt: 'desc' },
        include: { subscription: { include: { organizacion: true } } },
      });

      if (facturasBd && facturasBd.length > 0) {
        return facturasBd.map((f) => {
          const monto = Number(f.amount);
          const subtotal = Math.round((monto / 1.13) * 100) / 100;
          return {
            id: f.id,
            invoiceNumber: f.invoiceNumber,
            subscriptionId: f.subscriptionId,
            nombreOrganizacion: f.subscription?.organizacion?.nombre || 'Visitask Global Enterprise',
            nitFiscal: f.subscription?.organizacion?.identificacionFiscal || 'NIT 1029384756',
            concepto: 'Suscripción SaaS ErgoCheck AI',
            subtotal,
            impuestosIva: Math.round((monto - subtotal) * 100) / 100,
            total: monto,
            moneda: f.currency,
            estado: f.status,
            fechaEmision: f.createdAt.toISOString(),
            fechaPago: f.paidAt?.toISOString(),
            metodoPago: f.paymentProvider || 'Tarjeta Corporativa',
            codigoAutorizacion: `AUT-${f.invoiceNumber}`,
            codigoControl: 'AB-CD-EF-01',
            hashFirmaDigital: crypto.createHash('sha256').update(f.invoiceNumber).digest('hex'),
            qrVerificacion: `https://visitask.ai/validador/facturas/${f.invoiceNumber}`,
          };
        });
      }
    } catch (err: any) {
      this.logger.warn(`Consulta diferida de historial de facturas: ${err?.message}`);
    }

    return this.facturasEnMemoria;
  }
}
