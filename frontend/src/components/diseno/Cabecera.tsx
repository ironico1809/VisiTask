import React from 'react';
import { Bell, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { Insignia } from '../comun/Insignia.js';

export interface PropiedadesCabecera {
  titulo?: string;
  subtitulo?: string;
  title?: string;
  subtitle?: string;
}

export const Cabecera: React.FC<PropiedadesCabecera> = ({
  titulo,
  subtitulo,
  title,
  subtitle,
}) => {
  const { user } = useAuth();
  const tituloFinal = titulo || title || 'Panel de Control y SST';
  const subtituloFinal = subtitulo || subtitle;

  const nombreUsuario = user
    ? `${user.nombre || user.firstName || ''} ${user.apellido || user.lastName || ''}`.trim()
    : 'Manuela Administradora';

  const inicial = (user?.nombre || user?.firstName || 'M')[0];
  const organizacion = user?.nombreOrganizacion || user?.organizationName || 'Visitask Global Enterprise';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-10 flex-shrink-0">
      <div>
        <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
          {tituloFinal}
        </h1>
        {subtituloFinal && <p className="text-xs text-slate-500">{subtituloFinal}</p>}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Píldora de Telemetría Activa en RAM */}
        <Insignia variante="exito" className="gap-1.5 py-1 px-2.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Protección Activa en RAM</span>
          <span className="sm:hidden">RAM</span>
        </Insignia>

        {/* Campana de Notificaciones */}
        <button
          title="Notificaciones de postura"
          className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* Información del Usuario */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-none">
              {nombreUsuario}
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              {organizacion}
            </p>
          </div>
          {user?.fotoUrl || user?.avatarUrl ? (
            <img
              src={user.fotoUrl || user.avatarUrl}
              alt={nombreUsuario}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0B1020] text-[#C6F432] flex items-center justify-center font-bold text-xs uppercase">
              {inicial}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const Header = Cabecera;
