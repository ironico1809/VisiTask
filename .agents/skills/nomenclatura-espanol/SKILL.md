---
name: nomenclatura-espanol
description: Estándar y convenciones de nomenclatura en español para todo el proyecto ErgoCheck AI / visitask (archivos .tsx, .css, .ts, componentes React, variables, hooks, modelos de base de datos Prisma y tablas PostgreSQL).
---

# Estándar de Nomenclatura en Español (visitask / ErgoCheck AI)

Este documento define la regla de desarrollo obligatoria para el proyecto: **Todo el código fuente, diseño de base de datos, componentes y estilos deben estar escritos en español** para facilitar la comprensión, mantenimiento y coherencia del equipo de trabajo.

## 1. Nombres de Archivos y Componentes React (.tsx)

Los componentes y sus archivos correspondientes deben nombrarse en español en PascalCase:

| Anterior (Inglés) | Nuevo Estándar (Español) | Descripción |
|---|---|---|
| `LoginPage.tsx` | `PaginaInicioSesion.tsx` | Vista de inicio de sesión |
| `DashboardPage.tsx` | `PaginaPanelPrincipal.tsx` | Vista principal del dashboard |
| `PostureMonitorPage.tsx` | `PaginaMonitorPostura.tsx` | Monitoreo ergonómico en tiempo real |
| `ExamSessionPage.tsx` | `PaginaSupervisionExamen.tsx` | Supervisión técnica y proctoring |
| `ConsentPage.tsx` | `PaginaConsentimiento.tsx` | Consentimiento informado digital |
| `ReportsPage.tsx` | `PaginaReportes.tsx` | Reportes y expedientes SST |
| `SettingsPage.tsx` | `PaginaConfiguracion.tsx` | Configuración del sistema y planes |
| `Button.tsx` | `Boton.tsx` | Componente reutilizable de botón |
| `Card.tsx` | `Tarjeta.tsx` | Contenedor de tarjeta |
| `Badge.tsx` | `Insignia.tsx` | Insignia o píldora de estado |
| `Input.tsx` | `CampoTexto.tsx` | Campo de formulario |
| `Sidebar.tsx` | `BarraLateral.tsx` | Menú lateral de navegación |
| `Header.tsx` | `Cabecera.tsx` | Barra superior de la aplicación |
| `DashboardLayout.tsx` | `PlantillaPanel.tsx` | Layout contenedor del dashboard |
| `ProtectedRoute.tsx` | `RutaProtegida.tsx` | Guardián de rutas autenticadas |
| `PublicRoute.tsx` | `RutaPublica.tsx` | Guardián de rutas públicas |

## 2. Tipos, Contextos y Hooks (.ts)

- `usuario.tipos.ts` (en vez de `user.types.ts`):
  - `Usuario` (`id`, `correo`, `nombre`, `apellido`, `fotoUrl`, `rol`, `organizacionId`, `nombreOrganizacion`, `departamentoId`)
  - `Rol`: `'SUPER_ADMINISTRADOR' | 'ADMIN_ORGANIZACION' | 'SUPERVISOR' | 'EVALUADOR' | 'EMPLEADO' | 'POSTULANTE'`
  - `EstadoAutenticacion`
- `ContextoAutenticacion.tsx` / `useAutenticacion.ts`
- `useTituloPagina.ts`
- `useTelemetria.ts`

## 3. Base de Datos y Modelos Prisma

Las tablas y modelos deben usar nomenclatura en español:

- **Tabla `usuarios` (Modelo `Usuario`):**
  - `id`: UUID
  - `correo`: String único
  - `claveHash`: String (hash de contraseña)
  - `nombre`: String
  - `apellido`: String
  - `fotoUrl`: String opcional
  - `activo`: Boolean
  - `creadoEn`: DateTime
  - `actualizadoEn`: DateTime

- **Tabla `organizaciones` (Modelo `Organizacion`):**
  - `id`, `nombre`, `identificacionFiscal`, `slug`, `logoUrl`, `activo`, `creadoEn`, `actualizadoEn`.

- **Tabla `usuarios_organizaciones` (Modelo `UsuarioOrganizacion`):**
  - `id`, `usuarioId`, `organizacionId`, `departamentoId`, `rol`, `fechaIngreso`.

- **Enum `Rol`:**
  - `SUPER_ADMINISTRADOR`, `ADMIN_ORGANIZACION`, `SUPERVISOR`, `EVALUADOR`, `EMPLEADO`, `POSTULANTE`.

## 4. Estilos y Clases CSS

En los archivos de estilos (ej. `index.css`), las clases semánticas deben usar nombres en español claros:
- `.anim-subida` / `.anim-entrada`
- `.campo-entrada`
- `.boton-principal`
- `.barra-ritmo`
- `.eje-columna`

Esta convención garantiza que cualquier desarrollador o auditor del proyecto comprenda de forma inmediata cada entidad sin ambigüedades.
