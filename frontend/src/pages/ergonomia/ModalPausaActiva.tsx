import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, X } from 'lucide-react';
import { Boton } from '../../components/comun/Boton.js';

interface ModalPausaActivaProps {
  abierto: boolean;
  alCerrar: () => void;
  alCompletar: () => void;
}

const ejercicios = [
  {
    titulo: 'Estiramiento Cervical Lateral',
    instruccion: 'Inclina suavemente la cabeza hacia el hombro derecho durante 10 segundos, luego al izquierdo.',
    duracion: 10,
    zona: 'Cuello (C1-C7)',
  },
  {
    titulo: 'Rotación de Hombros y Escápulas',
    instruccion: 'Haz círculos lentos con los hombros hacia atrás para liberar tensión del trapecio.',
    duracion: 10,
    zona: 'Hombros y Espalda Alta',
  },
  {
    titulo: 'Regla 20-20-20 (Relajación Ocular)',
    instruccion: 'Mira un objeto distante a 6 metros (fuera de la pantalla) y parpadea lentamente.',
    duracion: 10,
    zona: 'Ojos y Foco',
  },
];

export const ModalPausaActiva: React.FC<ModalPausaActivaProps> = ({
  abierto,
  alCerrar,
  alCompletar,
}) => {
  const [segundosRestantes, setSegundosRestantes] = useState(30);
  const [estaCorriendo, setEstaCorriendo] = useState(true);
  const [ejercicioActual, setEjercicioActual] = useState(0);

  useEffect(() => {
    if (!abierto) {
      setSegundosRestantes(30);
      setEstaCorriendo(true);
      setEjercicioActual(0);
      return;
    }

    if (!estaCorriendo) return;

    const timer = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          alCompletar();
          return 0;
        }
        // Cambiar de ejercicio cada 10 segundos
        if (prev === 21) setEjercicioActual(1);
        if (prev === 11) setEjercicioActual(2);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [abierto, estaCorriendo, alCompletar]);

  if (!abierto) return null;

  const progreso = ((30 - segundosRestantes) / 30) * 100;
  const ejercicio = ejercicios[ejercicioActual];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#C6F432] text-[#0B1020] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-['Bricolage_Grotesque']">
                Pausa Activa Ergonómica RULA
              </h3>
              <p className="text-[11px] text-slate-500">Recuperación muscular rápida de 30 segundos</p>
            </div>
          </div>
          <button
            type="button"
            onClick={alCerrar}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Cronómetro Circular / Barra */}
        <div className="my-6 text-center">
          <div className="text-4xl font-black font-mono text-[#0B1020] tracking-tight">
            00:{segundosRestantes < 10 ? `0${segundosRestantes}` : segundosRestantes}
          </div>
          <p className="text-xs text-slate-500 mt-1">Tiempo restante de pausa</p>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-[#C6F432] h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progreso}%` }}
            />
          </div>
        </div>

        {/* Ejercicio Actual Guiado */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-semibold">
            <span className="text-slate-500 uppercase tracking-wider">
              Ejercicio {ejercicioActual + 1} de 3
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#0B1020] text-[#C6F432] font-mono text-[10px]">
              {ejercicio.zona}
            </span>
          </div>

          <h4 className="font-bold text-slate-900 text-sm">{ejercicio.titulo}</h4>
          <p className="text-xs text-slate-600 leading-relaxed">{ejercicio.instruccion}</p>
        </div>

        {/* Botones de control */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setEstaCorriendo(!estaCorriendo)}
            className="py-2 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {estaCorriendo ? 'Pausar' : 'Reanudar'}
          </button>

          <Boton
            variante="primario"
            tamano="sm"
            onClick={alCompletar}
            className="flex-1 text-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completar Ahora</span>
          </Boton>
        </div>
      </div>
    </div>
  );
};
