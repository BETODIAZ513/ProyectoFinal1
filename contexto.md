# Contexto General del Proyecto — PetClinic Management System

> Archivo generado a partir de los 23 módulos de OpenSpec.
> Ruta de origen: `openspec/specs/*/spec.md`
> Última sincronización: 2026-07-09

---

## Tabla de Contenidos

1. Arquitectura del Sistema
2. Infraestructura y Datos
3. Seguridad y Accesos
4. Gestión de Entidades Clínicas
5. Flujo Clínico Operativo
6. Portal del Cliente
7. Calidad y Pruebas

---

## 1. Arquitectura del Sistema

### 1.1 bootstrap-petclinic-architecture

**Origen:** openspec/specs/bootstrap-petclinic-architecture/spec.md

#### Requirement: Estructura de la Solución
La solución PetClinic SHALL estar estructurada usando Clean Architecture con proyectos independientes en `src/` para Domain, Application, Infrastructure, Api y Web (frontend).

- Scenario (Compilación exitosa): WHEN `dotnet build` THEN todos los proyectos compilan sin errores ni dependencias circulares.

#### Requirement: Regla de Dependencia del Backend
- `PetClinic.Domain` sin dependencias externas.
- `PetClinic.Application` solo depende de Domain.
- `PetClinic.Infrastructure` depende de Application y Domain.
- `PetClinic.Api` depende de Infrastructure y Application.

- Scenario (Aislamiento del Dominio): WHEN se compilan Domain y Application THEN no dependen de Infrastructure.

#### Requirement: Frontend SPA Desacoplado
`PetClinic.Web` SHALL ser una SPA independiente con React + TypeScript + Vite.

- Scenario: WHEN se revisa src/PetClinic.Web THEN contiene Vite config, package.json y componentes TypeScript.

#### Requirement: Pruebas Unitarias
Proyecto `PetClinic.Application.UnitTests` en `tests/`.

- Scenario: WHEN `dotnet test` THEN todas las pruebas pasan exitosamente.

---

### 1.2 clean-architecture-setup

**Origen:** openspec/specs/clean-architecture-setup/spec.md

#### Requirement: Estructura de la Solución
La solución MUST usar Clean Architecture con capas Domain, Application, Infrastructure y WebUI.

#### Requirement: Regla de Dependencia
- Domain: sin referencias a otras capas.
- Application: solo referencia a Domain.

- Scenario (Aislamiento del Dominio): WHEN se verifica PetClinic.Domain.csproj THEN no referencia Application, Infrastructure ni WebUI.
- Scenario (Aislamiento de la Aplicación): WHEN se verifica PetClinic.Application.csproj THEN solo referencia Domain.

---

## 2. Infraestructura y Datos

### 2.1 database-integration

**Origen:** openspec/specs/database-integration/spec.md

#### Requirement: Orquestación de Base de Datos
El sistema SHALL usar SQL Server en Docker con persistencia de datos.

- Scenario (Arranque): GIVEN docker-compose up WHEN API inicia THEN espera a DB, se conecta y crea esquema si no existe.
- Scenario (Persistencia): WHEN se apagan contenedores y se vuelven a iniciar THEN los datos clínicos persisten intactos.

---

### 2.2 containerization-runtime

**Origen:** openspec/specs/containerization-runtime/spec.md

#### Requirement: Despliegue Multi-Contenedor
Un solo comando `docker-compose up` levanta API y Frontend en la misma red virtual.

#### Requirement: Enrutamiento SPA en Nginx
Nginx redirige cualquier ruta secundaria a `index.html` para React Router.

- Scenario: WHEN usuario accede a `/hospitalizacion` THEN Nginx responde con index.html.

---

### 2.3 seeding-refinement

**Origen:** openspec/specs/seeding-refinement/spec.md

#### Requirement: Inicialización de Semillas
Al detectar DB vacía, el sistema SHALL sembrar datos ficticios escalados: 10 propietarios, 15 mascotas con pesos, 10 citas y hospitalizaciones activas con monitoreos y tareas de enfermería.

- Scenario (Perfiles clínicos): GIVEN DB vacía WHEN se crean cuentas de veterinarios THEN se autogenera perfil en tabla Veterinarios.

---

## 3. Seguridad y Accesos

### 3.1 user-authentication

**Origen:** openspec/specs/user-authentication/spec.md

#### Requirement: Autenticación Obligatoria
El sistema SHALL denegar acceso anónimo. Rutas protegidas retornan HTTP 401 para clientes no autenticados; el frontend redirige a /login.

#### Requirement: Validación de Credenciales (Login)
Login por usuario/correo + contraseña emite token JWT con userId, nombre y roles.

- Scenario (Credenciales inválidas): WHEN credenciales incorrectas THEN sistema deniega acceso y muestra alerta.

#### Requirement: Cierre de Sesión (Logout)
WHEN usuario hace clic en cerrar sesión THEN se elimina JWT del almacenamiento local y se redirige a /login.

#### Requirement: Registro de Cuentas de Propietario
Permite vincular cuenta de portal a perfil Propietario existente por correo electrónico, asignando rol Propietario.

#### Requirement: Restricción de Contexto JWT (Claims)
El token JWT de Propietarios SHALL incluir claim `PropietarioId` para restringir contexto del API.

---

### 3.2 role-based-access-control

**Origen:** openspec/specs/role-based-access-control/spec.md

#### Requirement: Restricción de Rutas por Rol
- API retorna HTTP 403 cuando rol no tiene permiso al endpoint.
- Frontend bloquea renderizado y redirige a /inicio si rol no tiene acceso a la ruta.

#### Requirement: Renderizado Condicional del Ribbon Menu
El menú solo muestra los enlaces correspondientes al rol del usuario autenticado.

- Scenario (AuxiliarClinico): Menú muestra Inicio y Hospitalización; oculta Propietarios y Mascotas.

#### Requirement: Dashboards Dinámicos de Inicio
La pantalla /Inicio carga el dashboard específico del rol.

- Scenario (Administrador): Carga métricas globales, citas de la semana y próximas citas.

---

### 3.3 transactional-auditing

**Origen:** openspec/specs/transactional-auditing/spec.md

#### Requirement: Captura Automática de Auditoría
En cada SaveChanges el sistema SHALL inyectar automáticamente:
- Inserciones: `CreatedBy` (usuario actual) y `CreatedAt` (UTC).
- Actualizaciones: `UpdatedAt` (UTC).

#### Requirement: Inmutabilidad de Datos de Creación
`CreatedBy` y `CreatedAt` SHALL ser inmutables; ninguna actualización los modifica.

---

## 4. Gestión de Entidades Clínicas

### 4.1 owner-management

**Origen:** openspec/specs/owner-management/spec.md

#### Requirement: CRUD de Propietarios
Administrador puede crear, consultar, editar y desactivar propietarios.

#### Requirement: Desactivación Lógica
Los propietarios NUNCA se eliminan físicamente; se marcan con `Activo = false`.

#### Requirement: Listado Paginado con Búsqueda
Paginación server-side con filtros por nombre, teléfono o correo, y ordenamiento por nombre o fecha de registro.

#### Requirement: Validaciones
- Correo único y válido.
- Teléfono numérico.
- Nombre mínimo 3 caracteres.

---

### 4.2 pet-management

**Origen:** openspec/specs/pet-management/spec.md

#### Requirement: CRUD de Mascotas
Administrador y Recepcionistas pueden registrar, consultar, editar y desactivar mascotas vinculadas a propietarios.

#### Requirement: Desactivación Lógica
Las mascotas se marcan con `Activo = false`; nunca se eliminan físicamente.

#### Requirement: Búsqueda y Paginación
Filtros por nombre de mascota, especie o nombre del propietario, con resultados paginados.

---

### 4.3 veterinarian-management

**Origen:** openspec/specs/veterinarian-management/spec.md

#### Requirement: CRUD de Veterinarios
Administrador puede crear, consultar, editar y desactivar veterinarios.

#### Requirement: Creación de Cuenta Simultánea
Al crear veterinario, el sistema SHALL crear simultáneamente un ApplicationUser en Identity con el correo como username, contraseña por defecto y rol Veterinario.

#### Requirement: Exclusión de Inactivos
Los veterinarios inactivos no deben aparecer en los selectores de agendamiento.

---

## 5. Flujo Clínico Operativo

### 5.1 appointment-booking

**Origen:** openspec/specs/appointment-booking/spec.md

#### Requirement: Registro de Citas
Recepcionista y Administrador pueden agendar citas seleccionando mascota activa, veterinario activo, fecha/hora y motivo. Estado inicial: "Agendada".

#### Requirement: Cruce de Horarios
El sistema SHALL denegar citas si el veterinario ya tiene otra en el mismo rango (duración 30 min), en estado no cancelado.

#### Requirement: Transiciones de Estado
Estados: Agendada -> Completada | Cancelada. No se puede volver a Agendada desde Completada o Cancelada.

#### Requirement: Calendario por Rol
- Veterinario: ve solo sus citas asignadas.
- Recepcionista: ve y modifica el listado general del día.

---

### 5.2 appointments-archive

**Origen:** openspec/specs/appointments-archive/spec.md

#### Requirement: Archivo Histórico de Citas
Administrador y Recepcionistas consultan lista global y paginada de citas en estado Completada o Cancelada.

---

### 5.3 clinical-history

**Origen:** openspec/specs/clinical-history/spec.md

#### Requirement: Registro de Detalle Clínico
Veterinario registra diagnóstico y tratamiento al completar una cita médica. Ambos campos son obligatorios.

#### Requirement: Consulta de Historial Médico
Personal clínico puede ver el expediente clínico completo de cualquier mascota, ordenado cronológicamente.

---

### 5.4 weight-tracking

**Origen:** openspec/specs/weight-tracking/spec.md

#### Requirement: Registro de Historial de Peso
Veterinarios y Auxiliares registran peso (kg) y fecha de pesaje por paciente.

#### Requirement: Validación de Peso Positivo
El valor de peso SHALL ser mayor que cero. Valores <= 0 son rechazados con alerta.

#### Requirement: Exclusión de Auditoría Pasiva
La tabla `RegistroPeso` está excluida de la inyección automática de campos de auditoría.

---

### 5.5 hospitalization-records

**Origen:** openspec/specs/hospitalization-records/spec.md

#### Requirement: Registro de Hospitalización
Veterinario o Administrador ingresan mascota a hospitalización con motivo y número de jaula único. Estado inicial: "Internado".

#### Requirement: Validación de Jaula Única
No se permiten dos mascotas internadas en la misma jaula simultáneamente.

#### Requirement: Alta Médica
El alta clínica cambia el estado a "Alta" y registra la fecha y hora de egreso.

---

### 5.6 clinical-monitoring

**Origen:** openspec/specs/clinical-monitoring/spec.md

#### Requirement: Registro de Monitoreo
Auxiliar, Veterinario o Administrador registran signos vitales para pacientes hospitalizados: FC, FR, Temperatura y Estado de Alerta.

#### Requirement: Historial de Telemetría Clínica
Se lista cronológicamente todos los monitoreos de una hospitalización para auditar la evolución del paciente.

---

### 5.7 clinical-tasks

**Origen:** openspec/specs/clinical-tasks/spec.md

#### Requirement: Registro de Tareas Clínicas
Veterinario y Administrador crean tareas clínicas con título, descripción, mascota asociada y cita opcional. Estado inicial: "Pendiente".

#### Requirement: Tablero Kanban de Control
Auxiliar y Administrador ven tareas en columnas: Pendiente | En Progreso | Completada.

#### Requirement: Transiciones de Estado en Kanban
El Auxiliar avanza el estado de las tareas mediante botones de avance rápido en el tablero.

---

### 5.8 predefined-tasks

**Origen:** openspec/specs/predefined-tasks/spec.md

#### Requirement: Catálogo de Tareas Predefinidas
Lista estática de tareas comunes: "Administrar Medicación", "Control de Temperatura", "Curación de Herida", etc. para agilizar el registro clínico.

#### Requirement: Exclusión de Auditoría Pasiva
La tabla `TareasPredefinidas` está excluida de la inyección automática de campos de auditoría.

---

## 6. Portal del Cliente

### 6.1 client-portal

**Origen:** openspec/specs/client-portal/spec.md

#### Requirement: Acceso Limitado a Mascotas Propias
El Propietario solo ve mascotas vinculadas a su `PropietarioId`.
- Datos visibles: nombre, especie, raza, sexo, color, fecha de nacimiento.
- Datos ocultos: información de otros propietarios o mascotas no relacionadas.

#### Requirement: Consulta de Historial Médico y de Peso
Propietario puede consultar historial clínico (diagnóstico y tratamiento) y de peso de sus mascotas, ordenados cronológicamente descendente.

#### Requirement: Estado de Hospitalización
Portal muestra indicador visible si la mascota está en estado "Internado" con jaula y motivo.

#### Requirement: Menú de Navegación del Portal
- Mis Mascotas (Dashboard): activo.
- Reservar Cita: deshabilitado/placeholder (próximamente).
- Tienda: deshabilitado/placeholder (próximamente).

#### Requirement: Modo Día y Noche
Botón de alternancia entre tema claro y oscuro, con preferencia guardada en localStorage.

---

## 7. Calidad y Pruebas

### 7.1 quality-assurance-testing

**Origen:** openspec/specs/quality-assurance-testing/spec.md

#### Requirement: Validación de Casos Clínicos en Pruebas Unitarias
Las pruebas SHALL cubrir:
- Solapamiento de citas: debe lanzar excepción de solapamiento.
- Jaula única: validador rechaza jaula ya ocupada.
- Inyección de auditoría: propiedades de sombra (CreatedBy, CreatedAt) se auto-rellenan.

---

### 7.2 integration-testing

**Origen:** openspec/specs/integration-testing/spec.md

#### Requirement: Pruebas de Integración y Seguridad del API
Pipeline completo que valida persistencia física, seguridad de accesos y ciclo de vida clínico.

- Scenario (Cascada de desactivación): GIVEN Administrador elimina Veterinario activo THEN sistema desactiva también su cuenta de Identity automáticamente.

---

### 7.3 testing-expansion

**Origen:** openspec/specs/testing-expansion/spec.md

#### Requirement: Expansión de Casos de Prueba
Las pruebas unitarias también deben cubrir:
- `GetClinicalHistoryQuery`: retorna solo atenciones de la mascota indicada.
- Creación de mascota con propietario inactivo: capa de aplicación debe rechazarlo.
- `CreateOwnerCommand` con datos incompletos: FluentValidation lanza errores de campos requeridos.

---

*Fin del contexto consolidado — PetClinic Management System*
