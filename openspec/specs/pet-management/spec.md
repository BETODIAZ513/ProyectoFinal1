# pet-management Specification

## Purpose
TBD - created by archiving change pets-patients. Update Purpose after archive.
## Requirements
### Requirement: CRUD de Mascotas
El Administrador y Recepcionistas SHALL poder registrar, consultar, editar y desactivar perfiles de mascotas en el sistema.

#### Scenario: Registro exitoso de Mascota vinculada a Propietario
- **WHEN** el Recepcionista crea un perfil de mascota ingresando nombre "Toby", especie "Canino", raza "Golden Retriever", fecha de nacimiento y asociando el Propietario con ID 1
- **THEN** el sistema debe registrar el perfil de mascota en estado activo

### Requirement: Desactivación Lógica de Mascotas
Las mascotas dadas de baja en el sistema no SHALL ser eliminadas físicamente de la base de datos, sino marcadas como inactivas mediante `Activo = false`.

#### Scenario: Dar de baja a una mascota
- **WHEN** el Administrador da de baja a una mascota
- **THEN** el campo `Activo` debe establecerse en `false` para preservar sus historiales previos de consultas

### Requirement: Búsqueda y Paginación de Pacientes
El listado general de mascotas SHALL soportar filtros de búsqueda por nombre de mascota, especie o por el nombre de su propietario, devolviendo resultados paginados.

#### Scenario: Filtrar mascotas por nombre de propietario
- **WHEN** el Recepcionista busca mascotas asociadas al propietario "Pérez"
- **THEN** el sistema debe retornar los perfiles de mascotas cuyos propietarios tengan el apellido "Pérez"

