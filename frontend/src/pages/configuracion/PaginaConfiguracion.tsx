import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  CreditCard,
  Users,
  Calendar,
  Check,
  Building2,
  Sliders,
  RefreshCw,
  Clock,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { ModalCambiarPlan } from './ModalCambiarPlan.js';
import { servicioSuscripciones } from '../../services/servicioSuscripciones.js';
import type {
  PlanCatalogo,
  SuscripcionActualItem,
  TipoPlanSuscripcion,
} from '../../types/suscripcion.tipos.js';
import './configuracion.css';

export const PaginaConfiguracion: React.FC = () => {
  useTituloPagina('Configuración y Suscripción SaaS');

  const [pestañaActiva, setPestañaActiva] = useState<'suscripcion' | 'calibracion'>('suscripcion');
  const [suscripcion, setSuscripcion] = useState<SuscripcionActualItem | null>(null);
  const [planes, setPlanes] = useState<PlanCatalogo[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [planParaCambiar, setPlanParaCambiar] = useState<TipoPlanSuscripcion>('SAAS_SEAT_MONTHLY');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Parámetros de calibración ergonómica
  const [sensibilidad, setSensibilidad] = useState<number>(70);
  const [destruccionRamConfirmada, setDestruccionRamConfirmada] = useState<boolean>(true);
  const [notificacionGuardado, setNotificacionGuardado] = useState<boolean>(false);

  const cargarDatosSuscripcion = async () => {
    try {
      setCargando(true);
      const [planesData, subData] = await Promise.all([
        servicioSuscripciones.obtenerPlanes(),
        servicioSuscripciones.obtenerActual(),
      ]);
      setPlanes(planesData);
      setSuscripcion(subData);
    } catch (err) {
      console.error('Error al cargar datos de suscripción:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosSuscripcion();
  }, []);

  const abrirModalCambio = (tipo: TipoPlanSuscripcion) => {
    setPlanParaCambiar(tipo);
    setModalAbierto(true);
  };

  const manejarPlanActualizado = (suscripcionActualizada: SuscripcionActualItem) => {
    setSuscripcion(suscripcionActualizada);
    setMensajeExito(
      `¡Plan actualizado con éxito a "${suscripcionActualizada.nombrePlan}"! Fecha de entrada en vigor: Inmediata.`,
    );
    setTimeout(() => setMensajeExito(null), 5000);
  };

  const guardarCalibracion = () => {
    setNotificacionGuardado(true);
    setTimeout(() => setNotificacionGuardado(false), 2500);
  };

  const porcentajePuestos = suscripcion
    ? Math.min(100, Math.round((suscripcion.puestosEnUso / (suscripcion.puestosContratados || 1)) * 100))
    : 52;

  const porcentajeExamenes = suscripcion && suscripcion.examenesContratados > 0
    ? Math.min(100, Math.round((suscripcion.examenesUsados / suscripcion.examenesContratados) * 100))
    : 30;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight font-['Bricolage_Grotesque']">
            Suscripción y Configuración SaaS
          </h2>
          <p className="text-xs text-slate-500">
            CU04: Contratar y Cambiar Plan de Suscripción para la Organización
          </p>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setPestañaActiva('suscripcion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              pestañaActiva === 'suscripcion'
                ? 'bg-[#0B1020] text-[#C6F432] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Planes y Facturación</span>
          </button>
          <button
            type="button"
            onClick={() => setPestañaActiva('calibracion')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              pestañaActiva === 'calibracion'
                ? 'bg-[#0B1020] text-[#C6F432] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Calibración Ergonómica</span>
          </button>
        </div>
      </div>

      {/* Alerta de Éxito al Cambiar Plan */}
      {mensajeExito && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-3 shadow-xs animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Contratación confirmada</p>
            <p className="text-emerald-700">{mensajeExito}</p>
          </div>
        </div>
      )}

      {/* ===================== PESTAÑA 1: SUSCRIPCIÓN Y PLANES SAAS ===================== */}
      {cargando && !suscripcion ? (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 shadow-xs">
          <RefreshCw className="w-5 h-5 text-slate-400 animate-spin mx-auto mb-2" />
          <span>Cargando datos de suscripción de la organización...</span>
        </div>
      ) : pestañaActiva === 'suscripcion' ? (
        <div className="space-y-6">
          {/* Banner de Suscripción Actual */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-[#C6F432]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {suscripcion?.nombreOrganizacion || 'Visitask Global Enterprise'}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <Insignia variante="marca" className="text-[10px] py-0.5 px-2 bg-[#C6F432] text-[#0B1020] font-bold">
                    Plan Activo
                  </Insignia>
                </div>

                <h3 className="text-2xl font-black tracking-tight font-['Bricolage_Grotesque'] text-white">
                  {suscripcion?.nombrePlan || 'Enterprise Custom Total'}
                </h3>

                <p className="text-xs text-slate-300 max-w-xl">
                  Licencia corporativa para monitoreo postural preventivo con IA local en RAM y supervisión de evaluaciones.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="text-right sm:pr-4 sm:border-r sm:border-slate-800">
                  <p className="text-[10px] uppercase font-mono text-slate-400">Inversión Recurrente</p>
                  <p className="text-xl font-mono font-extrabold text-[#C6F432]">
                    ${suscripcion?.costoMensualEstimado.toFixed(2) || '590.00'} <span className="text-xs text-slate-300 font-normal">USD</span>
                  </p>
                  <p className="text-[10px] text-slate-400">Ciclo {suscripcion?.cicloFacturacion || 'Anual'}</p>
                </div>

                <Boton
                  tamano="sm"
                  variante="primario"
                  onClick={() => abrirModalCambio(suscripcion?.tipoPlan || 'SAAS_SEAT_MONTHLY')}
                  className="text-xs gap-1.5 bg-[#C6F432] text-[#0B1020] hover:bg-[#b0db2a] font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Modificar Plan / Capacidad</span>
                </Boton>
              </div>
            </div>

            {/* Métricas de Uso de la Licencia Actual */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Puestos Activos</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {suscripcion?.puestosEnUso || 26} / {suscripcion?.puestosContratados || 50}
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C6F432] h-full rounded-full transition-all duration-500"
                    style={{ width: `${porcentajePuestos}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">{porcentajePuestos}% de asientos ocupados</p>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>Exámenes Proctoring</span>
                  </span>
                  <span className="font-mono font-bold text-white">
                    {suscripcion?.examenesUsados || 148} / {suscripcion?.examenesContratados || 500}
                  </span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${porcentajeExamenes}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Consumo bajo demanda prepagado</p>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Renovación & Pago</span>
                  <p className="text-xs font-bold text-white mt-0.5">
                    {suscripcion?.metodoPago.marca || 'Visa'} •••• {suscripcion?.metodoPago.ultimosDigitos || '4242'}
                  </p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>Próximo corte: 01/01/2027</span>
                  </p>
                </div>
                <span className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#C6F432]">
                  <CreditCard className="w-4 h-4" />
                </span>
              </div>
            </div>
          </div>

          {/* Catálogo de Planes: Comparativa y Selección (CU04) */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                  Catálogo de Planes Disponibles
                </h3>
                <p className="text-xs text-slate-500">
                  Previsualiza costos, descuentos y fecha de entrada en vigor antes de confirmar el cambio
                </p>
              </div>
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Entrada en vigor inmediata al confirmar</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {planes.map((plan) => {
                const esPlanActual = suscripcion?.tipoPlan === plan.tipo;

                return (
                  <div
                    key={plan.tipo}
                    className={`tarjeta-plan rounded-2xl p-5 flex flex-col justify-between bg-white relative ${
                      esPlanActual ? 'tarjeta-plan-activa' : plan.recomendado ? 'tarjeta-plan-destacada' : ''
                    }`}
                  >
                    {plan.recomendado && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0B1020] text-[#C6F432] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                        Recomendado SST
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-slate-900 font-['Bricolage_Grotesque']">
                          {plan.nombre}
                        </h4>
                        {esPlanActual && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                            Actual
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 mb-4 min-h-[32px]">
                        {plan.tagline}
                      </p>

                      <div className="flex items-baseline gap-1.5 pb-4 border-b border-slate-100">
                        <span className="text-2xl font-black font-mono text-slate-900">
                          ${plan.precioUnitario}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {plan.moneda} / {plan.unidad}
                        </span>
                      </div>

                      {/* Lista de Características */}
                      <ul className="py-4 space-y-2.5 text-xs text-slate-600">
                        {plan.caracteristicas.map((caract, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span className="text-[11px] leading-tight">{caract}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => abrirModalCambio(plan.tipo)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          esPlanActual
                            ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                            : 'bg-[#0B1020] text-[#C6F432] hover:bg-[#182342] shadow-xs'
                        }`}
                      >
                        <span>{esPlanActual ? 'Ajustar Capacidad' : 'Cambiar a este Plan'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historial de Facturas y Comprobantes */}
          <Tarjeta titulo="Historial de Facturación y Comprobantes Fiscales" subtitulo="Comprobantes con NIT institucional y desglose de IVA (13%)">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">Nº Factura</th>
                    <th className="py-2.5 px-3">Fecha de Emisión</th>
                    <th className="py-2.5 px-3">Plan / Concepto</th>
                    <th className="py-2.5 px-3">Importe</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">INV-2026-004</td>
                    <td className="py-3 px-3">01 de Octubre, 2026</td>
                    <td className="py-3 px-3">{suscripcion?.nombrePlan || 'Enterprise Custom Total'}</td>
                    <td className="py-3 px-3 font-mono font-bold">${suscripcion?.costoMensualEstimado.toFixed(2) || '590.00'} USD</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Pagada
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => alert('Descargando comprobante fiscal INV-2026-004 (PDF firmado digitalmente)...')}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">INV-2026-003</td>
                    <td className="py-3 px-3">01 de Septiembre, 2026</td>
                    <td className="py-3 px-3">Enterprise Custom Total</td>
                    <td className="py-3 px-3 font-mono font-bold">$590.00 USD</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Pagada
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => alert('Descargando comprobante fiscal INV-2026-003 (PDF firmado digitalmente)...')}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Tarjeta>
        </div>
      ) : null}

      {/* ===================== PESTAÑA 2: CALIBRACIÓN Y PRIVACIDAD ===================== */}
      {pestañaActiva === 'calibracion' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">Calibración Ergonómica y Privacidad</h3>
              <p className="text-xs text-slate-500">Ajusta los umbrales del motor RULA y políticas de destrucción en RAM</p>
            </div>
            <Boton tamano="sm" variante="primario" onClick={guardarCalibracion} className="text-xs">
              Guardar Calibración
            </Boton>
          </div>

          {notificacionGuardado && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Configuración guardada exitosamente en el navegador local.</span>
            </div>
          )}

          {/* Sensibilidad Ergonómica */}
          <Tarjeta titulo="Calibración del Motor de Pose (RULA)" subtitulo="Ajusta el umbral de detección de desvíos y alertas posturales">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-900 mb-1.5">
                  <label htmlFor="sens">Sensibilidad de Inclinación Cervical</label>
                  <span className="font-mono text-slate-900 font-bold">{sensibilidad}%</span>
                </div>
                <input
                  id="sens"
                  type="range"
                  min="30"
                  max="100"
                  value={sensibilidad}
                  onChange={(e) => setSensibilidad(Number(e.target.value))}
                  className="w-full accent-[#0B1020] cursor-pointer"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Un umbral alto dispara advertencias tempranas a partir de los 10° de flexión cervical.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Destrucción forzosa de fotogramas en memoria (RAM)</p>
                    <p className="text-[11px] text-slate-500">Garantiza que ningún frame de video quede en buffer o caché de disco.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={destruccionRamConfirmada}
                  onChange={(e) => setDestruccionRamConfirmada(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </div>
            </div>
          </Tarjeta>
        </div>
      )}

      {/* Modal para Contratar o Cambiar Plan (CU04) */}
      <ModalCambiarPlan
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        planInicial={planParaCambiar}
        suscripcionActual={suscripcion}
        planes={planes}
        alConfirmarExitoso={manejarPlanActualizado}
      />
    </div>
  );
};

export const SettingsPage = PaginaConfiguracion;
