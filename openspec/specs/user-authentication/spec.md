# user-authentication Specification

## Purpose
TBD - created by archiving change security-auth. Update Purpose after archive.
## Requirements
### Requirement: Autenticación Obligatoria
El sistema SHALL exigir autenticación mediante credenciales para permitir el acceso a cualquier funcionalidad, denegando el acceso a usuarios anónimos.

#### Scenario: Intento de acceso no autenticado a la API
- **WHEN** un cliente no autenticado realiza una petición HTTP a una ruta protegida
- **THEN** la API debe responder con un código de estado HTTP 401 Unauthorized

#### Scenario: Redirección al login en el frontend
- **WHEN** un usuario no autenticado intenta navegar a una página protegida de la aplicación
- **THEN** el frontend de la SPA debe redirigir automáticamente al usuario a la vista de `/login`

### Requirement: Validación de Credenciales (Login)
El sistema SHALL permitir a los usuarios iniciar sesión mediante nombre de usuario o correo electrónico y contraseña, emitiendo un token JWT firmado de forma segura ante el éxito de la validación.

#### Scenario: Login con credenciales válidas
- **WHEN** el usuario ingresa su usuario o correo y contraseña correctos en el formulario de login
- **THEN** el sistema debe emitir un token JWT que contenga el identificador del usuario, su nombre y su lista de roles asignados

#### Scenario: Login con credenciales incorrectas
- **WHEN** el usuario ingresa credenciales inválidas
- **THEN** el sistema debe denegar el acceso, no emitir ningún token y mostrar una alerta indicando que las credenciales son incorrectas

### Requirement: Cierre de Sesión (Logout)
El sistema SHALL permitir el cierre de sesión destruyendo el estado de autenticación en el cliente y redirigiendo al inicio de sesión.

#### Scenario: Cierre de sesión exitoso
- **WHEN** el usuario hace clic en el botón de cerrar sesión en el menú superior
- **THEN** el frontend debe eliminar el token JWT de su memoria/almacenamiento local y redirigir inmediatamente a la pantalla de `/login`

