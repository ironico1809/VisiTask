import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Lock, Eye, Video, ArrowRight } from 'lucide-react';
import { Boton } from '../../components/comun/Boton.js';
import { Tarjeta } from '../../components/comun/Tarjeta.js';

export const PaginaConsentimiento: React.FC = () => {
  const navegar = useNavigate();
  const [aceptaCamara, setAceptaCamara] = useState(false);
  const [aceptaTelemetria, setAceptaTelemetria] = useState(false);
  const [estaEnviando, setEstaEnviando] = useState(false);

  const puedeContinuar = aceptaCamara && aceptaTelemetria;

  const confirmarConsentimiento = () => {
    if (!puedeContinuar) return;
    setEstaEnviando(true);

    setTimeout(() => {
      setEstaEnviando(false);
      navegar('/dashboard');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-6">
      <div className="max-w-2xl w-full">
        <Tarjeta className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Consentimiento Informado Digital Obligatorio
              </h2>
              <p className="text-xs text-slate-500">
                Requisito ético y normativo previo a la inicialización de sensores y visión artificial
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 leading-relaxed mb-6 space-y-2">
            <p className="font-semibold text-slate-900">
              Política de Privacidad y Procesamiento en Memoria RAM:
            </p>
            <p>
              1. <strong>Destrucción Inmediata de Fotogramas:</strong> La captura de video se procesa exclusivamente en la memoria RAM de su navegador mediante modelos MediaPipe. Ningún fotograma de video se almacena en disco ni se transmite a servidores remotos (ImageBitmap.close()).
            </p>
            <p>
              2. <strong>Telemetría Biométrica Sintética:</strong> Únicamente se transfieren vectores angulares numéricos (método RULA), vectores de atención visual y conteo de incidentes.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-start gap-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border-slate-200">
              <input
                type="checkbox"
                checked={aceptaCamara}
                onChange={(e) => setAceptaCamara(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0B1020] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-[#0B1020]" />
                  Autorizo el uso de la cámara web para inferencia ergonómica y postural local
                </span>
                <span className="text-slate-500 mt-0.5 block">
                  Acepto la calibración antropométrica y estimación de puntos articulares (RULA/REBA).
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border-slate-200">
              <input
                type="checkbox"
                checked={aceptaTelemetria}
                onChange={(e) => setAceptaTelemetria(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#0B1020] cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#0B1020]" />
                  Autorizo la telemetría de foco de ventana y atajos durante las sesiones
                </span>
                <span className="text-slate-500 mt-0.5 block">
                  Acepto el registro de eventos de navegación activa, cambios de pestaña y pérdidas de foco.
                </span>
              </div>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              Firma digital con IP y marca de tiempo inmutable
            </span>
            <Boton
              onClick={confirmarConsentimiento}
              disabled={!puedeContinuar}
              isLoading={estaEnviando}
              className="gap-2"
            >
              <span>Aceptar y Continuar</span>
              <ArrowRight className="w-4 h-4" />
            </Boton>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
};

export const ConsentPage = PaginaConsentimiento;
