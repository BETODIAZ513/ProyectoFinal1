# 🏗️ Documento de Arquitectura y Diseño de Software (SDD)
# PetClinic Management System — Ayacucho, Perú

> **Generado:** 2026-07-14  
> **Fuente:** Consolidación de 25 specs de `openspec/specs/` + `architecture.md` + `contexto.md`  
> **Propósito:** Artefactos de la Fase de Diseño — SDD, UML, Diagramas, Arquitectura de Plataforma

---

## Tabla de Contenidos

1. [Visión General del Sistema y SDD](#1-sdd)
2. [Diagrama de Arquitectura de la Plataforma](#2-arquitectura)
3. [Diagramas de Clases UML](#3-clases-uml)
4. [Diagramas de Secuencia y Actividades UML](#4-secuencia-uml)
5. [Diagrama de Componentes y Despliegue](#5-componentes)
6. [Estructura y Modularidad del Frontend](#6-frontend)
7. [Estructura y Flujo de Datos del Backend](#7-backend)
8. [Prácticas SDD (Specification-Driven Development)](#8-sdd-practicas)
9. [Stack Tecnológico Estandarizado](#9-stack)
10. [Catálogo de Especificaciones OpenSpec](#10-specs)

---

## 1. Visión General del Sistema y SDD {#1-sdd}

### 1.1 Propósito del Documento

Este documento describe la arquitectura técnica y las decisiones de diseño del **PetClinic Management System**, una plataforma web de gestión para una clínica veterinaria ubicada en **Ayacucho, Perú**. El sistema está compuesto por dos aplicaciones frontend (Backoffice para personal clínico y Portal para propietarios) y un backend API unificado.

### 1.2 Alcance de la Plataforma

| Aplicación | Tecnología | Usuarios Objetivo | Puerto |
|------------|-----------|-------------------|--------|
| **PetClinic Backoffice** | React + TypeScript + Vite | Administrador, Veterinario, Auxiliar, Recepcionista | 5173 |
| **PetClinic Portal** | React + TypeScript + Vite (mobile-first) | Propietarios (clientes) | 5174 |
| **PetClinic API** | ASP.NET Core Web API (.NET 10) | Consumido por ambos frontends | 5210 |
| **SQL Server** | Microsoft SQL Server 2022 en Docker | Persistencia de datos | 1433 |

### 1.3 Principios de Diseño

| Principio | Implementación |
|-----------|---------------|
| **Separation of Concerns** | Clean Architecture con 4 capas: Domain, Application, Infrastructure, Api |
| **Dependency Inversion** | Domain es el núcleo; capas externas dependen de contratos internos |
| **CQRS** | Comandos (write) separados de Queries (read) via MediatR |
| **Fail-Fast Validation** | FluentValidation en capa Application antes de tocar persistencia |
| **Soft Delete** | Todas las entidades usan baja lógica (`Activo = false`) |
| **Passive Audit** | Shadow Properties automáticas: `CreatedBy`, `CreatedAt`, `UpdatedAt` |
| **Stateless API** | Autenticación JWT Bearer; API sin estado de sesión server-side |
| **SPA Desacoplada** | Frontend y Backend son proyectos independientes comunicados por HTTP/JSON |

---

## 2. Diagrama de Arquitectura de la Plataforma {#2-arquitectura}

### 2.1 Arquitectura Global (PetClinic Backoffice + Portal)

```
+=========================================================================+
|                     PLATAFORMA PETCLINIC — AYACUCHO                     |
|                                                                          |
|  +-------------------+        +-------------------+                     |
|  |  BACKOFFICE SPA   |        |   PORTAL SPA      |                     |
|  |  PetClinic.Web    |        |  PetClinic.Portal |                     |
|  |  React+TS+Vite    |        |  React+TS+Vite    |                     |
|  |  :5173 (Nginx)    |        |  :5174 (Nginx)    |                     |
|  +--------+----------+        +--------+----------+                     |
|           |  HTTP/JSON JWT              |  HTTP/JSON JWT                 |
|           +--------------+-------------+                                 |
|                          |                                               |
|              +-----------v-----------+                                   |
|              |   PETCLINIC API       |                                   |
|              |   PetClinic.Api       |                                   |
|              |   ASP.NET Core .NET10 |                                   |
|              |   :5210               |                                   |
|              |   [Controllers]       |                                   |
|              |   [JWT Auth]          |                                   |
|              |   [CORS Policy]       |                                   |
|              |   [Swagger/OpenAPI]   |                                   |
|              +----+----+----+--------+                                   |
|                   |    |    |                                            |
|         +---------+    |    +----------+                                 |
|         |              |               |                                 |
|  +------v------+ +-----v------+ +------v------+                         |
|  | Application | | Infra      | | Domain      |                         |
|  | MediatR     | | EF Core 10 | | Entidades   |                         |
|  | CQRS        | | SQL Server | | Enums       |                         |
|  | FluentVal.  | | Identity   | | Excepciones |                         |
|  +-------------+ | Shadow Pr. | +-------------+                         |
|                  +------+-----+                                          |
|                         |                                                |
|              +----------v-----------+                                    |
|              |   SQL SERVER 2022    |                                    |
|              |   Docker Container   |                                    |
|              |   :1433              |                                    |
|              |   Volume: mssql_data |                                    |
|              +----------------------+                                    |
+=========================================================================+
```

### 2.2 Diagrama de Arquitectura Limpia (Capas y Dependencias)

```
                    +-------------------------+
                    |     PetClinic.Domain    |
                    |  (Nucleo - Sin Deps)    |
                    |                         |
                    |  - Entidades            |
                    |  - Enums                |
                    |  - Excepciones          |
                    |  - Value Objects        |
                    +----------^--------------+
                               |
              +----------------+----------------+
              |                                 |
   +----------v-----------+      +--------------v-----------+
   | PetClinic.Application|      | PetClinic.Infrastructure |
   | (Casos de Uso)        |      | (Detalles Tecnologicos)  |
   |                       |      |                          |
   | - Commands/Queries    |      | - EF Core DbContext      |
   | - MediatR Handlers    |      | - SQL Server             |
   | - FluentValidation    |      | - Identity + JWT         |
   | - Interfaces (Repos)  |<-----| - Shadow Properties      |
   | - DTOs                |      | - Migraciones            |
   +-----------^-----------+      +-------------^------------+
               |                                |
               +----------------+---------------+
                                |
                   +------------v-------------+
                   |     PetClinic.Api        |
                   |  (Punto de Entrada)      |
                   |                          |
                   |  - HTTP Controllers      |
                   |  - DI Configuration      |
                   |  - Swagger               |
                   |  - CORS + Policies       |
                   +--^-----------------------+
                      |
          +-----------+-----------+
          |                       |
+---------v--------+   +----------v--------+
| PetClinic.Web    |   | PetClinic.Portal  |
| (Backoffice SPA) |   | (Client Portal)   |
|                  |   |                   |
| React + TS       |   | React + TS        |
| Vite + Nginx     |   | Vite + Nginx      |
| AuthContext      |   | Mobile-first      |
| RibbonMenu       |   | Day/Night theme   |
| RoleRoute        |   | Read-only views   |
+------------------+   +-------------------+
```

### 2.3 Regla de Dependencia (Dependency Rule)

```
[Domain] <-- [Application] <-- [Infrastructure] <-- [Api] <-- [Web/Portal]

PROHIBIDO:
  Domain     --> Application  [ERROR]
  Domain     --> Infrastructure [ERROR]
  Application--> Infrastructure [ERROR]
  Api        --> Domain (directo sin Application) [EVITAR]
```

---

## 3. Diagramas de Clases UML {#3-clases-uml}

### 3.1 Diagrama de Clases del Dominio (Entidades Principales)

```
+---------------------+       +---------------------+
|     Propietario     |       |     Veterinario      |
+---------------------+       +---------------------+
| - Id: int           |       | - Id: int            |
| - Nombre: string    |       | - Nombre: string     |
| - Apellido: string  |       | - Apellido: string   |
| - DNI: string       |       | - Especialidad: str  |
| - Telefono: string  |       | - ApplicationUserId  |
| - Email: string     |       |   : string           |
| - Direccion: string |       | - Activo: bool       |
| - Activo: bool      |       +----------+----------+
+--------+------------+                  |
         | 1                             | 1
         | N                             | N
+--------v------------+       +----------v----------+
|       Mascota        |       |        Cita          |
+---------------------+       +---------------------+
| - Id: int           |<------| - Id: int            |
| - Nombre: string    | N   1 | - MascotaId: int     |
| - Especie: string   |       | - VeterinarioId: int |
| - Raza: string      |       | - FechaHora: DateTime|
| - FechaNacimiento   |       | - Motivo: string     |
| - Sexo: string      |       | - Estado: string     |
| - Color: string     |       |   (Agendada /        |
| - Activo: bool      |       |    Completada /      |
| - PropietarioId: int|       |    Cancelada)        |
+--------+------------+       +----------+----------+
         | 1                             | 1
         |                               |
    +----v---------+           +---------v----------+
    | RegistroPeso |           |   DetalleConsulta   |
    +--------------+           +--------------------+
    | - Id: int    |           | - Id: int           |
    | - MascotaId  |           | - CitaId: int       |
    | - FechaRegist|           | - MascotaId: int    |
    | - PesoKg:dec |           | - VeterinarioId     |
    +--------------+           | - Diagnostico: str  |
    [Sin Auditoria]            | - Tratamiento: str  |
                               | - NotasAdicionales  |
                               +--------------------+

+--------------------+       +---------------------+
|   Hospitalizacion  |       |   TareaClinica       |
+--------------------+       +---------------------+
| - Id: int          |       | - Id: int            |
| - MascotaId: int   |       | - Titulo: string     |
| - NumeroJaula: int |       | - Descripcion: str   |
| - FechaIngreso     |       | - Estado: string     |
| - FechaAlta: dt?   |       |   (Pendiente /       |
| - Estado: string   |       |    En Progreso /     |
|   (Internado/Alta) |       |    Completada)       |
| - Motivo: string   |       | - MascotaId: int     |
+--------+-----------+       | - VeterinarioId: int |
         | 1                 | - CitaId: int?       |
         | N                 +---------------------+
+--------v-----------+
| MonitoreoClinico   |       +---------------------+
+--------------------+       |  TareaPredefinida    |
| - Id: int          |       +---------------------+
| - HospitalizId     |       | - Id: int            |
| - FechaRegistro    |       | - Nombre: string     |
| - Temperatura: dec |       | - Descripcion: str   |
| - FrecCardiaca:int |       +---------------------+
| - FrecRespira: int |       [Sin Auditoria]
| - RegistradoPor    |
+--------------------+
```

### 3.2 Diagrama de Identidad y Seguridad

```
+---------------------+       +---------------------+
|  ApplicationUser    |       |    Propietario       |
| (IdentityUser)      |       +---------------------+
+---------------------+       | - Id: int            |
| - Id: string        |<------| - ApplicationUserId? |
| - UserName: string  |  0..1 |   (para portal)      |
| - Email: string     |       +---------------------+
| - EmailConfirmed    |
| - PasswordHash      |       +---------------------+
+--------+------------+       |    Veterinario       |
         |                    +---------------------+
         |1                   | - Id: int            |
         |N                   | - ApplicationUserId  |
+--------v------------+<------+   : string (FK 1:1)  |
|    IdentityRole     |       +---------------------+
+---------------------+
| - Id: string        |
| - Name: string      |  Roles del sistema:
| (Administrador)     |  - Administrador
| (Veterinario)       |  - Veterinario
| (AuxiliarClinico)   |  - AuxiliarClinico
| (Recepcionista)     |  - Recepcionista
| (Propietario)       |  - Propietario
+---------------------+

JWT Claims emitidos:
  - sub (userId)
  - email
  - nombre
  - roles[]
  - PropietarioId (solo rol Propietario)
```

### 3.3 Diagrama de Shadow Properties (Auditoria Pasiva)

```
Entidades CON auditoria (via Shadow Properties):
+--------------------------------------------+
| Propietarios | Veterinarios | Mascotas      |
| Citas | DetallesConsultas                   |
| Hospitalizaciones | MonitoreosClinicos      |
| TareasClinicas                              |
+--------------------------------------------+
|  CreatedBy : string  (usuario autenticado) |
|  CreatedAt : DateTime (UTC, inmutable)     |
|  UpdatedAt : DateTime (UTC)                |
+--------------------------------------------+
         Interceptado en SaveChanges()
         via PetClinicDbContext.SaveChangesAsync()

Entidades EXCLUIDAS de auditoria:
+--------------------------------------------+
| RegistroPeso | TareasPredefinidas           |
+--------------------------------------------+
  Excluidas por regla REQ-SEG-03
```

---

## 4. Diagramas de Secuencia y Actividades UML {#4-secuencia-uml}

### 4.1 Secuencia: Login y Emisión de JWT

```
Usuario         React SPA         API Controller    Identity       JWT Service
   |                |                    |              |               |
   |--email+pass--->|                    |              |               |
   |                |---POST /auth/login->|              |               |
   |                |                    |--ValidateUser->|              |
   |                |                    |<--UserFound---|              |
   |                |                    |--GetRoles---->|              |
   |                |                    |<--Roles[]-----|              |
   |                |                    |--GenerateToken-------------->|
   |                |                    |<--JWT signed-----------------|
   |                |<---200 {token}-----|              |               |
   |<---Dashboard---|                    |              |               |
   |  (por rol)     |                    |              |               |
```

### 4.2 Secuencia: Agendar una Cita (Happy Path)

```
Recep/Admin       SPA              API            Application        Domain       DB
    |              |                |                  |               |           |
    |--Selecciona  |                |                  |               |           |
    | Mascota,     |                |                  |               |           |
    | Vet, Fecha-->|                |                  |               |           |
    |              |--POST /citas-->|                  |               |           |
    |              |                |--Send(Command)-->|               |           |
    |              |                |                  |--Validar----->|           |
    |              |                |                  |  Solapamiento |           |
    |              |                |                  |<--OK----------|           |
    |              |                |                  |--SaveChanges------------>|
    |              |                |                  |  Shadow Props auto        |
    |              |                |                  |<--201 Created------------|
    |              |                |<--201 {citaId}---|               |           |
    |              |<--Cita creada--|                  |               |           |
    |<--Confirmac. |                |                  |               |           |
```

### 4.3 Secuencia: Completar Consulta (Transacción Atómica)

```
Veterinario      SPA              API           Command Handler          DB
    |              |               |                   |                  |
    |--Diagnostico |               |                   |                  |
    | Tratamiento->|               |                   |                  |
    |              |--POST         |                   |                  |
    |              | /consultas--->|                   |                  |
    |              |               |--Send(Command)--->|                  |
    |              |               |                   |--BEGIN TRAN----->|
    |              |               |                   |--Insert          |
    |              |               |                   |  DetalleConsulta |
    |              |               |                   |--Update Cita     |
    |              |               |                   |  Estado=Completada
    |              |               |                   |--COMMIT--------->|
    |              |               |<--200 OK----------|                  |
    |              |<--Consulta    |                   |                  |
    |              |  completada---|                   |                  |
    |<--UI updated |               |                   |                  |
```

### 4.4 Secuencia: Hospitalizar Paciente

```
Veterinario      SPA              API           Command Handler    Validator    DB
    |              |               |                   |              |          |
    |--Mascota     |               |                   |              |          |
    | Jaula #12--->|               |                   |              |          |
    |              |--POST /hosp-->|                   |              |          |
    |              |               |--Send(Command)--->|              |          |
    |              |               |                   |--Validar Jaula--------->|
    |              |               |                   |  WHERE NumJaula=12      |
    |              |               |                   |  AND Estado='Internado' |
    |              |               |                   |<--Disponible------------|
    |              |               |                   |--Insert Hospit.-------->|
    |              |               |<--201 Created-----|              |          |
    |<--Internado  |<--Confirmac.--|                   |              |          |
```

### 4.5 Diagrama de Actividades: Flujo de Tarea Clínica (Kanban)

```
[INICIO]
    |
    v
[Veterinario crea TareaClinica]
    |  Estado = "Pendiente"
    v
[Tablero Kanban muestra tarjeta en columna PENDIENTE]
    |
    v
[Auxiliar ve tarea]
    |
    +--[Clic "Iniciar"]--+
    |                    v
    |       [Estado = "En Progreso"]
    |       [Tarjeta se mueve a columna EN PROGRESO]
    |                    |
    |                    v
    |       [Auxiliar ejecuta la tarea]
    |                    |
    |                    +--[Clic "Completar"]--+
    |                    |                     v
    |                    |       [Estado = "Completada"]
    |                    |       [Tarjeta se mueve a COMPLETADA]
    v                    v                     |
[Tablero Kanban actualizado en tiempo real]    |
                                              [FIN]
```

---

## 5. Diagrama de Componentes y Despliegue {#5-componentes}

### 5.1 Diagrama de Componentes del Sistema

```
+=========================================================================+
|                          INFRAESTRUCTURA DOCKER                          |
|                                                                          |
|  +------------------------+  +------------------------+                 |
|  |  Container: petclinic  |  |  Container: petclinic  |                 |
|  |  -web (Nginx)          |  |  -portal (Nginx)        |                |
|  |                        |  |                        |                 |
|  |  [index.html]          |  |  [index.html]          |                 |
|  |  [assets/]             |  |  [assets/]             |                 |
|  |  [nginx.conf]          |  |  [nginx.conf]          |                 |
|  |   -> fallback index.html|  |   -> fallback index.html|               |
|  |   Puerto: 5173         |  |   Puerto: 5174         |                 |
|  +------------------------+  +------------------------+                 |
|           |                           |                                 |
|           +-----------+  +------------+                                 |
|                       |  |                                              |
|           +-----------v--v-----------+                                  |
|           |  Container: petclinic-api |                                 |
|           |  Image: .NET 10 SDK       |                                 |
|           |                           |                                 |
|           |  [AuthController]         |                                 |
|           |  [PropietariosController] |                                 |
|           |  [VeterinariosController] |                                 |
|           |  [MascotasController]     |                                 |
|           |  [CitasController]        |                                 |
|           |  [HospitalizacionCtrl]    |                                 |
|           |  [TareasController]       |                                 |
|           |  [PortalController]       |                                 |
|           |  [HorariosController]     |                                 |
|           |                           |                                 |
|           |  Puerto: 5210             |                                 |
|           +-----------+---------------+                                  |
|                       |                                                  |
|           +-----------v---------------+                                  |
|           |  Container: petclinic-db  |                                 |
|           |  Image: mcr.microsoft.com |                                 |
|           |  /mssql/server:2022       |                                 |
|           |                           |                                 |
|           |  Puerto: 1433             |                                 |
|           |  Volume: mssql_data       |                                 |
|           +---------------------------+                                  |
|                                                                          |
|  Network: petclinic_network (bridge)                                    |
+=========================================================================+
```

### 5.2 Diagrama de Despliegue (Docker Compose)

```yaml
# docker-compose.yml — Estructura de Servicios
services:
  petclinic-db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    ports: ["1433:1433"]
    volumes: [mssql_data:/var/opt/mssql]
    healthcheck: [sqlcmd -Q "SELECT 1"]

  petclinic-api:
    build: src/PetClinic.Api  (Dockerfile multi-etapa)
    ports: ["5210:5210"]
    depends_on: [petclinic-db]
    environment:
      - ConnectionStrings__DefaultConnection
      - JwtSettings__SecretKey

  petclinic-web:
    build: src/PetClinic.Web  (Node build + Nginx)
    ports: ["5173:80"]
    depends_on: [petclinic-api]

  petclinic-portal:
    build: src/PetClinic.PortalWeb (Node build + Nginx)
    ports: ["5174:80"]
    depends_on: [petclinic-api]

volumes:
  mssql_data:  # Persistencia de datos clinicos
```

### 5.3 Estrategia de Contenedores (Multi-Stage Build)

```
# Etapa 1: Build (SDK completo)
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /out

# Etapa 2: Runtime (imagen ligera)
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet", "PetClinic.Api.dll"]

# Frontend: Node + Nginx
FROM node:20 AS build
RUN npm ci && npm run build

FROM nginx:alpine AS runtime
COPY --from=build dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## 6. Estructura y Modularidad del Frontend (Backoffice) {#6-frontend}

### 6.1 Estructura de Carpetas del Backoffice

```
src/PetClinic.Web/
├── public/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── RibbonMenu.tsx   # Menu superior condicional por rol
│   │   ├── ProtectedRoute.tsx  # Guardia de rutas autenticadas
│   │   ├── RoleRoute.tsx    # Guardia de rutas por rol
│   │   └── ...
│   ├── contexts/
│   │   └── AuthContext.tsx  # Estado global de autenticacion
│   ├── pages/               # Vistas principales
│   │   ├── Login.tsx
│   │   ├── Home.tsx         # Dashboard dinamico por rol
│   │   ├── Owners.tsx       # Gestion de propietarios
│   │   ├── Pets.tsx         # Gestion de mascotas
│   │   ├── Vets.tsx         # Gestion de veterinarios
│   │   ├── Appointments.tsx # Citas (Admin/Recepcion)
│   │   ├── Reception.tsx    # Sala de espera
│   │   ├── Consultations.tsx # Agenda del veterinario
│   │   ├── ClinicalHistory.tsx
│   │   ├── Hospitalization.tsx
│   │   ├── MedicalTasks.tsx  # Tablero Kanban
│   │   ├── Schedules.tsx     # Vista de horarios
│   │   └── History.tsx       # Log de citas archivadas
│   ├── services/             # Llamadas a la API
│   │   ├── api.ts           # Axios instance con interceptors JWT
│   │   ├── authService.ts
│   │   ├── petsService.ts
│   │   └── ...
│   ├── App.tsx              # Router principal + RoleRoutes
│   ├── main.tsx
│   └── index.css            # Variables CSS globales (Day/Night)
├── vite.config.ts
├── package.json
└── Dockerfile
```

### 6.2 Arquitectura de Componentes React

```
App (Router + AuthProvider)
├── <ProtectedRoute> (requiere JWT)
│   ├── <RibbonMenu rol=Admin/Vet/Aux/Recep>
│   │   └── [Links condicionales por rol]
│   └── <RoleRoute allowedRoles=[...]>
│       └── <Page component/>
│
└── <Login/> (sin proteccion)

AuthContext provee:
  - user: { id, email, nombre, roles[] }
  - token: string (JWT)
  - login(email, pass): Promise<void>
  - logout(): void

RoleRoute:
  - Si rol no esta en allowedRoles[] --> redirige /inicio
  - Si rol autorizado --> renderiza <children>
```

### 6.3 Permisos de Rutas por Rol (Backoffice)

| Ruta | Administrador | Veterinario | AuxiliarClinico | Recepcionista |
|------|:---:|:---:|:---:|:---:|
| `/inicio` | ✅ | ✅ | ✅ | ✅ |
| `/propietarios` | ✅ | ❌ | ❌ | ✅ |
| `/mascotas` | ✅ | ✅ | ✅ | ✅ |
| `/veterinarios` | ✅ | ❌ | ❌ | ❌ |
| `/citas` | ✅ | ❌ | ❌ | ✅ |
| `/recepcion` | ✅ | ❌ | ❌ | ✅ |
| `/consultas` | ✅ | ✅ | ❌ | ❌ |
| `/historial-clinico` | ✅ | ✅ | ✅ | ❌ |
| `/tareas-medicas` | ✅ | ✅ | ✅ | ❌ |
| `/hospitalizacion` | ✅ | ✅ | ✅ | ❌ |
| `/horarios` | ✅ | ✅ | ✅ | ✅ |

### 6.4 Sistema de Theming (Day/Night Mode)

```css
/* index.css — Variables globales */
:root {
  --bg-primary: #0f172a;
  --text-primary: #e2e8f0;
  --accent: #3b82f6;
  /* Modo noche por defecto */
}

.light {
  --bg-primary: #ffffff;
  --text-primary: #1e293b;
  --accent: #2563eb;
  /* Modo dia */
}

/* Activado via toggle en RibbonMenu */
/* Persistido en localStorage */
/* document.body.classList.toggle('light') */
```

### 6.5 Estructura del Portal del Cliente (Mobile-First)

```
src/PetClinic.PortalWeb/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── MyPets.tsx      # Listado de mascotas del propietario
│   │   ├── PetDetail.tsx   # Historial clinico + peso
│   │   └── Placeholder.tsx # Cita/Tienda (proximamente)
│   ├── contexts/
│   │   └── AuthContext.tsx
│   └── App.tsx
└── Dockerfile

Caracteristicas de diseno:
  - Mobile-first (320px base)
  - Day/Night toggle con CSS variables
  - Read-only (sin formularios de edicion)
  - Endpoints /api/portal/* filtrados por PropietarioId del JWT
```

---

## 7. Estructura y Flujo de Datos del Backend {#7-backend}

### 7.1 Estructura de Proyectos del Backend

```
src/
├── PetClinic.Domain/
│   └── Entities/
│       ├── Propietario.cs
│       ├── Veterinario.cs
│       ├── Mascota.cs
│       ├── RegistroPeso.cs
│       ├── Cita.cs
│       ├── DetalleConsulta.cs
│       ├── Hospitalizacion.cs
│       ├── MonitoreoClinico.cs
│       ├── TareaPredefinida.cs
│       └── TareaClinica.cs
│
├── PetClinic.Application/
│   ├── Features/
│   │   ├── Propietarios/
│   │   │   ├── Commands/CreateOwnerCommand.cs
│   │   │   ├── Commands/UpdateOwnerCommand.cs
│   │   │   ├── Commands/DeactivateOwnerCommand.cs
│   │   │   └── Queries/GetOwnersQuery.cs
│   │   ├── Veterinarios/ [similar]
│   │   ├── Mascotas/ [similar]
│   │   ├── Citas/
│   │   │   ├── Commands/CreateAppointmentCommand.cs
│   │   │   ├── Commands/UpdateAppointmentStatusCommand.cs
│   │   │   └── Queries/GetAppointmentsQuery.cs
│   │   ├── Consultas/ [DetalleConsulta]
│   │   ├── Hospitalizacion/ [Admision + Alta + Monitoreo]
│   │   └── TareasClinicas/ [Kanban CRUD]
│   ├── Common/
│   │   └── Validators/ [FluentValidation]
│   └── Interfaces/
│       └── IPetClinicDbContext.cs
│
├── PetClinic.Infrastructure/
│   ├── Persistence/
│   │   ├── PetClinicDbContext.cs  # SaveChangesAsync + Shadow Props
│   │   ├── Configurations/        # EF Fluent API mappings
│   │   ├── Migrations/
│   │   └── Seeding/
│   │       └── DatabaseSeeder.cs  # Datos de prueba realistas
│   └── Identity/
│       └── ApplicationUser.cs
│
└── PetClinic.Api/
    ├── Controllers/
    │   ├── AuthController.cs       # POST /api/auth/login
    │   ├── PropietariosController.cs
    │   ├── VeterinariosController.cs
    │   ├── MascotasController.cs
    │   ├── CitasController.cs
    │   ├── ConsultasController.cs
    │   ├── HospitalizacionController.cs
    │   ├── TareasController.cs
    │   ├── HorariosController.cs
    │   └── PortalController.cs     # Endpoints para Portal
    ├── Program.cs
    └── appsettings.json
```

### 7.2 Flujo de Petición HTTP Completo (Request Pipeline)

```
HTTP Request
    |
    v
[JWT Middleware]          Valida Authorization: Bearer {token}
    |                     HTTP 401 si no hay token
    v
[CORS Policy]             Permite origenes: :5173, :5174
    |
    v
[Controller]              Mapea JSON -> Command/Query DTO
    |
    v
[MediatR.Send()]          Despacha al Handler correcto
    |
    v
[FluentValidation]        Valida reglas de negocio ANTES
    |                     de tocar la BD
    v
[Command/Query Handler]   Lógica de caso de uso
    |
    v
[IPetClinicDbContext]     Operaciones CRUD via EF Core
    |
    v
[PetClinicDbContext]      SaveChangesAsync()
    |                     Intercepta y aplica Shadow Properties
    v
[SQL Server]              Persistencia fisica en mssql_data
    |
    v
HTTP Response (200/201/400/401/403/404)
```

### 7.3 Patrón CQRS con MediatR

```
COMMANDS (escritura):
  CreateOwnerCommand     --> CreateOwnerCommandHandler
  UpdateOwnerCommand     --> UpdateOwnerCommandHandler
  DeactivateOwnerCommand --> DeactivateOwnerCommandHandler
  CreateAppointmentCommand --> CreateAppointmentCommandHandler
    [FluentValidation: fecha futura + no solapamiento]
  UpdateAppointmentStatusCommand --> ...
  CreateConsultationDetailCommand -->  [TRANSACCION ATOMICA]
    - INSERT DetalleConsulta
    - UPDATE Cita.Estado = "Completada"
  AdmitPetCommand        --> [Validacion jaula unica]
  DischargePatientCommand -->
  RegisterMonitoreoCommand -->
  CreateTareaClinicaCommand -->
  UpdateTareaStatusCommand -->

QUERIES (lectura, sin efectos secundarios):
  GetOwnersQuery         --> PagedResult<PropietarioDto>
  GetPetsQuery           --> PagedResult<MascotaDto>
  GetAppointmentsQuery   --> List<CitaDto> (filtrado por rol)
  GetClinicalHistoryQuery --> ExpedienteClinicoDto
  GetHospitalizacionesQuery -->
  GetTareasKanbanQuery   -->
  GetSchedulesQuery      --> filtrado por VeterinarioId
  GetPortalPetsQuery     --> filtrado por PropietarioId del JWT
```

### 7.4 Validaciones con FluentValidation

```
CreateAppointmentValidator:
  - FechaHora > DateTime.UtcNow  (no fechas pasadas)
  - MascotaId: mascota activa existente
  - VeterinarioId: veterinario activo existente
  - Solapamiento: ninguna cita activa del mismo vet en ±30min

AdmitPatientValidator:
  - MascotaId: mascota activa
  - NumeroJaula: unica entre hospitalizaciones con Estado="Internado"

CreateOwnerValidator:
  - Nombre: minimo 3 caracteres
  - Email: formato valido + unico en BD
  - Telefono: numerico

RegisterWeightValidator:
  - PesoKg > 0 (peso positivo)
  - MascotaId: mascota activa
```

### 7.5 Endpoints de la API REST

| Metodo | Endpoint | Handler | Roles Permitidos |
|--------|----------|---------|-----------------|
| POST | `/api/auth/login` | Login | Publico |
| GET | `/api/auth/me` | GetCurrentUser | Autenticado |
| GET/POST/PUT/DELETE | `/api/propietarios` | CRUD Propietarios | Admin, Recepcionista |
| GET/POST/PUT/DELETE | `/api/veterinarios` | CRUD Veterinarios | Admin |
| GET/POST/PUT/DELETE | `/api/mascotas` | CRUD Mascotas | Admin, Vet, Aux, Recep |
| POST | `/api/mascotas/{id}/pesos` | Registrar Peso | Admin, Vet, Aux |
| GET/POST/PUT | `/api/citas` | Gestion Citas | Admin, Recep, Vet |
| POST | `/api/consultas-detalles` | Completar Consulta | Admin, Vet |
| GET | `/api/historial-clinico/{mascotaId}` | Expediente | Admin, Vet, Aux |
| GET/POST/PUT | `/api/hospitalizaciones` | Hospitalizacion | Admin, Vet, Aux |
| POST | `/api/hospitalizaciones/{id}/monitoreos` | Monitoreo | Admin, Vet, Aux |
| GET/POST/PUT | `/api/tareas-clinicas` | Kanban | Admin, Vet, Aux |
| GET | `/api/tareas-predefinidas` | Catalogo | Admin, Vet |
| GET | `/api/portal/mascotas` | Portal Mascotas | Propietario |
| GET | `/api/portal/mascotas/{id}/historial` | Portal Historial | Propietario |
| GET | `/api/citas?veterinarioId={id}` | Horarios por Vet | Todos autenticados |

---

## 8. Prácticas SDD (Specification-Driven Development) {#8-sdd-practicas}

### 8.1 Metodología OpenSpec Aplicada

El desarrollo del PetClinic Management System utilizó la metodología **OpenSpec (Specification-Driven Development)**, en la que cada funcionalidad se define primero como una especificación formal antes de codificar.

```
CICLO SDD POR FUNCIONALIDAD:
                                                    
  1. PROPOSE           2. DESIGN           3. IMPLEMENT
  +----------+        +----------+        +----------+
  |proposal.md|  ---> |design.md  | --->  |Codigo    |
  |           |        |           |       |Tests     |
  | "Que"     |        | "Como"    |       |"Prueba"  |
  +----------+        +----------+        +----------+
       |                                       |
       v                                       v
  4. ARCHIVE                              5. SPEC UPDATE
  +----------+                           +----------+
  |spec.md   |  <--- consolidacion  <--- |spec.md   |
  |           |       en openspec/        |actualizado|
  |  Vivo     |       specs/              |          |
  +----------+                           +----------+
```

### 8.2 Estructura de un Spec OpenSpec (Formato Gherkin/SDD)

```markdown
# [nombre-capacidad] Specification

## Purpose
Descripcion del proposito de esta capacidad del sistema.

## Requirements
### Requirement: [Nombre del Requisito]
[Actor] SHALL [verbo de accion] [objeto] [condicion].

#### Scenario: [Nombre del escenario]
- GIVEN [precondicion]
- WHEN  [accion del actor o sistema]
- THEN  [resultado esperado]
- AND   [resultado adicional]
```

### 8.3 Las 25 Specs del Sistema y su Capacidad

| Spec | Capacidad | Sprint |
|------|-----------|--------|
| `bootstrap-petclinic-architecture` | Esqueleto Clean Architecture | 1 |
| `clean-architecture-setup` | Reglas de dependencia formales | 1 |
| `user-authentication` | JWT + Identity | 2 |
| `role-based-access-control` | RBAC + Ribbon Menu | 2 |
| `transactional-auditing` | Shadow Properties automaticas | 2 |
| `owner-management` | CRUD Propietarios | 3 |
| `veterinarian-management` | CRUD Veterinarios + Identity sync | 3 |
| `pet-management` | CRUD Mascotas | 4 |
| `weight-tracking` | Historial de peso | 4 |
| `appointment-booking` | Agendamiento + anti-solapamiento | 5 |
| `appointments-archive` | Historial de citas admin | 5 |
| `clinical-history` | Expediente clinico | 6 |
| `hospitalization-records` | Internamiento + alta | 8 |
| `clinical-monitoring` | Signos vitales | 8 |
| `clinical-tasks` | Kanban de tareas | 7 |
| `predefined-tasks` | Catalogo de tareas | 7 |
| `client-portal` | Portal de propietarios | 9 |
| `containerization-runtime` | Docker + Nginx | 9 |
| `database-integration` | SQL Server en Docker | 12 |
| `quality-assurance-testing` | Pruebas unitarias MSTest | 10 |
| `testing-expansion` | Expansion de cobertura | 11 |
| `integration-testing` | Pruebas de integracion SQL Server | 13 |
| `seeding-refinement` | Datos de prueba realistas | 15 |
| `backoffice-ux` | UX roles + Day/Night | Sprint 3-UX |
| `manage-schedules` | Vista de horarios + auto-agendamiento | Sprint 3-HOR |

### 8.4 Trazabilidad Requisito-Spec-Código

| Requisito | Spec OpenSpec | Clase/Archivo |
|-----------|--------------|---------------|
| REQ-SEG-01 | `user-authentication` | `AuthController.cs` |
| REQ-SEG-02 | `user-authentication` | `AuthContext.tsx` |
| REQ-SEG-03 | `transactional-auditing` | `PetClinicDbContext.SaveChangesAsync()` |
| REQ-SEG-04 | `role-based-access-control` | `RoleRoute.tsx`, `[Authorize(Roles=...)]` |
| REQ-CIT-02 | `appointment-booking` | `CreateAppointmentValidator.cs` |
| REQ-HOS-03 | `hospitalization-records` | `AdmitPatientValidator.cs` |
| REQ-HIS-02 | `clinical-history` | `CreateConsultationDetailCommand.cs` |

### 8.5 Estrategia de Pruebas

```
PIRAMIDE DE PRUEBAS APLICADA:

        /\ INTEGRACION (28 pruebas)
       /  \ SQL Server real
      /    \ CustomWebApplicationFactory
     /------\
    /        \ UNITARIAS (27 pruebas)
   /          \ MSTest + EF InMemory
  /            \ Guid.NewGuid() por test
 /--------------\
/ COMPONENTES UI  \ (Manual - React DevTools)
/------------------\
```

**Pruebas Unitarias cubren:**
- Solapamiento de citas (30 min window)
- Jaula unica en hospitalizacion
- Cierre transaccional de consulta
- Shadow Properties en SaveChanges
- Exclusion de auditoria en RegistroPeso y TareasPredefinidas
- Validacion de peso > 0
- CRUD de propietarios + validaciones FluentValidation
- Historial clinico filtrado por mascota
- Mascota con propietario inactivo (rechazado)
- Estados iniciales de entidades

**Pruebas de Integracion cubren:**
- Pipeline HTTP completo (Controller -> Handler -> DB)
- Deactivacion en cascada: Veterinario + su cuenta Identity
- Persistencia fisica en SQL Server 2022
- Autenticacion JWT en endpoints protegidos
- CORS para origenes autorizados

---

## 9. Stack Tecnológico Estandarizado {#9-stack}

### 9.1 Diagrama Estructural del Stack Tecnológico

```
+=========================================================================+
|              STACK TECNOLOGICO — PETCLINIC MANAGEMENT SYSTEM            |
+=========================================================================+
|                                                                          |
|  CAPA CLIENTE (Frontend)                                                 |
|  +---------------------------+  +---------------------------+            |
|  |    Backoffice SPA         |  |    Portal Cliente SPA     |            |
|  |  React 18 + TypeScript    |  |  React 18 + TypeScript    |            |
|  |  Vite (bundler/dev)       |  |  Vite (bundler/dev)       |            |
|  |  React Router v6          |  |  React Router v6          |            |
|  |  Axios (HTTP client)      |  |  Axios (HTTP client)      |            |
|  |  CSS Variables (theming)  |  |  Mobile-first responsive  |            |
|  |  Nginx (produccion)       |  |  Nginx (produccion)       |            |
|  +---------------------------+  +---------------------------+            |
|                                                                          |
|  CAPA PRESENTACION BACKEND                                               |
|  +---------------------------------------------------------------+      |
|  |  ASP.NET Core Web API (.NET 10)                               |      |
|  |  Swagger/OpenAPI (documentacion)                              |      |
|  |  CORS Policy (origenes autorizados)                           |      |
|  |  JWT Bearer Authentication                                    |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  CAPA APLICACION (Casos de Uso)                                          |
|  +---------------------------------------------------------------+      |
|  |  MediatR (CQRS dispatcher)                                    |      |
|  |  FluentValidation (validaciones de entrada)                   |      |
|  |  AutoMapper / DTOs manuales                                   |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  CAPA DOMINIO                                                            |
|  +---------------------------------------------------------------+      |
|  |  Entidades POCO puras (sin dependencias de framework)         |      |
|  |  Enums (EstadoCita, EstadoHospitalizacion, EstadoTarea)       |      |
|  |  Excepciones de dominio                                       |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  CAPA INFRAESTRUCTURA                                                    |
|  +---------------------------------------------------------------+      |
|  |  Entity Framework Core 10 (ORM)                               |      |
|  |  Microsoft SQL Server 2022 (RDBMS)                            |      |
|  |  ASP.NET Core Identity (autenticacion de usuarios)           |      |
|  |  Shadow Properties (auditoria pasiva automatica)              |      |
|  |  Database Migrations (control de esquema)                     |      |
|  |  Database Seeder (datos de prueba realistas)                  |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  INFRAESTRUCTURA DE DESPLIEGUE                                           |
|  +---------------------------------------------------------------+      |
|  |  Docker (contenedores individuales)                           |      |
|  |  Docker Compose (orquestacion multi-contenedor)              |      |
|  |  Nginx (servidor web estatico para SPA)                      |      |
|  |  Docker Volumes (persistencia mssql_data)                    |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  CALIDAD Y PRUEBAS                                                       |
|  +---------------------------------------------------------------+      |
|  |  MSTest (framework de pruebas)                                |      |
|  |  EF Core InMemory (base de datos en memoria para unit tests)  |      |
|  |  WebApplicationFactory (pruebas de integracion HTTP)          |      |
|  |  SQL Server real (base de datos para integration tests)       |      |
|  +---------------------------------------------------------------+      |
|                                                                          |
|  DESARROLLO                                                              |
|  +---------------------------------------------------------------+      |
|  |  OpenSpec (Specification-Driven Development)                  |      |
|  |  Git (control de versiones)                                   |      |
|  |  Visual Studio / VS Code                                      |      |
|  |  Postman / Swagger UI (pruebas manuales de API)              |      |
|  +---------------------------------------------------------------+      |
+=========================================================================+
```

### 9.2 Versiones Especificas

| Tecnologia | Version | Rol |
|-----------|---------|-----|
| .NET | 10.0 | Runtime del backend |
| ASP.NET Core | 10.0 | Framework HTTP |
| Entity Framework Core | 10.0 | ORM |
| MediatR | Latest | CQRS dispatcher |
| FluentValidation | Latest | Validaciones |
| ASP.NET Core Identity | 10.0 | Gestion de usuarios |
| Microsoft SQL Server | 2022 | Base de datos |
| React | 18.x | UI framework |
| TypeScript | 5.x | Tipado estatico |
| Vite | 5.x | Bundler/Dev server |
| Axios | Latest | HTTP client |
| Nginx | Alpine | Servidor SPA |
| Docker | Latest | Contenedores |
| Docker Compose | v2 | Orquestacion |
| MSTest | Latest | Framework pruebas |
| Node.js | 20 LTS | Build frontend |

---

## 10. Catálogo de Especificaciones OpenSpec {#10-specs}

### 10.1 Mapa de Especificaciones por Capacidad

A continuación se presentan los requisitos formales de cada spec con sus escenarios completos, tal como fueron definidos en el desarrollo SDD.

---

#### SPEC: bootstrap-petclinic-architecture
**Origen:** `openspec/specs/bootstrap-petclinic-architecture/spec.md`

**REQ-1: Estructura de la Solución**
La solución SHALL usar Clean Architecture con proyectos Domain, Application, Infrastructure, Api y Web.
- WHEN `dotnet build` THEN todos los proyectos compilan sin errores ni dependencias circulares.

**REQ-2: Regla de Dependencia del Backend**
- `Domain` sin dependencias; `Application` solo depende de Domain; `Infrastructure` de Application+Domain; `Api` de Infrastructure+Application.
- WHEN se compilan Domain y Application THEN no dependen de Infrastructure.

**REQ-3: Frontend SPA Desacoplado**
`PetClinic.Web` SHALL ser SPA independiente con React + TypeScript + Vite.

**REQ-4: Pruebas Unitarias**
Proyecto `PetClinic.Application.UnitTests` en `tests/`. WHEN `dotnet test` THEN todas las pruebas pasan.

---

#### SPEC: user-authentication
**Origen:** `openspec/specs/user-authentication/spec.md`

**REQ-1: Autenticación Obligatoria**
El sistema SHALL denegar acceso a usuarios no autenticados.
- Rutas protegidas retornan HTTP 401.
- Frontend redirige automáticamente a `/login`.

**REQ-2: Validación de Credenciales (Login)**
Sistema SHALL emitir JWT con userId, nombre y roles al login exitoso.
- WHEN credenciales inválidas THEN deniega acceso + alerta.

**REQ-3: Cierre de Sesión (Logout)**
WHEN usuario hace clic en logout THEN JWT eliminado del almacenamiento + redirect a /login.

**REQ-4: Registro de Cuentas de Propietario**
Sistema SHALL vincular cuenta de portal a perfil Propietario existente por correo electrónico.

**REQ-5: Restricción de Contexto por Token**
JWT de Propietarios SHALL incluir claim `PropietarioId` para filtrar datos del API.

---

#### SPEC: role-based-access-control
**Origen:** `openspec/specs/role-based-access-control/spec.md`

**REQ-1: Restricción de Rutas por Rol**
Sistema SHALL retornar HTTP 403 para accesos no autorizados al API.
Frontend SHALL bloquear renderizado y redirigir a /inicio.

**REQ-2: Renderizado Condicional del Ribbon Menu**
Menú solo muestra links correspondientes al rol del usuario.
- AuxiliarClinico: Inicio + Hospitalización; oculta Propietarios y Mascotas.

**REQ-3: Dashboards Dinámicos de Inicio**
`/Inicio` carga dashboard especifico del rol.
- Administrador: métricas globales + citas semana + próximas citas.

---

#### SPEC: transactional-auditing
**Origen:** `openspec/specs/transactional-auditing/spec.md`

**REQ-1: Captura Automática de Auditoría**
DbContext SHALL interceptar SaveChanges e inyectar:
- Inserciones: `CreatedBy` (usuario actual) y `CreatedAt` (UTC).
- Actualizaciones: `UpdatedAt` (UTC).

**REQ-2: Inmutabilidad de Datos de Creación**
`CreatedBy` y `CreatedAt` SHALL ser inmutables una vez persistidos.

---

#### SPEC: owner-management
**Origen:** `openspec/specs/owner-management/spec.md`

**REQ-1: CRUD de Propietarios**
Administrador SHALL crear, consultar, editar y desactivar propietarios.

**REQ-2: Desactivación Lógica**
Propietarios NUNCA se eliminan físicamente; se marcan `Activo = false`.

**REQ-3: Listado Paginado con Búsqueda**
Paginación server-side con filtros por nombre, teléfono o correo.

**REQ-4: Validaciones**
Correo único y válido; teléfono numérico; nombre mínimo 3 caracteres.

---

#### SPEC: veterinarian-management
**Origen:** `openspec/specs/veterinarian-management/spec.md`

**REQ-1: CRUD de Veterinarios**
Administrador SHALL crear, consultar, editar y desactivar veterinarios.

**REQ-2: Creación de Cuenta Simultánea**
Al crear veterinario, sistema SHALL crear ApplicationUser con email como username, contraseña por defecto `Vet123!` y rol "Veterinario".

**REQ-3: Exclusión de Veterinarios Inactivos**
Veterinarios inactivos no aparecen en selectores de agendamiento.

---

#### SPEC: pet-management
**Origen:** `openspec/specs/pet-management/spec.md`

**REQ-1: CRUD de Mascotas**
Administrador y Recepcionistas pueden registrar, consultar, editar y desactivar mascotas.

**REQ-2: Desactivación Lógica**
Mascotas se marcan `Activo = false`; nunca se eliminan físicamente.

**REQ-3: Búsqueda y Paginación**
Filtros por nombre de mascota, especie o propietario, con resultados paginados.

---

#### SPEC: weight-tracking
**Origen:** `openspec/specs/weight-tracking/spec.md`

**REQ-1: Registro de Historial de Peso**
Veterinarios y Auxiliares registran peso (kg) y fecha por paciente.

**REQ-2: Validación de Peso Positivo**
Peso SHALL ser > 0. Valores <= 0 rechazados con alerta.

**REQ-3: Exclusión de Auditoría Pasiva**
Tabla `RegistroPeso` excluida de Shadow Properties de auditoría (REQ-SEG-03).

---

#### SPEC: appointment-booking
**Origen:** `openspec/specs/appointment-booking/spec.md`

**REQ-1: Registro de Citas**
Recepcionista y Administrador agendan citas con mascota activa, veterinario activo, fecha/hora y motivo. Estado inicial: "Agendada".

**REQ-2: Cruce de Horarios**
Sistema SHALL denegar citas si el veterinario tiene otra en el mismo rango (30 min), en estado no cancelado.

**REQ-3: Transiciones de Estado**
Agendada -> Completada | Cancelada. No se puede volver a Agendada.

**REQ-4: Calendario por Rol**
Veterinario ve solo sus citas; Recepcionista ve y modifica el listado general del día.

---

#### SPEC: clinical-history
**Origen:** `openspec/specs/clinical-history/spec.md`

**REQ-1: Registro de Detalle Clínico**
Veterinario registra Diagnóstico y Tratamiento (ambos obligatorios) al completar cita.

**REQ-2: Campos Obligatorios**
Sistema impide guardado si diagnóstico o tratamiento están vacíos.

**REQ-3: Consulta de Historial Médico**
Personal clínico puede buscar mascota y ver expediente cronológico completo.

---

#### SPEC: hospitalization-records
**Origen:** `openspec/specs/hospitalization-records/spec.md`

**REQ-1: Registro de Hospitalización**
Veterinario ingresa mascota con motivo y jaula única. Estado inicial: "Internado".

**REQ-2: Validación de Jaula Única**
No se permiten dos mascotas internadas en la misma jaula simultáneamente.

**REQ-3: Alta Médica**
Alta clínica cambia estado a "Alta" y registra fecha/hora de egreso.

---

#### SPEC: clinical-monitoring
**Origen:** `openspec/specs/clinical-monitoring/spec.md`

**REQ-1: Registro de Monitoreo**
Auxiliar/Veterinario/Admin registran signos vitales: FC (lpm), FR (rpm), Temperatura (°C).

**REQ-2: Historial de Telemetría**
Lista cronológica de todos los monitoreos de una hospitalización.

---

#### SPEC: clinical-tasks
**Origen:** `openspec/specs/clinical-tasks/spec.md`

**REQ-1: Registro de Tareas Clínicas**
Veterinario y Admin crean tareas con título, descripción, mascota y cita opcional. Estado inicial: "Pendiente".

**REQ-2: Tablero Kanban**
Auxiliar y Admin ven tareas en columnas: Pendiente | En Progreso | Completada.

**REQ-3: Transiciones de Estado**
Auxiliar avanza estados mediante botones de acción rápida en el tablero.

---

#### SPEC: predefined-tasks
**Origen:** `openspec/specs/predefined-tasks/spec.md`

**REQ-1: Catálogo de Tareas Predefinidas**
Lista estática: "Administrar Medicación", "Control de Temperatura", "Curación de Herida", etc.

**REQ-2: Exclusión de Auditoría Pasiva**
Tabla `TareasPredefinidas` excluida de Shadow Properties (REQ-SEG-03).

---

#### SPEC: client-portal
**Origen:** `openspec/specs/client-portal/spec.md`

**REQ-1: Acceso Limitado a Mascotas Propias**
Portal solo muestra mascotas del PropietarioId del JWT.

**REQ-2: Consulta de Historial Médico y Peso**
Propietario ve historial clínico y pesos de sus mascotas.

**REQ-3: Estado de Hospitalización**
Portal muestra indicador si mascota está "Internada".

**REQ-4: Menú de Navegación**
Mis Mascotas (activo); Reservar Cita (placeholder); Tienda (placeholder).

**REQ-5: Modo Día y Noche**
Toggle entre tema claro y oscuro, persistido en localStorage.

---

#### SPEC: containerization-runtime
**Origen:** `openspec/specs/containerization-runtime/spec.md`

**REQ-1: Despliegue Multi-Contenedor**
Un solo `docker-compose up` levanta API + Frontend en la misma red virtual.

**REQ-2: Enrutamiento SPA en Nginx**
Nginx redirige rutas secundarias a `index.html` para React Router.

---

#### SPEC: database-integration
**Origen:** `openspec/specs/database-integration/spec.md`

**REQ-1: Orquestación de Base de Datos**
SQL Server 2022 en Docker con persistencia en volumen `mssql_data`.
API espera a que DB esté lista, se conecta y crea esquema automáticamente.

---

#### SPEC: quality-assurance-testing
**Origen:** `openspec/specs/quality-assurance-testing/spec.md`

**REQ-1: Validación de Casos Clínicos**
Pruebas unitarias cubren solapamiento de citas, jaula única e inyección de auditoría.

---

#### SPEC: testing-expansion
**Origen:** `openspec/specs/testing-expansion/spec.md`

**REQ-1: Expansión de Cobertura**
Pruebas adicionales para historial clínico por mascota, creación con propietario inactivo y validadores FluentValidation.

---

#### SPEC: integration-testing
**Origen:** `openspec/specs/integration-testing/spec.md`

**REQ-1: Pipeline de Integración**
Pipeline completo que valida persistencia física, seguridad y ciclo de vida clínico.
GIVEN Admin elimina Veterinario THEN su cuenta Identity se desactiva automáticamente.

---

#### SPEC: seeding-refinement
**Origen:** `openspec/specs/seeding-refinement/spec.md`

**REQ-1: Inicialización de Semillas**
Al detectar DB vacía: 2 admins, 4 vets, 3 auxiliares, 2 recepcionistas, 10 propietarios, 15 mascotas, 10 citas, hospitalizaciones + monitoreos + tareas.

---

#### SPEC: backoffice-ux
**Origen:** `openspec/specs/backoffice-ux/spec.md`

**REQ-1: Role-Based View Authorization**
RoleRoute restringe rutas por rol. Acceso no autorizado redirige a /inicio.

**REQ-2: Day/Night Mode Toggling**
Toggle entre Day (Light) y Night (Dark) themes, persistido en localStorage.

---

#### SPEC: manage-schedules
**Origen:** `openspec/specs/manage-schedules/spec.md`

**REQ-1: Backoffice Schedule Navigation**
Pagina /horarios para todos los roles. Veterinario ve su calendario y puede agendar. Auxiliar puede ver agenda de cualquier veterinario. Admin/Recep pueden inspeccionar cualquier agenda.

**REQ-2: Veterinarian Appointment Self-Scheduling**
Veterinario puede agendar citas para sí mismo desde /horarios. Validación anti-solapamiento aplica.

**REQ-3: Auxiliary Multi-Schedule View**
Auxiliar puede cambiar el veterinario en un dropdown para inspeccionar su agenda diaria.

---

## Historial de Evolución de Diseño (13 Sprints)

| Sprint | Nombre | Capacidades Introducidas |
|--------|--------|--------------------------|
| 1 | Inicialización Arquitectónica | Clean Architecture, SPA React, CORS |
| 2 | Seguridad y RBAC | Identity, JWT, Shadow Properties, RibbonMenu |
| 3 | Personal y Clientes | CRUD Propietarios + Veterinarios + Identity sync |
| 4 | Pacientes | CRUD Mascotas + RegistroPeso |
| 5 | Citas | Agendamiento + Anti-solapamiento + Vistas por rol |
| 6 | Historia Clínica | DetalleConsulta + Cierre transaccional |
| 7 | Tareas Médicas | Kanban + TareasPredefinidas |
| 8 | Hospitalización | Internamiento + Monitoreo de signos vitales |
| 9 | Dockerización | Dockerfiles + Nginx + docker-compose.yml |
| 10 | Pruebas Unitarias | 27 MSTest + EF InMemory |
| 11 | Expansión Cobertura | PropietarioTests, FichaClinicaTests, QueriesTests |
| 12 | SQL Server en Docker | petclinic-db + volumen mssql_data |
| 13 | Pruebas Integración | 28 pruebas contra SQL Server real |
| +UX | UX + Roles + Portal | RoleRoute, backoffice-ux, Portal móvil |
| +HOR | Horarios | Schedules.tsx, auto-agendamiento Veterinario |

---

*Documento generado el 2026-07-14 a partir de la consolidación de 25 especificaciones OpenSpec del proyecto PetClinic Management System — Ayacucho, Perú.*

