## Why

El sistema PetClinic Management System requiere controles de seguridad estrictos para proteger las rutas, restringir el acceso según el rol del usuario autenticado (Administrador, Veterinario, Auxiliar Clínico, Recepcionista) y mantener una trazabilidad transparente de las modificaciones realizadas en la base de datos, tal como lo define el Módulo 1 de la ERS.

## What Changes

- **Backend (`PetClinic.Infrastructure` & `PetClinic.Api`)**:
  - Configuración de ASP.NET Core Identity utilizando el contexto de persistencia.
  - Creación del servicio de generación de Tokens JWT para autenticación sin estado en la API.
  - Implementación de un interceptor de EF Core para inyectar automáticamente propiedades de auditoría (Shadow Properties: CreatedBy, CreatedAt, UpdatedAt) en `SaveChanges()`.
  - Creación del controlador de autenticación (`AuthController`) expuesto en `PetClinic.Api` con endpoints para Login y obtención de datos del usuario actual.
  - Configuración de políticas de autorización basadas en roles en los controladores.
- **Frontend (`PetClinic.Web`)**:
  - Creación de componentes de diseño para el formulario de Login y control de sesión.
  - Implementación de servicios de consumo de API de autenticación y persistencia del Token JWT en el cliente.
  - Configuración del enrutamiento dinámico protegido, impidiendo accesos no autorizados.
  - Implementación del menú superior Ribbon condicional basado en roles (REQ-NAV-01).

## Capabilities

### New Capabilities
- `user-authentication`: Control de acceso obligatorio mediante Login, emisión de tokens JWT, cierre de sesión e invalidación de credenciales.
- `role-based-access-control`: Restricción estricta de rutas y visualización de menús condicionales en el frontend y backend según los roles (Administrador, Veterinario, Auxiliar Clínico, Recepcionista).
- `transactional-auditing`: Registro automático invisible (Shadow Properties) de auditoría en la base de datos para todas las inserciones y actualizaciones.

### Modified Capabilities
<!-- None -->

## Impact

Este cambio introduce la base de seguridad para todos los controladores y vistas del sistema. Requiere modificar la clase del contexto de datos para heredar de `IdentityDbContext`, y afecta el flujo de peticiones http agregando middleware de autenticación y autorización.
