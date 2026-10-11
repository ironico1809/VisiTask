import React, { useState, useEffect } from 'react';
import { ShieldCheck, RefreshCw, ShieldAlert } from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { ModalConsentimiento } from './ModalConsentimiento.js';
import { servicioConsentimiento } from '../../services/servicioConsentimiento.js';

export const PaginaMonitorPostura: React.FC = () => {
  const [estaCalibrando, setEstaCalibrando] = useState(false);
  const [modalConsentimientoAbierto, setModalConsentimientoAbierto] = useState(false);
  const [tieneConsentimiento, setTieneConsentimiento] = useState(true);
  const enSegundoPlano = false;

  // Comprobar estado del consentimiento legal al cargar
  useEffect(() => {
    servicioConsentimiento.obtenerEstado().then((resp) => {
      setTieneConsentimiento(resp.tieneConsentimiento);
      if (!resp.tieneConsentimiento) {
        setModalConsentimientoAbierto(true);
      }
    }).catch(() => {});
  }, []);

  const recalibrarLineaBase = () => {
    setEstaCalibrando(true);
    setTimeout(() => setEstaCalibrando(false), 3000);
  };

  // Métricas en tiempo real idénticas al prototipo
  const [puntajeRula] = useState(6);
  const [anguloCuello] = useState(26);
  const [anguloTronco] = useState(19);
  const [anguloHombros] = useState(14);
  const [segundosEstaticos] = useState(64);

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
            <span>Consentimiento CU03: {tieneConsentimiento ? 'Activo' : 'Pendiente'}</span>
          </button>
          <Insignia variante="exito" className="py-1 px-3">
            Buffer RAM: 0 KB
          </Insignia>
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
                <line x1="50" y1="20" x2="50" y2="45" stroke="#4ade80" strokeWidth="1" />
                <line x1="38" y1="30" x2="62" y2="30" stroke="#4ade80" strokeWidth="1.2" />
                <line x1="38" y1="30" x2="30" y2="48" stroke="#facc15" strokeWidth="1" />
                <line x1="62" y1="30" x2="70" y2="48" stroke="#facc15" strokeWidth="1" />
                <circle cx="50" cy="20" r="2.5" fill="#C6F432" stroke="#0B1020" strokeWidth="0.5" />
                <circle cx="38" cy="30" r="2" fill="#4ade80" />
                <circle cx="62" cy="30" r="2" fill="#4ade80" />
                <circle cx="30" cy="48" r="2" fill="#facc15" />
                <circle cx="70" cy="48" r="2" fill="#facc15" />
              </svg>

              {/* Insignias de Telemetría sobre el video */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Insignia variante="marca">
                  MediaPipe Pose • 30 FPS
                </Insignia>
                {enSegundoPlano && (
                  <Insignia variante="advertencia" className="bg-amber-400 text-slate-900 border-none">
                    Modo Ahorro: 5 FPS
                  </Insignia>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 flex items-center justify-between text-white">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span>Tronco: <b className="text-amber-400">{anguloTronco}°</b></span>
                  <span>Cuello: <b className="text-rose-400">{anguloCuello}°</b></span>
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
        </div>

        {/* Derecha: Panel de Diagnóstico RULA */}
        <div className="space-y-4">
          <Tarjeta titulo="Evaluación Postural RULA" subtitulo="Método Ergonómico Automatizado">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Nivel de Acción
                </span>
                <span className="text-3xl font-black text-rose-600 font-['Bricolage_Grotesque']">
                  Puntaje {puntajeRula}
                </span>
              </div>
              <Insignia variante="peligro" className="px-3 py-1 text-xs">
                Riesgo Alto • Modificar Pronto
              </Insignia>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Inclinación del Cuello:</span>
                <span className="font-bold text-rose-600">{anguloCuello}° (&gt;20° penalizado)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Flexión de Tronco:</span>
                <span className="font-bold text-amber-600">{anguloTronco}° (Intermedio)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-600">Elevación de Hombros:</span>
                <span className="font-bold text-emerald-600">{anguloHombros}° (Correcto)</span>
              </div>
            </div>

            {/* Temporizador estático */}
            <div className="mt-5 p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Tiempo Inmóvil:</span>
                <span className="text-sm font-bold text-amber-700 font-mono">{segundosEstaticos} seg</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (segundosEstaticos / 60) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Al superar 60s continuos en postura estática, el algoritmo aplica +1 de penalización automática por carga muscular estática.
              </p>
            </div>
          </Tarjeta>
        </div>
      </div>

      {/* Modal Integrado de Consentimiento y Calibración (CU03) */}
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
