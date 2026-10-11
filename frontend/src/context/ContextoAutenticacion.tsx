import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario, EstadoAutenticacion } from '../types/usuario.tipos.js';

export interface TipoContextoAutenticacion extends EstadoAutenticacion {
  iniciarSesion: (token: string, usuario: Usuario) => void;
  cerrarSesion: () => void;
  actualizarUsuarioLocal: (datos: Partial<Usuario>) => void;

  // Compatibilidad inglés
  login: (token: string, user: Usuario) => void;
  logout: () => void;
  updateUser: (data: Partial<Usuario>) => void;
}

const ContextoAutenticacion = createContext<TipoContextoAutenticacion | undefined>(undefined);

export const ProveedorAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [estaCargando, setEstaCargando] = useState<boolean>(true);

  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('user') || localStorage.getItem('usuario');

    if (tokenGuardado && usuarioGuardado) {
      try {
        setToken(tokenGuardado);
        setUsuario(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('usuario');
      }
    }
    setEstaCargando(false);
  }, []);

  const iniciarSesion = (nuevoToken: string, nuevoUsuario: Usuario) => {
    localStorage.setItem('token', nuevoToken);
    localStorage.setItem('user', JSON.stringify(nuevoUsuario));
    localStorage.setItem('usuario', JSON.stringify(nuevoUsuario));
    setToken(nuevoToken);
    setUsuario(nuevoUsuario);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
  };

  const actualizarUsuarioLocal = (datos: Partial<Usuario>) => {
    setUsuario((prev) => {
      if (!prev) return null;
      const actualizado = { ...prev, ...datos };
      localStorage.setItem('user', JSON.stringify(actualizado));
      localStorage.setItem('usuario', JSON.stringify(actualizado));
      return actualizado;
    });
  };

  return (
    <ContextoAutenticacion.Provider
      value={{
        usuario,
        token,
        estaAutenticado: !!token && !!usuario,
        estaCargando,
        iniciarSesion,
        cerrarSesion,
        actualizarUsuarioLocal,

        // Compatibilidad
        user: usuario,
        isAuthenticated: !!token && !!usuario,
        isLoading: estaCargando,
        login: iniciarSesion,
        logout: cerrarSesion,
        updateUser: actualizarUsuarioLocal,
      }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
};

export const useAutenticacion = () => {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error('useAutenticacion debe usarse dentro de ProveedorAutenticacion');
  }
  return contexto;
};

// Alias de compatibilidad
export const AuthProvider = ProveedorAutenticacion;
export const useAuth = useAutenticacion;
export const AuthContext = ContextoAutenticacion;
