import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Building2,
  Users,
  User,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { cn } from '../../utils/cn.js';

export interface ElementoNavegacion {
  nombre: string;
  ruta: string;
  icono: React.ComponentType<{ className?: string }>;
  insignia?: string;
}

const elementosNavegacion: ElementoNavegacion[] = [
  { nombre: 'Panel Principal', ruta: '/dashboard', icono: LayoutDashboard },
  { nombre: 'Organizaciones', ruta: '/organizaciones', icono: Building2 },
  { nombre: 'Usuarios (RBAC)', ruta: '/usuarios', icono: Users },
  { nombre: 'Monitor Ergonómico', ruta: '/ergonomics', icono: Activity, insignia: 'En vivo' },
  { nombre: 'Supervisión Exámenes', ruta: '/proctoring', icono: ShieldAlert },
  { nombre: 'Mi Perfil', ruta: '/perfil', icono: User },
  { nombre: 'Reportes y SST', ruta: '/reports', icono: FileSpreadsheet },
  { nombre: 'Bitácora y Seguridad', ruta: '/auditoria', icono: ShieldCheck, insignia: 'Seguridad' },
  { nombre: 'Configuración y Planes', ruta: '/settings', icono: Settings },
];

export const BarraLateral: React.FC = () => {
  const { user, logout } = useAuth();

  const nombreCompleto = user
    ? `${user.nombre || user.firstName || ''} ${user.apellido || user.lastName || ''}`.trim()
    : 'Manuela Administradora';

  const inicial = (user?.nombre || user?.firstName || 'M')[0];
  const rol = user?.rol || user?.role || 'SUPER_ADMIN';
  const esSuperAdmin = rol === 'SUPER_ADMIN' || rol === 'SUPER_ADMINISTRADOR';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0 flex-shrink-0 select-none">
      
      {/* Encabezado con Logotipo de visitask */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-3">
        <svg width="28" height="28" viewBox="0 0 30 30" role="img" aria-label="Logotipo visitask">
          <circle cx="15" cy="15" r="15" fill="#0B1020" />
          <circle cx="15" cy="15" r="6" fill="none" stroke="#C6F432" strokeWidth="2.4" />
          <circle cx="15" cy="15" r="1.8" fill="#C6F432" />
        </svg>
        <div>
          <span className="font-extrabold text-slate-900 tracking-tight text-lg block leading-none font-['Bricolage_Grotesque']">
            visitask
          </span>
          <span className="text-[10px] font-mono uppercase font-semibold text-slate-500 tracking-wider">
            ErgoCheck SST
          </span>
        </div>
      </div>

      {/* Menú de Navegación Lateral en Español */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {elementosNavegacion.map((item) => {
          const Icono = item.icono;
          return (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group',
                  isActive
                    ? 'bg-[#0B1020] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icono className="w-4 h-4 flex-shrink-0" />
                <span>{item.nombre}</span>
              </div>
              {item.insignia && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#C6F432] text-[#0B1020]">
                  {item.insignia}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Tarjeta de Usuario y Cierre de Sesión */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between">
          <Link
            to="/perfil"
            title="Ver mi perfil institucional"
            className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
          >
            {user?.fotoUrl || user?.avatarUrl ? (
              <img
                src={user.fotoUrl || user.avatarUrl}
                alt={nombreCompleto}
                className="w-8 h-8 rounded-full object-cover border border-slate-300 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0B1020] text-[#C6F432] flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {inicial}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {nombreCompleto}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono font-medium text-slate-500 truncate">
                  {esSuperAdmin ? 'Superadmin' : rol}
                </span>
                {esSuperAdmin && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#C6F432] inline-block ring-1 ring-[#0B1020]/20"
                    title="Acceso Total al Sistema"
                  />
                )}
              </div>
            </div>
          </Link>
          
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </aside>
  );
};

export const Sidebar = BarraLateral;
