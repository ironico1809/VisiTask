import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorAutenticacion } from './context/ContextoAutenticacion.js';
import { RutaProtegida } from './components/comun/RutaProtegida.js';
import { RutaPublica } from './components/comun/RutaPublica.js';
import { PlantillaPanel } from './components/diseno/PlantillaPanel.js';

// Páginas de la Aplicación en Español
import { PaginaInicioSesion } from './pages/autenticacion/PaginaInicioSesion.js';
import { PaginaPanelPrincipal } from './pages/panel/PaginaPanelPrincipal.js';
import { PaginaMonitorPostura } from './pages/ergonomia/PaginaMonitorPostura.js';
import { PaginaSupervisionExamen } from './pages/supervision/PaginaSupervisionExamen.js';
import { PaginaReportes } from './pages/reportes/PaginaReportes.js';
import { PaginaConfiguracion } from './pages/configuracion/PaginaConfiguracion.js';
import { PaginaPerfil } from './pages/perfil/PaginaPerfil.js';
import { PaginaOrganizaciones } from './pages/organizaciones/PaginaOrganizaciones.js';
import { PaginaUsuarios } from './pages/usuarios/PaginaUsuarios.js';

export function App() {
  return (
    <ProveedorAutenticacion>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública: Acceso e Inicio de Sesión */}
          <Route element={<RutaPublica />}>
            <Route path="/login" element={<PaginaInicioSesion />} />
            <Route path="/iniciar-sesion" element={<PaginaInicioSesion />} />
          </Route>

          {/* Rutas Protegidas: Panel con Barra Lateral y Plantilla Unificada */}
          <Route element={<RutaProtegida />}>
            <Route element={<PlantillaPanel />}>
              <Route path="/dashboard" element={<PaginaPanelPrincipal />} />
              <Route path="/panel" element={<PaginaPanelPrincipal />} />
              <Route path="/organizaciones" element={<PaginaOrganizaciones />} />
              <Route path="/organizations" element={<PaginaOrganizaciones />} />
              <Route path="/usuarios" element={<PaginaUsuarios />} />
              <Route path="/users" element={<PaginaUsuarios />} />
              <Route path="/perfil" element={<PaginaPerfil />} />
              <Route path="/profile" element={<PaginaPerfil />} />
              <Route path="/ergonomics" element={<PaginaMonitorPostura />} />
              <Route path="/ergonomia" element={<PaginaMonitorPostura />} />
              <Route path="/proctoring" element={<PaginaSupervisionExamen />} />
              <Route path="/supervision" element={<PaginaSupervisionExamen />} />
              <Route path="/reports" element={<PaginaReportes />} />
              <Route path="/reportes" element={<PaginaReportes />} />
              <Route path="/settings" element={<PaginaConfiguracion />} />
              <Route path="/configuracion" element={<PaginaConfiguracion />} />

              {/* Redirección de compatibilidad para consent */}
              <Route path="/consent" element={<Navigate to="/ergonomia" replace />} />
              <Route path="/consentimiento" element={<Navigate to="/ergonomia" replace />} />
            </Route>
          </Route>

          {/* Rutas de Redirección Automática */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAutenticacion>
  );
}

export default App;
