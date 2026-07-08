## ADDED Requirements

### Requirement: Captura Automática de Auditoría
El contexto de base de datos SHALL interceptar el guardado de cualquier entidad e inyectar de forma automática los campos de auditoría `CreatedBy`, `CreatedAt` (UTC) en inserciones, y `UpdatedAt` (UTC) en actualizaciones.

#### Scenario: Auditoría al insertar una nueva entidad
- **WHEN** el sistema inserta una nueva entidad (ej. un Propietario) y llama a `SaveChanges`
- **THEN** se deben rellenar de forma automática las propiedades de sombra `CreatedBy` con el identificador del usuario actual y `CreatedAt` con la fecha y hora UTC actuales

#### Scenario: Auditoría al actualizar una entidad existente
- **WHEN** el sistema modifica una entidad existente y ejecuta `SaveChanges`
- **THEN** se debe actualizar de forma automática la propiedad de sombra `UpdatedAt` con la fecha y hora UTC actuales, manteniendo intactos `CreatedBy` y `CreatedAt`

### Requirement: Inmutabilidad de los Datos de Creación
Las propiedades de sombra `CreatedBy` y `CreatedAt` SHALL ser inmutables y no cambiar en ningún proceso de actualización de la entidad.

#### Scenario: Intento de alteración de campos de creación en actualización
- **WHEN** se modifica una entidad y se envían los cambios a la base de datos
- **THEN** los valores de `CreatedBy` y `CreatedAt` de la base de datos deben permanecer idénticos a los establecidos durante la creación original de la entidad
