export type TipoPlanSuscripcion =
  | 'SAAS_SEAT_MONTHLY'
  | 'PAY_PER_EXAM_PACKAGE'
  | 'ENTERPRISE_CUSTOM';

export type CicloFacturacion = 'MENSUAL' | 'ANUAL';

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

export interface MetodoPagoItem {
  tipo: string;
  ultimosDigitos: string;
  marca: string;
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
  fechaInicioPeriodo: string | Date;
  fechaFinPeriodo: string | Date;
  proximaFacturacion: string | Date;
  metodoPago: MetodoPagoItem;
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

export interface CambiarPlanPeticion {
  planType: TipoPlanSuscripcion;
  billingCycle: CicloFacturacion;
  seatsAllocated?: number;
  examsAllocated?: number;
}
