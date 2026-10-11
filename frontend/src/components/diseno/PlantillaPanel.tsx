import React from 'react';
import { Outlet } from 'react-router-dom';
import { BarraLateral } from './BarraLateral.js';
import { Cabecera } from './Cabecera.js';

export const PlantillaPanel: React.FC = () => {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-['Geist',sans-serif]">
      {/* Barra Lateral Persistente en Español */}
      <BarraLateral />

      {/* Contenedor Principal */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Cabecera */}
        <Cabecera />

        {/* Contenido Dinámico de la Página con Scroll Interno Limpio */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const DashboardLayout = PlantillaPanel;
