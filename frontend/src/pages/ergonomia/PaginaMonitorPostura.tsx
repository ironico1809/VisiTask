import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Layers } from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { Boton } from '../../components/comun/Boton.js';

export const PaginaMonitorPostura: React.FC = () => {
  const [enSegundoPlano, setEnSegundoPlano] = useState(false);
  const [estaCalibrando, setEstaCalibrando] = useState(false);

  const recalibrarLineaBase = () => {
    setEstaCalibrando(true);
    setTimeout(() => setEstaCalibrando(false), 3000);
  };

  // Métricas en tiempo real idénticas al prototipo Image 3
  const [puntajeRula] = useState(6);
  const [anguloCuello] = useState(26);
  const [anguloTronco] = useState(19);
  const [anguloHombros] = useState(14);
  const [segundosEstaticos] = useState(64);

  return (
    <div className="space-y-6">
      {/* Banner Superior: Privacidad y Destrucción en RAM */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs text-emerald-900">
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
        <Insignia variante="exito" className="py-1 px-3">
          Buffer RAM: 0 KB en Cola
        </Insignia>
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
                {/* Línea de columna y cabeza */}
                <line x1="50" y1="20" x2="50" y2="45" stroke="#4ade80" strokeWidth="1" />
                <line x1="50" y1="45" x2="50" y2="75" stroke="#4ade80" strokeWidth="1" />
                {/* Barra de hombros */}
                <line x1="32" y1="45" x2="68" y2="45" stroke="#4ade80" strokeWidth="1" />
                {/* Cuello a hombros */}
                <line x1="50" y1="35" x2="32" y2="45" stroke="#4ade80" strokeWidth="0.8" />
                <line x1="50" y1="35" x2="68" y2="45" stroke="#4ade80" strokeWidth="0.8" />
                {/* Nodos de articulaciones */}
                <circle cx="50" cy="18" r="1.8" fill="#86efac" />
                <circle cx="50" cy="27" r="1.5" fill="#86efac" />
                <circle cx="50" cy="35" r="1.5" fill="#86efac" />
                <circle cx="32" cy="45" r="1.8" fill="#86efac" />
                <circle cx="68" cy="45" r="1.8" fill="#86efac" />
                <circle cx="50" cy="55" r="1.5" fill="#86efac" />
                <circle cx="50" cy="70" r="1.8" fill="#86efac" />
              </svg>

              {/* Píldora de estado en el video */}
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Detección Pose Activa en Web Worker (30 FPS)</span>
              </div>

              {enSegundoPlano && (
                <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
                  <Layers className="w-12 h-12 text-[#C6F432] mb-3 animate-bounce" />
                  <h4 className="text-lg font-bold">Monitoreo Ergonómico en Segundo Plano</h4>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    La cámara continúa evaluando tu postura silenciosamente mientras trabajas. Recibirás alertas solo si tu riesgo RULA es alto.
                  </p>
                  <Boton
                    variante="borde"
                    tamano="sm"
                    className="mt-4 bg-white/10 text-white border-white/20 hover:bg-white/20"
                    onClick={() => setEnSegundoPlano(false)}
                  >
                    Restaurar Vista de Video
                  </Boton>
                </div>
              )}
            </div>

            {/* Botón de Acción Prominente: Ejecutar en Segundo Plano */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <Boton
                variante="borde"
                tamano="md"
                className="gap-2 text-xs"
                disabled={estaCalibrando}
                onClick={recalibrarLineaBase}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${estaCalibrando ? 'animate-spin' : ''}`} />
                <span>{estaCalibrando ? 'Calibrando (3s)...' : 'Recalibrar Baseline (3s)'}</span>
              </Boton>

              <Boton
                variante="primario"
                tamano="lg"
                className="gap-2 px-8 text-sm font-bold shadow-md"
                onClick={() => setEnSegundoPlano(!enSegundoPlano)}
              >
                <Layers className="w-4 h-4" />
                <span>{enSegundoPlano ? 'Abrir Visor de Cámara' : 'Ejecutar en Segundo Plano'}</span>
              </Boton>
            </div>
          </Tarjeta>
        </div>

        {/* Derecha: Panel de Métricas */}
        <div className="space-y-4">
          {/* Tarjeta Principal RULA */}
          <Tarjeta className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                  Método Ergonómico
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">RULA: {puntajeRula}</h3>
              </div>
              <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex flex-col items-center justify-center font-bold shadow-md">
                <span className="text-[10px] uppercase tracking-tighter">RIESGO</span>
                <span className="text-xs uppercase">ALTO</span>
              </div>
            </div>

            <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg font-medium mb-6">
              ⚠️ Inflexión prolongada de cuello detectada. Nivel de intervención 3: Cambios ergonómicos necesarios pronto.
            </p>

            {/* Lista de Ángulos */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Ángulo Cuello:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {anguloCuello}° <span className="text-rose-600 font-normal">(Límite: 20°)</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Ángulo Tronco:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {anguloTronco}° <span className="text-emerald-600 font-normal">(Correcto)</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Ángulo Hombros:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {anguloHombros}°
                </span>
              </div>
            </div>
          </Tarjeta>

          {/* Tarjeta de Carga Estática Acumulada */}
          <Tarjeta
            titulo="Carga Estática Acumulada"
            subtitulo="Penalización por inmovilidad articular sostenida > 60s"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Tiempo Inmóvil:</span>
                <span className="text-sm font-bold text-amber-600">{segundosEstaticos} seg</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (segundosEstaticos / 60) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Al superar los 60 segundos estáticos, el puntaje RULA suma +1 de penalización automática por sobrecarga muscular estática.
              </p>
            </div>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
};

export const PostureMonitorPage = PaginaMonitorPostura;
