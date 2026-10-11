import React, { useState } from 'react';
import { Shield, CheckCircle, CreditCard, Sparkles } from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Boton } from '../../components/comun/Boton.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { useTituloPagina } from '../../hooks/useTituloPagina.js';

export const PaginaConfiguracion: React.FC = () => {
  useTituloPagina('Configuración y Planes');

  const [sensibilidad, setSensibilidad] = useState(70);
  const [destruccionRamConfirmada, setDestruccionRamConfirmada] = useState(true);
  const [notificacionGuardado, setNotificacionGuardado] = useState(false);

  const guardarCambios = () => {
    setNotificacionGuardado(true);
    setTimeout(() => setNotificacionGuardado(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabecera */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Configuración del Sistema</h2>
          <p className="text-xs text-slate-500">Parámetros de inferencia biométrica local, privacidad y suscripción SaaS</p>
        </div>

        <Boton tamano="sm" variante="primario" onClick={guardarCambios} className="text-xs">
          Guardar Cambios
        </Boton>
      </div>

      {notificacionGuardado && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Configuración guardada exitosamente en el navegador local.</span>
        </div>
      )}

      {/* Plan SaaS Actual */}
      <Tarjeta titulo="Suscripción y Licencia Corporativa">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6F432] text-[#0B1020] flex items-center justify-center font-bold flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm tracking-tight font-['Bricolage_Grotesque']">Plan Enterprise SST</h4>
                <Insignia variante="marca" className="text-[10px] py-0 px-2 bg-[#C6F432] text-[#0B1020]">Activo</Insignia>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">26 puestos monitoreados • Inferencia ilimitada en RAM</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#C6F432]">$290 / mes</span>
            <Boton tamano="sm" variante="borde" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Gestionar Plan</span>
            </Boton>
          </div>
        </div>
      </Tarjeta>

      {/* Sensibilidad Ergonómica */}
      <Tarjeta titulo="Calibración del Motor de Pose (RULA)" subtitulo="Ajusta el umbral de detección de desvíos y alertas posturales">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-900 mb-1.5">
              <label htmlFor="sens">Sensibilidad de Inclinación Cervical</label>
              <span className="font-mono text-slate-900 font-bold">{sensibilidad}%</span>
            </div>
            <input
              id="sens"
              type="range"
              min="30"
              max="100"
              value={sensibilidad}
              onChange={(e) => setSensibilidad(Number(e.target.value))}
              className="w-full accent-[#0B1020] cursor-pointer"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Un umbral alto dispara advertencias tempranas a partir de los 10° de flexión cervical.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-slate-900">Destrucción forzosa de fotogramas en memoria (RAM)</p>
                <p className="text-[11px] text-slate-500">Garantiza que ningún frame de video quede en buffer o caché de disco.</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={destruccionRamConfirmada}
              onChange={(e) => setDestruccionRamConfirmada(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </div>
        </div>
      </Tarjeta>
    </div>
  );
};

export const SettingsPage = PaginaConfiguracion;
