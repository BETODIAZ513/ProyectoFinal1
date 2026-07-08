## Context

El proyecto requiere implementar la autenticación y el control de accesos por roles (RBAC) basándose en los requerimientos del Módulo 1 de la ERS. Dado que separamos el sistema en backend (Web API) y frontend (SPA React), la autenticación se realizará mediante tokens JWT. Esto permite validar identidades sin estado en la API y habilitar controles condicionales en el cliente React.

## Goals / Non-Goals

**Goals:**
- Configurar `PetClinicDbContext` en `PetClinic.Infrastructure` heredando de `IdentityDbContext`.
- Configurar la clase de usuario `ApplicationUser` extendiendo de `IdentityUser`.
- Implementar la inyección automatizada de Shadow Properties de auditoría (`CreatedBy`, `CreatedAt`, `UpdatedAt`) mediante la interceptación de `SaveChanges` y `SaveChangesAsync` en el DbContext.
- Diseñar la generación y validación de tokens JWT en el backend.
- Exponer el controlador de autenticación (`AuthController`) en la API para manejar Login y perfiles de usuario.
- Crear un mecanismo de autenticación en el cliente React (`PetClinic.Web`) con `AuthContext` y componentes de enrutamiento protegido por rol.
- Implementar la visualización condicional de menús (Ribbon Menu) según el rol del usuario.

**Non-Goals:**
- Implementar formularios de registro de usuarios públicos (las cuentas son creadas únicamente por administradores).
- Crear las vistas de los módulos funcionales (Mascotas, Citas, Veterinarios, etc.).

## Decisions

### 1. Autenticación mediante Tokens JWT
- **Decisión**: Utilizar Tokens JWT (JSON Web Tokens) transmitidos en la cabecera `Authorization: Bearer <token>` para autenticar las llamadas a la API.
- **Razón**: Permite mantener el backend desacoplado de sesiones físicas en el servidor, ideal para el cliente React SPA independiente.
- **Alternativas consideradas**: Cookies de sesión tradicionales. Descartado porque requiere configuraciones de SameSite/CORS más complejas al correr en dominios/puertos separados y dificulta integraciones futuras (ej. aplicaciones móviles).

### 2. Captura de Usuario Actual (`ICurrentUserService`)
- **Decisión**: Definir la interfaz `ICurrentUserService` en `PetClinic.Application` para obtener el ID y nombre del usuario actual. Su implementación estará en `PetClinic.Api` accediendo al `IHttpContextAccessor`.
- **Razón**: El DbContext en `PetClinic.Infrastructure` necesita escribir la huella de auditoría (`CreatedBy`), pero no debe acoplarse directamente a las cabeceras HTTP ni a ASP.NET Core. La interfaz permite obtener estos metadatos manteniendo limpias las capas.

### 3. Registro de Auditoría vía Shadow Properties en EF Core
- **Decisión**: Configurar propiedades de sombra (`CreatedBy`, `CreatedAt`, `UpdatedAt`) en todas las entidades de dominio (excepto `TareasPredefinidas` y `RegistroPeso`) interceptando `SaveChanges` en el DbContext de infraestructura.
- **Razón**: Al ser propiedades de sombra, no ensucian el modelo de dominio puro con campos de infraestructura de persistencia, pero se guardan automáticamente en la base de datos SQL Server garantizando inmutabilidad y consistencia.

### 4. Control de Rutas y Menú en React (Frontend)
- **Decisión**: Implementar un `AuthContext` en React que exponga el estado de sesión (Token, Usuario, Roles) y un componente contenedor `ProtectedRoute` que valide roles antes de renderizar páginas.
- **Razón**: Previene la navegación visual del lado del cliente a rutas para las cuales el rol del usuario no tiene permisos (aislamiento visual de módulos de acuerdo a REQ-NAV-01).

## Risks / Trade-offs

- **[Riesgo] Exposición del Token JWT en el cliente**: Guardar el JWT en memoria o en `localStorage` tiene riesgos de seguridad (ataques XSS).
  - *Mitigación*: Se configurará una expiración corta para el token JWT (ej. 1 hora) y se utilizarán cabeceras de seguridad adecuadas en la API.
- **[Riesgo] Pérdida de auditoría si se evitan repositorios**: Si se realizan inserciones directas vía comandos SQL crudos, no se disparará la interceptación de `SaveChanges`.
  - *Mitigación*: Toda la persistencia de datos del dominio se canalizará de forma obligatoria a través de Entity Framework Core.
