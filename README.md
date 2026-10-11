# visitask — ErgoCheck AI (SST & Proctoring)

Plataforma integral de **Seguridad y Salud en el Trabajo (SST)** con telemetría postural asistida por Inteligencia Artificial y supervisión de exámenes (Proctoring), con arquitectura multiempresa y Control de Acceso Basado en Roles (RBAC).

---

## 🚀 Estructura del Proyecto

```text
ProyectoG/
├── backend/          # API REST en NestJS + Prisma + PostgreSQL (RBAC, Auth, Orgs, SST)
├── frontend/         # SPA en React 19 + TypeScript + Vite + TailwindCSS
├── .agents/skills/   # Estándares de desarrollo (Nomenclatura en español, UI visitask)
└── README.md
```

---

## 🛠️ Tecnologías

- **Backend:** Node.js, NestJS, TypeScript, Prisma ORM, PostgreSQL (Supabase), JWT, Bcrypt.
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios.
- **Estándar:** Nomenclatura 100% en español para componentes, hooks, servicios y modelos de datos.

---

## 🔑 Credenciales de Acceso (RBAC)

El sistema cuenta con 6 roles configurados con la contraseña unificada `12345`:

| Rol | Correo | Contraseña | Organización |
| :--- | :--- | :--- | :--- |
| **`SUPER_ADMINISTRADOR`** | `manuela@gmail.com` | `12345` | Visitask Global Enterprise (Acceso Total) |
| **`ADMIN_ORGANIZACION`** | `carlos.mendoza@visitask.com` | `12345` | Visitask Global Enterprise |
| **`SUPERVISOR`** | `jairo.camacho@visitask.com` | `12345` | Tecnología Andina S.A. |
| **`EVALUADOR`** | `marco.lopez@visitask.com` | `12345` | Facultad de Ingeniería UAGRM |
| **`EMPLEADO`** | `juan.matienzo@visitask.com` | `12345` | Visitask Global Enterprise |
| **`POSTULANTE`** | `candidato.demo@gmail.com` | `12345` | Facultad de Ingeniería UAGRM |

---

## ⚡ Ejecución Local

### 1. Backend
```bash
cd backend
npm install
npm run build
node dist/main.js
# Servidor disponible en http://localhost:3000/api
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
# Interfaz disponible en http://localhost:5173
```
