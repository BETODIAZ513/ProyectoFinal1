## Why

El sistema requiere administrar el personal clínico (Veterinarios) y sus clientes (Propietarios) para posibilitar el posterior agendamiento de citas y asignación de tareas clínicas descritas en los Módulos 3 y 8 de la ERS.

## What Changes

- **Backend (`PetClinic.Domain`, `PetClinic.Application`, `PetClinic.Infrastructure`, `PetClinic.Api`)**:
  - Definición de las entidades `Veterinario` y `Propietario` con sus respectivas propiedades y relaciones de dominio.
  - Implementación de casos de uso (Commands/Queries con MediatR) para el CRUD de Veterinarios, incluyendo la creación automática de su correspondiente `ApplicationUser` e `IdentityRole` "Veterinario".
  - Implementación de casos de uso para el CRUD de Propietarios, incluyendo paginación, filtros de búsqueda y desactivación lógica (Activo = false).
  - Configuración del mapeo ORM en `PetClinicDbContext` para las tablas `Veterinarios` y `Propietarios`.
  - Exposición de endpoints REST correspondientes (`api/veterinarios` y `api/propietarios`) protegidos por rol (Administrador).
- **Frontend (`PetClinic.Web`)**:
  - Creación de vistas de mantenimiento (Listado, Búsqueda, Creación, Edición y Detalle) para Veterinarios y Propietarios siguiendo el diseño "Clinical Precision".
  - Conexión del frontend con los endpoints del backend utilizando cabeceras de autorización JWT.

## Capabilities

### New Capabilities
- `veterinarian-management`: CRUD de perfiles de Veterinarios con creación simultánea de cuenta de acceso y roles en Identity.
- `owner-management`: CRUD de Propietarios con desactivación lógica, búsqueda paginada y vista detallada del perfil de cliente.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce las dos primeras entidades de negocio con persistencia real en la base de datos SQL Server / InMemory. Afecta los controladores y servicios de la API, y agrega nuevas pantallas de administración en el menú superior Ribbon del Administrador.
