# Arquitectura del Sistema - PetClinic Management System

Este documento describe la arquitectura global del sistema PetClinic Management System. Es un documento vivo que se actualiza al final de cada Sprint (archive) para documentar el diseño total de todo el proyecto.

---

## 1. Diseño Arquitectónico Global

El sistema está estructurado bajo el patrón de **Arquitectura Limpia (Clean Architecture)** en el backend, desacoplado completamente de la capa cliente mediante un desarrollo de **Single Page Application (SPA)** en el frontend.

```mermaid
graph TD
    %% Frontend Layer
    subgraph Capa Cliente (SPA)
        Web[PetClinic.Web - React + TS]
    end

    %% Backend Layers
    subgraph Capa de Presentación Backend
        Api[PetClinic.Api - Web API]
    end

    subgraph Capa de Infraestructura
        Infra[PetClinic.Infrastructure - EF Core + SQL Server]
    end

    subgraph Capa de Aplicación
        App[PetClinic.Application - CQRS / MediatR]
    end

    subgraph Capa de Dominio (Núcleo)
        Dom[PetClinic.Domain - Entidades y Enums]
    end

    %% Dependencies
    Web -- Peticiones HTTP / JSON --> Api
    Api --> Infra
    Api --> App
    Infra --> App
    Infra --> Dom
    App --> Dom

    classDef core fill:#d4edda,stroke:#28a745,stroke-width:2px;
    classDef application fill:#cce5ff,stroke:#007bff,stroke-width:2px;
    classDef infra fill:#fff3cd,stroke:#ffc107,stroke-width:2px;
    classDef presentation fill:#f8d7da,stroke:#dc3545,stroke-width:2px;
    classDef client fill:#e2e3e5,stroke:#383d41,stroke-width:2px;

    class Dom core;
    class App application;
    class Infra infra;
    class Api presentation;
    class Web client;
```

---

## 2. Responsabilidad de las Capas

### 2.1 `PetClinic.Domain` (Capa de Dominio)
* **Responsabilidad**: Es el núcleo de la aplicación. Contiene las entidades del dominio de negocio, enums, value objects, excepciones de dominio y reglas de negocio puras.
* **Dependencias**: Cero dependencias externas o de otras capas. No depende de base de datos ni de frameworks de terceros (excepto librerías básicas del lenguaje).

### 2.2 `PetClinic.Application` (Capa de Aplicación)
* **Responsabilidad**: Define los casos de uso del sistema. Implementa el patrón CQRS (Command Query Responsibility Segregation) usando **MediatR** y se encarga de las validaciones de entrada mediante **FluentValidation**. Contiene las interfaces que implementa la infraestructura (como repositorios e interfaces de servicios).
* **Dependencias**: Depende únicamente de `PetClinic.Domain`.

### 2.3 `PetClinic.Infrastructure` (Capa de Infraestructura)
* **Responsabilidad**: Contiene los detalles tecnológicos del sistema. Implementa la persistencia de datos con **Entity Framework Core 10** mapeado a **SQL Server**, repositorios concretos, migraciones de base de datos y la autenticación mediante **ASP.NET Core Identity**.
* **Dependencias**: Depende de `PetClinic.Application` (para implementar sus contratos) y `PetClinic.Domain`.

### 2.4 `PetClinic.Api` (Capa de Presentación Backend)
* **Responsabilidad**: Punto de entrada del backend. Contiene los controladores REST (HTTP Controllers), configuración de inyección de dependencias global, políticas de seguridad y CORS, y la documentación de la API (Swagger/OpenAPI).
* **Dependencias**: Depende de `PetClinic.Infrastructure` y `PetClinic.Application`.

### 2.5 `PetClinic.Web` (Capa Cliente SPA)
* **Responsabilidad**: Aplicación web de página única (SPA) cliente construida con **React, TypeScript y Vite**. Consume la API expuesta por el backend de manera asíncrona mediante peticiones HTTP.
* **Dependencias**: Desacoplada físicamente del servidor backend.

---

## 3. Flujo de Control de una Petición

Cuando se ejecuta una acción en el sistema (por ejemplo, registrar una Mascota):

1. **Cliente (`PetClinic.Web`)**: Realiza un `POST /api/mascotas` enviando datos en formato JSON.
2. **Controlador (`PetClinic.Api`)**: Recibe la petición, mapea el JSON a un objeto Command y lo envía al mediador (`IMediator.Send()`).
3. **Manejador (`PetClinic.Application`)**: MediatR despacha el Command a su correspondiente Handler. El Handler valida los datos (usando FluentValidation), recupera entidades necesarias mediante contratos de repositorio (`IPetClinicDbContext` o `IRepository`), y delega la ejecución de lógica de negocio al Dominio.
4. **Dominio (`PetClinic.Domain`)**: Las entidades ejecutan sus métodos de negocio (ej. transicionar estado) y garantizan las invariantes de negocio.
5. **Persistencia (`PetClinic.Infrastructure`)**: El manejador de la aplicación llama a `SaveChanges()` en el DbContext. La infraestructura persiste los cambios en la base de datos SQL Server y aplica Shadow Properties para auditoría (CreatedBy, CreatedAt, UpdatedAt).
6. **Retorno**: El manejador devuelve un DTO de respuesta y el controlador lo retorna como HTTP 200/201 al cliente React.

---

## 4. Estado de los Sprints y Evolución Arquitectónica

* **Sprint 1: Inicialización Arquitectónica y Esqueleto (Completado)**
  * Estructuración de solución base y 5 proyectos de backend/pruebas.
  * Inicialización de la SPA React con Vite y dependencias NPM.
  * Habilitación inicial de CORS en `PetClinic.Api` permitiendo peticiones desde `http://localhost:5173`.

* **Sprint 2: Seguridad, Autenticación, RBAC y Auditoría (Completado)**
  * Integración de **ASP.NET Core Identity** con el contexto de datos `PetClinicDbContext` en `PetClinic.Infrastructure`.
  * Implementación del interceptor automático de base de datos para inyectar propiedades de sombra (`CreatedBy`, `CreatedAt`, `UpdatedAt`) en todas las entidades del dominio de negocio (excluyendo `TareasPredefinidas` y `RegistroPeso`).
  * Desarrollo del servicio y controlador de autenticación JWT en backend (`/api/auth/login` y `/api/auth/me`).
  * Integración en frontend (`PetClinic.Web`) del `AuthContext`, guardianes de rutas React Router (`ProtectedRoute`), y el menú superior adaptativo `RibbonMenu` condicional según roles de sesión.
  * Diseño e implementación de la pantalla de inicio de sesión (`Login.tsx`) con estética "Clinical Precision" y selector rápido de cuentas de desarrollo.

* **Sprint 3: Gestión de Personal y Clientes (Completado)**
  * Definición de las entidades `Propietario` y `Veterinario` en `PetClinic.Domain` y sus mapeos en el DbContext de `PetClinic.Infrastructure`.
  * Implementación de los casos de uso CQRS con MediatR y FluentValidation para el CRUD completo, incluyendo bajas lógicas de perfiles y paginación en el servidor con filtros de búsqueda.
  * Automatización de la creación de usuarios de acceso en ASP.NET Core Identity con asignación de roles simultáneamente al registrar un perfil de Veterinario.
  * Exposición de endpoints seguros `/api/propietarios` y `/api/veterinarios` en `PetClinic.Api` protegidos por rol.
  * Creación de interfaces web en React para la gestión de propietarios (tabla interactiva con paginación, filtros de búsqueda, modal de creación y edición) y veterinarios (diseño por tarjetas y registro).

* **Sprint 4: Pacientes y Mascotas (Completado)**
  * Definición de las entidades `Mascota` (relacionada con Propietario) y `RegistroPeso` (relacionada con Mascota) en `PetClinic.Domain` y sus mapeos ORM en `PetClinic.Infrastructure`.
  * Configuración de la exclusión del historial de pesaje de la inyección de shadow properties de auditoría pasiva en `PetClinicDbContext` cumpliendo con la regla de seguridad `REQ-SEG-03`.
  * Implementación de los casos de uso (Commands/Queries con MediatR) para el CRUD de Mascotas y el registro histórico del peso, validados con FluentValidation (validando peso > 0 kg).
  * Exposición de endpoints REST correspondientes en `/api/mascotas` y `/api/mascotas/{id}/pesos` en `PetClinic.Api`.
  * Desarrollo en el cliente React del visor de listado y de la Ficha Clínica Detallada interactiva con el registro histórico de pesos.

* **Sprint 5: Citas y Atención Clínica (Completado)**
  * Definición de la entidad `Cita` en `PetClinic.Domain` y sus configuraciones de claves foráneas con comportamiento de restricción de eliminación.
  * Implementación de comandos y consultas MediatR para agendamiento, transiciones de estado de cita (Agendada -> En Espera -> Completada/Cancelada) y consultas filtradas por el veterinario logueado.
  * Diseño del validador de superposición de agendas horarias para doctores en bloques de tiempo de 30 minutos.
  * Exposición de endpoints específicos en `/api/citas` dentro de `PetClinic.Api` con autorizaciones selectivas de rol.
  * Creación en el frontend de las pantallas de `Appointments` (calendario y programador del administrador), `Reception` (sala de espera y registro de arribos de recepcionistas), y `Consultations` (agenda clínica del veterinario con registro de pesos y cierre de consulta).

* **Sprint 6: Historia Clínica e Historial de Citas (Completado)**
  * Definición de la entidad `DetalleConsulta` en `PetClinic.Domain` y su correspondiente mapeo relacional en base de datos.
  * Implementación del guardado transaccional en el command `CreateConsultationDetailCommand` para guardar de forma atómica el diagnóstico y tratamiento, completando simultáneamente el estado de la cita.
  * Creación de consultas CQRS para obtener el historial clínico individual (`GetClinicalHistoryQuery`) y el log administrativo global de citas archivadas (`GetAppointmentsHistoryQuery`).
  * Exposición de endpoints en `/api/consultas-detalles` dentro de `PetClinic.Api` con control de accesos restringido.
  * Desarrollo en React de la vista `History` (log de auditoría de citas operadas) y de la pantalla interactiva `ClinicalHistory` (buscador y ficha médica de pacientes consolidando demográficos, pesos e historial clínico de diagnósticos).

* **Sprint 7: Tareas Médicas y Auxiliares Clínicos (Completado)**
  * Definición de las entidades `TareaPredefinida` (catálogo estático) y `TareaClinica` (tareas dinámicas de pacientes) en `PetClinic.Domain` y sus mapeos relacionales.
  * Configuración de la semilla de datos (Seed Data) en el DbContext para registrar automáticamente las plantillas iniciales de cuidado clínico, respetando la exclusión de shadow properties de auditoría (`REQ-SEG-03`).
  * Implementación de comandos CQRS para registrar tareas en estado "Pendiente" y transicionar sus estados en el flujo operativo (`Pendiente` -> `En Progreso` -> `Completada`).
  * Exposición de endpoints específicos en `/api/tareas-clinicas` y `/api/tareas-predefinidas` en `PetClinic.Api`.
  * Desarrollo en React de la vista `MedicalTasks` que renderiza un tablero Kanban interactivo para auxiliares clínicos, con un formulario modal de asignación que pre-rellena títulos e instrucciones clínicas a partir de las plantillas del catálogo.

* **Sprint 8: Hospitalización y Monitoreo Clínico (Completado)**
  * Definición de las entidades `Hospitalizacion` y `MonitoreoClinico` en `PetClinic.Domain` y sus relaciones relacionales en EF Core.
  * Habilitación de la auditoría pasiva en ambas entidades para rastrear el usuario responsable de ingresos, tomas de constantes vitales y altas clínicas (`REQ-SEG-03`).
  * Implementación de comandos CQRS para admisiones con validación de jaula única, altas médicas y registro periódico de signos vitales (temperatura rectal, frecuencias cardíaca y respiratoria, nivel de alerta).
  * Exposición de endpoints bajo `/api/hospitalizaciones` y `/api/hospitalizaciones/{id}/monitoreos` en `PetClinic.Api`.
  * Desarrollo en React de la vista `Hospitalization` para monitorizar jaulas, admitir pacientes, dar de alta y visualizar la telemetría cronológica de la evolución física de las mascotas.

* **Sprint 9: Dockerización del Proyecto (Completado)**
  * Configuración de un `Dockerfile` multi-etapa para compilar y empaquetar la API ASP.NET Core (.NET 10).
  * Configuración de un `Dockerfile` para la SPA en React, compilando assets con Node.js y sirviéndolos mediante un contenedor ligero Nginx.
  * Diseño del archivo de configuración `nginx.conf` de la SPA con redirección interna a `index.html` para soportar React Router dinámico.
  * Creación del archivo de orquestación `docker-compose.yml` en la raíz para enlazar el backend y el frontend exponiendo los puertos locales `5210` y `5173`.

* **Sprint 10: Aseguramiento de Calidad y Cobertura de Pruebas (Completado)**
  * Creación de clases de pruebas de unidad estructuradas bajo MSTest en `tests/PetClinic.Application.UnitTests/`.
  * Simulación y mocking aislado de persistencia en base de datos en memoria (`InMemoryDatabase`) con identificadores aleatorios únicos (`Guid.NewGuid().ToString()`) por método de prueba.
  * Implementación de tests para la prevención de solapamientos horários de citas médicas (intervalos de 30 minutos).
  * Implementación de tests para la restricción de jaulas exclusivas en admisiones de hospitalización.
  * Validación del enrutamiento de consultas clínicas y transiciones de estado de visitas a `"Completada"`.
  * Validación de límites de peso corporal para mascotas y registros de peso (FluentValidation).
  * Validación de inyección automática de propiedades de sombra de auditoría (`CreatedBy`, `CreatedAt`) y exclusiones correspondientes (`TareaPredefinida` y `RegistroPeso`).

* **Sprint 11: Expansión de Cobertura y Validación Funcional de Negocio (Completado)**
  * Creación de `PropietarioTests.cs` validando creación, actualización, borrados lógicos y formatos de teléfono/email.
  * Creación de `FichaClinicaTests.cs` validando inserciones de registros de peso para mascotas activas, exclusiones para mascotas inactivas, validaciones de transiciones de tareas clínicas a estados no permitidos y restricciones de monitoreo para pacientes dados de alta.
  * Creación de `QueriesTests.cs` validando la proyección, ordenamiento y filtración del historial clínico longitudinal de pacientes y el filtrado por estados de hospitalización.
  * Creación de `DomainTests.cs` para validar la lógica pura del dominio, asegurando los constructores por defecto de `Mascota`, `Veterinario` y el estado inicial `"Pendiente"` de `TareaClinica`.
