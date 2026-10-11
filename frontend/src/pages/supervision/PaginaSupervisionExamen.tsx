import React, { useState, useEffect } from 'react';
import { ShieldAlert, Maximize2, ExternalLink, Clock, Eye } from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';

export const PaginaSupervisionExamen: React.FC = () => {
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);
  const [conteoDesviosFoco, setConteoDesviosFoco] = useState(0);
  const [alertasMiradaBaja] = useState(1);
  const [tiempoRestante] = useState('42:15');

  // Detector de visibilidad de pestaña (Page Visibility API)
  useEffect(() => {
    const alCambiarVisibilidad = () => {
      if (document.hidden) {
        setConteoDesviosFoco((prev) => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => document.removeEventListener('visibilitychange', alCambiarVisibilidad);
  }, []);

  const alternarPantallaCompleta = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setEsPantallaCompleta(true));
    } else {
      document.exitFullscreen().then(() => setEsPantallaCompleta(false));
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior: Modo Supervisado Activo */}
      <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0B1020] border border-slate-700 text-[#C6F432] flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Sesión Supervisada de Evaluación</h3>
            <p className="text-xs text-slate-400">
              Evaluación Técnica de Selección — Integración Agnóstica con Formulario Externo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Tiempo Restante: <strong>{tiempoRestante}</strong></span>
          </div>

          <Boton
            tamano="sm"
            variante="borde"
            className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs gap-1.5"
            onClick={alternarPantallaCompleta}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>{esPantallaCompleta ? 'Salir de Pantalla Completa' : 'Activar Pantalla Completa'}</span>
          </Boton>
        </div>
      </div>

      {/* Franja de Contadores de Telemetría */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tarjeta className="p-4 flex items-center justify-between border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Pérdidas de Foco (Blur/Alt+Tab)</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{conteoDesviosFoco} Eventos</h4>
          </div>
          <Insignia variante={conteoDesviosFoco > 0 ? 'advertencia' : 'exito'}>
            {conteoDesviosFoco > 0 ? 'Alerta Registrada' : 'Sin Desvíos'}
          </Insignia>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center justify-between border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Sospecha de Dispositivo Externo</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{alertasMiradaBaja} Incidente</h4>
          </div>
          <Insignia variante="peligro">Mirada Baja Detectada</Insignia>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center justify-between border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Bloqueo de Portapapeles</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">Activo</h4>
          </div>
          <Insignia variante="exito">Copiar/Pegar Bloqueado</Insignia>
        </Tarjeta>
      </div>

      {/* Sandbox Agnóstico de Examen Externo */}
      <Tarjeta
        titulo="Formulario de Evaluación de Terceros"
        subtitulo="Entorno de examen desplegado dentro del marco de supervisión con telemetría activa"
        className="p-0 overflow-hidden"
      >
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-600 font-mono">
            URL: https://docs.google.com/forms/d/e/exam-uagrm-2026/viewform
          </span>
          <Insignia variante="marca" className="gap-1">
            <Eye className="w-3 h-3" />
            <span>Telemetría de Navegación Conectada</span>
          </Insignia>
        </div>

        <div className="h-[500px] w-full bg-slate-100 flex flex-col items-center justify-center p-8 text-center border-t border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#0B1020] mb-4 border border-slate-200">
            <ExternalLink className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-900">Visor de Examen Externo Integrado</h4>
          <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
            Aquí se proyecta de forma transparente el formulario o examen de Google Forms / LMS
            mientras los detectores locales de desvío ocular y teclas prohibidas auditan en segundo plano.
          </p>
          <Boton tamano="sm" variante="primario" className="text-xs">
            Comenzar Llenado de Examen
          </Boton>
        </div>
      </Tarjeta>
    </div>
  );
};

export const ExamSessionPage = PaginaSupervisionExamen;
