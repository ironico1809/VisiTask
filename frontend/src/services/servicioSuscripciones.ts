import { api } from './api.js';
import type {
  PlanCatalogo,
  SuscripcionActualItem,
  SimulacionCostoResultado,
  CambiarPlanPeticion,
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
};
