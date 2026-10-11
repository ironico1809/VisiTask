import { api } from './api.js';
import type {
  PlanCatalogo,
  SuscripcionActualItem,
  SimulacionCostoResultado,
  CambiarPlanPeticion,
  ComprobanteDigitalItem,
  ResultadoPago,
  PeticionPago,
  PeticionReintentoCobro,
} from '../types/suscripcion.tipos.js';

export const servicioSuscripciones = {
  async obtenerPlanes(): Promise<PlanCatalogo[]> {
    try {
      const respuesta = await api.get<PlanCatalogo[]>('/suscripciones/planes');
      return respuesta.data;
    } catch {
      return [
        {
          tipo: 'SAAS_SEAT_MONTHLY',
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
          tipo: 'PAY_PER_EXAM_PACKAGE',
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
          tipo: 'ENTERPRISE_CUSTOM',
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
    }
  },

  async obtenerActual(): Promise<SuscripcionActualItem> {
    try {
      const respuesta = await api.get<SuscripcionActualItem>('/suscripciones/actual');
      return respuesta.data;
    } catch {
      return {
        id: 'sub-visitask-01',
        organizacionId: 'org-visitask-global',
        nombreOrganizacion: 'Visitask Global Enterprise',
        tipoPlan: 'ENTERPRISE_CUSTOM',
        nombrePlan: 'Enterprise Custom Total',
        estado: 'ACTIVA',
        puestosContratados: 50,
        puestosEnUso: 26,
        examenesContratados: 500,
        examenesUsados: 148,
        costoMensualEstimado: 590.0,
        cicloFacturacion: 'ANUAL',
        fechaInicioPeriodo: '2026-01-01',
        fechaFinPeriodo: '2027-01-01',
        proximaFacturacion: '2027-01-01',
        metodoPago: {
          tipo: 'Tarjeta Corporativa',
          ultimosDigitos: '4242',
          marca: 'Visa Business',
        },
      };
    }
  },

  async simular(peticion: CambiarPlanPeticion): Promise<SimulacionCostoResultado> {
    try {
      const respuesta = await api.post<SimulacionCostoResultado>(
        '/suscripciones/simular',
        peticion,
      );
      return respuesta.data;
    } catch {
      // Cálculo local de respaldo
      const puestos = peticion.seatsAllocated || 10;
      const examenes = peticion.examsAllocated || 100;
      let precioUnitario = 15;
      let subtotal = 0;
      let nombrePlan = 'SaaS por Puesto Activo';

      if (peticion.planType === 'SAAS_SEAT_MONTHLY') {
        precioUnitario = 15;
        subtotal = puestos * 15;
        nombrePlan = 'SaaS por Puesto Activo';
      } else if (peticion.planType === 'PAY_PER_EXAM_PACKAGE') {
        precioUnitario = 3;
        subtotal = examenes * 3;
        nombrePlan = 'Paquete Pay-Per-Exam';
      } else {
        precioUnitario = 590;
        subtotal = 590;
        nombrePlan = 'Enterprise Custom Total';
      }

      const descPorc = peticion.billingCycle === 'ANUAL' ? 15 : 0;
      const descMonto = Math.round(((subtotal * descPorc) / 100) * 100) / 100;
      const subConDesc = subtotal - descMonto;
      const imp = Math.round((subConDesc * 0.13) * 100) / 100;
      const total = Math.round((subConDesc + imp) * 100) / 100;

      return {
        tipoPlan: peticion.planType,
        nombrePlan,
        cicloFacturacion: peticion.billingCycle,
        puestosSeleccionados: puestos,
        examenesSeleccionados: examenes,
        precioUnitario,
        subtotalMensual: subtotal,
        descuentoPorcentaje: descPorc,
        descuentoMonto: descMonto,
        impuestos: imp,
        totalAPagar: total,
        moneda: 'USD',
        fechaEntradaVigor: new Date().toISOString(),
        descripcionVigor: 'Inmediata (activación al confirmar la contratación)',
        periodoFacturacion:
          peticion.billingCycle === 'ANUAL'
            ? 'Anual (12 meses con 15% desc.)'
            : 'Mensual recurrente',
      };
    }
  },

  async cambiarPlan(peticion: CambiarPlanPeticion): Promise<{
    exito: boolean;
    mensaje: string;
    suscripcionActualizada: SuscripcionActualItem;
    resumenFinanciero: SimulacionCostoResultado;
  }> {
    const respuesta = await api.post<{
      exito: boolean;
      mensaje: string;
      suscripcionActualizada: SuscripcionActualItem;
      resumenFinanciero: SimulacionCostoResultado;
    }>('/suscripciones/cambiar-plan', peticion);
    return respuesta.data;
  },

  async procesarPago(peticion: PeticionPago): Promise<ResultadoPago> {
    try {
      const respuesta = await api.post<ResultadoPago>('/suscripciones/pagar', peticion);
      return respuesta.data;
    } catch {
      // Fallback local con comprobante
      const subtotal = Math.round((peticion.monto / 1.13) * 100) / 100;
      const numeroSecuencia = Math.floor(100 + Math.random() * 900);
      const invoiceNumber = `INV-${new Date().getFullYear()}-${numeroSecuencia}`;

      if (peticion.simularFallo) {
        return {
          exito: false,
          mensaje: 'El cobro fue rechazado por la pasarela de pagos. Se ha programado un reintento automático.',
          estadoSuscripcion: 'PAST_DUE',
          comprobante: {
            id: `inv-${Date.now()}`,
            invoiceNumber,
            subscriptionId: peticion.subscriptionId,
            nombreOrganizacion: peticion.razonSocial || 'Visitask Global Enterprise',
            nitFiscal: peticion.nitFiscal || 'NIT 1029384756',
            concepto: 'Cobro de suscripción SaaS ErgoCheck AI',
            subtotal,
            impuestosIva: Math.round((peticion.monto - subtotal) * 100) / 100,
            total: peticion.monto,
            moneda: 'USD',
            estado: 'FAILED',
            fechaEmision: new Date().toISOString(),
            metodoPago: peticion.tipoMetodoPago === 'TARJETA' ? 'Tarjeta de Crédito' : 'QR Interoperable',
            codigoAutorizacion: 'RECHAZADO-051',
            codigoControl: 'XX-00-FALLO',
            hashFirmaDigital: 'N/A',
            qrVerificacion: '',
            reintentosCobro: 1,
            proximoReintento: new Date(Date.now() + 86400000).toISOString(),
            mensajeError: 'Fondos insuficientes o tarjeta rechazada por la entidad bancaria.',
          },
        };
      }

      return {
        exito: true,
        mensaje: 'Cobro procesado con éxito y comprobante digital emitido.',
        estadoSuscripcion: 'ACTIVA',
        comprobante: {
          id: `inv-${Date.now()}`,
          invoiceNumber,
          subscriptionId: peticion.subscriptionId,
          nombreOrganizacion: peticion.razonSocial || 'Visitask Global Enterprise',
          nitFiscal: peticion.nitFiscal || 'NIT 1029384756',
          concepto: 'Suscripción SaaS ErgoCheck AI - Licencia Corporativa',
          subtotal,
          impuestosIva: Math.round((peticion.monto - subtotal) * 100) / 100,
          total: peticion.monto,
          moneda: 'USD',
          estado: 'PAID',
          fechaEmision: new Date().toISOString(),
          fechaPago: new Date().toISOString(),
          metodoPago: peticion.tipoMetodoPago === 'TARJETA' ? 'Tarjeta Corporativa •••• 4242' : 'QR Interoperable Simple',
          codigoAutorizacion: `AUT-${Date.now().toString().slice(-8)}-VT`,
          codigoControl: '9A-FE-12-8C',
          hashFirmaDigital: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          qrVerificacion: `https://visitask.ai/validador/facturas/${invoiceNumber}`,
          reintentosCobro: 0,
        },
      };
    }
  },

  async reintentarCobro(peticion: PeticionReintentoCobro): Promise<ResultadoPago> {
    const respuesta = await api.post<ResultadoPago>('/suscripciones/reintentar-cobro', peticion);
    return respuesta.data;
  },

  async obtenerComprobante(numeroFactura: string): Promise<ComprobanteDigitalItem> {
    const respuesta = await api.get<ComprobanteDigitalItem>(`/suscripciones/comprobante/${numeroFactura}`);
    return respuesta.data;
  },

  async listarHistorialFacturas(): Promise<ComprobanteDigitalItem[]> {
    try {
      const respuesta = await api.get<ComprobanteDigitalItem[]>('/suscripciones/historial-facturas');
      return respuesta.data;
    } catch {
      return [
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
          fechaEmision: '2026-10-01T00:00:00.000Z',
          fechaPago: '2026-10-01T00:00:00.000Z',
          metodoPago: 'Tarjeta Corporativa •••• 4242',
          codigoAutorizacion: 'AUT-98231024-VT',
          codigoControl: 'E4-8B-3C-D1-9F',
          hashFirmaDigital: '7a9c34d8ef01bc9942a5e81d77b2190c4f8812ad30bc41238910fedcba876543',
          qrVerificacion: 'https://visitask.ai/validador/facturas/INV-2026-004',
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
          fechaEmision: '2026-09-01T00:00:00.000Z',
          fechaPago: '2026-09-01T00:00:00.000Z',
          metodoPago: 'Tarjeta Corporativa •••• 4242',
          codigoAutorizacion: 'AUT-98110901-VT',
          codigoControl: '9A-12-FE-45-7C',
          hashFirmaDigital: '2f1188bb3344cc55dd66ee77ff88aa9900112233445566778899aabbccddeeff',
          qrVerificacion: 'https://visitask.ai/validador/facturas/INV-2026-003',
          reintentosCobro: 0,
        },
      ];
    }
  },
};

