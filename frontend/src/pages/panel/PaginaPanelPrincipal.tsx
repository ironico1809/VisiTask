import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertTriangle, ShieldCheck, HeartPulse, Search, ArrowRight, Sparkles } from 'lucide-react';
import { Tarjeta } from '../../components/comun/Tarjeta.js';
import { Insignia } from '../../components/comun/Insignia.js';
import { Boton } from '../../components/comun/Boton.js';

export interface RegistroColaborador {
  id: string;
  nombre: string;
  departamento: string;
  edad: number;
  puntajePostural: 'Alto' | 'Medio' | 'Bajo';
  fotoUrl: string;
  rula: number;
}

const colaboradoresSimulados: RegistroColaborador[] = [
  {
    id: 'emp-1',
    nombre: 'Jairo Camacho',
    departamento: 'Desarrollo de Software',
    edad: 22,
    puntajePostural: 'Alto',
    fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
    rula: 6,
  },
  {
    id: 'emp-2',
    nombre: 'Marco López',
    departamento: 'Sistemas e Infraestructura',
    edad: 23,
    puntajePostural: 'Alto',
    fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
    rula: 5,
  },
  {
    id: 'emp-3',
    nombre: 'Juan Manuel Matienzo',
    departamento: 'Analítica de Datos',
    edad: 23,
    puntajePostural: 'Medio',
    fotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
    rula: 4,
  },
  {
    id: 'emp-4',
    nombre: 'Jerson Moreno',
    departamento: 'Desarrollo Frontend',
    edad: 33,
    puntajePostural: 'Medio',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
    rula: 4,
  },
  {
    id: 'emp-5',
    nombre: 'Isaac Orellana',
    departamento: 'Inteligencia Artificial',
    edad: 38,
    puntajePostural: 'Medio',
    fotoUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces',
    rula: 3,
  },
  {
    id: 'emp-6',
    nombre: 'Jhonny Ojeda',
    departamento: 'Calidad y Pruebas',
    edad: 24,
    puntajePostural: 'Bajo',
    fotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
    rula: 2,
  },
];

export const PaginaPanelPrincipal: React.FC = () => {
  const navegar = useNavigate();
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const colaboradoresFiltrados = colaboradoresSimulados.filter(
    (colab) =>
      colab.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      colab.departamento.toLowerCase().includes(terminoBusqueda.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Tarjetas KPI de Cabecera con Colores de Marca */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Tarjeta className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#0B1020] text-[#C6F432] flex items-center justify-center flex-shrink-0 shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Puestos Monitoreados</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">26 Activos</h3>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">En Riesgo Postural</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-0.5">2 Críticos</h3>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C6F432]/25 text-[#1b3604] border border-[#C6F432]/50 flex items-center justify-center flex-shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Índice Bienestar SST</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-0.5">88.4 / 100</h3>
          </div>
        </Tarjeta>

        <Tarjeta className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Índice Integridad Prom.</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-0.5">94.1%</h3>
          </div>
        </Tarjeta>
      </div>

      {/* Cuadrícula Principal: Tabla de Colaboradores + Mapa de Calor de Fatiga */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Izquierda: Lista de Colaboradores (2 cols) */}
        <div className="lg:col-span-2">
          <Tarjeta
            titulo="Estado Postural por Puesto de Trabajo"
            subtitulo="Monitoreo biométrico de articulaciones y postura RULA en tiempo real"
            accion={
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar colaborador..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6F432]/60 focus:border-[#0B1020] transition-all"
                />
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="pb-3">Colaborador</th>
                    <th className="pb-3">Departamento</th>
                    <th className="pb-3 text-center">Edad</th>
                    <th className="pb-3 text-center">Puntaje Postural</th>
                    <th className="pb-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {colaboradoresFiltrados.map((colab) => (
                    <tr key={colab.id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 flex items-center gap-3">
                        <img
                          src={colab.fotoUrl}
                          alt={colab.nombre}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{colab.nombre}</p>
                          <p className="text-[10px] text-slate-400">RULA Actual: {colab.rula}/7</p>
                        </div>
                      </td>
                      <td className="py-3 text-xs text-slate-600">{colab.departamento}</td>
                      <td className="py-3 text-xs text-slate-600 text-center">{colab.edad}</td>
                      <td className="py-3 text-center">
                        <Insignia
                          variante={
                            colab.puntajePostural === 'Alto'
                              ? 'peligro'
                              : colab.puntajePostural === 'Medio'
                              ? 'advertencia'
                              : 'exito'
                          }
                        >
                          {colab.puntajePostural}
                        </Insignia>
                      </td>
                      <td className="py-3 text-right">
                        <Boton
                          size="sm"
                          variant="outline"
                          onClick={() => navegar('/ergonomia')}
                          className="text-xs gap-1"
                        >
                          <span>Ver Detalle</span>
                          <ArrowRight className="w-3 h-3" />
                        </Boton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Tarjeta>
        </div>

        {/* Derecha: Mapa de Calor de Fatiga */}
        <div>
          <Tarjeta
            titulo="Mapa de Calor de Fatiga"
            subtitulo="Distribución acumulada de sobrecarga articular por franjas horarias"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
                {Array.from({ length: 42 }).map((_, idx) => {
                  const nivelesFatiga = [
                    'bg-amber-100',
                    'bg-amber-200',
                    'bg-orange-300',
                    'bg-rose-400',
                    'bg-rose-600',
                    'bg-purple-700',
                  ];
                  const nivel = nivelesFatiga[idx % nivelesFatiga.length];
                  return (
                    <div
                      key={idx}
                      className={`h-6 rounded-md ${nivel} transition-transform hover:scale-110 cursor-pointer shadow-xs`}
                      title={`Franja ${idx + 1}: Intensidad ${((idx % 6) + 1) * 15}%`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-200 inline-block" />
                  <span>Baja fatiga</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-purple-700 inline-block" />
                  <span>Sobrecarga crítica</span>
                </div>
              </div>

              <div className="p-3.5 bg-[#0B1020] text-slate-200 rounded-xl text-xs border border-slate-800/80 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C6F432]" />
                  <p className="font-bold text-[#C6F432] text-xs">Recomendación Ergonómica SST</p>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11.5px]">
                  Mayor concentración de fatiga muscular detectada entre las 15:00 y 17:00 hrs. Se
                  sugiere programar pausas activas automáticas a las 15:30.
                </p>
              </div>
            </div>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
};

export const DashboardPage = PaginaPanelPrincipal;
