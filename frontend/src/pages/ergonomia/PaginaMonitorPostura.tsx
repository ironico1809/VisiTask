import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Smartphone,
  Bell,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { ModalConsentimiento } from './ModalConsentimiento.js';
import { ModalPausaActiva } from './ModalPausaActiva.js';
import { ModalConfiguracionAlertas } from './ModalConfiguracionAlertas.js';
import { BannerAlertaPostura } from '../../components/ergonomia/BannerAlertaPostura.js';
import { servicioConsentimiento } from '../../services/servicioConsentimiento.js';
import { servicioAlertas } from '../../services/servicioAlertas.js';
import { sonidoAlertas } from '../../utils/sonidoAlertas.js';
import type { ConfiguracionAlertas, AlertaItem } from '../../types/alerta.tipos.js';

export const PaginaMonitorPostura: React.FC = () => {
  const [estaCalibrando, setEstaCalibrando] = useState(false);
  const [modalConsentimientoAbierto, setModalConsentimientoAbierto] = useState(false);
  const [modalConfiguracionAbierto, setModalConfiguracionAbierto] = useState(false);
  const [modalPausaActivaAbierto, setModalPausaActivaAbierto] = useState(false);
  const [tieneConsentimiento, setTieneConsentimiento] = useState(true);
  const enSegundoPlano = false;

  // Configuración de alertas de la organización
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

  // Alerta activa en pantalla
  const [alertaActiva, setAlertaActiva] = useState<AlertaItem | null>(null);

  // Historial de alertas emitidas en la sesión
  const [historialAlertas, setHistorialAlertas] = useState<AlertaItem[]>([]);

  // Métricas en tiempo real con controles interactivos de simulación
  const [puntajeRula, setPuntajeRula] = useState<number>(6);
  const [anguloCuello, setAnguloCuello] = useState<number>(26);
  const [anguloTronco, setAnguloTronco] = useState<number>(19);
  const [anguloHombros, setAnguloHombros] = useState<number>(14);
  const [segundosEstaticos, setSegundosEstaticos] = useState<number>(64);
  const [nivelFatiga, setNivelFatiga] = useState<number>(78);

  const ultimaAlertaRef = useRef<number>(0);

  // Cargar estado inicial y configuración de alertas
  useEffect(() => {
    servicioConsentimiento.obtenerEstado().then((resp) => {
      setTieneConsentimiento(resp.tieneConsentimiento);
      if (!resp.tieneConsentimiento) {
        setModalConsentimientoAbierto(true);
      }
    }).catch(() => {});

    servicioAlertas.obtenerConfiguracion().then((data) => {
      if (data) setConfigAlertas(data);
    }).catch(() => {});

    servicioAlertas.listarAlertas(10).then((lista) => {
      if (lista && lista.length > 0) setHistorialAlertas(lista);
    }).catch(() => {});
  }, []);

  const recalibrarLineaBase = () => {
    setEstaCalibrando(true);
    setTimeout(() => {
      setEstaCalibrando(false);
      setPuntajeRula(2);
      setAnguloCuello(12);
      setAnguloTronco(8);
      setAnguloHombros(6);
      setSegundosEstaticos(0);
      setAlertaActiva(null);
    }, 2500);
  };

  /**
   * Dispara una alerta postural crítica o de fatiga
   */
  const emitirAlerta = async (
    tipo: 'POSTURAL_RISK_PROLONGED' | 'FATIGUE_ACCUMULATED',
    nivel: 'HIGH' | 'CRITICAL',
    mensaje: string,
  ) => {
    // 1. Emitir sonido si está activado en los canales
    if (configAlertas.canales.sonoro) {
      sonidoAlertas.reproducir(
        nivel === 'CRITICAL' ? 'alerta' : configAlertas.canales.tonoSonido,
        configAlertas.canales.volumenSonido,
      );
    }

    // 2. Registrar y despachar en el backend (dispara notificación push al APK móvil)
    const resp = await servicioAlertas.dispararAlerta({
      tipo,
      nivel,
      mensaje,
      puntajeRula,
      tiempoSostenidoSegundos: segundosEstaticos,
      anguloCuello,
      anguloTronco,
      anguloHombros,
      nivelFatiga,
      enviarPushMovil: configAlertas.canales.pushMovil,
    });

    // 3. Emitir notificación visual flotante en pantalla
    if (configAlertas.canales.visual) {
      setAlertaActiva(resp.alerta);
    }

    // 4. Agregar al historial en vivo
    setHistorialAlertas((prev) => [resp.alerta, ...prev.filter((a) => a.id !== resp.alerta.id)]);
    ultimaAlertaRef.current = Date.now();
  };

  /**
   * Simulador de Alerta RULA >= 5 Crítica
   */
  const dispararAlertaRulaManual = () => {
    setPuntajeRula(6);
    setAnguloCuello(28);
    setSegundosEstaticos(65);
    emitirAlerta(
      'POSTURAL_RISK_PROLONGED',
      'CRITICAL',
      'Riesgo Postural Crítico (RULA 6): Flexión cervical de 28° y postura estática sostenida durante más de 60 segundos.',
    );
  };

  /**
   * Simulador de Alerta de Fatiga Acumulada
   */
  const dispararAlertaFatigaManual = () => {
    setNivelFatiga(86);
    emitirAlerta(
      'FATIGUE_ACCUMULATED',
      'HIGH',
      'Fatiga Muscular Acumulada (86%): Se superó el umbral seguro de tensión en trapecios y cuello. Pausa activa recomendada.',
    );
  };

  const descartarAlerta = async (id: string) => {
    await servicioAlertas.descartarAlerta(id, 'Descartada por el usuario');
    setAlertaActiva(null);
    setHistorialAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isDismissed: true } : a)),
    );
  };

  const completarPausaActiva = () => {
    setModalPausaActivaAbierto(false);
    if (alertaActiva) {
      descartarAlerta(alertaActiva.id);
    }
    // Restablecer tensión
    setSegundosEstaticos(0);
    setNivelFatiga(Math.max(20, nivelFatiga - 35));
    setPuntajeRula(Math.max(2, puntajeRula - 3));
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior: Privacidad y Destrucción en RAM */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0B1020] text-[#C6F432] flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">Privacidad Absoluta Garantizada:</p>
            <p className="text-emerald-700">
              Inferencia en cliente vía MediaPipe Web Worker. Los buffers de video se destruyen en RAM
              (ImageBitmap.close()). Cero fotogramas transmitidos al servidor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setModalConsentimientoAbierto(true)}
            className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer flex items-center gap-1"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Consentimiento Informado: {tieneConsentimiento ? 'Activo' : 'Pendiente'}</span>
          </button>
          <Insignia variante="exito" className="py-1 px-3">
            Buffer RAM: 0 KB
          </Insignia>
        </div>
      </div>

      {/* Banner / Barra de Controles: Alertas Posturales y Push Móvil */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#C6F432] text-[#0B1020] flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#C6F432] uppercase tracking-wider font-mono">
                Monitoreo de Alertas Activo
              </span>
              <span className="text-[11px] text-slate-400">
                • Umbral: RULA ≥ {configAlertas.umbralRulaCritico} sostenido por {configAlertas.tiempoSostenidoSegundos}s
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Canales activos: {configAlertas.canales.visual ? 'Visual' : ''}
              {configAlertas.canales.sonoro ? ' • Sonoro (Web Audio)' : ''}
              {configAlertas.canales.pushMovil ? ' • Push al APK Móvil' : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Botones de simulación interactiva */}
          <button
            type="button"
            onClick={dispararAlertaRulaManual}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Simular que el usuario supera RULA 5 sostenido"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simular RULA ≥ 5 Crítico</span>
          </button>

          <button
            type="button"
            onClick={dispararAlertaFatigaManual}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Simular fatiga acumulada en la jornada"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Fatiga ({nivelFatiga}%)</span>
          </button>

          <button
            type="button"
            onClick={() => setModalConfiguracionAbierto(true)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
            title="Configurar límites, frecuencias y canales de alerta"
          >
            <Sliders className="w-3.5 h-3.5 text-[#C6F432]" />
            <span>Configurar Alertas</span>
          </button>
        </div>
      </div>

      {/* Disposición Principal: Canvas de Video + Panel de Métricas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Izquierda: Video y Superposición Esquelética (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <Tarjeta className="p-0 overflow-hidden relative bg-slate-900 rounded-2xl border-slate-800 shadow-lg">
            {/* Transmisión de Video Simulada con Superposición de Puntos Clave */}
            <div className="relative aspect-[16/10] w-full flex items-center justify-center bg-slate-950 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1000&auto=format&fit=crop&q=80"
                alt="Transmisión Cámara Web"
                className="w-full h-full object-cover opacity-80"
              />

              {/* Superposición SVG de Esqueleto MediaPipe */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
                <line x1="50" y1="20" x2="50" y2="45" stroke={puntajeRula >= 5 ? '#f43f5e' : '#4ade80'} strokeWidth="1" />
                <line x1="38" y1="30" x2="62" y2="30" stroke={puntajeRula >= 5 ? '#f43f5e' : '#4ade80'} strokeWidth="1.2" />
                <line x1="38" y1="30" x2="30" y2="48" stroke="#facc15" strokeWidth="1" />
                <line x1="62" y1="30" x2="70" y2="48" stroke="#facc15" strokeWidth="1" />
                <circle cx="50" cy="20" r="2.5" fill="#C6F432" stroke="#0B1020" strokeWidth="0.5" />
                <circle cx="38" cy="30" r="2" fill={puntajeRula >= 5 ? '#f43f5e' : '#4ade80'} />
                <circle cx="62" cy="30" r="2" fill={puntajeRula >= 5 ? '#f43f5e' : '#4ade80'} />
                <circle cx="30" cy="48" r="2" fill="#facc15" />
                <circle cx="70" cy="48" r="2" fill="#facc15" />
              </svg>

              {/* Insignias de Telemetría sobre el video */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Insignia variante="marca">
                  MediaPipe Pose • 30 FPS
                </Insignia>
                {puntajeRula >= configAlertas.umbralRulaCritico ? (
                  <Insignia variante="peligro" className="animate-pulse">
                    RULA {puntajeRula} • Crítico
                  </Insignia>
                ) : (
                  <Insignia variante="exito">
                    RULA {puntajeRula} • Óptimo
                  </Insignia>
                )}
                {enSegundoPlano && (
                  <Insignia variante="advertencia" className="bg-amber-400 text-slate-900 border-none">
                    Modo Ahorro: 5 FPS
                  </Insignia>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 flex items-center justify-between text-white">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>Tronco: <b className="text-amber-400">{anguloTronco}°</b></span>
                  <span>Cuello: <b className={anguloCuello > 20 ? 'text-rose-400' : 'text-emerald-400'}>{anguloCuello}°</b></span>
                  <span>Hombros: <b className="text-emerald-400">{anguloHombros}°</b></span>
                </div>
                <button
                  onClick={recalibrarLineaBase}
                  disabled={estaCalibrando}
                  className="px-3 py-1.5 bg-[#C6F432] text-[#0B1020] rounded-lg text-xs font-bold hover:bg-[#b2dc2a] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${estaCalibrando ? 'animate-spin' : ''}`} />
                  <span>{estaCalibrando ? 'Calibrando...' : 'Recalibrar'}</span>
                </button>
              </div>
            </div>
          </Tarjeta>

          {/* Historial en Vivo de Alertas de la Sesión */}
          <Tarjeta
            titulo="Registro de Intervenciones y Alertas Posturales"
            subtitulo="Historial de intervenciones posturales, alertas sonoras y notificaciones push al APK"
          >
            {historialAlertas.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No se han registrado alertas en esta sesión. La postura se mantiene en rango saludable.
              </div>
            ) : (
              <div className="space-y-2.5 overflow-x-auto">
                {historialAlertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 transition-colors ${
                      alerta.isDismissed
                        ? 'bg-slate-50 border-slate-200 text-slate-500 opacity-70'
                        : alerta.nivel === 'CRITICAL'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                        : 'bg-amber-50/70 border-amber-200 text-amber-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          alerta.nivel === 'CRITICAL'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-slate-950'
                        }`}
                      >
                        {alerta.puntajeRula ? `R${alerta.puntajeRula}` : '!'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{alerta.mensaje}</span>
                          {alerta.isSentToMobile && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-mono">
                              <Smartphone className="w-3 h-3" />
                              <span>Push APK</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(alerta.createdAt).toLocaleTimeString()} • {alerta.isDismissed ? 'Atendida' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    {!alerta.isDismissed && (
                      <button
                        type="button"
                        onClick={() => descartarAlerta(alerta.id)}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                      >
                        Descartar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Tarjeta>
        </div>

        {/* Derecha: Panel de Diagnóstico RULA */}
        <div className="space-y-4">
          <Tarjeta titulo="Evaluación Postural RULA" subtitulo="Método Ergonómico Automatizado">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Nivel de Acción
                </span>
                <span
                  className={`text-3xl font-black font-['Bricolage_Grotesque'] ${
                    puntajeRula >= configAlertas.umbralRulaCritico ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  Puntaje {puntajeRula}
                </span>
              </div>
              <Insignia
                variante={puntajeRula >= configAlertas.umbralRulaCritico ? 'peligro' : 'exito'}
                className="px-3 py-1 text-xs"
              >
                {puntajeRula >= configAlertas.umbralRulaCritico
                  ? 'Riesgo Alto • Modificar Pronto'
                  : 'Riesgo Bajo • Postura Correcta'}
              </Insignia>
            </div>

            {/* Selector de Prueba RULA */}
            <div className="p-3 bg-slate-100/70 rounded-xl mb-4 space-y-1.5">
              <span className="text-[11px] font-bold text-slate-700 block">
                Ajustar Nivel RULA (Simulador):
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {[2, 4, 5, 7].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setPuntajeRula(val);
                      if (val >= 5) setAnguloCuello(26);
                      else setAnguloCuello(12);
                    }}
                    className={`py-1 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                      puntajeRula === val
                        ? val >= 5
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    RULA {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Inclinación del Cuello:</span>
                <span className={`font-bold ${anguloCuello > 20 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {anguloCuello}° ({anguloCuello > 20 ? '>20° penalizado' : 'Alineado'})
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Flexión de Tronco:</span>
                <span className="font-bold text-amber-600">{anguloTronco}° (Intermedio)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Elevación de Hombros:</span>
                <span className="font-bold text-emerald-600">{anguloHombros}° (Correcto)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Fatiga Acumulada:</span>
                <span className={`font-bold ${nivelFatiga >= configAlertas.umbralFatigaPorcentaje ? 'text-amber-600' : 'text-slate-700'}`}>
                  {nivelFatiga}% (Umbral: {configAlertas.umbralFatigaPorcentaje}%)
                </span>
              </div>
            </div>

            {/* Temporizador estático y activación de alerta */}
            <div className="mt-5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Tiempo Inmóvil:</span>
                <span className="text-sm font-bold text-amber-700 font-mono">{segundosEstaticos} seg</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    segundosEstaticos >= configAlertas.tiempoSostenidoSegundos
                      ? 'bg-rose-500'
                      : 'bg-amber-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (segundosEstaticos / configAlertas.tiempoSostenidoSegundos) * 100,
                    )}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Al superar {configAlertas.tiempoSostenidoSegundos}s continuos en postura estática con RULA ≥ {configAlertas.umbralRulaCritico}, el sistema emite alerta visual, sonora y push móvil.
              </p>
            </div>
          </Tarjeta>
        </div>
      </div>

      {/* Banner de Alerta Flotante en Pantalla (Visual + Push Indicator) */}
      <BannerAlertaPostura
        alerta={alertaActiva}
        alCerrar={() => setAlertaActiva(null)}
        alIniciarPausaActiva={() => setModalPausaActivaAbierto(true)}
      />

      {/* Modal Guiado de Pausa Activa de 30 segundos */}
      <ModalPausaActiva
        abierto={modalPausaActivaAbierto}
        alCerrar={() => setModalPausaActivaAbierto(false)}
        alCompletar={completarPausaActiva}
      />

      {/* Modal de Personalización de Alertas y Frecuencias */}
      <ModalConfiguracionAlertas
        abierto={modalConfiguracionAbierto}
        alCerrar={() => setModalConfiguracionAbierto(false)}
        alGuardarExitoso={(nueva) => setConfigAlertas(nueva)}
      />

      {/* Modal Integrado de Consentimiento y Calibración */}
      <ModalConsentimiento
        abierto={modalConsentimientoAbierto}
        alCerrar={() => setModalConsentimientoAbierto(false)}
        alAceptarConsentimiento={() => {
          setModalConsentimientoAbierto(false);
          setTieneConsentimiento(true);
        }}
      />
    </div>
  );
};

export const PostureMonitorPage = PaginaMonitorPostura;
