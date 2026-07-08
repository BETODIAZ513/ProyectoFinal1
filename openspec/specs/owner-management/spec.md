# owner-management Specification

## Purpose
TBD - created by archiving change veterinarians-owners. Update Purpose after archive.
## Requirements
### Requirement: CRUD de Propietarios
El Administrador SHALL poder crear, consultar, editar y desactivar perfiles de propietarios (clientes) del sistema.

#### Scenario: Creación exitosa de Propietario
- **WHEN** el Administrador registra un propietario con nombre "Juan Pérez", teléfono "5551234", correo "juan@gmail.com" y dirección "Av. Lima 123"
- **THEN** el sistema debe registrar al propietario en estado activo y guardar sus datos

### Requirement: Desactivación Lógica de Propietarios
Los propietarios registrados no SHALL ser eliminados físicamente de la base de datos bajo ninguna circunstancia, sino desactivados mediante el campo lógico `Activo = false`.

#### Scenario: Desactivación lógica de un cliente
- **WHEN** el Administrador elimina un propietario del sistema
- **THEN** el motor de datos debe actualizar el campo `Activo` a `false` y mantener la fila en la tabla de base de datos para preservar el historial clínico

### Requirement: Listado Paginado con Búsqueda
La vista de listado de propietarios SHALL presentar los registros paginados del lado del servidor, soportando filtros de búsqueda por nombre, teléfono o correo, y ordenamientos por nombre o fecha de registro.

#### Scenario: Búsqueda de propietario por nombre
- **WHEN** el Administrador escribe "Pérez" en el cuadro de búsqueda del listado
- **THEN** el sistema debe consultar y retornar solo los registros de propietarios cuyo nombre contenga el término "Pérez"

### Requirement: Validaciones de Registro de Propietarios
El sistema SHALL validar que el correo del propietario sea único y de formato válido, el teléfono sea numérico y el nombre tenga al menos 3 caracteres.

#### Scenario: Intento de registro con correo duplicado
- **WHEN** se intenta crear un propietario con un correo electrónico que ya existe en el sistema
- **THEN** el sistema debe abortar el guardado y mostrar una alerta indicando que el correo electrónico ya está registrado

