# 📋 Documento de Análisis — PetClinic Management System

> **Generado:** 2026-07-14  
> **Fuente:** Consolidación de 18 cambios archivados en `openspec/changes/archive/` + ERS formal + Architecture.md  
> **Propósito:** Artefactos de la Fase de Análisis para presentación académica y continuidad del proyecto.

---

## Tabla de Contenidos

1. [Documento de Especificación de Requisitos de Software (SRS)](#1-srs)
2. [Casos de Uso y Actores](#2-casos-de-uso)
3. [Historias de Usuario con Criterios de Aceptación](#3-historias-de-usuario)
4. [Diccionario de Datos](#4-diccionario-de-datos)
5. [Diagrama de Flujo de Datos (DFD) / Modelado de Procesos (BPMN)](#5-flujo-de-datos)
6. [Prototipos de Baja Fidelidad (Wireframes)](#6-wireframes)
7. [Historial de Cambios OpenSpec](#7-historial-openspec)

---

## 1. Documento de Especificación de Requisitos de Software (SRS) {#1-srs}

### 1.1 Propósito del Sistema

El **PetClinic Management System** es una aplicación web interna de gestión para una clínica veterinaria. Permite administrar propietarios (clientes), mascotas (pacientes), citas médicas, historial clínico, hospitalización, tareas clínicas y personal veterinario. El acceso está restringido exclusivamente a usuarios internos autenticados.

### 1.2 Alcance

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| Seguridad y Autenticación | Login JWT, RBAC, auditoría pasiva | ✅ Implementado |
| Gestión de Propietarios | CRUD clientes con baja lógica | ✅ Implementado |
| Gestión de Mascotas/Pacientes | CRUD pacientes + historial de peso | ✅ Implementado |
| Gestión de Citas | Agendamiento con validación horaria | ✅ Implementado |
| Historial Clínico | Expedientes de diagnósticos y tratamientos | ✅ Implementado |
| Hospitalización | Internamiento y monitoreo de signos vitales | ✅ Implementado |
| Tareas Clínicas (Kanban) | Tablero para auxiliares clínicos | ✅ Implementado |
| Gestión de Veterinarios | CRUD personal clínico | ✅ Implementado |
| Portal del Cliente | SPA móvil para propietarios | ✅ Implementado |
| Horarios/Agendas | Vista de turnos para todos los roles | ✅ Implementado |

### 1.3 Actores del Sistema

| Actor | Descripción | Acceso |
|-------|-------------|--------|
| **Administrador** | Control total del sistema | Todos los módulos |
| **Veterinario** | Personal médico | Consultas, historial, tareas, hospitalizaciones, horarios |
| **Auxiliar Clínico** | Personal de apoyo | Tareas, hospitalización, mascotas |
| **Recepcionista** | Atención al cliente | Citas, propietarios, mascotas, horarios |
| **Propietario (Portal)** | Cliente externo | Portal móvil de solo lectura |

### 1.4 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Backend API | ASP.NET Core Web API (.NET 10) |
| ORM | Entity Framework Core 10 |
| Base de Datos | Microsoft SQL Server 2022 |
| Autenticación | ASP.NET Core Identity + JWT Bearer |
| Patrón | Clean Architecture + CQRS/MediatR |
| Validaciones | FluentValidation |
| Frontend Backoffice | React + TypeScript + Vite |
| Frontend Portal | React + TypeScript + Vite (mobile-first) |
| Servidor Web Frontend | Nginx (producción) |
| Contenedores | Docker + Docker Compose |
| Pruebas | MSTest + EF Core InMemory + Integration Tests |

### 1.5 Requisitos Funcionales por Módulo

#### Módulo 1: Seguridad y Control de Acceso

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-SEG-01 | Autenticación obligatoria. Cualquier acceso sin sesión redirige a `/Login`. | Alta |
| REQ-SEG-02 | Cierre de sesión que invalida el token JWT inmediatamente. | Alta |
| REQ-SEG-03 | Auditoría transaccional pasiva (Shadow Properties: `CreatedBy`, `CreatedAt`, `UpdatedAt`) en todas las entidades excepto `TareasPredefinidas` y `RegistroPeso`. | Alta |
| REQ-SEG-04 | Control de Acceso Basado en Roles (RBAC). Rutas protegidas retornan HTTP 403 si el rol no tiene permiso. | Alta |
| REQ-SEG-05 | Solo el Administrador puede crear, editar y desactivar cuentas. No existe auto-registro público. | Alta |

#### Módulo 2: Interfaz y Navegación

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-NAV-01 | Menú superior Ribbon condicional por rol (solo aparecen las secciones autorizadas). | Alta |
| REQ-NAV-02 | Modo Día/Noche alternable desde el Ribbon, persistido en `localStorage`. | Media |
| REQ-NAV-03 | Rutas protegidas en React (`RoleRoute`) que redirigen a `/inicio` si el rol no tiene acceso. | Alta |

#### Módulo 3: Propietarios

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-PRO-01 | CRUD completo de Propietarios con baja lógica (`Activo = false`). | Alta |
| REQ-PRO-02 | Listado paginado del lado del servidor con parámetros `page`, `pageSize` y `searchTerm`. | Alta |

#### Módulo 4: Mascotas

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-MAS-01 | CRUD de Mascotas vinculadas a un Propietario mediante FK. | Alta |
| REQ-MAS-02 | Registro histórico de variaciones de peso (`RegistroPeso`) excluido de auditoría pasiva. | Alta |
| REQ-MAS-03 | Vista de ficha clínica unificada del paciente (datos demográficos + propietario + historial de peso). | Alta |
| REQ-MAS-04 | Baja lógica de mascotas (`Activo = false`) sin eliminación física. | Alta |

#### Módulo 5: Citas

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-CIT-01 | CRUD de Citas vinculando MascotaId y VeterinarioId con FechaHora, Motivo y Estado. | Alta |
| REQ-CIT-02 | Validación de solapamiento: duración estándar de 30 minutos, no se permiten citas cruzadas del mismo veterinario. | Alta |
| REQ-CIT-03 | Estados de cita: `Agendada`, `Completada`, `Cancelada`. | Alta |
| REQ-CIT-04 | No se permiten citas en fechas/horas pasadas (validación FluentValidation). | Alta |
| REQ-CIT-05 | Vistas diferenciadas: Admin (listado general), Recepción (sala de espera), Veterinario (agenda propia). | Alta |

#### Módulo 6: Historial Clínico

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-HIS-01 | Entidad `DetalleConsulta` con CitaId, MascotaId, VeterinarioId, Diagnostico, Tratamiento y NotasAdicionales. | Alta |
| REQ-HIS-02 | Al completar una cita, el diagnóstico y tratamiento son obligatorios (transacción conjunta). | Alta |
| REQ-HIS-03 | Vista `/historial-clinico` para buscar mascotas y ver su expediente clínico completo. | Alta |

#### Módulo 7: Tareas Clínicas

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-TAR-01 | Catálogo de `TareasPredefinidas` (excluidas de auditoría, estáticas). | Media |
| REQ-TAR-02 | `TareaClinica` con estados Kanban: `Pendiente`, `En Progreso`, `Completada`. | Alta |
| REQ-TAR-03 | Tablero Kanban visual en React para Auxiliares y Veterinarios. | Alta |
| REQ-TAR-04 | El tablero muestra solo tareas de las últimas 48h o no completadas. | Media |

#### Módulo 8: Veterinarios

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-VET-01 | Al crear un Veterinario, se crea simultáneamente su cuenta Identity con contraseña por defecto `Vet123!` y rol "Veterinario". | Alta |
| REQ-VET-02 | Baja lógica de Veterinarios desactiva también su cuenta Identity. | Alta |
| REQ-VET-03 | CRUD paginado de Veterinarios accesible solo para el Administrador. | Alta |

#### Módulo 9: Hospitalización

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-HOS-01 | Registro de hospitalizaciones con asignación de jaula (número único por paciente activo). | Alta |
| REQ-HOS-02 | Entidad `MonitoreoClinico` con Temperatura (decimal), FrecuenciaCardiaca (int), FrecuenciaRespiratoria (int). | Alta |
| REQ-HOS-03 | Validación de jaula ocupada: no se puede asignar la misma jaula a dos mascotas simultáneamente. | Alta |

#### Módulo 10: Portal del Cliente

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-POR-01 | Portal móvil separado (`PetClinic.PortalWeb`) solo de lectura para propietarios. | Media |
| REQ-POR-02 | Endpoints `/api/portal/` filtrados por `PropietarioId` del JWT. No expone datos de otros clientes. | Alta |
| REQ-POR-03 | Modo Día/Noche en el portal con CSS variables y persistencia en `localStorage`. | Media |

#### Módulo 11: Horarios

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| REQ-HOR-01 | Vista `/horarios` accesible para todos los roles con vista diaria/semanal de citas. | Media |
| REQ-HOR-02 | El Veterinario puede auto-agendar citas desde su vista de horarios. | Media |
| REQ-HOR-03 | Auxiliares y Recepcionistas pueden consultar la agenda de cualquier veterinario. | Media |

### 1.6 Requisitos No Funcionales

| ID | Categoría | Descripción |
|----|-----------|-------------|
| RNF-01 | Seguridad | Tokens JWT con expiración de 1 hora. No se almacenan en cookies inseguras. |
| RNF-02 | Rendimiento | Paginación del lado del servidor en todos los listados grandes. |
| RNF-03 | Mantenibilidad | Arquitectura Limpia con capas independientes y pruebas automatizadas. |
| RNF-04 | Portabilidad | Sistema completamente dockerizado (un comando `docker-compose up` levanta todo). |
| RNF-05 | Integridad | Shadow Properties automáticas en todas las entidades (excepto exclusiones de REQ-SEG-03). |
| RNF-06 | Escalabilidad | Separación física de frontend y backend permite escalar independientemente. |
| RNF-07 | Testabilidad | 55 pruebas totales: 27 unitarias (MSTest/InMemory) + 28 integración (SQL Server real). |

---

## 2. Casos de Uso y Actores {#2-casos-de-uso}

### 2.1 Diagrama de Actores y Casos de Uso Principales

```
+---------------------------------------------------------------------+
|                    PetClinic Management System                       |
|                                                                      |
|  [Admin]   --> UC-01: Gestionar Usuarios                            |
|             --> UC-02: Gestionar Veterinarios                       |
|             --> UC-03: Gestionar Propietarios                       |
|             --> UC-04: Gestionar Mascotas                           |
|             --> UC-05: Gestionar Citas                              |
|             --> UC-06: Ver Historial Global                         |
|             --> UC-07: Ver Agenda Global                            |
|                                                                      |
|  [Veteri.] --> UC-08: Ver Agenda Propia + Auto-Agendar              |
|             --> UC-09: Iniciar y Completar Consulta                 |
|             --> UC-10: Registrar Diagnostico y Tratamiento          |
|             --> UC-11: Hospitalizar Paciente                        |
|             --> UC-12: Registrar Tarea Clinica (Kanban)             |
|             --> UC-04: Gestionar Mascotas (consulta/edicion)        |
|                                                                      |
|  [Auxili.] --> UC-13: Gestionar Tablero Kanban de Tareas            |
|             --> UC-14: Registrar Monitoreos de Hospitalizacion      |
|             --> UC-04: Ver Fichas de Mascotas                       |
|                                                                      |
|  [Recep.]  --> UC-15: Confirmar Llegada de Paciente                 |
|             --> UC-05: Agendar/Cancelar Citas                       |
|             --> UC-03: Gestionar Propietarios                       |
|             --> UC-04: Gestionar Mascotas                           |
|                                                                      |
|  [Propie.] --> UC-16: Ver Mascotas Propias (Portal)                 |
|  (Portal)  --> UC-17: Ver Historial Clinico de Mascota              |
|             --> UC-18: Ver Estado de Hospitalizacion                |
+---------------------------------------------------------------------+
```

### 2.2 Descripción de Casos de Uso Clave

#### UC-01: Login / Autenticación
- **Actor principal:** Todos los usuarios
- **Precondición:** El usuario tiene una cuenta activa creada por el Administrador
- **Flujo principal:**
  1. El usuario accede al sistema y es redirigido a `/Login`
  2. Ingresa email y contraseña
  3. El backend valida credenciales contra Identity y emite un JWT
  4. El frontend almacena el token y redirige al Dashboard correspondiente al rol
- **Flujo alternativo:** Credenciales inválidas → mensaje de error, no redirige

#### UC-05: Agendar Cita
- **Actor principal:** Administrador, Recepcionista, Veterinario (solo para sí mismo)
- **Precondición:** Existe al menos un veterinario y una mascota activos
- **Flujo principal:**
  1. El usuario selecciona Mascota, Veterinario, FechaHora y Motivo
  2. El backend valida que `FechaHora` no sea pasada
  3. El backend valida que el veterinario no tenga otra cita activa en el rango de ±30 min
  4. Se crea la cita con estado `Agendada`
- **Flujo alternativo:** Solapamiento detectado → error de validación con detalle del conflicto

#### UC-09: Completar Consulta
- **Actor principal:** Veterinario
- **Precondición:** Existe una cita en estado `Agendada` asignada al veterinario
- **Flujo principal:**
  1. El veterinario selecciona la cita desde su agenda
  2. Ingresa Diagnóstico (obligatorio) y Tratamiento (obligatorio)
  3. El backend crea `DetalleConsulta` y cambia el estado de la cita a `Completada` en una misma transacción
- **Flujo alternativo:** Si no se provee diagnóstico → validación rechaza la transición

#### UC-11: Hospitalizar Paciente
- **Actor principal:** Veterinario
- **Precondición:** Mascota activa y jaula disponible
- **Flujo principal:**
  1. El veterinario selecciona una mascota y un número de jaula
  2. El backend valida que la jaula no esté ocupada por otro paciente con estado `Internado`
  3. Se crea la `Hospitalizacion` y el personal puede registrar `MonitoreoClinico`
- **Flujo alternativo:** Jaula ocupada → error descriptivo con el nombre del paciente actual

---

## 3. Historias de Usuario con Criterios de Aceptación {#3-historias-de-usuario}

### Épica 1: Seguridad y Acceso

**US-001** — Como **usuario del sistema**, quiero poder iniciar sesión con mi email y contraseña para acceder a las funcionalidades de mi rol.

**Criterios de Aceptación:**
- [ ] CA-001-1: Dado email y contraseña válidos, cuando el usuario hace login, entonces recibe un JWT y es redirigido al Dashboard de su rol.
- [ ] CA-001-2: Dado credenciales incorrectas, el sistema muestra un mensaje de error genérico.
- [ ] CA-001-3: Dado un usuario no autenticado, cualquier ruta protegida lo redirige a `/Login`.
- [ ] CA-001-4: No existe ningún formulario de auto-registro público accesible.

**US-002** — Como **cualquier usuario autenticado**, quiero poder cerrar sesión desde el menú superior para proteger mi cuenta.

**Criterios de Aceptación:**
- [ ] CA-002-1: Al hacer logout, el token JWT es invalidado y se redirige a `/Login`.
- [ ] CA-002-2: Después del logout, navegar hacia atrás no reanuda la sesión.

**US-003** — Como **sistema**, quiero registrar automáticamente quién creó o modificó cada registro para garantizar la trazabilidad.

**Criterios de Aceptación:**
- [ ] CA-003-1: En cualquier inserción (excepto `RegistroPeso` y `TareasPredefinidas`), `CreatedBy`, `CreatedAt` y `UpdatedAt` se escriben automáticamente.
- [ ] CA-003-2: En actualizaciones, solo `UpdatedAt` se modifica; los demás permanecen inalterables.

---

### Épica 2: Propietarios (Clientes)

**US-004** — Como **Administrador o Recepcionista**, quiero registrar nuevos propietarios con sus datos de contacto.

**Criterios de Aceptación:**
- [ ] CA-004-1: El formulario requiere: Nombre, Apellido, DNI, Teléfono, Email y Dirección.
- [ ] CA-004-2: El sistema valida que el DNI/Email no estén duplicados.
- [ ] CA-004-3: Un propietario creado aparece en el listado con estado `Activo`.

**US-005** — Como **Administrador o Recepcionista**, quiero buscar propietarios en un listado paginado.

**Criterios de Aceptación:**
- [ ] CA-005-1: El listado muestra máximo 10 registros por página con controles de navegación.
- [ ] CA-005-2: El campo de búsqueda filtra enviando la consulta al servidor.
- [ ] CA-005-3: Se puede filtrar por estado (Activo/Inactivo).

**US-006** — Como **Administrador**, quiero desactivar un propietario sin eliminar su historial.

**Criterios de Aceptación:**
- [ ] CA-006-1: La operación de baja establece `Activo = false` sin ejecutar DELETE físico.
- [ ] CA-006-2: Las mascotas y citas históricas del propietario permanecen accesibles.

---

### Épica 3: Mascotas (Pacientes)

**US-007** — Como **personal clínico**, quiero registrar una nueva mascota asociándola a un propietario existente.

**Criterios de Aceptación:**
- [ ] CA-007-1: Campos requeridos: Nombre, Especie, Raza, FechaNacimiento, Sexo, Color.
- [ ] CA-007-2: Se debe seleccionar un propietario activo existente.
- [ ] CA-007-3: La mascota queda con estado `Activo = true` al crearse.

**US-008** — Como **Veterinario**, quiero registrar el peso de una mascota en cada visita.

**Criterios de Aceptación:**
- [ ] CA-008-1: El registro requiere fecha y peso en kilogramos (decimal).
- [ ] CA-008-2: Solo se puede registrar peso a mascotas activas.
- [ ] CA-008-3: El historial de pesos se muestra en orden cronológico descendente.
- [ ] CA-008-4: El registro de peso NO genera shadow properties de auditoría (REQ-SEG-03).

---

### Épica 4: Citas

**US-009** — Como **Recepcionista o Administrador**, quiero agendar una cita para una mascota con un veterinario disponible.

**Criterios de Aceptación:**
- [ ] CA-009-1: Se selecciona Mascota, Veterinario, FechaHora y Motivo.
- [ ] CA-009-2: El sistema rechaza citas con FechaHora en el pasado.
- [ ] CA-009-3: El sistema rechaza citas si el veterinario ya tiene una en el rango de ±30 minutos.
- [ ] CA-009-4: La cita se crea con estado `Agendada`.

**US-010** — Como **Recepcionista**, quiero ver la lista de citas del día con opción de confirmar la llegada del paciente.

**Criterios de Aceptación:**
- [ ] CA-010-1: La vista `/recepcion` muestra citas del día ordenadas por hora.
- [ ] CA-010-2: Existe un botón de "Confirmar Llegada" para cada cita con estado `Agendada`.
- [ ] CA-010-3: Existe opción de cancelar citas desde la sala de espera.

**US-011** — Como **Veterinario**, quiero ver únicamente mis citas del día.

**Criterios de Aceptación:**
- [ ] CA-011-1: La vista `/consultas` muestra solo citas asignadas al veterinario logueado.
- [ ] CA-011-2: Existe botón de "Iniciar Atención" y "Completar Consulta" por cada cita.
- [ ] CA-011-3: Al completar una consulta, el sistema solicita obligatoriamente Diagnóstico y Tratamiento.

---

### Épica 5: Historial Clínico

**US-012** — Como **Veterinario**, quiero registrar el diagnóstico y tratamiento al finalizar una consulta.

**Criterios de Aceptación:**
- [ ] CA-012-1: Diagnóstico y Tratamiento son campos obligatorios al completar una cita.
- [ ] CA-012-2: El cierre de la consulta y la creación del `DetalleConsulta` ocurren en la misma transacción.
- [ ] CA-012-3: Las notas adicionales son opcionales.

**US-013** — Como **personal clínico**, quiero buscar el expediente clínico completo de cualquier mascota.

**Criterios de Aceptación:**
- [ ] CA-013-1: El buscador `/historial-clinico` acepta búsqueda por nombre de mascota o propietario.
- [ ] CA-013-2: El expediente muestra datos demográficos, propietario, historial de peso y consultas.
- [ ] CA-013-3: Se pueden buscar mascotas activas e inactivas.

---

### Épica 6: Hospitalización

**US-014** — Como **Veterinario**, quiero internar a una mascota asignándole una jaula.

**Criterios de Aceptación:**
- [ ] CA-014-1: Se requiere seleccionar mascota activa y número de jaula.
- [ ] CA-014-2: El sistema rechaza la admisión si la jaula ya está ocupada.
- [ ] CA-014-3: La hospitalización queda con estado `Internado`.

**US-015** — Como **Auxiliar Clínico**, quiero registrar monitoreos de signos vitales de un paciente hospitalizado.

**Criterios de Aceptación:**
- [ ] CA-015-1: Se puede registrar Temperatura (°C decimal), FrecuenciaCardiaca (ppm int) y FrecuenciaRespiratoria (rpm int).
- [ ] CA-015-2: Cada monitoreo registra quién lo realizó (`RegistradoPor`).
- [ ] CA-015-3: El historial de monitoreos se muestra en orden cronológico.

---

### Épica 7: Tareas Clínicas (Kanban)

**US-016** — Como **Veterinario**, quiero crear tareas clínicas para pacientes hospitalizados.

**Criterios de Aceptación:**
- [ ] CA-016-1: La tarea requiere Título y MascotaId. Descripción y CitaId son opcionales.
- [ ] CA-016-2: La tarea se crea con estado `Pendiente`.
- [ ] CA-016-3: El tablero Kanban muestra la tarea en la columna "Pendiente".

**US-017** — Como **Auxiliar Clínico**, quiero ver el tablero Kanban de tareas y actualizar su estado.

**Criterios de Aceptación:**
- [ ] CA-017-1: El tablero muestra columnas: Pendiente, En Progreso, Completada.
- [ ] CA-017-2: Cada tarjeta muestra nombre de mascota, título y descripción.
- [ ] CA-017-3: Se puede transicionar el estado mediante botones de acción rápida.
- [ ] CA-017-4: Solo se muestran tareas de las últimas 48h o no completadas.

---

### Épica 8: Portal del Cliente

**US-018** — Como **Propietario**, quiero acceder a un portal móvil para ver el estado de mis mascotas.

**Criterios de Aceptación:**
- [ ] CA-018-1: El portal es responsive y optimizado para mobile.
- [ ] CA-018-2: Solo muestra las mascotas del propietario autenticado.
- [ ] CA-018-3: Soporta modo Día/Noche persistido en `localStorage`.
- [ ] CA-018-4: Los datos son de solo lectura (no se puede editar nada).

---

### Épica 9: Horarios

**US-019** — Como **Veterinario**, quiero ver mi agenda y poder agendar nuevas citas desde la vista de horarios.

**Criterios de Aceptación:**
- [ ] CA-019-1: La vista `/horarios` muestra las horas hábiles (8:00 AM – 6:00 PM) en intervalos de 30 min.
- [ ] CA-019-2: Las citas existentes se visualizan en sus franjas horarias.
- [ ] CA-019-3: El veterinario puede hacer clic en un slot disponible para abrir el modal de agendamiento.
- [ ] CA-019-4: Al agendar desde este panel, el VeterinarioId está bloqueado al del usuario logueado.

---

## 4. Diccionario de Datos {#4-diccionario-de-datos}

### 4.1 Entidades Principales del Dominio

#### Tabla: `Propietarios`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria autoincremental | PK, NOT NULL |
| `Nombre` | `string` | Nombre del propietario | NOT NULL, max 100 |
| `Apellido` | `string` | Apellido del propietario | NOT NULL, max 100 |
| `DNI` | `string` | Documento de identidad | UNIQUE, NOT NULL |
| `Telefono` | `string` | Número de contacto | NOT NULL |
| `Email` | `string` | Correo electrónico | UNIQUE, NOT NULL |
| `Direccion` | `string` | Dirección física | NULL |
| `Activo` | `bool` | Estado lógico (baja lógica) | NOT NULL, default: true |
| `CreatedBy` | `string` (shadow) | Usuario que creó el registro | Auto-auditado |
| `CreatedAt` | `datetime` (shadow) | Fecha de creación | Auto-auditado, UTC |
| `UpdatedAt` | `datetime` (shadow) | Fecha de última actualización | Auto-auditado, UTC |

#### Tabla: `Veterinarios`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `Nombre` | `string` | Nombre del veterinario | NOT NULL |
| `Apellido` | `string` | Apellido | NOT NULL |
| `Especialidad` | `string` | Especialidad clínica | NULL |
| `ApplicationUserId` | `string` | FK hacia AspNetUsers (1:1) | FK, NOT NULL |

#### Tabla: `Mascotas`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `Nombre` | `string` | Nombre de la mascota | NOT NULL |
| `Especie` | `string` | Canino, Felino, Otro | NOT NULL |
| `Raza` | `string` | Raza específica | NULL |
| `FechaNacimiento` | `datetime` | Fecha de nacimiento | NULL |
| `Sexo` | `string` | Macho / Hembra | NOT NULL |
| `Color` | `string` | Color del pelaje | NULL |
| `Activo` | `bool` | Baja lógica | NOT NULL, default: true |
| `PropietarioId` | `int` | FK hacia Propietarios | FK, NOT NULL |

#### Tabla: `RegistroPeso`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `MascotaId` | `int` | FK hacia Mascotas | FK, NOT NULL |
| `FechaRegistro` | `datetime` | Fecha del pesaje | NOT NULL |
| `PesoKg` | `decimal` | Peso en kilogramos | NOT NULL, mayor que 0 |

> NOTA: Esta entidad está excluida de Shadow Properties de auditoría (REQ-SEG-03).

#### Tabla: `Citas`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `MascotaId` | `int` | FK hacia Mascotas | FK, NOT NULL |
| `VeterinarioId` | `int` | FK hacia Veterinarios | FK, NOT NULL |
| `FechaHora` | `datetime` | Fecha y hora de la cita | NOT NULL, mayor que ahora |
| `Motivo` | `string` | Motivo de la consulta | NOT NULL |
| `Estado` | `string` | Estado de la cita | NOT NULL: Agendada / Completada / Cancelada |

#### Tabla: `DetallesConsultas`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `CitaId` | `int` | FK hacia Citas | FK, NOT NULL |
| `MascotaId` | `int` | FK hacia Mascotas | FK, NOT NULL |
| `VeterinarioId` | `int` | FK hacia Veterinarios | FK, NOT NULL |
| `FechaAtencion` | `datetime` | Fecha de la consulta | NOT NULL |
| `Diagnostico` | `string` | Diagnóstico médico | NOT NULL |
| `Tratamiento` | `string` | Tratamiento prescrito | NOT NULL |
| `NotasAdicionales` | `string` | Notas libres del veterinario | NULL |

#### Tabla: `Hospitalizaciones`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `MascotaId` | `int` | FK hacia Mascotas | FK, NOT NULL |
| `NumeroJaula` | `int` | Número de jaula asignada | NOT NULL, único por estado Internado |
| `FechaIngreso` | `datetime` | Fecha de admisión | NOT NULL |
| `FechaAlta` | `datetime` | Fecha de alta médica | NULL cuando internado |
| `Estado` | `string` | Internado / Alta | NOT NULL |
| `Motivo` | `string` | Razón de la hospitalización | NOT NULL |

#### Tabla: `MonitoreosClinicos`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `HospitalizacionId` | `int` | FK hacia Hospitalizaciones | FK, NOT NULL |
| `FechaRegistro` | `datetime` | Timestamp del monitoreo | NOT NULL |
| `Temperatura` | `decimal(4,1)` | Temperatura rectal en grados C | NOT NULL |
| `FrecuenciaCardiaca` | `int` | Latidos por minuto | NOT NULL |
| `FrecuenciaRespiratoria` | `int` | Respiraciones por minuto | NOT NULL |
| `RegistradoPor` | `string` | Nombre del registrador | NOT NULL |

#### Tabla: `TareasPredefinidas`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `Nombre` | `string` | Nombre de la tarea estándar | NOT NULL |
| `Descripcion` | `string` | Descripción del procedimiento | NULL |

> NOTA: Esta entidad está excluida de Shadow Properties de auditoría (REQ-SEG-03).

#### Tabla: `TareasClinicas`
| Campo | Tipo | Descripción | Restricciones |
|-------|------|-------------|---------------|
| `Id` | `int` | Clave primaria | PK, NOT NULL |
| `Titulo` | `string` | Título de la tarea | NOT NULL |
| `Descripcion` | `string` | Descripción detallada | NULL |
| `Estado` | `string` | Pendiente / En Progreso / Completada | NOT NULL |
| `MascotaId` | `int` | FK hacia Mascotas | FK, NOT NULL |
| `VeterinarioId` | `int` | FK quien crea la tarea | FK, NOT NULL |
| `CitaId` | `int` | FK hacia Citas (opcional) | FK, NULL |

### 4.2 Identidad y Seguridad (ASP.NET Core Identity)

| Tabla | Descripción |
|-------|-------------|
| `AspNetUsers` | Cuentas de usuario del sistema (`ApplicationUser : IdentityUser`) |
| `AspNetRoles` | Roles: Administrador, Veterinario, AuxiliarClinico, Recepcionista, Propietario |
| `AspNetUserRoles` | Asignación de roles a usuarios |
| `AspNetUserClaims` | Claims adicionales (incluye `PropietarioId` para el rol Portal) |

### 4.3 Relaciones Entre Entidades

```
Propietarios    --(1:N)--> Mascotas
Mascotas        --(1:N)--> RegistroPeso
Mascotas        --(1:N)--> Citas
Mascotas        --(1:N)--> Hospitalizaciones
Mascotas        --(1:N)--> TareasClinicas
Mascotas        --(1:N)--> DetallesConsultas
Veterinarios    --(1:N)--> Citas
Veterinarios    --(1:N)--> TareasClinicas
Veterinarios    --(1:N)--> DetallesConsultas
Veterinarios    --(1:1)--> AspNetUsers
Citas           --(1:1)--> DetallesConsultas
Hospitalizaciones --(1:N)--> MonitoreosClinicos
```

---

## 5. Diagrama de Flujo de Datos (DFD) / Modelado de Procesos {#5-flujo-de-datos}

### 5.1 DFD Nivel 0: Contexto General

```
[Personal Clinico] ---HTTP/HTTPS---> [PetClinic Management System] ---EF Core---> [SQL Server]
[Propietarios]     ---HTTP/HTTPS--->                               <---EF Core--- [SQL Server]
                   <---JSON/JWT---
```

### 5.2 DFD Nivel 1: Procesos Principales

```
P1: Autenticacion --JWT Token--> Usuario Autenticado
P2: Gestion Propietarios <--> Base Datos (Propietarios)
P3: Gestion Mascotas <--> Base Datos (Mascotas, RegistroPeso)
P4: Gestion Citas <--> Base Datos (Citas) + Validacion Horaria
P5: Historia Clinica <--> Base Datos (DetallesConsultas)
P6: Hospitalizacion <--> Base Datos (Hospitalizaciones, MonitoreosClinicos)
P7: Tareas Clinicas <--> Base Datos (TareasClinicas, TareasPredefinidas)
```

### 5.3 Flujo BPMN: Proceso de Atencion Clinica (Happy Path)

```
RECEPCIONISTA      VETERINARIO         SISTEMA
     |                  |                  |
     |--Agenda Cita---->|                  |
     |                  |--valida horario->|
     |<--Cita confirmada------------------|
     |                  |                  |
     |--Confirma llegada----------------->|
     |                  |<--notifica-------|
     |                  |                  |
     |                  |--inicia consulta>|
     |                  |--diagnostico---->|
     |                  |--completa------->|
     |                  |         crea DetalleConsulta + Estado=Completada
     |                  |<--exito----------|
[FIN]
```

### 5.4 Flujo BPMN: Proceso de Hospitalizacion

```
VETERINARIO    AUXILIAR CLINICO    SISTEMA
     |               |                |
     |--admite paciente (jaula)------>|
     |                       valida jaula libre
     |<--hospitalizacion creada-------|
     |                               |
     |--crea tarea clinica---------->|
     |               |<--kanban updated|
     |               |                |
     |               |--monitoreo---->|
     |               |<--guardado-----|
     |                               |
     |--alta medica----------------->|
     |<--alta confirmada--------------|
[FIN]
```

---

## 6. Prototipos de Baja Fidelidad (Wireframes) {#6-wireframes}

### 6.1 Pagina de Login

```
+----------------------------------------------------------+
|                                                          |
|          PetClinic Management System                     |
|                                                          |
|        +-----------------------------------+             |
|        |         Iniciar Sesion           |             |
|        |                                   |             |
|        |  Email:  [_____________________] |             |
|        |  Password:[_____________________] |             |
|        |                                   |             |
|        |          [  Ingresar  ]           |             |
|        |                                   |             |
|        |  Solo acceso para personal        |             |
|        |  autorizado de la clinica         |             |
|        +-----------------------------------+             |
+----------------------------------------------------------+
```

### 6.2 Dashboard con Ribbon Menu

```
+--------------------------------------------------------------------------+
| PetClinic [Inicio][Propietarios][Mascotas][Citas][Veterinarios] [*] [X] |
|            [Historial][Hospitalizacion][Tareas][Horarios]     [Salir]   |
+--------------------------------------------------------------------------+
|                                                                          |
|  Bienvenido, Dr. Garcia                      Hoy: Lunes 14 Jul 2026    |
|                                                                          |
|  +---------------+ +---------------+ +---------------+ +-------------+ |
|  | Citas Hoy: 8  | | Pacientes: 45 | | Internados: 2 | | Tareas: 3  | |
|  +---------------+ +---------------+ +---------------+ +-------------+ |
|                                                                          |
|  Mis Proximas Citas:                                                     |
|  09:00 | Firulais (Canino)  | Juan Perez  | Consulta General            |
|  09:30 | Michi (Felino)     | Ana Garcia  | Vacunacion                  |
|  10:00 | Rocky (Canino)     | Luis Torres | Control Post-Op             |
+--------------------------------------------------------------------------+
```

### 6.3 Vista de Citas

```
+--------------------------------------------------------------------------+
| GESTION DE CITAS                                      [+ Nueva Cita]    |
|                                                                          |
|  [Buscar...] [Fecha:___] [Veterinario: v] [Estado: v] [Filtrar]         |
|                                                                          |
|  # | FechaHora    | Mascota   | Veterinario  | Estado    | Acciones     |
|  --+--------------+-----------+--------------+-----------+------------- |
|  1 | 14/07 09:00  | Firulais  | Dr. Garcia   | Agendada  | [Editar][X] |
|  2 | 14/07 09:30  | Michi     | Dra. Lopez   | Agendada  | [Editar][X] |
|  3 | 13/07 15:00  | Rocky     | Dr. Garcia   | Completada| [Ver]       |
|                                                                          |
|  Pagina 1 de 5  [<][1][2][3][4][5][>]                                  |
+--------------------------------------------------------------------------+
```

### 6.4 Tablero Kanban

```
+--------------------------------------------------------------------------+
| TAREAS CLINICAS - TABLERO KANBAN                    [+ Nueva Tarea]     |
|                                                                          |
|  +------------------+ +------------------+ +------------------------+   |
|  |    PENDIENTE     | |   EN PROGRESO    | |       COMPLETADA       |   |
|  +------------------+ +------------------+ +------------------------+   |
|  | Firulais         | | Michi            | | Rocky                 |   |
|  | Colocacion de    | | Monitoreo de     | | Administrar suero     |   |
|  | cateter IV       | | temperatura      | | [Completada 10:30]    |   |
|  | [Iniciar >>]     | | [Completar OK]   | |                       |   |
|  +------------------+ +------------------+ |                       |   |
|  | Bruno            |                       +------------------------+   |
|  | Bano medicado    |                                                    |
|  | [Iniciar >>]     |                                                    |
|  +------------------+                                                    |
+--------------------------------------------------------------------------+
```

### 6.5 Ficha Clinica del Paciente

```
+--------------------------------------------------------------------------+
| FIRULAIS - FICHA CLINICA                              [Editar] [Volver] |
+------------------------+-------------------------------------------------+
| DATOS DEL PACIENTE     | PROPIETARIO                                     |
| Especie: Canino        | Juan Perez                                      |
| Raza: Labrador         | Tel: 987-654-321                                |
| Fecha Nac: 15/03/2019  | Email: juan@email.com                           |
| Sexo: Macho            | Direccion: Av. Principal 123                    |
| Color: Dorado          |                                                 |
| Estado: Activo         |                                                 |
+------------------------+-------------------------------------------------+
| HISTORIAL DE PESO                              [+ Registrar Peso]       |
| 08/07: 25.3 kg | 01/07: 25.8 kg | 15/06: 26.1 kg                      |
+--------------------------------------------------------------------------+
| HISTORIAL DE CONSULTAS                                                   |
| 13/07/2026 | Dr. Garcia | Dx: Otitis externa  | Tx: Gotas oticas        |
| 01/07/2026 | Dr. Garcia | Dx: Control rutina  | Tx: Desparasitacion     |
+--------------------------------------------------------------------------+
```

### 6.6 Portal del Cliente (Mobile)

```
  +---------------------+
  |  PetClinic Portal   |
  |        [*]          |
  +---------------------+
  |  Hola, Juan Perez   |
  +---------------------+
  |  MIS MASCOTAS       |
  |  +---------------+  |
  |  | Firulais      |  |
  |  | Canino        |  |
  |  | Activo [OK]   |  |
  |  | [Ver Ficha]   |  |
  |  +---------------+  |
  |  +---------------+  |
  |  | Mishi         |  |
  |  | Felino        |  |
  |  | Internada [!] |  |
  |  | [Ver Ficha]   |  |
  |  +---------------+  |
  +---------------------+
  |[Dashboard][Citas]   |
  |      [Tienda]       |
  +---------------------+
```

### 6.7 Vista de Horarios

```
+--------------------------------------------------------------------------+
| HORARIOS                          Veterinario: [Dr. Garcia v]           |
| [< Anterior] Semana: 14-18 Jul   [Siguiente >]  [Hoy]                  |
|                                                                          |
| HORA  | LUNES 14  | MARTES 15 | MIERCOLES 16 | JUEVES 17 | VIERN 18   |
| ------+-----------+-----------+--------------+-----------+------------- |
| 08:00 | [Libre]   | [Libre]   | [Libre]      | [Libre]   | [Libre]    |
| 08:30 | [Libre]   | [Libre]   | [Libre]      | [Libre]   | [Libre]    |
| 09:00 | Firulais  | [Libre]   | [Libre]      | [Libre]   | [Libre]    |
| 09:30 | Michi     | [Libre]   | [Libre]      | [Libre]   | [Libre]    |
| 10:00 | [Libre]   | [Libre]   | Rocky        | [Libre]   | [Libre]    |
|  ...  |   ...     |   ...     |     ...      |   ...     |    ...     |
|                                                                          |
| [+ Agendar en slot seleccionado]                                        |
+--------------------------------------------------------------------------+
```

---

## 7. Historial de Cambios OpenSpec {#7-historial-openspec}

Cronología completa de los 18 cambios archivados desde la inicialización hasta el estado actual.

### Sprint 1 — Inicialización (08 Jul 2026)

| # | Cambio | Descripcion | Capacidades |
|---|--------|-------------|-------------|
| 1 | `2026-07-08-setup-petclinic-architecture` | Esqueleto base: PetClinic.sln, proyectos Domain/Application/Infrastructure/Api/Web, CORS, React+TypeScript+Vite. | `bootstrap-petclinic-architecture` |
| 2 | `2026-07-08-setup-clean-architecture` | Clean Architecture con proyectos separados para límites arquitectónicos en compile-time. Proyectos de prueba UnitTests x3. | `clean-architecture-setup` |
| 3 | `2026-07-08-veterinarians-owners` | Entidades Veterinario y Propietario. CRUD paginado server-side. Cuenta Identity al crear veterinario. Baja lógica. | `veterinarian-management`, `owner-management` |
| 4 | `2026-07-08-pets-patients` | Entidades Mascota y RegistroPeso. Ficha clínica unificada. Exclusión de RegistroPeso de auditoría. | `pet-management`, `weight-tracking` |
| 5 | `2026-07-08-appointments` | Entidad Cita con estados. Anti-solapamiento 30 min. Vistas por rol (Admin, Recepción, Veterinario). | `appointment-booking` |
| 6 | `2026-07-08-security-auth` | Identity + JWT. Interceptor Shadow Properties. AuthController. AuthContext + ProtectedRoute React. Ribbon Menu por rol. | `user-authentication`, `role-based-access-control`, `transactional-auditing` |

### Sprint 2 — Módulos Clínicos y Operativos (09 Jul 2026)

| # | Cambio | Descripcion | Capacidades |
|---|--------|-------------|-------------|
| 7 | `2026-07-09-clinical-records` | Entidad DetalleConsulta. Flujo transaccional de cierre de consulta. Vista historial-clinico. | `clinical-history`, `appointments-archive` |
| 8 | `2026-07-09-hospitalization` | Entidades Hospitalizacion y MonitoreoClinico. Validación jaula única. Panel React. | `hospitalization-records`, `clinical-monitoring` |
| 9 | `2026-07-09-tasks-kanban` | TareaPredefinida (sin auditoría) y TareaClinica. Tablero Kanban. Filtro 48h. | `predefined-tasks`, `clinical-tasks` |
| 10 | `2026-07-09-client-portal` | SPA PetClinic.PortalWeb mobile-first. Endpoints /api/portal/ filtrados por PropietarioId. | `client-portal` |
| 11 | `2026-07-09-dockerization` | Dockerfiles multi-etapa API (.NET 10) y Frontend (Node+Nginx). docker-compose.yml puertos 5173/5210. | `containerization-runtime` |
| 12 | `2026-07-09-database-integration` | SQL Server 2022 en Docker. Volumen mssql_data. Puerto 1433 para SSMS/Azure Data Studio. | modifica quality-assurance-testing |
| 13 | `2026-07-09-unit-tests` | 27 pruebas unitarias MSTest + EF InMemory: solapamiento citas, jaulas, cierre transaccional, auditoría, pesos. | `quality-assurance-testing` |
| 14 | `2026-07-09-expanded-testing` | Cobertura extendida: PropietarioTests, FichaClinicaTests, QueriesTests, DomainTests. | modifica quality-assurance-testing |
| 15 | `2026-07-09-seeding-refinement` | Semillas: 2 admins, 4 vets, 3 auxiliares, 2 recepcionistas, 10 propietarios, 15 mascotas, 10 citas. | modifica quality-assurance-testing |
| 16 | `2026-07-09-integration-testing` | PetClinic.IntegrationTests. 28 pruebas integración contra SQL Server real. Deactivación Identity en baja vet. | `integration-testing-pipeline` |

### Sprint 3 — UX, Roles y Horarios (14 Jul 2026)

| # | Cambio | Descripcion | Capacidades |
|---|--------|-------------|-------------|
| 17 | `2026-07-14-fix-backoffice-ux-and-roles` | Fix crash dashboard Auxiliar. RoleRoute React. Ribbon Menu correcto. Toggle Día/Noche con .light CSS. Alertas error. | mejoras UX/seguridad frontend |
| 18 | `2026-07-14-manage-schedules` | Schedules.tsx nueva página. Ruta /horarios todos los roles. Auto-agendamiento Veterinario. Extensión endpoint citas. | nuevas vistas + extensión API |

### Resumen de Estado del Proyecto

| Métrica | Valor |
|---------|-------|
| Cambios archivados | 18 |
| Pruebas unitarias | 27 |
| Pruebas de integración | 28 |
| Total pruebas | 55 |
| Entidades de dominio | 9 |
| Roles del sistema | 5 (Admin, Veterinario, Auxiliar, Recepcionista, Propietario) |
| Aplicaciones frontend | 2 (Backoffice + Portal) |
| Contenedores Docker | 3 (API + Web + DB) |

---

## 8. Decisiones Técnicas Clave Consolidadas

| Decisión | Justificación | Alternativa Descartada |
|----------|--------------|------------------------|
| Clean Architecture con proyectos separados | Hace cumplir límites en compile-time | Mono-proyecto con namespaces |
| JWT Bearer sin cookies | Desacoplamiento total SPA/API, compatible con mobile | Cookies de sesión tradicionales |
| Shadow Properties para auditoría | No ensucian el modelo de dominio | Columnas explícitas en entidades |
| CQRS con MediatR | Separación clara de comandos y consultas | Servicios monolíticos |
| Baja lógica en lugar de DELETE físico | Integridad referencial histórica | Eliminación física con CASCADE |
| Paginación del lado del servidor | Rendimiento con miles de registros | Paginación del lado del cliente |
| Duración estándar 30 min por cita | Simplifica el algoritmo anti-solapamiento | Duraciones configurables por cita |
| Nginx para servir SPA | Ligero, fallback a index.html para React Router | Servir desde la API de .NET |
| MSTest como framework de pruebas | Alineado al stack de la ERS | xUnit o NUnit |
| CSS Variables para theming Día/Noche | Cobertura global sin duplicar estilos | Estilos inline por componente |

---

*Documento generado y consolidado el 2026-07-14 a partir del historial completo de cambios OpenSpec del proyecto PetClinic Management System.*

