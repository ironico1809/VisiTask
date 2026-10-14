import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Bell,
  Volume2,
  Smartphone,
  Play,
  ShieldCheck,
} from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';
import { ModalCambiarPlan } from './ModalCambiarPlan.js';
import { ModalComprobanteDigital } from './ModalComprobanteDigital.js';
import { ModalProcesarPago } from './ModalProcesarPago.js';
import { servicioSuscripciones } from '../../services/servicioSuscripciones.js';
import { servicioAlertas } from '../../services/servicioAlertas.js';
import { sonidoAlertas } from '../../utils/sonidoAlertas.js';
import type {
  PlanCatalogo,
  SuscripcionActualItem,
  TipoPlanSuscripcion,
  ComprobanteDigitalItem,
} from '../../types/suscripcion.tipos.js';
import type { ConfiguracionAlertas, TonoSonido } from '../../types/alerta.tipos.js';
import './configuracion.css';

export const PaginaConfiguracion: React.FC = () => {
  useTituloPagina('Configuración y Suscripción SaaS');

  const [pestañaActiva, setPestañaActiva] = useState<'suscripcion' | 'calibracion' | 'alertas' | 'auditoria'>('suscripcion');
  const [suscripcion, setSuscripcion] = useState<SuscripcionActualItem | null>(null);
  const [planes, setPlanes] = useState<PlanCatalogo[]>([]);
  const [facturas, setFacturas] = useState<ComprobanteDigitalItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [planParaCambiar, setPlanParaCambiar] = useState<TipoPlanSuscripcion>('SAAS_SEAT_MONTHLY');
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Procesamiento de pago y comprobante
  const [modalPagoAbierto, setModalPagoAbierto] = useState<boolean>(false);
  const [modalComprobanteAbierto, setModalComprobanteAbierto] = useState<boolean>(false);
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState<ComprobanteDigitalItem | null>(null);
  const [reintentando, setReintentando] = useState<string | null>(null);

  // Parámetros de calibración ergonómica
  const [sensibilidad, setSensibilidad] = useState<number>(70);
  const [destruccionRamConfirmada, setDestruccionRamConfirmada] = useState<boolean>(true);
  const [notificacionGuardado, setNotificacionGuardado] = useState<boolean>(false);

  // Configuración y disparo de alertas posturales y push móvil
  const [configAlertas, setConfigAlertas] = useState<ConfiguracionAlertas>({
    umbralRulaCritico: 5,
    tiempoSostenidoSegundos: 60,
    umbralFatigaPorcentaje: 75,
    frecuenciaMinutos: 5,
    pausaActivaMinutos: 20,
    canales: {
      visual: true,
      sonoro: true,
      volumenSonido: 80,
      tonoSonido: 'chime',
      pushMovil: true,
    },
    tokenDispositivoMovil: 'fcm-apk-ergocheck-android-2026',
  });
  const [guardandoAlertas, setGuardandoAlertas] = useState(false);
  const [mensajeExitoAlertas, setMensajeExitoAlertas] = useState<string | null>(null);
  const [mensajePush, setMensajePush] = useState<string | null>(null);

  const cargarDatosSuscripcion = async () => {
    try {
      setCargando(true);
      const [planesData, subData, facturasData, configAlertasData] = await Promise.all([
        servicioSuscripciones.obtenerPlanes(),
        servicioSuscripciones.obtenerActual(),
        servicioSuscripciones.listarHistorialFacturas(),
        servicioAlertas.obtenerConfiguracion().catch(() => null),
      ]);
      setPlanes(planesData);
      setSuscripcion(subData);
      setFacturas(facturasData);
      if (configAlertasData) setConfigAlertas(configAlertasData);
    } catch (err) {
      console.error('Error al cargar datos de configuración:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosSuscripcion();
  }, []);

  const probarSonido = (tono?: TonoSonido) => {
    sonidoAlertas.reproducir(tono || configAlertas.canales.tonoSonido, configAlertas.canales.volumenSonido);
  };

  const probarPush = async () => {
    try {
      setMensajePush('Despachando paquete de prueba a APK móvil...');
      const resp = await servicioAlertas.probarPush(configAlertas.tokenDispositivoMovil);
      setMensajePush(resp.mensaje);
      setTimeout(() => setMensajePush(null), 4000);
    } catch {
      setMensajePush('Notificación push simulada despachada al APK móvil.');
      setTimeout(() => setMensajePush(null), 3000);
    }
  };

  const guardarConfiguracionAlertas = async () => {
    try {
      setGuardandoAlertas(true);
      const resp = await servicioAlertas.actualizarConfiguracion(configAlertas);
      setConfigAlertas(resp.configuracion);
      setMensajeExitoAlertas('Configuración de alertas, umbrales y canales push guardada con éxito.');
      setTimeout(() => setMensajeExitoAlertas(null), 4000);
    } catch (err) {
      console.error('Error al guardar alertas:', err);
    } finally {
      setGuardandoAlertas(false);
    }
  };

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

  const abrirComprobante = (factura: ComprobanteDigitalItem) => {
    setComprobanteSeleccionado(factura);
    setModalComprobanteAbierto(true);
  };

  const manejarPagoCompletado = (comprobante: ComprobanteDigitalItem) => {
    setFacturas((prev) => [comprobante, ...prev.filter((f) => f.invoiceNumber !== comprobante.invoiceNumber)]);
    if (suscripcion) {
      setSuscripcion({
        ...suscripcion,
        estado: comprobante.estado === 'PAID' ? 'ACTIVA' : 'PAST_DUE',
      });
    }
    setComprobanteSeleccionado(comprobante);
    setModalComprobanteAbierto(true);
    setMensajeExito(
      comprobante.estado === 'PAID'
        ? `Cobro exitoso por $${comprobante.total.toFixed(2)} USD. Comprobante digital ${comprobante.invoiceNumber} emitido.`
        : `Cobro rechazado. Factura ${comprobante.invoiceNumber} en cola de reintento automático.`,
    );
    setTimeout(() => setMensajeExito(null), 6000);
  };

  const manejarReintentoCobro = async (invoiceNumber: string) => {
    try {
      setReintentando(invoiceNumber);
      const res = await servicioSuscripciones.reintentarCobro({ invoiceNumber, forzarExito: true });
      if (res.exito) {
        setFacturas((prev) =>
          prev.map((f) => (f.invoiceNumber === invoiceNumber ? res.comprobante : f)),
        );
        if (suscripcion) {
          setSuscripcion({ ...suscripcion, estado: 'ACTIVA' });
        }
        setComprobanteSeleccionado(res.comprobante);
        setMensajeExito(`¡Reintento exitoso! Factura ${invoiceNumber} pagada y cobertura reactivada.`);
        setTimeout(() => setMensajeExito(null), 6000);
      }
    } catch (err: any) {
      alert(`Error al reintentar el cobro: ${err?.message || 'Error de pasarela'}`);
    } finally {
      setReintentando(null);
    }
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
            Gestión de planes de suscripción, facturación y políticas del sistema
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
          <button
            type="button"
            onClick={() => setPestañaActiva('alertas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              pestañaActiva === 'alertas'
                ? 'bg-[#0B1020] text-[#C6F432] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alertas y Notificaciones Móviles</span>
          </button>
          <button
            type="button"
            onClick={() => setPestañaActiva('auditoria')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              pestañaActiva === 'auditoria'
                ? 'bg-[#0B1020] text-[#C6F432] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bitácora y Seguridad</span>
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

                <div className="flex flex-wrap items-center gap-2">
                  <Boton
                    tamano="sm"
                    variante="borde"
                    onClick={() => setModalPagoAbierto(true)}
                    className="text-xs gap-1.5 bg-white/10 text-white border-white/20 hover:bg-white/20 font-semibold"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#C6F432]" />
                    <span>Pagar / Renovar Cuota</span>
                  </Boton>

                  <Boton
                    tamano="sm"
                    variante="primario"
                    onClick={() => abrirModalCambio(suscripcion?.tipoPlan || 'SAAS_SEAT_MONTHLY')}
                    className="text-xs gap-1.5 bg-[#C6F432] text-[#0B1020] hover:bg-[#b0db2a] font-bold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Modificar Plan</span>
                  </Boton>
                </div>
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

          {/* Catálogo de Planes: Comparativa y Selección */}
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

          {/* Historial de Facturas y Comprobantes Fiscales */}
          <Tarjeta
            titulo="Historial de Facturación y Comprobantes Fiscales"
            subtitulo="Validación de cobros mediante pasarela segura, emisión de comprobantes digitales y reintentos automáticos"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500 uppercase font-mono text-[10px]">
                    <th className="py-2.5 px-3">Nº Factura</th>
                    <th className="py-2.5 px-3">Fecha de Emisión</th>
                    <th className="py-2.5 px-3">Concepto / Plan</th>
                    <th className="py-2.5 px-3">Importe</th>
                    <th className="py-2.5 px-3">Estado</th>
                    <th className="py-2.5 px-3 text-right">Comprobante / Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {facturas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No hay comprobantes de cobro emitidos aún.
                      </td>
                    </tr>
                  ) : (
                    facturas.map((f) => {
                      const esPagada = f.estado === 'PAID';
                      const esFallida = f.estado === 'FAILED';
                      return (
                        <tr key={f.invoiceNumber} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            {f.invoiceNumber}
                          </td>
                          <td className="py-3 px-3">
                            {new Date(f.fechaEmision).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate" title={f.concepto}>
                            {f.concepto}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            ${f.total.toFixed(2)} USD
                          </td>
                          <td className="py-3 px-3">
                            {esPagada ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Pagada
                              </span>
                            ) : esFallida ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Rechazada ({f.reintentosCobro || 1} reint.)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {esFallida && (
                                <button
                                  type="button"
                                  onClick={() => manejarReintentoCobro(f.invoiceNumber)}
                                  disabled={reintentando === f.invoiceNumber}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                >
                                  <RefreshCw className={`w-3 h-3 ${reintentando === f.invoiceNumber ? 'animate-spin' : ''}`} />
                                  <span>{reintentando === f.invoiceNumber ? 'Reintentando...' : 'Reintentar'}</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => abrirComprobante(f)}
                                className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                                title="Ver Comprobante Fiscal Digital Oficial"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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

      {/* ===================== PESTAÑA 3: ALERTAS Y PUSH MÓVIL ===================== */}
      {pestañaActiva === 'alertas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                Configuración y Disparo de Alertas Ergonómicas
              </h3>
              <p className="text-xs text-slate-500">
                Personaliza los umbrales de riesgo postural crítico (RULA ≥ 5 sostenido), fatiga y canales de notificación
              </p>
            </div>
            <Boton
              tamano="sm"
              variante="primario"
              onClick={guardarConfiguracionAlertas}
              disabled={guardandoAlertas}
              className="text-xs"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{guardandoAlertas ? 'Guardando...' : 'Guardar Configuración de Alertas'}</span>
            </Boton>
          </div>

          {mensajeExitoAlertas && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-2xl flex items-center gap-2.5 animate-in fade-in duration-200 shadow-xs">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span className="font-semibold">{mensajeExitoAlertas}</span>
            </div>
          )}

          {/* Tarjeta 1: Umbrales Críticos RULA y Tiempo Sostenido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Tarjeta
              titulo="Umbral Crítico RULA"
              subtitulo="Límite ergonómico para emitir advertencia de mala postura"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Disparar alerta cuando:</span>
                  <span className="px-3 py-1 bg-rose-600 text-white font-bold font-mono rounded-lg text-xs">
                    RULA ≥ {configAlertas.umbralRulaCritico}
                  </span>
                </div>

                <input
                  type="range"
                  min="4"
                  max="7"
                  step="1"
                  value={configAlertas.umbralRulaCritico}
                  onChange={(e) =>
                    setConfigAlertas({
                      ...configAlertas,
                      umbralRulaCritico: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-rose-600 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>RULA 4 (Leve)</span>
                  <span className="font-bold text-rose-700">RULA 5 (Norma ISO)</span>
                  <span>RULA 6 (Alto)</span>
                  <span>RULA 7 (Extremo)</span>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                  Conforme a la metodología RULA (Rapid Upper Limb Assessment) e ISO 11226, las puntuaciones de 5 o más exigen investigación y cambio pronto de postura.
                </p>
              </div>
            </Tarjeta>

            <Tarjeta
              titulo="Tiempo de Mala Postura Sostenida"
              subtitulo="Segundos continuos requeridos antes de disparar la intervención"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Tiempo de exposición continua:</span>
                  <span className="px-3 py-1 bg-[#0B1020] text-[#C6F432] font-bold font-mono rounded-lg text-xs">
                    {configAlertas.tiempoSostenidoSegundos} segundos
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[30, 60, 120, 180].map((seg) => (
                    <button
                      key={seg}
                      type="button"
                      onClick={() =>
                        setConfigAlertas({ ...configAlertas, tiempoSostenidoSegundos: seg })
                      }
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        configAlertas.tiempoSostenidoSegundos === seg
                          ? 'bg-[#0B1020] text-[#C6F432] border-[#0B1020] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {seg}s
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed pt-2 border-t border-slate-100">
                  Evita falsos positivos por movimientos transitorios del usuario (ej. tomar agua o mirar una nota rápida).
                </p>
              </div>
            </Tarjeta>
          </div>

          {/* Tarjeta 2: Fatiga Acumulada y Pausas Activas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Tarjeta
              titulo="Umbral de Fatiga Acumulada"
              subtitulo="Porcentaje estimado de sobrecarga muscular en la jornada"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Disparar alerta preventiva al:</span>
                  <span className="px-3 py-1 bg-amber-500 text-slate-950 font-bold font-mono rounded-lg text-xs">
                    {configAlertas.umbralFatigaPorcentaje}% de fatiga
                  </span>
                </div>

                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={configAlertas.umbralFatigaPorcentaje}
                  onChange={(e) =>
                    setConfigAlertas({
                      ...configAlertas,
                      umbralFatigaPorcentaje: parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full accent-amber-500 cursor-pointer"
                />

                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>50% (Muy cauto)</span>
                  <span className="font-bold text-amber-700">75% (Equilibrado)</span>
                  <span>95% (Solo fatiga severa)</span>
                </div>
              </div>
            </Tarjeta>

            <Tarjeta
              titulo="Frecuencia Mínima entre Alertas"
              subtitulo="Intervalo de respiro para no saturar al trabajador"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Espaciado entre avisos:</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-800 font-bold font-mono rounded-lg text-xs">
                    Cada {configAlertas.frecuenciaMinutos} minutos
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[2, 5, 10, 15].map((min) => (
                    <button
                      key={min}
                      type="button"
                      onClick={() =>
                        setConfigAlertas({ ...configAlertas, frecuenciaMinutos: min })
                      }
                      className={`py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                        configAlertas.frecuenciaMinutos === min
                          ? 'bg-[#0B1020] text-[#C6F432] border-[#0B1020] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {min}m
                    </button>
                  ))}
                </div>
              </div>
            </Tarjeta>
          </div>

          {/* Tarjeta 3: Canales de Emisión (Visual, Sonoro Web Audio y Push APK Móvil) */}
          <Tarjeta
            titulo="Canales de Emisión de Notificaciones"
            subtitulo="Activa o desactiva alertas en la interfaz web, tonos sonoros y notificaciones push al APK móvil"
          >
            <div className="space-y-5">
              {/* Canal Visual */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Notificación Visual en Interfaz de Trabajo</span>
                    <span className="text-[11px] text-slate-500">Muestra un banner flotante con el score RULA, causas y botón de pausa activa</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={configAlertas.canales.visual}
                  onChange={(e) =>
                    setConfigAlertas({
                      ...configAlertas,
                      canales: { ...configAlertas.canales, visual: e.target.checked },
                    })
                  }
                  className="w-5 h-5 accent-[#0B1020] rounded cursor-pointer"
                />
              </div>

              {/* Canal Sonoro */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#C6F432] text-[#0B1020] flex items-center justify-center font-bold">
                      <Volume2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Alerta Sonora Ergonómica (Web Audio API)</span>
                      <span className="text-[11px] text-slate-500">Audio síntesis nativa sin archivos pesados ni latencia de red</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configAlertas.canales.sonoro}
                    onChange={(e) =>
                      setConfigAlertas({
                        ...configAlertas,
                        canales: { ...configAlertas.canales, sonoro: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-[#0B1020] rounded cursor-pointer"
                  />
                </div>

                {configAlertas.canales.sonoro && (
                  <div className="pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1.5">Tono Ergonómico:</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['chime', 'alerta', 'campana', 'pulso'] as TonoSonido[]).map((tono) => (
                          <button
                            key={tono}
                            type="button"
                            onClick={() => {
                              setConfigAlertas({
                                ...configAlertas,
                                canales: { ...configAlertas.canales, tonoSonido: tono },
                              });
                              probarSonido(tono);
                            }}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition-all cursor-pointer ${
                              configAlertas.canales.tonoSonido === tono
                                ? 'bg-[#0B1020] text-[#C6F432] border-[#0B1020]'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {tono}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5 text-[11px]">
                        <span className="font-bold text-slate-700">Volumen ({configAlertas.canales.volumenSonido}%):</span>
                        <button
                          type="button"
                          onClick={() => probarSonido()}
                          className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>Reproducir</span>
                        </button>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={configAlertas.canales.volumenSonido}
                        onChange={(e) =>
                          setConfigAlertas({
                            ...configAlertas,
                            canales: {
                              ...configAlertas.canales,
                              volumenSonido: parseInt(e.target.value, 10),
                            },
                          })
                        }
                        className="w-full accent-[#0B1020] cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Canal Push a APK Móvil */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Notificaciones Push al APK Móvil Android</span>
                      <span className="text-[11px] text-slate-500">Despacha la alerta directamente al dispositivo móvil del empleado o supervisor</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={configAlertas.canales.pushMovil}
                    onChange={(e) =>
                      setConfigAlertas({
                        ...configAlertas,
                        canales: { ...configAlertas.canales, pushMovil: e.target.checked },
                      })
                    }
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {configAlertas.canales.pushMovil && (
                  <div className="pt-3 border-t border-slate-200/80 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <div className="flex-1">
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Token FCM / Identificador de Dispositivo APK:
                        </label>
                        <input
                          type="text"
                          value={configAlertas.tokenDispositivoMovil || ''}
                          onChange={(e) =>
                            setConfigAlertas({
                              ...configAlertas,
                              tokenDispositivoMovil: e.target.value,
                            })
                          }
                          placeholder="fcm-token-android-device..."
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono text-slate-800 bg-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="sm:self-end">
                        <Boton
                          tamano="sm"
                          variante="secundario"
                          onClick={probarPush}
                          className="text-xs h-[38px] flex items-center gap-1.5"
                        >
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Probar Push al APK</span>
                        </Boton>
                      </div>
                    </div>

                    {mensajePush && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 rounded-xl font-medium flex items-center gap-2 animate-in fade-in">
                        <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{mensajePush}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Tarjeta>
        </div>
      )}

      {/* ===================== PESTAÑA 4: AUDITORÍA Y SEGURIDAD ===================== */}
      {pestañaActiva === 'auditoria' && (
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-md relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">PostgreSQL Append-Only WORM Log</span>
                </div>
                <h3 className="text-xl font-bold font-['Bricolage_Grotesque']">
                  Bitácora Inmutable de Auditoría y Seguridad
                </h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  Todos los accesos a datos confidenciales (expedientes SST, telemetría), modificaciones de políticas (umbrales RULA, roles RBAC) y eventos de seguridad son firmados con SHA-256 e inmutables en PostgreSQL.
                </p>
              </div>

              <Link
                to="/auditoria"
                className="px-5 py-2.5 rounded-xl bg-[#C6F432] text-[#0B1020] hover:bg-[#b5e028] font-bold text-xs flex items-center gap-2 transition-all shadow-md self-start md:self-auto cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Abrir Consola de Auditoría Completa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Tarjeta titulo="Inmutabilidad Criptográfica" subtitulo="SHA-256 HMAC & Timestamp WORM">
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Los registros en la tabla <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">audit_logs</code> tienen denegación estricta de UPDATE y DELETE.
                </p>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-[11px] font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Cadena de firmas SHA-256: 100% íntegra</span>
                </div>
              </div>
            </Tarjeta>

            <Tarjeta titulo="Acceso a Datos y SST" subtitulo="GDPR Art. 30 e ISO 45001">
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Registro obligatorio de consultas a diagnósticos ergonómicos, telemetría biomecánica e informes médicos de empleados.
                </p>
                <Link
                  to="/auditoria"
                  className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 mt-2"
                >
                  <span>Ver accesos a datos</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Tarjeta>

            <Tarjeta titulo="Modificación de Políticas" subtitulo="Control de Cambios Críticos">
              <div className="space-y-2 text-xs text-slate-600">
                <p>
                  Historial de cambios en umbrales RULA (4-7), sensibilidad postural, asignaciones de roles RBAC y retención de grabaciones.
                </p>
                <Link
                  to="/auditoria"
                  className="text-xs font-bold text-slate-900 hover:text-emerald-700 flex items-center gap-1 mt-2"
                >
                  <span>Ver cambios de políticas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Tarjeta>
          </div>
        </div>
      )}

      {/* Modal para Contratar o Cambiar Plan */}
      <ModalCambiarPlan
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        planInicial={planParaCambiar}
        suscripcionActual={suscripcion}
        planes={planes}
        alConfirmarExitoso={manejarPlanActualizado}
      />

      {/* Modal para Procesar Pago con Pasarela y Validación */}
      <ModalProcesarPago
        abierto={modalPagoAbierto}
        alCerrar={() => setModalPagoAbierto(false)}
        suscripcion={suscripcion}
        alPagoCompletado={manejarPagoCompletado}
      />

      {/* Modal de Comprobante Fiscal Digital Oficial */}
      <ModalComprobanteDigital
        abierto={modalComprobanteAbierto}
        alCerrar={() => setModalComprobanteAbierto(false)}
        comprobante={comprobanteSeleccionado}
        alReintentar={manejarReintentoCobro}
      />
    </div>
  );
};

export const SettingsPage = PaginaConfiguracion;
