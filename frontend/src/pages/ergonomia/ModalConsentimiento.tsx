import React, { useState } from 'react';
import {
  ShieldAlert,
  Lock,
  Eye,
  Video,
  VideoOff,
  ArrowRight,
  RefreshCw,
  X,
  Cpu,
} from 'lucide-react';
import { useCamaraConsentimiento } from '../../hooks/useCamaraConsentimiento.js';
import { servicioConsentimiento } from '../../services/servicioConsentimiento.js';

interface PropiedadesModalConsentimiento {
  abierto: boolean;
  alCerrar: () => void;
  alAceptarConsentimiento: () => void;
}

export const ModalConsentimiento: React.FC<PropiedadesModalConsentimiento> = ({
  abierto,
  alCerrar,
  alAceptarConsentimiento,
}) => {
  const [aceptaCamara, setAceptaCamara] = useState<boolean>(true);
  const [aceptaTelemetria, setAceptaTelemetria] = useState<boolean>(true);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    estado: estadoCamara,
    errorMensaje: errorCamara,
    videoRef,
    solicitarPermisoYActivar,
    detenerCamara,
  } = useCamaraConsentimiento();

  if (!abierto) return null;

  const puedeContinuar = aceptaCamara && aceptaTelemetria;

  const manejarConfirmar = async () => {
    if (!puedeContinuar) return;

    try {
      setGuardando(true);
      setError(null);

      // Si aún no solicitó la cámara, activar el pop-up del navegador
      if (estadoCamara !== 'activo') {
        await solicitarPermisoYActivar();
      }

      // Registrar firma digital en el backend
      await servicioConsentimiento.firmar(
        ['CAMERA_AND_BIOMETRICS', 'TELEMETRY_AND_ACTIVITY'],
        '1.0',
      );

      detenerCamara();
      alAceptarConsentimiento();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar el consentimiento.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1020]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-fade-in">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1020] text-[#C6F432] flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                Consentimiento y Acceso a Cámara
              </h3>
              <p className="text-xs text-slate-500">
                Requisito ético y normativo previo al monitoreo ergonómico
              </p>
            </div>
          </div>
          <button
            onClick={alCerrar}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium">
              {error}
            </div>
          )}

          {/* Garantías de privacidad */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Cpu className="w-4 h-4 text-[#0B1020]" />
              <span>Privacidad Garantizada por Diseño:</span>
            </div>
            <p className="text-slate-600 text-[11.5px] leading-relaxed">
              La inferencia visual se ejecuta exclusivamente en la <strong>memoria RAM de tu navegador</strong>. Ningún fotograma se almacena en disco ni se envía a servidores. Al servidor únicamente se transfieren métricas numéricas de ángulos posturales.
            </p>
          </div>

          {/* Casillas de consentimiento explícito */}
          <div className="space-y-2.5">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={aceptaCamara}
                onChange={(e) => setAceptaCamara(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0B1020] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#0B1020]" />
                  Autorizo el uso de la cámara web para estimación de postura local (RULA)
                </span>
                <span className="text-slate-500 mt-0.5 block text-[11px]">
                  Cálculo de ángulos de cuello, hombros y tronco para prevenir fatiga laboral.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={aceptaTelemetria}
                onChange={(e) => setAceptaTelemetria(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#0B1020] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#0B1020]" />
                  Autorizo la telemetría de sesión y recordatorios de pausas activas
                </span>
                <span className="text-slate-500 mt-0.5 block text-[11px]">
                  Alertas preventivas de descanso visual y prevención de microtraumatismos.
                </span>
              </div>
            </label>
          </div>

          {/* Prueba rápida de cámara opcional */}
          <div className="border-t border-slate-100 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-slate-500" />
                Comprobar cámara en vivo
              </span>
              {estadoCamara !== 'activo' ? (
                <button
                  type="button"
                  onClick={() => solicitarPermisoYActivar()}
                  disabled={estadoCamara === 'solicitando'}
                  className="text-xs font-bold text-[#0B1020] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${estadoCamara === 'solicitando' ? 'animate-spin' : ''}`} />
                  <span>{estadoCamara === 'solicitando' ? 'Solicitando...' : 'Probar Cámara'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={detenerCamara}
                  className="text-xs font-bold text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <VideoOff className="w-3 h-3" />
                  <span>Detener</span>
                </button>
              )}
            </div>

            {estadoCamara === 'activo' && (
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-[16/9] max-h-40 border border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                <span className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-mono font-bold bg-[#0B1020]/90 text-[#C6F432] px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6F432] animate-pulse" />
                  Sensor Activo en RAM
                </span>
              </div>
            )}

            {errorCamara && (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                {errorCamara}
              </p>
            )}
          </div>
        </div>

        {/* Pie del Modal */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Firma con IP y marca de tiempo</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={alCerrar}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={manejarConfirmar}
              disabled={!puedeContinuar || guardando}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1020] text-[#C6F432] rounded-xl text-xs font-bold hover:bg-[#16203d] active:scale-[0.99] transition-all cursor-pointer shadow-xs disabled:opacity-40"
            >
              {guardando ? (
                <span>Guardando...</span>
              ) : (
                <>
                  <span>Autorizar e Iniciar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
