import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Send,
  Timer,
  Activity,
  Brain,
  AlertTriangle,
  CheckCircle2,
  Zap,
  PlusCircle,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import {
  servicioSupervision,
  type PreguntaControl,
  type ReaccionEntrevista,
} from '../../services/servicioSupervision.js';

interface PropiedadesPanelPreguntasControl {
  sesionId: string;
  alRegistrarEvento: () => void;
}

export const PanelPreguntasControlEntrevista: React.FC<PropiedadesPanelPreguntasControl> = ({
  sesionId,
  alRegistrarEvento,
}) => {
  // Lista de preguntas institucionales
  const [preguntas, setPreguntas] = useState<PreguntaControl[]>([]);
  const [cargandoPreguntas, setCargandoPreguntas] = useState<boolean>(true);
  const [preguntaSeleccionadaId, setPreguntaSeleccionadaId] = useState<string>('');
  const [textoPreguntaPersonalizada, setTextoPreguntaPersonalizada] = useState<string>('');
  const [duracionVentana, setDuracionVentana] = useState<number>(15);

  // Estados de ejecución de la ventana focalizada
  const [enVentanaActiva, setEnVentanaActiva] = useState<boolean>(false);
  const [segundosRestantes, setSegundosRestantes] = useState<number>(15);
  const [disparando, setDisparando] = useState<boolean>(false);

  // Perfil de simulación biométrica para evaluación del examinador
  const [perfilSimulacion, setPerfilSimulacion] = useState<'coherente' | 'estres_anomalo' | 'retraso_cognitivo'>('coherente');

  // Historial de reacciones de la sesión
  const [reacciones, setReacciones] = useState<ReaccionEntrevista[]>([]);
  const [cargandoReacciones, setCargandoReacciones] = useState<boolean>(false);
  const [ultimaReaccion, setUltimaReaccion] = useState<ReaccionEntrevista | null>(null);

  // Modal para agregar nueva pregunta institucional
  const [modalNuevaPregunta, setModalNuevaPregunta] = useState<boolean>(false);
  const [nuevaPreguntaTexto, setNuevaPreguntaTexto] = useState<string>('');
  const [guardandoNueva, setGuardandoNueva] = useState<boolean>(false);

  // Mensaje de estado
  const [mensajeEstado, setMensajeEstado] = useState<{ tipo: 'exito' | 'error' | 'alerta'; texto: string } | null>(null);

  // Cargar preguntas institucionales iniciales
  const cargarPreguntas = async () => {
    setCargandoPreguntas(true);
    try {
      const lista = await servicioSupervision.listarPreguntasControl();
      setPreguntas(lista);
      if (lista.length > 0 && !preguntaSeleccionadaId) {
        setPreguntaSeleccionadaId(lista[0].id);
      }
    } finally {
      setCargandoPreguntas(false);
    }
  };

  // Cargar histórico de reacciones de la sesión
  const cargarReacciones = async () => {
    if (!sesionId) return;
    setCargandoReacciones(true);
    try {
      const lista = await servicioSupervision.listarReaccionesSesion(sesionId);
      setReacciones(lista);
    } finally {
      setCargandoReacciones(false);
    }
  };

  useEffect(() => {
    cargarPreguntas();
    cargarReacciones();
  }, [sesionId]);

  // Manejo del contador regresivo en la ventana focalizada
  useEffect(() => {
    let intervalo: ReturnType<typeof setInterval> | null = null;
    if (enVentanaActiva && segundosRestantes > 0) {
      intervalo = setInterval(() => {
        setSegundosRestantes((prev) => {
          if (prev <= 1) {
            finalizarVentanaBiometrica();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalo) clearInterval(intervalo);
    };
  }, [enVentanaActiva, segundosRestantes]);

  // Disparar la pregunta de control hacia la terminal del postulante
  const lanzarPregunta = async () => {
    setDisparando(true);
    setMensajeEstado(null);

    try {
      const esPersonalizada = preguntaSeleccionadaId === 'personalizada';
      const preguntaObj = preguntas.find((p) => p.id === preguntaSeleccionadaId);
      const textoPregunta = esPersonalizada ? textoPreguntaPersonalizada : preguntaObj?.questionText;

      if (!textoPregunta || textoPregunta.trim().length === 0) {
        setMensajeEstado({
          tipo: 'alerta',
          texto: 'Por favor seleccione o redacte una pregunta de control válida.',
        });
        setDisparando(false);
        return;
      }

      const respuesta = await servicioSupervision.dispararPreguntaControl({
        questionId: esPersonalizada ? undefined : preguntaSeleccionadaId,
        questionText: textoPregunta,
        supervisionSessionId: sesionId,
        duracionVentanaSegundos: duracionVentana,
      });

      if (respuesta.exito) {
        setSegundosRestantes(duracionVentana);
        setEnVentanaActiva(true);
        setMensajeEstado({
          tipo: 'exito',
          texto: `Pregunta de control proyectada en terminal. Ventana de telemetría de ${duracionVentana}s iniciada.`,
        });
      }
    } catch {
      setMensajeEstado({
        tipo: 'error',
        texto: 'Error al enviar la pregunta de control a la terminal de supervisión.',
      });
    } finally {
      setDisparando(false);
    }
  };

  // Finalizar la ventana y computar/persistir telemetría fisiológica en PostgreSQL
  const finalizarVentanaBiometrica = async () => {
    setEnVentanaActiva(false);

    // Parámetros según el perfil de simulación seleccionado para testeo
    let latenciaMs = 1200 + Math.floor(Math.random() * 400);
    let tensionFacial = 0.18 + Math.random() * 0.1;
    let incongruenciaSonrisa = 0.12 + Math.random() * 0.08;
    let sorpresa = 0.22 + Math.random() * 0.1;
    let estresCognitivo = 0.25 + Math.random() * 0.12;

    if (perfilSimulacion === 'estres_anomalo') {
      latenciaMs = 2850 + Math.floor(Math.random() * 600);
      tensionFacial = 0.68 + Math.random() * 0.2;
      incongruenciaSonrisa = 0.58 + Math.random() * 0.25;
      sorpresa = 0.72 + Math.random() * 0.15;
      estresCognitivo = 0.84 + Math.random() * 0.12;
    } else if (perfilSimulacion === 'retraso_cognitivo') {
      latenciaMs = 3600 + Math.floor(Math.random() * 800);
      tensionFacial = 0.52 + Math.random() * 0.15;
      incongruenciaSonrisa = 0.35 + Math.random() * 0.15;
      sorpresa = 0.45 + Math.random() * 0.1;
      estresCognitivo = 0.65 + Math.random() * 0.15;
    }

    try {
      const qId = preguntaSeleccionadaId === 'personalizada' ? (preguntas[0]?.id || 'ques-01') : preguntaSeleccionadaId;
      const res = await servicioSupervision.registrarReaccionEntrevista({
        supervisionSessionId: sesionId,
        questionId: qId,
        reactionLatencyMs: latenciaMs,
        facialTensionDelta: tensionFacial,
        smileIncongruityScore: incongruenciaSonrisa,
        surpriseScore: sorpresa,
        cognitiveStressScore: estresCognitivo,
      });

      if (res.exito) {
        setUltimaReaccion(res.reaccion);
        setMensajeEstado({
          tipo: res.esAnomalo ? 'alerta' : 'exito',
          texto: res.mensaje,
        });
        cargarReacciones();
        alRegistrarEvento();
      }
    } catch {
      setMensajeEstado({
        tipo: 'error',
        texto: 'Error al registrar la reacción biométrica en PostgreSQL.',
      });
    }
  };

  // Crear una nueva pregunta institucional
  const guardarNuevaPregunta = async () => {
    if (!nuevaPreguntaTexto.trim()) return;
    setGuardandoNueva(true);
    try {
      const res = await servicioSupervision.dispararPreguntaControl({
        questionText: nuevaPreguntaTexto,
        supervisionSessionId: sesionId,
      });
      if (res) {
        setNuevaPreguntaTexto('');
        setModalNuevaPregunta(false);
        await cargarPreguntas();
        setMensajeEstado({
          tipo: 'exito',
          texto: 'Nueva pregunta institucional incorporada al banco de evaluación.',
        });
      }
    } finally {
      setGuardandoNueva(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Informativo Superior */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0B1020] border border-slate-700 text-[#C6F432] flex items-center justify-center font-bold shadow-xs">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-['Bricolage_Grotesque']">
                  Preguntas de Control y Validación Cognitiva
                </h3>
                <Insignia variante="marca" className="text-[10px] py-0 px-2 font-mono">
                  Modo Entrevista Activo
                </Insignia>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Faculta al evaluador para lanzar preguntas críticas o de comprobación técnica en la pantalla
                del postulante, abriendo una ventana focalizada de telemetría biométrica inmediata (latencia,
                tensión facial, incongruencia y estrés cognitivo).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right font-mono">
              <span className="text-[10px] text-slate-400 block uppercase">Respuestas Evaluadas</span>
              <span className="text-lg font-bold text-[#C6F432]">{reacciones.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación de Estado */}
      {mensajeEstado && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between animate-fade-in ${
            mensajeEstado.tipo === 'exito'
              ? 'bg-emerald-500/10 border-emerald-300 text-emerald-950'
              : mensajeEstado.tipo === 'alerta'
              ? 'bg-amber-500/15 border-amber-300 text-amber-950 font-medium'
              : 'bg-rose-500/10 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-2">
            {mensajeEstado.tipo === 'exito' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
            {mensajeEstado.tipo === 'alerta' && <AlertTriangle className="w-4 h-4 text-amber-600" />}
            {mensajeEstado.tipo === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
            <span>{mensajeEstado.texto}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeEstado(null)}
            className="text-slate-500 hover:text-slate-900 font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Grid Principal: Consola de Disparo y Visualizador Biométrico */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Consola de Disparo de Preguntas (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Tarjeta
            titulo="Consola de Lanzamiento de Preguntas"
            subtitulo="Seleccione o redacte una pregunta para activar la ventana focalizada"
            accion={
              <button
                type="button"
                onClick={() => setModalNuevaPregunta(true)}
                className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-700" />
                <span>Nueva Institucional</span>
              </button>
            }
          >
            <div className="space-y-4">
              {/* Selector de Pregunta Institucional */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Pregunta de Control a Disparar:
                </label>
                {cargandoPreguntas ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B1020]" />
                    <span>Cargando banco de preguntas de PostgreSQL...</span>
                  </div>
                ) : (
                  <select
                    value={preguntaSeleccionadaId}
                    onChange={(e) => setPreguntaSeleccionadaId(e.target.value)}
                    disabled={enVentanaActiva}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B1020]/20 font-medium text-slate-800 disabled:bg-slate-100"
                  >
                    {preguntas.map((p, idx) => (
                      <option key={p.id} value={p.id}>
                        {idx + 1}. {p.questionText}
                      </option>
                    ))}
                    <option value="personalizada">✍️ Redactar pregunta personalizada en este momento...</option>
                  </select>
                )}
              </div>

              {/* Campo para Pregunta Personalizada si se elige */}
              {preguntaSeleccionadaId === 'personalizada' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-xs font-semibold text-slate-700">
                    Texto de la Pregunta Personalizada:
                  </label>
                  <textarea
                    rows={2}
                    value={textoPreguntaPersonalizada}
                    onChange={(e) => setTextoPreguntaPersonalizada(e.target.value)}
                    disabled={enVentanaActiva}
                    placeholder="Ej: Explique por qué modificó la variable de entorno en el paso anterior..."
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1020]/20 text-slate-800 placeholder:text-slate-400"
                  />
                </div>
              )}

              {/* Opciones de Ventana Temporal y Simulación de Testeo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Duración de Ventana Focalizada:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 15, 20, 30].map((seg) => (
                      <button
                        key={seg}
                        type="button"
                        onClick={() => setDuracionVentana(seg)}
                        disabled={enVentanaActiva}
                        className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer ${
                          duracionVentana === seg
                            ? 'bg-[#0B1020] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {seg}s
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Patrón Biométrico de Respuesta:
                  </label>
                  <select
                    value={perfilSimulacion}
                    onChange={(e) => setPerfilSimulacion(e.target.value as any)}
                    disabled={enVentanaActiva}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none text-slate-800 font-medium"
                  >
                    <option value="coherente">🟢 Coherente (Bajo estrés / Rápida)</option>
                    <option value="estres_anomalo">🔴 Anómalo (Incongruencia y microexpresiones)</option>
                    <option value="retraso_cognitivo">🟡 Retraso Cognitivo (Latencia &gt; 3.5s)</option>
                  </select>
                </div>
              </div>

              {/* Botón de Acción Principal de Disparo */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {enVentanaActiva ? 'Ventana en curso...' : 'Listo para emitir estímulo'}
                </span>

                <div className="flex items-center gap-2">
                  {enVentanaActiva ? (
                    <Boton
                      variante="peligro"
                      tamano="md"
                      onClick={finalizarVentanaBiometrica}
                      className="text-xs gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-4 h-4" />
                      <span>Cerrar Ventana y Capturar</span>
                    </Boton>
                  ) : (
                    <Boton
                      variante="primario"
                      tamano="md"
                      disabled={disparando || cargandoPreguntas}
                      onClick={lanzarPregunta}
                      className="text-xs gap-2 cursor-pointer shadow-sm"
                    >
                      {disparando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Lanzando a Terminal...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Lanzar Pregunta a Terminal</span>
                        </>
                      )}
                    </Boton>
                  )}
                </div>
              </div>
            </div>
          </Tarjeta>

          {/* Historial Reciente de Preguntas Disparadas */}
          <Tarjeta
            titulo="Respuestas Registradas en Esta Sesión"
            subtitulo="Telemetría fisiológica almacenada en PostgreSQL tras cada ventana"
          >
            {cargandoReacciones ? (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#0B1020]" />
                <span>Consultando reacciones en PostgreSQL...</span>
              </div>
            ) : reacciones.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                <p>No se han emitido preguntas de control en esta sesión todavía.</p>
                <p className="text-[11px] text-slate-400">
                  Lance una pregunta con el panel superior para medir la respuesta fisiológica en tiempo real.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {reacciones.map((reac) => {
                  const esAnomala = reac.cognitiveStressScore > 0.6 || reac.facialTensionDelta > 0.45;
                  return (
                    <div
                      key={reac.id}
                      className={`p-3.5 rounded-2xl border transition-all text-xs ${
                        esAnomala
                          ? 'bg-rose-50/70 border-rose-200'
                          : 'bg-slate-50/80 border-slate-200/80 hover:bg-slate-100/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">
                              {reac.question?.questionText || 'Pregunta de Control'}
                            </span>
                            <Insignia
                              variante={esAnomala ? 'peligro' : 'exito'}
                              className="text-[10px] py-0 px-2"
                            >
                              {esAnomala ? 'Anomalía Biometría' : 'Respuesta Coherente'}
                            </Insignia>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                            <span>Latencia: <strong>{reac.reactionLatencyMs}ms</strong></span>
                            <span>Tensión: <strong>{Math.round(reac.facialTensionDelta * 100)}%</strong></span>
                            <span>Estrés: <strong>{Math.round(reac.cognitiveStressScore * 100)}%</strong></span>
                            <span>Incongruencia: <strong>{Math.round(reac.smileIncongruityScore * 100)}%</strong></span>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                          {new Date(reac.stimulusTimestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Tarjeta>
        </div>

        {/* Columna Derecha: Monitor Biométrico en Tiempo Real (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Indicador de la Ventana Activa (Countdown) */}
          <div
            className={`p-6 rounded-3xl border transition-all ${
              enVentanaActiva
                ? 'bg-gradient-to-br from-indigo-950 via-slate-900 to-[#0B1020] text-white border-indigo-500 shadow-lg'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Timer className={`w-5 h-5 ${enVentanaActiva ? 'text-[#C6F432] animate-pulse' : 'text-slate-400'}`} />
                <span className="text-xs font-bold uppercase tracking-wider font-mono">
                  {enVentanaActiva ? 'Ventana Biometría Abierta' : 'Ventana Inactiva'}
                </span>
              </div>
              {enVentanaActiva && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white font-mono animate-ping">
                  LIVE REC
                </span>
              )}
            </div>

            <div className="text-center py-4">
              <span className="text-[11px] text-slate-400 font-mono uppercase block mb-1">
                Cuenta Regresiva Focalizada
              </span>
              <span
                className={`text-5xl font-black font-mono tracking-tight ${
                  enVentanaActiva ? 'text-[#C6F432]' : 'text-slate-500'
                }`}
              >
                00:{segundosRestantes < 10 ? `0${segundosRestantes}` : segundosRestantes}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                {enVentanaActiva
                  ? 'Analizando microexpresiones faciales y desvíos de latencia...'
                  : 'Listo para abrir ventana con el botón de disparo.'}
              </p>
            </div>

            {/* Barra de progreso de la ventana */}
            {enVentanaActiva && (
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-[#C6F432] h-full transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(segundosRestantes / duracionVentana) * 100}%` }}
                />
              </div>
            )}
          </div>

          {/* Tarjeta de Telemetría Biometría Inmediata (Radar / Barras) */}
          <Tarjeta
            titulo="Métricas Biométricas de la Respuesta"
            subtitulo="Desglose de los 5 factores fisiológicos procesados"
          >
            {ultimaReaccion ? (
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Dictamen del Algoritmo
                    </span>
                    <Insignia
                      variante={
                        ultimaReaccion.cognitiveStressScore > 0.6 ||
                        ultimaReaccion.facialTensionDelta > 0.45
                          ? 'peligro'
                          : 'exito'
                      }
                    >
                      {ultimaReaccion.cognitiveStressScore > 0.6 ||
                      ultimaReaccion.facialTensionDelta > 0.45
                        ? 'Respuesta Anómala Detectada'
                        : 'Comportamiento Esperado'}
                    </Insignia>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Estímulo: "{ultimaReaccion.question?.questionText || 'Pregunta de entrevista'}"
                  </p>
                </div>

                {/* Barras Métricas */}
                <div className="space-y-3 text-xs">
                  {/* Latencia */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        <span>Latencia de Respuesta:</span>
                      </span>
                      <span className="font-mono">{ultimaReaccion.reactionLatencyMs} ms</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, (ultimaReaccion.reactionLatencyMs / 4000) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      Umbral de sospecha: &gt; 2500ms
                    </span>
                  </div>

                  {/* Tensión Facial */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span>Variación de Tensión Facial:</span>
                      </span>
                      <span className="font-mono">{Math.round(ultimaReaccion.facialTensionDelta * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ultimaReaccion.facialTensionDelta > 0.45 ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${ultimaReaccion.facialTensionDelta * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Estrés Cognitivo */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-purple-600" />
                        <span>Estrés Cognitivo Bajo Presión:</span>
                      </span>
                      <span className="font-mono">{Math.round(ultimaReaccion.cognitiveStressScore * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ultimaReaccion.cognitiveStressScore > 0.6 ? 'bg-rose-600' : 'bg-purple-600'
                        }`}
                        style={{ width: `${ultimaReaccion.cognitiveStressScore * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Incongruencia de Sonrisa */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Incongruencia Gestual:</span>
                      </span>
                      <span className="font-mono">{Math.round(ultimaReaccion.smileIncongruityScore * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${ultimaReaccion.smileIncongruityScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                <Brain className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Sin mediciones activas.</p>
                <p className="text-[11px] text-slate-400">
                  Al completar una ventana de pregunta, las 5 dimensiones fisiológicas se reflejarán aquí.
                </p>
              </div>
            )}
          </Tarjeta>
        </div>
      </div>

      {/* Modal para Agregar Pregunta Institucional */}
      {modalNuevaPregunta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 animate-scale-in space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-slate-900 font-['Bricolage_Grotesque']">
                Nueva Pregunta Institucional
              </h4>
              <button
                type="button"
                onClick={() => setModalNuevaPregunta(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Esta pregunta quedará guardada en PostgreSQL para ser utilizada en cualquier sesión de
              supervisión de esta evaluación.
            </p>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Texto de la Pregunta:
              </label>
              <textarea
                rows={3}
                value={nuevaPreguntaTexto}
                onChange={(e) => setNuevaPreguntaTexto(e.target.value)}
                placeholder="Ej: ¿Cuáles son las tres directivas principales de seguridad aplicadas en su proyecto?"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1020]/20 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Boton
                variante="borde"
                tamano="sm"
                onClick={() => setModalNuevaPregunta(false)}
                className="text-xs cursor-pointer"
              >
                Cancelar
              </Boton>
              <Boton
                variante="primario"
                tamano="sm"
                disabled={guardandoNueva || !nuevaPreguntaTexto.trim()}
                onClick={guardarNuevaPregunta}
                className="text-xs cursor-pointer"
              >
                {guardandoNueva ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Guardando...</span>
                  </span>
                ) : (
                  <span>Guardar en PostgreSQL</span>
                )}
              </Boton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
