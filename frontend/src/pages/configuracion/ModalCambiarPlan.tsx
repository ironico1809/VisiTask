import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Sparkles,
  Users,
  ShieldCheck,
  Percent,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import type {
  TipoPlanSuscripcion,
  CicloFacturacion,
  PlanCatalogo,
  SimulacionCostoResultado,
  SuscripcionActualItem,
} from '../../types/suscripcion.tipos.js';
import { servicioSuscripciones } from '../../services/servicioSuscripciones.js';

interface PropiedadesModalCambiarPlan {
  abierto: boolean;
  alCerrar: () => void;
  planInicial?: TipoPlanSuscripcion;
  suscripcionActual?: SuscripcionActualItem | null;
  planes: PlanCatalogo[];
  alConfirmarExitoso: (suscripcionActualizada: SuscripcionActualItem) => void;
}

export const ModalCambiarPlan: React.FC<PropiedadesModalCambiarPlan> = ({
  abierto,
  alCerrar,
  planInicial = 'SAAS_SEAT_MONTHLY',
  suscripcionActual,
  planes,
  alConfirmarExitoso,
}) => {
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPlanSuscripcion>(planInicial);
  const [ciclo, setCiclo] = useState<CicloFacturacion>('MENSUAL');
  const [puestos, setPuestos] = useState<number>(10);
  const [examenes, setExamenes] = useState<number>(100);
  const [simulacion, setSimulacion] = useState<SimulacionCostoResultado | null>(null);
  const [cargandoSimulacion, setCargandoSimulacion] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar estado cuando se abre el modal
  useEffect(() => {
    if (abierto) {
      setTipoSeleccionado(planInicial);
      if (suscripcionActual) {
        setCiclo(suscripcionActual.cicloFacturacion || 'MENSUAL');
        setPuestos(Math.max(suscripcionActual.puestosContratados || 10, 5));
        setExamenes(Math.max(suscripcionActual.examenesContratados || 100, 50));
      }
      setError(null);
    }
  }, [abierto, planInicial, suscripcionActual]);

  // Recalcular simulación cada vez que cambien los parámetros
  useEffect(() => {
    if (!abierto) return;

    let cancelado = false;
    const ejecutarSimulacion = async () => {
      setCargandoSimulacion(true);
      try {
        const resultado = await servicioSuscripciones.simular({
          planType: tipoSeleccionado,
          billingCycle: ciclo,
          seatsAllocated: tipoSeleccionado === 'SAAS_SEAT_MONTHLY' ? puestos : undefined,
          examsAllocated: tipoSeleccionado === 'PAY_PER_EXAM_PACKAGE' ? examenes : undefined,
        });
        if (!cancelado) {
          setSimulacion(resultado);
        }
      } catch (err: any) {
        if (!cancelado) {
          setError('No fue posible previsualizar el costo en tiempo real.');
        }
      } finally {
        if (!cancelado) {
          setCargandoSimulacion(false);
        }
      }
    };

    ejecutarSimulacion();

    return () => {
      cancelado = true;
    };
  }, [abierto, tipoSeleccionado, ciclo, puestos, examenes]);

  if (!abierto) return null;

  const planDetalle = planes.find((p) => p.tipo === tipoSeleccionado) || planes[0];

  const manejarConfirmacion = async () => {
    try {
      setGuardando(true);
      setError(null);

      const respuesta = await servicioSuscripciones.cambiarPlan({
        planType: tipoSeleccionado,
        billingCycle: ciclo,
        seatsAllocated: tipoSeleccionado === 'SAAS_SEAT_MONTHLY' ? puestos : undefined,
        examsAllocated: tipoSeleccionado === 'PAY_PER_EXAM_PACKAGE' ? examenes : undefined,
      });

      if (respuesta.exito) {
        alConfirmarExitoso(respuesta.suscripcionActualizada);
        alCerrar();
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al procesar el cambio de plan.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="modal-superposicion">
      <div className="modal-contenedor-plan">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#0B1020] text-[#C6F432] rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                Contratar o Cambiar Plan SaaS
              </h3>
              <p className="text-xs text-slate-500">
                CU04: Previsualiza el costo unitario, impuestos y fecha de entrada en vigor
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Selector de Planes Principales */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Selecciona el Tipo de Plan
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {planes.map((p) => {
                const seleccionado = p.tipo === tipoSeleccionado;
                return (
                  <button
                    key={p.tipo}
                    type="button"
                    onClick={() => setTipoSeleccionado(p.tipo)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      seleccionado
                        ? 'border-[#0B1020] bg-slate-900 text-white shadow-md'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {p.recomendado && (
                      <span className="absolute -top-2.5 right-3 bg-[#C6F432] text-[#0B1020] text-[9px] font-bold uppercase px-2 py-0.5 rounded-full shadow-xs">
                        Recomendado
                      </span>
                    )}
                    <p className={`font-bold text-xs ${seleccionado ? 'text-white' : 'text-slate-900'}`}>
                      {p.nombre}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-base font-extrabold font-mono ${seleccionado ? 'text-[#C6F432]' : 'text-slate-900'}`}>
                        ${p.precioUnitario}
                      </span>
                      <span className={`text-[10px] ${seleccionado ? 'text-slate-300' : 'text-slate-500'}`}>
                        / {p.unidad}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Ciclo de Facturación: Mensual vs Anual con descuento */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-800">Ciclo de Facturación</p>
              <p className="text-[11px] text-slate-500">
                Ahorra un 15% sobre la tarifa base al optar por suscripción anual.
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCiclo('MENSUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  ciclo === 'MENSUAL'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mensual
              </button>
              <button
                type="button"
                onClick={() => setCiclo('ANUAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  ciclo === 'ANUAL'
                    ? 'bg-[#0B1020] text-[#C6F432] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Anual</span>
                <span className="px-1.5 py-0.2 bg-[#C6F432] text-[#0B1020] text-[9px] font-extrabold rounded">
                  -15%
                </span>
              </button>
            </div>
          </div>

          {/* 3. Parámetros Específicos según el Plan */}
          {tipoSeleccionado === 'SAAS_SEAT_MONTHLY' && (
            <div className="space-y-2 p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between items-center text-xs">
                <label htmlFor="puestos-slider" className="font-bold text-slate-800 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>Puestos de Trabajo Activos (Licencias ErgoCheck):</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={5}
                    max={500}
                    value={puestos}
                    onChange={(e) => setPuestos(Math.max(5, Number(e.target.value) || 5))}
                    className="w-16 h-8 text-center font-mono font-bold text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6F432]"
                  />
                  <span className="text-[11px] text-slate-500 font-medium">puestos</span>
                </div>
              </div>
              <input
                id="puestos-slider"
                type="range"
                min={5}
                max={150}
                step={1}
                value={puestos}
                onChange={(e) => setPuestos(Number(e.target.value))}
                className="w-full accent-[#0B1020] cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                Mínimo 5 puestos. Cada puesto otorga telemetría ergonómica RULA/REBA continua con IA local.
              </p>
            </div>
          )}

          {tipoSeleccionado === 'PAY_PER_EXAM_PACKAGE' && (
            <div className="space-y-3 p-4 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                  <span>Bolsa Prepagada de Exámenes Supervisados (Proctoring):</span>
                </label>
                <span className="font-mono font-extrabold text-sm text-slate-900">{examenes} exámenes</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[50, 100, 250, 500].map((cantidad) => (
                  <button
                    key={cantidad}
                    type="button"
                    onClick={() => setExamenes(cantidad)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      examenes === cantidad
                        ? 'bg-[#0B1020] text-[#C6F432] border-[#0B1020]'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cantidad} exám.
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Los exámenes adquiridos no caducan mientras la cuenta institucional permanezca activa.
              </p>
            </div>
          )}

          {tipoSeleccionado === 'ENTERPRISE_CUSTOM' && (
            <div className="p-4 rounded-xl bg-slate-900 text-white flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-[#C6F432] flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Tarifa Plana Corporativa Todo Incluido</p>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Acceso sin límite a puestos de trabajo ergonómicos, exámenes de proctoring, multi-empresa, SLA 99.9% y soporte preventivo dedicado.
                </p>
              </div>
            </div>
          )}

          {/* 4. Previsualización en Vivo de Costos y Vigencia */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span>Previsualización de Costos y Facturación</span>
              </span>
              <span className="text-[10px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                {simulacion?.periodoFacturacion || 'Mensual'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Base ({simulacion?.nombrePlan || planDetalle.nombre}):</span>
                <span className="font-mono font-medium">${simulacion?.subtotalMensual.toFixed(2) || '0.00'} USD</span>
              </div>

              {simulacion && simulacion.descuentoPorcentaje > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Descuento Pago Anual (15%):</span>
                  </span>
                  <span className="font-mono">-${simulacion.descuentoMonto.toFixed(2)} USD</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Impuesto al Valor Agregado (IVA 13%):</span>
                <span className="font-mono">${simulacion?.impuestos.toFixed(2) || '0.00'} USD</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total a Facturar:</span>
                <div className="text-right">
                  <span className="text-xl font-extrabold font-mono text-slate-900">
                    ${simulacion?.totalAPagar.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 ml-1">USD</span>
                </div>
              </div>
            </div>

            {/* Fecha de Entrada en Vigor */}
            <div className="pt-3 border-t border-slate-200 flex items-start gap-2.5 text-xs text-slate-700">
              <Clock className="w-4 h-4 text-[#0B1020] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900">Fecha de Entrada en Vigor:</p>
                <p className="text-[11px] text-slate-600">
                  <strong className="text-emerald-700">Inmediata.</strong> La nueva capacidad y funcionalidades quedan activas instantáneamente tras la confirmación.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones de Confirmación */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={alCerrar}
            disabled={guardando}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={manejarConfirmacion}
            disabled={guardando || cargandoSimulacion}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0B1020] text-[#C6F432] hover:bg-[#151f38] transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {guardando ? (
              <span>Procesando Cambio...</span>
            ) : (
              <>
                <span>Confirmar Cambio de Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
