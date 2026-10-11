import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Eye,
  Video,
  VideoOff,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Info,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { useCamaraConsentimiento } from '../../hooks/useCamaraConsentimiento.js';
import { servicioConsentimiento } from '../../services/servicioConsentimiento.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';

export const PaginaConsentimiento: React.FC = () => {
  useTituloPagina('Consentimiento Informado');
  const navegar = useNavigate();

  // Estados de consentimiento explícito
  const [aceptaCamara, setAceptaCamara] = useState<boolean>(false);
  const [aceptaTelemetria, setAceptaTelemetria] = useState<boolean>(false);
  const [estaEnviando, setEstaEnviando] = useState<boolean>(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Hook para prueba técnica de hardware (cámara web)
  const {
    estado: estadoCamara,
    errorMensaje: errorCamara,
    videoRef,
    solicitarPermisoYActivar,
    detenerCamara,
  } = useCamaraConsentimiento();

  // Comprobar estado previo al montar
  useEffect(() => {
    servicioConsentimiento.obtenerEstado().then((resp) => {
      if (resp.tieneConsentimiento) {
        setAceptaCamara(resp.aceptaCamara);
        setAceptaTelemetria(resp.aceptaTelemetria);
      }
    }).catch(() => {});
  }, []);

  const puedeContinuar = aceptaCamara && aceptaTelemetria;

  const manejarPruebaCamara = async () => {
    setMensajeError(null);
    const exito = await solicitarPermisoYActivar();
    if (exito) {
      setAceptaCamara(true);
    }
  };

  const confirmarConsentimiento = async () => {
    if (!puedeContinuar) return;

    try {
      setEstaEnviando(true);
      setMensajeError(null);

      // Si no probó la cámara aún, solicitar el permiso del navegador
      if (estadoCamara !== 'activo') {
        await solicitarPermisoYActivar();
      }

      // Registrar firma digital inmutable en el backend
      await servicioConsentimiento.firmar(
        ['CAMERA_AND_BIOMETRICS', 'TELEMETRY_AND_ACTIVITY'],
        '1.0',
      );

      setMensajeExito('Consentimiento informado registrado exitosamente en auditoría SST.');

      // Detener el stream de prueba antes de pasar al monitor
      detenerCamara();

      setTimeout(() => {
        navegar('/ergonomia');
      }, 1200);
    } catch (err: any) {
      setMensajeError(err.response?.data?.message || 'Error al registrar la firma de consentimiento.');
    } finally {
      setEstaEnviando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Encabezado Principal */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1020] text-[#C6F432] flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Norma SST • Requisito Legal CU03
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-['Bricolage_Grotesque']">
              Consentimiento Informado Digital
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Autorización obligatoria y transparente para telemetría ergonómica y uso de cámara web local
            </p>
          </div>
        </div>

        {/* Notificaciones */}
        {mensajeExito && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{mensajeExito}</span>
          </div>
        )}

        {mensajeError && (
          <div className="mt-4 flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm font-medium">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{mensajeError}</span>
          </div>
        )}

        {/* Tarjeta Informativa: Privacidad por Diseño */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-3">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Cpu className="w-4 h-4 text-[#0B1020]" />
            <span>Garantías de Privacidad por Diseño (Privacy by Design)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11.5px] leading-relaxed">
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Cero Grabación en Servidores
              </span>
              <p className="text-slate-500">
                La captura de video se procesa exclusivamente en la memoria RAM de tu navegador. Ningún fotograma de video se almacena en disco ni se transmite por internet.
              </p>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Telemetría Sintética (RULA/REBA)
              </span>
              <p className="text-slate-500">
                Únicamente se generan cálculos matemáticos de postura (ángulos articulares del cuello, tronco y brazos) para prevenir lesiones musculoesqueléticas.
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Autorizaciones Explícitas */}
        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Autorizaciones Obligatorias
          </h3>

          <label className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={aceptaCamara}
              onChange={(e) => setAceptaCamara(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0B1020] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
                <Video className="w-4 h-4 text-[#0B1020]" />
                1. Autorizo el uso de la cámara web para inferencia ergonómica y postural local
              </span>
              <span className="text-slate-500 mt-1 block">
                Comprendo que la cámara se utilizará en tiempo real para estimar puntos articulares y evaluar el riesgo ergonómico en mi estación de trabajo.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={aceptaTelemetria}
              onChange={(e) => setAceptaTelemetria(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0B1020] cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-bold text-slate-900 block flex items-center gap-1.5 text-sm">
                <Eye className="w-4 h-4 text-[#0B1020]" />
                2. Autorizo la telemetría de foco de ventana y recordatorios de pausas activas
              </span>
              <span className="text-slate-500 mt-1 block">
                Acepto el registro de eventos de sesión activa para emitir alertas oportunas de descanso visual y prevención de fatiga laboral.
              </span>
            </div>
          </label>
        </div>

        {/* Sección de Prueba Técnica de Hardware (Cámara Web en Vivo) */}
        <div className="mt-6 border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-[#0B1020]" />
                Prueba Técnica y Calibración de Cámara
              </h3>
              <p className="text-xs text-slate-500">
                Verifica el funcionamiento del sensor antes de comenzar la sesión
              </p>
            </div>

            {estadoCamara !== 'activo' ? (
              <button
                type="button"
                onClick={manejarPruebaCamara}
                disabled={estadoCamara === 'solicitando'}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${estadoCamara === 'solicitando' ? 'animate-spin' : ''}`} />
                <span>{estadoCamara === 'solicitando' ? 'Solicitando...' : 'Activar y Probar Cámara'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={detenerCamara}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                <VideoOff className="w-3.5 h-3.5" />
                <span>Detener Prueba</span>
              </button>
            )}
          </div>

          {/* Visor de Video en Vivo de la Cámara */}
          {estadoCamara === 'activo' && (
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-[16/9] max-h-64 shadow-md flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />

              {/* Guía facial y de hombros para el usuario */}
              <div className="absolute inset-0 border-2 border-dashed border-[#C6F432]/40 m-6 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-3">
                <span className="text-[10px] font-mono text-[#C6F432] bg-[#0B1020]/80 px-2 py-0.5 rounded-full">
                  Área de encuadre ergonómico
                </span>
                <span className="text-[10px] text-white/80 bg-slate-900/80 px-2 py-0.5 rounded-md">
                  Asegúrate de que tu cabeza y hombros sean visibles
                </span>
              </div>

              {/* Insignia de estado verde */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-[#0B1020]/90 text-[#C6F432] px-3 py-1 rounded-full text-xs font-mono font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#C6F432] animate-pulse" />
                <span>Cámara Activa • 640x480 RAM</span>
              </div>
            </div>
          )}

          {/* Ayuda visual en caso de que el permiso sea denegado o haya error */}
          {(estadoCamara === 'denegado' || errorCamara) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Info className="w-4 h-4 text-amber-700" />
                <span>Permiso de cámara bloqueado en el navegador</span>
              </div>
              <p className="text-amber-800">{errorCamara}</p>
              <div className="pt-1 text-[11px] text-amber-700 bg-amber-100/60 p-2.5 rounded-lg space-y-1">
                <p className="font-semibold">¿Cómo habilitarlo en Chrome o Edge?</p>
                <ol className="list-decimal list-inside space-y-0.5">
                  <li>Haz clic en el ícono de <strong>candado o configuración</strong> a la izquierda de la URL (en la barra de direcciones).</li>
                  <li>Localiza la opción <strong>Cámara</strong> y cámbiala a <strong>Permitir</strong>.</li>
                  <li>Recarga la página o pulsa nuevamente en <em>"Activar y Probar Cámara"</em>.</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Pie de Firma Digital y Confirmación */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Firma digital inmutable registrada con IP y marca de tiempo UTC</span>
          </div>

          <button
            type="button"
            onClick={confirmarConsentimiento}
            disabled={!puedeContinuar || estaEnviando}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 bg-[#0B1020] text-[#C6F432] rounded-xl text-xs sm:text-sm font-bold hover:bg-[#16203d] active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {estaEnviando ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-[#C6F432]" />
                <span>Registrando firma...</span>
              </span>
            ) : (
              <>
                <span>Autorizar e Iniciar Monitoreo</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConsentPage = PaginaConsentimiento;
