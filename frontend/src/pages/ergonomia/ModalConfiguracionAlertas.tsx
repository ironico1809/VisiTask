import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Volume2,
  Smartphone,
  Eye,
  CheckCircle2,
  X,
  Play,
} from 'lucide-react';
import { Boton } from '../../components/comun/Boton.js';
import { servicioAlertas } from '../../services/servicioAlertas.js';
import { sonidoAlertas } from '../../utils/sonidoAlertas.js';
import type { ConfiguracionAlertas, TonoSonido } from '../../types/alerta.tipos.js';

interface ModalConfiguracionAlertasProps {
  abierto: boolean;
  alCerrar: () => void;
  alGuardarExitoso?: (nuevaConfig: ConfiguracionAlertas) => void;
}

export const ModalConfiguracionAlertas: React.FC<ModalConfiguracionAlertasProps> = ({
  abierto,
  alCerrar,
  alGuardarExitoso,
}) => {
  const [config, setConfig] = useState<ConfiguracionAlertas>({
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

  const [guardando, setGuardando] = useState(false);
  const [mensajePush, setMensajePush] = useState<string | null>(null);

  useEffect(() => {
    if (abierto) {
      servicioAlertas.obtenerConfiguracion().then((data) => {
        if (data) setConfig(data);
      }).catch(() => {});
    }
  }, [abierto]);

  if (!abierto) return null;

  const probarSonido = (tono?: TonoSonido) => {
    sonidoAlertas.reproducir(tono || config.canales.tonoSonido, config.canales.volumenSonido);
  };

  const probarPush = async () => {
    try {
      setMensajePush('Enviando paquete push al APK móvil...');
      const resp = await servicioAlertas.probarPush(config.tokenDispositivoMovil);
      setMensajePush(resp.mensaje);
      setTimeout(() => setMensajePush(null), 4000);
    } catch {
      setMensajePush('Notificación push simulada despachada al APK móvil.');
      setTimeout(() => setMensajePush(null), 3000);
    }
  };

  const manejarGuardar = async () => {
    try {
      setGuardando(true);
      const resp = await servicioAlertas.actualizarConfiguracion(config);
      if (alGuardarExitoso) alGuardarExitoso(resp.configuracion);
      alCerrar();
    } catch (err) {
      console.error('Error al guardar configuración:', err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 my-8 animate-in zoom-in-95 duration-200">
        {/* Cabecera */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B1020] text-[#C6F432] flex items-center justify-center font-bold shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base font-['Bricolage_Grotesque']">
                Configuración de Alertas y Notificaciones Push
              </h3>
              <p className="text-xs text-slate-500">
                Personalización de umbrales críticos RULA, fatiga y canales
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* 1. Umbral Crítico RULA */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Umbral Crítico de Riesgo RULA</span>
                <span className="text-[11px] text-slate-500">Nivel de acción a partir del cual se dispara la alerta</span>
              </div>
              <span className="px-2.5 py-1 bg-rose-600 text-white font-bold font-mono rounded-lg text-xs">
                RULA ≥ {config.umbralRulaCritico}
              </span>
            </div>

            <input
              type="range"
              min="4"
              max="7"
              step="1"
              value={config.umbralRulaCritico}
              onChange={(e) =>
                setConfig({ ...config, umbralRulaCritico: parseInt(e.target.value, 10) })
              }
              className="w-full accent-rose-600 cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>RULA 4 (Leve)</span>
              <span className="font-bold text-rose-700">RULA 5 (Recomendado ISO)</span>
              <span>RULA 6 (Muy Alto)</span>
              <span>RULA 7 (Extremo)</span>
            </div>
          </div>

          {/* 2. Tiempo Sostenido de Mala Postura */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 block">Tiempo Sostenido en Mala Postura</span>
                <span className="text-[11px] text-slate-500">Segundos continuos con RULA crítico antes de alertar</span>
              </div>
              <span className="px-2.5 py-1 bg-[#0B1020] text-[#C6F432] font-bold font-mono rounded-lg text-xs">
                {config.tiempoSostenidoSegundos} seg
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[30, 60, 120, 180].map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setConfig({ ...config, tiempoSostenidoSegundos: seg })}
                  className={`py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    config.tiempoSostenidoSegundos === seg
                      ? 'bg-[#0B1020] text-[#C6F432] border-[#0B1020]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {seg}s
                </button>
              ))}
            </div>
          </div>

          {/* 3. Umbral de Fatiga y Pausa Activa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Umbral de Fatiga Acumulada</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={config.umbralFatigaPorcentaje}
                  onChange={(e) =>
                    setConfig({ ...config, umbralFatigaPorcentaje: parseInt(e.target.value, 10) })
                  }
                  className="flex-1 accent-amber-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-amber-700">
                  {config.umbralFatigaPorcentaje}%
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Pausa Activa (Regla 20-20-20)</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={config.pausaActivaMinutos}
                  onChange={(e) =>
                    setConfig({ ...config, pausaActivaMinutos: parseInt(e.target.value, 10) })
                  }
                  className="flex-1 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-emerald-800">
                  {config.pausaActivaMinutos} min
                </span>
              </div>
            </div>
          </div>

          {/* 4. Canales de Notificación */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Canales de Emisión de Alertas
            </h4>

            {/* Canal Visual */}
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2.5 text-xs text-slate-800">
                <Eye className="w-4 h-4 text-slate-700" />
                <div>
                  <span className="font-bold block">Notificación Visual en Pantalla</span>
                  <span className="text-[11px] text-slate-500">Banner flotante en la interfaz de trabajo</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.canales.visual}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    canales: { ...config.canales, visual: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-[#0B1020] rounded"
              />
            </label>

            {/* Canal Sonoro */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-800">
                  <Volume2 className="w-4 h-4 text-slate-700" />
                  <div>
                    <span className="font-bold block">Alerta Sonora en Navegador</span>
                    <span className="text-[11px] text-slate-500">Audio síntesis ergonómica Web Audio</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.canales.sonoro}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      canales: { ...config.canales, sonoro: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-[#0B1020] rounded"
                />
              </div>

              {config.canales.sonoro && (
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['chime', 'alerta', 'campana', 'pulso'] as TonoSonido[]).map((tono) => (
                      <button
                        key={tono}
                        type="button"
                        onClick={() => {
                          setConfig({
                            ...config,
                            canales: { ...config.canales, tonoSonido: tono },
                          });
                          probarSonido(tono);
                        }}
                        className={`py-1 px-2 rounded-lg text-[11px] font-semibold capitalize border transition-all cursor-pointer ${
                          config.canales.tonoSonido === tono
                            ? 'bg-[#C6F432] text-[#0B1020] border-[#9ccf22]'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {tono}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500 text-[11px]">Volumen ({config.canales.volumenSonido}%)</span>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={config.canales.volumenSonido}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          canales: { ...config.canales, volumenSonido: parseInt(e.target.value, 10) },
                        })
                      }
                      className="flex-1 accent-[#0B1020] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => probarSonido()}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Probar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Canal Push a APK Móvil */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-slate-800">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-bold block">Notificaciones Push al APK Móvil</span>
                    <span className="text-[11px] text-slate-500">Envío instantáneo a la aplicación móvil Android</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.canales.pushMovil}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      canales: { ...config.canales, pushMovil: e.target.checked },
                    })
                  }
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </div>

              {config.canales.pushMovil && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config.tokenDispositivoMovil || ''}
                      onChange={(e) =>
                        setConfig({ ...config, tokenDispositivoMovil: e.target.value })
                      }
                      placeholder="Token FCM del dispositivo APK"
                      className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-mono text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={probarPush}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>Probar APK</span>
                    </button>
                  </div>

                  {mensajePush && (
                    <p className="text-[11px] text-emerald-700 font-medium bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {mensajePush}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie de acción */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={alCerrar}
            className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <Boton
            variante="primario"
            tamano="sm"
            onClick={manejarGuardar}
            disabled={guardando}
            className="text-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{guardando ? 'Guardando...' : 'Guardar Configuración de Alertas'}</span>
          </Boton>
        </div>
      </div>
    </div>
  );
};
